import React from 'react';
import { Button as MuiButton, CircularProgress, useTheme } from '@mui/material';

/**
 * Enterprise standardized Button component
 * Extends MUI Button with consistent styling, loading state, and predefined variants.
 */
const Button = ({ 
  children, 
  variant = 'contained', 
  color = 'primary', 
  size = 'medium', 
  loading = false, 
  disabled = false,
  startIcon,
  endIcon,
  fullWidth = false,
  onClick,
  type = 'button',
  sx = {},
  ...props 
}) => {
  const theme = useTheme();
  
  return (
    <MuiButton
      type={type}
      variant={variant}
      color={color}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      onClick={onClick}
      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : startIcon}
      endIcon={endIcon}
      sx={{
        py: size === 'large' ? 1.5 : size === 'small' ? 0.75 : 1,
        px: size === 'large' ? 3 : size === 'small' ? 1.5 : 2,
        fontWeight: 'bold',
        textTransform: 'none',
        borderRadius: 2,
        background: variant === 'contained' && color === 'primary' && !disabled && !loading
          ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)` 
          : undefined,
        boxShadow: variant === 'contained' ? 2 : 0,
        '&:hover': {
          boxShadow: variant === 'contained' ? 4 : 0,
          background: variant === 'contained' && color === 'primary' && !disabled && !loading
            ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)` 
            : undefined,
          filter: variant === 'contained' && color === 'primary' ? 'brightness(1.1)' : 'none',
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </MuiButton>
  );
};

export default Button;
