import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar, IconButton, Menu, MenuItem, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LogoutIcon from '@mui/icons-material/Logout';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import NotificationBell from './NotificationBell';
import EditProfileDialog from './EditProfileDialog';
import UserProfileDialog from './UserProfileDialog';
import ChangePasswordDialog from './ChangePasswordDialog';

const ChatHeader = ({ user, onNotificationClick }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showViewProfile, setShowViewProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewProfile = () => {
    setShowViewProfile(true);
    handleMenuClose();
  };

  const handleEditProfile = () => {
    setShowEditProfile(true);
    handleMenuClose();
  };

  const handleChangePassword = () => {
    setShowChangePassword(true);
    handleMenuClose();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, px: { xs: 1, sm: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: { xs: 32, sm: 36, md: 40 },
              height: { xs: 32, sm: 36, md: 40 },
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <ChatBubbleIcon sx={{ color: 'white', fontSize: { xs: 18, sm: 20, md: 22 } }} />
          </Box>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
              background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            Chat App
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5, md: 2 } }}>
          <NotificationBell onNotificationClick={onNotificationClick} />
          
          <IconButton
            onClick={handleMenuOpen}
            sx={{
              p: 0,
              '&:hover': {
                transform: 'scale(1.05)',
              },
              transition: 'transform 0.2s',
            }}
          >
            <Avatar
              src={user?.avatar ? `${user.avatar}?t=${Date.now()}` : null}
              sx={{
                width: { xs: 32, sm: 36, md: 40 },
                height: { xs: 32, sm: 36, md: 40 },
                border: '2px solid rgba(255, 255, 255, 0.5)',
                background: user?.avatar ? 'transparent' : 'linear-gradient(135deg, #F472B6 0%, #818CF8 100%)',
                fontWeight: 700,
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                cursor: 'pointer',
              }}
            >
              {!user?.avatar && (user?.fullName?.charAt(0) || user?.username?.charAt(0))}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 220,
                borderRadius: 3,
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                border: '1px solid #E2E8F0',
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {user?.fullName || user?.username}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                @{user?.username}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleViewProfile} sx={{ py: 1.5, gap: 1.5 }}>
              <PersonIcon fontSize="small" />
              Xem Profile
            </MenuItem>
            <MenuItem onClick={handleEditProfile} sx={{ py: 1.5, gap: 1.5 }}>
              <EditIcon fontSize="small" />
              Chỉnh sửa Profile
            </MenuItem>
            <MenuItem onClick={handleChangePassword} sx={{ py: 1.5, gap: 1.5 }}>
              <LockIcon fontSize="small" />
              Đổi mật khẩu
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={handleLogout}
              sx={{
                py: 1.5,
                gap: 1.5,
                color: '#EF4444',
                '&:hover': {
                  background: 'rgba(239, 68, 68, 0.08)',
                },
              }}
            >
              <LogoutIcon fontSize="small" />
              Đăng xuất
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>

      <EditProfileDialog
        open={showEditProfile}
        onClose={() => setShowEditProfile(false)}
      />

      <UserProfileDialog
        open={showViewProfile}
        onClose={() => setShowViewProfile(false)}
        userId={user?.id}
      />

      <ChangePasswordDialog
        open={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </AppBar>
  );
};

export default ChatHeader;
