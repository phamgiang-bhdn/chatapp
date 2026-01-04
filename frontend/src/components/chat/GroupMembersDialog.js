import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Typography,
  Box,
  Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { chatService } from '../../api/chatService';
import { userService } from '../../api/userService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ConfirmDialog from '../common/ConfirmDialog';

const GroupMembersDialog = ({ open, onClose, conversation, onAvatarClick }) => {
  const [members, setMembers] = useState([]);
  const [memberDetails, setMemberDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [showConfirmRemove, setShowConfirmRemove] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    if (open && conversation) {
      loadMembers();
    }
  }, [open, conversation]);

  const loadMembers = async () => {
    if (!conversation || !conversation.id) {
      console.error('Invalid conversation:', conversation);
      return;
    }
    
    setLoading(true);
    try {
      const data = await chatService.getMembers(conversation.id);
      const membersList = Array.isArray(data.members) ? data.members : [];
      setMembers(membersList);

      const details = {};
      for (const member of membersList) {
        try {
          const userData = await userService.getUserById(member.userId);
          details[member.userId] = userData.user;
        } catch (error) {
          console.error(`Failed to load user ${member.userId}:`, error);
        }
      }
      setMemberDetails(details);
    } catch (error) {
      console.error('Failed to load members:', error);
      setMembers([]);
      setMemberDetails({});
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = (userId) => {
    setMemberToRemove(userId);
    setShowConfirmRemove(true);
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;
    setShowConfirmRemove(false);
    try {
      await chatService.removeMember(conversation.id, memberToRemove);
      await loadMembers();
      showSuccess('Đã xóa thành viên khỏi nhóm');
      setMemberToRemove(null);
    } catch (error) {
      console.error('Failed to remove member:', error);
      showError('Không thể xóa thành viên');
      setMemberToRemove(null);
    }
  };

  const handleToggleAdmin = async (member) => {
    const newRole = member.role === 'admin' ? 'member' : 'admin';

    try {
      await chatService.updateMemberRole(conversation.id, member.userId, newRole);
      await loadMembers();
      showSuccess(newRole === 'admin' ? 'Đã đặt làm admin' : 'Đã hủy quyền admin');
    } catch (error) {
      console.error('Failed to update role:', error);
      showError('Không thể cập nhật vai trò');
    }
  };

  const isCurrentUserAdmin = members.find(m => m.userId === user.id && m.role === 'admin');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Thành viên nhóm</Typography>
          <Typography variant="body2" color="text.secondary">
            {members.length} thành viên
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Typography>Đang tải...</Typography>
        ) : (
          <List>
            {members.map((member) => {
              const memberUser = memberDetails[member.userId];
              return (
                <ListItem
                  key={member.id}
                  secondaryAction={
                    isCurrentUserAdmin && member.userId !== user.id && (
                      <Box>
                        <IconButton
                          edge="end"
                          onClick={() => handleToggleAdmin(member)}
                          color={member.role === 'admin' ? 'primary' : 'default'}
                          title={member.role === 'admin' ? 'Hủy admin' : 'Đặt làm admin'}
                        >
                          <AdminPanelSettingsIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveMember(member.userId)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    )
                  }
                >
                  <ListItemAvatar>
                    <Avatar
                      src={memberUser?.avatar || null}
                      onClick={() => onAvatarClick && onAvatarClick(member.userId)}
                      sx={{
                        background: memberUser?.avatar 
                          ? 'transparent' 
                          : 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)',
                        cursor: onAvatarClick ? 'pointer' : 'default',
                        transition: 'transform 0.2s',
                        '&:hover': onAvatarClick ? {
                          transform: 'scale(1.1)'
                        } : {}
                      }}
                    >
                      {!memberUser?.avatar && (memberUser?.fullName?.charAt(0) || memberUser?.username?.charAt(0) || '?')}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography>
                          {memberUser?.fullName || memberUser?.username || `User ${member.userId}`}
                        </Typography>
                        {member.role === 'admin' && (
                          <Chip label="Admin" size="small" color="primary" />
                        )}
                        {member.userId === user.id && (
                          <Chip label="Bạn" size="small" variant="outlined" />
                        )}
                      </Box>
                    }
                    secondary={memberUser?.email || ''}
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>

      <ConfirmDialog
        open={showConfirmRemove}
        title="Xóa thành viên"
        message="Bạn có chắc muốn xóa thành viên này khỏi nhóm?"
        onConfirm={confirmRemoveMember}
        onCancel={() => {
          setShowConfirmRemove(false);
          setMemberToRemove(null);
        }}
        confirmText="Xóa"
        cancelText="Hủy"
        severity="error"
      />
    </Dialog>
  );
};

export default GroupMembersDialog;
