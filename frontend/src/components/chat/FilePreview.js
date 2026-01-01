import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';

export const FilePreview = ({ previewFile, onRemove }) => {
  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      {previewFile.type === 'image' ? (
        <img
          src={previewFile.url}
          alt="Preview"
          style={{
            maxWidth: '200px',
            maxHeight: '200px',
            borderRadius: '8px',
            objectFit: 'cover'
          }}
        />
      ) : (
        <Box sx={{
          p: 2,
          border: '2px dashed #E2E8F0',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <AttachFileIcon />
          <Typography variant="body2">{previewFile.file.name}</Typography>
        </Box>
      )}
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

