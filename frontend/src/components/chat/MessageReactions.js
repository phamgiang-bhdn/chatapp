import React, { useState } from 'react';
import { Box, Chip, Popover, IconButton, Tooltip } from '@mui/material';
import AddReactionIcon from '@mui/icons-material/AddReaction';

const COMMON_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🔥', '👏', '💯'];

export const MessageReactions = ({
  reactions = [],
  messageId,
  userId,
  isOwnMessage,
  onAddReaction,
  onRemoveReaction
}) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpenPicker = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClosePicker = () => {
    setAnchorEl(null);
  };

  const handleEmojiClick = (emoji) => {
    // Check if user already reacted with this emoji
    const existingReaction = reactions.find(
      r => r.emoji === emoji && r.userIds?.includes(userId)
    );

    if (existingReaction) {
      onRemoveReaction(messageId, emoji);
    } else {
      onAddReaction(messageId, emoji);
    }
    handleClosePicker();
  };

  const handleReactionChipClick = (reaction) => {
    const hasReacted = reaction.userIds?.includes(userId);
    if (hasReacted) {
      onRemoveReaction(messageId, reaction.emoji);
    } else {
      onAddReaction(messageId, reaction.emoji);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 0.5,
        mt: reactions.length > 0 ? 1 : 0,
        alignItems: 'center',
        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start'
      }}
    >
      {reactions.map((reaction) => {
        const hasReacted = reaction.userIds?.includes(userId);
        return (
          <Tooltip 
            key={reaction.emoji} 
            title={`${reaction.count} reaction${reaction.count > 1 ? 's' : ''}`}
            arrow
          >
            <Chip
              size="small"
              label={`${reaction.emoji} ${reaction.count}`}
              onClick={(e) => {
                e.stopPropagation();
                handleReactionChipClick(reaction);
              }}
              sx={{
                height: 24,
                fontSize: '0.8rem',
                cursor: 'pointer',
                background: hasReacted 
                  ? 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)'
                  : 'rgba(255, 255, 255, 0.9)',
                color: hasReacted ? 'white' : '#333',
                border: hasReacted ? 'none' : '1px solid #E5E7EB',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                },
                transition: 'all 0.2s ease'
              }}
            />
          </Tooltip>
        );
      })}
      
      <IconButton
        size="small"
        onClick={handleOpenPicker}
        sx={{
          width: 24,
          height: 24,
          background: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid #E5E7EB',
          '&:hover': {
            background: 'white',
            transform: 'scale(1.1)'
          }
        }}
      >
        <AddReactionIcon sx={{ fontSize: '0.9rem', color: '#64748B' }} />
      </IconButton>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClosePicker}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        sx={{
          '& .MuiPopover-paper': {
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            p: 1
          }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.5,
            maxWidth: 220,
            p: 0.5
          }}
        >
          {COMMON_EMOJIS.map((emoji) => {
            const existingReaction = reactions.find(r => r.emoji === emoji);
            const hasReacted = existingReaction?.userIds?.includes(userId);
            return (
              <Box
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                sx={{
                  fontSize: '1.4rem',
                  cursor: 'pointer',
                  p: 0.5,
                  borderRadius: '8px',
                  background: hasReacted 
                    ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)'
                    : 'transparent',
                  '&:hover': {
                    background: 'rgba(0,0,0,0.05)',
                    transform: 'scale(1.2)'
                  },
                  transition: 'all 0.15s ease'
                }}
              >
                {emoji}
              </Box>
            );
          })}
        </Box>
      </Popover>
    </Box>
  );
};


