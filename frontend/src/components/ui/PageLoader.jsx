import { Box, CircularProgress, Fade, Typography } from '@mui/material';

/**
 * Enterprise standardized Page Loader component
 * Displays a full-height centered loading spinner with optional text.
 */
const PageLoader = ({ text = 'Loading...', height = '100vh' }) => {
  return (
    <Fade in timeout={400}>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        height={height}
        gap={3}
        sx={{
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'radial-gradient(circle at center, rgba(255,255,255,0.03) 0%, transparent 70%)'
              : 'radial-gradient(circle at center, rgba(0,0,0,0.02) 0%, transparent 70%)',
        }}
      >
        <Box position="relative" display="inline-flex">
          {/* Faint background track for depth */}
          <CircularProgress
            variant="determinate"
            value={100}
            size={52}
            thickness={3.6}
            sx={{ color: (theme) => theme.palette.action.hover }}
          />
          {/* Animated foreground spinner */}
          <CircularProgress
            size={52}
            thickness={3.6}
            disableShrink
            sx={{
              position: 'absolute',
              left: 0,
              color: 'primary.main',
              animationDuration: '750ms',
            }}
          />
        </Box>

        {text && (
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{
              fontWeight: 500,
              letterSpacing: 0.3,
              animation: 'pulseText 1.8s ease-in-out infinite',
              '@keyframes pulseText': {
                '0%, 100%': { opacity: 0.6 },
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