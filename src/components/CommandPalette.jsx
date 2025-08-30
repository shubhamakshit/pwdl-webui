"use client";
import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    TextField,
    List,
    ListItemButton,
    ListItemText,
    InputAdornment,
    Typography,
    Box
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useJSExecution } from '@/hooks/useJSExecution';

const CommandPalette = ({ open, onClose, commands = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCommands, setFilteredCommands] = useState(commands);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { executeJS } = useJSExecution();

    useEffect(() => {
        if (!open) {
            setSearchTerm('');
            setSelectedIndex(0);
        }
    }, [open]);

    useEffect(() => {
        const newFilteredCommands = searchTerm === ''
            ? commands
            : commands.filter(command =>
                command.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        setFilteredCommands(newFilteredCommands);
        setSelectedIndex(0);
    }, [searchTerm, commands]);

    const handleCommandClick = (command) => {
        command.action();
        onClose();
    };

    const handleKeyDown = (event) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setSelectedIndex((prevIndex) =>
                filteredCommands.length > 0
                    ? (prevIndex + 1) % filteredCommands.length
                    : 0
            );
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setSelectedIndex((prevIndex) =>
                filteredCommands.length > 0
                    ? (prevIndex - 1 + filteredCommands.length) % filteredCommands.length
                    : 0
            );
        } else if (event.key === 'Enter') {
            event.preventDefault();
            if (filteredCommands.length > 0 && filteredCommands[selectedIndex]) {
                handleCommandClick(filteredCommands[selectedIndex]);
            } else {
                executeJS(searchTerm);
                onClose();
            }
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    position: 'fixed',
                    top: '20%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontFamily: 'monospace'
                }
            }}
        >
            <DialogContent>
                <TextField
                    autoFocus
                    fullWidth
                    variant="outlined"
                    placeholder="Enter command or JS code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
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
                                onClick={() => handleCommandClick(command)}
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
            </DialogContent>
        </Dialog>
    );
};

export default CommandPalette;