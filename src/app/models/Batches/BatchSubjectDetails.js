// models/BatchSubjectDetails.js

class BatchSubjectDetails {
    constructor({
                    _id,
                    batchId,
                    displayOrder,
                    fileId,
                    imageId,
                    lectureCount,
                    name,
                    qbgSubjectId,
                    schedules = [],
                    slug,
                    subjectId,
                    substituteTeacherIds = [],
                    tagCount,
                    teacherIds = []
                }) {
        this.id = _id;
        this.batchId = batchId;
        this.displayOrder = displayOrder;
        this.fileId = fileId;
        this.image = imageId ? {
            id: imageId._id,
            baseUrl: imageId.baseUrl,
            key: imageId.key,
            name: imageId.name
            // Note: The sample JSON for imageId does not include createdAt or organization,
            // so we'll omit them here to match the sample structure.
        } : null;
        this.lectureCount = lectureCount;
        this.name = name;
        this.qbgSubjectId = qbgSubjectId;
        this.schedules = schedules.map(schedule => ({
            id: schedule._id,
            day: schedule.day,
            endTime: new Date(schedule.endTime),
            startTime: new Date(schedule.startTime)
        }));
        this.slug = slug;
        this.subjectId = subjectId;
        this.substituteTeacherIds = substituteTeacherIds;
        this.tagCount = tagCount;
        this.teacherIds = teacherIds;
    }

    static fromJSON(json) {
        return new BatchSubjectDetails(json);
    }
}

export default BatchSubjectDetails;