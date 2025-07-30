import React, { useState, useEffect, useRef } from 'react';
import { 
  query, 
  collection, 
  where, 
  getDocs, 
  addDoc, 
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db, extractKeywords } from '../../services/firebase';
import { generateQnAPairs } from '../../services/qaApi';
import { getDisasterAnswer } from '../../services/directAnswer';
import { useAuth } from '../../contexts/AuthContext';
import './Chatbot.css';

const Chatbot = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([
    { 
      text: "Hello! I'm your disaster assistance bot. Ask me anything about earthquakes or natural disasters.", 
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Load user's chat history on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      if (currentUser) {
        const history = await fetchUserChatHistory();
        if (history.length > 0) {
          const historyMessages = history.map(item => ([
            { 
              text: item.question, 
              isUser: true,
              timestamp: item.timestamp?.toDate() || new Date()
            },
            { 
              text: item.answer, 
              isUser: false,
              timestamp: item.timestamp?.toDate() || new Date()
            }
          ])).flat();
          
          setMessages(prev => [
            prev[0], // Keep the initial welcome message
            ...historyMessages
          ]);
        }
      }
    };
    loadChatHistory();
  }, [currentUser]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveChatHistory = async (question, answer, source) => {
    if (!currentUser) return;
    
    try {
      await addDoc(collection(db, "chat_history"), {
        userId: currentUser.uid,
        question,
        answer,
        source,
        keywords: extractKeywords(question + ' ' + answer),
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Error saving chat history:", error);
    }
  };

  const fetchUserChatHistory = async () => {
    if (!currentUser) return [];
    
    try {
      const q = query(
        collection(db, "chat_history"),
        where("userId", "==", currentUser.uid),
        orderBy("timestamp", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error fetching chat history:", error);
      return [];
    }
  };

  // Your existing searchFirestore, calculateAnswerScore, getBestMatch functions remain the same
  // ... [keep all your existing query and matching functions] ...

  const searchFirestore = async (question) => {
      try {
        const keywords = extractKeywords(question);
        console.log("Extracted keywords:", keywords);
  
        // 1. Exact question match
        const exactQuery = query(
          collection(db, "knowledge_base"),
          where("question", "==", question.toLowerCase())
        );
  
        // 2. Individual keyword matches (OR condition)
        const keywordsQuery = query(
          collection(db, "knowledge_base"),
          where("keywords", "array-contains-any", keywords)
        );
  
        // 3. Partial text match
        const partialQuery = query(
          collection(db, "knowledge_base"),
          where("question", ">=", question.toLowerCase()),
          where("question", "<=", question.toLowerCase() + '\uf8ff')
        );
  
        // Execute all queries in parallel
        const [exactSnap, keywordsSnap, partialSnap] = await Promise.all([
          getDocs(exactQuery),
          getDocs(keywordsQuery),
          getDocs(partialQuery)
        ]);
  
        // Scoring system
        const results = [
          ...exactSnap.docs.map(doc => ({ 
            ...doc.data(),
            id: doc.id,
            score: 100 // Highest priority for exact matches
          })),
          ...keywordsSnap.docs.map(doc => {
            const data = doc.data();
            // Calculate relevance score based on keyword matches
            const matchedKeywords = data.keywords.filter(k => 
              keywords.includes(k)
            ).length;
            return {
              ...data,
              id: doc.id,
              score: 50 + (matchedKeywords * 10) // Base 50 + 10 per keyword
            };
          }),
          ...partialSnap.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
            score: 30 // Lowest base score for partial matches
          }))
        ];
  
        // Remove duplicates and sort by score
        const uniqueResults = results
          .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
          .sort((a, b) => b.score - a.score);
  
        console.log("Search results:", uniqueResults);
        return uniqueResults;
  
      } catch (err) {
        console.error("Firestore search error:", err);
        return [];
      }
    };
  
    const calculateAnswerScore = (answer, question) => {
      const questionKeywords = extractKeywords(question);
      const answerKeywords = extractKeywords(answer);
      
      // Count matching keywords
      const keywordMatches = questionKeywords.filter(kw => 
        answerKeywords.includes(kw)
      ).length;
  
      // Check for question type matching
      const questionType = question.split(' ')[0].toLowerCase();
      const typeMatchScore = 
        (questionType === 'can' && answer.includes('can')) ||
        (questionType === 'what' && answer.includes('is')) ||
        (questionType === 'how' && answer.includes('by')) ? 1 : 0;
  
      // Check for verb matching in capability questions
      const verbMatchScore = question.includes(' predict ') && 
        answer.includes('predict') ? 1 : 0;
  
      return keywordMatches + typeMatchScore + verbMatchScore;
    };
  
    const getBestMatch = (results, question) => {
      if (!results.length) return null;
      
      // Exact match check
      const exactMatch = results.find(r => 
        r.question.toLowerCase() === question.toLowerCase()
      );
      if (exactMatch) return exactMatch;
  
      // Get all important keywords from question (excluding stop words)
      const questionKeywords = extractKeywords(question).filter(k => 
        !['what', 'how', 'can', 'do', 'is', 'are'].includes(k.toLowerCase())
      );
  
      // Verify quality of top results
      for (const result of results) {
        // Check if answer contains important question keywords
        const answerContainsKeywords = questionKeywords.some(kw => 
          result.answer.toLowerCase().includes(kw.toLowerCase())
        );
        
        // Check if this is a "can X do Y" question and answer contains relevant verbs
        const isCapabilityQuestion = question.toLowerCase().startsWith('can ') || 
                                   question.toLowerCase().includes(' predict ');
        const hasCapabilityLanguage = isCapabilityQuestion 
          ? result.answer.toLowerCase().includes('can ') || 
            result.answer.toLowerCase().includes('able to') ||
            result.answer.toLowerCase().includes('predict')
          : true;
  
        // Check question type matches answer type
        const questionTypeMatch = 
          (question.toLowerCase().startsWith('what') && result.answer.toLowerCase().startsWith('it is')) ||
          (question.toLowerCase().startsWith('how') && result.answer.toLowerCase().includes('by')) ||
          (question.toLowerCase().startsWith('why') && result.answer.toLowerCase().includes('because')) ||
          (!question.toLowerCase().startsWith('what') && 
           !question.toLowerCase().startsWith('how') && 
           !question.toLowerCase().startsWith('why'));
  
        // Only return if all conditions are met
        if (answerContainsKeywords && hasCapabilityLanguage && questionTypeMatch) {
          return result;
        }
      }
  
      return null; // No good match found
    };
    // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || !currentUser) return;

    setIsLoading(true);
    const userMessage = { 
      text: question, 
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      // Your existing answer generation logic
      let finalAnswer = '';
      let source = '';

      // 1. Try Firestore first
      const dbResults = await searchFirestore(question);
      const bestMatch = getBestMatch(dbResults, question);
      
      if (bestMatch) {
        finalAnswer = bestMatch.answer;
        source = 'firestore';
      } else {
        // 2. Try direct disaster answer
        const disasterAnswer = await getDisasterAnswer(question);
        if (!disasterAnswer.startsWith("I can't answer")) {
          finalAnswer = disasterAnswer;
          source = 'direct_answer';
        } else {
          // 3. Fallback to AI generation
          const qnaPairs = await generateQnAPairs(question);
          const matched = qnaPairs.reduce((best, current) => {
            const currentScore = calculateAnswerScore(current.answer, question);
            const bestScore = best ? calculateAnswerScore(best.answer, question) : 0;
            return currentScore > bestScore ? current : best;
          }, null);

          finalAnswer = matched?.answer || 
            `I couldn't find a specific answer about "${extractKeywords(question).join(' ')}". ` +
            `Would you like me to research this further?`;
          source = 'ai_generated';
        }
      }

      const botMessage = { 
        text: finalAnswer, 
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      
      // Save to both chat history and knowledge base if needed
      await saveChatHistory(question, finalAnswer, source);
      
      if (source !== 'firestore') {
        await addDoc(collection(db, "knowledge_base"), {
          question,
          answer: finalAnswer,
          keywords: extractKeywords(question + ' ' + finalAnswer),
          createdAt: serverTimestamp(),
          source
        });
      }

    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages(prev => [...prev, { 
        text: "Sorry, I'm having trouble responding. Please try again later.", 
        isUser: false,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Your existing formatTime function
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="enhanced-chatbot-container">
      <div className="chatbot-header">
        <h2>Disaster Assistant</h2>
        <div className="status-indicator">
          <span className="status-dot"></span>
          <span>{currentUser ? `Logged in as ${currentUser.email}` : 'Online'}</span>
        </div>
      </div>
      
      <div className="chatbot-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message-container ${msg.isUser ? 'user' : 'bot'}`}>
            <div className={`message ${msg.isUser ? 'user' : 'bot'}`}>
              {!msg.isUser && <div className="bot-avatar">DA</div>}
              <div className="message-content">
                <div className="message-text">
                  {msg.text.split('\n').map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>
                <div className="message-time">{formatTime(msg.timestamp)}</div>
              </div>
              {msg.isUser && <div className="user-avatar">You</div>}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message-container bot">
            <div className="message bot">
              <div className="bot-avatar">DA</div>
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="chatbot-input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={currentUser ? "Ask about earthquakes or disasters..." : "Please log in to chat"}
          disabled={isLoading || !currentUser}
        />
        <button 
          type="submit" 
          disabled={isLoading || !input.trim() || !currentUser}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </form>
    </div>
  );
};

export default Chatbot;