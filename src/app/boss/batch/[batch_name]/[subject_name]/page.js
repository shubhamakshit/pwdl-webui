"use client";
import { useParams } from "next/navigation";
import DataListComponent from "@/components/DataListComponent";
import DataService from "@/services/DataService";
import BatchChapterDetail from "@/app/models/Batches/BatchChapterDetail";
import API from "@/Server/api";
import { useRouter } from "next/navigation";

const BatchDetails = () => {
    const router = useRouter();
    const params = useParams(); // Get URL parameters

    const fetchChapters = async () => {
        const batch_name = params.batch_name;
        const subject_name = params.subject_name;
        {
            if (!batch_name) {
                console.warn("Batch name is not defined");
                return [];
            }

            if (!subject_name) {
                console.warn("Subject name is not defined");
                return [];
            }
        }

        return await DataService.fetch(API.GET_BATCHES_CHAPTERS(batch_name,subject_name), BatchChapterDetail);
    };

    const handleChapterClick = (chapter) => {
        const batch_name = params.batch_name; // Get program_name from URL params
        const subject_name = params.subject_name;

        router.push(`/boss/batch/${batch_name}/${subject_name}/${chapter.slug}`);
    };

    return (
        <DataListComponent
            fetchData={fetchChapters}
            onCardClick={handleChapterClick}
            fields={["slug"]} // Specify fields to display
            noDataMessage="No subjects found for this program."
            urlParams={params} // Pass URL parameters to the component
        />
    );
};

export default BatchDetails;