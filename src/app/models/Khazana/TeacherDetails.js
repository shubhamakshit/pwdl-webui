// models/TeacherDetails.js

class TeacherDetails {
    constructor({
                    _id,
                    __v,
                    banners = [],
                    createdAt,
                    description,
                    displayOrder,
                    imageId,
                    isPurchased,
                    isSpecial,
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
                    totalTopics,
                    updatedAt
                }) {
        this.id = _id;
        this.version = __v;
        this.banners = banners;
        this.createdAt = new Date(createdAt);
        this.description = description;
        this.displayOrder = displayOrder;
        this.image = imageId ? {
            id: imageId._id,
            baseUrl: imageId.baseUrl,
            createdAt: new Date(imageId.createdAt),
            key: imageId.key,
            name: imageId.name,
            organization: imageId.organization
        } : null;
        this.isPurchased = isPurchased;
        this.isSpecial = isSpecial;
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
        this.totalTopics = totalTopics;
        this.updatedAt = new Date(updatedAt);
    }

    static fromJSON(json) {
        return new TeacherDetails(json);
    }
}

export default TeacherDetails;
