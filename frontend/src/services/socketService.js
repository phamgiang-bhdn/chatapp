import { io } from 'socket.io-client';
import { SOCKET_EVENTS, USER_STATUS } from '../constants/socketEvents';

const SOCKET_URL = process.env.REACT_APP_CHAT_SERVICE_URL || 'http://localhost:8003';

class SocketService {
  constructor() {
    this.socket = null;
    this.onlineUsers = new Set();
    this.messageCallbacks = new Set();
    this.typingCallbacks = new Set();
    this.reactionCallbacks = new Set();
    this.scheduledMessageCallbacks = new Set();
  }

  connect(token) {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        auth: { token }
      });

      this.socket.on(SOCKET_EVENTS.CONNECT, () => {
        console.log('Socket connected');
        this.socket.emit(SOCKET_EVENTS.GET_ONLINE_USERS);
      });

      this.socket.on(SOCKET_EVENTS.DISCONNECT, () => {
        console.log('Socket disconnected');
      });

      this.socket.on(SOCKET_EVENTS.CONNECT_ERROR, (error) => {
        console.error('Socket connection error:', error);
      });

      this.socket.on(SOCKET_EVENTS.ONLINE_USERS, (data) => {
        if (data && data.userIds) {
          this.onlineUsers = new Set(data.userIds);
          console.log('Online users updated:', Array.from(this.onlineUsers));
        }
      });

      this.socket.on(SOCKET_EVENTS.USER_STATUS_CHANGE, (data) => {
        if (data.status === USER_STATUS.ONLINE) {
          this.onlineUsers.add(data.userId);
        } else {
          this.onlineUsers.delete(data.userId);
        }
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.onlineUsers.clear();
      this.messageCallbacks.clear();
      this.typingCallbacks.clear();
      this.reactionCallbacks.clear();
      this.scheduledMessageCallbacks.clear();
    }
  }

  isUserOnline(userId) {
    return this.onlineUsers.has(userId);
  }

  getOnlineUsers() {
    return Array.from(this.onlineUsers);
  }

  onUserStatusChange(callback) {
    if (this.socket) {
      this.socket.on(SOCKET_EVENTS.USER_STATUS_CHANGE, callback);
    }
  }

  onNotification(callback) {
    if (this.socket) {
      this.socket.on(SOCKET_EVENTS.NOTIFICATION, callback);
    }
  }

  joinConversation(conversationId) {
    if (this.socket) {
      this.socket.emit(SOCKET_EVENTS.JOIN_CONVERSATION, conversationId);
    }
  }

  sendMessage(conversationId, content, type = 'text', fileUrl = null, replyToId = null, threadId = null, mentionedUserIds = []) {
    if (this.socket) {
      this.socket.emit(SOCKET_EVENTS.SEND_MESSAGE, {
        conversationId,
        content,
        type,
        fileUrl,
        replyToId,
        threadId,
        mentionedUserIds
      });
    } else {
      console.error('Socket not connected');
    }
  }

  onNewMessage(callback) {
    if (this.socket) {
      // Add callback to the set
      this.messageCallbacks.add(callback);
      
      // Remove existing master listener and add new one that calls all callbacks
      this.socket.off(SOCKET_EVENTS.NEW_MESSAGE);
      this.socket.on(SOCKET_EVENTS.NEW_MESSAGE, (data) => {
        this.messageCallbacks.forEach(cb => cb(data));
      });
    }
    
    // Return unsubscribe function
    return () => {
      this.messageCallbacks.delete(callback);
    };
  }

  sendTyping(conversationId, isTyping) {
    if (this.socket) {
      this.socket.emit(SOCKET_EVENTS.TYPING, { conversationId, isTyping });
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      // Add callback to the set
      this.typingCallbacks.add(callback);
      
      // Remove existing master listener and add new one that calls all callbacks
      this.socket.off(SOCKET_EVENTS.USER_TYPING);
      this.socket.on(SOCKET_EVENTS.USER_TYPING, (data) => {
        this.typingCallbacks.forEach(cb => cb(data));
      });
    }
    
    // Return unsubscribe function
    return () => {
      this.typingCallbacks.delete(callback);
    };
  }

  markAsRead(conversationId) {
    if (this.socket) {
      this.socket.emit(SOCKET_EVENTS.MARK_AS_READ, { conversationId });
    }
  }

  onMessagesRead(callback) {
    if (this.socket) {
      this.socket.on(SOCKET_EVENTS.MESSAGES_READ, callback);
    }
  }

  onError(callback) {
    if (this.socket) {
      this.socket.on(SOCKET_EVENTS.ERROR, callback);
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  removeListener(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  onReactionUpdated(callback) {
    if (this.socket) {
      this.reactionCallbacks.add(callback);
      
      this.socket.off(SOCKET_EVENTS.REACTION_UPDATED);
      this.socket.on(SOCKET_EVENTS.REACTION_UPDATED, (data) => {
        this.reactionCallbacks.forEach(cb => cb(data));
      });
    }
    
    return () => {
      this.reactionCallbacks.delete(callback);
    };
  }

  onScheduledMessageSent(callback) {
    if (this.socket) {
      this.scheduledMessageCallbacks.add(callback);
      
      this.socket.off(SOCKET_EVENTS.SCHEDULED_MESSAGE_SENT);
      this.socket.on(SOCKET_EVENTS.SCHEDULED_MESSAGE_SENT, (data) => {
        this.scheduledMessageCallbacks.forEach(cb => cb(data));
      });
    }
    
    return () => {
      this.scheduledMessageCallbacks.delete(callback);
    };
  }
}

export default new SocketService();
