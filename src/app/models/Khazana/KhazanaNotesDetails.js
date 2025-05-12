// models/KhazanaNotes.js

class KhazanaNotesDetails {
    constructor({
                    __v,
                    _id,
                    actions = [],
                    availableFor = [],
                    avgRating,
                    chapterDetails,
                    chapterId, // Keeping both chapterDetails and chapterId as per sample
                    content = [],
                    isAvailableFromPoints,
                    isBookmarked,
                    isClinicalCornerEnabled,
                    isFarreForConceptEnabled,
                    isImportant,
                    isLiked,
                    isLive,
                    isPurchased,
                    meta = [], // Assuming meta is an array, though sample is empty
                    myRating,
                    price,
                    programId,
                    restrictContent,
                    restrictionCount,
                    subjectDetails,
                    subjectId, // Keeping both subjectDetails and subjectId as per sample
                    teachers = [], // Assuming teachers is an array, though sample is empty
                    title,
                    topicDetails,
                    type
                }) {
        this.version = __v;
        this.id = _id;
        this.actions = actions;
        this.availableFor = availableFor;
        this.avgRating = avgRating;
        this.chapterDetails = chapterDetails ? {
            id: chapterDetails._id,
            name: chapterDetails.name,
        } : null;
        this.chapterId = chapterId ? { // Mapping chapterId as well
            id: chapterId._id,
            name: chapterId.name,
        } : null;
        this.content = content.map(item => ({
            id: item._id,
            file: item.fileId ? {
                id: item.fileId._id,
                baseUrl: item.fileId.baseUrl,
                link: item.fileId.baseUrl+item.fileId.key,
                createdAt: new Date(item.fileId.created_at),
                key: item.fileId.key,
                name: item.fileId.name,
                type: item.fileId.type,
                updatedAt: new Date(item.fileId.updatedAt),
            } : null,
            text: item.text,
            timeline: item.timeline || [], // Assuming timeline is an array
        }));
        this.isAvailableFromPoints = isAvailableFromPoints;
        this.isBookmarked = isBookmarked;
        this.isClinicalCornerEnabled = isClinicalCornerEnabled;
        this.isFarreForConceptEnabled = isFarreForConceptEnabled;
        this.isImportant = isImportant;
        this.isLiked = isLiked;
        this.isLive = isLive;
        this.isPurchased = isPurchased;
        this.meta = meta;
        this.myRating = myRating;
        this.price = price;
        this.programId = programId ? {
            id: programId._id,
            isSpecial: programId.isSpecial,
            slug: programId.slug,
        } : null;
        this.restrictContent = restrictContent;
        this.restrictionCount = restrictionCount;
        this.subjectDetails = subjectDetails ? {
            id: subjectDetails._id,
            name: subjectDetails.name,
        } : null;
        this.subjectId = subjectId ? { // Mapping subjectId as well
            id: subjectId._id,
            name: subjectId.name,
        } : null;
        this.teachers = teachers;
        this.title = title;
        this.topicDetails = topicDetails ? {
            id: topicDetails._id,
            name: topicDetails.name,
        } : null;
        this.type = type;
    }

    static fromJSON(json) {
        return new KhazanaNotesDetails(json);
    }
}

export default KhazanaNotesDetails;