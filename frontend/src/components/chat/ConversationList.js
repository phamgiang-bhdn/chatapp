import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  TextField,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Menu,
  MenuItem,
  Badge
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import CircleIcon from '@mui/icons-material/Circle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ForumIcon from '@mui/icons-material/Forum';
import { chatService } from '../../api/chatService';
import { userService } from '../../api/userService';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import CreateGroupDialog from './CreateGroupDialog';
import UserProfileDialog from './UserProfileDialog';
import socketService from '../../services/socketService';
import { USER_STATUS, SOCKET_EVENTS } from '../../constants/socketEvents';

const ConversationList = ({ selectedConversation, onSelectConversation, onConversationUpdate }) => {
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openNewChat, setOpenNewChat] = useState(false);
  const [openCreateGroup, setOpenCreateGroup] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [viewingUserId, setViewingUserId] = useState(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [participantUsers, setParticipantUsers] = useState({});
  const [conversationThreads, setConversationThreads] = useState({});
  const [expandedConversations, setExpandedConversations] = useState(new Set());
  const { user: currentUser } = useAuth();

  useEffect(() => {
    loadConversations();

    const handleNewMessage = (data) => {
      if (data.message && data.message.conversationId) {
        if (!data.message.threadId) {
          // Update conversation: move to top and update unread count
          setConversations(prev => {
            const conversationId = data.message.conversationId;
            const isFromOther = data.message.senderId !== currentUser.id;
            const isCurrentlyViewing = selectedConversation?.id === conversationId && !selectedConversation?.threadId;
            
            // Update the conversation with new lastMessageAt and optionally unreadCount
            const updated = prev.map(conv => {
              if (conv.id === conversationId) {
                const newUnreadCount = (isFromOther && !isCurrentlyViewing) 
                  ? (conv.unreadCount || 0) + 1 
                  : conv.unreadCount;
                return { 
                  ...conv, 
                  lastMessageAt: new Date().toISOString(),
                  unreadCount: newUnreadCount
                };
              }
              return conv;
            });
            
            // Sort by lastMessageAt descending (newest first)
            return updated.sort((a, b) => 
              new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0)
            );
          });
        } else {
          const isThreadSelected = selectedConversation?.threadId === data.message.threadId && selectedConversation?.id === data.message.conversationId;
          if (!isThreadSelected && data.message.senderId !== currentUser.id) {
            setConversationThreads(prev => {
              const threads = prev[data.message.conversationId] || [];
              const updatedThreads = threads.map(thread => {
                if (thread.id === data.message.threadId) {
                  return { ...thread, unreadCount: (thread.unreadCount || 0) + 1 };
                }
                return thread;
              });
              return { ...prev, [data.message.conversationId]: updatedThreads };
            });
          }
        }
      }
    };

    const handleOnlineUsers = (data) => {
      if (data && data.userIds) {
        const newOnlineUsers = new Set(data.userIds);
        setOnlineUsers(newOnlineUsers);
        console.log('[ConversationList] Online users updated:', Array.from(newOnlineUsers));
      }
    };

    const handleStatusChange = (data) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        if (data.status === USER_STATUS.ONLINE) {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });
    };

    const handleMessagesRead = (data) => {
      if (data && data.conversationId) {
        setConversations(prev => prev.map(conv => {
          if (conv.id === data.conversationId) {
            return { ...conv, unreadCount: 0 };
          }
          return conv;
        }));
      }
    };

    const handleThreadCreated = (data) => {
      if (data.thread && data.thread.conversationId) {
        setConversationThreads(prev => {
          const existingThreads = prev[data.thread.conversationId] || [];
          if (existingThreads.some(t => t.id === data.thread.id)) {
            return prev;
          }
          return {
            ...prev,
            [data.thread.conversationId]: [data.thread, ...existingThreads]
          };
        });
      }
    };

    let unsubscribeMessage = null;
    let checkSocketInterval = null;

    if (socketService.socket) {
      socketService.socket.on(SOCKET_EVENTS.ONLINE_USERS, handleOnlineUsers);
      socketService.onUserStatusChange(handleStatusChange);
      unsubscribeMessage = socketService.onNewMessage(handleNewMessage);
      socketService.onMessagesRead(handleMessagesRead);
      socketService.socket.on(SOCKET_EVENTS.THREAD_CREATED, handleThreadCreated);
      
      if (socketService.socket.connected) {
        socketService.socket.emit(SOCKET_EVENTS.GET_ONLINE_USERS);
      }
    } else {
      checkSocketInterval = setInterval(() => {
        if (socketService.socket) {
          socketService.socket.on(SOCKET_EVENTS.ONLINE_USERS, handleOnlineUsers);
          socketService.onUserStatusChange(handleStatusChange);
          unsubscribeMessage = socketService.onNewMessage(handleNewMessage);
          socketService.onMessagesRead(handleMessagesRead);
          socketService.socket.on(SOCKET_EVENTS.THREAD_CREATED, handleThreadCreated);
          if (socketService.socket.connected) {
            socketService.socket.emit(SOCKET_EVENTS.GET_ONLINE_USERS);
          }
          clearInterval(checkSocketInterval);
        }
      }, 100);
      
      setTimeout(() => clearInterval(checkSocketInterval), 5000);
    }

    const initialOnlineUsers = socketService.getOnlineUsers();
    if (initialOnlineUsers.length > 0) {
      setOnlineUsers(new Set(initialOnlineUsers));
    }

    // Cleanup function
    return () => {
      if (checkSocketInterval) {
        clearInterval(checkSocketInterval);
      }
      if (unsubscribeMessage) {
        unsubscribeMessage();
      }
      if (socketService.socket) {
        socketService.socket.off(SOCKET_EVENTS.ONLINE_USERS, handleOnlineUsers);
        socketService.socket.off(SOCKET_EVENTS.THREAD_CREATED, handleThreadCreated);
      }
    };
  }, [selectedConversation, currentUser]);

  const loadConversations = async () => {
    try {
      const data = await chatService.getConversations();
      const conversations = data.conversations || [];
      setConversations(conversations);

      const userInfoMap = {};
      for (const conv of conversations) {
        if (conv.type === 'private' && conv.participants) {
          const otherParticipant = conv.participants.find(p => p.userId !== currentUser.id);
          if (otherParticipant) {
            try {
              const userData = await userService.getUserById(otherParticipant.userId);
              userInfoMap[conv.id] = userData.user;
            } catch (error) {
              console.error(`Failed to load user ${otherParticipant.userId}:`, error);
            }
          }
        }
      }
      setParticipantUsers(userInfoMap);
      
      const threadsMap = {};
      for (const conv of conversations) {
        if (conv.type === 'group') {
          try {
            const threadsData = await chatService.getThreads(conv.id);
            threadsMap[conv.id] = threadsData.threads || [];
          } catch (error) {
            console.error(`Failed to load threads for conversation ${conv.id}:`, error);
            threadsMap[conv.id] = [];
          }
        }
      }
      setConversationThreads(threadsMap);
      
      setTimeout(() => {
        if (socketService.socket && socketService.socket.connected) {
          socketService.socket.emit(SOCKET_EVENTS.GET_ONLINE_USERS);
        }
      }, 500);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const handleSearchUsers = async (query) => {
    if (query.trim()) {
      try {
        const data = await userService.searchUsers(query);
        setSearchResults(data.users || []);
      } catch (error) {
        console.error('Failed to search users:', error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleCreateConversation = async (userId) => {
    try {
      const data = await chatService.createConversation([userId]);
      setOpenNewChat(false);
      setSearchResults([]);
      setSearchQuery('');
      await loadConversations();
      onSelectConversation(data.conversation);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleGroupCreated = async (group) => {
    await loadConversations();
    onSelectConversation(group);
  };

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenNewChat = () => {
    setOpenNewChat(true);
    handleCloseMenu();
  };

  const handleOpenCreateGroup = () => {
    setOpenCreateGroup(true);
    handleCloseMenu();
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF' }}>
      <Box sx={{ p: { xs: 1.5, sm: 2 }, pb: { xs: 1, sm: 1.5 }, display: 'flex', gap: 1, borderBottom: '1px solid #E2E8F0' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm kiếm..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#F8FAFC',
              borderRadius: 3,
              fontSize: { xs: '0.875rem', sm: '1rem' },
              '&:hover': {
                backgroundColor: '#EDF2F7',
              },
              '&.Mui-focused': {
                backgroundColor: '#EDF2F7',
              },
            },
            '& .MuiInputBase-input': {
              py: { xs: 1, sm: 1.25 },
            },
          }}
        />
        <IconButton
          onClick={handleOpenMenu}
          sx={{
            background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
            color: 'white',
            minWidth: { xs: 40, sm: 44 },
            height: { xs: 40, sm: 44 },
            '&:hover': {
              background: 'linear-gradient(135deg, #7B9AFF 0%, #FF8BB3 100%)',
              transform: 'scale(1.05)',
            },
          }}
        >
          <AddIcon />
        </IconButton>
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
            onClick={handleOpenNewChat}
            sx={{
              '&:hover': {
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              },
            }}
          >
            <PersonIcon sx={{ mr: 1 }} /> Chat 1-1
          </MenuItem>
          <MenuItem
            onClick={handleOpenCreateGroup}
            sx={{
              '&:hover': {
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              },
            }}
          >
            <GroupIcon sx={{ mr: 1 }} /> Tạo nhóm
          </MenuItem>
        </Menu>
      </Box>

      <List sx={{ flexGrow: 1, overflow: 'auto', px: 1, py: 1 }}>
        {conversations
          .filter(conv => {
            return true;
          })
          .map((conversation) => {
            const threads = conversationThreads[conversation.id] || [];
            const isExpanded = expandedConversations.has(conversation.id);
            const hasThreads = threads.length > 0;
            
            return (
              <React.Fragment key={conversation.id}>
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    selected={selectedConversation?.id === conversation.id && !selectedConversation?.threadId}
                    onClick={async () => {
                      setConversations(prev => prev.map(conv => {
                        if (conv.id === conversation.id) {
                          return { ...conv, unreadCount: 0 };
                        }
                        return conv;
                      }));
                      onSelectConversation(conversation);
                      setTimeout(() => loadConversations(), 500);
                    }}
                sx={{
                  borderRadius: { xs: 2, sm: 2.5 },
                  py: { xs: 1, sm: 1.5 },
                  px: { xs: 1.5, sm: 2 },
                  transition: 'all 0.2s ease',
                  border: '2px solid transparent',
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(236, 72, 153, 0.12) 100%)',
                    border: '2px solid rgba(99, 102, 241, 0.3)',
                    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.15)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(236, 72, 153, 0.18) 100%)',
                    },
                  },
                  '&:hover': {
                    background: '#F8FAFC',
                    border: '2px solid rgba(99, 102, 241, 0.15)',
                  },
                }}
              >
                <ListItemAvatar>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    badgeContent={conversation.unreadCount > 0 ? conversation.unreadCount : 0}
                    invisible={!conversation.unreadCount || conversation.unreadCount === 0}
                    sx={{
                      '& .MuiBadge-badge': {
                        backgroundColor: '#EF4444',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        minWidth: '20px',
                        height: '20px',
                        borderRadius: '10px',
                        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
                      },
                    }}
                  >
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      variant="dot"
                      invisible={(() => {
                        if (conversation.type === 'group') return true;
                        
                        if (conversation.type === 'private' && participantUsers[conversation.id]) {
                          const otherUserId = participantUsers[conversation.id].id;
                          const isOnline = onlineUsers.has(otherUserId);
                          return !isOnline;
                        }
                        
                        return true;
                      })()}
                      sx={{
                        '& .MuiBadge-badge': {
                          backgroundColor: '#10B981',
                          color: '#10B981',
                          boxShadow: `0 0 0 3px white`,
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          border: '2px solid white',
                          animation: 'pulse 2s infinite',
                          '@keyframes pulse': {
                            '0%, 100%': {
                              opacity: 1,
                            },
                            '50%': {
                              opacity: 0.7,
                            },
                          },
                        },
                      }}
                    >
                      <Avatar
                        src={conversation.type === 'group' ? null : (participantUsers[conversation.id]?.avatar || null)}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (conversation.type === 'private' && participantUsers[conversation.id]?.id) {
                            setViewingUserId(participantUsers[conversation.id].id);
                            setShowUserProfile(true);
                          }
                        }}
                        sx={{
                          width: { xs: 44, sm: 48, md: 52 },
                          height: { xs: 44, sm: 48, md: 52 },
                          background: conversation.type === 'group'
                            ? 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)'
                            : (participantUsers[conversation.id]?.avatar ? 'transparent' : 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)'),
                          fontWeight: 700,
                          fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.3rem' },
                          boxShadow: '0 2px 8px rgba(99, 102, 241, 0.2)',
                          cursor: conversation.type === 'private' && participantUsers[conversation.id]?.id ? 'pointer' : 'default',
                          transition: 'transform 0.2s',
                          '&:hover': conversation.type === 'private' && participantUsers[conversation.id]?.id ? {
                            transform: 'scale(1.05)'
                          } : {}
                        }}
                      >
                        {conversation.type === 'group' ? (
                          <GroupIcon sx={{ fontSize: '1.6rem' }} />
                        ) : (
                          !participantUsers[conversation.id]?.avatar && ((participantUsers[conversation.id]?.fullName || participantUsers[conversation.id]?.username || conversation.name)?.charAt(0)?.toUpperCase() || 'U')
                        )}
                      </Avatar>
                    </Badge>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography
                        sx={{
                          fontWeight: selectedConversation?.id === conversation.id ? 700 : 600,
                          fontSize: '1rem',
                          color: selectedConversation?.id === conversation.id ? '#1A1F2E' : '#0F172A',
                          lineHeight: 1.4,
                        }}
                      >
                        {conversation.type === 'group' 
                          ? conversation.name || 'Nhóm chat'
                          : (participantUsers[conversation.id]?.fullName || participantUsers[conversation.id]?.username || 'Người dùng')
                        }
                      </Typography>
                      {conversation.type === 'group' && (
                        <Typography variant="caption" sx={{
                          opacity: 0.6,
                          fontWeight: 500,
                          fontSize: '0.75rem',
                          px: 1,
                          py: 0.25,
                          borderRadius: 1,
                          backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        }}>
                          Nhóm
                        </Typography>
                      )}
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" sx={{
                      opacity: 0.7,
                      fontSize: '0.85rem',
                      fontWeight: 400,
                      mt: 0.25,
                    }}>
                      {conversation.type === 'group' 
                        ? (conversation.lastMessageAt
                          ? formatDistanceToNow(new Date(conversation.lastMessageAt), {
                            addSuffix: true,
                            locale: vi
                          })
                          : 'Chưa có tin nhắn')
                        : (() => {
                            const otherUser = participantUsers[conversation.id];
                            if (!otherUser) return 'Chưa có thông tin';
                            
                            const isOnline = onlineUsers.has(otherUser.id);
                            
                            if (isOnline) {
                              return 'Đang hoạt động';
                            }
                            
                            if (otherUser.lastSeen) {
                              return formatDistanceToNow(new Date(otherUser.lastSeen), {
                                addSuffix: true,
                                locale: vi
                              });
                            }
                            
                            return 'Chưa có thông tin';
                          })()
                      }
                    </Typography>
                  }
                />
                  {hasThreads && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedConversations(prev => {
                          const newSet = new Set(prev);
                          if (newSet.has(conversation.id)) {
                            newSet.delete(conversation.id);
                          } else {
                            newSet.add(conversation.id);
                          }
                          return newSet;
                        });
                      }}
                      sx={{ ml: 1 }}
                    >
                      {isExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                    </IconButton>
                  )}
                </ListItemButton>
              </ListItem>
              
              
              {hasThreads && isExpanded && (
                <Box sx={{ pl: 4 }}>
                  {threads.map((thread) => {
                    const isThreadSelected = selectedConversation?.threadId === thread.id && selectedConversation?.id === conversation.id;
                    return (
                      <ListItem key={thread.id} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                          selected={isThreadSelected}
                          onClick={async () => {
                            const threadConversation = {
                              ...conversation,
                              threadId: thread.id,
                              name: thread.title || `Thread: ${thread.parentMessage?.content?.substring(0, 30) || 'Untitled'}`
                            };
                            onSelectConversation(threadConversation);
                            setConversationThreads(prev => {
                              const threads = prev[conversation.id] || [];
                              return {
                                ...prev,
                                [conversation.id]: threads.map(t => 
                                  t.id === thread.id ? { ...t, unreadCount: 0 } : t
                                )
                              };
                            });
                            setTimeout(() => loadConversations(), 500);
                          }}
                          sx={{
                            borderRadius: 2,
                            py: 1,
                            px: 1.5,
                            transition: 'all 0.2s ease',
                            border: '2px solid transparent',
                            '&.Mui-selected': {
                              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(236, 72, 153, 0.12) 100%)',
                              border: '2px solid rgba(99, 102, 241, 0.3)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(236, 72, 153, 0.18) 100%)',
                              },
                            },
                            '&:hover': {
                              background: '#F8FAFC',
                              border: '2px solid rgba(99, 102, 241, 0.15)',
                            },
                          }}
                        >
                          <ListItemAvatar>
                            <Badge
                              overlap="circular"
                              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                              badgeContent={thread.unreadCount > 0 ? thread.unreadCount : 0}
                              invisible={!thread.unreadCount || thread.unreadCount === 0}
                              sx={{
                                '& .MuiBadge-badge': {
                                  backgroundColor: '#EF4444',
                                  color: 'white',
                                  fontWeight: 700,
                                  fontSize: '0.7rem',
                                  minWidth: '18px',
                                  height: '18px',
                                  borderRadius: '9px',
                                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
                                },
                              }}
                            >
                              <Avatar
                                sx={{
                                  width: 40,
                                  height: 40,
                                  background: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
                                  fontWeight: 700,
                                  fontSize: '1rem',
                                  boxShadow: '0 2px 8px rgba(236, 72, 153, 0.2)',
                                }}
                              >
                                <ForumIcon sx={{ fontSize: '1.2rem' }} />
                              </Avatar>
                            </Badge>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography
                                sx={{
                                  fontWeight: isThreadSelected ? 700 : 600,
                                  fontSize: '0.9rem',
                                  color: isThreadSelected ? '#1A1F2E' : '#0F172A',
                                }}
                              >
                                {thread.title || thread.parentMessage?.content?.substring(0, 30) || 'Untitled Thread'}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="caption" sx={{
                                opacity: 0.7,
                                fontSize: '0.8rem',
                              }}>
                                Thread
                              </Typography>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </Box>
              )}
            </React.Fragment>
            );
          })}
      </List>

      <Dialog
        open={openNewChat}
        onClose={() => setOpenNewChat(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'white',
            border: '2px solid #E2E8F0',
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(91, 127, 255, 0.25)',
          },
        }}
      >
        <DialogTitle sx={{
          fontWeight: 700,
          fontSize: '1.3rem',
          borderBottom: '2px solid #E2E8F0',
          pb: 2,
        }}>
          Tạo cuộc trò chuyện mới
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            placeholder="Tìm kiếm người dùng..."
            onChange={(e) => handleSearchUsers(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#F8FAFC',
                borderRadius: 2,
                border: '2px solid #E2E8F0',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: '#EDF2F7',
                  borderColor: '#6366F1',
                },
                '&.Mui-focused': {
                  backgroundColor: '#EDF2F7',
                  borderColor: '#6366F1',
                  boxShadow: '0 0 0 3px rgba(91, 127, 255, 0.1)',
                },
                '& fieldset': {
                  border: 'none',
                },
              },
            }}
          />
          <List>
            {searchResults.map((user) => (
              <ListItem key={user.id} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleCreateConversation(user.id)}
                  sx={{
                    py: 2,
                    px: 2,
                    borderRadius: 2,
                    border: '2px solid transparent',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(91, 127, 255, 0.1) 0%, rgba(255, 107, 157, 0.1) 100%)',
                      borderColor: '#6366F1',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      variant="dot"
                      sx={{
                        '& .MuiBadge-badge': {
                          backgroundColor: onlineUsers.has(user.id) ? '#44b700' : '#999',
                          color: onlineUsers.has(user.id) ? '#44b700' : '#999',
                          boxShadow: `0 0 0 3px white`,
                          width: 14,
                          height: 14,
                        },
                      }}
                    >
                      <Avatar
                        src={user.avatar || null}
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingUserId(user.id);
                          setShowUserProfile(true);
                        }}
                        sx={{
                          width: 48,
                          height: 48,
                          background: user.avatar ? 'transparent' : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                          fontWeight: 700,
                          fontSize: '1.2rem',
                          boxShadow: '0 3px 10px rgba(240, 147, 251, 0.3)',
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'scale(1.1)',
                          },
                        }}
                      >
                        {!user.avatar && (user.fullName?.charAt(0) || user.username?.charAt(0))}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '1rem', color: '#0F172A' }}>
                          {user.fullName || user.username}
                        </Typography>
                        {onlineUsers.has(user.id) && (
                          <CircleIcon sx={{ fontSize: 10, color: '#44b700' }} />
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748B' }}>
                        {user.email}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 2, borderTop: '2px solid #E2E8F0' }}>
          <Button
            onClick={() => setOpenNewChat(false)}
            sx={{
              color: '#64748B',
              fontWeight: 700,
              fontSize: '0.95rem',
              py: 1.5,
              px: 4,
              border: '2px solid #E2E8F0',
              borderRadius: 2,
              '&:hover': {
                borderColor: '#6366F1',
                background: 'rgba(91, 127, 255, 0.05)',
              },
            }}
          >
            Hủy
          </Button>
        </DialogActions>
      </Dialog>

      <CreateGroupDialog
        open={openCreateGroup}
        onClose={() => setOpenCreateGroup(false)}
        onGroupCreated={handleGroupCreated}
      />

      <UserProfileDialog
        open={showUserProfile}
        onClose={() => {
          setShowUserProfile(false);
          setViewingUserId(null);
        }}
        userId={viewingUserId}
        onStartChat={(conversation) => {
          onSelectConversation(conversation);
          loadConversations();
        }}
      />
    </Box>
  );
};

export default ConversationList;
