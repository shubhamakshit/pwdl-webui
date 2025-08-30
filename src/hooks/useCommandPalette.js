
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
    {
        name: 'Toggle Dark Mode',
        action: () => {
            const currentValue = WebSettingsManager.getValue('dark_mode');
            WebSettingsManager.changeValue('dark_mode', !currentValue);
        },
    },
    {
        name: 'Toggle Khazana',
        action: () => {
            const currentValue = WebSettingsManager.getValue('khazana_enabled');
            WebSettingsManager.changeValue('khazana_enabled', !currentValue);
        },
    },
    {
        name: 'Toggle Login',
        action: () => {
            const currentValue = WebSettingsManager.getValue('login_enabled');
            WebSettingsManager.changeValue('login_enabled', !currentValue);
        },
    },
    {
        name: 'Set Name',
        action: (name) => {
            WebSettingsManager.changeValue('name', name);
        },
        needsInput: true,
        prompt: 'Enter your name',
    },
    {
        name: 'Set API URL',
        action: (url) => {
            WebSettingsManager.changeValue('api', url);
        },
        needsInput: true,
        prompt: 'Enter API URL',
    },
    {
        name: 'Reset Settings',
        action: () => {
            WebSettingsManager.resetSettings();
        },
    },
    {
        name: 'Toggle Easter Egg',
        action: () => {
            const currentValue = WebSettingsManager.getValue('enable_easter_egg');
            WebSettingsManager.changeValue('enable_easter_egg', !currentValue);
        },
    },
];
`;

export const CommandPaletteProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [commands, setCommands] = useState([]);
    const [autoFocus, setAutoFocus] = useState(true);
    const [history, setHistory] = useState([]);
    const { alert, snackbar, WebSettingsManager } = useJSExecution();

    useEffect(() => {
        const storedHistory = localStorage.getItem('commandPaletteHistory');
        if (storedHistory) {
            setHistory(JSON.parse(storedHistory));
        }
    }, []);

    const recordCommand = (command) => {
        const newHistory = [command.name, ...history.filter(c => c !== command.name)];
        setHistory(newHistory);
        localStorage.setItem('commandPaletteHistory', JSON.stringify(newHistory));
    };

    useEffect(() => {
        const loadCommands = async () => {
            const code = localStorage.getItem('paletteCode') || defaultPaletteCode;
            try {
                const context = { alert, snackbar, WebSettingsManager };
                const func = Object.getPrototypeOf(async function(){}).constructor(...Object.keys(context), code);
                const result = await func(...Object.values(context));
                
                const sortedCommands = [...result].sort((a, b) => {
                    const aIndex = history.indexOf(a.name);
                    const bIndex = history.indexOf(b.name);
                    if (aIndex === -1 && bIndex === -1) return 0;
                    if (aIndex === -1) return 1;
                    if (bIndex === -1) return -1;
                    return aIndex - bIndex;
                });

                setCommands(sortedCommands || []);
            } catch (error) {
                console.error("Error executing palette code:", error);
                setCommands([]);
            }
        };
        loadCommands();
    }, [alert, snackbar, WebSettingsManager, history]);

    const openPalette = useCallback((options) => {
        if (options && options.autoFocus === false) {
            setAutoFocus(false);
        } else {
            setAutoFocus(true);
        }
        setIsOpen(true);
    }, []);

    const closePalette = useCallback(() => {
        setIsOpen(false);
    }, []);

    const contextValue = useMemo(() => ({
        openPalette,
        closePalette,
    }), [openPalette, closePalette]);

    return (
        <CommandPaletteContext.Provider value={contextValue}>
            {children}
            <CommandPalette open={isOpen} onClose={closePalette} commands={commands} autoFocus={autoFocus} onCommandExecuted={recordCommand} />
        </CommandPaletteContext.Provider>
    );
};
