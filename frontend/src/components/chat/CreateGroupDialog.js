import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Checkbox,
  Box,
  Typography
} from '@mui/material';
import { userService } from '../../api/userService';
import { chatService } from '../../api/chatService';
import { useToast } from '../../context/ToastContext';

const CreateGroupDialog = ({ open, onClose, onGroupCreated }) => {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showError, showWarning } = useToast();

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearchUsers(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearchUsers = async (query) => {
    try {
      const data = await userService.searchUsers(query);
      setSearchResults(data.users || []);
    } catch (error) {
      console.error('Failed to search users:', error);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      showWarning('Vui lòng nhập tên nhóm');
      return;
    }

    if (selectedUsers.length === 0) {
      showWarning('Vui lòng chọn ít nhất 1 thành viên');
      return;
    }

    setLoading(true);
    try {
      const data = await chatService.createConversation(
        selectedUsers,
        'group',
        groupName,
        description
      );
      onGroupCreated(data.conversation);
      handleClose();
    } catch (error) {
      console.error('Failed to create group:', error);
      showError('Không thể tạo nhóm');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setGroupName('');
    setDescription('');
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUsers([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Tạo nhóm chat mới</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Tên nhóm"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Mô tả (tùy chọn)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            multiline
            rows={2}
          />
        </Box>

        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Thành viên đã chọn: {selectedUsers.length}
        </Typography>

        <TextField
          fullWidth
          placeholder="Tìm kiếm người dùng..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          margin="normal"
        />

        <List sx={{ maxHeight: 300, overflow: 'auto' }}>
          {searchResults.map((user) => (
            <ListItem key={user.id} disablePadding>
              <ListItemButton onClick={() => toggleUserSelection(user.id)}>
                <Checkbox
                  edge="start"
                  checked={selectedUsers.includes(user.id)}
                  tabIndex={-1}
                  disableRipple
                />
                <ListItemAvatar>
                  <Avatar>{user.fullName?.charAt(0) || user.username?.charAt(0)}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={user.fullName || user.username}
                  secondary={user.email}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Hủy</Button>
        <Button
          onClick={handleCreateGroup}
          variant="contained"
          disabled={loading || !groupName.trim() || selectedUsers.length === 0}
        >
          Tạo nhóm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateGroupDialog;
