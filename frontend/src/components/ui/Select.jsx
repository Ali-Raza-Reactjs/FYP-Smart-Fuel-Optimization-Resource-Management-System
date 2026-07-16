import React from 'react';
import { TextField as MuiTextField, MenuItem, InputAdornment } from '@mui/material';

/**
 * Enterprise standardized Select component
 * Wraps MUI TextField (select variant) with consistent styling.
 * Accepts an array of options { value, label } or array of strings.
 */
const Select = ({
  id,
  name,
  label,
  value,
  onChange,
  options = [],
  required = false,
  fullWidth = true,
  error = false,
  helperText,
  startIcon,
  disabled = false,
  sx = {},
  ...props
}) => {
  return (
    <MuiTextField
      select
      id={id || name}
      name={name}
      label={label}
      value={value}
      onChange={onChange}
      required={required}
      fullWidth={fullWidth}
      error={error}
      helperText={helperText}
      disabled={disabled}
      InputProps={{
        startAdornment: startIcon ? (
          <InputAdornment position="start">
            {startIcon}
          </InputAdornment>
        ) : {},
      }}
      sx={{
        ...sx,
      }}
      {...props}
    >
      {options.map((option, index) => {
        const optionValue = typeof option === 'object' ? option.value : option;
        const optionLabel = typeof option === 'object' ? option.label : option;
        return (
          <MenuItem key={index} value={optionValue}>
            {optionLabel}
          </MenuItem>
        );
      })}
    </MuiTextField>
  );
};

export default Select;
