//import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { styled } from '@mui/material/styles';
import CheckIcon from '@mui/icons-material/Check';

interface SimpleAlertProps {
  open: boolean;
  message: string;
  onClose: () => void;
}

// Styled Dialog to ensure centered content with max width
const CenteredDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    maxWidth: '400px',
    width: '90%',
    margin: 'auto',
    borderRadius: theme.shape.borderRadius,
  },
}));

export default function SimpleAlert({ open, message, onClose }: SimpleAlertProps) {
  return (
    <CenteredDialog
      open={open}
      onClose={onClose}
      aria-labelledby="success-dialog-title"
      BackdropProps={{
        style: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent backdrop
        },
      }}
    >
      <Alert
        icon={<CheckIcon fontSize="inherit" />}
        severity="success"
        onClose={onClose}
        sx={{ m: 2 }}
      >
        <AlertTitle>Success</AlertTitle>
        {message}
      </Alert>
    </CenteredDialog>
  );
}