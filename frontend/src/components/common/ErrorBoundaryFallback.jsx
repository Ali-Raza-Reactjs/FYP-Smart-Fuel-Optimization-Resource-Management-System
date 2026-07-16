import React from 'react';
import { Container, Box, Typography, Button, Paper } from '@mui/material';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';

const ErrorBoundaryFallback = ({ error, resetErrorBoundary }) => {
  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 5, textAlign: 'center', borderRadius: 2 }}>
        <ErrorOutlinedIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
        <Typography variant="h4" color="error" fontWeight="bold" gutterBottom>
          Oops! Something went wrong.
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          We encountered an unexpected error. Our team has been notified.
        </Typography>

        {/* Only show technical details in development */}
        {process.env.NODE_ENV === 'development' && (
          <Box sx={{ mt: 2, mb: 3, p: 2, bgcolor: '#f8d7da', color: '#721c24', borderRadius: 1, textAlign: 'left', overflowX: 'auto' }}>
            <Typography variant="body2" component="pre" sx={{ m: 0 }}>
              {error.message}
            </Typography>
          </Box>
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={resetErrorBoundary}
          sx={{ mt: 2 }}
        >
          Try Again
        </Button>
      </Paper>
    </Container>
  );
};

export default ErrorBoundaryFallback;
