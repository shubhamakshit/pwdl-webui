import { Grid, Alert as MuiAlert } from "@mui/material";

const SimpleAlert = ({ severity, onClose, message }) => {
    return (
        <Grid container justifyContent="center" spacing={2} padding={1}>
            <Grid item xs={12}>
                <MuiAlert
                    severity={severity}
                    variant="outlined"
                    onClose={onClose}
                >
                    {message}
                </MuiAlert>
            </Grid>
        </Grid>
    );
};

export default SimpleAlert;