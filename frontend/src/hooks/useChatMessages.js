import { useState, useEffect, useRef } from 'react';
import { chatService } from '../api/chatService';
import { userService } from '../api/userService';
import socketService from '../services/socketService';
import { SOCKET_EVENTS } from '../constants/socketEvents';

export const useChatMessages = (conversation, user) => {
  const [messages, setMessages] = useState([]);
  const [messageSenders, setMessageSenders] = useState({});
  const loadedConversationIdRef = useRef(null);
  const markAsReadTimeoutRef = useRef(null);
  const loadedUserIdsRef = useRef(new Set());

  // Load all users in conversation/group
  const loadAllUsers = async (conversationId, conversationType) => {
    const senders = {};
    
    // Always add current user
    if (user) {
      senders[user.id] = user;
      loadedUserIdsRef.current.add(user.id);
    }

    try {
      if (conversationType === 'group') {
        // Load all members for group chat
        const membersData = await chatService.getMembers(conversationId);
        const members = membersData.members || [];
        
        // Load user details for all members
        const loadPromises = members.map(async (member) => {
          try {
            const userData = await userService.getUserById(member.userId);
            senders[member.userId] = userData.user;
            loadedUserIdsRef.current.add(member.userId);
          } catch (error) {
            console.error(`Failed to load member ${member.userId}:`, error);
            senders[member.userId] = {
              id: member.userId,
              username: 'Unknown',
              fullName: 'Unknown User'
            };
          }
        });
        await Promise.all(loadPromises);
      } else if (conversationType === 'private') {
        // For private chat, load the other participant
        // This will be handled in ChatWindow, but we can also get from participants
        // For now, we'll load from messages
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }

    return senders;
  };

  const loadSenders = async (messageList, existingSenders = {}) => {
    const senders = { ...existingSenders };
    const senderIdsToLoad = new Set();

    // Collect all sender IDs from messages and replyTo
    for (const msg of messageList) {
      if (msg.senderId && !senders[msg.senderId] && !loadedUserIdsRef.current.has(msg.senderId)) {
        if (msg.sender) {
          senders[msg.senderId] = msg.sender;
          loadedUserIdsRef.current.add(msg.senderId);
        } else {
          senderIdsToLoad.add(msg.senderId);
        }
      }
      
      if (msg.replyTo && msg.replyTo.senderId) {
        if (msg.replyTo.sender && !senders[msg.replyTo.senderId]) {
          senders[msg.replyTo.senderId] = msg.replyTo.sender;
          loadedUserIdsRef.current.add(msg.replyTo.senderId);
        } else if (!senders[msg.replyTo.senderId] && !loadedUserIdsRef.current.has(msg.replyTo.senderId)) {
          senderIdsToLoad.add(msg.replyTo.senderId);
        }
      }
    }

    // Load any missing senders
    if (senderIdsToLoad.size > 0) {
      const loadPromises = Array.from(senderIdsToLoad).map(async (senderId) => {
        try {
          const userData = await userService.getUserById(senderId);
          senders[senderId] = userData.user;
          loadedUserIdsRef.current.add(senderId);
        } catch (error) {
          console.error(`Failed to load sender ${senderId}:`, error);
          senders[senderId] = { id: senderId, username: 'Unknown', fullName: 'Unknown User' };
        }
      });
      await Promise.all(loadPromises);
    }

    return senders;
  };

  const loadMessages = async (existingSenders = {}) => {
    if (!conversation) return;
    
    try {
      // Load messages
      const data = await chatService.getMessages(conversation.id);
      const mainMessages = (data.messages || []).filter(msg => !msg.threadId);
      
      // Load any additional senders from messages (including replyTo senders)
      // Use existing senders (from loadAllUsers) as base
      const senders = await loadSenders(data.messages || [], existingSenders);
      
      // Set messages and senders
      setMessages(mainMessages);
      setMessageSenders(senders);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  useEffect(() => {
    if (!conversation || !user || conversation.threadId) return;

    const conversationId = conversation.id;
    
    // Reset if conversation changed
    if (loadedConversationIdRef.current !== conversationId) {
      loadedUserIdsRef.current.clear();
      if (markAsReadTimeoutRef.current) {
        clearTimeout(markAsReadTimeoutRef.current);
      }
    }
    
    // Prevent duplicate API calls
    if (loadedConversationIdRef.current === conversationId) {
      return;
    }
    
    loadedConversationIdRef.current = conversationId;
    let isMounted = true;

    // Load messages (which will load users first for group chat)
    loadMessages();

    const handleNewMessage = async (data) => {
      if (!isMounted) return;
      if (data.message.conversationId !== conversationId) return;
      if (data.message.threadId) return; // Skip thread messages in main view

      // Update senders - always try to load if not in cache
      if (data.message.sender) {
        setMessageSenders(prev => ({
          ...prev,
          [data.message.senderId]: data.message.sender
        }));
        loadedUserIdsRef.current.add(data.message.senderId);
      } else if (data.message.senderId) {
        // Check if already loaded
        if (!loadedUserIdsRef.current.has(data.message.senderId)) {
          loadedUserIdsRef.current.add(data.message.senderId);
          try {
            const userData = await userService.getUserById(data.message.senderId);
            if (isMounted) {
              setMessageSenders(prev => ({
                ...prev,
                [data.message.senderId]: userData.user
              }));
            }
          } catch (error) {
            console.error(`Failed to load sender ${data.message.senderId}:`, error);
            loadedUserIdsRef.current.delete(data.message.senderId);
            // Set a fallback sender
            if (isMounted) {
              setMessageSenders(prev => ({
                ...prev,
                [data.message.senderId]: { 
                  id: data.message.senderId, 
                  username: 'Unknown', 
                  fullName: 'Unknown User' 
                }
              }));
            }
          }
        }
      }

      // Also load sender of replyTo if exists
      if (data.message.replyTo && data.message.replyTo.senderId) {
        if (data.message.replyTo.sender) {
          setMessageSenders(prev => ({
            ...prev,
            [data.message.replyTo.senderId]: data.message.replyTo.sender
          }));
          loadedUserIdsRef.current.add(data.message.replyTo.senderId);
        } else if (!loadedUserIdsRef.current.has(data.message.replyTo.senderId)) {
          loadedUserIdsRef.current.add(data.message.replyTo.senderId);
          try {
            const userData = await userService.getUserById(data.message.replyTo.senderId);
            if (isMounted) {
              setMessageSenders(prev => ({
                ...prev,
                [data.message.replyTo.senderId]: userData.user
              }));
            }
          } catch (error) {
            console.error(`Failed to load replyTo sender ${data.message.replyTo.senderId}:`, error);
            loadedUserIdsRef.current.delete(data.message.replyTo.senderId);
          }
        }
      }

      if (isMounted) {
        setMessages((prev) => [...prev, data.message]);

        if (data.message.senderId !== user.id) {
          // Debounce markAsRead to prevent spam
          if (markAsReadTimeoutRef.current) {
            clearTimeout(markAsReadTimeoutRef.current);
          }
          markAsReadTimeoutRef.current = setTimeout(() => {
            chatService.markAsRead(conversationId).catch(err => {
              console.error('Failed to mark as read:', err);
            });
          }, 1000);
        }
      }
    };

    socketService.onNewMessage(handleNewMessage);

    return () => {
      isMounted = false;
      if (markAsReadTimeoutRef.current) {
        clearTimeout(markAsReadTimeoutRef.current);
      }
      loadedUserIdsRef.current.clear();
      // Remove specific listener instead of all listeners
      if (socketService.socket) {
        socketService.socket.off(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.id, conversation?.threadId, user?.id]);

  return { messages, messageSenders, loadMessages, setMessageSenders, loadAllUsers };
};

