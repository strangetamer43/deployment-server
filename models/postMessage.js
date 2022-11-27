import mongoose from 'mongoose';

const postSchema = mongoose.Schema({
    title: String,
    message: String,
    name: String,
    creator: String,
    tags: [String],
    imageUrl: String,
    videoUrl: String,
    public_id: String,
    public_idV: String,
    avatarUrl: String,
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

const PostMessage = mongoose.model('PostMessage', postSchema);

export default PostMessage;

