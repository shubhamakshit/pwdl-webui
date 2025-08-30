
"use client";
import { useState, useEffect } from 'react';
import { useJSExecution } from '@/hooks/useJSExecution';
import InlineCommandPalette from './InlineCommandPalette';

const CommandPalette = ({ open, onClose, commands = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCommands, setFilteredCommands] = useState(commands);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { executeJS } = useJSExecution();
    const [inputMode, setInputMode] = useState(null); // { command, prompt }

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    useEffect(() => {
        if (!open) {
            setSearchTerm('');
            setSelectedIndex(0);
            setInputMode(null);
        }
    }, [open]);

    useEffect(() => {
        if (inputMode) {
            setFilteredCommands([]);
        } else {
            const newFilteredCommands = searchTerm === ''
                ? commands
                : commands.filter(command =>
                    command.name.toLowerCase().includes(searchTerm.toLowerCase())
                );
            setFilteredCommands(newFilteredCommands);
            setSelectedIndex(0);
        }
    }, [searchTerm, commands, inputMode]);

    const handleCommandClick = (command) => {
        if (command.needsInput) {
            setInputMode({ command, prompt: command.prompt || `Enter input for ${command.name}` });
            setSearchTerm('');
        } else {
            command.action();
            onClose();
        }
    };

    const handleKeyDown = (event) => {
        if (inputMode) {
            if (event.key === 'Enter') {
                event.preventDefault();
                inputMode.command.action(searchTerm);
                onClose();
            }
            return;
        }

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setSelectedIndex((prevIndex) =>
                filteredCommands.length > 0
                    ? (prevIndex + 1) % filteredCommands.length
                    : 0
            );
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setSelectedIndex((prevIndex) =>
                filteredCommands.length > 0
                    ? (prevIndex - 1 + filteredCommands.length) % filteredCommands.length
                    : 0
            );
        } else if (event.key === 'Enter') {
            event.preventDefault();
            if (filteredCommands.length > 0 && filteredCommands[selectedIndex]) {
                handleCommandClick(filteredCommands[selectedIndex]);
            } else {
                executeJS(searchTerm);
                onClose();
            }
        }
    };

    if (!open) {
        return null;
    }

    return (
        <InlineCommandPalette
            searchTerm={searchTerm}
            onSearchTermChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            filteredCommands={filteredCommands}
            selectedIndex={selectedIndex}
            onCommandClick={handleCommandClick}
            executeJS={executeJS}
            onClose={onClose}
            placeholder={inputMode ? inputMode.prompt : "Enter command or JS code..."}
        />
    );
};

export default CommandPalette;
