import React from 'react';
import { Box, Typography } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';

export const LocationPreview = ({ message, isOwnMessage }) => {
  try {
    const location = JSON.parse(message.content);
    const googleMapUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    
    return (
      <Box sx={{ mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <LocationOnIcon sx={{ fontSize: '1.3rem', color: isOwnMessage ? 'rgba(255,255,255,0.9)' : '#EF4444' }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: isOwnMessage ? 'rgba(255,255,255,0.95)' : '#111827' }}>
            Vị trí
          </Typography>
        </Box>
        {location.address && (
          <Typography variant="caption" sx={{ 
            display: 'block', 
            mb: 1, 
            color: isOwnMessage ? 'rgba(255,255,255,0.8)' : '#6B7280',
            fontSize: '0.8rem'
          }}>
            {location.address}
          </Typography>
        )}
        <Box
          component="a"
          href={googleMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: 'block',
            width: '100%',
            minHeight: '150px',
            height: '150px',
            borderRadius: '12px',
            cursor: 'pointer',
            border: isOwnMessage 
              ? '2px solid rgba(255,255,255,0.25)' 
              : '2px solid #E5E7EB',
            backgroundColor: '#E2E8F0',
            position: 'relative',
            overflow: 'hidden',
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }
          }}
        >
          <iframe
            width="100%"
            height="100%"
            style={{
              border: 0,
              borderRadius: '4px',
              pointerEvents: 'none'
            }}
            loading="lazy"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.longitude-0.01},${location.latitude-0.01},${location.longitude+0.01},${location.latitude+0.01}&layer=mapnik&marker=${location.latitude},${location.longitude}`}
            title="Location Map"
          />
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              padding: 1,
              background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)',
              pointerEvents: 'none'
            }}
          >
            <Typography
              variant="caption"
              sx={{
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '4px 12px',
                borderRadius: 1,
                fontSize: '0.75rem',
                fontWeight: 600
              }}
            >
              Click để mở trên Google Maps
            </Typography>
          </Box>
        </Box>
        <Typography variant="caption" sx={{ 
          display: 'block', 
          mt: 0.5, 
          color: isOwnMessage ? 'rgba(255,255,255,0.6)' : '#9CA3AF',
          fontSize: '0.7rem',
          fontFamily: 'monospace'
        }}>
          {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
        </Typography>
      </Box>
    );
  } catch (e) {
    console.error('Error parsing location:', e, message.content);
    return (
      <Box>
        <LocationOnIcon sx={{ fontSize: '1.2rem', mr: 1 }} />
        <Typography variant="body2">
          {message.content}
        </Typography>
      </Box>
    );
  }
};

