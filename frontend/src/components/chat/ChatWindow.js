import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Paper,
  List,
  ListItem,
  Avatar,
  Menu,
  MenuItem,
  Drawer,
  Divider,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import GroupIcon from '@mui/icons-material/Group';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ImageIcon from '@mui/icons-material/Image';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import ReplyIcon from '@mui/icons-material/Reply';
import ForumIcon from '@mui/icons-material/Forum';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SettingsIcon from '@mui/icons-material/Settings';
import PushPinIcon from '@mui/icons-material/PushPin';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import { chatService } from '../../api/chatService';
import { userService } from '../../api/userService';
import socketService from '../../services/socketService';
import { useAuth } from '../../context/AuthContext';
import { SOCKET_EVENTS } from '../../constants/socketEvents';
import { format } from 'date-fns';
import GroupMembersDialog from './GroupMembersDialog';
import UserProfileDialog from './UserProfileDialog';

const ChatWindow = ({ conversation }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showMembers, setShowMembers] = useState(false);
  const [viewingUserId, setViewingUserId] = useState(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [threadMessages, setThreadMessages] = useState([]);
  const [threadSenders, setThreadSenders] = useState({});
  const [messageSenders, setMessageSenders] = useState({});
  const [showThreads, setShowThreads] = useState(false);
  const [creatingThread, setCreatingThread] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isAdminOnlyChat, setIsAdminOnlyChat] = useState(false);
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [updatingSettings, setUpdatingSettings] = useState(false);
  const [showCreateThreadDialog, setShowCreateThreadDialog] = useState(false);
  const [threadTitle, setThreadTitle] = useState('');
  const [threadMessageId, setThreadMessageId] = useState(null);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const { user } = useAuth();
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        const target = event.target;
        if (!target.closest('button') || !target.closest('button[aria-label]')) {
          setShowEmojiPicker(false);
        }
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showEmojiPicker]);

  useEffect(() => {
    if (conversation) {
      if (conversation.threadId) {
        loadThreadMessages(conversation.threadId, conversation.id);
        setSelectedThread({ id: conversation.threadId });
      } else {
        loadMessages();
        loadPinnedMessages();
        if (conversation.type === 'group') {
          loadThreads();
        }
      }
      socketService.joinConversation(conversation.id);

      chatService.markAsRead(conversation.id).catch(err => {
        console.error('Failed to mark as read:', err);
      });

      if (conversation.type === 'private' && conversation.participants) {
        const otherParticipant = conversation.participants.find(p => p.userId !== user.id);
        if (otherParticipant) {
          userService.getUserById(otherParticipant.userId)
            .then(data => setOtherUser(data.user))
            .catch(error => console.error('Failed to load other user:', error));
        }
      } else {
        setOtherUser(null);
      }

      if (conversation.type === 'group' && conversation.participants) {
        const currentParticipant = conversation.participants.find(p => p.userId === user.id);
        if (currentParticipant) {
          setUserRole(currentParticipant.role);
        } else {
          chatService.getMembers(conversation.id)
            .then(data => {
              const member = data.members?.find(m => m.userId === user.id);
              if (member) {
                setUserRole(member.role);
              }
            })
            .catch(error => console.error('Failed to load user role:', error));
        }
      } else {
        setUserRole(null);
      }

      if (conversation.type === 'group') {
        setIsAdminOnlyChat(conversation.adminOnlyChat || false);
      } else {
        setIsAdminOnlyChat(false);
      }

      socketService.onNewMessage(async (data) => {
        if (data.message.conversationId === conversation.id) {
          if (data.message.sender) {
            setMessageSenders(prev => ({
              ...prev,
              [data.message.senderId]: data.message.sender
            }));
            setThreadSenders(prev => ({
              ...prev,
              [data.message.senderId]: data.message.sender
            }));
          } else if (data.message.senderId) {
            try {
              const userData = await userService.getUserById(data.message.senderId);
              setMessageSenders(prev => ({
                ...prev,
                [data.message.senderId]: userData.user
              }));
              setThreadSenders(prev => ({
                ...prev,
                [data.message.senderId]: userData.user
              }));
            } catch (error) {
              console.error(`Failed to load sender ${data.message.senderId}:`, error);
            }
          }
          
          if (conversation.threadId && data.message.threadId === conversation.threadId) {
            setMessages((prev) => [...prev, data.message]);
            setThreadMessages((prev) => [...prev, data.message]);
          } else if (!conversation.threadId && !data.message.threadId) {
            setMessages((prev) => [...prev, data.message]);
          }
          
          if (data.message.threadId && (!conversation.threadId || data.message.threadId !== conversation.threadId)) {
            setThreads((prev) => prev.map(thread => {
              if (thread.id === data.message.threadId && data.message.senderId !== user.id) {
                return { ...thread, unreadCount: (thread.unreadCount || 0) + 1 };
              }
              return thread;
            }));
          }
          
          if (data.message.senderId !== user.id && (!data.message.threadId || (conversation.threadId && data.message.threadId === conversation.threadId))) {
            chatService.markAsRead(conversation.id).catch(err => {
              console.error('Failed to mark as read:', err);
            });
          }
        }
      });

      socketService.onUserTyping((data) => {
        if (data.userId !== user.id) {
          setTyping(data.isTyping);
        }
      });

      const handleThreadCreated = (data) => {
        if (data.thread && data.thread.conversationId === conversation.id) {
          setThreads((prev) => {
            if (prev.some(t => t.id === data.thread.id)) {
              return prev;
            }
            return [data.thread, ...prev];
          });
        }
      };

      if (socketService.socket) {
        socketService.socket.on(SOCKET_EVENTS.THREAD_CREATED, handleThreadCreated);
      }

      return () => {
        if (socketService.socket) {
          socketService.socket.off(SOCKET_EVENTS.THREAD_CREATED, handleThreadCreated);
        }
        socketService.removeAllListeners();
      };
    }
  }, [conversation, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const data = await chatService.getMessages(conversation.id);
      const mainMessages = (data.messages || []).filter(msg => !msg.threadId);
      setMessages(mainMessages);
      
      const senders = {};
      const senderIdsToLoad = new Set();
      
      if (data.messages) {
        for (const msg of data.messages) {
          if (msg.sender && msg.senderId) {
            senders[msg.senderId] = msg.sender;
          } else if (msg.senderId) {
            senderIdsToLoad.add(msg.senderId);
          }
        }
        
        if (senderIdsToLoad.size > 0) {
          const loadPromises = Array.from(senderIdsToLoad).map(async (senderId) => {
            try {
              const userData = await userService.getUserById(senderId);
              senders[senderId] = userData.user;
            } catch (error) {
              console.error(`Failed to load sender ${senderId}:`, error);
              senders[senderId] = { id: senderId, username: 'Unknown', fullName: 'Unknown User' };
            }
          });
          await Promise.all(loadPromises);
        }
        
        if (user) {
          senders[user.id] = user;
        }
        
        setMessageSenders(senders);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const loadThreads = async () => {
    if (!conversation || conversation.type !== 'group') return;
    try {
      const data = await chatService.getThreads(conversation.id);
      setThreads(data.threads || []);
    } catch (error) {
      console.error('Failed to load threads:', error);
    }
  };

  const loadThreadMessages = async (threadId, conversationId) => {
    try {
      const data = await chatService.getThreadMessages(conversationId, threadId);
      const threadMsgs = data.messages || [];
      
      setThreadMessages(threadMsgs);
      setMessages(threadMsgs);
      
      const senders = {};
      const senderIdsToLoad = new Set();
      
      if (threadMsgs.length > 0) {
        for (const msg of threadMsgs) {
          if (msg.sender && msg.senderId) {
            senders[msg.senderId] = msg.sender;
          } else if (msg.senderId) {
            senderIdsToLoad.add(msg.senderId);
          }
        }
        
        if (senderIdsToLoad.size > 0) {
          const loadPromises = Array.from(senderIdsToLoad).map(async (senderId) => {
            try {
              const userData = await userService.getUserById(senderId);
              senders[senderId] = userData.user;
            } catch (error) {
              console.error(`Failed to load sender ${senderId}:`, error);
              senders[senderId] = { id: senderId, username: 'Unknown', fullName: 'Unknown User' };
            }
          });
          await Promise.all(loadPromises);
        }
        
        if (user) {
          senders[user.id] = user;
        }
        
        setThreadSenders(senders);
        setMessageSenders(senders);
      }
    } catch (error) {
      console.error('Failed to load thread messages:', error);
    }
  };

  const handleCreateThreadClick = (messageId) => {
    setThreadMessageId(messageId);
    setThreadTitle('');
    setShowCreateThreadDialog(true);
  };

  const handleCreateThread = async () => {
    if (!conversation || conversation.type !== 'group' || !threadMessageId) return;

    try {
      await chatService.createThread(conversation.id, threadMessageId, threadTitle.trim() || null);
      setShowCreateThreadDialog(false);
      setThreadTitle('');
      setThreadMessageId(null);
    } catch (error) {
      console.error('Failed to create thread:', error);
      alert(error.response?.data?.message || 'Không thể tạo thread');
    }
  };

  const handleSelectThread = async (thread) => {
    setSelectedThread(thread);
    await loadThreadMessages(thread.id, conversation.id);
    setThreads((prev) => prev.map(t => 
      t.id === thread.id ? { ...t, unreadCount: 0 } : t
    ));
    chatService.markAsRead(conversation.id).catch(err => {
      console.error('Failed to mark as read:', err);
    });
    await loadThreads();
  };

  const loadPinnedMessages = async () => {
    try {
      const data = await chatService.getPinnedMessages(conversation.id);
      setPinnedMessages(data.pinnedMessages || []);
    } catch (error) {
      console.error('Failed to load pinned messages:', error);
    }
  };

  const handlePinMessage = async (messageId) => {
    try {
      await chatService.pinMessage(conversation.id, messageId);
      await loadPinnedMessages();
      alert('Đã ghim tin nhắn thành công!');
    } catch (error) {
      console.error('Failed to pin message:', error);
      alert('Không thể ghim tin nhắn');
    }
  };

  const handleUnpinMessage = async (messageId) => {
    try {
      await chatService.unpinMessage(conversation.id, messageId);
      await loadPinnedMessages();
    } catch (error) {
      console.error('Failed to unpin message:', error);
      alert('Không thể bỏ ghim tin nhắn');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !previewFile && !locationData) return;

    if (conversation.type === 'group' && !conversation.threadId && isAdminOnlyChat && userRole !== 'admin') {
      alert('Chỉ admin mới có quyền gửi tin nhắn trong nhóm này');
      return;
    }

    let messageContent = newMessage;
    let messageType = 'text';
    let fileUrl = null;

    if (previewFile) {
      try {
        setUploading(true);
        const uploadResult = await chatService.uploadFile(previewFile.file);
        fileUrl = uploadResult.file.url;
        messageType = uploadResult.file.type;
        messageContent = uploadResult.file.originalName || previewFile.file.name || 'Đã gửi file';
        setPreviewFile(null);
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Không thể upload file');
        setUploading(false);
        return;
      }
    }

    if (locationData) {
      messageType = 'location';
      messageContent = JSON.stringify({
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        address: locationData.address || ''
      });
      setLocationData(null);
    }

    const replyToId = replyingTo ? replyingTo.id : null;
    const threadId = conversation.threadId || (selectedThread ? selectedThread.id : null);
    
    setNewMessage('');
    setReplyingTo(null);
    setUploading(false);

    try {
      socketService.sendMessage(conversation.id, messageContent, messageType, fileUrl, replyToId, threadId);
      socketService.sendTyping(conversation.id, false);
      
      if (threadId) {
        await loadThreadMessages(threadId, conversation.id);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewFile({
        file: file,
        url: URL.createObjectURL(file),
        type: file.type.startsWith('image/') ? 'image' : 'file'
      });
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setPreviewFile({
        file: file,
        url: URL.createObjectURL(file),
        type: 'image'
      });
    }
  };

  const handleDownloadFile = async (fileUrl, filename) => {
    try {
      let downloadFilename = filename;
      
      if (!downloadFilename.includes('.')) {
        const urlMatch = fileUrl.match(/\.([a-zA-Z0-9]+)(\?|$)/);
        if (urlMatch) {
          downloadFilename = `${downloadFilename}.${urlMatch[1]}`;
        } else {
          const contentType = await fetch(fileUrl, { method: 'HEAD' })
            .then(res => res.headers.get('content-type'))
            .catch(() => null);
          
          if (contentType) {
            const extensionMap = {
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
              'application/vnd.ms-excel': 'xls',
              'application/pdf': 'pdf',
              'application/msword': 'doc',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
              'text/plain': 'txt',
              'application/zip': 'zip'
            };
            const ext = extensionMap[contentType];
            if (ext) {
              downloadFilename = `${downloadFilename}.${ext}`;
            }
          }
        }
      }

      const apiUrl = process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:8000';
      const downloadUrl = `${apiUrl}/api/chat/download?fileUrl=${encodeURIComponent(fileUrl)}&filename=${encodeURIComponent(downloadFilename)}`;
      
      const token = localStorage.getItem('token');
      
      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = downloadFilename;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download error:', error);
      window.open(fileUrl, '_blank');
    }
  };

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          let address = '';
          try {
            const response = await fetch(
              `https:
            );
            const data = await response.json();
            address = data.display_name || '';
          } catch (error) {
            console.error('Geocoding error:', error);
          }
          
          setLocationData({ latitude, longitude, address });
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Không thể lấy vị trí. Vui lòng cho phép truy cập vị trí.');
        }
      );
    } else {
      alert('Trình duyệt không hỗ trợ lấy vị trí');
    }
  };

  const removePreview = () => {
    if (previewFile?.url) {
      URL.revokeObjectURL(previewFile.url);
    }
    setPreviewFile(null);
    setLocationData(null);
  };

  const handleTyping = () => {
    socketService.sendTyping(conversation.id, true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socketService.sendTyping(conversation.id, false);
    }, 1000);
  };

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleViewMembers = () => {
    setShowMembers(true);
    handleCloseMenu();
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm('Bạn có chắc muốn rời khỏi nhóm này?')) return;

    try {
      await chatService.leaveGroup(conversation.id);
      handleCloseMenu();
      window.location.reload();
    } catch (error) {
      console.error('Failed to leave group:', error);
      alert('Không thể rời nhóm');
    }
  };

  const handleOpenGroupSettings = () => {
    setShowGroupSettings(true);
    handleCloseMenu();
  };

  const handleToggleAdminOnlyChat = async (event) => {
    const newValue = event.target.checked;
    if (userRole !== 'admin') {
      alert('Chỉ admin mới có quyền thay đổi cài đặt này');
      return;
    }

    setUpdatingSettings(true);
    try {
      await chatService.updateGroupInfo(
        conversation.id,
        conversation.name,
        conversation.description,
        conversation.avatar,
        newValue
      );
      setIsAdminOnlyChat(newValue);
      conversation.adminOnlyChat = newValue;
      alert('Đã cập nhật cài đặt thành công!');
    } catch (error) {
      console.error('Failed to update group settings:', error);
      alert('Không thể cập nhật cài đặt');
    } finally {
      setUpdatingSettings(false);
    }
  };

  const handleAvatarClick = (senderId) => {
    if (senderId === user.id) return;
    setViewingUserId(senderId);
    setShowUserProfile(true);
  };

  const handleStartChatFromProfile = (conversation) => {
    setShowUserProfile(false);
  };

  if (!conversation) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(91, 127, 255, 0.1) 0%, rgba(255, 107, 157, 0.1) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SendIcon sx={{ fontSize: 40, color: '#6366F1', opacity: 0.5 }} />
        </Box>
        <Typography variant="h6" sx={{ color: '#64748B', fontWeight: 500 }}>
          Chọn một cuộc trò chuyện để bắt đầu
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      <Box
        sx={{
          p: 2.5,
          borderBottom: '3px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'white',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={conversation.type === 'group' ? null : (otherUser?.avatar ? `${otherUser.avatar}?t=${Date.now()}` : null)}
            onClick={() => {
              if (conversation.type === 'direct' && conversation.otherUserId) {
                handleAvatarClick(conversation.otherUserId);
              }
            }}
            sx={{
              width: 56,
              height: 56,
              background: conversation.type === 'group'
                ? 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)'
                : (otherUser?.avatar ? 'transparent' : 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)'),
              fontWeight: 700,
              fontSize: '1.4rem',
              boxShadow: '0 4px 12px rgba(91, 127, 255, 0.25)',
              cursor: conversation.type === 'direct' && conversation.otherUserId ? 'pointer' : 'default',
              transition: 'transform 0.2s',
              '&:hover': conversation.type === 'direct' && conversation.otherUserId ? {
                transform: 'scale(1.05)',
              } : {},
            }}
          >
            {conversation.type === 'group' 
              ? <GroupIcon sx={{ fontSize: '1.8rem' }} /> 
              : (!otherUser?.avatar && ((otherUser?.fullName || otherUser?.username || conversation.name)?.charAt(0) || 'U'))
            }
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.15rem' }}>
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
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                onClick={() => setShowThreads(true)}
                sx={{
                  width: 44,
                  height: 44,
                  background: '#F8FAFC',
                  border: '2px solid #E2E8F0',
                  '&:hover': {
                    background: '#EDF2F7',
                    borderColor: '#6366F1',
                  },
                }}
                title="Threads"
              >
                <ForumIcon sx={{ fontSize: '1.3rem' }} />
              </IconButton>
              <IconButton
                onClick={handleOpenMenu}
                sx={{
                  width: 44,
                  height: 44,
                  background: '#F8FAFC',
                  border: '2px solid #E2E8F0',
                  '&:hover': {
                    background: '#EDF2F7',
                    borderColor: '#6366F1',
                  },
                }}
              >
                <MoreVertIcon sx={{ fontSize: '1.3rem' }} />
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

      
      <Box sx={{ position: 'relative', flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {conversation.type === 'group' && isAdminOnlyChat && userRole !== 'admin' && (
          <Box sx={{ 
            position: 'sticky',
            top: 0,
            zIndex: 10,
            px: 2,
            py: 1,
            background: 'linear-gradient(135deg, #FFF3CD 0%, #FFE69C 100%)',
            textAlign: 'center',
            borderBottom: '1px solid #FFC107',
            boxShadow: '0 1px 4px rgba(255, 193, 7, 0.2)'
          }}>
            <Typography variant="caption" sx={{ color: '#856404', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, fontSize: '0.75rem' }}>
              <span>⚠️</span>
              Chỉ admin mới có quyền gửi tin nhắn
            </Typography>
          </Box>
        )}
        
        {pinnedMessages.length > 0 && (
          <Box sx={{ 
            px: 2,
            py: 1,
            borderBottom: '1px solid #E2E8F0',
            background: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Button
              onClick={() => setShowPinnedMessages(true)}
              startIcon={<PushPinIcon sx={{ color: '#FFC107', fontSize: '1rem' }} />}
              sx={{
                color: '#475569',
                fontWeight: 600,
                fontSize: '0.875rem',
                textTransform: 'none',
                '&:hover': {
                  background: 'rgba(255, 193, 7, 0.1)'
                }
              }}
            >
              Tin nhắn đã ghim ({pinnedMessages.length})
            </Button>
          </Box>
        )}
        <List sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
        {messages.map((message) => {
          const isPinned = pinnedMessages.some(pm => pm.messageId === message.id);
          return (
          <ListItem
            key={message.id}
            data-message-id={message.id}
            sx={{
              display: 'flex',
              justifyContent: message.senderId === user.id ? 'flex-end' : 'flex-start',
              mb: 2,
              position: 'relative',
              '&:hover .message-actions': {
                opacity: 1
              }
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: message.senderId === user.id ? 'row-reverse' : 'row',
                alignItems: 'flex-end',
                gap: 1.5,
                maxWidth: '70%',
              }}
            >
              {message.senderId === user.id ? (
                <>
                  
                  <Avatar
                    src={user?.avatar ? `${user.avatar}?t=${Date.now()}` : null}
                    onClick={() => handleAvatarClick(message.senderId)}
                    sx={{
                      width: 42,
                      height: 42,
                      background: user?.avatar ? 'transparent' : 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
                      fontWeight: 700,
                      boxShadow: '0 3px 10px rgba(91, 127, 255, 0.2)',
                      cursor: 'default',
                      transition: 'transform 0.2s',
                    }}
                  >
                    {!user?.avatar && (user?.fullName?.charAt(0) || user?.username?.charAt(0))}
                  </Avatar>
                  <Paper
                elevation={0}
                sx={{
                  py: 2,
                  px: 2.5,
                  borderRadius: 3,
                  background: message.senderId === user.id
                    ? 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)'
                    : 'white',
                  color: message.senderId === user.id ? 'white' : '#0F172A',
                  border: isPinned 
                    ? '2px solid #FFC107'
                    : message.senderId === user.id
                    ? 'none'
                    : '2px solid #E2E8F0',
                  boxShadow: message.senderId === user.id
                    ? '0 4px 12px rgba(91, 127, 255, 0.25)'
                    : '0 2px 8px rgba(0, 0, 0, 0.05)',
                  maxWidth: '100%',
                  position: 'relative'
                }}
              >
                {isPinned && (
                  <PushPinIcon sx={{ 
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    color: '#FFC107',
                    fontSize: '1rem'
                  }} />
                )}
                
                {message.replyTo && (
                  <Box
                    sx={{
                      mb: 1,
                      p: 1.5,
                      borderRadius: 2,
                      borderLeft: '3px solid',
                      borderColor: message.senderId === user.id ? 'rgba(255,255,255,0.5)' : '#6366F1',
                      background: message.senderId === user.id ? 'rgba(255,255,255,0.1)' : 'rgba(99, 102, 241, 0.1)',
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        opacity: 0.8,
                        mb: 0.5,
                        display: 'block'
                      }}
                    >
                      {message.replyTo.senderId === user.id ? 'Bạn' : 'Người khác'}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '0.85rem',
                        opacity: 0.9,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {message.replyTo.type === 'image' ? '📷 Hình ảnh' : 
                       message.replyTo.type === 'file' ? `📎 ${message.replyTo.content}` :
                       message.replyTo.content}
                    </Typography>
                  </Box>
                )}

                
                {message.type === 'image' && message.fileUrl && (
                  <Box sx={{ mb: 1.5, borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
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
                      onClick={() => handleDownloadFile(message.fileUrl, message.content || 'image.jpg')}
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        background: 'rgba(0, 0, 0, 0.5)',
                        color: 'white',
                        '&:hover': {
                          background: 'rgba(0, 0, 0, 0.7)',
                        }
                      }}
                      title="Tải xuống"
                    >
                      <DownloadIcon sx={{ fontSize: '1rem' }} />
                    </IconButton>
                  </Box>
                )}

                
                {message.type === 'file' && message.fileUrl && (
                  <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachFileIcon sx={{ fontSize: '1.2rem' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, wordBreak: 'break-word' }}>
                      {message.content}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleDownloadFile(message.fileUrl, message.content)}
                      sx={{ ml: 'auto' }}
                      title="Tải xuống"
                    >
                      <DownloadIcon sx={{ fontSize: '1rem' }} />
                    </IconButton>
                  </Box>
                )}

                
                {message.type === 'location' && (
                  <Box sx={{ mb: 1.5 }}>
                    {(() => {
                      try {
                        const location = JSON.parse(message.content);
                        const googleMapUrl = `https:
                        const osmMapUrl = `https:
                        
                        return (
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <LocationOnIcon sx={{ fontSize: '1.2rem', color: message.senderId === user.id ? 'white' : '#EF4444' }} />
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                Vị trí
                              </Typography>
                            </Box>
                            {location.address && (
                              <Typography variant="caption" sx={{ display: 'block', mb: 1, opacity: 0.8 }}>
                                {location.address}
                              </Typography>
                            )}
                            <Box
                              component="a"
                              href={googleMapUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{
                                display: 'block',
                                width: '100%',
                                minHeight: '150px',
                                height: '150px',
                                borderRadius: 1,
                                cursor: 'pointer',
                                border: message.senderId === user.id 
                                  ? '2px solid rgba(255,255,255,0.3)' 
                                  : '2px solid #E2E8F0',
                                backgroundColor: '#E2E8F0',
                                position: 'relative',
                                overflow: 'hidden',
                                textDecoration: 'none',
                                '&:hover': {
                                  opacity: 0.9
                                }
                              }}
                            >
                              
                              <iframe
                                width="100%"
                                height="100%"
                                style={{
                                  border: 0,
                                  borderRadius: '4px',
                                  pointerEvents: 'none'
                                }}
                                loading="lazy"
                                src={`https:
                                title="Location Map"
                              />
                              
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  display: 'flex',
                                  alignItems: 'flex-end',
                                  justifyContent: 'center',
                                  padding: 1,
                                  background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)',
                                  pointerEvents: 'none'
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    background: 'rgba(0, 0, 0, 0.7)',
                                    color: 'white',
                                    padding: '4px 12px',
                                    borderRadius: 1,
                                    fontSize: '0.75rem',
                                    fontWeight: 600
                                  }}
                                >
                                  Click để mở trên Google Maps
                                </Typography>
                              </Box>
                            </Box>
                            <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.7, fontSize: '0.7rem' }}>
                              {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                            </Typography>
                          </Box>
                        );
                      } catch (e) {
                        console.error('Error parsing location:', e, message.content);
                        return (
                          <Box>
                            <LocationOnIcon sx={{ fontSize: '1.2rem', mr: 1 }} />
                            <Typography variant="body2">
                              {message.content}
                            </Typography>
                          </Box>
                        );
                      }
                    })()}
                  </Box>
                )}

                
                {message.type === 'text' && (
                  <Typography variant="body1" sx={{
                    mb: 0.5,
                    fontSize: '1rem',
                    fontWeight: 500,
                    lineHeight: 1.5,
                  }}>
                    {message.content}
                  </Typography>
                )}

                
                <Typography variant="caption" sx={{
                  opacity: 0.8,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  mt: 1,
                  display: 'block'
                }}>
                  {format(new Date(message.createdAt), 'HH:mm')}
                </Typography>
                  </Paper>
                  
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
                    {conversation.type === 'group' && (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateThreadClick(message.id);
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
                        const isPinnedMsg = pinnedMessages.some(pm => pm.messageId === message.id);
                        if (isPinnedMsg) {
                          handleUnpinMessage(message.id);
                        } else {
                          handlePinMessage(message.id);
                        }
                      }}
                      sx={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                        width: 32,
                        height: 32,
                        color: pinnedMessages.some(pm => pm.messageId === message.id) ? '#FFC107' : '#64748B',
                        '&:hover': {
                          background: 'white',
                          transform: 'scale(1.1)'
                        }
                      }}
                      title={pinnedMessages.some(pm => pm.messageId === message.id) ? "Bỏ ghim" : "Ghim tin nhắn"}
                    >
                      <PushPinIcon sx={{ 
                        fontSize: '1rem',
                        transform: pinnedMessages.some(pm => pm.messageId === message.id) ? 'rotate(45deg)' : 'none',
                        transition: 'transform 0.2s'
                      }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReplyingTo(message);
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
                </>
              ) : (
                <>
                  
                  <Avatar
                    src={messageSenders[message.senderId]?.avatar ? `${messageSenders[message.senderId].avatar}?t=${Date.now()}` : null}
                    onClick={() => handleAvatarClick(message.senderId)}
                    sx={{
                      width: 42,
                      height: 42,
                      background: messageSenders[message.senderId]?.avatar ? 'transparent' : 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)',
                      fontWeight: 700,
                      boxShadow: '0 3px 10px rgba(91, 127, 255, 0.2)',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.1)',
                      },
                    }}
                  >
                    {!messageSenders[message.senderId]?.avatar && ((messageSenders[message.senderId]?.fullName || messageSenders[message.senderId]?.username)?.charAt(0) || 'U')}
                  </Avatar>
                  <Paper
                    elevation={0}
                    sx={{
                      py: 2,
                      px: 2.5,
                      borderRadius: 3,
                      background: 'white',
                      color: '#0F172A',
                      border: isPinned 
                        ? '2px solid #FFC107'
                        : '2px solid #E2E8F0',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                      maxWidth: '100%',
                      position: 'relative'
                    }}
                  >
                    {isPinned && (
                      <PushPinIcon sx={{ 
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: '#FFC107',
                        fontSize: '1rem'
                      }} />
                    )}
                    
                    {message.replyTo && (
                      <Box
                        sx={{
                          mb: 1,
                          p: 1.5,
                          borderRadius: 2,
                          borderLeft: '3px solid #6366F1',
                          background: 'rgba(99, 102, 241, 0.1)',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 600,
                            opacity: 0.8,
                            mb: 0.5,
                            display: 'block'
                          }}
                        >
                          {message.replyTo.senderId === user.id ? 'Bạn' : 'Người khác'}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: '0.85rem',
                            opacity: 0.9,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {message.replyTo.type === 'image' ? '📷 Hình ảnh' : 
                           message.replyTo.type === 'file' ? `📎 ${message.replyTo.content}` :
                           message.replyTo.content}
                        </Typography>
                      </Box>
                    )}

                    
                    {message.type === 'image' && message.fileUrl && (
                      <Box sx={{ mb: 1.5, borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
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
                          onClick={() => handleDownloadFile(message.fileUrl, message.content || 'image.jpg')}
                          sx={{
                            position: 'absolute',
                            bottom: 8,
                            right: 8,
                            background: 'rgba(0, 0, 0, 0.5)',
                            color: 'white',
                            '&:hover': {
                              background: 'rgba(0, 0, 0, 0.7)',
                            }
                          }}
                          title="Tải xuống"
                        >
                          <DownloadIcon sx={{ fontSize: '1rem' }} />
                        </IconButton>
                      </Box>
                    )}

                    
                    {message.type === 'file' && message.fileUrl && (
                      <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachFileIcon sx={{ fontSize: '1.2rem' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, wordBreak: 'break-word' }}>
                          {message.content}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleDownloadFile(message.fileUrl, message.content)}
                          sx={{ ml: 'auto' }}
                          title="Tải xuống"
                        >
                          <DownloadIcon sx={{ fontSize: '1rem' }} />
                        </IconButton>
                      </Box>
                    )}

                    
                    {message.type === 'location' && (
                      <Box sx={{ mb: 1.5 }}>
                        {(() => {
                          try {
                            const location = JSON.parse(message.content);
                            const googleMapUrl = `https:
                            return (
                              <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                  <LocationOnIcon sx={{ fontSize: '1.2rem', color: '#EF4444' }} />
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    Vị trí
                                  </Typography>
                                </Box>
                                {location.address && (
                                  <Typography variant="caption" sx={{ display: 'block', mb: 1, opacity: 0.8 }}>
                                    {location.address}
                                  </Typography>
                                )}
                                <Box
                                  component="a"
                                  href={googleMapUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  sx={{
                                    display: 'block',
                                    width: '100%',
                                    minHeight: '150px',
                                    height: '150px',
                                    borderRadius: 1,
                                    cursor: 'pointer',
                                    border: '2px solid #E2E8F0',
                                    backgroundColor: '#E2E8F0',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    textDecoration: 'none',
                                    '&:hover': {
                                      opacity: 0.9
                                    }
                                  }}
                                >
                                  <iframe
                                    width="100%"
                                    height="100%"
                                    style={{
                                      border: 0,
                                      borderRadius: '4px',
                                      pointerEvents: 'none'
                                    }}
                                    loading="lazy"
                                    src={`https:
                                    title="Location Map"
                                  />
                                </Box>
                                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.7, fontSize: '0.7rem' }}>
                                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                                </Typography>
                              </Box>
                            );
                          } catch (e) {
                            console.error('Error parsing location:', e, message.content);
                            return (
                              <Box>
                                <LocationOnIcon sx={{ fontSize: '1.2rem', mr: 1 }} />
                                <Typography variant="body2">
                                  {message.content}
                                </Typography>
                              </Box>
                            );
                          }
                        })()}
                      </Box>
                    )}

                    
                    {message.type === 'text' && (
                      <Typography variant="body1" sx={{
                        mb: 0.5,
                        fontSize: '1rem',
                        fontWeight: 500,
                        lineHeight: 1.5,
                      }}>
                        {message.content}
                      </Typography>
                    )}

                    
                    <Typography variant="caption" sx={{
                      opacity: 0.8,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      mt: 1,
                      display: 'block'
                    }}>
                      {format(new Date(message.createdAt), 'HH:mm')}
                    </Typography>
                  </Paper>
                  
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
                    {conversation.type === 'group' && (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateThreadClick(message.id);
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
                        const isPinnedMsg = pinnedMessages.some(pm => pm.messageId === message.id);
                        if (isPinnedMsg) {
                          handleUnpinMessage(message.id);
                        } else {
                          handlePinMessage(message.id);
                        }
                      }}
                      sx={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                        width: 32,
                        height: 32,
                        color: pinnedMessages.some(pm => pm.messageId === message.id) ? '#FFC107' : '#64748B',
                        '&:hover': {
                          background: 'white',
                          transform: 'scale(1.1)'
                        }
                      }}
                      title={pinnedMessages.some(pm => pm.messageId === message.id) ? "Bỏ ghim" : "Ghim tin nhắn"}
                    >
                      <PushPinIcon sx={{ 
                        fontSize: '1rem',
                        transform: pinnedMessages.some(pm => pm.messageId === message.id) ? 'rotate(45deg)' : 'none',
                        transition: 'transform 0.2s'
                      }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReplyingTo(message);
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
                </>
              )}
            </Box>
          </ListItem>
          );
        })}
        <div ref={messagesEndRef} />
      </List>
      </Box>

      
      {replyingTo && (
        <Box sx={{ p: 2, borderTop: '1px solid #E2E8F0', background: '#F8FAFC' }}>
          <Box sx={{
            p: 1.5,
            borderRadius: 2,
            borderLeft: '3px solid #6366F1',
            background: 'white',
            position: 'relative'
          }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#6366F1', display: 'block', mb: 0.5 }}>
              Đang trả lời
            </Typography>
            <Typography variant="body2" sx={{
              fontSize: '0.85rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: '#64748B'
            }}>
              {replyingTo.type === 'image' ? '📷 Hình ảnh' : 
               replyingTo.type === 'file' ? `📎 ${replyingTo.content}` :
               replyingTo.content}
            </Typography>
            <IconButton
              size="small"
              onClick={() => setReplyingTo(null)}
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                '&:hover': { background: '#F8FAFC' }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      )}

      
      {(previewFile || locationData) && (
        <Box sx={{ p: 2, borderTop: '1px solid #E2E8F0', background: '#F8FAFC' }}>
          {previewFile && (
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              {previewFile.type === 'image' ? (
                <img
                  src={previewFile.url}
                  alt="Preview"
                  style={{
                    maxWidth: '200px',
                    maxHeight: '200px',
                    borderRadius: '8px',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <Box sx={{
                  p: 2,
                  border: '2px dashed #E2E8F0',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <AttachFileIcon />
                  <Typography variant="body2">{previewFile.file.name}</Typography>
                </Box>
              )}
              <IconButton
                size="small"
                onClick={removePreview}
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  background: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  '&:hover': { background: '#F8FAFC' }
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
          {locationData && (
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <Box sx={{
                p: 2,
                border: '2px solid #6366F1',
                borderRadius: 2,
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                minWidth: '200px'
              }}>
                <LocationOnIcon sx={{ color: '#6366F1' }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Vị trí</Typography>
                  {locationData.address && (
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      {locationData.address}
                    </Typography>
                  )}
                </Box>
              </Box>
              <IconButton
                size="small"
                onClick={removePreview}
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  background: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  '&:hover': { background: '#F8FAFC' }
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>
      )}

      
      {!(conversation.type === 'group' && isAdminOnlyChat && userRole !== 'admin') && (
      <Box
        component="form"
        onSubmit={handleSendMessage}
        sx={{
          p: 2,
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          gap: 1,
          background: 'white',
        }}
      >
        
        <Box sx={{ display: 'flex', gap: 0.5, position: 'relative' }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            accept="*/*"
          />
          <input
            type="file"
            ref={imageInputRef}
            onChange={handleImageSelect}
            style={{ display: 'none' }}
            accept="image/*"
          />
          <IconButton
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            sx={{
              color: '#6366F1',
              '&:hover': { background: 'rgba(99, 102, 241, 0.1)' }
            }}
          >
            <EmojiEmotionsIcon />
          </IconButton>
          <IconButton
            onClick={() => imageInputRef.current?.click()}
            sx={{
              color: '#6366F1',
              '&:hover': { background: 'rgba(99, 102, 241, 0.1)' }
            }}
          >
            <ImageIcon />
          </IconButton>
          <IconButton
            onClick={() => fileInputRef.current?.click()}
            sx={{
              color: '#6366F1',
              '&:hover': { background: 'rgba(99, 102, 241, 0.1)' }
            }}
          >
            <AttachFileIcon />
          </IconButton>
          <IconButton
            onClick={handleLocationClick}
            sx={{
              color: '#6366F1',
              '&:hover': { background: 'rgba(99, 102, 241, 0.1)' }
            }}
          >
            <LocationOnIcon />
          </IconButton>
          
          
          {showEmojiPicker && (
            <Paper
              ref={emojiPickerRef}
              elevation={4}
              sx={{
                position: 'absolute',
                bottom: '60px',
                left: 0,
                p: 1.5,
                borderRadius: 3,
                maxWidth: '300px',
                background: 'white',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                zIndex: 1000,
              }}
            >
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 0.5, maxHeight: '250px', overflowY: 'auto' }}>
                {['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '😶‍🌫️', '😱', '😨', '😰', '😥', '😓', '🫣', '🤗', '🫡', '🤔', '🫢', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🫨', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '😵‍💫', '🫥', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'].map((emoji) => (
                  <IconButton
                    key={emoji}
                    onClick={() => {
                      setNewMessage(prev => prev + emoji);
                      setShowEmojiPicker(false);
                    }}
                    sx={{
                      fontSize: '1.5rem',
                      p: 0.5,
                      '&:hover': {
                        background: 'rgba(99, 102, 241, 0.1)',
                        transform: 'scale(1.2)'
                      }
                    }}
                  >
                    {emoji}
                  </IconButton>
                ))}
              </Box>
            </Paper>
          )}
        </Box>

        <TextField
          fullWidth
          placeholder="Nhập tin nhắn..."
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          disabled={uploading || (conversation.type === 'group' && isAdminOnlyChat && userRole !== 'admin')}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
              borderRadius: 3,
              fontSize: '1rem',
              fontWeight: 500,
              padding: '12px 16px',
              border: '2px solid #E2E8F0',
              '&:hover': {
                backgroundColor: '#FAFBFC',
                borderColor: '#6366F1',
              },
              '&.Mui-focused': {
                backgroundColor: '#FAFBFC',
                borderColor: '#6366F1',
                boxShadow: '0 0 0 3px rgba(91, 127, 255, 0.1)',
              },
              '& fieldset': {
                border: 'none',
              },
            },
            '& .MuiInputBase-input': {
              padding: 0,
            },
          }}
        />
        <IconButton
          type="submit"
          sx={{
            width: 52,
            height: 52,
            ml: 1.5,
            background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(91, 127, 255, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #7B9AFF 0%, #FF8BB3 100%)',
              transform: 'scale(1.05)',
              boxShadow: '0 6px 16px rgba(91, 127, 255, 0.4)',
            },
            '&:disabled': {
              background: '#E2E8F0',
              color: '#A0AEC0',
            },
          }}
          disabled={uploading || (!newMessage.trim() && !previewFile && !locationData) || (conversation.type === 'group' && isAdminOnlyChat && userRole !== 'admin')}
        >
          <SendIcon sx={{ fontSize: '1.4rem' }} />
        </IconButton>
      </Box>
      )}

      
      {conversation && conversation.type === 'group' && (
        <Drawer
          anchor="right"
          open={showThreads}
          onClose={() => {
            setShowThreads(false);
            setSelectedThread(null);
            setThreadMessages([]);
          }}
          PaperProps={{
            sx: {
              width: 400,
              background: '#F8FAFC'
            }
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 2 }}>
            {selectedThread && (
              <IconButton
                onClick={() => {
                  setSelectedThread(null);
                  setThreadMessages([]);
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            )}
            <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1 }}>
              {selectedThread ? selectedThread.title || 'Thread' : 'Threads'}
            </Typography>
            <IconButton onClick={() => {
              setShowThreads(false);
              setSelectedThread(null);
              setThreadMessages([]);
            }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {!selectedThread ? (
            <Box sx={{ p: 2 }}>
              {threads.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                  Chưa có thread nào
                </Typography>
              ) : (
                <List>
                  {threads.map((thread) => (
                    <ListItem
                      key={thread.id}
                      button
                      onClick={() => handleSelectThread(thread)}
                      sx={{
                        mb: 1,
                        borderRadius: 2,
                        background: thread.unreadCount > 0 ? '#EDF2F7' : 'white',
                        border: thread.unreadCount > 0 ? '1px solid #6366F1' : '1px solid transparent',
                        '&:hover': {
                          background: '#EDF2F7'
                        }
                      }}
                    >
                      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {thread.title || `Thread #${thread.id}`}
                            </Typography>
                            {thread.unreadCount > 0 && (
                              <Chip
                                label={thread.unreadCount}
                                size="small"
                                sx={{
                                  height: 20,
                                  minWidth: 20,
                                  background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
                                  color: 'white',
                                  fontWeight: 700,
                                  fontSize: '0.7rem'
                                }}
                              />
                            )}
                          </Box>
                          {thread.parentMessage && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              {thread.parentMessage.content.substring(0, 50)}...
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {format(new Date(thread.createdAt), 'dd/MM/yyyy HH:mm')}
                          </Typography>
                        </Box>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          ) : (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                {threadMessages.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                    Chưa có tin nhắn nào trong thread này
                  </Typography>
                ) : (
                  <List>
                    {threadMessages.map((message) => {
                      const sender = message.sender || threadSenders[message.senderId];
                      const senderName = sender?.fullName || sender?.username || 'Unknown';
                      const isOwnMessage = message.senderId === user.id;
                      
                      return (
                        <ListItem
                          key={message.id}
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
                            mb: 2,
                            px: 0
                          }}
                        >
                          {!isOwnMessage && (
                            <Typography variant="caption" sx={{ mb: 0.5, px: 1, color: '#64748B', fontWeight: 600 }}>
                              {senderName}
                            </Typography>
                          )}
                          <Paper
                            sx={{
                              p: 1.5,
                              maxWidth: '80%',
                              background: isOwnMessage
                                ? 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)'
                                : 'white',
                              color: isOwnMessage ? 'white' : 'inherit',
                              borderRadius: 2,
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                            }}
                          >
                            <Typography variant="body2">
                              {message.content}
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.8 }}>
                              {format(new Date(message.createdAt), 'HH:mm, dd/MM/yyyy')}
                            </Typography>
                          </Paper>
                        </ListItem>
                      );
                    })}
                  </List>
                )}
              </Box>
              <Box sx={{ p: 2, borderTop: '1px solid #E2E8F0', background: 'white' }}>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newMessage.trim()) return;
                  const content = newMessage;
                  setNewMessage('');
                  try {
                    socketService.sendMessage(conversation.id, content, 'text', null, null, selectedThread.id);
                    await loadThreadMessages(selectedThread.id);
                  } catch (error) {
                    console.error('Failed to send thread message:', error);
                  }
                }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Nhập tin nhắn trong thread..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    sx={{ mb: 1 }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{
                      background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #7B9AFF 0%, #FF8BB3 100%)'
                      }
                    }}
                  >
                    Gửi
                  </Button>
                </form>
              </Box>
            </Box>
          )}
        </Drawer>
      )}

      
      <Dialog open={showPinnedMessages} onClose={() => setShowPinnedMessages(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.3rem', pb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <PushPinIcon sx={{ color: '#FFC107' }} />
          Tin nhắn đã ghim ({pinnedMessages.length})
        </DialogTitle>
        <DialogContent>
          {pinnedMessages.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Chưa có tin nhắn nào được ghim
            </Typography>
          ) : (
            <List>
              {pinnedMessages.map((pinned) => (
                <ListItem
                  key={pinned.id}
                  button
                  onClick={() => {
                    setShowPinnedMessages(false);
                    const messageElement = document.querySelector(`[data-message-id="${pinned.messageId}"]`);
                    if (messageElement) {
                      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      messageElement.style.background = 'rgba(255, 193, 7, 0.2)';
                      setTimeout(() => {
                        messageElement.style.background = '';
                      }, 2000);
                    }
                  }}
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    border: '1px solid #FFC107',
                    background: 'white',
                    '&:hover': {
                      background: '#FFF9E6'
                    }
                  }}
                >
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PushPinIcon sx={{ color: '#FFC107', fontSize: '1rem' }} />
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                        {format(new Date(pinned.message.createdAt), 'dd/MM/yyyy HH:mm')}
                      </Typography>
                      <Box sx={{ flexGrow: 1 }} />
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnpinMessage(pinned.messageId);
                        }}
                        sx={{ color: '#FFC107' }}
                      >
                        <PushPinIcon sx={{ fontSize: '0.9rem' }} />
                      </IconButton>
                    </Box>
                    <Typography variant="body2">
                      {pinned.message.content}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setShowPinnedMessages(false)}
            sx={{
              color: '#64748B',
              fontWeight: 600,
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      
      <Dialog open={showCreateThreadDialog} onClose={() => {
        setShowCreateThreadDialog(false);
        setThreadTitle('');
        setThreadMessageId(null);
      }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.3rem', pb: 2 }}>
          Tạo Thread mới
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Tiêu đề thread (tùy chọn)"
            value={threadTitle}
            onChange={(e) => setThreadTitle(e.target.value)}
            placeholder="Nhập tiêu đề cho thread..."
            margin="normal"
            variant="outlined"
            autoFocus
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Thread sẽ được tạo từ tin nhắn đã chọn. Bạn có thể thêm tiêu đề để dễ nhận biết.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => {
              setShowCreateThreadDialog(false);
              setThreadTitle('');
              setThreadMessageId(null);
            }}
            sx={{
              color: '#64748B',
              fontWeight: 600,
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleCreateThread}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
              fontWeight: 600,
              px: 4,
            }}
          >
            Tạo Thread
          </Button>
        </DialogActions>
      </Dialog>

      
      <Dialog open={showGroupSettings} onClose={() => setShowGroupSettings(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.3rem', pb: 2 }}>
          Cài đặt nhóm
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isAdminOnlyChat}
                  onChange={handleToggleAdminOnlyChat}
                  disabled={updatingSettings || userRole !== 'admin'}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Chỉ admin mới có quyền chat
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    Khi bật, chỉ admin mới có thể gửi tin nhắn trong nhóm này. Các thành viên khác vẫn có thể xem tin nhắn nhưng không thể gửi.
                  </Typography>
                </Box>
              }
              sx={{ alignItems: 'flex-start' }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setShowGroupSettings(false)}
            sx={{
              color: '#64748B',
              fontWeight: 600,
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      <GroupMembersDialog
        open={showMembers}
        onClose={() => setShowMembers(false)}
        conversation={conversation}
      />

      {viewingUserId && (
        <UserProfileDialog
          open={showUserProfile}
          onClose={() => setShowUserProfile(false)}
          userId={viewingUserId}
          onStartChat={handleStartChatFromProfile}
        />
      )}
    </Box>
  );
};

export default ChatWindow;
