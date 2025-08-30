
"use client";
import Draggable from 'react-draggable';
import { Fab } from '@mui/material';
import { useCommandPalette } from '@/hooks/useCommandPalette';
import SearchIcon from '@mui/icons-material/Search';

const FloatingPaletteButton = () => {
    const { openPalette } = useCommandPalette();

    return (
        <Draggable>
            <Fab
                size="small"
                onClick={openPalette}
                sx={{
                    position: 'fixed',
                    bottom: '30px',
                    right: '30px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    },
                }}
            >
                <SearchIcon />
            </Fab>
        </Draggable>
    );
};

export default FloatingPaletteButton;
