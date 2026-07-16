import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Enterprise standardized Empty State component
 * Used when a list/table has no data.
 */
const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <Box sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.7 }}>
      {Icon && (
        <Box sx={{ mb: 2, color: 'text.secondary', display: 'flex', justifyContent: 'center' }}>
          <Icon sx={{ fontSize: 64 }} />
        </Box>
      )}
      <Typography variant="h6" fontWeight="medium" color="text.primary" gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: 400, mb: 3 }}>
          {description}
        </Typography>
      )}
      {action && (
        <Box sx={{ mt: 1 }}>
          {action}
        </Box>
      )}
    </Box>
  );
};

export default EmptyState;
