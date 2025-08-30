
"use client";
import { createContext, useContext, useState, useCallback } from 'react';
import PWAlert from '@/components/PWAlert';
import SimpleSnackbar from '@/components/SimpleSnackbar';
import InputDialog from '@/components/InputDialog';

const JSExecutionContext = createContext();

export const useJSExecution = () => useContext(JSExecutionContext);

export const JSExecutionProvider = ({ children }) => {
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });
    const [inputDialog, setInputDialog] = useState({ open: false, title: '', message: '', onConfirm: () => {}, onCancel: () => {} });

    const showAlert = useCallback((message, severity = 'info') => {
        setAlert({ open: true, message, severity });
    }, []);

    const showSnackbar = useCallback((message) => {
        setSnackbar({ open: true, message });
    }, []);

    const showInput = useCallback((title, message) => {
        return new Promise((resolve) => {
            const onConfirm = (value) => {
                setInputDialog({ open: false });
                resolve(value);
            };
            const onCancel = () => {
                setInputDialog({ open: false });
                resolve(null);
            };
            setInputDialog({ open: true, title, message, onConfirm, onCancel });
        });
    }, []);

    const contextValue = {
        alert: showAlert,
        snackbar: showSnackbar,
        input: showInput,
    };

    const executeJS = (code) => {
        try {
            const func = new Function(...Object.keys(contextValue), code);
            func(...Object.values(contextValue));
        } catch (error) {
            showAlert(`Error executing script: ${error.message}`, 'error');
        }
    };

    return (
        <JSExecutionContext.Provider value={{ executeJS, ...contextValue }}>
            {children}
            <PWAlert open={alert.open} onClose={() => setAlert({ ...alert, open: false })} message={alert.message} severity={alert.severity} />
            <SimpleSnackbar open={snackbar.open} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
            <InputDialog {...inputDialog} />
        </JSExecutionContext.Provider>
    );
};
