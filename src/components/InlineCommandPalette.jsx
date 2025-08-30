
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
    Paper,
    useMediaQuery,
    useTheme
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
    placeholder = "Enter command or JS code...",
    autoFocus = true
}) => {
    const paletteRef = useRef(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
                top: '10vh',
                left: '50%',
                transform: 'translateX(-50%)',
                width: isMobile ? '90vw' : '50vw',
                maxWidth: '600px',
                zIndex: 1300,
                fontFamily: 'monospace',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '80vh',
            }}
        >
            <TextField
                autoFocus={autoFocus}
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
            <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
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
            </Box>
        </Paper>
    );
};

export default InlineCommandPalette;
