import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, IconButton, Paper, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ImageIcon from '@mui/icons-material/Image';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import { EmojiPicker } from './EmojiPicker';
import { ReplyPreview } from './ReplyPreview';
import { FilePreview } from './FilePreview';
import { LocationPreviewInput } from './LocationPreviewInput';

export const MessageInput = ({
  newMessage,
  setNewMessage,
  onSubmit,
  onTyping,
  disabled,
  uploading,
  previewFile,
  locationData,
  replyingTo,
  setReplyingTo,
  fileInputRef,
  imageInputRef,
  onFileSelect,
  onImageSelect,
  onLocationClick,
  removePreview
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        const target = event.target;
        if (!target.closest('button') || !target.closest('button[aria-label]')) {
          setShowEmojiPicker(false);
        }
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showEmojiPicker]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !previewFile && !locationData) return;
    onSubmit();
  };

  return (
    <>
      {replyingTo && (
        <Box sx={{ p: 2, borderTop: '1px solid #E2E8F0', background: '#F8FAFC' }}>
          <Box sx={{
            p: 1.5,
            borderRadius: 2,
            borderLeft: '3px solid #6366F1',
            background: 'white',
            position: 'relative'
          }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#6366F1', display: 'block', mb: 0.5 }}>
              Đang trả lời
            </Typography>
            <Typography variant="body2" sx={{
              fontSize: '0.85rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: '#64748B'
            }}>
              {replyingTo.type === 'image' ? '📷 Hình ảnh' : 
               replyingTo.type === 'file' ? `📎 ${replyingTo.content}` :
               replyingTo.content}
            </Typography>
            <IconButton
              size="small"
              onClick={() => setReplyingTo(null)}
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                '&:hover': { background: '#F8FAFC' }
              }}
            >
              <span style={{ fontSize: '1rem' }}>✕</span>
            </IconButton>
          </Box>
        </Box>
      )}

      {(previewFile || locationData) && (
        <Box sx={{ p: 2, borderTop: '1px solid #E2E8F0', background: '#F8FAFC' }}>
          {previewFile && (
            <FilePreview previewFile={previewFile} onRemove={removePreview} />
          )}
          {locationData && (
            <LocationPreviewInput locationData={locationData} onRemove={removePreview} />
          )}
        </Box>
      )}

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: { xs: 1, sm: 1.5, md: 2 },
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          gap: { xs: 0.5, sm: 1 },
          background: 'white',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', gap: { xs: 0, sm: 0.5 }, position: 'relative' }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileSelect}
            style={{ display: 'none' }}
            accept="*/*"
          />
          <input
            type="file"
            ref={imageInputRef}
            onChange={onImageSelect}
            style={{ display: 'none' }}
            accept="image/*"
          />
          <IconButton
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            size="small"
            sx={{
              color: '#6366F1',
              p: { xs: 0.75, sm: 1 },
              display: { xs: 'none', sm: 'inline-flex' },
              '&:hover': { background: 'rgba(99, 102, 241, 0.1)' }
            }}
          >
            <EmojiEmotionsIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
          </IconButton>
          <IconButton
            onClick={() => imageInputRef.current?.click()}
            size="small"
            sx={{
              color: '#6366F1',
              p: { xs: 0.75, sm: 1 },
              '&:hover': { background: 'rgba(99, 102, 241, 0.1)' }
            }}
          >
            <ImageIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
          </IconButton>
          <IconButton
            onClick={() => fileInputRef.current?.click()}
            size="small"
            sx={{
              color: '#6366F1',
              p: { xs: 0.75, sm: 1 },
              '&:hover': { background: 'rgba(99, 102, 241, 0.1)' }
            }}
          >
            <AttachFileIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
          </IconButton>
          <IconButton
            onClick={onLocationClick}
            size="small"
            sx={{
              color: '#6366F1',
              p: { xs: 0.75, sm: 1 },
              display: { xs: 'none', sm: 'inline-flex' },
              '&:hover': { background: 'rgba(99, 102, 241, 0.1)' }
            }}
          >
            <LocationOnIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
          </IconButton>

          {showEmojiPicker && (
            <EmojiPicker
              ref={emojiPickerRef}
              onEmojiSelect={(emoji) => {
                setNewMessage(prev => prev + emoji);
                setShowEmojiPicker(false);
              }}
            />
          )}
        </Box>

        <TextField
          fullWidth
          placeholder="Nhập tin nhắn..."
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            onTyping();
          }}
          disabled={disabled || uploading}
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
              borderRadius: { xs: 2, sm: 3 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
              fontWeight: 500,
              padding: { xs: '8px 12px', sm: '12px 16px' },
              border: '2px solid #E2E8F0',
              '&:hover': {
                backgroundColor: '#FAFBFC',
                borderColor: '#6366F1',
              },
              '&.Mui-focused': {
                backgroundColor: '#FAFBFC',
                borderColor: '#6366F1',
                boxShadow: '0 0 0 3px rgba(91, 127, 255, 0.1)',
              },
              '& fieldset': {
                border: 'none',
              },
            },
            '& .MuiInputBase-input': {
              padding: 0,
            },
          }}
        />
        <IconButton
          type="submit"
          sx={{
            width: { xs: 40, sm: 48, md: 52 },
            height: { xs: 40, sm: 48, md: 52 },
            minWidth: { xs: 40, sm: 48, md: 52 },
            ml: { xs: 0.5, sm: 1, md: 1.5 },
            background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(91, 127, 255, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #7B9AFF 0%, #FF8BB3 100%)',
              transform: 'scale(1.05)',
              boxShadow: '0 6px 16px rgba(91, 127, 255, 0.4)',
            },
            '&:disabled': {
              background: '#E2E8F0',
              color: '#A0AEC0',
            },
          }}
          disabled={disabled || uploading || (!newMessage.trim() && !previewFile && !locationData)}
        >
          <SendIcon sx={{ fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.4rem' } }} />
        </IconButton>
      </Box>
    </>
  );
};

