import React, { useEffect, useState } from 'react';
import { Button, Snackbar, Alert, IconButton } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';

const DownloadNotification = ({
  open,
  onClose,
  message,
  downloadUrl,
  downloadName,
  severity = 'success'
}) => {
  const [notificationPermission, setNotificationPermission] = useState('default');

  useEffect(() => {
    // Check notification permission when component mounts
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          setNotificationPermission(permission);
        });
      }
    }
  }, []);

  const showNotification = () => {
    // Use the Notification API only if supported and permission is granted
    if ('serviceWorker' in navigator && 'PushManager' in window && notificationPermission === 'granted') {
      // This should be handled by a registered service worker
      // For demo/development purposes, fall back to the snackbar only
      console.log('Push notification would show here if service worker is registered');
    }
  };

  useEffect(() => {
    if (open) {
      showNotification();
    }
  }, [open, message]);

  const action = (
    <>
      {downloadUrl && (
        <Button
          color="primary"
          size="small"
          startIcon={<DownloadIcon />}
          onClick={() => window.open(downloadUrl, '_blank')}
          sx={{ mr: 1 }}
        >
          Download
        </Button>
      )}
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={onClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </>
  );

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="outlined"
        action={action}
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default DownloadNotification;
