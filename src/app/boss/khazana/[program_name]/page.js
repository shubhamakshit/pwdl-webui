"use client";
import { useParams } from "next/navigation";
import DataListComponent from "@/components/DataListComponent";
import DataService from "@/services/DataService";
import SubjectDetails from "@/app/models/Khazana/SubjectDetails";
import API from "@/Server/api";
import { useRouter } from "next/navigation";

const ProgramDetails = () => {
    const router = useRouter();
    const params = useParams(); // Get URL parameters

    const fetchSubjects = async () => {
        const program_name = params.program_name;
        if (!program_name) {
            console.warn("Program name is not defined");
            return [];
        }
        return await DataService.fetch(API.GET_KHAZANA_PROGRAM_DETAILS(program_name), SubjectDetails);
    };

    const handleSubjectClick = (subject) => {
        const program_name = params.program_name; // Get program_name from URL params
        router.push(`/boss/khazana/${program_name}/${subject.slug}`);
    };

    return (
        <DataListComponent
            fetchData={fetchSubjects}
            onCardClick={handleSubjectClick}
            fields={["slug", "totalChapters", "teacher"]} // Specify fields to display
            noDataMessage="No subjects found for this program."
            urlParams={params} // Pass URL parameters to the component
        />
    );
};

export default ProgramDetails;