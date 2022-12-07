import mongoose from 'mongoose';

const questionSchema = mongoose.Schema({
    title: String,
    message: String,
    name: String,
    creator: String,
    tags: [String],
    imageUrl: String,
    public_id: String,
    avatarUrl: String,
    videoUrl: String,
    public_idV: String,
    likes: {
        type: [String],
        default: [],
    },
    disLikes: {
        type: [String],
        default: [],
    },
    comments: {
        type: [{
            value: String,
            userID: String,
            name: String,
            profile: String
        }]
    },
    createdAt: {
        type: Date,
        default: new Date()
    }, 
});

const QuestionMessage = mongoose.model('QuestionMessage', questionSchema);

export default QuestionMessage;
