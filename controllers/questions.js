import mongoose  from "mongoose";
import QuestionMessage from "../models/questionMessage.js";
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API,
    api_secret: process.env.CLOUDINARY_SECRET
});
export const getQuestions = async (req, res) => {
    try {
        const questions = await QuestionMessage.find().sort({ _id: -1 });
        
        res.status(200).json({ data: questions});
    }   catch (error) {
        res.status(404).json({ message: error.message});  

    }
};
export const getQuestion = async (req, res) => {
    const { id } = req.params;
    try {
        const question = await QuestionMessage.findById(id);
        
        res.status(200).json(question);
    }   catch (error) {
        res.status(404).json({ message: error.message});  

    }
};
export const getQuestionsBySearch = async (req, res) => {
    const { searchQuery, tags } = req.query
    try {
        const title = new RegExp(searchQuery, 'i');
        const questions = await QuestionMessage.find({ $or : [ {title}, { tags: { $in: tags.split(',') } } ]});
        res.json({ data: questions });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}
export const createQuestion = async (req, res) => {
  
    const video = req.files.video;
    const image = req.files.image;
    
    if (!image) {
      const vid_name = video.name;
      const vid_path = video.tempFilePath;
      cloudinary.uploader.upload(vid_path, {resource_type: "video", public_id: `usurp/${vid_name}`, notification_url: "http://localhost:5000/questions", overwrite: true}, (error, result) => {
      const { title, message, tags, name, avatarUrl } = req.body;
      const vid = result?.url;
      const pub = result?.public_id;
      const newQuestion = new QuestionMessage({ title, message, tags, name, avatarUrl, videoUrl: vid, public_idV: pub, creator: req.userId, createdAt: new Date().toISOString() });
    
    
      try {
            newQuestion.save();
            res.status(201).json(newQuestion);
        } catch (error) {
            res.status(409).json({ message: error.message});
            
        }
    }
   
    ); 
  } else if(!video) {
    cloudinary.uploader.upload(image.tempFilePath,(err, result) => {
      
      const { title, message, tags, name, avatarUrl } = req.body;
     const img = result.url;
     const pub = result.public_id;
      const newQuestion = new QuestionMessage({ title, message, tags, name, avatarUrl, imageUrl: img, public_id: pub, creator: req.userId, createdAt: new Date().toISOString() });
    
    
      try {
            newQuestion.save();
            res.status(201).json(newQuestion);
        } catch (error) {
            res.status(409).json({ message: error.message});
            
        }
        
  });
  }
  }

export const updateQuestion = async (req, res) => {
    const { id: _id } = req.params;
    const question = req.body;

    if(!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send('No question with that ID');
    const updatedQuestion = await QuestionMessage.findByIdAndUpdate(_id, { ...question, _id }, { new: true });
    res.json(updatedQuestion);
}
export const deleteQuestion = async (req, res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No question with that ID');
    const question = await QuestionMessage.findById(id);
    if(question.public_id){
    cloudinary.uploader.destroy(question.public_id, function(result)
    { console.log("image deleted") });
    } else{
        cloudinary.api.delete_resources(question.public_idV, { resource_type: "video" }, function(result){console.log("Video deleted")} );
    }
    
    await QuestionMessage.findByIdAndRemove(id);
    
    res.json({ message: 'Question Deleted Successfully' });
}
export const likeQuestion = async (req, res) => {
    const { id } = req.params;
    if(!req.userId) return res.json({ message: "Unauthenticated" });
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No question with that ID');
    const question = await QuestionMessage.findById(id);
    const index = question.likes.findIndex((id) => id === String(req.userId));
    if(index === -1) {
        question.likes.push(req.userId);
    } else {
        question.likes = question.likes.filter((id) => id !== String(req.userId));
    }
    const updatedQuestion = await QuestionMessage.findByIdAndUpdate(id, question, { new: true } );
    res.json(updatedQuestion);

}
export const disLikeQuestion = async (req, res) => {
    const { id } = req.params;
    if(!req.userId) return res.json({ message: "Unauthenticated" });
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No question with that ID');
    const question = await QuestionMessage.findById(id);
    const index = question.disLikes.findIndex((id) => id === String(req.userId));
    if(index === -1) {
        question.disLikes.push(req.userId);
    } else {
        question.disLikes = question.disLikes.filter((id) => id !== String(req.userId));
    }
    const updatedQuestion = await QuestionMessage.findByIdAndUpdate(id, question, { new: true } );
    
    res.json(updatedQuestion);

}
export const commentQuestion = async (req, res) => {
    const { id } = req.params;
    const msg = req.body.value;
    const question = await QuestionMessage.findById(id);
    question.comments.push(msg);
    const updatedQuestion = await QuestionMessage.findByIdAndUpdate(id, question, { new: true});
    res.json(updatedQuestion);
}
export const getUserQuestions = async (req, res) => {
    
    const userId = req.userId;
    try {
            
        const userQuestions = await QuestionMessage.find({creator: userId}).sort({ _id: -1 });
        res.status(200).json({data: userQuestions}); 
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error });
    }
};
export const getSpecificUserQuestions = async (req, res) => {
    
    const {creator} = req.body;
    
    try {
            
        const specificUserQuestions = await QuestionMessage.find({creator: creator}).sort({ _id: -1 });
        res.status(200).json({data: specificUserQuestions}); 
        
        
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error });
    }
};
