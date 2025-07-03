"use client";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import LecturesWrapper from "@/components/Wrappers/LecturesWrapper"; // Assuming this path is correct
import DataService from "@/services/DataService"; // Assuming this path is correct
import API from "@/Server/api"; // Assuming this path is correct
import LocalHandler from "@/localHandler"; // Assuming this path is correct
import copyUtils from "@/lib/copyUtils"; // Assuming this path is correct
import Utils from "@/lib/utils"; // Assuming this path is correct

// Importing specific models
import BatchLectureDetail from "@/app/models/Batches/BatchLectureDetail"; // Assuming this path is correct
import BatchNotesDetail from "@/app/models/Batches/BatchNotesDetail"; // Assuming this path is correct
import DppNotesDetails from "@/app/models/Batches/DppNotesDetails"; // Assuming this path is correct

const BatchDetailsPage = () => {
    const params = useParams();
    const router = useRouter();

    // Fetch lectures
    const fetchLectures = useCallback(() => {
        const { batch_name, subject_name, chapter_name } = params;
        return DataService.fetch(
            API.GET_BATCHES_LECTURES(batch_name, subject_name, chapter_name),
            BatchLectureDetail
        );
    }, [params]);

    // Fetch notes
    const fetchNotes = useCallback(() => {
        const { batch_name, subject_name, chapter_name } = params;
        return DataService.fetch(
            API.GET_BATCHES_NOTES(batch_name, subject_name, chapter_name),
            BatchNotesDetail
        );
    }, [params]);

    // Fetch DPP notes
    const fetchDppNotes = useCallback(() => {
        const { batch_name, subject_name, chapter_name } = params;
        return DataService.fetch(
            API.GET_BATCHES_DPP_NOTES(batch_name, subject_name, chapter_name),
            DppNotesDetails
        );
    }, [params]);

    // Handle lecture selection
    const handleLectureSelection = useCallback((data) => {
        return data.map((item) => ({
            ...item.state,
            batch_name: params.batch_name
        }));
    }, [params.batch_name]);

    // Handle note selection
    const handleNoteSelection = useCallback((data) => {
        return data.map((item) => ({
            link: item.homeworks[0].attachments[0].link,
            name: item.homeworks[0].attachments[0].name
        }));
    }, []);

    // Handle DPP note selection
    const handleDppNoteSelection = useCallback((data) => {
        return data.map((item) => ({
            link: item.homeworks[0].attachments[0].link,
            name: item.homeworks[0].attachments[0].name
        }));
    }, []);

    // Handle lecture download
    const handleLectureDownload = useCallback((selectedItems) => {
        const bossDownloadId = LocalHandler.setBossDownload("", selectedItems);
        window.location.href = `${window.origin}?boss=${bossDownloadId}`;
    }, []);

    // Handle notes download
    const handleNotesDownload = useCallback((selectedItems) => {
        copyUtils.copyToClipboard(Utils.curlWithFileName(selectedItems));
    }, []);

    // Handle lecture card click (for general card click, not specifically "watch")
    const handleLectureCardClick = useCallback((lecture) => {
        const { batch_name, subject_name, chapter_name } = params;
        // Example: router.push(`/boss/batch/${batch_name}/${subject_name}/${chapter_name}/${lecture.slug}`);
        console.log("Lecture card clicked:", lecture.title || lecture.name);
    }, [params]);

    // NEW: Handle Watch button click for lectures
    const handleWatchClick = useCallback((lecture) => {
        const { batch_name } = params;
        // Construct the URL as specified: baseurl/beta?batch_name=batch_name&id=id
        const watchUrl = `${window.location.origin}/beta?batch_name=${batch_name}&id=${lecture.id}`;
        router.push(watchUrl);
    }, [params, router]);


    // Memoize tab configurations to prevent unnecessary re-renders
    const tabConfigurations = useMemo(() => [
        {
            label: "Lectures",
            fetchData: fetchLectures,
            type: "lecture",
            noDataMessage: "No lectures found for this chapter.",
            handleSelection: handleLectureSelection,
            handleDownload: handleLectureDownload,
            onCardClick: handleLectureCardClick, // General card click
            onWatchClick: handleWatchClick,     // Specific "Watch" button click
            fields: ["date"]
        },
        {
            label: "Notes",
            fetchData: fetchNotes,
            type: "notes",
            noDataMessage: "No notes found for this chapter.",
            handleSelection: handleNoteSelection,
            handleDownload: handleNotesDownload,
            onCardClick: handleLectureCardClick, // Or a separate handler for notes card click
            fields: []
        },
        {
            label: "DPP Notes",
            fetchData: fetchDppNotes,
            type: "notes",
            noDataMessage: "No DPP notes found for this chapter.",
            handleSelection: handleDppNoteSelection,
            handleDownload: handleNotesDownload,
            onCardClick: handleLectureCardClick, // Or a separate handler for DPP notes card click
            fields: []
        }
        // Easy to add more tabs here in the future
    ], [
        fetchLectures,
        fetchNotes,
        fetchDppNotes,
        handleLectureSelection,
        handleNoteSelection,
        handleDppNoteSelection,
        handleLectureDownload,
        handleNotesDownload,
        handleLectureCardClick,
        handleWatchClick // Include the new handler in the dependency array
    ]);

    return <LecturesWrapper tabConfigurations={tabConfigurations} params={params} />;
};

export default BatchDetailsPage;