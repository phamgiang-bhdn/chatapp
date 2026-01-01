import { useState, useEffect, useRef } from 'react';
import { chatService } from '../api/chatService';
import { userService } from '../api/userService';
import socketService from '../services/socketService';
import { SOCKET_EVENTS } from '../constants/socketEvents';

export const useThreads = (conversation, user) => {
  const [threads, setThreads] = useState([]);
  const [threadMessages, setThreadMessages] = useState([]);
  const [threadSenders, setThreadSenders] = useState({});
  const loadedConversationIdRef = useRef(null);
  const loadedUserIdsRef = useRef(new Set());

  // Load all users in group for threads
  const loadAllUsers = async (conversationId) => {
    const senders = {};
    
    // Always add current user
    if (user) {
      senders[user.id] = user;
      loadedUserIdsRef.current.add(user.id);
    }

    try {
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
    } catch (error) {
      console.error('Failed to load users for threads:', error);
    }

    return senders;
  };

  const loadThreads = async () => {
    if (!conversation || conversation.type !== 'group') return;
    
    try {
      const data = await chatService.getThreads(conversation.id);
      setThreads(data.threads || []);
    } catch (error) {
      console.error('Failed to load threads:', error);
    }
  };

  const loadThreadMessages = async (threadId, conversationId) => {
    try {
      // First, load all users in the group
      const allUsers = await loadAllUsers(conversationId);
      
      // Then load thread messages
      const data = await chatService.getThreadMessages(conversationId, threadId);
      const threadMsgs = data.messages || [];
      
      setThreadMessages(threadMsgs);
      
      const senders = { ...allUsers };
      const senderIdsToLoad = new Set();
      
      // Collect any additional senders from messages
      for (const msg of threadMsgs) {
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
      
      setThreadSenders(senders);
      return threadMsgs;
    } catch (error) {
      console.error('Failed to load thread messages:', error);
      return [];
    }
  };

  useEffect(() => {
    if (!conversation || !user || conversation.type !== 'group') return;

    const conversationId = conversation.id;
    
    // Reset if conversation changed
    if (loadedConversationIdRef.current !== conversationId) {
      loadedUserIdsRef.current.clear();
    }
    
    // Prevent duplicate API calls
    if (loadedConversationIdRef.current === conversationId) {
      return;
    }
    
    loadedConversationIdRef.current = conversationId;
    let isMounted = true;

    loadThreads();

    const handleThreadCreated = (data) => {
      if (!isMounted) return;
      if (data.thread && data.thread.conversationId === conversationId) {
        setThreads((prev) => {
          if (prev.some(t => t.id === data.thread.id)) {
            return prev;
          }
          return [data.thread, ...prev];
        });
      }
    };

    const handleNewMessage = async (data) => {
      if (!isMounted) return;
      if (data.message.conversationId !== conversationId) return;
      
      if (data.message.threadId) {
        // Update thread unread count
        setThreads((prev) => prev.map(thread => {
          if (thread.id === data.message.threadId && data.message.senderId !== user.id) {
            return { ...thread, unreadCount: (thread.unreadCount || 0) + 1 };
          }
          return thread;
        }));

        // Update thread senders
        if (data.message.sender) {
          setThreadSenders(prev => ({
            ...prev,
            [data.message.senderId]: data.message.sender
          }));
          loadedUserIdsRef.current.add(data.message.senderId);
        } else if (data.message.senderId && !loadedUserIdsRef.current.has(data.message.senderId)) {
          loadedUserIdsRef.current.add(data.message.senderId);
          try {
            const userData = await userService.getUserById(data.message.senderId);
            if (isMounted) {
              setThreadSenders(prev => ({
                ...prev,
                [data.message.senderId]: userData.user
              }));
            }
          } catch (error) {
            console.error(`Failed to load sender ${data.message.senderId}:`, error);
            loadedUserIdsRef.current.delete(data.message.senderId);
            // Set fallback sender
            if (isMounted) {
              setThreadSenders(prev => ({
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

        // Also load sender of replyTo if exists
        if (data.message.replyTo && data.message.replyTo.senderId) {
          if (data.message.replyTo.sender) {
            setThreadSenders(prev => ({
              ...prev,
              [data.message.replyTo.senderId]: data.message.replyTo.sender
            }));
            loadedUserIdsRef.current.add(data.message.replyTo.senderId);
          } else if (!loadedUserIdsRef.current.has(data.message.replyTo.senderId)) {
            loadedUserIdsRef.current.add(data.message.replyTo.senderId);
            try {
              const userData = await userService.getUserById(data.message.replyTo.senderId);
              if (isMounted) {
                setThreadSenders(prev => ({
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

        // Add message to threadMessages if viewing this thread
        if (isMounted) {
          setThreadMessages((prev) => {
            // Check if we're viewing this thread by checking if any message in prev has this threadId
            if (prev.length > 0 && prev[0]?.threadId === data.message.threadId) {
              return [...prev, data.message];
            }
            return prev;
          });
        }
      }
    };

    if (socketService.socket) {
      socketService.socket.on(SOCKET_EVENTS.THREAD_CREATED, handleThreadCreated);
    }

    socketService.onNewMessage(handleNewMessage);

    return () => {
      isMounted = false;
      loadedUserIdsRef.current.clear();
      if (socketService.socket) {
        socketService.socket.off(SOCKET_EVENTS.THREAD_CREATED, handleThreadCreated);
        socketService.socket.off(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.id, conversation?.type, user?.id]);

  return {
    threads,
    threadMessages,
    threadSenders,
    loadThreads,
    loadThreadMessages,
    setThreadMessages,
    setThreadSenders
  };
};

