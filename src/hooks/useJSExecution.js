
"use client";
import { createContext, useContext, useState, useCallback } from 'react';
import SimpleSnackbar from '@/components/SimpleSnackbar';
import { useAlertContext } from '@/contexts/AlertProvider';
import WebSettingsManager from '../lib/WebSettingsManager';

const JSExecutionContext = createContext();

export const useJSExecution = () => useContext(JSExecutionContext);

export const JSExecutionProvider = ({ children }) => {
    const { setAlertMessage } = useAlertContext();
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });

    const showSnackbar = useCallback((message) => {
        setSnackbar({ open: true, message });
    }, []);

    const contextValue = {
        alert: setAlertMessage,
        snackbar: showSnackbar,
        WebSettingsManager
    };

    const executeJS = (code) => {
        try {
            const func = new Function(...Object.keys(contextValue), code);
            func(...Object.values(contextValue));
        } catch (error) {
            setAlertMessage(`Error executing script: ${error.message}`, 'error');
        }
    };

    return (
        <JSExecutionContext.Provider value={{ executeJS, ...contextValue }}>
            {children}
            <SimpleSnackbar open={snackbar.open} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
        </JSExecutionContext.Provider>
    );
};
