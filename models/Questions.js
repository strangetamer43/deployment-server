import mongoose from "mongoose";

const questionsSchema = new mongoose.Schema({
    quizName: {
        type: String,
        require: true
    },
    questions: [{
        question: {
            type: String
        },
        qImage: {
            type: String,
            default: ""
        },
        options: [{
            option: String,
            image: { type: String, default: "" },
            value: Number
        }],
        answer: {
            type: String,
        },
        duration: {
            minutes: Number,
            seconds: Number
        },
        questionType: {
            type: String
        },
        multipleAudio: {
            type: Boolean
        }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    description: {
        type: String
    },
    totalDuration: {
        type: Number
    },
    attempts: {
        type: Number
    },
    quizImage: {
        type: String
    },
    result: {
        show: String,
        data: [[]]
    },
    visibility: {
        type: Boolean
    },
    numericalAttribute: {
        type: String
    },
    numericalRange: [{
        numericalRange: [],
        scoreRange: [[]]
    }],
    scoring: {
        type: String
    },
    showScore: {
        type: Boolean
    },
    instructions: [{
        type: String
    }],
    timer: {
        type: String
    },
    duration: {
        minutes: Number,
        seconds: Number
    },
    recording: {
        type: String
    }


})

const questionModel = new mongoose.model("Questions", questionsSchema)
export default questionModel;
