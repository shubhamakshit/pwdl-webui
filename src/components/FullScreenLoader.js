"use client";

import React from 'react';
import { CircularProgress, Box } from '@mui/material';

const FullScreenLoader = () => {
    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
                zIndex: 1000, // Ensure it's on top of everything
            }}
        >
            <CircularProgress />
        </Box>
    );
};

export default FullScreenLoader;