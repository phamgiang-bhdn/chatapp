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

const GroupMembersDialog = ({ open, onClose, conversation }) => {
  const [members, setMembers] = useState([]);
  const [memberDetails, setMemberDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

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

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Bạn có chắc muốn xóa thành viên này?')) return;

    try {
      await chatService.removeMember(conversation.id, userId);
      await loadMembers();
    } catch (error) {
      console.error('Failed to remove member:', error);
      alert('Không thể xóa thành viên');
    }
  };

  const handleToggleAdmin = async (member) => {
    const newRole = member.role === 'admin' ? 'member' : 'admin';

    try {
      await chatService.updateMemberRole(conversation.id, member.userId, newRole);
      await loadMembers();
    } catch (error) {
      console.error('Failed to update role:', error);
      alert('Không thể cập nhật vai trò');
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
                    <Avatar>
                      {memberUser?.fullName?.charAt(0) || memberUser?.username?.charAt(0) || '?'}
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
    </Dialog>
  );
};

export default GroupMembersDialog;
