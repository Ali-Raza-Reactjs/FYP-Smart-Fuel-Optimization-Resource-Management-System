import React from 'react';
import { TextField as MuiTextField, InputAdornment } from '@mui/material';

/**
 * Enterprise standardized TextField component
 * Wraps MUI TextField with consistent margins, icon adornments, and error handling.
 */
const TextField = ({
  id,
  name,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  fullWidth = true,
  autoFocus = false,
  error = false,
  helperText,
  startIcon,
  endIcon,
  multiline = false,
  rows = 1,
  disabled = false,
  sx = {},
  ...props
}) => {
  return (
    <MuiTextField
      id={id || name}
      name={name}
      label={label}
      value={value}
      onChange={onChange}
      type={type}
      placeholder={placeholder}
      required={required}
      fullWidth={fullWidth}
      autoFocus={autoFocus}
      error={error}
      helperText={helperText}
      multiline={multiline}
      rows={rows}
      disabled={disabled}
      slotProps={{ input: {
        startAdornment: startIcon ? (
          <InputAdornment position="start">
            {startIcon}
          </InputAdornment>
        ) : null,
        endAdornment: endIcon ? (
          <InputAdornment position="end">
            {endIcon}
          </InputAdornment>
        ) : null,
      } }}
      sx={{
        ...sx,
      }}
      {...props}
    />
  );
};

export default TextField;
