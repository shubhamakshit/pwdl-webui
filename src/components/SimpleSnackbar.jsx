import {
    Button,
    Snackbar,
    IconButton,
    SnackbarContent,
    Stack
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

const SimpleSnackbar = ({
                            open,
                            message,
                            action,
                            handleClose
                        }) => {
    return (
        <Snackbar
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
            open={open}
            autoHideDuration={6000}
            onClose={handleClose}
        >
            <SnackbarContent
                message={message}
                action={
                    <Stack direction="row" spacing={2}>
                        {action && (
                            <Button color="secondary" size="small" onClick={handleClose}>
                                {action}
                            </Button>
                        )}
                        <IconButton
                            size="small"
                            aria-label="close"
                            color="inherit"
                            onClick={handleClose}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Stack>
                }
            />
        </Snackbar>
    );
};

export default SimpleSnackbar;