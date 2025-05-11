// models/BatchChapterDetail.js

class BatchChapterDetail {
    constructor({
                    _id,
                    displayOrder,
                    exercises,
                    lectureVideos,
                    name,
                    notes,
                    slug,
                    type,
                    typeId,
                    videos
                }) {
        this.id = _id;
        this.displayOrder = displayOrder;
        this.exercises = exercises;
        this.lectureVideos = lectureVideos;
        this.name = name;
        this.notes = notes;
        this.slug = slug;
        this.type = type;
        this.typeId = typeId;
        this.videos = videos;
    }

    static fromJSON(json) {
        return new BatchChapterDetail(json);
    }
}

export default BatchChapterDetail;