"use client";
import {useParams} from "next/navigation";
import DataListComponent from "@/components/DataListComponent";
import DataService from "@/services/DataService";
import BatchLectureDetail from "@/app/models/Batches/BatchLectureDetail";
import API from "@/Server/api";

import {useRouter} from "next/navigation";
import LectureCard from "@/components/Cards/LectureCard";
import {useCallback, useState} from "react";
import {Button, Grid} from "@mui/material";
import LocalHandler from "@/localHandler";

const BatchDetails = () => {
    const router = useRouter();
    const params = useParams(); // Get URL parameters
    const [selectedItems, setSelectedItems] = useState([]); // State to manage selected items

    // Memoize handleSelection to prevent recreating on every render
    const handleSelection = useCallback((data) => {
        setSelectedItems(data.map((item) => ({
            ...item.state,
            batch_name : params.batch_name
        })));
    }, []);

    const fetchLectures = useCallback(() => {
        const batch_name = params.batch_name;
        const subject_name = params.subject_name;
        const chapter_name = params.chapter_name;

        return DataService.fetch(API.GET_BATCHES_LECTURES(batch_name, subject_name, chapter_name), BatchLectureDetail);
    }, [params.batch_name, params.subject_name, params.chapter_name])

    const handleLectureClick = (lecture) => {
        const batch_name = params.batch_name; // Get program_name from URL params
        const subject_name = params.subject_name;
        const chapter_name = params.chapter_name;

        // router.push(`/boss/batch/${batch_name}/${subject_name}/${chapter_name}/${lecture.slug}`);
    };
    const handleDownloadAll = useCallback(() => {
        const bossDownloadId = LocalHandler.setBossDownload("", selectedItems);
        window.location.href = `${window.origin}?boss=${bossDownloadId}`
    }, [selectedItems]);

    return (
        <Grid container spacing={2}>
            <Grid item size={12}>
                <Button fullWidth variant={"outlined"} onClick={handleDownloadAll}>
                    Download Selected
                </Button>
            </Grid>
            <Grid item size={12}>
                <DataListComponent
                    fetchData={fetchLectures}
                    onCardClick={handleLectureClick}
                    fields={["slug"]} // Specify fields to display,
                    selectable
                    onSelectionChange={handleSelection}
                    type={"lecture"}
                    noDataMessage="No subjects found for this program."
                    urlParams={params} // Pass URL parameters to the component
                />
            </Grid>
        </Grid>
    );
};

export default BatchDetails;

