import React, { useState } from 'react';
import { Box, Typography, Avatar, IconButton, Menu, MenuItem } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ForumIcon from '@mui/icons-material/Forum';
import SettingsIcon from '@mui/icons-material/Settings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GroupMembersDialog from './GroupMembersDialog';

export const ConversationHeader = ({
  conversation,
  otherUser,
  typing,
  userRole,
  onViewMembers,
  onOpenGroupSettings,
  onLeaveGroup,
  onShowThreads,
  onAvatarClick,
  onBack
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [showMembers, setShowMembers] = useState(false);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleViewMembers = () => {
    setShowMembers(true);
    handleCloseMenu();
    if (onViewMembers) onViewMembers();
  };

  const handleOpenGroupSettings = () => {
    handleCloseMenu();
    if (onOpenGroupSettings) onOpenGroupSettings();
  };

  const handleLeaveGroup = () => {
    handleCloseMenu();
    if (onLeaveGroup) onLeaveGroup();
  };

  return (
    <>
      <Box
        sx={{
          p: { xs: 1.5, sm: 2, md: 2.5 },
          borderBottom: '3px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'white',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5, md: 2 } }}>
          {/* Back button for mobile */}
          {onBack && (
            <IconButton
              onClick={onBack}
              sx={{
                width: { xs: 36, sm: 40 },
                height: { xs: 36, sm: 40 },
                background: '#F8FAFC',
                border: '2px solid #E2E8F0',
                '&:hover': {
                  background: '#EDF2F7',
                  borderColor: '#6366F1',
                },
              }}
            >
              <ArrowBackIcon sx={{ fontSize: { xs: '1.1rem', sm: '1.3rem' } }} />
            </IconButton>
          )}
          <Avatar
            src={conversation.type === 'group' ? null : (otherUser?.avatar || null)}
            onClick={() => {
              if (conversation.type === 'direct' && conversation.otherUserId) {
                onAvatarClick(conversation.otherUserId);
              }
            }}
            sx={{
              width: { xs: 44, sm: 50, md: 56 },
              height: { xs: 44, sm: 50, md: 56 },
              background: conversation.type === 'group'
                ? 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)'
                : (otherUser?.avatar ? 'transparent' : 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)'),
              fontWeight: 700,
              fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.4rem' },
              boxShadow: '0 4px 12px rgba(91, 127, 255, 0.25)',
              cursor: conversation.type === 'direct' && conversation.otherUserId ? 'pointer' : 'default',
              transition: 'transform 0.2s',
              '&:hover': conversation.type === 'direct' && conversation.otherUserId ? {
                transform: 'scale(1.05)',
              } : {},
            }}
          >
            {conversation.type === 'group' 
              ? <GroupIcon sx={{ fontSize: { xs: '1.4rem', sm: '1.6rem', md: '1.8rem' } }} /> 
              : (!otherUser?.avatar && ((otherUser?.fullName || otherUser?.username || conversation.name)?.charAt(0) || 'U'))
            }
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.15rem' },
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {conversation.threadId 
                ? (conversation.name || 'Thread')
                : (conversation.type === 'group' 
                  ? conversation.name || 'Nhóm chat'
                  : (otherUser?.fullName || otherUser?.username || 'Người dùng'))
              }
            </Typography>
            {typing && (
              <Typography variant="caption" sx={{ color: '#6366F1', fontWeight: 600, fontSize: '0.8rem' }}>
                Đang nhập...
              </Typography>
            )}
          </Box>
        </Box>
        {conversation.type === 'group' && !conversation.threadId && (
          <>
            <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 } }}>
              <IconButton
                onClick={onShowThreads}
                sx={{
                  width: { xs: 36, sm: 40, md: 44 },
                  height: { xs: 36, sm: 40, md: 44 },
                  background: '#F8FAFC',
                  border: '2px solid #E2E8F0',
                  '&:hover': {
                    background: '#EDF2F7',
                    borderColor: '#6366F1',
                  },
                }}
                title="Threads"
              >
                <ForumIcon sx={{ fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.3rem' } }} />
              </IconButton>
              <IconButton
                onClick={handleOpenMenu}
                sx={{
                  width: { xs: 36, sm: 40, md: 44 },
                  height: { xs: 36, sm: 40, md: 44 },
                  background: '#F8FAFC',
                  border: '2px solid #E2E8F0',
                  '&:hover': {
                    background: '#EDF2F7',
                    borderColor: '#6366F1',
                  },
                }}
              >
                <MoreVertIcon sx={{ fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.3rem' } }} />
              </IconButton>
            </Box>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
              PaperProps={{
                sx: {
                  backgroundColor: 'white',
                  boxShadow: '0 10px 40px rgba(91, 127, 255, 0.15)',
                  border: '1px solid #E2E8F0',
                },
              }}
            >
              <MenuItem
                onClick={handleViewMembers}
                sx={{
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                  },
                }}
              >
                <GroupIcon sx={{ mr: 1 }} /> Xem thành viên
              </MenuItem>
              {userRole === 'admin' && (
                <MenuItem
                  onClick={handleOpenGroupSettings}
                  sx={{
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                    },
                  }}
                >
                  <SettingsIcon sx={{ mr: 1 }} /> Cài đặt nhóm
                </MenuItem>
              )}
              <MenuItem
                onClick={handleLeaveGroup}
                sx={{
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(245, 87, 108, 0.1) 0%, rgba(249, 80, 87, 0.1) 100%)',
                  },
                }}
              >
                <ExitToAppIcon sx={{ mr: 1 }} /> Rời nhóm
              </MenuItem>
            </Menu>
          </>
        )}
      </Box>

      <GroupMembersDialog
        open={showMembers}
        onClose={() => setShowMembers(false)}
        conversation={conversation}
        onAvatarClick={onAvatarClick}
      />
    </>
  );
};

