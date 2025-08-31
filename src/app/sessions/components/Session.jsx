import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import {
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    IconButton,
    Button,
    Tooltip,
    Grid,
    Backdrop,
    CircularProgress,
    Paper,
    Box,
    Divider,
    Chip,
    Stack
} from "@mui/material";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import LaunchIcon from '@mui/icons-material/Launch';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from "@mui/icons-material/Delete";
import FileCopyIcon from '@mui/icons-material/FileCopy';
import ApiIcon from '@mui/icons-material/Api';
import ErrorIcon from '@mui/icons-material/Error';
import { RefreshRounded, AccessTime, Folder } from "@mui/icons-material";
import Typography from "@mui/material/Typography";

import { CopyUtils } from '@/lib/copyUtils';
import Utils from '@/lib/utils';
import API from "@/Server/api";
import SimpleAlert from "@/components/Alert";
import CustomContextMenu from "@/components/CustomContextMenu";
import SimpleSnackbar from "@/components/SimpleSnackbar";
import PWAlert from "@/components/PWAlert";

// Memoized Task Item component to prevent unnecessary re-renders
const TaskItem = memo(({ task, handleContextMenu, setContextOptions }) => {
    const handleTaskContextMenu = (e) => {
        setContextOptions({
            copy: {
                label: "Copy URL",
                action: () => CopyUtils.copyToClipboard(API.getFile_TaskUrl(task.url))
            },
        });
        handleContextMenu(e);
    };

    return (
        <Paper elevation={1} sx={{ mb: 1, borderRadius: 2 }}>
            <ListItem
                onContextMenu={handleTaskContextMenu}
                sx={{
                    transition: 'all 0.2s',
                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                }}
            >
                <ListItemAvatar>
                    <Avatar sx={{
                        bgcolor: task.status === 'completed' ? 'success.light' : 'error.light',
                        color: '#fff'
                    }}>
                        {task.name[0]}
                    </Avatar>
                </ListItemAvatar>
                <ListItemText
                    primary={
                        <Typography variant="body1" fontWeight="medium" noWrap>
                            {task.name}
                        </Typography>
                    }
                    secondary={
                        <Typography variant="caption" color="text.secondary" noWrap>
                            {task.id}
                        </Typography>
                    }
                />
                {task.status === 'completed' ? (
                    <Tooltip title="Download File">
                        <IconButton
                            edge="end"
                            aria-label="download"
                            href={API.getFile_TaskUrl(task.url).url}
                            target="_blank"
                            color="primary"
                            size="small"
                            sx={{
                                boxShadow: 1,
                                '&:hover': { transform: 'scale(1.1)' },
                                transition: 'transform 0.2s'
                            }}
                        >
                            <CloudDownloadIcon />
                        </IconButton>
                    </Tooltip>
                ) : (
                    <Tooltip title="Download Failed">
                        <IconButton
                            edge="end"
                            aria-label="error"
                            color="error"
                            size="small"
                            sx={{
                                boxShadow: 1,
                                '&:hover': { transform: 'scale(1.1)' },
                                transition: 'transform 0.2s'
                            }}
                        >
                            <ErrorIcon />
                        </IconButton>
                    </Tooltip>
                )}
            </ListItem>
        </Paper>
    );
});

// Memoized Session Item component
const SessionItem = memo(({ session, index, sessionIds, handleContextMenu, setContextOptions, sessionActions, handleCopy, renderTasks }) => {
    const formattedDate = useMemo(() => {
        return new Date(session.timestamp).toLocaleString();
    }, [session.timestamp]);

    const handleSessionContextMenu = (e) => {
        setContextOptions(sessionActions(sessionIds[index], session));
        handleContextMenu(e);
    };

    return (
        <Paper
            elevation={2}
            sx={{
                mb: 2,
                borderRadius: 2,
                overflow: 'hidden',
                transition: 'box-shadow 0.3s',
                '&:hover': { boxShadow: 4 }
            }}
        >
            <Accordion sx={{ boxShadow: 'none' }}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`panel-${session.id}-content`}
                    id={`panel-${session.id}-header`}
                    onContextMenu={handleSessionContextMenu}
                    // sx={{
                    //     // color: 'primary.contrastText',
                    //     '& .MuiAccordionSummary-expandIconWrapper': {
                    //         color: 'primary.contrastText',
                    //     },
                    // }}
                >
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={4}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Folder />
                                <Typography variant="subtitle1" fontWeight="bold" noWrap>
                                    {session.name}
                                </Typography>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <AccessTime fontSize="small" />
                                <Typography variant="body2" noWrap>
                                    {formattedDate}
                                </Typography>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Chip
                                size="small"
                                label={`${Object.keys(session.tasks).length} files`}
                                color="secondary"
                                sx={{ fontWeight: 'medium' }}
                            />
                        </Grid>
                    </Grid>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 2, backgroundColor: 'background.paper' }}>
                    <Box sx={{ mb: 2 }}>
                        <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
                            {Object.values(sessionActions(sessionIds[index], session)).map((action, actionIndex) => (
                                <Tooltip key={`action-${actionIndex}`} title={action.tooltip}>
                                    <Button
                                        size="small"
                                        color={action.color || "primary"}
                                        onClick={action.action}
                                        href={action.href}
                                        variant="outlined"
                                        startIcon={action.icon}
                                        sx={{
                                            borderRadius: 2,
                                            textTransform: 'none'
                                        }}
                                    >
                                        {action.label}
                                    </Button>
                                </Tooltip>
                            ))}
                        </Stack>
                    </Box>
                        {/*<Divider sx={{ my: 2 }} />*/}
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                        Files in this session:
                    </Typography>
                    <List disablePadding>
                        {renderTasks(session.tasks)}
                    </List>
                </AccordionDetails>
            </Accordion>
        </Paper>
    );
});

