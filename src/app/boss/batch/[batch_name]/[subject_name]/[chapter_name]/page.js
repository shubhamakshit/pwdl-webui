"use client";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import LecturesWrapper from "@/components/Wrappers/LecturesWrapper";
import DataService from "@/services/DataService";
import API from "@/Server/api";
import LocalHandler from "@/localHandler";
import copyUtils from "@/lib/copyUtils";
import Utils from "@/lib/utils";

// Importing specific models
import BatchLectureDetail from "@/app/models/Batches/BatchLectureDetail";
import BatchNotesDetail from "@/app/models/Batches/BatchNotesDetail";
import DppNotesDetails from "@/app/models/Batches/DppNotesDetails";

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

    // Handle dpp note selection
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

    // Handle lecture click (navigation)
    const handleLectureClick = useCallback((lecture) => {
        const { batch_name, subject_name, chapter_name } = params;
        // Uncomment and modify navigation as needed
        // router.push(`/boss/batch/${batch_name}/${subject_name}/${chapter_name}/${lecture.slug}`);
    }, [params]);

    // Memoize tab configurations to prevent unnecessary re-renders
    const tabConfigurations = useMemo(() => [
        {
            label: "Lectures",
            fetchData: fetchLectures,
            type: "lecture",
            noDataMessage: "No lectures found for this chapter.",
            handleSelection: handleLectureSelection,
            handleDownload: handleLectureDownload,
            onCardClick: handleLectureClick,
            fields: ["date"]
        },
        {
            label: "Notes",
            fetchData: fetchNotes,
            type: "notes",
            noDataMessage: "No notes found for this chapter.",
            handleSelection: handleNoteSelection,
            handleDownload: handleNotesDownload,
            onCardClick: handleLectureClick,
            fields: []
        },
        {
            label: "DPP Notes",
            fetchData: fetchDppNotes,
            type: "notes",
            noDataMessage: "No notes found for this chapter.",
            handleSelection: handleDppNoteSelection,
            handleDownload: handleNotesDownload,
            onCardClick: handleLectureClick,
            fields: []
        }
        // Easy to add more tabs here in the future
    ], [
        fetchLectures,
        fetchNotes,
        handleLectureSelection,
        handleNoteSelection,
        handleLectureDownload,
        handleNotesDownload,
        handleLectureClick,
        fetchDppNotes,
        handleDppNoteSelection
    ]);

    return <LecturesWrapper tabConfigurations={tabConfigurations} params={params} />;
};

export default BatchDetailsPage;
