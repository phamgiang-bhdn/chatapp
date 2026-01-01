import React from 'react';
import { Box, Typography } from '@mui/material';

export const ReplyPreview = ({ replyTo, isOwnMessage, user, messageSenders }) => {
  const getReplyContent = () => {
    if (replyTo.type === 'image') return '📷 Hình ảnh';
    if (replyTo.type === 'file') return `📎 ${replyTo.content}`;
    return replyTo.content;
  };

  const getSenderName = () => {
    if (replyTo.senderId === user.id) {
      return 'Bạn';
    }
    
    // Try to get sender name from messageSenders
    const sender = messageSenders?.[replyTo.senderId] || replyTo.sender;
    if (sender) {
      return sender.fullName || sender.username || 'Người khác';
    }
    
    return 'Người khác';
  };

  return (
    <Box
      sx={{
        mb: 1.5,
        p: 1.25,
        borderRadius: '12px',
        borderLeft: '3px solid',
        borderColor: isOwnMessage ? 'rgba(255,255,255,0.4)' : '#667EEA',
        background: isOwnMessage 
          ? 'rgba(255,255,255,0.15)' 
          : 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.2s ease',
        '&:hover': {
          background: isOwnMessage 
            ? 'rgba(255,255,255,0.2)' 
            : 'linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.12) 100%)',
        }
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontWeight: 600,
          fontSize: '0.75rem',
          mb: 0.5,
          display: 'block',
          color: isOwnMessage ? 'rgba(255,255,255,0.9)' : '#667EEA',
          letterSpacing: '0.3px'
        }}
      >
        {getSenderName()}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontSize: '0.8rem',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          color: isOwnMessage ? 'rgba(255,255,255,0.85)' : '#4B5563',
          fontWeight: 400
        }}
      >
        {getReplyContent()}
      </Typography>
    </Box>
  );
};

