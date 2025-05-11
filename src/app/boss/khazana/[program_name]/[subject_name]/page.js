"use client";
import DataListComponent from "@/components/DataListComponent";
import DataService from "@/services/DataService";
import TeacherDetails from "@/app/models/Khazana/TeacherDetails";
import API from "@/Server/api";
import {useParams, useRouter} from "next/navigation";

const TeachersComponent = () => {
    const router = useRouter();
    const params = useParams();



    const fetchTeachers = async (params) => {
        const program_name = params.program_name;
        const subject_name = params.subject_name;
        if (!program_name || !subject_name) {
            console.warn("Program name or subject name is not defined");
            return [];
        }
        return await DataService.fetch(API.GET_KHAZANA_SUBJECT_DETAILS(program_name, subject_name), TeacherDetails);
    };

    const handleTeacherClick = (teacher) => {
        const program_name = params.program_name;
        const subject_name = params.subject_name;
        router.push(`/boss/khazana/${program_name}/${subject_name}/${teacher.slug}`);
    };

    return (
        <DataListComponent
            fetchData={fetchTeachers}
            onCardClick={handleTeacherClick}
            fields={["slug", "subject", "experience"]} // Specify fields to display
            noDataMessage="No teachers found for this program."
        />
    );
};

export default TeachersComponent;