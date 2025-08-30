
"use client";
import { useEffect, useState } from 'react';
import WebSettingsManager from '@/lib/WebSettingsManager';
import FloatingPaletteButton from './FloatingPaletteButton';

const FloatingPaletteButtonWrapper = () => {
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        const settings = WebSettingsManager.getSettings();
        setShowButton(settings.enableFloatingPaletteButton);

        const handleStorageChange = () => {
            const updatedSettings = WebSettingsManager.getSettings();
            setShowButton(updatedSettings.enableFloatingPaletteButton);
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    return showButton ? <FloatingPaletteButton /> : null;
};

export default FloatingPaletteButtonWrapper;
