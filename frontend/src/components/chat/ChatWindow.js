import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PushPinIcon from '@mui/icons-material/PushPin';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { chatService } from '../../api/chatService';
import { userService } from '../../api/userService';
import socketService from '../../services/socketService';
import { useChatMessages } from '../../hooks/useChatMessages';
import { useThreads } from '../../hooks/useThreads';
import { usePinnedMessages } from '../../hooks/usePinnedMessages';
import { useFileUpload } from '../../hooks/useFileUpload';
import { useTyping } from '../../hooks/useTyping';
import { ConversationHeader } from './ConversationHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ThreadsDrawer } from './ThreadsDrawer';
import { PinnedMessagesDialog } from './PinnedMessagesDialog';
import { GroupSettingsDialog } from './GroupSettingsDialog';
import { CreateThreadDialog } from './CreateThreadDialog';
import UserProfileDialog from './UserProfileDialog';
import ConfirmDialog from '../common/ConfirmDialog';
import { handleDownloadFile } from '../../utils/messageUtils';

const ChatWindow = ({ conversation, onBack }) => {
  const { user } = useAuth();
  const { showError, showSuccess, showWarning } = useToast();
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isAdminOnlyChat, setIsAdminOnlyChat] = useState(false);
  const [showThreads, setShowThreads] = useState(false);
  const [selectedThread, setSelectedThread] = useState(null);
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [updatingSettings, setUpdatingSettings] = useState(false);
  const [showCreateThreadDialog, setShowCreateThreadDialog] = useState(false);
  const [threadTitle, setThreadTitle] = useState('');
  const [threadMessageId, setThreadMessageId] = useState(null);
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const [viewingUserId, setViewingUserId] = useState(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);

  // Custom hooks
  const { messages, messageSenders, loadMessages, setMessageSenders, loadAllUsers } = useChatMessages(conversation, user);
  const { 
    threads, 
    threadMessages, 
    threadSenders, 
    loadThreads, 
    loadThreadMessages,
    setThreadMessages,
    setThreadSenders
  } = useThreads(conversation, user);
  const { pinnedMessages, pinMessage, unpinMessage } = usePinnedMessages(conversation);
  const {
    previewFile,
    locationData,
    uploading,
    fileInputRef,
    imageInputRef,
    handleFileSelect,
    handleImageSelect,
    handleLocationClick,
    removePreview,
    uploadFile,
    setPreviewFile,
    setLocationData
  } = useFileUpload();
  const { typing, handleTyping } = useTyping(conversation);
  const loadedConversationIdRef = useRef(null);
  const markAsReadTimeoutRef = useRef(null);
  const loadedOtherUserIdRef = useRef(null);

  // Load conversation data
  useEffect(() => {
    if (!conversation || !user) return;

    const conversationId = conversation.id;
    const isThread = !!conversation.threadId;
    
    // Prevent duplicate API calls for the same conversation
    if (loadedConversationIdRef.current === conversationId && !isThread) {
      return;
    }
    
    loadedConversationIdRef.current = conversationId;

    // Load messages/threads
    if (isThread) {
      loadThreadMessages(conversation.threadId, conversationId);
      setSelectedThread({ id: conversation.threadId });
    } else {
      // For group chat, load all users first, then messages
      if (conversation.type === 'group') {
        loadAllUsers(conversationId, 'group').then(allUsers => {
          // Set senders first
          setMessageSenders(allUsers);
          setThreadSenders(allUsers);
          // Then load messages with existing senders
          loadMessages(allUsers);
          loadThreads();
        }).catch(error => {
          console.error('Failed to load all users for group:', error);
          loadMessages();
          loadThreads();
        });
      } else {
        // For private chat, load other user first, then messages
        if (conversation.type === 'private' && conversation.participants) {
          const otherParticipant = conversation.participants.find(p => p.userId !== user.id);
          if (otherParticipant && loadedOtherUserIdRef.current !== otherParticipant.userId) {
            loadedOtherUserIdRef.current = otherParticipant.userId;
            userService.getUserById(otherParticipant.userId)
              .then(data => {
                setOtherUser(data.user);
                const senders = {
                  [user.id]: user,
                  [data.user.id]: data.user
                };
                setMessageSenders(senders);
                loadMessages(senders);
              })
              .catch(error => {
                console.error('Failed to load other user:', error);
                const senders = { [user.id]: user };
                setMessageSenders(senders);
                loadMessages(senders);
              });
          } else {
            // Already loaded, just load messages with existing senders
            const senders = messageSenders;
            loadMessages(senders);
          }
        } else {
          loadMessages();
        }
      }
    }

    socketService.joinConversation(conversationId);
    
    // Debounce markAsRead to prevent spam
    if (markAsReadTimeoutRef.current) {
      clearTimeout(markAsReadTimeoutRef.current);
    }
    markAsReadTimeoutRef.current = setTimeout(() => {
      chatService.markAsRead(conversationId).catch(err => {
        console.error('Failed to mark as read:', err);
      });
    }, 500);



    // Load user role for group chat
      if (conversation.type === 'group' && conversation.participants) {
        const currentParticipant = conversation.participants.find(p => p.userId === user.id);
        if (currentParticipant) {
          setUserRole(currentParticipant.role);
        } else {
        chatService.getMembers(conversationId)
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

    setIsAdminOnlyChat(conversation.type === 'group' ? (conversation.adminOnlyChat || false) : false);

      return () => {
      if (markAsReadTimeoutRef.current) {
        clearTimeout(markAsReadTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.id, conversation?.threadId, conversation?.type, user?.id]);

  // Handle send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() && !previewFile && !locationData) return;

    if (conversation.type === 'group' && !conversation.threadId && isAdminOnlyChat && userRole !== 'admin') {
      showWarning('Chỉ admin mới có quyền gửi tin nhắn trong nhóm này');
      return;
    }

    let messageContent = newMessage;
    let messageType = 'text';
    let fileUrl = null;

    if (previewFile) {
      try {
        const uploadResult = await uploadFile();
        if (uploadResult) {
          fileUrl = uploadResult.fileUrl;
          messageType = uploadResult.messageType;
          messageContent = uploadResult.messageContent;
        } else {
          return;
        }
      } catch (error) {
        showError('Không thể upload file');
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

  // Thread handlers
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
      await loadThreads();
    } catch (error) {
      console.error('Failed to create thread:', error);
      showError(error.response?.data?.message || 'Không thể tạo thread');
    }
  };

  const handleSelectThread = async (thread) => {
    setSelectedThread(thread);
    await loadThreadMessages(thread.id, conversation.id);
    await loadThreads();
    chatService.markAsRead(conversation.id).catch(err => {
      console.error('Failed to mark as read:', err);
    });
  };

  const handleSendThreadMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedThread) return;
    
    const content = newMessage;
    setNewMessage('');
    
    try {
      socketService.sendMessage(conversation.id, content, 'text', null, null, selectedThread.id);
      await loadThreadMessages(selectedThread.id, conversation.id);
    } catch (error) {
      console.error('Failed to send thread message:', error);
    }
  };

  // Pin/unpin handlers
  const handlePinMessage = async (messageId) => {
    try {
      await pinMessage(messageId);
      showSuccess('Đã ghim tin nhắn thành công!');
    } catch (error) {
      showError('Không thể ghim tin nhắn');
    }
  };

  const handleUnpinMessage = async (messageId) => {
    try {
      await unpinMessage(messageId);
      showSuccess('Đã bỏ ghim tin nhắn');
    } catch (error) {
      showError('Không thể bỏ ghim tin nhắn');
    }
  };

  const handleScrollToMessage = (messageId) => {
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      messageElement.style.background = 'rgba(255, 193, 7, 0.2)';
      setTimeout(() => {
        messageElement.style.background = '';
      }, 2000);
    }
  };

  // Group handlers
  const handleLeaveGroup = () => {
    setShowConfirmLeave(true);
  };

  const confirmLeaveGroup = async () => {
    setShowConfirmLeave(false);
    try {
      await chatService.leaveGroup(conversation.id);
      window.location.reload();
    } catch (error) {
      console.error('Failed to leave group:', error);
      showError('Không thể rời nhóm');
    }
  };

  const handleToggleAdminOnlyChat = async (event) => {
    const newValue = event.target.checked;
    if (userRole !== 'admin') {
      showWarning('Chỉ admin mới có quyền thay đổi cài đặt này');
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
      showSuccess('Đã cập nhật cài đặt thành công!');
    } catch (error) {
      console.error('Failed to update group settings:', error);
      showError('Không thể cập nhật cài đặt');
    } finally {
      setUpdatingSettings(false);
    }
  };

  const handleAvatarClick = (senderId) => {
    if (!senderId) return;
    setViewingUserId(senderId);
    setShowUserProfile(true);
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

  const canSendMessage = !(conversation.type === 'group' && isAdminOnlyChat && userRole !== 'admin');

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ConversationHeader
        conversation={conversation}
        otherUser={otherUser}
        typing={typing}
        userRole={userRole}
        onShowThreads={() => setShowThreads(true)}
        onOpenGroupSettings={() => setShowGroupSettings(true)}
        onLeaveGroup={handleLeaveGroup}
        onAvatarClick={handleAvatarClick}
        onBack={onBack}
      />
      
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

        <MessageList
          messages={conversation.threadId ? threadMessages : messages}
          messageSenders={conversation.threadId ? threadSenders : messageSenders}
          user={user}
          pinnedMessages={pinnedMessages}
          conversation={conversation}
          onPinMessage={handlePinMessage}
          onUnpinMessage={handleUnpinMessage}
          onReply={setReplyingTo}
          onCreateThread={handleCreateThreadClick}
          onDownloadFile={handleDownloadFile}
          onAvatarClick={handleAvatarClick}
        />
                  </Box>

      {canSendMessage && (
        <MessageInput
          newMessage={newMessage}
          setNewMessage={setNewMessage}
        onSubmit={handleSendMessage}
          onTyping={handleTyping}
          disabled={false}
          uploading={uploading}
          previewFile={previewFile}
          locationData={locationData}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
          fileInputRef={fileInputRef}
          imageInputRef={imageInputRef}
          onFileSelect={handleFileSelect}
          onImageSelect={handleImageSelect}
          onLocationClick={handleLocationClick}
          removePreview={removePreview}
        />
      )}
      
      {conversation && conversation.type === 'group' && (
        <ThreadsDrawer
          open={showThreads}
          onClose={() => {
            setShowThreads(false);
            setSelectedThread(null);
            setThreadMessages([]);
          }}
          threads={threads}
          selectedThread={selectedThread}
          threadMessages={threadMessages}
          threadSenders={threadSenders}
          user={user}
          conversation={conversation}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          onSelectThread={handleSelectThread}
          onBackToThreads={() => {
                  setSelectedThread(null);
                  setThreadMessages([]);
                }}
          onSendThreadMessage={handleSendThreadMessage}
          onAvatarClick={handleAvatarClick}
        />
      )}

      <PinnedMessagesDialog
        open={showPinnedMessages}
        onClose={() => setShowPinnedMessages(false)}
        pinnedMessages={pinnedMessages}
        onUnpin={handleUnpinMessage}
        onScrollToMessage={handleScrollToMessage}
      />

      <GroupSettingsDialog
        open={showGroupSettings}
        onClose={() => setShowGroupSettings(false)}
        isAdminOnlyChat={isAdminOnlyChat}
        userRole={userRole}
        updatingSettings={updatingSettings}
        onToggleAdminOnlyChat={handleToggleAdminOnlyChat}
      />

      <CreateThreadDialog
        open={showCreateThreadDialog}
        onClose={() => {
              setShowCreateThreadDialog(false);
              setThreadTitle('');
              setThreadMessageId(null);
            }}
        threadTitle={threadTitle}
        setThreadTitle={setThreadTitle}
        onCreateThread={handleCreateThread}
      />

      {viewingUserId && (
        <UserProfileDialog
          open={showUserProfile}
          onClose={() => {
            setShowUserProfile(false);
            setViewingUserId(null);
          }}
          userId={viewingUserId}
          onStartChat={() => setShowUserProfile(false)}
        />
      )}

      <ConfirmDialog
        open={showConfirmLeave}
        title="Rời khỏi nhóm"
        message="Bạn có chắc muốn rời khỏi nhóm này?"
        onConfirm={confirmLeaveGroup}
        onCancel={() => setShowConfirmLeave(false)}
        confirmText="Rời nhóm"
        cancelText="Hủy"
        severity="warning"
      />
    </Box>
  );
};

export default ChatWindow;
