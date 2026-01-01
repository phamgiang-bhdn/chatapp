import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
  Typography,
  Box,
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tabs,
  Tab
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import ChatIcon from '@mui/icons-material/Chat';
import { userService } from '../../api/userService';
import { chatService } from '../../api/chatService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const UserProfileDialog = ({ open, onClose, userId, onStartChat }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user: currentUser } = useAuth();
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    if (open && userId) {
      loadUserProfile();
      loadFollowStatus();
      loadFollowers();
      loadFollowing();
    }
  }, [open, userId]);

  const loadUserProfile = async () => {
    try {
      const data = await userService.getUserById(userId);
      setUserProfile(data.user);
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const loadFollowStatus = async () => {
    if (userId === currentUser.id) return;

    try {
      const data = await userService.checkFollowing(userId);
      setIsFollowing(data.isFollowing);
    } catch (error) {
      console.error('Failed to check follow status:', error);
    }
  };

  const loadFollowers = async () => {
    try {
      const data = await userService.getFollowers(userId);
      setFollowers(data.followers || []);
    } catch (error) {
      console.error('Failed to load followers:', error);
    }
  };

  const loadFollowing = async () => {
    try {
      const data = await userService.getFollowing(userId);
      setFollowing(data.following || []);
    } catch (error) {
      console.error('Failed to load following:', error);
    }
  };

  const handleFollow = async () => {
    setLoading(true);
    try {
      if (isFollowing) {
        await userService.unfollowUser(userId);
        setIsFollowing(false);
      } else {
        await userService.followUser(userId);
        setIsFollowing(true);
      }
      await loadFollowers();
      showSuccess(isFollowing ? 'Đã bỏ theo dõi' : 'Đã theo dõi');
    } catch (error) {
      console.error('Failed to follow/unfollow:', error);
      showError('Không thể thực hiện hành động');
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async () => {
    try {
      const data = await chatService.createConversation([userId]);
      onStartChat(data.conversation);
      onClose();
    } catch (error) {
      console.error('Failed to start chat:', error);
    }
  };

  if (!userProfile) return null;

  const isOwnProfile = userId === currentUser.id;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Avatar
            src={userProfile.avatar ? `${userProfile.avatar}?t=${Date.now()}` : null}
            sx={{ 
              width: 100, 
              height: 100, 
              mx: 'auto', 
              mb: 2,
              background: userProfile.avatar ? 'transparent' : 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
              fontSize: '3rem',
              fontWeight: 700
            }}
          >
            {!userProfile.avatar && (userProfile.fullName?.charAt(0) || userProfile.username?.charAt(0))}
          </Avatar>
          <Typography variant="h5" gutterBottom>
            {userProfile.fullName || userProfile.username}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            @{userProfile.username}
          </Typography>
          <Chip
            label={userProfile.status || 'offline'}
            size="small"
            color={userProfile.status === 'online' ? 'success' : 'default'}
            sx={{ mt: 1 }}
          />
        </Box>

        {userProfile.bio && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" sx={{ mb: 2 }}>
              {userProfile.bio}
            </Typography>
          </>
        )}

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6">{followers.length}</Typography>
            <Typography variant="body2" color="text.secondary">
              Người theo dõi
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6">{following.length}</Typography>
            <Typography variant="body2" color="text.secondary">
              Đang theo dõi
            </Typography>
          </Box>
        </Box>

        {!isOwnProfile && (
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button
              fullWidth
              variant={isFollowing ? 'outlined' : 'contained'}
              startIcon={isFollowing ? <PersonRemoveIcon /> : <PersonAddIcon />}
              onClick={handleFollow}
              disabled={loading}
            >
              {isFollowing ? 'Bỏ theo dõi' : 'Theo dõi'}
            </Button>
            <Button
              fullWidth
              variant="contained"
              startIcon={<ChatIcon />}
              onClick={handleStartChat}
            >
              Nhắn tin
            </Button>
          </Box>
        )}

        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="fullWidth">
          <Tab label={`Người theo dõi (${followers.length})`} />
          <Tab label={`Đang theo dõi (${following.length})`} />
        </Tabs>

        <Box sx={{ mt: 2, maxHeight: 300, overflow: 'auto' }}>
          {activeTab === 0 && (
            <List>
              {followers.map((follower) => (
                <ListItem key={follower.id}>
                  <ListItemAvatar>
                    <Avatar>
                      {follower.fullName?.charAt(0) || follower.username?.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={follower.fullName || follower.username}
                    secondary={`@${follower.username}`}
                  />
                </ListItem>
              ))}
              {followers.length === 0 && (
                <Typography variant="body2" color="text.secondary" align="center">
                  Chưa có người theo dõi
                </Typography>
              )}
            </List>
          )}

          {activeTab === 1 && (
            <List>
              {following.map((user) => (
                <ListItem key={user.id}>
                  <ListItemAvatar>
                    <Avatar>
                      {user.fullName?.charAt(0) || user.username?.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.fullName || user.username}
                    secondary={`@${user.username}`}
                  />
                </ListItem>
              ))}
              {following.length === 0 && (
                <Typography variant="body2" color="text.secondary" align="center">
                  Chưa theo dõi ai
                </Typography>
              )}
            </List>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserProfileDialog;
