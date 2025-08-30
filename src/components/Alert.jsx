import { Grid, Alert as MuiAlert } from "@mui/material";
import { useEffect } from "react";

const SimpleAlert = ({ severity, onClose, message }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => {
            clearTimeout(timer);
        };
    }, [onClose]);

    return (
        <Grid container justifyContent="center" spacing={2} sx={{
            position: 'fixed',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'auto',
            zIndex: 9999,
        }}>
            <Grid item>
                <MuiAlert
                    severity={severity}
                    variant="outlined"
                    onClose={onClose}
                    sx={{ minWidth: '300px' }}
                >
                    {message}
                </MuiAlert>
            </Grid>
        </Grid>
    );
};

export default SimpleAlert;

