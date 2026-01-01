import React, { useState, useEffect } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import socketService from '../services/socketService';
import { authService } from '../api/authService';
import { chatService } from '../api/chatService';
import { userService } from '../api/userService';
import ConversationList from '../components/chat/ConversationList';
import ChatWindow from '../components/chat/ChatWindow';
import ChatHeader from '../components/chat/ChatHeader';

const Chat = () => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationListKey, setConversationListKey] = useState(0);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      socketService.connect(token);
      
      userService.updateStatus('online').catch(err => {
        console.error('Failed to update status:', err);
      });
    }

    return () => {
      userService.updateStatus('offline').catch(err => {
        console.error('Failed to update status:', err);
      });
      socketService.disconnect();
    };
  }, []);

  const handleNotificationClick = async (conversationId) => {
    try {
      const data = await chatService.getConversations();
      const conversation = data.conversations.find(c => c.id === conversationId);
      if (conversation) {
        setSelectedConversation(conversation);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const handleConversationUpdate = () => {
    setConversationListKey(prev => prev + 1);
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#F8FAFC',
        overflow: 'hidden',
      }}
    >
      <ChatHeader user={user} onNotificationClick={handleNotificationClick} />
      <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Conversation List - Hide on mobile when conversation is selected */}
        <Box
          sx={{
            width: { xs: '100%', md: '340px', lg: '380px' },
            minWidth: { md: '300px' },
            height: '100%',
            borderRight: { md: '1px solid #E2E8F0' },
            background: 'white',
            display: isMobile && selectedConversation ? 'none' : 'flex',
            flexDirection: 'column',
          }}
        >
          <ConversationList
            key={conversationListKey}
            selectedConversation={selectedConversation}
            onSelectConversation={setSelectedConversation}
            onConversationUpdate={handleConversationUpdate}
          />
        </Box>
        
        {/* Chat Window - Hide on mobile when no conversation is selected */}
        <Box
          sx={{
            flexGrow: 1,
            height: '100%',
            display: isMobile && !selectedConversation ? 'none' : 'flex',
            flexDirection: 'column',
          }}
        >
          <ChatWindow 
            conversation={selectedConversation} 
            onBack={isMobile ? handleBackToList : null}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Chat;
