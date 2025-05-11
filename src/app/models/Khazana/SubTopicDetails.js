// models/SubTopicDetails.js

class SubTopicDetails {
    constructor({
                    __v,
                    _id,
                    chapterId,
                    createdAt,
                    displayOrder,
                    name,
                    organizationId,
                    price,
                    programId,
                    slug,
                    status,
                    subjectId,
                    topicId,
                    totalConcepts,
                    totalExercises,
                    totalFlashCards,
                    totalLectures,
                    totalPodcast,
                    updatedAt
                }) {
        this.id = _id;
        this.version = __v;
        this.chapterId = chapterId;
        this.createdAt = new Date(createdAt);
        this.displayOrder = displayOrder;
        this.name = name;
        this.organizationId = organizationId;
        this.price = price;
        this.programId = programId;
        this.slug = slug;
        this.status = status;
        this.subjectId = subjectId;
        this.totalConcepts = totalConcepts;
        this.totalExercises = totalExercises;
        this.totalFlashCards = totalFlashCards;
        this.totalLectures = totalLectures;
        this.totalPodcast = totalPodcast;
        this.updatedAt = new Date(updatedAt);

        this.topic = topicId ? {
            id: topicId._id,
            version: topicId.__v,
            name: topicId.name,
            slug: topicId.slug,
            chapterId: topicId.chapterId,
            displayOrder: topicId.displayOrder,
            hasSubjectiveContent: topicId.hasSubjectiveContent,
            createdAt: new Date(topicId.createdAt),
            updatedAt: new Date(topicId.updatedAt),
            organizationId: topicId.organizationId,
            price: topicId.price,
            programId: topicId.programId,
            status: topicId.status,
            subjectId: topicId.subjectId,
            totalConcepts: topicId.totalConcepts,
            totalExercises: topicId.totalExercises,
            totalExperience: topicId.totalExperience,
            totalFlashCards: topicId.totalFlashCards,
            totalLectures: topicId.totalLectures,
            totalPodcast: topicId.totalPodcast,
            totalSubTopics: topicId.totalSubTopics
        } : null;
    }

    static fromJSON(json) {
        return new SubTopicDetails(json);
    }
}

export default SubTopicDetails;
