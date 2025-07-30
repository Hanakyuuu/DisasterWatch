'use client';

import { useState, useRef, useEffect, } from "react";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { MoreVertical,Heart } from "lucide-react";
import { generateQnAPairs } from "@/services/qaApi";
import { db, extractKeywords } from '@/services/firebase';
import { getDisasterAnswer } from '@/services/directAnswer';
// Add these to your existing imports
import { useChat } from 'ai/react';
import { useHuggingFace } from '@/lib/huggingface';
import {
  query, collection, where, getDocs, addDoc,
  serverTimestamp, orderBy, limit
} from "firebase/firestore";

interface Message {
    id: string;
    content: string;
    isUser: boolean;
    timestamp: string;
}

export default function Chatbot() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            content: "Hello! I'm your Crisis Companion. I'm here to provide support, information, and help you find the resources you need. How can I assist you today?",
            isUser: false,
            timestamp: "Just now",
        },
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const chatHistoryRef = useRef<HTMLDivElement>(null);
   const [isTherapyMode, setIsTherapyMode] = useState(false); 
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages, isTyping]);  useEffect(() => {
        setMessages([{
            id: "1",
            content: isTherapyMode 
                ? "Hello friend. I'm here to listen and provide emotional support. You can share anything that's on your mind - I'm here without judgment." 
                : "Hello! I'm your Crisis Companion. I'm here to provide support, information, and help you find the resources you need. How can I assist you today?",
            isUser: false,
            timestamp: "Just now",
        }]);
    }, [isTherapyMode]);
 const toggleTherapyMode = () => {
        setIsTherapyMode(!isTherapyMode);
    };

    const searchFirestore = async (question: string) => {
        try {
            const keywords = extractKeywords(question);
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
                    score: 100
                })),
                ...keywordsSnap.docs.map(doc => {
                    const data = doc.data();
                    const matchedKeywords = (data.keywords || []).filter((k: string) => keywords.includes(k)).length;
                    return {
                        ...data,
                        id: doc.id,
                        score: 50 + (matchedKeywords * 10)
                    };
                }),
                ...partialSnap.docs.map(doc => ({
                    ...doc.data(),
                    id: doc.id,
                    score: 30
                }))
            ];
            // Remove duplicates and sort by score
            const uniqueResults = results
                .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
                .sort((a, b) => b.score - a.score);
            return uniqueResults;
        } catch (err) {
            return [];
        }
    };

    const calculateAnswerScore = (answer: string, question: string) => {
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

    const getBestMatch = (results: any[], question: string) => {
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

    const handleSendMessage = async (messageContent: string) => {
    const question = messageContent.trim();
    if (!question) return;

    setIsTyping(true);
    const userMessage: Message = {
        id: Date.now().toString(),
        content: question,
        isUser: true,
        timestamp: formatTime(new Date())
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
        let finalAnswer = '';
        let source = '';
if (isTherapyMode) {
        // Use mental health dataset for responses
        finalAnswer = await getMentalHealthResponse(question, context);
      } else {
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
                    const matched = qnaPairs.reduce((best: any, current: any) => {
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
        }
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: finalAnswer,
                isUser: false,
                timestamp: formatTime(new Date())
            };
            setMessages(prev => [...prev, botMessage]);

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
                id: (Date.now() + 1).toString(),
                content: "Sorry, I'm having trouble responding. Please try again later.",
                isUser: false,
                timestamp: formatTime(new Date())
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
   

    const chatItems = [
        "Previous chat 1",
        "Previous chat 2",
        "Previous chat 3",
        "Previous chat 4",
        "Previous chat 5",
        "Previous chat 1",
        "Previous chat 2",
        "Previous chat 3",
        "Previous chat 4",
        "Previous chat 5",
    ];

    return (
        <div className="w-full max-w-[1200px] mx-auto h-[530px] flex flex-col rounded-xl shadow-md bg-background">
            {/* Chat Header */}
            <ChatHeader 
                title="Crisis Companion" 
              subtitle={isTherapyMode ? "Therapy Mode - I'm here to listen" : "AI Assistant ready to help"} 
    isOnline={true} 
    onTherapyModeToggle={toggleTherapyMode}
                isTherapyMode={isTherapyMode}
   
/>
            <div className="flex flex-1 gap-4 overflow-hidden mt-4 px-4 pb-4">
                <div className="flex flex-col flex-grow bg-white rounded-lg shadow-sm p-4" style={{ maxHeight: "calc(530px - 72px)" }}>
                    <div ref={scrollAreaRef} className="flex-1 overflow-y-auto space-y-4">
                        {messages.map((message) => (
                            <ChatMessage
                                key={message.id}
                                message={message.content}
                                isUser={message.isUser}
                                timestamp={message.timestamp}
                            />
                        ))}
                        {isTyping && (
                            <ChatMessage 
                                message="" 
                                isUser={false} 
                                timestamp="typing..." 
                                isTyping={true} 
                            />
                        )}
                    </div>

                    <ChatInput
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onSendMessage={handleSendMessage}
                        disabled={isTyping}
                          placeholder={isTherapyMode ? "Share what's on your mind..." : "Type your message here..."}
                    />
                </div>
                
                <div
                    ref={chatHistoryRef}
                    className="hidden lg:block flex-shrink-0 w-1/3 bg-muted rounded-lg p-4 overflow-y-auto"
                    style={{ maxHeight: "calc(530px - 72px)" }}
                >
                    <p className="ml-3 mb-2 font-semibold text-blue">History</p>
                    <ul className="space-y-2 text-sm text-gray-700">
                        {chatItems.map((chat, index) => (
                            <li
                                key={index}
                                className="relative flex justify-between items-center bg-muted/50 hover:bg-muted/100 text-gray-700 hover:text-blue px-3 py-2 rounded-md cursor-pointer transition"
                            >
                                <span className="truncate">{chat}</span>
                                <button
                                    onClick={() => setOpenMenuIndex(openMenuIndex === index ? null : index)}
                                    className="ml-2 text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-200"
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </button>
                                {openMenuIndex === index && (
                                    <div className="absolute right-2 top-10 z-10 bg-white border rounded-md shadow-md text-sm w-32">
                                        <button className="w-full text-left px-3 py-2 hover:bg-gray-100">Rename</button>
                                        <button className="w-full text-left px-3 py-2 hover:bg-gray-100 text-red-500">Delete</button>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}