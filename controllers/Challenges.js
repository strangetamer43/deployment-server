import questionModel from "../models/Questions.js";
import userModel from "../models/user.js";
import { v2 as cloudinary } from 'cloudinary';
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API,
    api_secret: process.env.CLOUDINARY_SECRET,
});



export const createQuiz = async (req, res) => {
    try {


        var data = {
            createdBy: req.body.createdBy,
            quizName: req.body.quizName,
            description: req.body.description,
            instructions: req.body.instructions

        }
        var newQuiz = new questionModel(data)
        await newQuiz.save().then((docs) => {
            userModel.updateOne(
                { _id: data.createdBy },
                { $push: { quizs: docs._id } })
                .then(() => {
                    console.log("New quiz is created")
                }).catch(error => console.log(error))
            res.status(203).json(docs);


        })
    } catch (error) {
        res.status(403).json({ message: error.message })

    }
}


export const editQUiz = async (req, res) => {

    try {
        var quizId = req.body.quizId;



        var data = req.body;
        var totalDuration = 0;
        if (data.questions) {

            for (var i = 0; i < data.questions.length; i++) {
                var time = (data.questions[i].duration.minutes + data.questions[i].duration.seconds / 60);
                totalDuration += time
            }
            data['totalDuration'] = totalDuration;
        }

        questionModel.findByIdAndUpdate(quizId, data, { new: true }, (err, result) => {
            if (err) {
                res.status(403).json(err)
            } else {
                res.status(203).json(result)
            }
        })

    } catch (error) {
        console.log(error)
        res.status(403).json({ message: error.message })
    }

}


export const getQuizById = async (req, res) => {
    try {
        const quizId = req.params.quizId;
        questionModel.findById(quizId, (err, result) => {
            if (err) {
                res.status(403).json({ message: "Quiz Not Found" })
            } else {
                res.status(203).json(result)
            }
        })
    } catch (error) {
        res.status(403).json({ message: error.message })
    }
}


export const getAllQuizOfUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log(userId);
        userModel.findById(userId, async (err, result) => {
            if (err) {
                res.status(403).json({ message: "User not found" })
            } else {
                if (!result?.quizs) {
                    res.status(403).json({ message: "No quizs are created by this user" })
                } else {
                    questionModel.find().where("_id").in(result.quizs).exec((err, records) => {
                        res.status(203).json(records)
                    })
                }

            }
        })
    } catch (error) {
        res.status(403).json({ message: error.message })

    }
}


export const getAllQuizs = async (req, res) => {
    try {
        const result = await questionModel.find().lean();
        res.status(203).json(result)
    } catch (error) {
        res.status(403).json({ message: error.message })
    }
}


export const getQuizBySearchForUser = async (req, res) => {
    try {
        const search = req.params.search;
        const userId = req.body.userId;
        console.log(req.body)

        questionModel.find({
            $and: [
                {
                    $or: [
                        { "quizName": { $regex: search, $options: 'i' } },
                        { "description": { $regex: search, $options: 'i' } }
                    ]
                },
                {
                    "createdBy": userId
                }
            ]
        }, (err, result) => {
            if (err) {
                res.status(403).json({ message: "No Quiz found" })

            } else {
                res.status(203).json(result)
            }
        })
    } catch (error) {
        res.status(403).json({ message: error.message })


    }
}

export const getQuizBySearch = async (req, res) => {
    try {
        const search = req.params.search;
        const result = await questionModel.aggregate([{

            '$search': {
                'index': 'question',
                'text': {
                    'query': search,
                    'path': {
                        'wildcard': '*'
                    }
                }
            }

        }])

        res.status(203).json(result)
    } catch (error) {
        res.status(403).json({ message: error.message })


    }
}

export const getQuizsOfUserLazyLoading = async (req, res) => {
    try {
        const { page } = req.body;
        const { userId } = req.body;
        const LIMIT = 2
        const startIndex = (Number(page) - 1) * LIMIT;


        const quizs = await questionModel.find({ createdBy: userId }).sort({ _id: -1 }).limit(LIMIT).skip(startIndex)
        res.status(203).json(quizs)
    } catch (error) {
        console.log("fkdpk")
        console.log(error)
        res.status(403).json(error)

    }
}

export const getQuizsLazyLoading = async (req, res) => {
    try {
        const { page } = req.body;
        const LIMIT = 2
        const startIndex = (Number(page) - 1) * LIMIT;

        const quizs = await questionModel.find({ visibility: true }).sort({ _id: -1 }).limit(LIMIT).skip(startIndex)
        console.log(quizs)
        res.status(203).json(quizs)
    } catch (error) {
        console.log("fkdpk")
        console.log(error)
        res.status(403).json(error)

    }
}
