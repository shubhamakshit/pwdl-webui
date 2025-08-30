
"use client";
import { useEffect, useRef } from 'react';
import {
    TextField,
    List,
    ListItemButton,
    ListItemText,
    InputAdornment,
    Typography,
    Box,
    Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const InlineCommandPalette = ({
    searchTerm,
    onSearchTermChange,
    onKeyDown,
    filteredCommands,
    selectedIndex,
    onCommandClick,
    executeJS,
    onClose,
    placeholder = "Enter command or JS code..."
}) => {
    const paletteRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (paletteRef.current && !paletteRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    return (
        <Paper
            ref={paletteRef}
            elevation={4}
            sx={{
                position: 'fixed',
                top: '20%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '50%',
                maxWidth: '600px',
                zIndex: 1300,
                fontFamily: 'monospace'
            }}
        >
            <TextField
                autoFocus
                fullWidth
                variant="outlined"
                placeholder={placeholder}
                value={searchTerm}
                onChange={onSearchTermChange}
                onKeyDown={onKeyDown}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                    sx: { fontFamily: 'monospace' }
                }}
            />
            <List>
                {filteredCommands.length > 0 ? (
                    filteredCommands.map((command, index) => (
                        <ListItemButton
                            key={index}
                            selected={index === selectedIndex}
                            onClick={() => onCommandClick(command)}
                            sx={{
                                '&.Mui-selected': {
                                    backgroundColor: 'action.selected',
                                },
                                '&.Mui-selected:hover': {
                                    backgroundColor: 'action.selected',
                                }
                            }}
                        >
                            <ListItemText
                                primary={command.name}
                                sx={{ fontFamily: 'monospace' }}
                            />
                        </ListItemButton>
                    ))
                ) : (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'monospace' }}>
                            No commands found. Type JS code and press Enter to execute.
                        </Typography>
                    </Box>
                )}
            </List>
        </Paper>
    );
};

export default InlineCommandPalette;
