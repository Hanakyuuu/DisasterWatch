import { db } from "@/services/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { extractKeywords } from "@/services/firebase";

export const searchFirestore = async (question: string) => {
  try {
    const keywords = extractKeywords(question);
    
    const exactQuery = query(
      collection(db, "knowledge_base"),
      where("question", "==", question.toLowerCase())
    );
    
    const keywordsQuery = query(
      collection(db, "knowledge_base"),
      where("keywords", "array-contains-any", keywords)
    );
    
    const partialQuery = query(
      collection(db, "knowledge_base"),
      where("question", ">=", question.toLowerCase()),
      where("question", "<=", question.toLowerCase() + '\uf8ff')
    );

    const [exactSnap, keywordsSnap, partialSnap] = await Promise.all([
      getDocs(exactQuery),
      getDocs(keywordsQuery),
      getDocs(partialQuery)
    ]);

    const results = [
      ...exactSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, score: 100 })),
      ...keywordsSnap.docs.map(doc => {
        const data = doc.data();
        const matchedKeywords = (data.keywords || []).filter((k: string) => keywords.includes(k)).length;
        return { ...data, id: doc.id, score: 50 + (matchedKeywords * 10) };
      }),
      ...partialSnap.docs.map(doc => ({ ...doc.data(), id: doc.id, score: 30 }))
    ];

    return results
      .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
      .sort((a, b) => b.score - a.score);
  } catch (err) {
    return [];
  }
};

export const saveToKnowledgeBase = async (
  question: string,
  answer: string,
  source: string
) => {
  try {
    await addDoc(collection(db, "knowledge_base"), {
      question,
      answer,
      keywords: extractKeywords(question + ' ' + answer),
      createdAt: serverTimestamp(),
      source
    });
  } catch (error) { 
    console.error("Error saving to knowledge base:", error);
  }
};