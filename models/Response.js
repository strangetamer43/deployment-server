import mongoose from "mongoose";

const answersSchema = mongoose.Schema({
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
    },
    response: [{
        questionId: mongoose.Schema.Types.ObjectId,
        option: String
    }],
    correctAnswers: {
        type: Number,
        require: true

    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'

    },
    userName: {
        type: String
    }, quizName: {
        type: String
    },
    grade: {
        type: String
    },
    videos: [{
        type: String
    }]
})

const responseModel = mongoose.model("Response", answersSchema)
export default responseModel;