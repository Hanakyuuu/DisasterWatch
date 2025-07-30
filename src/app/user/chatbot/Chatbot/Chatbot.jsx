import React, { useState, useEffect, useRef } from 'react';
import { 
  query, collection, where, getDocs, addDoc,
  serverTimestamp, orderBy, doc, setDoc, limit
} from 'firebase/firestore';
import { db, extractKeywords } from '../../services/firebase';
import { generateQnAPairs } from '../../services/qaApi';
import { getDisasterAnswer } from '../../services/directAnswer';
import { useAuth } from '../../contexts/AuthContext';
import ChatSelector from './ChatSelector'; // You'll need to create this component
import './Chatbot.css';

const Chatbot = () => {
  const { currentUser } = useAuth();
  const [activeChat, setActiveChat] = useState(null);
  const [chats, setChats] = useState([]);
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

  // Initialize or fetch user's chats
  useEffect(() => {
    const initializeChats = async () => {
      if (!currentUser) return;

      try {
        // Check if user has any existing chats
        const chatsQuery = query(
          collection(db, `users/${currentUser.uid}/chats`),
          orderBy("createdAt", "desc"),
          limit(1)
        );
        const snapshot = await getDocs(chatsQuery);

        if (snapshot.empty) {
          // Create first chat for new user
          const newChatRef = await addDoc(
            collection(db, `users/${currentUser.uid}/chats`),
            {
              title: "Main Chat",
              createdAt: serverTimestamp()
            }
          );
          setActiveChat(newChatRef.id);
        } else {
          // Use most recent chat
          setActiveChat(snapshot.docs[0].id);
        }
      } catch (error) {
        console.error("Error initializing chats:", error);
      }
    };

    initializeChats();
  }, [currentUser]);

  // Load all user's chats
  useEffect(() => {
    const fetchChats = async () => {
      if (!currentUser) return;

      try {
        const q = query(
          collection(db, `users/${currentUser.uid}/chats`),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        setChats(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    fetchChats();
  }, [currentUser]);

  // Load messages for active chat
  useEffect(() => {
    const loadMessages = async () => {
      if (!currentUser || !activeChat) return;

      try {
        const q = query(
          collection(db, `users/${currentUser.uid}/chats/${activeChat}/messages`),
          orderBy("timestamp", "asc")
        );
        const snapshot = await getDocs(q);
        
        const loadedMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        }));

        setMessages(prev => [
          prev[0], // Keep welcome message
          ...loadedMessages
        ]);
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    };

    loadMessages();
  }, [currentUser, activeChat]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const createNewChat = async () => {
    if (!currentUser) return;

    try {
      const newChatRef = await addDoc(
        collection(db, `users/${currentUser.uid}/chats`),
        {
          title: `Chat ${chats.length + 1}`,
          createdAt: serverTimestamp()
        }
      );
      setActiveChat(newChatRef.id);
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  const saveMessage = async (message) => {
    if (!currentUser || !activeChat) return;

    try {
      await addDoc(
        collection(db, `users/${currentUser.uid}/chats/${activeChat}/messages`),
        {
          ...message,
          timestamp: serverTimestamp()
        }
      );
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  // Your existing search functions remain the same
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || !currentUser || !activeChat) return;

    setIsLoading(true);
    const userMessage = { 
      text: question, 
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    await saveMessage(userMessage);
    setInput('');

    try {
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
      await saveMessage(botMessage);

      // Save to knowledge base if not from firestore
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

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-container">
      <ChatSelector 
        currentUser={currentUser}
  currentChatId={activeChat}
  onSelectChat={(chatId) => setActiveChat(chatId)}
      />
      
      <div className="chat-main">
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
    </div>
  );
};

export default Chatbot;