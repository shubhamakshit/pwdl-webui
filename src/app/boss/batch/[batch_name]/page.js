"use client";
import { useParams } from "next/navigation";
import DataListComponent from "@/components/DataListComponent";
import DataService from "@/services/DataService";
import BatchSubjectDetails from "@/app/models/Batches/BatchSubjectDetails";
import API from "@/Server/api";
import { useRouter } from "next/navigation";
const BatchDetails = () => {
    const router = useRouter();
    const params = useParams(); // Get URL parameters

    const fetchSubjects = async () => {
        const batch_name = params.batch_name;
        if (!batch_name) {
            console.warn("Program name is not defined");
            return [];
        }
        return await DataService.fetch(API.GET_BATCHES_SUBJECTS(batch_name), BatchSubjectDetails);
    };

    const handleSubjectClick = (subject) => {
        const batch_name = params.batch_name; // Get program_name from URL params
        router.push(`/boss/batch/${batch_name}/${subject.slug}`);
    };

    return (
        <DataListComponent
            fetchData={fetchSubjects}
            onCardClick={handleSubjectClick}
            fields={["slug"]} // Specify fields to display
            noDataMessage="No subjects found for this program."
            urlParams={params} // Pass URL parameters to the component
        />
    );
};

export default  BatchDetails;