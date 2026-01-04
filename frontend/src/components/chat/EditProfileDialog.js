import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Avatar,
  Box,
  IconButton,
  Typography,
  Alert,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { userService } from '../../api/userService';
import { chatService } from '../../api/chatService';
import { useAuth } from '../../context/AuthContext';

const EditProfileDialog = ({ open, onClose, onProfileUpdated }) => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    avatar: '',
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const avatarInputRef = useRef(null);

  useEffect(() => {
    if (open && user) {
      setFormData({
        fullName: user.fullName || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
      });
      setAvatarPreview(user.avatar || null);
      setAvatarFile(null);
      setError('');
      setSuccess('');
    }
  }, [open, user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAvatarSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Vui lòng chọn file ảnh');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError('Kích thước ảnh không được vượt quá 5MB');
        return;
      }

      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setUploadingAvatar(true);
      setError('');

      try {
        const uploadResult = await chatService.uploadFile(file);
        setFormData({
          ...formData,
          avatar: uploadResult.file.url
        });
        setUploadingAvatar(false);
      } catch (err) {
        console.error('Avatar upload error:', err);
        setError('Không thể upload ảnh đại diện');
        setAvatarFile(null);
        setAvatarPreview(user?.avatar || null);
        setUploadingAvatar(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = await userService.updateProfile(formData);
      setSuccess('Cập nhật profile thành công!');
      
      if (updateUser && data.user) {
        updateUser(data.user);
      }
      
      if (onProfileUpdated) {
        onProfileUpdated(data.user);
      }

      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1.3rem', pb: 2 }}>
        Chỉnh sửa Profile
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
              {success}
            </Alert>
          )}

          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <input
                type="file"
                ref={avatarInputRef}
                onChange={handleAvatarSelect}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <Avatar
                src={avatarPreview}
                sx={{
                  width: 120,
                  height: 120,
                  background: avatarPreview 
                    ? 'transparent' 
                    : 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  border: '3px solid #E2E8F0',
                }}
              >
                {!avatarPreview && (formData.fullName?.charAt(0) || user?.username?.charAt(0))}
              </Avatar>
              <IconButton
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  avatarInputRef.current?.click();
                }}
                disabled={uploadingAvatar}
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  background: 'white',
                  border: '2px solid #E2E8F0',
                  zIndex: 10,
                  '&:hover': {
                    background: '#F8FAFC',
                  },
                }}
                size="small"
              >
                <PhotoCameraIcon fontSize="small" />
              </IconButton>
              {uploadingAvatar && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    zIndex: 5
                  }}
                >
                  Đang upload...
                </Box>
              )}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              @{user?.username}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              Click vào icon camera để đổi ảnh đại diện
            </Typography>
          </Box>

          <TextField
            fullWidth
            label="Tên hiển thị"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
            multiline
            rows={3}
            placeholder="Viết gì đó về bạn..."
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={onClose}
            disabled={loading}
            sx={{
              color: '#64748B',
              fontWeight: 600,
            }}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
              fontWeight: 600,
              px: 4,
            }}
          >
            {loading ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditProfileDialog;
