"use client";
import {useParams} from "next/navigation";
import DataListComponent from "@/components/DataListComponent";
import DataService from "@/services/DataService";
import BatchLectureDetail from "@/app/models/Batches/BatchLectureDetail";
import API from "@/Server/api";
import Utils from "@/lib/utils";
import {useRouter} from "next/navigation";
import LectureCard from "@/components/Cards/LectureCard";
import {useCallback, useState} from "react";
import {Button, Grid, Tabs, Tab, Box} from "@mui/material";
import LocalHandler from "@/localHandler";
import BatchNotesDetail from "@/app/models/Batches/BatchNotesDetail";
import copyUtils from "@/lib/copyUtils";

// TabPanel component for tab content
function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ pt: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const BatchDetails = () => {
    const router = useRouter();
    const params = useParams(); // Get URL parameters
    const [lecturesSelectedItems, setLecturesSelectedItems] = useState([]); // State to manage selected items
    const [notesSelectedItems, setNotesSelectedItems] = useState([]);
    const [tabValue, setTabValue] = useState(0); // State for active tab

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        // Reset selected items when changing tabs
        setLecturesSelectedItems([]);
    };

    // Memoize handleLectureSelection to prevent recreating on every render
    const handleLectureSelection = useCallback((data) => {
        setLecturesSelectedItems(data.map((item) => ({
            ...item.state,
            batch_name: params.batch_name
        })));
    }, [params.batch_name]);

    const handleNoteSelection = useCallback((data) => {
        setNotesSelectedItems(data.map((item) => ({
            link:item.homeworks[0].attachments[0].link,
            name:item.homeworks[0].attachments[0].name

        })));
    }, [params.batch_name]);

    const fetchLectures = useCallback(() => {
        const batch_name = params.batch_name;
        const subject_name = params.subject_name;
        const chapter_name = params.chapter_name;

        return DataService.fetch(API.GET_BATCHES_LECTURES(batch_name, subject_name, chapter_name), BatchLectureDetail);
    }, [params.batch_name, params.subject_name, params.chapter_name])

    const fetchNotes = useCallback(() => {
        const batch_name = params.batch_name;
        const subject_name = params.subject_name;
        const chapter_name = params.chapter_name;

        return DataService.fetch(API.GET_BATCHES_NOTES(batch_name, subject_name, chapter_name), BatchNotesDetail);
    }, [params.batch_name, params.subject_name, params.chapter_name])

    const handleLectureClick = (lecture) => {
        const batch_name = params.batch_name; // Get program_name from URL params
        const subject_name = params.subject_name;
        const chapter_name = params.chapter_name;

        // router.push(`/boss/batch/${batch_name}/${subject_name}/${chapter_name}/${lecture.slug}`);
    };

    const handleDownloadLectures = useCallback(() => {
        const bossDownloadId = LocalHandler.setBossDownload("", lecturesSelectedItems);
        window.location.href = `${window.origin}?boss=${bossDownloadId}`
    }, [lecturesSelectedItems]);

    const handleDownloadNotes = useCallback(() => {
        copyUtils.copyToClipboard(Utils.curlWithFileName(notesSelectedItems));

    }, [notesSelectedItems]);


    return (
        <Grid container spacing={2}>
            <Grid item size={12}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="batch content tabs">
                        <Tab label="Lectures" {...Utils.a11yProps(0)} />
                        <Tab label="Notes" {...Utils.a11yProps(1)} />
                    </Tabs>
                </Box>
            </Grid>



            <Grid item size={12}>
                <TabPanel value={tabValue} index={0}>
                    <Grid item size={12}>
                        {lecturesSelectedItems.length > 0 && (
                            <Button fullWidth variant="outlined" onClick={handleDownloadLectures}>
                                Download Selected Lectures
                            </Button>
                        )}
                    </Grid>
                    <DataListComponent
                        fetchData={fetchLectures}
                        onCardClick={handleLectureClick}
                        fields={["slug"]} // Specify fields to display
                        selectable
                        onSelectionChange={handleLectureSelection}
                        type={"lecture"}
                        noDataMessage="No lectures found for this chapter."
                        urlParams={params} // Pass URL parameters to the component
                    />
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                    <Grid item size={12}>
                        {notesSelectedItems.length > 0 && (
                            <Button fullWidth variant="outlined" onClick={handleDownloadNotes}>
                                Download Selected Notes
                            </Button>
                        )}
                    </Grid>
                    <DataListComponent
                        fetchData={fetchNotes}
                        onCardClick={handleLectureClick}
                        fields={["slug"]} // Specify fields to display
                        selectable
                        onSelectionChange={handleNoteSelection}
                        type={"notes"}
                        noDataMessage="No notes found for this chapter."
                        urlParams={params} // Pass URL parameters to the component
                    />
                </TabPanel>
            </Grid>
        </Grid>
    );
};

export default BatchDetails;