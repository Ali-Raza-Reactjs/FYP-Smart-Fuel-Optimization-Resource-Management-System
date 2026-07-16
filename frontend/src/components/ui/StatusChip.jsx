import React from 'react';
import { Chip } from '@mui/material';

/**
 * Enterprise standardized Status Chip component
 * Automatically maps standard status strings to semantic colors.
 */
const StatusChip = ({ status, sx = {} }) => {
  let color = 'default';

  // Map status strings to MUI semantic colors
  const statusLower = status?.toLowerCase() || '';

  if (['active', 'completed', 'success', 'approved'].includes(statusLower)) {
    color = 'success';
  } else if (['inactive', 'cancelled', 'error', 'rejected'].includes(statusLower)) {
    color = 'error';
  } else if (['maintenance', 'in progress', 'pending', 'warning', 'in transit'].includes(statusLower)) {
    color = 'warning';
  } else if (['scheduled', 'info', 'new'].includes(statusLower)) {
    color = 'info';
  }

  return (
    <Chip
      label={status}
      color={color}
      size="small"
      sx={{
        fontWeight: 'bold',
        borderRadius: 1,
        px: 1,
        ...sx
      }}
    />
  );
};

export default StatusChip;
