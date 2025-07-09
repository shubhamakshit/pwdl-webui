"use client";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import LecturesWrapper from "@/components/Wrappers/LecturesWrapper";
import DataService from "@/services/DataService";
import TeacherDetails from "@/app/models/Khazana/TeacherDetails";
import SubTopicDetails from "@/app/models/Khazana/SubTopicDetails";
import LectureDetails from "@/app/models/Khazana/LectureDetails";
import API from "@/Server/api";
import LocalHandler from "@/localHandler";
import Utils from "@/lib/utils";
import KhazanaNotesDetails from "@/app/models/Khazana/KhazanaNotesDetails";
import copyUtils from "@/lib/copyUtils";

const ChaptersComponent = () => {
    const params = useParams();
    const router = useRouter();

    // Fetch chapters/lectures
    const fetchChapters = useCallback(async () => {
        const { program_name, subject_name, teacher_name, chapter_name } = params;

        if (!program_name || !subject_name || !teacher_name) {
            console.warn("Program name, subject name or teacher name is not defined");
            return [];
        }

        // get subtopics
        try {
            const response = await fetch(API.GET_KHAZANA_CHAPTER_SUBTOPICS(
                program_name,
                subject_name,
                teacher_name,
                chapter_name
            ));
            const data = await response.json();
            const subtopics = data["data"].map((subtopic) => SubTopicDetails.fromJSON(subtopic));

            // select the subtopic that has name lectures
            let subtopic_slug = "";
            for (let i = 0; i < subtopics.length; i++) {
                if (subtopics[i].name.includes("ecture")) {
                    subtopic_slug = subtopics[i].slug;
                    break;
                }
            }

            return await DataService.fetch(
                API.GET_KHAZANA_CHAPTER_LECTURES(
                    program_name,
                    subject_name,
                    teacher_name,
                    chapter_name,
                    subtopic_slug
                ),
                LectureDetails
            );
        } catch (error) {
            console.error("Error fetching lectures:", error);
            return [];
        }
    }, [params.program_name, params.subject_name, params.teacher_name, params.chapter_name]);

    const fetchNotes = useCallback(async () => {
        const { program_name, subject_name, teacher_name, chapter_name } = params;

        if (!program_name || !subject_name || !teacher_name) {
            console.warn("Program name, subject name or teacher name is not defined");
            return [];
        }

        // get subtopics
        try {
            const response = await fetch(API.GET_KHAZANA_CHAPTER_SUBTOPICS(
                program_name,
                subject_name,
                teacher_name,
                chapter_name
            ));
            const data = await response.json();
            const subtopics = data["data"].map((subtopic) => SubTopicDetails.fromJSON(subtopic));

            // select the subtopic that has name lectures
            let subtopic_slug = "";
            for (let i = 0; i < subtopics.length; i++) {
                if (subtopics[i].name.includes("otes")) {
                    subtopic_slug = subtopics[i].slug;
                    break;
                }
            }

            return await DataService.fetch(
                API.GET_KHAZANA_CHAPTER_LECTURES(
                    program_name,
                    subject_name,
                    teacher_name,
                    chapter_name,
                    subtopic_slug
                ),
                KhazanaNotesDetails
            );
        } catch (error) {
            console.error("Error fetching lectures:", error);
            return [];
        }
    }, [params.program_name, params.subject_name, params.teacher_name, params.chapter_name]);

    // Handle lecture selection
    const handleLectureSelection = useCallback((data) => {
        return data.map((item) => ({
            ...item.state,
            batch_name: params.program_name
        }));
    }, [params.program_name]);

    // Handle note selection
    const handleNoteSelection = useCallback((data) => {
        return data.map((item) => ({
            link: item.content[0].file.link,
            name: item.content[0].file.name
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
        const { program_name, subject_name, teacher_name } = params;
        router.push(`/boss/khazana/${program_name}/${subject_name}/${teacher_name}/${lecture.slug}`);
    }, [params.program_name, params.subject_name, params.teacher_name, router]);

    // NEW: Handle Watch button click for lectures
    const handleWatchClick = useCallback((lecture) => {
        // Construct the URL as specified for Khazana
        const watchUrl = `https://laughing-space-waffle-g9rrppjx464fw67x-3000.app.github.dev/beta?batch_name=${lecture.state.batch_name}&id=${lecture.state.id}&url=${lecture.state.lecture_url}&topic_name=${lecture.state.topic_name}`;
        router.push(watchUrl);
    }, [router]);

    // Memoize tab configurations
    const tabConfigurations = useMemo(() => [
        {
            label: "Lectures",
            fetchData: fetchChapters,
            type: "lecture",
            noDataMessage: "No Lectures.",
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
            noDataMessage: "No Notes.",
            handleSelection: handleNoteSelection,
            handleDownload: handleNotesDownload,
            onCardClick: handleLectureCardClick, // Or a separate handler for notes card click
            fields: []
        }
    ], [
        fetchChapters,
        fetchNotes,
        handleLectureSelection,
        handleNoteSelection,
        handleLectureDownload,
        handleNotesDownload,
        handleLectureCardClick,
        handleWatchClick // Include the new handler in the dependency array
    ]);

    return (
        <LecturesWrapper
            tabConfigurations={tabConfigurations}
            params={params}
            a11yProps={Utils.a11yProps}
        />
    );
};

export default ChaptersComponent;