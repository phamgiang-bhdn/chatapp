import React from 'react';
import { Drawer, Box, Typography, IconButton, List, ListItem, Chip, Button, TextField, Avatar } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import { format } from 'date-fns';
import { MessageList } from './MessageList';

export const ThreadsDrawer = ({
  open,
  onClose,
  threads,
  selectedThread,
  threadMessages,
  threadSenders,
  user,
  conversation,
  newMessage,
  setNewMessage,
  onSelectThread,
  onBackToThreads,
  onSendThreadMessage
}) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 400,
          background: '#F8FAFC'
        }
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 2 }}>
        {selectedThread && (
          <IconButton onClick={onBackToThreads}>
            <ArrowBackIcon />
          </IconButton>
        )}
        <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1 }}>
          {selectedThread ? selectedThread.title || 'Thread' : 'Threads'}
        </Typography>
        <IconButton onClick={onClose}>
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
                  onClick={() => onSelectThread(thread)}
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
              <List sx={{ p: 0 }}>
                {threadMessages.map((message) => {
                  const sender = message.sender || threadSenders[message.senderId] || (message.senderId === user.id ? user : null);
                  const senderName = sender?.fullName || sender?.username || 'Unknown';
                  const isOwnMessage = message.senderId === user.id;
                  const avatarUrl = sender?.avatar ? `${sender.avatar}?t=${Date.now()}` : null;
                  const avatarInitial = (sender?.fullName || sender?.username || 'U').charAt(0).toUpperCase();
                  
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, px: 1 }}>
                          <Avatar
                            src={avatarUrl}
                            sx={{
                              width: 24,
                              height: 24,
                              background: avatarUrl 
                                ? 'transparent' 
                                : 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}
                          >
                            {!avatarUrl && avatarInitial}
                          </Avatar>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                            {senderName}
                          </Typography>
                        </Box>
                      )}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-end',
                          gap: 1,
                          maxWidth: '80%',
                          flexDirection: isOwnMessage ? 'row-reverse' : 'row'
                        }}
                      >
                        {isOwnMessage && (
                          <Avatar
                            src={user?.avatar ? `${user.avatar}?t=${Date.now()}` : null}
                            sx={{
                              width: 24,
                              height: 24,
                              background: user?.avatar 
                                ? 'transparent' 
                                : 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}
                          >
                            {!user?.avatar && ((user?.fullName || user?.username || 'U').charAt(0).toUpperCase())}
                          </Avatar>
                        )}
                        <Box
                          sx={{
                            p: 1.5,
                            maxWidth: '100%',
                            background: isOwnMessage
                              ? 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)'
                              : 'white',
                            color: isOwnMessage ? 'white' : 'inherit',
                            borderRadius: 2,
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                          }}
                        >
                          {message.replyTo && (
                            <Box
                              sx={{
                                mb: 1,
                                p: 1,
                                borderRadius: 1,
                                borderLeft: '3px solid',
                                borderColor: isOwnMessage ? 'rgba(255,255,255,0.5)' : '#6366F1',
                                background: isOwnMessage ? 'rgba(255,255,255,0.1)' : 'rgba(99, 102, 241, 0.1)',
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 600,
                                  opacity: 0.8,
                                  mb: 0.5,
                                  display: 'block',
                                  fontSize: '0.7rem'
                                }}
                              >
                                {message.replyTo.senderId === user.id 
                                  ? 'Bạn' 
                                  : (threadSenders[message.replyTo.senderId]?.fullName || 
                                     threadSenders[message.replyTo.senderId]?.username || 
                                     message.replyTo.sender?.fullName || 
                                     message.replyTo.sender?.username || 
                                     'Người khác')}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  fontSize: '0.7rem',
                                  opacity: 0.9,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  display: 'block'
                                }}
                              >
                                {message.replyTo.type === 'image' ? '📷 Hình ảnh' : 
                                 message.replyTo.type === 'file' ? `📎 ${message.replyTo.content}` :
                                 message.replyTo.content}
                              </Typography>
                            </Box>
                          )}
                          <Typography variant="body2">
                            {message.content}
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.8 }}>
                            {format(new Date(message.createdAt), 'HH:mm, dd/MM/yyyy')}
                          </Typography>
                        </Box>
                      </Box>
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Box>
          <Box sx={{ p: 2, borderTop: '1px solid #E2E8F0', background: 'white' }}>
            <form onSubmit={onSendThreadMessage}>
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
  );
};

