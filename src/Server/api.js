import WebSettingsManager from "@/lib/WebSettingsManager";

class API {
    static base_url = WebSettingsManager.getValue("api") || "http://localhost:5000";

    static lodgeSession = (client_id, session_id) => ({
        url: `${API.base_url}/client/${client_id}/${session_id}/create_session`,
        method: 'POST',
    });

    static runTask = (task_id) => ({
        url: `${API.base_url}/start/${task_id}`,
        method: 'GET',
    });

    static progress = (task_id) => ({
        url: `${API.base_url}/progress/${task_id}`,
        method: 'GET',
    });

    static prefs = {
        get_url: `${API.base_url}/prefs/defaults.json`,
        update_url: `${API.base_url}/update/defaults.json`,
    };

    static getFile = (file_id, session_id) => ({
        url: `${API.base_url}/get-file/${file_id}/${session_id}`,
        method: 'GET',
    });

    static getFile_TaskUrl = (task_url) => ({
        url: `${API.base_url}${task_url}`,
        method: 'GET',
    });

    static GET_CLIENT_DETAILS = (clientId) =>
        `${API.base_url}/client/${clientId}`;

    static GET_FILE_BY_PATH = (path) => `${API.base_url}/get${path}`;

    static DEL_FILE_BY_PATH = (path) => `${API.base_url}/delete${path}`;

    static GET_ADMIN_FOLDER = (folder) =>
        `${API.base_url}/webdl${folder === '' ? '' : '/' + folder}`;

    static GET_RANDOM_NAME = () => `${API.base_url}/random/name`;

    static GET_NAMES_OF_CLIENTS = () => `${API.base_url}/client/names`;

    static GET_NAMES_OF_SESSIONS = (clientId) => `${API.base_url}/client/${clientId}/names`;

    static GET_USAGES_FOR_ALL_CLIENTS = () => `${API.base_url}/server/usages`;

    static UPDATE = `${API.base_url}/server/update`;

    static LATEST_UPDATE_INFO = `${API.base_url}/server/update/latest`;

    static MERGE_SESSIONS = async (clientId, sessionId1, sessionId2) => {
        fetch(`${API.base_url}/client/${clientId}/merge_sessions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                session_ids: [sessionId1, sessionId2],
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };

    static GET_NORMAL_SUBJECTS = (batchId) =>
        `${API.base_url}/normal/subjects?batch_name=${batchId}`;

    static GET_NORMAL_CHAPTERS = (batchId, subjectSlug) =>
        `${API.base_url}/normal/chapters/${subjectSlug}?batch_name=${batchId}`;

    static GET_NORMAL_LECTURES = (batchId, subjectSlug, chapterSlug) =>
        `${API.base_url}/normal/lectures?batch_name=${batchId}&subject_slug=${subjectSlug}&chapter_slug=${chapterSlug}`;

    // Khazana API Endpoints
    static GET_KHAZANA_PROGRAM_DETAILS = (programName) =>
        `${API.base_url}/api/khazana/${programName}`;

    static GET_KHAZANA_SUBJECT_DETAILS = (programName, subjectName) =>
        `${API.base_url}/api/khazana/${programName}/${subjectName}`;

    static GET_KHAZANA_TEACHER_DETAILS = (programName, subjectName, teacherName) =>
        `${API.base_url}/api/khazana/${programName}/${subjectName}/${teacherName}`;

    static GET_KHAZANA_CHAPTER_SUBTOPICS = (programName, subjectName, teacherName, chapterName) =>
        `${API.base_url}/api/khazana/${programName}/${subjectName}/${teacherName}/${chapterName}`;

    static GET_KHAZANA_CHAPTER_LECTURES = (programName, subjectName, teacherName, chapterName,subTopic) =>
        `${API.base_url}/api/khazana/${programName}/${subjectName}/${teacherName}/${chapterName}/${subTopic}`;

    static  GET_BATCHES_SUBJECTS = (batch_name)=>
        `${API.base_url}/api/batches/${batch_name}`;

    static GET_BATCHES_CHAPTERS = (batch_name, subject_name)=>
        `${API.base_url}/api/batches/${batch_name}/${subject_name}`;

    static GET_BATCHES_LECTURES = (batch_name, subject_name, chapter_name) =>
        `${API.base_url}/api/batches/${batch_name}/${subject_name}/${chapter_name}`;

    static GET_BATCHES_NOTES = (batch_name, subject_name, chapter_name) =>
        `${API.base_url}/api/batches/${batch_name}/${subject_name}/${chapter_name}/notes`;

    // static GET_KHAZANA_SUBJECTS = (batchId) =>
    //     `${API.base_url}/subjects?batch_name=${batchId}`;
    //
    // static GET_KHAZANA_BATCHES = (batchId, batchSlug) =>
    //     `${API.base_url}/batches/${batchSlug}?batch_name=${batchId}`;
    //
    // static GET_KHAZANA_CHAPTERS = (batchId, batchSlug, subjectSlug) =>
    //     `${API.base_url}/chapters/${subjectSlug}?batch_name=${batchSlug}`;
    //
    // static GET_KHAZANA_LECTURES = (batchId, batchSlug, subjectSlug, chapterSlug) =>
    //     `${API.base_url}/lectures?batch_name=${batchId}&subject_slug=${subjectSlug}&chapter_slug=${chapterSlug}`;

    static SEND_OTP = `${API.base_url}/otp`;

    static VERIFY_OTP = `${API.base_url}/verify-otp`;

    static CHECK_LOGIN = `${API.base_url}/check_token`;

    static RESET_TOKEN = `${API.base_url}/change_to_old_token_scheme`;

    static CHECK_SESSION_ACTIVE = (clientId, sessionId) =>
        `${API.base_url}/session/${clientId}/${sessionId}/active`;

    static GET_ACTIVE_SESSIONS = (clientId) =>
        `${API.base_url}/client/${clientId}/active_sessions`;

    static DELETE_SESSION = (clientId, sessionId) =>
        `${API.base_url}/client/${clientId}/${sessionId}/delete_session`;

    static DELETE_CLIENT = (clientId) =>
        `${API.base_url}/client/${clientId}/delete_client`;
}

export default API;