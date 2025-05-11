"use client";
import DataListComponent from "@/components/DataListComponent";
import DataService from "@/services/DataService";
import TeacherDetails from "@/app/models/Khazana/TeacherDetails";
import API from "@/Server/api";
import {useParams, useRouter} from "next/navigation";

const ChaptersComponent = () => {
    const params = useParams();
    const router = useRouter();

    const fetchChapters = async (params) => {
        const program_name = params.program_name;
        const subject_name = params.subject_name;
        const teacher_name = params.teacher_name;
        if (!program_name || !subject_name || !teacher_name) {
            console.warn("Program name, subject name or teacher name is not defined");
            return [];
        }
        return await DataService.fetch(API.GET_KHAZANA_TEACHER_DETAILS(program_name, subject_name, teacher_name), TeacherDetails);
    };

    const handleChapterClick = (chapter) => {
        const program_name = params.program_name;
        const subject_name = params.subject_name;
        const teacher_name = params.teacher_name;
        router.push(`/boss/khazana/${program_name}/${subject_name}/${teacher_name}/${chapter.slug}`);
    };

    return (
        <DataListComponent
            fetchData={fetchChapters}
            onCardClick={handleChapterClick}
            fields={["slug", "subject", "experience"]} // Specify fields to display
            noDataMessage="No chapters found for this program."
        />
    );



};

export default ChaptersComponent;