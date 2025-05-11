// src/hooks/useDownloader.js
import { useState, useEffect } from "react";
import Downloader from "@/Server/Downloader";
import LocalHandler from "@/localHandler";

/**
 * Custom hook to manage download operations
 * @param {Function} onAlert - Function to show alerts
 * @returns {Object} - Download state and operations
 */
const useDownloader = (onAlert) => {
    const client_id = LocalHandler.getClientId();
    const [session_id, setSessionId] = useState(LocalHandler.getSessionId(true));

    const [taskIds, setTaskIds] = useState([]);
    const [progress, setProgress] = useState(0);
    const [downloading, setDownloading] = useState(false);
    const [output, setOutput] = useState({});
    const [completedTasks, setCompletedTasks] = useState([]);

    // Download callbacks
    const onUpdate = (data) => {
        setOutput(data);
        const currentTaskId = data.task_id;
        const taskIndex = taskIds.indexOf(currentTaskId);
        const currentPercentage = data.progress?.video?.percentage || 0;
        const totalTasks = taskIds.length;

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

        onAlert(
            `Job with name:${data.name}, id:${data.id}, and task_id:${data.task_id} successfully completed.`,
            "success"
        );
    };

    const onError = (data) => {
        if (data && data.error)
            onAlert(Object.values(data.error), "error");
        else
            onAlert("Failed (maybe server is not responding)", "error");

        setDownloading(false);
    };

    const onStartEach = (data) => {
        onAlert(`Started task with ${data}`, "success");
    };

    // Initialize downloader
    const downloader = new Downloader(
        client_id,
        session_id,
        {},
        onStartEach,
        onUpdate,
        onEndEach,
        onError,
        onError
    );

    // Handle downloads when taskIds change
    useEffect(() => {
        const runDownloads = async () => {
            for (const taskId of taskIds) {
                await downloader.startTask(taskId);
                console.log("Task " + taskId + " Ended");
            }
        };

        if (downloading && taskIds.length > 0) {
            runDownloads().then(() => {
                console.log("All downloads finished");
                setDownloading(false);
            });
        }
    }, [downloading, taskIds]);

    // Notify session creation
    useEffect(() => {
        onAlert("Session id created with session " + session_id, "success");
    }, [session_id, onAlert]);

    // Helper function to transform details to payload format
    const packStateArrays = (detailsList) => {
        const packedState = {
            names: [],
            ids: [],
            batch_names: [],
            topic_names: [],
            lecture_urls: []
        };

        detailsList.forEach(item => {
            packedState.names.push(item.name);
            packedState.ids.push(item.id);
            packedState.batch_names.push(item.batch_name);
            packedState.topic_names.push(item.topic_name);
            packedState.lecture_urls.push(item.lecture_url);
        });

        return packedState;
    };

    // Start download process
    const startDownload = async (detailsList) => {
        const packedState = packStateArrays(detailsList);
        console.log(packedState);
        downloader.payload = packedState;
        await downloader.lodgeSession().then(() => setTaskIds(downloader.taskIds));
        setDownloading(true);
    };

    return {
        progress,
        downloading,
        output,
        completedTasks,
        startDownload,
        session_id
    };
};

export default useDownloader;