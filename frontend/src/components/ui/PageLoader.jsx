import React from 'react';
import { Box, CircularProgress, Fade, Typography } from '@mui/material';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';

/**
 * Enterprise standardized Page Loader component
 * Displays a beautifully animated, centered loading spinner with optional text.
 */
const PageLoader = ({ text = 'Loading...' }) => {
  return (
    <Fade in timeout={400}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          minHeight: 'calc(100vh - 120px)', // Centers perfectly inside AppLayout
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'radial-gradient(circle at center, rgba(255,255,255,0.03) 0%, transparent 70%)'
              : 'radial-gradient(circle at center, rgba(0,0,0,0.02) 0%, transparent 70%)',
        }}
      >
        <Box 
          sx={{
            position: 'relative', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: 70,
            height: 70,
            mb: 3,
          }}
        >
          {/* Faint background track for depth */}
          <CircularProgress
            variant="determinate"
            value={100}
            size={70}
            thickness={2.5}
            sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              color: (theme) => theme.palette.action.hover 
            }}
          />
          {/* Animated foreground spinner with premium glow */}
          <CircularProgress
            size={70}
            thickness={2.5}
            disableShrink
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              color: 'primary.main',
              animationDuration: '1.2s',
              filter: 'drop-shadow(0 0 8px rgba(25, 118, 210, 0.4))',
            }}
          />
          {/* Inner pulsating fuel icon */}
          <LocalGasStationIcon 
            color="primary" 
            sx={{ 
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: 28,
              animation: 'pulseIcon 2s infinite ease-in-out',
              '@keyframes pulseIcon': {
                '0%, 100%': { transform: 'translate(-50%, -50%) scale(0.9)', opacity: 0.6 },
                '50%': { transform: 'translate(-50%, -50%) scale(1.1)', opacity: 1 },
              }
            }} 
          />
        </Box>

        {text && (
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{
              fontWeight: 500,
              letterSpacing: 0.5,
              animation: 'pulseText 2s ease-in-out infinite',
              '@keyframes pulseText': {
                '0%, 100%': { opacity: 0.5 },
                '50%': { opacity: 1 },
              },
            }}
          >
            {text}
          </Typography>
        )}
      </Box>
    </Fade>
  );
};

export default PageLoader;