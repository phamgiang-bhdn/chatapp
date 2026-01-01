import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Switch, FormControlLabel } from '@mui/material';

export const GroupSettingsDialog = ({
  open,
  onClose,
  isAdminOnlyChat,
  userRole,
  updatingSettings,
  onToggleAdminOnlyChat
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1.3rem', pb: 2 }}>
        Cài đặt nhóm
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={isAdminOnlyChat}
                onChange={onToggleAdminOnlyChat}
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

