// models/LectureDetails.js

class LectureDetails {
    constructor({
                    __v,
                    _id,
                    actions,
                    availableFor,
                    avgRating,
                    chapterDetails,
                    chapterId,
                    content,
                    isAvailableFromPoints,
                    isBookmarked,
                    isClinicalCornerEnabled,
                    isFarreForConceptEnabled,
                    isImportant,
                    isLiked,
                    isLive,
                    isPurchased,
                    meta,
                    myRating,
                    price,
                    programId,
                    restrictContent,
                    restrictionCount,
                    subjectDetails,
                    subjectId,
                    teachers,
                    title,
                    topicDetails,
                    type
                }) {
        this.id = _id;
        this.version = __v;
        this.actions = actions || [];
        this.availableFor = availableFor || [];
        this.avgRating = avgRating;
        this.isAvailableFromPoints = isAvailableFromPoints;
        this.isBookmarked = isBookmarked;
        this.isClinicalCornerEnabled = isClinicalCornerEnabled;
        this.isFarreForConceptEnabled = isFarreForConceptEnabled;
        this.isImportant = isImportant;
        this.isLiked = isLiked;
        this.isLive = isLive;
        this.isPurchased = isPurchased;
        this.meta = meta || [];
        this.myRating = myRating;
        this.price = price;
        this.restrictContent = restrictContent;
        this.restrictionCount = restrictionCount;
        this.teachers = teachers || [];
        this.title = title;
        this.name = title;

        this.type = type;

        this.chapterDetails = chapterDetails ? {
            id: chapterDetails._id,
            name: chapterDetails.name
        } : null;

        this.chapterId = chapterId ? {
            id: chapterId._id,
            name: chapterId.name
        } : null;

        this.subjectDetails = subjectDetails ? {
            id: subjectDetails._id,
            name: subjectDetails.name
        } : null;

        this.subjectId = subjectId ? {
            id: subjectId._id,
            name: subjectId.name
        } : null;

        this.programId = programId ? {
            id: programId._id,
            isSpecial: programId.isSpecial,
            slug: programId.slug
        } : null;



        this.topicDetails = topicDetails ? {
            id: topicDetails._id,
            name: topicDetails.name
        } : null;

        this.content = (content || []).map(c => ({
            id: c._id,
            text: c.text,
            timeline: c.timeline || [],
            videoType: c.videoType,
            videoUrl: c.videoUrl,
            videoDetails: c.videoDetails ? {
                id: c.videoDetails._id,
                createdAt: c.videoDetails.createdAt ? new Date(c.videoDetails.createdAt) : null,
                drmProtected: c.videoDetails.drmProtected,
                duration: c.videoDetails.duration,
                image: c.videoDetails.image,
                name: c.videoDetails.name,
                status: c.videoDetails.status,
                types: c.videoDetails.types || [],
                videoUrl: c.videoDetails.videoUrl
            } : null
        }));

        this.state = {
            name : title,
            batch_name : this.programId.id,
            id: this.id,
            topic_name : this.subjectDetails.id,
            lecture_url : this.content[0]?.videoDetails?.videoUrl,

        }
    }

    static fromJSON(json) {
        return new LectureDetails(json);
    }
}

export default LectureDetails;
