// src/hooks/useAlert.js
import { useState } from "react";

/**
 * Custom hook to manage alert state and operations
 * @returns {Object} - Alert state and functions
 */
const useAlert = () => {
    const [alertData, setAlertData] = useState({
        message: "",
        severity: "info",
        onClose: () => setAlertOpen(false)
    });
    const [alertOpen, setAlertOpen] = useState(false);

    const setAlertMessage = (message, severity = "info") => {
        setAlertData((prevState) => ({
            ...prevState,
            message,
            severity
        }));
        setAlertOpen(true);
    };

    const closeAlert = () => {
        setAlertOpen(false);
    };

    return {
        alertData,
        alertOpen,
        setAlertMessage,
        closeAlert
    };
};

export default useAlert;