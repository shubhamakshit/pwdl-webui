"use client";
import {useEffect, useState, useMemo, Suspense} from "react";
import Details from "@/components/Details";
import {Box, Button, Grid, Paper, useTheme, CircularProgress} from "@mui/material";
import LocalHandler from "@/localHandler";
import Downloader from "@/Server/Downloader";
import DownloadIcon from "@mui/icons-material/Download";
import TerminalOutput from "@/components/TerminalOutput";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import Utils from "@/lib/utils";
import PWAlert from "@/components/PWAlert";
import Stack from "@mui/material/Stack";
import { useSearchParams } from 'next/navigation';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import API from "@/Server/api";
import DownloadNotification from "@/components/DownloadNotification";

const FullDetailsWithoutSuspense = () => {
    const [listOfDetails, changeListOfDetails] = useState([]);
    const [isInverted,setIsInverted] = useState(false);
    const theme = useTheme();
    const client_id = LocalHandler.getClientId();
    const [session_id, setSessionId] = useState(LocalHandler.getSessionId(true));

    const [taskIds, setTaskIds] = useState([]);
    const [progress, setProgress] = useState(0);
    const [downloading, setDownloading] = useState(false);
    const [output, setOutput] = useState({});
    const params = useSearchParams();
    const [completedTasks, setCompletedTasks] = useState([]);
    const [alertData, setAlertData] = useState({
        message: "",
        severity: "info",
        onClose: () => setAlertOpen(false)
    });
    const [alertOpen, setAlertOpen] = useState(false);
    // Add these new state variables near your other useState declarations
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [notificationData, setNotificationData] = useState({
        message: '',
        downloadUrl: '',
        downloadName: '',
        severity: 'success'
    });

    const areAllValid = useMemo(() =>
            (listOfDetails.every(detail =>
                detail.state.id !== "" &&
                detail.state.name !== "" &&
                detail.state.batch_name !== ""
            ) && !downloading && listOfDetails.length > 0 )
        , [listOfDetails, downloading]);

    const setAlertMessage = (message, severity) => {
        setAlertData((prevState) => ({
            ...prevState,
            message: message,
            severity: (severity || "info")
        }));
        setAlertOpen(true);
    };

    function packStateArrays(jsonList) {
        const packedState = {
            names: [],
            ids: [],
            batch_names: [],
            topic_names: [],
            lecture_urls: []
        };

        // Iterate through each object in the list
        jsonList.forEach(item => {
            packedState.names.push(item.name);
            packedState.ids.push(item.id);
            packedState.batch_names.push(item.batch_name);
            packedState.topic_names.push(item.topic_name);
            packedState.lecture_urls.push(item.lecture_url);
        });

        return packedState;
    }

    const updateElement = (id, newState) => {
        changeListOfDetails((old) => {
            const newList = [...old];
            const index = newList.findIndex(item => item.id === id);
            if (index !== -1) {
                newList[index].state = newState;
            }
            return newList;
        });
    };

    const deleteElement = (id) => {
        changeListOfDetails(old => old.filter(item => item.id !== id));
    };

    const add = (providedState) => changeListOfDetails(old => {
        const newId = old.length > 0 ? Math.max(...old.map(item => item.id)) + 1 : 0;
        return [...old, {
            id: newId,
            element: <Details
                key={newId}
                onChange={(state) => updateElement(newId, state)}
                onDelete={() => deleteElement(newId)}
            />,
            state: providedState || {
                name: "",
                id: '',
                batch_name: '',
                topic_name: '',
                lecture_url: ''
            }
        }];
    });

    const onUpdate = (data) => {
        setOutput(data);
        const currentTaskId = data.task_id;

        const taskIndex = taskIds.indexOf(currentTaskId);
        const currentPercentage = data.progress?.video?.percentage || 0;
        const totalTasks = taskIds.length;

        // If taskIndex === -1, fallback to currentPercentage only
        if (taskIndex === -1 || totalTasks === 0) {
            setProgress(currentPercentage);
            return;
        }

        const globalProgress = ((taskIndex + currentPercentage / 100) / totalTasks) * 100;

        setProgress(globalProgress);
    };

    const onEndEach = (data) => {
        setCompletedTasks((prev) => {
            if (!prev.find(task => task.task_id === data.task_id)) {
                return [...prev, data];
            }
            return prev;
        });

        // Set notification data
        setNotificationData({
            message: `Download complete: ${data.name}`,
            downloadUrl: API.getFile_TaskUrl(data.url).url,
            downloadName: data.name,
            severity: 'success'
        });
        setNotificationOpen(true);

        setAlertMessage(
            `Job with name:${data.name}, id:${data.id}, and task_id:${data.task_id} successfully completed.`,
            "success"
        );
    };

    const onError = (data) => {
        if(data && data.error)
            setAlertMessage(Object.values(data.error), "error");
        else
            setAlertMessage("Failed (maybe server is not responding)", "error");

        setDownloading(false);
    };

    const onStartEach = (data) => {
        setAlertMessage(`Started task with ${data}`, "success");
    };

    const dl = useMemo(() => new Downloader(
        client_id,
        session_id,
        {},
        onStartEach,
        onUpdate,
        onEndEach,
        onError,
        onError
    ), [client_id, session_id]);

    useEffect(() => {
        const runDownloads = async () => {
            for (const taskId of taskIds) {
                await dl.startTask(taskId);
                console.log("Task " + taskId + " Ended");
            }
        };

        if (downloading && taskIds.length > 0) {
            runDownloads().then(() => {
                console.log("All downloads finished");
                setDownloading(false); // optionally reset flag
            });
        }
    }, [downloading, taskIds, dl]);

    useEffect(() => {
        setAlertMessage("Session id created with session " + session_id, "success");
    }, [session_id]);

    useEffect(() => {
        const bossDownloadID = params.get("boss");
        if(bossDownloadID) {
            const states = (LocalHandler.getBossDownload(bossDownloadID));
            if (states) {
                const newList = states.map((state, index) => ({
                    id: index,
                    element: <Details
                        key={index}
                        onChange={(state) => updateElement(index, state)}
                        onDelete={() => deleteElement(index)}
                        initState={state}
                    />,
                    state: {
                        name: state.name,
                        ...state
                    }
                }));
                changeListOfDetails(newList);
            }
        }
        else {
            changeListOfDetails([{
                id: 1,
                element: <Details
                    key={1}
                    onChange={(state) => updateElement(1, state)}
                    onDelete={() => deleteElement(1)}
                />,
                state: {
                    name: "",
                    id: '',
                    batch_name: '',
                    topic_name: '',
                    lecture_url: ''
                }
            }]);
        }
    }, [params]);

    const startDownload_lodgeSession = async () => {
        const packedState = packStateArrays(listOfDetails.map(item => item.state));
        console.log(packedState);
        dl.payload = packedState;
        await dl.lodgeSession().then((res) => setTaskIds(dl.taskIds));
        setDownloading(true);
    };

    const handleNotificationClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setNotificationOpen(false);
    };

    const invertOrder = () => {
        changeListOfDetails(old => {
            const newList = [...old];
            newList.reverse();
            return newList;
        });
        setIsInverted(!isInverted);
    };

    return (
        <Suspense fallback={<CircularProgress color="primary" />}>
            <>
                <Stack spacing={2}>
                    {
                        alertData.message &&
                        (
                            <PWAlert {...alertData} open={alertOpen}>{alertData.message}</PWAlert>
                        )
                    }
                    <Grid container spacing={2} p={0.5}>
                        <Grid item size={3}>
                            <Button
                                fullWidth
                                variant={"contained"}
                                onClick={() => add()}
                                aria-label="Add new item">
                                Add
                            </Button>
                        </Grid>
                        <Grid item size={3}>
                            <Button
                                fullWidth
                                disableRipple
                                startIcon={isInverted ? <CheckBoxIcon/>:<CheckBoxOutlineBlankIcon/>}
                                variant={isInverted? "contained":"outlined"}
                                onClick={() => invertOrder()}
                                aria-label="Invert">
                                Invert
                            </Button>
                        </Grid>
                    </Grid>
                </Stack>
                <Paper sx={{
                    bosizehadow: 6,
                    backgroundColor: `${theme.palette.background.paper}`,
                }}>
                    <Grid container spacing={2} p={4}>
                        {
                            listOfDetails.map((details, index) => (
                                <Grid item size={12} p={2} sx={{
                                    border: 1,
                                    borderRadius: "10px",
                                    borderColor: `${theme.palette.grey["800"]}`,
                                    position: "relative",
                                    '&::before': {
                                        content: `"${index + 1}"`,
                                        position: "absolute",
                                        top: "-10px",
                                        left: "10px",
                                        backgroundColor: `${theme.palette.background.default}`,
                                        padding: "0",
                                        fontSize: "0.9rem",         // Adjust size as needed
                                        fontFamily: "'Roboto', sans-serif", // Change font family
                                        fontWeight: "500",          // Make it medium weight
                                        color: "primary.main",      // Use theme color
                                        letterSpacing: "0.5px",     // Add spacing between letters
                                        fontStyle: "normal"         // Normal, italic, etc.
                                    }
                                }} key={details.id}>
                                    {details.element}
                                </Grid>
                            ))
                        }
                        <Grid item size={12}>
                            <Button
                                fullWidth
                                startIcon={<DownloadIcon/>}
                                variant={"contained"}
                                disabled={!areAllValid}
                                onClick={startDownload_lodgeSession}
                                aria-label="Download all items">
                                Download
                            </Button>
                        </Grid>
                        <Grid item size={12}>
                            <TerminalOutput output={Utils.formatTaskToText(output).join("\n")} progress={progress}/>
                        </Grid>
                        {
                            completedTasks.map((task, index) => (
                                <Grid key={index} item size={12}>
                                    <Button
                                        elevation={3}
                                        sx={{padding: 2}}
                                        href={API.getFile_TaskUrl(task.url).url}
                                        variant="contained"
                                        endIcon={<DownloadIcon/>}
                                        aria-label={`Download ${task.name}`}>
                                        {task.name}
                                    </Button>
                                </Grid>
                            ))
                        }
                        {
                            completedTasks.length > 0 && (
                                <Grid item size={12}>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        endIcon={<ListAltIcon/>}
                                        onClick={() => Utils.cipman().copy(Utils.urlsToCurl(completedTasks.map(task => `${window.location.origin}${task.url}`)))}
                                        aria-label="Copy curl commands">
                                        Curl-It
                                    </Button>
                                </Grid>
                            )
                        }
                    </Grid>
                </Paper>
                <DownloadNotification
                    open={notificationOpen}
                    onClose={handleNotificationClose}
                    message={notificationData.message}
                    downloadUrl={notificationData.downloadUrl}
                    downloadName={notificationData.downloadName}
                    severity={notificationData.severity}
                />
            </>
        </Suspense>
    );
};

const FullDetails =  () => {
    return (
        <Suspense>
            <FullDetailsWithoutSuspense/>
        </Suspense>
    );
};

export default FullDetails;