
"use client";
import { createContext, useContext } from 'react';
import SimpleAlert from '@/components/Alert';
import useAlert from '@/hooks/useAlert';

const AlertContext = createContext();

export const useAlertContext = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
    const { alertData, alertOpen, setAlertMessage, closeAlert } = useAlert();

    return (
        <AlertContext.Provider value={{ setAlertMessage }}>
            {alertOpen && (
                <SimpleAlert
                    message={alertData.message}
                    severity={alertData.severity}
                    onClose={closeAlert}
                />
            )}
            {children}
        </AlertContext.Provider>
    );
};
