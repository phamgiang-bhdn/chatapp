import { useState, useEffect, useRef } from 'react';
import socketService from '../services/socketService';

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

    const unsubscribe = socketService.onUserTyping(handleUserTyping);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Use the unsubscribe function to remove this specific callback
      if (unsubscribe) {
        unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.id]);

  return { typing, handleTyping };
};

