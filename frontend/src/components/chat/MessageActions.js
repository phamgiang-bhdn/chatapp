import React from 'react';
import { Box, IconButton } from '@mui/material';
import PushPinIcon from '@mui/icons-material/PushPin';
import ReplyIcon from '@mui/icons-material/Reply';
import ForumIcon from '@mui/icons-material/Forum';

export const MessageActions = ({
  isOwnMessage,
  conversation,
  isPinned,
  onPin,
  onReply,
  onCreateThread
}) => {
  return (
    <Box
      className="message-actions"
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 0.5,
        opacity: 0,
        transition: 'opacity 0.2s',
        px: 0.5,
        py: 0.5,
        alignSelf: 'center'
      }}
    >
      {conversation?.type === 'group' && (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onCreateThread();
          }}
          sx={{
            background: 'rgba(255, 255, 255, 0.95)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            width: 32,
            height: 32,
            '&:hover': {
              background: 'white',
              transform: 'scale(1.1)'
            }
          }}
          title="Tạo thread"
        >
          <ForumIcon sx={{ fontSize: '1rem', color: '#6366F1' }} />
        </IconButton>
      )}
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onPin();
        }}
        sx={{
          background: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          width: 32,
          height: 32,
          color: isPinned ? '#FFC107' : '#64748B',
          '&:hover': {
            background: 'white',
            transform: 'scale(1.1)'
          }
        }}
        title={isPinned ? "Bỏ ghim" : "Ghim tin nhắn"}
      >
        <PushPinIcon sx={{ 
          fontSize: '1rem',
          transform: isPinned ? 'rotate(45deg)' : 'none',
          transition: 'transform 0.2s'
        }} />
      </IconButton>
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onReply();
        }}
        sx={{
          background: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          width: 32,
          height: 32,
          '&:hover': {
            background: 'white',
            transform: 'scale(1.1)'
          }
        }}
        title="Trả lời"
      >
        <ReplyIcon sx={{ fontSize: '1rem', color: '#6366F1' }} />
      </IconButton>
    </Box>
  );
};

