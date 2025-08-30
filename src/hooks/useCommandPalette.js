
"use client";
import { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import CommandPalette from '@/components/CommandPalette.jsx';
import { useJSExecution } from '@/hooks/useJSExecution';

const CommandPaletteContext = createContext();

export const useCommandPalette = () => useContext(CommandPaletteContext);

const defaultPaletteCode = `
return [
    {
        name: 'Go to Home',
        action: () => window.location.href = '/',
    },
    {
        name: 'Go to Settings',
        action: () => window.location.href = '/settings',
    },
    {
        name: 'Go to Boss',
        action: () => window.location.href = '/boss',
    },
];
`;

export const CommandPaletteProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [commands, setCommands] = useState([]);
    const { alert, snackbar, input } = useJSExecution();

    useEffect(() => {
        const loadCommands = async () => {
            const code = localStorage.getItem('paletteCode') || defaultPaletteCode;
            try {
                const context = { alert, snackbar, input };
                const func = Object.getPrototypeOf(async function(){}).constructor(...Object.keys(context), code);
                const result = await func(...Object.values(context));
                setCommands(result || []);
            } catch (error) {
                console.error("Error executing palette code:", error);
                setCommands([]);
            }
        };
        loadCommands();
    }, [alert, snackbar, input]);

    const openPalette = useCallback(() => setIsOpen(true), []);
    const closePalette = useCallback(() => setIsOpen(false), []);

    const contextValue = useMemo(() => ({
        openPalette,
        closePalette,
    }), [openPalette, closePalette]);

    return (
        <CommandPaletteContext.Provider value={contextValue}>
            {children}
            <CommandPalette open={isOpen} onClose={closePalette} commands={commands} />
        </CommandPaletteContext.Provider>
    );
};
