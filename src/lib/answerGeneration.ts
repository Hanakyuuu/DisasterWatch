import { extractKeywords } from "@/services/firebase";
import { generateQnAPairs } from "@/services/qaApi";
import { getDisasterAnswer } from "@/services/directAnswer";

export const calculateAnswerScore = (answer: string, question: string) => {
  const questionKeywords = extractKeywords(question);
  const answerKeywords = extractKeywords(answer);
  
  const keywordMatches = questionKeywords.filter(kw => 
    answerKeywords.includes(kw)
  ).length;

  const questionType = question.split(' ')[0].toLowerCase();
  const typeMatchScore = 
    (questionType === 'can' && answer.includes('can')) ||
    (questionType === 'what' && answer.includes('is')) ||
    (questionType === 'how' && answer.includes('by')) ? 1 : 0;

  const verbMatchScore = question.includes(' predict ') && 
    answer.includes('predict') ? 1 : 0;

  return keywordMatches + typeMatchScore + verbMatchScore;
};

export const getBestMatch = (results: any[], question: string) => {
  if (!results.length) return null;
  
  const exactMatch = results.find(r => 
    r.question.toLowerCase() === question.toLowerCase()
  );
  if (exactMatch) return exactMatch;

  const questionKeywords = extractKeywords(question).filter(k => 
    !['what', 'how', 'can', 'do', 'is', 'are'].includes(k.toLowerCase())
  );

  for (const result of results) {
    const answerContainsKeywords = questionKeywords.some(kw => 
      result.answer.toLowerCase().includes(kw.toLowerCase())
    );
    
    const isCapabilityQuestion = question.toLowerCase().startsWith('can ') || 
                              question.toLowerCase().includes(' predict ');
    const hasCapabilityLanguage = isCapabilityQuestion 
      ? result.answer.toLowerCase().includes('can ') || 
        result.answer.toLowerCase().includes('able to') ||
        result.answer.toLowerCase().includes('predict')
      : true;

    const questionTypeMatch = 
      (question.toLowerCase().startsWith('what') && result.answer.toLowerCase().startsWith('it is')) ||
      (question.toLowerCase().startsWith('how') && result.answer.toLowerCase().includes('by')) ||
      (question.toLowerCase().startsWith('why') && result.answer.toLowerCase().includes('because')) ||
      (!question.toLowerCase().startsWith('what') && 
       !question.toLowerCase().startsWith('how') && 
       !question.toLowerCase().startsWith('why'));

    if (answerContainsKeywords && hasCapabilityLanguage && questionTypeMatch) {
      return result;
    }
  }

  return null;
};

export const generateFinalAnswer = async (question: string) => {
  try {
    // 1. Try Firestore first
    const dbResults = await searchFirestore(question);
    const bestMatch = getBestMatch(dbResults, question);
    
    if (bestMatch) {
      return { answer: bestMatch.answer, source: 'firestore' };
    }

    // 2. Try direct disaster answer
    const disasterAnswer = await getDisasterAnswer(question);
    if (!disasterAnswer.startsWith("I can't answer")) {
      return { answer: disasterAnswer, source: 'direct_answer' };
    }

    // 3. Fallback to AI generation
    const qnaPairs = await generateQnAPairs(question);
    const matched = qnaPairs.reduce((best: any, current: any) => {
      const currentScore = calculateAnswerScore(current.answer, question);
      const bestScore = best ? calculateAnswerScore(best.answer, question) : 0;
      return currentScore > bestScore ? current : best;
    }, null);

    return {
      answer: matched?.answer || 
        `I couldn't find a specific answer about "${extractKeywords(question).join(' ')}". ` +
        `Would you like me to research this further?`,
      source: 'ai_generated'
    };
  } catch (error) {
    console.error("Answer generation error:", error);
    return {
      answer: "Sorry, I'm having trouble generating a response. Please try again later.",
      source: 'error'
    };
  }
};