import React from 'react';
import { Box, Paper, Typography, Avatar, IconButton, Tooltip } from '@mui/material';
import { format } from 'date-fns';
import PushPinIcon from '@mui/icons-material/PushPin';
import ReplyIcon from '@mui/icons-material/Reply';
import ForumIcon from '@mui/icons-material/Forum';
import DownloadIcon from '@mui/icons-material/Download';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { MessageContent } from './MessageContent';
import { MessageActions } from './MessageActions';

export const MessageItem = ({
  message,
  isOwnMessage,
  sender,
  user,
  isPinned,
  conversation,
  pinnedMessages,
  onPinMessage,
  onUnpinMessage,
  onReply,
  onCreateThread,
  onDownloadFile,
  onAvatarClick,
  messageSenders
}) => {
  // Fallback to messageSenders if sender is not provided
  const actualSender = sender || messageSenders?.[message.senderId] || message.sender || (isOwnMessage ? user : null);
  const avatarUrl = actualSender?.avatar ? `${actualSender.avatar}?t=${Date.now()}` : null;
  const displayName = actualSender?.fullName || actualSender?.username || 'U';
  const avatarInitial = displayName.charAt(0).toUpperCase();
  
  // Format timestamp for tooltip
  const messageDate = new Date(message.createdAt);
  const tooltipText = format(messageDate, 'dd/MM/yyyy HH:mm:ss');

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
        mb: 2,
        position: 'relative',
        '&:hover .message-actions': {
          opacity: 1
        }
      }}
      data-message-id={message.id}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: isOwnMessage ? 'row-reverse' : 'row',
          alignItems: 'flex-end',
          gap: 1.5,
          maxWidth: '70%',
        }}
      >
        <Avatar
          src={avatarUrl}
          onClick={() => onAvatarClick(message.senderId)}
          sx={{
            width: 42,
            height: 42,
            background: avatarUrl 
              ? 'transparent' 
              : (isOwnMessage 
                ? 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)'
                : 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)'),
            fontWeight: 700,
            boxShadow: '0 3px 10px rgba(91, 127, 255, 0.2)',
            cursor: isOwnMessage ? 'default' : 'pointer',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: isOwnMessage ? 'none' : 'scale(1.1)',
            },
          }}
        >
          {!avatarUrl && avatarInitial}
        </Avatar>

        <Tooltip 
          title={tooltipText}
          arrow
          placement={isOwnMessage ? 'left' : 'right'}
        >
          <Paper
            elevation={0}
            sx={{
              py: 1.5,
              px: 2,
              borderRadius: isOwnMessage ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              background: isOwnMessage
                ? 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)'
                : '#F9FAFB',
              color: isOwnMessage ? 'white' : '#111827',
              border: isPinned 
                ? '2px solid #FFC107'
                : isOwnMessage
                ? 'none'
                : '1px solid #E5E7EB',
              boxShadow: isOwnMessage
                ? '0 2px 8px rgba(102, 126, 234, 0.25)'
                : '0 1px 2px rgba(0, 0, 0, 0.05)',
              maxWidth: '100%',
              position: 'relative',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              '&:hover': {
                boxShadow: isOwnMessage
                  ? '0 4px 12px rgba(102, 126, 234, 0.35)'
                  : '0 2px 8px rgba(0, 0, 0, 0.1)',
                transform: 'translateY(-1px)'
              }
            }}
          >
            {isPinned && (
              <PushPinIcon sx={{ 
                position: 'absolute',
                top: 6,
                right: 6,
                color: '#FFC107',
                fontSize: '0.9rem'
              }} />
            )}

            <MessageContent 
              message={message}
              isOwnMessage={isOwnMessage}
              user={user}
              onDownloadFile={onDownloadFile}
              messageSenders={messageSenders}
            />
          </Paper>
        </Tooltip>

        <MessageActions
          isOwnMessage={isOwnMessage}
          conversation={conversation}
          isPinned={isPinned}
          onPin={() => isPinned ? onUnpinMessage(message.id) : onPinMessage(message.id)}
          onReply={() => onReply(message)}
          onCreateThread={() => onCreateThread(message.id)}
        />
      </Box>
    </Box>
  );
};

