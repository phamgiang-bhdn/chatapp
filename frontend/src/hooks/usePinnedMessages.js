import { useState, useEffect } from 'react';
import { chatService } from '../api/chatService';

export const usePinnedMessages = (conversation) => {
  const [pinnedMessages, setPinnedMessages] = useState([]);

  const loadPinnedMessages = async () => {
    if (!conversation) return;
    
    try {
      const data = await chatService.getPinnedMessages(conversation.id);
      setPinnedMessages(data.pinnedMessages || []);
    } catch (error) {
      console.error('Failed to load pinned messages:', error);
    }
  };

  const pinMessage = async (messageId) => {
    if (!conversation) return;
    
    try {
      await chatService.pinMessage(conversation.id, messageId);
      await loadPinnedMessages();
      return true;
    } catch (error) {
      console.error('Failed to pin message:', error);
      throw error;
    }
  };

  const unpinMessage = async (messageId) => {
    if (!conversation) return;
    
    try {
      await chatService.unpinMessage(conversation.id, messageId);
      await loadPinnedMessages();
      return true;
    } catch (error) {
      console.error('Failed to unpin message:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (conversation && !conversation.threadId) {
      loadPinnedMessages();
    }
  }, [conversation]);

  return {
    pinnedMessages,
    loadPinnedMessages,
    pinMessage,
    unpinMessage
  };
};

