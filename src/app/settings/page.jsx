'use client';

import React from 'react';
import PrefsComponent from '@/components/PrefsComponent';
import WebSettingsManager from '@/lib/WebSettingsManager';
import { Button } from '@mui/material';
import API from "@/Server/api";
import Stack from "@mui/material/Stack";

const fetchPrefs = async () => {
    const response = await fetch(API.prefs.get_url);
    if (!response.ok) {
        throw new Error('Failed to fetch preferences');
    }
    return response.json();
};

const updatePrefs = async (data) => {
    const response = await fetch(API.prefs.update_url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Failed to update preferences');
    }
    return response.json();
};

export default function SettingsPage() {
    return (
        <Stack spacing={2}>
            <PrefsComponent
                expanded={false}
                getData={fetchPrefs}
                updateData={updatePrefs}
                title="System Settings"
            />
            <PrefsComponent
                expanded={false}
                getData={() => WebSettingsManager.getSettings()}
                updateData={(data) => {
                    WebSettingsManager.updateSettings(data);
                    WebSettingsManager.saveSettingsToLocalStorage();
                }}
                title="Web Settings"
                keyModifierFunction={(key) => 
                    key.split('_')
                       .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                       .join(' ')
                }
                tooltipObject={WebSettingsManager.getTooltips()}
            />
            <Button 
                variant="outlined" 
                color="error" 
                onClick={() => {
                    WebSettingsManager.resetSettings();
                    window.location.reload();
                }}
                sx={{ mt: 2 }}
            >
                Reset Web Settings
            </Button>
            
        </Stack>
    );
}