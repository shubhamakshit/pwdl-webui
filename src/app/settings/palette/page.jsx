
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
// WebSettingsManager - an object to manage application settings.
//    - WebSettingsManager.getValue(key)
//    - WebSettingsManager.changeValue(key, value)
//    - WebSettingsManager.resetSettings()

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
        name: 'Toggle Dark Mode',
        action: () => {
            const currentValue = WebSettingsManager.getValue('dark_mode');
            WebSettingsManager.changeValue('dark_mode', !currentValue);
        },
    },
    {
        name: 'Toggle Khazana',
        action: () => {
            const currentValue = WebSettingsManager.getValue('khazana_enabled');
            WebSettingsManager.changeValue('khazana_enabled', !currentValue);
        },
    },
    {
        name: 'Toggle Login',
        action: () => {
            const currentValue = WebSettingsManager.getValue('login_enabled');
            WebSettingsManager.changeValue('login_enabled', !currentValue);
        },
    },
    {
        name: 'Set Name',
        action: (name) => {
            WebSettingsManager.changeValue('name', name);
        },
        needsInput: true,
        prompt: 'Enter your name',
    },
    {
        name: 'Set API URL',
        action: (url) => {
            WebSettingsManager.changeValue('api', url);
        },
        needsInput: true,
        prompt: 'Enter API URL',
    },
    {
        name: 'Reset Settings',
        action: () => {
            WebSettingsManager.resetSettings();
        },
    },
    {
        name: 'Toggle Easter Egg',
        action: () => {
            const currentValue = WebSettingsManager.getValue('enable_easter_egg');
            WebSettingsManager.changeValue('enable_easter_egg', !currentValue);
        },
    },
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
