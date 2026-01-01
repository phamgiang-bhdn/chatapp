import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography } from '@mui/material';

export const CreateThreadDialog = ({
  open,
  onClose,
  threadTitle,
  setThreadTitle,
  onCreateThread
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
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
          onClick={onClose}
          sx={{
            color: '#64748B',
            fontWeight: 600,
          }}
        >
          Hủy
        </Button>
        <Button
          onClick={onCreateThread}
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
  );
};

