
"use client";
import { useEffect } from 'react';
import { useCommandPalette } from '@/hooks/useCommandPalette.js';

const CommandPaletteInitializer = () => {
    const { openPalette } = useCommandPalette();

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.ctrlKey && event.key === 'p') {
                event.preventDefault();
                openPalette();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        let hammer;
        if (typeof window !== 'undefined') {
            const Hammer = require('hammerjs');
            hammer = new Hammer(document.body);
            hammer.get('doubletap').set({ pointers: 3, event: 'doubletap' });

            const handleDoubleTap = () => {
                openPalette();
            };

            hammer.on('doubletap', handleDoubleTap);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (hammer) {
                hammer.destroy();
            }
        };
    }, [openPalette]);

    return null;
};

export default CommandPaletteInitializer;
