import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Enterprise standardized Page Header component
 * Displays a title, optional subtitle, and an optional right-aligned action element (like a button).
 */
const PageHeader = ({ title, subtitle, action }) => {
  return (
    <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
      <Box>
        <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && (
        <Box>
          {action}
        </Box>
      )}
    </Box>
  );
};

export default PageHeader;