const Session = ({ clientId }) => {
    const [sessions, setSessions] = useState([]);
    const [sessionIds, setSessionIds] = useState([]);
    const [clientNotFound, setClientNotFound] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reRun, setReRun] = useState(false);

    const [contextOptions, setContextOptions] = useState({});
    const [contextMenu, setContextMenu] = useState(null);
    const [showMessage, setShowMessage] = useState(false);
    const [message, setMessage] = useState("");

    const client_id = clientId || localStorage.getItem('client_id');

    useEffect(() => {
        // Move event listener to useEffect to prevent multiple attachments
        const preventContextMenu = (e) => e.preventDefault();
        document.querySelector('html').addEventListener('contextmenu', preventContextMenu);

        return () => {
            // Cleanup listener on component unmount
            document.querySelector('html').removeEventListener('contextmenu', preventContextMenu);
        };
    }, []);

    const handleContextMenu = useCallback((event) => {
        event.preventDefault();
        setContextMenu({
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6
        });
    }, []);

    const handleClose = useCallback(() => setContextMenu(null), []);

    const handleDeleteSession = useCallback(async (sessionId) => {
        try {
            setLoading(true);
            await fetch(API.DELETE_SESSION(client_id, sessionId));
            setReRun(prev => !prev);
            setMessage("Session deleted successfully");
            setShowMessage(true);
        } catch (err) {
            console.error('Failed to delete session:', err);
            setMessage("Failed to delete session");
            setShowMessage(true);
        } finally {
            setLoading(false);
        }
    }, [client_id]);

    const handleCopy = useCallback((item, event) => {
        event?.stopPropagation();
        const success = CopyUtils.copyToClipboard(item);
        setMessage(success ? "Copied to clipboard!" : "Failed to copy");
        setShowMessage(true);
    }, []);

    const allLinksInSession = useCallback((tasks) => {
        return Object.values(tasks).map(task => API.getFile_TaskUrl(task.url).url);
    }, []);

    const allLinksInSeperateLinesInASession = useCallback((sessionId) => {
        const tasks = sessions[sessionIds.indexOf(sessionId)].tasks;
        return allLinksInSession(tasks).join('\n');
    }, [sessions, sessionIds, allLinksInSession]);

    const regenerateUrlForASession = useCallback((tasks, resume = null) => {
        const baseUrl = window.location.origin;
        const resumeParam = resume ? `resume=${resume}&` : "";
        const taskParams = Object.values(tasks)
            .map(task => `${task.name}=${task.id}`)
            .join('&');
        return `${baseUrl}?${resumeParam}${taskParams}`;
    }, []);

    const handleUnfinished = useCallback((sessionId) => {
        const thisSession = sessions[sessionIds.indexOf(sessionId)].tasks;
        const unfinishedTasks = Object.values(thisSession)
            .filter(task => task.status !== "completed");

        if (unfinishedTasks.length > 0) {
            window.location = regenerateUrlForASession(unfinishedTasks, sessionId);
        } else {
            setMessage("No unfinished tasks found");
            setShowMessage(true);
        }
    }, [sessions, sessionIds, regenerateUrlForASession]);

    const getClientData = useCallback(async () => {
        try {
            const response = await fetch(API.GET_CLIENT_DETAILS(clientId));
            if (!response.ok) throw new Error('Failed to fetch client data');

            const data = await response.json();

            // Convert and sort sessions
            const sessionsArray = Object.entries(data.sessions)
                .map(([id, session]) => ({
                    id,
                    ...session
                }))
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            setSessions(sessionsArray);
            setSessionIds(sessionsArray.map(session => session.id));
            setClientNotFound(false);
        } catch (err) {
            console.error('Failed to fetch client data:', err);
            setClientNotFound(true);
        }
    }, [clientId]);

    useEffect(() => {
        setLoading(true);
        getClientData().finally(() => {
            setLoading(false);
        });
    }, [reRun, client_id, getClientData]);

    const sessionActions = useCallback((sessionId, session) => ({
        delete: {
            label: "Delete",
            tooltip: "Delete session",
            color: "error",
            icon: <DeleteIcon />,
            action: (e) => {
                e?.stopPropagation();
                handleDeleteSession(sessionId);
            },
        },
        copyLinks: {
            label: "Copy Links",
            tooltip: "Copy all download links",
            action: (e) => {
                e?.stopPropagation();
                handleCopy(allLinksInSeperateLinesInASession(sessionId), e);
            },
            icon: <FileCopyIcon />,
        },
        copyCurl: {
            label: "Copy Curl",
            tooltip: "Copy Curl command for all files",
            icon: <ApiIcon />,
            action: (e) => {
                e?.stopPropagation();
                // console.log((allLinksInSession(session.tasks)));
                handleCopy(
                    Utils.urlsToCurl(allLinksInSession(session.tasks)),
                    e
                );
            },
        },
        // redownload: {
        //     label: "ReDownload",
        //     tooltip: "ReDownload all files in this session",
        //     color: "warning",
        //     icon: <LaunchIcon />,
        //     href: regenerateUrlForASession(session.tasks),
        // },
        // openUnfinished: {
        //     label: "Open Unfinished",
        //     tooltip: "Download only unfinished files",
        //     color: "info",
        //     icon: <LaunchIcon />,
        //     action: (e) => {
        //         e?.stopPropagation();
        //         handleUnfinished(sessionId);
        //     },
        // },
    }), [handleDeleteSession, handleCopy, allLinksInSeperateLinesInASession, allLinksInSession, regenerateUrlForASession, handleUnfinished]);

    const renderTasks = useCallback((tasks) => {
        return Object.values(tasks).map((task, taskIndex) => (
            <TaskItem
                key={taskIndex}
                task={task}
                handleContextMenu={handleContextMenu}
                setContextOptions={setContextOptions}
            />
        ));
    }, [handleContextMenu]);

    const renderSessions = useMemo(() => {
        return sessions.map((session, index) => (
            <SessionItem
                key={session.id}
                session={session}
                index={index}
                sessionIds={sessionIds}
                handleContextMenu={handleContextMenu}
                setContextOptions={setContextOptions}
                sessionActions={sessionActions}
                handleCopy={handleCopy}
                renderTasks={renderTasks}
            />
        ));
    }, [sessions, sessionIds, handleContextMenu, sessionActions, handleCopy, renderTasks]);

    // Refresh button with loading state
    const refreshButton = useMemo(() => (
        <Button
            variant="outlined"
            endIcon={<RefreshRounded />}
            color="primary"
            fullWidth
            // sx={{
            //     py: 1.5,
            //     mb: 3,
            //     borderRadius: 2,
            //     boxShadow: 2,
            //     '&:hover': {
            //         boxShadow: 4,
            //         transform: 'translateY(-2px)'
            //     },
            //     transition: 'all 0.3s'
            // }}
            onClick={() => setReRun(prev => !prev)}
            disabled={loading}
        >
            <Typography variant="button">
                {loading ? "Loading..." : "Refresh Sessions"}
            </Typography>
        </Button>
    ), [loading]);

    return (
        <Box sx={{ p: 2, maxWidth: '1200px', mx: 'auto' }}>


            <Backdrop
                sx={{
                    color: '#fff',
                    zIndex: theme => theme.zIndex.drawer + 1
                }}
                open={loading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>


            <Box sx={{ width: '100%' }}>
                {clientNotFound && (
                    <Box>
                        <PWAlert
                            open={clientNotFound}
                            severity="error"
                            sx={{m:1}}
                            onClose={() => {}}
                        >
                            Client Not Found - Please check your connection
                        </PWAlert>
                    </Box>
                )}
                {refreshButton}

                {sessions.length === 0 && !loading ? (
                    <PWAlert
                        open={sessions.length === 0 && !loading}
                        severity="info"
                    >
                        <Typography variant="h6" gutterBottom>
                            No Sessions Found
                        </Typography>
                        <Typography variant="body1">
                            Complete some downloads for them to appear here!
                        </Typography>
                    </PWAlert>
                ) : (
                    renderSessions
                )}
            </Box>

            <CustomContextMenu
                contextMenu={contextMenu}
                handleClose={handleClose}
                options={contextOptions}
            />
            <SimpleSnackbar
                message={message}
                handleClose={() => setShowMessage(false)}
                open={showMessage}
            />
        </Box>
    );
};

export default Session;