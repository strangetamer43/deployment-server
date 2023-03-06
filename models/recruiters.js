import mongoose from 'mongoose';

const recruiterSchema = mongoose.Schema({
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
    role : {
        type :Number ,
        default : 1
    },
    googleId: {
        type: String
    },
    test :{
        type:Array,
        default:[]
    },
    test_created_data :{
        type: Date,
        default :Date.now
    }
})

export default mongoose.model("Recruiter", recruiterSchema);
