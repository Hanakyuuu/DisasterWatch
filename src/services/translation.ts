// src/services/translation.ts
import { addDoc, collection } from "firebase/firestore";
import { db } from "./firebase";

const translations = {
  en: {
    copingTools: "Coping Tools",
    emergencyHelp: "Emergency Help"
  },
  my: {
    copingTools: "ကိရိယာများကိုရင်ဆိုင်ဖြေရှင်း",
    emergencyHelp: "အရေးပေါ်အကူအညီ"
  }
};

export function translate(key: string, lang: string = 'en') {
  return translations[lang]?.[key] || translations.en[key] || key;
}

export async function logTranslation(key: string, lang: string, userId?: string) {
  await addDoc(collection(db, "translations"), {
    key,
    lang,
    userId: userId || 'anonymous',
    timestamp: new Date()
  });
}