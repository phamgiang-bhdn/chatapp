import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, List, ListItem, ListItemAvatar, ListItemText, Avatar, Typography } from '@mui/material';

export const MentionAutocomplete = ({
  users,
  searchTerm,
  onSelect,
  position,
  currentUserId
}) => {
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef(null);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = users
      .filter(user => user.id !== currentUserId)
      .filter(user => {
        const fullName = (user.fullName || '').toLowerCase();
        const username = (user.username || '').toLowerCase();
        return fullName.includes(term) || username.includes(term);
      })
      .slice(0, 5);

    setFilteredUsers(filtered);
    setSelectedIndex(0);
  }, [searchTerm, users, currentUserId]);

  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const selectedItem = listRef.current.children[selectedIndex];
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  if (!searchTerm || filteredUsers.length === 0) {
    return null;
  }

  const handleSelect = (user) => {
    onSelect(user);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredUsers.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredUsers.length) % filteredUsers.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredUsers[selectedIndex]) {
        handleSelect(filteredUsers[selectedIndex]);
      }
    }
  };

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'absolute',
        bottom: position?.bottom || '60px',
        left: position?.left || '16px',
        right: position?.right || '16px',
        maxWidth: '400px',
        maxHeight: '300px',
        overflow: 'auto',
        zIndex: 1300,
        borderRadius: 2,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
      }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <List dense sx={{ p: 0 }}>
        {filteredUsers.map((user, index) => {
          const avatarUrl = user.avatar || null;
          const avatarInitial = (user.fullName || user.username || 'U').charAt(0).toUpperCase();
          const isSelected = index === selectedIndex;

          return (
            <ListItem
              key={user.id}
              button
              onClick={() => handleSelect(user)}
              sx={{
                backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(99, 102, 241, 0.1)'
                },
                cursor: 'pointer',
                py: 1
              }}
            >
              <ListItemAvatar>
                <Avatar
                  src={avatarUrl}
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: '#6366F1',
                    fontSize: '0.875rem'
                  }}
                >
                  {!avatarUrl && avatarInitial}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {user.fullName || user.username}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    @{user.username}
                  </Typography>
                }
              />
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
};

