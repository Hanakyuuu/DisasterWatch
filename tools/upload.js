const admin = require("firebase-admin");
const XLSX = require("xlsx");

// 📂 Step 1: Accept Excel file as argument
const fileName = process.argv[2];
if (!fileName) {
  console.error("❌ Please provide a filename like: node upload.js volunteers.xlsx");
  process.exit(1);
}

// 🔐 Step 2: Load Firebase credentials
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// 📚 Step 3: Define States and Regions
const states = ["Chin", "Kachin", "Kayah", "Kayin", "Mon", "Rakhine", "Shan"];
const regions = ["Ayeyarwady", "Bago", "Magway", "Mandalay", "Sagaing", "Tanintharyi", "Yangon", "Naypyidaw"];

// 📄 Step 4: Read Excel
const workbook = XLSX.readFile(fileName);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

// 🚀 Step 5: Upload to Firestore
async function uploadData() {
  for (const entry of data) {
    const volunteerData = {
      name: entry.name || "",
      organization: entry.organization || "",
      contact: entry.contact || "",
      location: entry.location || "",
      type: entry.type || "",
    };

    // 🎯 Determine correct field: state or region
    const rawLocation = entry.region || entry.state || entry["state or region"] || "";

    if (states.includes(rawLocation)) {
      volunteerData.state = rawLocation;
    } else if (regions.includes(rawLocation)) {
      volunteerData.region = rawLocation;
    } else {
      volunteerData["unknown-location"] = rawLocation;
    }

    // 📥 Add to Firestore
    await db.collection("volunteers").add(volunteerData);
    console.log(`✅ Uploaded: ${entry.name} (${rawLocation})`);
  }

  console.log("✅ All data uploaded successfully.");
}

uploadData().catch((err) => {
  console.error("❌ Upload failed:", err);
});
