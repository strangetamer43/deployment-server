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
    }
})

export default mongoose.model("User", userSchema);