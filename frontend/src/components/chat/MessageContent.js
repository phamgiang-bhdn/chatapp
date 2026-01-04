import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { ReplyPreview } from './ReplyPreview';
import { LocationPreview } from './LocationPreview';

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
        >
          {message.content}
        </Typography>
      )}
    </>
  );
};
