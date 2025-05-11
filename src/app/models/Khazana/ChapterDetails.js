// models/ChapterDetails.js

class ChapterDetails {
    constructor({
                    __v,
                    _id,
                    chapter,
                    createdAt,
                    displayOrder,
                    hasSubjectiveContent,
                    name,
                    organizationId,
                    price,
                    programId,
                    slug,
                    status,
                    subjectId,
                    totalConcepts,
                    totalExercises,
                    totalExperience,
                    totalFlashCards,
                    totalLectures,
                    totalPodcast,
                    totalSubTopics,
                    updatedAt
                }) {
        this.id = _id;
        this.version = __v;
        this.createdAt = new Date(createdAt);
        this.displayOrder = displayOrder;
        this.hasSubjectiveContent = hasSubjectiveContent;
        this.name = name;
        this.organizationId = organizationId;
        this.price = price;
        this.programId = programId;
        this.slug = slug;
        this.status = status;
        this.subjectId = subjectId;
        this.totalConcepts = totalConcepts;
        this.totalExercises = totalExercises;
        this.totalExperience = totalExperience;
        this.totalFlashCards = totalFlashCards;
        this.totalLectures = totalLectures;
        this.totalPodcast = totalPodcast;
        this.totalSubTopics = totalSubTopics;
        this.updatedAt = new Date(updatedAt);

        this.chapter = chapter ? {
            id: chapter._id,
            name: chapter.name,
            description: chapter.description,
            displayOrder: chapter.displayOrder,
            imageId: chapter.imageId,
            isSpecial: chapter.isSpecial,
            programId: chapter.programId,
            slug: chapter.slug,
            status: chapter.status,
            subjectId: chapter.subjectId,
            totalConcepts: chapter.totalConcepts,
            totalExercises: chapter.totalExercises,
            totalExperience: chapter.totalExperience,
            totalFlashCards: chapter.totalFlashCards,
            totalLectures: chapter.totalLectures,
            totalPodcast: chapter.totalPodcast,
            totalSubTopics: chapter.totalSubTopics,
            totalTopics: chapter.totalTopics,
            createdAt: new Date(chapter.createdAt),
            updatedAt: new Date(chapter.updatedAt)
        } : null;
    }

    static fromJSON(json) {
        return new ChapterDetails(json);
    }
}

export default ChapterDetails;
