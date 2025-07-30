const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// Promote user to admin
const promoteUser = async (userId) => {
  const functions = getFunctions();
  const promoteToAdmin = httpsCallable(functions, 'promoteToAdmin');
  
  try {
    const result = await promoteToAdmin({ userId });
    console.log(result.data.message);
  } catch (error) {
    console.error("Promotion failed:", error.message);
  }
};

// Verify admin status
const checkAdminStatus = async () => {
  const functions = getFunctions();
  const verifyAdmin = httpsCallable(functions, 'verifyAdmin');
  
  const result = await verifyAdmin();
  return result.data.isAdmin;
};
/**
 * Cloud Function to promote user to admin with full security checks
 */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.promoteToAdmin = functions.https.onCall(async (data, context) => {
  // Authentication check
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Authentication required");
  }

  // Verify admin status through both token and custom claims
  let isAdmin = false;
  try {
    const user = await admin.auth().getUser(context.auth.uid);
    isAdmin = context.auth.token.admin === true || user.customClaims?.admin === true;
  } catch (error) {
    functions.logger.error("Admin verification failed:", error);
    throw new functions.https.HttpsError("permission-denied", "Admin verification failed");
  }

  if (!isAdmin) {
    throw new functions.https.HttpsError("permission-denied", "Only admins can promote users");
  }

  // Input validation
  if (!data.userId) {
    throw new functions.https.HttpsError("invalid-argument", "User ID is required");
  }

  try {
    const userRecord = await admin.auth().getUser(data.userId);
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    // Set custom claims
    await admin.auth().setCustomUserClaims(data.userId, {
      admin: true,
      promotedBy: context.auth.uid,
      promotedAt: new Date().toISOString()
    });

    // Update Firestore documents
    await admin.firestore().runTransaction(async (transaction) => {
      const userRef = admin.firestore().doc(`users/${data.userId}`);
      const adminRef = admin.firestore().doc(`admins/${data.userId}`);

      transaction.set(adminRef, {
        uid: data.userId,
        email: userRecord.email || "",
        name: userRecord.displayName || "",
        promotedBy: context.auth.token.email || context.auth.uid,
        promotedAt: timestamp,
        status: "active"
      }, { merge: true });

      transaction.update(userRef, {
        role: "admin",
        lastUpdated: timestamp
      });
    });

    return { success: true, message: "User promoted to admin successfully" };
  } catch (error) {
    functions.logger.error("Promotion failed:", error);
    throw new functions.https.HttpsError("internal", "Failed to promote user");
  }
});

exports.getAdminData = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Authentication required");
  }

  try {
    // Verify admin status
    const user = await admin.auth().getUser(context.auth.uid);
    if (!user.customClaims?.admin && !context.auth.token.admin) {
      throw new functions.https.HttpsError("permission-denied", "Admin access required");
    }

    // Get admin data with proper error handling
    const snapshot = await admin.firestore().collection("admins")
      .where("status", "==", "active")
      .get();

    return {
      admins: snapshot.docs.map(doc => doc.data())
    };
  } catch (error) {
    functions.logger.error("Failed to fetch admin data:", error);
    throw new functions.https.HttpsError("internal", "Failed to retrieve admin data");
  }
});;

/**
 * Cloud Function to verify admin status
 */
exports.verifyAdmin = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    return { isAdmin: false };
  }

  try {
    const userRecord = await admin.auth().getUser(context.auth.uid);
    return {
      isAdmin: userRecord.customClaims?.admin === true,
      uid: context.auth.uid
    };
  } catch (error) {
    functions.logger.error("Admin verification failed:", error);
    return { isAdmin: false };
  }
});

/**
 * Helper function to check if email exists in system
 */
async function checkEmailExists(email) {
  const [usersSnapshot, adminsSnapshot] = await Promise.all([
    admin.firestore().collection("users")
      .where("email", "==", email)
      .limit(1)
      .get(),
    admin.firestore().collection("admins")
      .where("email", "==", email)
      .limit(1)
      .get()
  ]);
  
  return !usersSnapshot.empty || !adminsSnapshot.empty;
}

exports.setAdminClaims = functions.https.onCall(async (data, context) => {
  // Verify the request is coming from your app
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'The function must be called while authenticated.'
    );
  }

  const uid = data.uid;
  if (!uid) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'UID is required'
    );
  }

  try {
    // Set custom user claims
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    return { success: true };
  } catch (error) {
    console.error('Error setting claims:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to set admin claims'
    );
  }
});