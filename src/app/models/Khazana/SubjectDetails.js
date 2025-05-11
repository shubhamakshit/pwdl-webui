// models/SubjectDetails.js

class SubjectDetails {
    constructor({
                    _id,
                    createdAt,
                    displayOrder,
                    hasSubjectiveContent,
                    isPurchased,
                    isSpecial,
                    name,
                    organizationId,
                    price,
                    programId,
                    slug,
                    status,
                    totalChapters,
                    totalConcepts,
                    totalExercises,
                    totalFlashCards,
                    totalLectures,
                    totalPodcast,
                    totalSubTopics,
                    totalTopics,
                    updatedAt,
                }) {
        this.id = _id;
        this.createdAt = new Date(createdAt);
        this.displayOrder = displayOrder;
        this.hasSubjectiveContent = hasSubjectiveContent;
        this.isPurchased = isPurchased;
        this.isSpecial = isSpecial;
        this.name = name;
        this.organizationId = organizationId;
        this.price = price;
        this.programId = programId;
        this.slug = slug;
        this.status = status;
        this.totalChapters = totalChapters;
        this.totalConcepts = totalConcepts;
        this.totalExercises = totalExercises;
        this.totalFlashCards = totalFlashCards;
        this.totalLectures = totalLectures;
        this.totalPodcast = totalPodcast;
        this.totalSubTopics = totalSubTopics;
        this.totalTopics = totalTopics;
        this.updatedAt = new Date(updatedAt);
    }

    static fromJSON(json) {
        return new SubjectDetails(json);
    }
}

export default SubjectDetails;
