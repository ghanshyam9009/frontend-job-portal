import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import CandidateNavbar from "../../Components/Candidate/CandidateNavbar";
import styles from "./UserDashboard.module.css";

const Messages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState("");

  const [conversations, setConversations] = useState([
    {
      id: 1,
      company: "TechCorp",
      jobTitle: "Senior Frontend Developer",
      lastMessage: "Thank you for your interest. We'd like to schedule an interview.",
      timestamp: "2 hours ago",
      unread: true,
      messages: [
        {
          id: 1,
          sender: "TechCorp",
          message: "Hello! We received your application for the Senior Frontend Developer position.",
          timestamp: "2024-01-15 10:00 AM",
          isEmployer: true
        },
        {
          id: 2,
          sender: "You",
          message: "Thank you for considering my application. I'm very interested in this opportunity.",
          timestamp: "2024-01-15 2:00 PM",
          isEmployer: false
        },
        {
          id: 3,
          sender: "TechCorp",
          message: "Thank you for your interest. We'd like to schedule an interview.",
          timestamp: "2024-01-15 4:00 PM",
          isEmployer: true
        }
      ]
    },
    {
      id: 2,
      company: "DataFlow Inc",
      jobTitle: "Data Scientist",
      lastMessage: "We'll review your application and get back to you soon.",
      timestamp: "1 day ago",
      unread: false,
      messages: [
        {
          id: 1,
          sender: "DataFlow Inc",
          message: "Hi! We've received your application for the Data Scientist role.",
          timestamp: "2024-01-14 11:00 AM",
          isEmployer: true
        },
        {
          id: 2,
          sender: "DataFlow Inc",
          message: "We'll review your application and get back to you soon.",
          timestamp: "2024-01-14 3:00 PM",
          isEmployer: true
        }
      ]
    },
    {
      id: 3,
      company: "DesignStudio",
      jobTitle: "UX Designer",
      lastMessage: "Unfortunately, we've decided to move forward with another candidate.",
      timestamp: "3 days ago",
      unread: false,
      messages: [
        {
          id: 1,
          sender: "DesignStudio",
          message: "Thank you for applying to our UX Designer position.",
          timestamp: "2024-01-12 9:00 AM",
          isEmployer: true
        },
        {
          id: 2,
          sender: "DesignStudio",
          message: "Unfortunately, we've decided to move forward with another candidate.",
          timestamp: "2024-01-12 2:00 PM",
          isEmployer: true
        }
      ]
    }
  ]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message = {
      id: Date.now(),
      sender: "You",
      message: newMessage,
      timestamp: new Date().toLocaleString(),
      isEmployer: false
    };

    setConversations(prev => 
      prev.map(conv => 
        conv.id === selectedConversation.id
          ? {
              ...conv,
              messages: [...conv.messages, message],
              lastMessage: newMessage,
              timestamp: "Just now"
            }
          : conv
      )
    );

    setNewMessage("");
  };

  const getSelectedConversationData = () => {
    return conversations.find(conv => conv.id === selectedConversation?.id);
  };

  return (
    <div className={`${styles.dashboardContainer} ${theme === 'dark' ? styles.dark : ''}`}>
      <CandidateNavbar darkMode={theme === 'dark'} toggleDarkMode={toggleTheme} />
      <main className={styles.main}>
        <section className={styles.messagesSection}>
          <div className={styles.messagesHeader}>
            <h2>Messages</h2>
            <p>Communicate with employers about your applications</p>
          </div>
          
          <div className={styles.messagesContainer}>
            <div className={styles.conversationsList}>
              <h3>Conversations</h3>
              {conversations.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>💬</div>
                  <p>No messages yet</p>
                </div>
              ) : (
                <div className={styles.conversations}>
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`${styles.conversationItem} ${selectedConversation?.id === conversation.id ? styles.activeConversation : ''}`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className={styles.conversationHeader}>
                        <div className={styles.companyInfo}>
                          <h4>{conversation.company}</h4>
                          <span className={styles.jobTitle}>{conversation.jobTitle}</span>
                        </div>
                        {conversation.unread && <div className={styles.unreadBadge}></div>}
                      </div>
                      <div className={styles.lastMessage}>
                        <p>{conversation.lastMessage}</p>
                        <span className={styles.timestamp}>{conversation.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.messagesArea}>
              {selectedConversation ? (
                <>
                  <div className={styles.messagesHeader}>
                    <div className={styles.employerInfo}>
                      <h3>{selectedConversation.company}</h3>
                      <span>{selectedConversation.jobTitle}</span>
                    </div>
                  </div>
                  
                  <div className={styles.messagesList}>
                    {getSelectedConversationData()?.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`${styles.message} ${message.isEmployer ? styles.employerMessage : styles.userMessage}`}
                      >
                        <div className={styles.messageContent}>
                          <p>{message.message}</p>
                          <span className={styles.messageTimestamp}>{message.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className={styles.messageInput}>
                    <input
                      type="text"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button 
                      className={styles.sendButton}
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      Send
                    </button>
                  </div>
                </>
              ) : (
                <div className={styles.noConversation}>
                  <div className={styles.noConversationIcon}>💬</div>
                  <h3>Select a conversation</h3>
                  <p>Choose a conversation from the list to start messaging</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Messages;
