import React from 'react';
import { Box, Typography, IconButton, Chip } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { ReplyPreview } from './ReplyPreview';
import { LocationPreview } from './LocationPreview';

// Helper function to render message with mentions highlighted
const renderMessageWithMentions = (content, mentionedUserIds = [], mentionedUsers = [], messageSenders = {}, isOwnMessage = false) => {
  if (!content) return '';
  
  // Create a map of userId to user info
  const userMap = {};
  mentionedUsers.forEach(user => {
    userMap[user.id] = user;
  });
  Object.values(messageSenders).forEach(user => {
    if (!userMap[user.id]) {
      userMap[user.id] = user;
    }
  });

  // Split content by mentions (@userId)
  const parts = [];
  const mentionRegex = /@(\d+)/g;
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    // Add text before mention
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: content.substring(lastIndex, match.index) });
    }

    // Add mention
    const userId = parseInt(match[1]);
    const user = userMap[userId];
    const userName = user?.fullName || user?.username || 'Unknown';
    
    parts.push({
      type: 'mention',
      userId: userId,
      userName: userName,
      content: match[0]
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push({ type: 'text', content: content.substring(lastIndex) });
  }

  // If no mentions found, return original content
  if (parts.length === 0) {
    return content;
  }

  // Render parts
  return parts.map((part, index) => {
    if (part.type === 'mention') {
      return (
        <Chip
          key={index}
          label={`@${part.userName}`}
          size="small"
          sx={{
            height: 'auto',
            py: 0.5,
            px: 1,
            m: 0.25,
            fontSize: '0.875rem',
            fontWeight: 600,
            backgroundColor: isOwnMessage ? 'rgba(255, 255, 255, 0.25)' : '#6366F1',
            color: isOwnMessage ? 'white' : 'white',
            '& .MuiChip-label': {
              px: 0.5
            }
          }}
        />
      );
    }
    return <span key={index}>{part.content}</span>;
  });
};

export const MessageContent = ({ message, isOwnMessage, user, onDownloadFile, messageSenders }) => {
  return (
    <>
      {message.replyTo && (
        <ReplyPreview 
          replyTo={message.replyTo}
          isOwnMessage={isOwnMessage}
          user={user}
          messageSenders={messageSenders}
        />
      )}

      {message.type === 'image' && message.fileUrl && (
        <Box sx={{ mb: 1.5, borderRadius: '12px', overflow: 'hidden', position: 'relative', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
          <img
            src={message.fileUrl}
            alt="Sent image"
            style={{
              maxWidth: '100%',
              maxHeight: '300px',
              objectFit: 'cover',
              display: 'block'
            }}
          />
          <IconButton
            size="small"
            onClick={() => onDownloadFile(message.fileUrl, message.content || 'image.jpg')}
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              background: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                background: 'rgba(0, 0, 0, 0.8)',
                transform: 'scale(1.1)'
              },
              transition: 'all 0.2s ease'
            }}
            title="Tải xuống"
          >
            <DownloadIcon sx={{ fontSize: '1rem' }} />
          </IconButton>
        </Box>
      )}

      {message.type === 'file' && message.fileUrl && (
        <Box sx={{ 
          mb: 1.5, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5,
          p: 1.5,
          borderRadius: '12px',
          background: isOwnMessage ? 'rgba(255,255,255,0.1)' : '#F3F4F6',
          border: isOwnMessage ? '1px solid rgba(255,255,255,0.2)' : '1px solid #E5E7EB',
          transition: 'all 0.2s ease',
          '&:hover': {
            background: isOwnMessage ? 'rgba(255,255,255,0.15)' : '#E5E7EB'
          }
        }}>
          <AttachFileIcon sx={{ fontSize: '1.3rem', color: isOwnMessage ? 'rgba(255,255,255,0.9)' : '#667EEA' }} />
          <Typography variant="body2" sx={{ 
            fontWeight: 500, 
            flex: 1, 
            wordBreak: 'break-word',
            fontSize: '0.9rem',
            color: isOwnMessage ? 'rgba(255,255,255,0.95)' : '#374151'
          }}>
            {message.content}
          </Typography>
          <IconButton
            size="small"
            onClick={() => onDownloadFile(message.fileUrl, message.content)}
            sx={{ 
              ml: 'auto',
              color: isOwnMessage ? 'rgba(255,255,255,0.8)' : '#6B7280',
              '&:hover': {
                background: isOwnMessage ? 'rgba(255,255,255,0.2)' : '#E5E7EB',
                transform: 'scale(1.1)'
              },
              transition: 'all 0.2s ease'
            }}
            title="Tải xuống"
          >
            <DownloadIcon sx={{ fontSize: '1rem' }} />
          </IconButton>
        </Box>
      )}

      {message.type === 'location' && (
        <LocationPreview message={message} isOwnMessage={isOwnMessage} />
      )}

      {message.type === 'text' && (
        <Typography 
          variant="body1" 
          sx={{
            mb: 0,
            fontSize: '0.95rem',
            fontWeight: 400,
            lineHeight: 1.6,
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap'
          }}
          component="div"
        >
          {renderMessageWithMentions(message.content, message.mentionedUserIds || [], message.mentionedUsers || [], messageSenders, isOwnMessage)}
        </Typography>
      )}
    </>
  );
};

