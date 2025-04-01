'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

export const LiveChat = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId] = useState(() => {
    const id = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    console.log(`LiveChat initialized with session ID: ${id}`);
    return id;
  });
  const [messages, setMessages] = useState<{ text: string; isUser: boolean; timestamp: Date; sender?: string }[]>([
    { text: t('liveChat.greeting'), isUser: false, timestamp: new Date(), sender: 'Support' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isError, setIsError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Track already seen message IDs to prevent duplicates
  const [seenMessageIds, setSeenMessageIds] = useState<Set<string>>(new Set());

  // Update initial greeting when language changes
  useEffect(() => {
    // Only update if we have the default greeting (checking for length avoids dependency on messages)
    const updateInitialGreeting = () => {
      setMessages(prev => {
        // Only update if we have exactly one message that is the greeting
        if (prev.length === 1 && !prev[0].isUser) {
          return [{ text: t('liveChat.greeting'), isUser: false, timestamp: new Date(), sender: 'Support' }];
        }
        return prev;
      });
    };
    
    updateInitialGreeting();
  }, [t]); // Only depend on translation changes, not messages

  // Toggle chat open/closed
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Handle message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Add user message to chat
    const newMessage = { text: inputValue, isUser: true, timestamp: new Date() };
    setMessages([...messages, newMessage]);
    setInputValue('');
    setIsTyping(true);
    setIsError(false);

    try {
      // Send message to our consolidated API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: inputValue,
          sessionId
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      // Show typing indicator briefly to indicate message is being processed
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsTyping(false);
      
      // Note: We don't add an automatic response anymore
      // The real response will come from polling the API
      
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      setIsError(true);
      
      // Add error message
      const errorMessage = { 
        text: t('liveChat.error'), 
        isUser: false, 
        timestamp: new Date(),
        sender: 'Support'
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    }
  };

  // Create a message fingerprint for deduplication
  const getMessageFingerprint = (msg: any) => {
    return `${msg.text}_${msg.timestamp ? new Date(msg.timestamp).getTime() : Date.now()}`;
  };

  // Poll for new messages from admin
  useEffect(() => {
    if (!isOpen) return;

    // Extract the base ticket ID from the session ID
    const shortTicketId = sessionId.split('_').pop()?.replace(/v2$/, '') || '';
    console.log(`LiveChat: Session info - Full ID: ${sessionId}, Short ID: ${shortTicketId}`);
    console.log(`LiveChat: Starting to poll with session ID: ${sessionId}`);

    // Track whether we're successfully receiving messages
    let pollSuccessCount = 0;
    let pollErrorCount = 0;
    let consecutiveEmptyPolls = 0;
    
    // Prioritize ID formats that have previously returned messages
    let successfulIdFormats: string[] = [];
    
    // Initial diagnostics check
    fetch(`/api/chat?checkTelegram=true`)
      .then(response => response.json())
      .then(data => {
        console.log(`LiveChat: Initial Telegram check - ${data.matchingSessions || 0} matching sessions`);
        if (data.matchingSessions > 0) {
          console.log("LiveChat: Found relevant sessions:", Object.keys(data.sessions).join(', '));
        }
      })
      .catch(error => {
        console.error("LiveChat: Error in initial Telegram check:", error);
      });
    
    const pollInterval = setInterval(async () => {
      try {
        // First try to use a previously successful ID format
        let response;
        let data;
        let usedSessionId;
        
        // If we have a successful format, try it first
        if (successfulIdFormats.length > 0) {
          const formatToUse = successfulIdFormats[0]; // Use the most recently successful format
          
          if (formatToUse === 'short') {
            console.log(`LiveChat: Polling with previously successful short ID: ${shortTicketId}`);
            response = await fetch(`/api/chat?sessionId=${shortTicketId}`);
            usedSessionId = shortTicketId;
          } else if (formatToUse === 'full') {
            console.log(`LiveChat: Polling with previously successful full ID: ${sessionId}`);
            response = await fetch(`/api/chat?sessionId=${sessionId}`);
            usedSessionId = sessionId;
          } else if (formatToUse === 'timestamp') {
            const timestamp = Math.floor(Date.now() / 1000);
            const tsSessionId = `session_${timestamp}_${shortTicketId}`;
            console.log(`LiveChat: Polling with timestamp format: ${tsSessionId}`);
            response = await fetch(`/api/chat?sessionId=${tsSessionId}`);
            usedSessionId = tsSessionId;
          }
        } 
        // If no previously successful format or we've had too many consecutive empty polls,
        // cycle through the different formats
        else {
          // After 5 consecutive empty polls, try alternating between formats
          if (consecutiveEmptyPolls >= 5) {
            const pollType = pollSuccessCount % 3; // Cycle through 3 formats
            
            if (pollType === 0) {
              // Try with short ID
              console.log(`LiveChat: Polling with short ticket ID: ${shortTicketId}`);
              response = await fetch(`/api/chat?sessionId=${shortTicketId}`);
              usedSessionId = shortTicketId;
            } else if (pollType === 1) {
              // Try with full session ID
              console.log(`LiveChat: Polling with full session ID: ${sessionId}`);
              response = await fetch(`/api/chat?sessionId=${sessionId}`);
              usedSessionId = sessionId;
            } else {
              // Try with timestamp format
              const timestamp = Math.floor(Date.now() / 1000);
              const tsSessionId = `session_${timestamp}_${shortTicketId}`;
              console.log(`LiveChat: Polling with timestamp format: ${tsSessionId}`);
              response = await fetch(`/api/chat?sessionId=${tsSessionId}`);
              usedSessionId = tsSessionId;
            }
          } else {
            // Default to full session ID first
            console.log(`LiveChat: Polling with default full session ID: ${sessionId}`);
            response = await fetch(`/api/chat?sessionId=${sessionId}`);
            usedSessionId = sessionId;
          }
        }
        
        // If response is not ok, try with short ID as fallback
        if (!response?.ok) {
          console.error(`LiveChat: Error polling with ${usedSessionId}: ${response?.status}`);
          pollErrorCount++;
          
          // Try with short ID as fallback
          console.log(`LiveChat: Trying fallback with short ticket ID: ${shortTicketId}`);
          response = await fetch(`/api/chat?sessionId=${shortTicketId}`);
          usedSessionId = shortTicketId;
          
          if (!response.ok) {
            console.error(`LiveChat: Fallback also failed: ${response.status}`);
            return;
          }
        }
        
        data = await response.json();
        
        // Reset error count on successful response
        pollErrorCount = 0;
        pollSuccessCount++;
        
        // If we received messages, update the successful format
        if (data.messages?.length > 0) {
          console.log(`LiveChat: Found ${data.messages.length} new messages using ${usedSessionId}`);
          
          // Update the successful format list
          let formatType: string;
          if (usedSessionId === shortTicketId) {
            formatType = 'short';
          } else if (usedSessionId === sessionId) {
            formatType = 'full';
          } else {
            formatType = 'timestamp';
          }
          
          // Move this format to the front of the list
          successfulIdFormats = [formatType, ...successfulIdFormats.filter(f => f !== formatType)];
          console.log(`LiveChat: Updated successful ID formats: ${successfulIdFormats.join(', ')}`);
          
          // Reset consecutive empty polls
          consecutiveEmptyPolls = 0;
        } else {
          // Increment consecutive empty polls
          consecutiveEmptyPolls++;
          
          if (consecutiveEmptyPolls % 10 === 0) {
            console.log(`LiveChat: No new messages after ${consecutiveEmptyPolls} consecutive empty polls`);
          }
          return;
        }
        
        // Add any new messages from admin using fingerprinting for deduplication
        setMessages(prevMessages => {
          const newUniqueMessages = data.messages.filter((msg: any) => {
            const fingerprint = getMessageFingerprint(msg);
            
            // Check if we've already seen this message
            if (seenMessageIds.has(fingerprint)) {
              console.log(`LiveChat: Skipping duplicate message: ${msg.text.substring(0, 20)}...`);
              return false;
            }
            
            // Also check against existing messages in case seenMessageIds wasn't updated
            const isDuplicate = prevMessages.some(existing => 
              existing.text === msg.text && 
              !existing.isUser && 
              Math.abs(new Date(existing.timestamp).getTime() - new Date(msg.timestamp).getTime()) < 2000
            );
            
            if (isDuplicate) {
              console.log(`LiveChat: Skipping duplicate by content comparison: ${msg.text.substring(0, 20)}...`);
              return false;
            }
            
            return true;
          });

          if (newUniqueMessages.length === 0) {
            return prevMessages;
          }

          console.log(`LiveChat: Adding ${newUniqueMessages.length} new unique messages to chat`);
          
          // Update seen message IDs
          setSeenMessageIds(prev => {
            const newSet = new Set(prev);
            newUniqueMessages.forEach((msg: any) => {
              newSet.add(getMessageFingerprint(msg));
            });
            return newSet;
          });
          
          // Add messages to chat
          return [
            ...prevMessages,
            ...newUniqueMessages.map((msg: any) => ({
              text: msg.text,
              isUser: false,
              timestamp: new Date(msg.timestamp),
              sender: 'Support Agent'
            }))
          ];
        });
      } catch (error) {
        pollErrorCount++;
        console.error(`LiveChat: Error polling for messages (Error #${pollErrorCount}):`, error);
      }
    }, 3000); // Poll every 3 seconds

    // Clean up interval on unmount or when chat is closed
    return () => {
      console.log(`LiveChat: Stopping polling for session ${sessionId}`);
      clearInterval(pollInterval);
    };
  }, [isOpen, sessionId, seenMessageIds]); // Include seenMessageIds in dependencies

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM updates have completed
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        requestAnimationFrame(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        });
      }
    };
    
    scrollToBottom();
  }, [messages.length]); // Only depend on message count, not the entire messages array

  // Chat bubble animations
  const containerVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 300
      }
    },
    exit: { 
      opacity: 0, 
      y: 50, 
      scale: 0.9,
      transition: { duration: 0.2 }
    }
  };

  // Bubble animation for new messages
  const bubbleVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {/* Chat Button */}
      <motion.button
        onClick={toggleChat}
        className="bg-white text-black rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          type: 'spring', 
          stiffness: 300, 
          damping: 20,
          delay: 0.6
        }}
        aria-label={isOpen ? t('liveChat.close') : t('liveChat.open')}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </motion.button>

      {/* Chat Container */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            className="absolute bottom-16 left-0 w-[320px] sm:w-[350px] bg-black border border-white/10 rounded-lg shadow-xl overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Chat Header */}
            <div className="bg-black p-4 border-b border-white/10">
              <h3 className="text-white font-bold">{t('liveChat.title')}</h3>
              <p className="text-white/70 text-sm">
                {t('liveChat.subtitle')} 
                <span className="text-xs ml-1 opacity-50">(ID: {sessionId.split('_').pop()?.substring(0, 6)})</span>
              </p>
            </div>

            {/* Chat Messages */}
            <div className="max-h-80 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  variants={bubbleVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div 
                    className={`max-w-[80%] px-4 py-3 rounded-xl ${
                      message.isUser 
                        ? 'bg-white text-black rounded-tr-none' 
                        : 'bg-white/10 text-white rounded-tl-none'
                    }`}
                  >
                    {!message.isUser && message.sender && (
                      <span className="text-xs font-medium text-white/80 block mb-1">
                        {message.sender}
                      </span>
                    )}
                    <p className="text-sm">{message.text}</p>
                    <span className="text-xs mt-1 block opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  className="flex justify-start"
                  variants={bubbleVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="bg-white/10 text-white px-4 py-3 rounded-xl rounded-tl-none">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-white/70 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-white/70 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-white/70 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-white/10">
              <div className="flex">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={t('liveChat.inputPlaceholder')}
                  className="flex-1 bg-white/10 text-white placeholder-white/50 border-none outline-none rounded-l-lg py-2 px-3"
                />
                <button
                  type="submit"
                  className="bg-white text-black px-4 rounded-r-lg font-medium"
                  disabled={!inputValue.trim()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 