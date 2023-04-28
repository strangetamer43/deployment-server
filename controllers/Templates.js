import questionModel from "../models/Questions.js";
import mongoose  from "mongoose";
import recruiterModel from "../models/recruiters.js";
import templateModel from "../models/Templates.js";
import { v2 as cloudinary } from 'cloudinary';
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API,
    api_secret: process.env.CLOUDINARY_SECRET,
});


export const addTemplate = async (req, res) => {
    const objectId = req.body.objectId;
    const userId = req.body.userId;
    
    try {
        const originalQuiz = await templateModel.findById(objectId);
        

        if (originalQuiz) {
            const newQuiz = new questionModel({
                ...originalQuiz.toObject(),
                _id: mongoose.Types.ObjectId(),
                createdBy: userId,
            });

            await newQuiz.save().then((docs) => {
                recruiterModel.updateOne(
                    { _id: userId },
                    { $push: { quizs: docs._id } })
                    .then(() => {
                        console.log("Template switcher works")
                    }).catch(error => console.log(error))
                res.status(203).json(docs);
    
    
            })
        } else{
            res.status(404).json({message: "Object not found"});
        }

    }   catch (error) {
        res.status(500).json({message: error.message})
    }
}

export const getTemplateQuizes = async (req, res) => {
    try {
        const quizes = await templateModel.find();
        
        res.status(200).json({ data: quizes});
    }   catch (error) {
        res.status(404).json({ message: error.message});  

    }
};

export const getQuizsLazyLoading = async (req, res) => {
    try {
        const { page } = req.body;
        const LIMIT = 4
        const startIndex = (Number(page) - 1) * LIMIT;

        const quizs = await templateModel.find({ visibility: true }).sort({ _id: -1 }).limit(LIMIT).skip(startIndex)
        
        res.status(203).json(quizs)
    } catch (error) {
        
        console.log(error)
        res.status(403).json(error)

    }
}

export const getQuizBySearch = async (req, res) => {
    try {
        const search = req.params.search;
        const result = await templateModel.aggregate([{

            '$search': {
                'index': 'templates',
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

export const getTemplateById = async (req, res) => {
    try {
        const quizId = req.params.quizId;
        templateModel.findById(quizId, (err, result) => {
            if (err) {
                res.status(403).json({ message: err.message })
            } else {
                res.status(203).json(result)
            }
        })
    } catch (error) {
        res.status(403).json({ message: error.message })
    }
}


export const internalTemplateSwitch = async (req, res) => {
    const objectId = req.body.objectId;
    const userId = req.body.userId;
    
    try {
        const originalQuiz = await questionModel.findById(objectId);
        

        if (originalQuiz) {
            const newQuiz = new templateModel({
                ...originalQuiz.toObject(),
                _id: mongoose.Types.ObjectId(),
                createdBy: userId,
            });

            await newQuiz.save();
            console.log(newQuiz._id);
            res.status(201).json(newQuiz);
        } else{
            res.status(404).json({message: "Object not found"});
        }

    }   catch (error) {
        res.status(500).json({message: error.message})
    }
}
