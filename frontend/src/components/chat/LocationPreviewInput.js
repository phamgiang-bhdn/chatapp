import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CloseIcon from '@mui/icons-material/Close';

export const LocationPreviewInput = ({ locationData, onRemove }) => {
  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      <Box sx={{
        p: 2,
        border: '2px solid #6366F1',
        borderRadius: 2,
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        minWidth: '200px'
      }}>
        <LocationOnIcon sx={{ color: '#6366F1' }} />
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>Vị trí</Typography>
          {locationData.address && (
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              {locationData.address}
            </Typography>
          )}
        </Box>
      </Box>
      <IconButton
        size="small"
        onClick={onRemove}
        sx={{
          position: 'absolute',
          top: -8,
          right: -8,
          background: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          '&:hover': { background: '#F8FAFC' }
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};

