import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, addDoc } from 'firebase/firestore';
import { db, serverTimestamp } from '../../services/firebase';

const ChatSelector = ({ currentUser, currentChatId, onSelectChat }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChats = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      try {
        const q = query(
          collection(db, `users/${currentUser.uid}/chats`),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        
        const loadedChats = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || `Chat ${doc.id}`,
            // Convert Firestore Timestamp to Date
            createdAt: data.createdAt?.toDate?.() || new Date()
          };
        });

        if (loadedChats.length === 0) {
          // Create first chat if none exists
          const newChat = await createNewChat();
          setChats([newChat]);
          onSelectChat(newChat.id);
        } else {
          setChats(loadedChats);
          if (!currentChatId) {
            onSelectChat(loadedChats[0].id);
          }
        }
      } catch (err) {
        console.error("Error fetching chats:", err);
        setError("Failed to load chats");
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [currentUser, currentChatId, onSelectChat]);

  const createNewChat = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const newChat = {
        title: `Chat ${chats.length + 1}`,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(
        collection(db, `users/${currentUser.uid}/chats`),
        newChat
      );
      
      const createdChat = {
        id: docRef.id,
        title: newChat.title,
        createdAt: new Date() // Local fallback while waiting for server timestamp
      };
      
      setChats(prev => [...prev, createdChat]);
      onSelectChat(docRef.id);
      return createdChat;
    } catch (err) {
      console.error("Error creating chat:", err);
      setError("Failed to create new chat");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-chats">Loading chats...</div>;
  if (error) return <div className="error-chats">{error}</div>;

  return (
    <div className="chat-selector">
      <button onClick={createNewChat} className="new-chat-btn">
        + New Chat
      </button>
      <div className="chat-list">
        {chats.map(chat => (
          <div
            key={chat.id}
            className={`chat-item ${chat.id === currentChatId ? 'active' : ''}`}
            onClick={() => onSelectChat(chat.id)}
          >
            {chat.title}
            <span className="chat-date">
              {/* Safely format the date */}
              {chat.createdAt?.toLocaleDateString?.() || 'New chat'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatSelector;