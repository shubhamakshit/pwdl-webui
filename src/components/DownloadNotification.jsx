import React, { useEffect } from 'react';
import DownloadIcon from '@mui/icons-material/Download';
import { Button, Snackbar, Alert, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const DownloadNotification = ({
                                  open,
                                  onClose,
                                  message,
                                  downloadUrl,
                                  downloadName,
                                  severity = 'success'
                              }) => {
    useEffect(() => {
        // Request notification permission when component mounts
        if ('Notification' in window) {
            Notification.requestPermission();
        }
    }, []);

    const showNotification = () => {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Download Complete', {
                body: message,
                icon: '/path-to-your-icon.png' // Add your notification icon
            });
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