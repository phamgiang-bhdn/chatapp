import React, { useState, useEffect } from 'react';
import { Box, Grid } from '@mui/material';
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

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#F8FAFC',
      }}
    >
      <ChatHeader user={user} onNotificationClick={handleNotificationClick} />
      <Grid container sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <Grid
          item
          xs={12}
          md={4}
          lg={3}
          sx={{
            height: '100%',
            borderRight: '1px solid #E2E8F0',
            background: 'white',
          }}
        >
          <ConversationList
            key={conversationListKey}
            selectedConversation={selectedConversation}
            onSelectConversation={setSelectedConversation}
            onConversationUpdate={handleConversationUpdate}
          />
        </Grid>
        <Grid item xs={12} md={8} lg={9} sx={{ height: '100%' }}>
          <ChatWindow conversation={selectedConversation} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Chat;
