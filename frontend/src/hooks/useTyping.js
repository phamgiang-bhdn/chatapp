import { useState, useEffect, useRef } from 'react';
import socketService from '../services/socketService';
import { SOCKET_EVENTS } from '../constants/socketEvents';

export const useTyping = (conversation) => {
  const [typing, setTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const handleTyping = () => {
    if (!conversation) return;
    
    socketService.sendTyping(conversation.id, true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socketService.sendTyping(conversation.id, false);
    }, 1000);
  };

  useEffect(() => {
    if (!conversation) return;

    const handleUserTyping = (data) => {
      setTyping(data.isTyping);
    };

    socketService.onUserTyping(handleUserTyping);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Remove specific listener
      if (socketService.socket) {
        socketService.socket.off(SOCKET_EVENTS.USER_TYPING, handleUserTyping);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.id]);

  return { typing, handleTyping };
};

