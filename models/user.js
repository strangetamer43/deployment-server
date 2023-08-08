import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
    name: { type: String },
    username: { type: String },
    emailId: { type: String },
    phoneNumber: { type: String },
    password: { type: String },
    imageUrl: String,
    quizs: {
        type: [String],
    },
    responses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'response'
    }],
    googleId: {
        type: String
    },
    followers: [{
        user: String,
        name: String,
        userName: String
    }],
    following: [{
        user: String,
        name: String,
        userName: String

    }]
})

export default mongoose.model("User", userSchema);
