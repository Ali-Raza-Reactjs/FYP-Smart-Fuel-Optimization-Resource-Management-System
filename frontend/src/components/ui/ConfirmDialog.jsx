import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Box } from '@mui/material';
import Button from './Button';

/**
 * Enterprise standardized Confirmation Dialog component
 * Replaces `window.confirm()` with a polished UI.
 */
const ConfirmDialog = ({ open, title, content, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', confirmColor = 'error', loading = false }) => {
  return (
    <Dialog open={open} onClose={onCancel} PaperProps={{ sx: { borderRadius: 2, p: 1, minWidth: 400 } }}>
      <DialogTitle sx={{ fontWeight: 'bold' }}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{content}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" color="inherit" onClick={onCancel} disabled={loading}>
          {cancelText}
        </Button>
        <Button variant="contained" color={confirmColor} onClick={onConfirm} loading={loading}>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
