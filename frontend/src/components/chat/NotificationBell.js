import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Button
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CircleIcon from '@mui/icons-material/Circle';
import { notificationService } from '../../api/notificationService';
import socketService from '../../services/socketService';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { NOTIFICATION_TYPES } from '../../constants/socketEvents';

const NotificationBell = ({ onNotificationClick }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();

    socketService.onNotification((notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);

      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/logo192.png'
        });
      }
    });

    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      socketService.removeAllListeners();
    };
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications(20, 0);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await notificationService.markAsRead(notification.id);
        setUnreadCount(prev => Math.max(0, prev - 1));

        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
        );
      }

      if (notification.data) {
        const data = typeof notification.data === 'string'
          ? JSON.parse(notification.data)
          : notification.data;

        if (data.conversationId && onNotificationClick) {
          onNotificationClick(data.conversationId);
        }
      }

      handleClose();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.MESSAGE: return '💬';
      case NOTIFICATION_TYPES.FOLLOW: return '👤';
      case NOTIFICATION_TYPES.GROUP_INVITE: return '➕';
      case NOTIFICATION_TYPES.GROUP_ADD: return '👥';
      case NOTIFICATION_TYPES.GROUP_REMOVE: return '➖';
      case NOTIFICATION_TYPES.MENTION: return '@';
      case NOTIFICATION_TYPES.SYSTEM: return '⚙️';
      default: return '🔔';
    }
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          color: 'white',
          background: unreadCount > 0 ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s',
          '&:hover': {
            background: unreadCount > 0 ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.25)',
            transform: 'scale(1.05)',
          },
        }}
      >
        <Badge
          badgeContent={unreadCount}
          sx={{
            '& .MuiBadge-badge': {
              background: 'linear-gradient(135deg, #EC4899 0%, #F5576C 100%)',
              boxShadow: '0 2px 8px rgba(255, 107, 157, 0.4)',
            },
          }}
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            maxHeight: 400,
            width: 380,
            backgroundColor: 'white',
            boxShadow: '0 10px 40px rgba(91, 127, 255, 0.15)',
            border: '1px solid #E2E8F0',
            borderRadius: 2,
            mt: 1,
          },
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #E2E8F0',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F172A' }}>
            Thông báo
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={handleMarkAllAsRead}
              sx={{
                borderRadius: 2,
                fontSize: '0.75rem',
                background: 'linear-gradient(135deg, rgba(91, 127, 255, 0.1) 0%, rgba(255, 107, 157, 0.1) 100%)',
                color: '#6366F1',
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(91, 127, 255, 0.2) 0%, rgba(255, 107, 157, 0.2) 100%)',
                },
              }}
            >
              Đánh dấu đã đọc
            </Button>
          )}
        </Box>

        {notifications.length === 0 ? (
          <MenuItem disabled sx={{ py: 3, justifyContent: 'center' }}>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Không có thông báo
            </Typography>
          </MenuItem>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
              <ListItem
                key={notification.id}
                button
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  borderBottom: '1px solid #F8FAFC',
                  bgcolor: notification.isRead ? 'transparent' : 'rgba(91, 127, 255, 0.06)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'rgba(91, 127, 255, 0.1)',
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: notification.isRead
                        ? '#EDF2F7'
                        : 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
                      boxShadow: notification.isRead
                        ? 'none'
                        : '0 4px 12px rgba(91, 127, 255, 0.3)',
                    }}
                  >
                    {getNotificationIcon(notification.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: notification.isRead ? 400 : 600,
                          color: notification.isRead ? '#64748B' : '#0F172A',
                        }}
                      >
                        {notification.title}
                      </Typography>
                      {!notification.isRead && (
                        <CircleIcon sx={{ fontSize: 8, color: '#6366F1' }} />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#64748B',
                          mb: 0.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#A0AEC0' }}>
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: vi
                        })}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;
