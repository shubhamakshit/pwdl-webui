"use client";
import {useParams, useRouter} from "next/navigation";
import {useState, useCallback, useMemo} from "react";
import DataListComponent from "@/components/DataListComponent";
import DataService from "@/services/DataService";
import TeacherDetails from "@/app/models/Khazana/TeacherDetails";
import SubTopicDetails from "@/app/models/Khazana/SubTopicDetails";
import LectureDetails from "@/app/models/Khazana/LectureDetails";
import API from "@/Server/api";
import {Button, Grid} from "@mui/material";
import LocalHandler from "@/localHandler";

const ChaptersComponent = () => {
    const params = useParams();
    const router = useRouter();
    const [selectedItems, setSelectedItems] = useState([]);

    // Memoize handleSelection to prevent recreating on every render
    const handleSelection = useCallback((data) => {
        setSelectedItems(data.map((item) => item.state));
    }, []);

    // Memoize fetchChapters to prevent recreating on every render
    const fetchChapters = useCallback(async () => {
        const program_name = params.program_name;
        const subject_name = params.subject_name;
        const teacher_name = params.teacher_name;
        const chapter_name = params.chapter_name;

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

    // Memoize handleChapterClick to prevent recreating on every render
    const handleChapterClick = useCallback((chapter) => {
        const program_name = params.program_name;
        const subject_name = params.subject_name;
        const teacher_name = params.teacher_name;
        router.push(`/boss/khazana/${program_name}/${subject_name}/${teacher_name}/${chapter.slug}`);
    }, [params.program_name, params.subject_name, params.teacher_name, router]);

    // Memoize fields array to prevent recreating on every render
    const fields = useMemo(() => [], []);

    const handleDownloadAll = useCallback(() => {
        const bossDownloadId = LocalHandler.setBossDownload("", selectedItems);
        window.location.href = `${window.origin}?boss=${bossDownloadId}`
    }, [selectedItems]);

    return (
        <Grid container spacing={2}>
            <Grid item size={12}>
                <Button fullWidth onClick={handleDownloadAll}>
                    Download all
                </Button>
            </Grid>
            <Grid item size={12}>

                <DataListComponent
                    fetchData={fetchChapters}
                    onCardClick={handleChapterClick}
                    fields={fields}
                    noDataMessage="No Lectures."
                    type={"lecture"}
                    selectable
                    onSelectionChange={handleSelection}
                />
            </Grid>
        </Grid>
    );
};

export default ChaptersComponent;