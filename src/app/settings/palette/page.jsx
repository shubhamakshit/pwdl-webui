
"use client";
import { useState, useEffect } from 'react';
import { Button, Typography, Paper } from '@mui/material';
import dynamic from 'next/dynamic';

const AceEditor = dynamic(
    async () => {
        const ace = await import('react-ace');
        await import('ace-builds/src-noconflict/mode-javascript');
        await import('ace-builds/src-noconflict/theme-tomorrow_night');
        return ace;
    },
    { ssr: false }
);

const defaultPaletteCode = `
// Define your command palette commands here.
// You have access to the following functions:
// alert(message, severity) - shows an alert
// snackbar(message) - shows a snackbar
// input(title, message) - shows an input dialog and returns a Promise

return [
    {
        name: 'Go to Home',
        action: () => window.location.href = '/',
    },
    {
        name: 'Go to Settings',
        action: () => window.location.href = '/settings',
    },
    {
        name: 'Go to Boss',
        action: () => window.location.href = '/boss',
    },
    {
        name: 'Show Alert',
        action: async () => {
            const name = await input('What is your name?', 'Please enter your name');
            if (name) {
                alert('Hello, ' + name + '!');
            }
        }
    }
];
`;

const PaletteSettingsPage = () => {
    const [code, setCode] = useState('');

    useEffect(() => {
        const savedCode = localStorage.getItem('paletteCode') || defaultPaletteCode;
        setCode(savedCode);
    }, []);

    const handleSave = () => {
        localStorage.setItem('paletteCode', code);
        alert('Palette code saved! Reload the page to see the changes.');
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>
                Command Palette Code
            </Typography>
            <AceEditor
                mode="javascript"
                theme="tomorrow_night"
                width="100%"
                height="500px"
                value={code}
                onChange={setCode}
                name="palette-code-editor"
                editorProps={{ $blockScrolling: true }}
                setOptions={{ useWorker: false }}
            />
            <Button variant="contained" color="primary" onClick={handleSave} sx={{ mt: 2 }}>
                Save
            </Button>
        </Paper>
    );
};

export default PaletteSettingsPage;
