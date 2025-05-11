import Alert from "@mui/material/Alert";

const PWAlert = ({open,severity,children,onClose,sx}) => {
    if (!open) return null;

    return(
        <Alert severity={severity || "info"} onClose={onClose || null} variant="outlined" sx={sx}>
            {children}
        </Alert>
    )
};

export  default PWAlert;