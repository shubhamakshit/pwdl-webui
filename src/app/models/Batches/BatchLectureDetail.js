// models/BatchLectureDetail.js

class BatchLectureDetail {
    constructor({
                    _id,
                    conversationId,
                    dRoomId,
                    date,
                    endTime,
                    hasAttachment,
                    isBatchDoubtEnabled,
                    isChatEnabled,
                    isCommentDisabled,
                    isDPPNotes,
                    isDPPVideos,
                    isDoubtEnabled,
                    isFree,
                    isLocked,
                    isPathshala,
                    isSimulatedLecture,
                    isVideoLecture,
                    lectureType,
                    name,
                    restrictedSchedule,
                    restrictedTime,
                    roomId,
                    startTime,
                    status,
                    tags = [],
                    teachers = [],
                    timeline = [],
                    url,
                    urlType,
                    videoDetails,
                    whiteboardType,
                    ytStreamKey,
                    ytStreamUrl
                }) {
        this.id = _id;
        this.conversationId = conversationId;
        this.dRoomId = dRoomId;
        this.date = date ? new Date(date) : null;
        this.endTime = endTime ? new Date(endTime) : null;
        this.hasAttachment = hasAttachment;
        this.isBatchDoubtEnabled = isBatchDoubtEnabled;
        this.isChatEnabled = isChatEnabled;
        this.isCommentDisabled = isCommentDisabled;
        this.isDPPNotes = isDPPNotes;
        this.isDPPVideos = isDPPVideos;
        this.isDoubtEnabled = isDoubtEnabled;
        this.isFree = isFree;
        this.isLocked = isLocked;
        this.isPathshala = isPathshala;
        this.isSimulatedLecture = isSimulatedLecture;
        this.isVideoLecture = isVideoLecture;
        this.lectureType = lectureType;
        this.name = name;
        this.restrictedSchedule = restrictedSchedule;
        this.restrictedTime = restrictedTime;
        this.roomId = roomId;
        this.startTime = startTime ? new Date(startTime) : null;
        this.status = status;
        this.tags = tags.map(tag => ({
            id: tag._id,
            name: tag.name
        }));
        this.teachers = teachers;
        this.timeline = timeline; // Assuming timeline is an array of simple objects or primitives
        this.url = url;
        this.urlType = urlType;
        this.videoDetails = videoDetails ? {
            id: videoDetails._id,
            createdAt: new Date(videoDetails.createdAt),
            description: videoDetails.description,
            drmProtected: videoDetails.drmProtected,
            duration: videoDetails.duration,
            findKey: videoDetails.findKey,
            image: videoDetails.image,
            name: videoDetails.name,
            status: videoDetails.status,
            types: videoDetails.types,
            videoUrl: videoDetails.videoUrl
        } : null;
        this.state = {
            name : name,
            id : _id,
        };
        this.whiteboardType = whiteboardType;
        this.ytStreamKey = ytStreamKey;
        this.ytStreamUrl = ytStreamUrl;
    }

    static fromJSON(json) {
        return new BatchLectureDetail(json);
    }
}

export default BatchLectureDetail;