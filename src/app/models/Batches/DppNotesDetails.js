// models/DppNotesDetails.js

class DppNotesDetails {
    constructor({
        _id,
        dRoomId,
        date,
        homeworkIds = [],
        isBatchDoubtEnabled,
        isDPPNotes,
        isFree,
        isSimulatedLecture,
        startTime,
        status
    }) {
        this.id = _id;
        this.dRoomId = dRoomId;
        this.date = date ? new Date(date) : null;
        this.homeworks = homeworkIds.map(homework => ({
            id: homework._id,
            actions: homework.actions,
            attachments: homework.attachmentIds.map(attachment => ({
                id: attachment._id,
                baseUrl: attachment.baseUrl,
                key: attachment.key,
                link:attachment.baseUrl+attachment.key,
                name: attachment.name
            })),
            batchSubjectId: homework.batchSubjectId,
            note: homework.note,
            solutionVideoId: homework.solutionVideoId,
            solutionVideoType: homework.solutionVideoType,
            solutionVideoUrl: homework.solutionVideoUrl,
            topic: homework.topic
        }));
        this.isBatchDoubtEnabled = isBatchDoubtEnabled;
        this.isDPPNotes = isDPPNotes;
        this.isFree = isFree;
        this.isSimulatedLecture = isSimulatedLecture;
        this.startTime = startTime ? new Date(startTime) : null;
        this.status = status;
    }

    static fromJSON(json) {
        return new DppNotesDetails(json);
    }
}

export default DppNotesDetails;