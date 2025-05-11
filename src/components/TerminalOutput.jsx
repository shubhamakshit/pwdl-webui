import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Typography, IconButton, Stack, Tooltip, Menu, MenuItem, LinearProgress } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import CodeIcon from '@mui/icons-material/Code';

export default function TerminalOutput({
                                           output,
                                           maxHeight = 300,
                                           showCopyButton = true,
                                           title = "Terminal Output",
                                           autoScroll = true,
                                           theme = "dark",
                                           progress = null
                                       }) {
    const [copied, setCopied] = useState(false);
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [showSearch, setShowSearch] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [highlights, setHighlights] = useState([]);
    const [activeHighlightIndex, setActiveHighlightIndex] = useState(0);
    const [showFormatted, setShowFormatted] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const terminalRef = useRef(null);
    const terminalContentRef = useRef(null);
    const fullscreenRef = useRef(isFullscreen);

    // Update ref when state changes
    useEffect(() => {
        fullscreenRef.current = isFullscreen;
    }, [isFullscreen]);

    // Theme configuration
    const themes = {
        dark: {
            background: 'grey.900',
            text: 'grey.100',
            border: 'grey.800',
        },
        light: {
            background: 'grey.100',
            text: 'grey.900',
            border: 'grey.300',
        },
        monokai: {
            background: '#272822',
            text: '#f8f8f2',
            border: '#3e3d32',
        },
        solarized: {
            background: '#002b36',
            text: '#839496',
            border: '#073642',
        }
    };

    const currentTheme = themes[theme] || themes.dark;

    // Handle ESC key press for exiting fullscreen
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape' && fullscreenRef.current) {
                setIsFullscreen(false);
            }
        };

        document.addEventListener('keydown', handleEscKey);
        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, []);

    // Auto-scroll to bottom when output changes - uses throttling for better performance
    useEffect(() => {
        if (autoScroll && terminalContentRef.current) {
            // Use requestAnimationFrame for smoother scrolling
            requestAnimationFrame(() => {
                terminalContentRef.current.scrollTop = terminalContentRef.current.scrollHeight;
            });
        }
    }, [output, autoScroll]);

    // Debounced search for better performance
    const debouncedSearch = useCallback(
        debounce((term) => {
            if (!term.trim()) {
                setHighlights([]);
                return;
            }

            const newHighlights = [];
            const lines = output.split('\n');

            lines.forEach((line, lineIndex) => {
                let startIndex = 0;
                let index;

                while ((index = line.toLowerCase().indexOf(term.toLowerCase(), startIndex)) !== -1) {
                    newHighlights.push({ lineIndex, startIndex: index, endIndex: index + term.length });
                    startIndex = index + 1;
                }
            });

            setHighlights(newHighlights);
            setActiveHighlightIndex(newHighlights.length > 0 ? 0 : -1);
        }, 300),
        [output]
    );

    // Apply debounced search
    useEffect(() => {
        debouncedSearch(searchTerm);
    }, [searchTerm, debouncedSearch]);

    // Scroll to active highlight using requestAnimationFrame for better performance
    useEffect(() => {
        if (highlights.length > 0 && activeHighlightIndex >= 0 && terminalContentRef.current) {
            requestAnimationFrame(() => {
                const highlightedElements = terminalContentRef.current.querySelectorAll('.highlight-active');
                if (highlightedElements.length > 0) {
                    highlightedElements[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        }
    }, [activeHighlightIndex, highlights]);

    const handleCopy = async () => {
        setIsLoading(true);
        try {
            // Using execCommand as a fallback for fullscreen mode where clipboard API might be restricted
            if (document.fullscreenElement) {
                const textarea = document.createElement('textarea');
                textarea.value = output;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                const success = document.execCommand('copy');
                document.body.removeChild(textarea);

                if (success) {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                } else {
                    throw new Error('execCommand copy failed');
                }
            } else {
                await navigator.clipboard.writeText(output);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        } catch (err) {
            console.error('Copy failed:', err);
            // Try fallback method if primary fails
            try {
                const textarea = document.createElement('textarea');
                textarea.value = output;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (fallbackErr) {
                console.error('Fallback copy failed:', fallbackErr);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleMenuOpen = (event) => {
        setMenuAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
    };

    const getLineColor = (content) => {
        // Convert to lowercase for case-insensitive matching
        const lowerContent = content.toLowerCase();

        // Error patterns
        if (lowerContent.includes('error') ||
            lowerContent.includes('fail') ||
            lowerContent.includes('exception')) {
            return '#ff6b6b'; // Light red
        }

        // Warning patterns
        if (lowerContent.includes('warn') ||
            lowerContent.includes('warning')) {
            return '#ffd93d'; // Light yellow
        }

        // Success patterns
        if (lowerContent.includes('success') ||
            lowerContent.includes('completed') ||
            lowerContent.includes('done')) {
            return '#6bff6b'; // Light green
        }

        // Info patterns
        if (lowerContent.includes('info') ||
            lowerContent.includes('information')) {
            return '#6bb5ff'; // Light blue
        }

        // Debug patterns
        if (lowerContent.includes('debug')) {
            return '#d3d3d3'; // Light gray
        }

        // Default color - use the theme's text color
        return 'inherit';
    };

    const handleDownload = () => {
        // Close menu first
        handleMenuClose();

        // Small delay to ensure menu is closed before download starts
        setTimeout(() => {
            try {
                const blob = new Blob([output], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'terminal-output.txt';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } catch (err) {
                console.error('Download failed:', err);
            }
        }, 50);
    };

    // Improved fullscreen handling
    const handleToggleFullscreen = () => {
        // Close menu first to prevent interaction issues
        handleMenuClose();

        setTimeout(() => {
            if (document.fullscreenElement) {
                document.exitFullscreen()
                    .then(() => setIsFullscreen(false))
                    .catch(err => console.error("Error exiting fullscreen:", err));
            } else if (terminalRef.current) {
                terminalRef.current.requestFullscreen()
                    .then(() => setIsFullscreen(true))
                    .catch(err => console.error("Error entering fullscreen:", err));
            }
        }, 50); // Small delay to ensure menu is fully closed
    };

    // Ensure fullscreen state stays in sync with browser
    useEffect(() => {
        const handleFullscreenChange = () => {
            // Update the state to match the actual fullscreen status
            setIsFullscreen(!!document.fullscreenElement);

            // Force a re-render when fullscreen changes to ensure buttons work
            if (document.fullscreenElement) {
                // When entering fullscreen
                document.body.style.overflow = 'hidden';

                // Ensure all Menu components are properly closed
                setMenuAnchorEl(null);
            } else {
                // When exiting fullscreen
                document.body.style.overflow = '';
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            // Reset overflow when component unmounts
            document.body.style.overflow = '';
        };
    }, []);

    const handleToggleFormatting = () => {
        setShowFormatted(!showFormatted);
        handleMenuClose();
    };

    const handleSearchNext = () => {
        if (highlights.length > 0) {
            setActiveHighlightIndex((prevIndex) => (prevIndex + 1) % highlights.length);
        }
    };

    const handleSearchPrevious = () => {
        if (highlights.length > 0) {
            setActiveHighlightIndex((prevIndex) => (prevIndex - 1 + highlights.length) % highlights.length);
        }
    };

    const parseLine = (line, index) => {
        if (!showFormatted) {
            return renderTextWithHighlights(line, index);
        }

        // Enhanced parsing with timestamps and more log levels
        const timestampMatch = line.match(/^(\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\])/);
        const timestamp = timestampMatch ? timestampMatch[1] : null;

        let content = timestamp ? line.substring(timestamp.length) : line;
        let color = getLineColor(content);

        return (
            <Typography component="div" sx={{ color, fontFamily: 'monospace', fontSize: '0.875rem' }}>
                {timestamp && <span style={{ color: 'text.secondary', marginRight: '8px' }}>{timestamp}</span>}
                {renderTextWithHighlights(content, index, timestamp ? timestamp.length : 0)}
            </Typography>
        );
    };

    const renderTextWithHighlights = (text, lineIndex, offset = 0) => {
        if (highlights.length === 0 || !searchTerm) {
            return text;
        }

        const lineHighlights = highlights.filter(h => h.lineIndex === lineIndex);
        if (lineHighlights.length === 0) {
            return text;
        }

        const parts = [];
        let lastIndex = 0;

        lineHighlights.forEach((highlight, idx) => {
            const isActive = highlights.indexOf(highlight) === activeHighlightIndex;

            // Add text before the highlight
            if (highlight.startIndex > lastIndex) {
                parts.push(text.substring(lastIndex, highlight.startIndex));
            }

            // Add highlighted text
            parts.push(
                <span
                    key={`highlight-${lineIndex}-${idx}`}
                    className={isActive ? 'highlight-active' : 'highlight'}
                    style={{
                        backgroundColor: isActive ? '#ffcc00' : '#ffcc0050',
                        color: 'black',
                        padding: '0 2px',
                        borderRadius: '2px',
                    }}
                >
                    {text.substring(highlight.startIndex, highlight.endIndex)}
                </span>
            );

            lastIndex = highlight.endIndex;
        });

        // Add remaining text
        if (lastIndex < text.length) {
            parts.push(text.substring(lastIndex));
        }

        return parts;
    };

    // Memoize the output rendering for better performance
    const renderedOutput = React.useMemo(() => {
        if (!output) {
            return (
                <Typography sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                    No output to display
                </Typography>
            );
        }

        // Only process visible lines for better performance
        const lines = output.split('\n');
        return (
            <Stack spacing={0.25}>
                {lines.map((line, index) => (
                    <Box key={index}>{parseLine(line, index)}</Box>
                ))}
            </Stack>
        );
    }, [output, showFormatted, searchTerm, highlights, activeHighlightIndex]);

    return (
        <Box
            ref={terminalRef}
            sx={{
                backgroundColor: currentTheme.background,
                color: currentTheme.text,
                p: 0,
                borderRadius: 2,
                overflow: 'hidden',
                maxHeight: isFullscreen ? '100vh' : maxHeight,
                height: isFullscreen ? '100vh' : 'auto',
                width: isFullscreen ? '100vw' : '100%',
                position: isFullscreen ? 'fixed' : 'relative',
                top: isFullscreen ? 0 : 'auto',
                left: isFullscreen ? 0 : 'auto',
                zIndex: isFullscreen ? 9999 : 1,
                display: 'flex',
                flexDirection: 'column',
                border: `1px solid ${currentTheme.border}`,
                boxShadow: isFullscreen ? 24 : 2,
                transition: 'all 0.3s ease',
            }}
        >
            {/* Terminal Header */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 2,
                    py: 1,
                    borderBottom: `1px solid ${currentTheme.border}`,
                    backgroundColor: theme === 'light' ? 'grey.200' : 'grey.800',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CodeIcon fontSize="small" />
                    <Typography variant="subtitle2">{title}</Typography>
                    {/* Fake terminal buttons for aesthetic */}
                    {/*<Box sx={{ display: 'flex', gap: 0.5, ml: 2 }}>*/}
                    {/*    <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: 'error.main' }} />*/}
                    {/*    <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: 'warning.main' }} />*/}
                    {/*    <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: 'success.main' }} />*/}
                    {/*</Box>*/}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {showSearch && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                            <Box
                                component="input"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                sx={{
                                    backgroundColor: 'background.paper',
                                    border: 'none',
                                    borderRadius: 1,
                                    p: 0.5,
                                    pl: 1,
                                    color: 'text.primary',
                                    width: 120,
                                    '&:focus': {
                                        outline: 'none',
                                        boxShadow: '0 0 0 2px primary.main',
                                    },
                                }}
                            />
                            <IconButton size="small" onClick={() => setSearchTerm('')}>
                                <CloseIcon fontSize="small" />
                            </IconButton>

                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="caption" sx={{ mx: 1 }}>
                                    {highlights.length > 0 ? `${activeHighlightIndex + 1}/${highlights.length}` : '0/0'}
                                </Typography>
                                <IconButton size="small" onClick={handleSearchPrevious} disabled={highlights.length === 0}>
                                    <Typography variant="caption">↑</Typography>
                                </IconButton>
                                <IconButton size="small" onClick={handleSearchNext} disabled={highlights.length === 0}>
                                    <Typography variant="caption">↓</Typography>
                                </IconButton>
                            </Box>
                        </Box>
                    )}

                    <Tooltip title="Search">
                        <IconButton size="small" color="inherit" onClick={() => setShowSearch(!showSearch)}>
                            {showSearch ? <CloseIcon fontSize="small" /> : <SearchIcon fontSize="small" />}
                        </IconButton>
                    </Tooltip>

                    {showCopyButton && (
                        <Tooltip title={copied ? 'Copied!' : 'Copy'}>
                            <IconButton size="small" color="inherit" onClick={handleCopy}>
                                {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                            </IconButton>
                        </Tooltip>
                    )}

                    <Tooltip title="More options">
                        <IconButton size="small" color="inherit" onClick={handleMenuOpen}>
                            <MoreVertIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <Menu
                        anchorEl={menuAnchorEl}
                        open={Boolean(menuAnchorEl)}
                        onClose={handleMenuClose}
                        // These settings help with fullscreen z-index issues
                        style={{ zIndex: 10000 }}
                        keepMounted
                        disablePortal={false}
                    >
                        <MenuItem onClick={handleToggleFormatting}>
                            <AutoFixHighIcon fontSize="small" sx={{ mr: 1 }} />
                            {showFormatted ? 'Plain Text View' : 'Formatted View'}
                        </MenuItem>
                        <MenuItem onClick={handleDownload}>
                            <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
                            Download Output
                        </MenuItem>
                        <MenuItem onClick={handleToggleFullscreen}>
                            {isFullscreen ? (
                                <>
                                    <FullscreenExitIcon fontSize="small" sx={{ mr: 1 }} />
                                    Exit Fullscreen
                                </>
                            ) : (
                                <>
                                    <FullscreenIcon fontSize="small" sx={{ mr: 1 }} />
                                    Fullscreen
                                </>
                            )}
                        </MenuItem>
                    </Menu>
                </Box>
            </Box>

            {/* Loading indicator */}
            {isLoading && (
                <LinearProgress sx={{ height: 2 }} />
            )}

            {/* Progress Bar */}
            {progress !== null && progress !== undefined && (
                <LinearProgress variant="determinate" value={progress} sx={{ height: 4 }} />
            )}

            {/* Terminal Content */}
            <Box
                ref={terminalContentRef}
                sx={{
                    p: 2,
                    overflow: 'auto',
                    flex: 1,
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                }}
            >
                {renderedOutput}
            </Box>
        </Box>
    );
}

// Utility function to debounce function calls
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}