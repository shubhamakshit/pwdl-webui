
"use client";
import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button
} from '@mui/material';

const InputDialog = ({ open, title, message, onConfirm, onCancel }) => {
    const [inputValue, setInputValue] = useState('');

    const handleConfirm = () => {
        onConfirm(inputValue);
    };

    return (
        <Dialog open={open} onClose={onCancel} fullWidth maxWidth="sm">
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    fullWidth
                    variant="outlined"
                    label={message}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel}>Cancel</Button>
                <Button onClick={handleConfirm}>Confirm</Button>
            </DialogActions>
        </Dialog>
    );
};

export default InputDialog;
