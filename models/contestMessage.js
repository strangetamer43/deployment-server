import mongoose from 'mongoose';

const contestSchema = mongoose.Schema({
    title: String,
    message: String,
    name: String,
    creator: String,
    tags: [String],
    selectedFile: String,
    prizes: String,
    fromDate: String,
    toDate: String,
    registeredUsers: {
        type: [String],
        default: [],
    },
    likes: {
        type: [String],
        default: [],
    },
    disLikes: {
        type: [String],
        default: [],
    },
    comments: {
        type: [String],
        default: [],
    },
    createdAt: {
        type: Date,
        default: new Date()
    }, 
});

const ContestMessage = mongoose.model('ContestMessage', contestSchema);

export default ContestMessage;