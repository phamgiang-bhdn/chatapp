import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, Box, Typography, IconButton } from '@mui/material';
import PushPinIcon from '@mui/icons-material/PushPin';
import { format } from 'date-fns';

export const PinnedMessagesDialog = ({
  open,
  onClose,
  pinnedMessages,
  onUnpin,
  onScrollToMessage
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
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
                  onClose();
                  onScrollToMessage(pinned.messageId);
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
                        onUnpin(pinned.messageId);
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
          onClick={onClose}
          sx={{
            color: '#64748B',
            fontWeight: 600,
          }}
        >
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

