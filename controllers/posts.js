import mongoose  from "mongoose";
import PostMessage from "../models/postMessage.js";
import User from "../models/user.js";
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from "fs";
dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API,
    api_secret: process.env.CLOUDINARY_SECRET
});
export const getPosts = async (req, res) => {
    try {
        const posts = await PostMessage.find().sort({ _id: -1 });
        
        res.status(200).json({ data: posts});
    }   catch (error) {
        res.status(404).json({ message: error.message});  

    }
};
export const getPost = async (req, res) => {
    const { id } = req.params;
    try {
        const post = await PostMessage.findById(id);
        
        res.status(200).json(post);
    }   catch (error) {
        res.status(404).json({ message: error.message});  

    }
};
export const getPostsBySearch = async (req, res) => {
    const { searchQuery, tags } = req.query
    try {
        const title = new RegExp(searchQuery, 'i');
        const posts = await PostMessage.find({ $or : [ {title}, { tags: { $in: tags.split(',') } } ]});
        res.json({ data: posts });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}
export const createPost = async (req, res) => {
  
  const video = req.files.video;
  const image = req.files.image;
  
  if (!image) {
    const vid_name = video.name;
    const vid_path = video.tempFilePath;
    cloudinary.uploader.upload(vid_path, {resource_type: "video", public_id: `usurp/${vid_name}`, notification_url: "http://localhost:5000/posts", overwrite: true, quality: "auto"}, (error, result) => {
    const { title, message, tags, name, avatarUrl } = req.body;
    const vid = result?.url;
    const pub = result?.public_id;
    const newPost = new PostMessage({ title, message, tags, name, avatarUrl, videoUrl: vid, public_idV: pub, creator: req.userId, createdAt: new Date().toISOString() });
  
  
    try {
          newPost.save();
          fs.unlinkSync(video.tempFilePath);
          res.status(201).json(newPost);
      } catch (error) {
          res.status(409).json({ message: error.message});
          
      }
  }
 
  ); 
} else if(!video) {
  cloudinary.uploader.upload(image.tempFilePath,{quality: "auto"}, (err, result) => {
    
    const { title, message, tags, name, avatarUrl } = req.body;
   const img = result.url;
   const pub = result.public_id;
    const newPost = new PostMessage({ title, message, tags, name, avatarUrl, imageUrl: img, public_id: pub, creator: req.userId, createdAt: new Date().toISOString() });
  
  
    try {
          newPost.save();
          fs.unlinkSync(image.tempFilePath);
          res.status(201).json(newPost);
      } catch (error) {
          res.status(409).json({ message: error.message});
          
      }
      
});

} else if(!image && !video){
    const { title, message, tags, name, avatarUrl } = req.body;
    const newPost = new PostMessage({ title, message, tags, name, avatarUrl, creator: req.userId, createdAt: new Date().toISOString() })
    try {
        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        res.status(409).json({ message: error.message});
        
    }
}
 
}

export const updatePost = async (req, res) => {
    const { id: _id } = req.params;
    const post = req.body;

    if(!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send('No post with that ID');
    const updatedPost = await PostMessage.findByIdAndUpdate(_id, { ...post, _id }, { new: true });
    res.json(updatedPost);
}
export const deletePost = async (req, res) => {
    const { id } = req.params;
    
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No post with that ID');
    const post = await PostMessage.findById(id);
    if(post.public_id){
    cloudinary.uploader.destroy(post.public_id, function(result)
    { console.log("image deleted") });
    } else{
        cloudinary.api.delete_resources(post.public_idV, { resource_type: "video" }, function(result){console.log("Video deleted")} );
    }    
    await PostMessage.findByIdAndRemove(id);
    
    res.json({ message: 'Post Deleted Successfully' });
}
export const likePost = async (req, res) => {
    const { id } = req.params;
    if(!req.userId) return res.json({ message: "Unauthenticated" });
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No post with that ID');
    const post = await PostMessage.findById(id);
    const index = post.likes.findIndex((id) => id === String(req.userId));
    if(index === -1) {
        post.likes.push(req.userId);
    } else {
        post.likes = post.likes.filter((id) => id !== String(req.userId));
    }
    const updatedPost = await PostMessage.findByIdAndUpdate(id, post, { new: true } );
    res.json(updatedPost);

}
export const disLikePost = async (req, res) => {
    const { id } = req.params;
    
    if(!req.userId) return res.json({ message: "Unauthenticated" });
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No post with that ID');
    const post = await PostMessage.findById(id);
    const index = post.disLikes.findIndex((id) => id === String(req.userId));
    if(index === -1) {
        post.disLikes.push(req.userId);
    } else {
        post.disLikes = post.disLikes.filter((id) => id !== String(req.userId));
    }
    const updatedPost = await PostMessage.findByIdAndUpdate(id, post, { new: true } );
    
    res.json(updatedPost);

}
export const commentPost = async (req, res) => {
    const { id } = req.params;
    const message = req.body.value;
    const post = await PostMessage.findById(id);
    post.comments.push(message);
    const updatedPost = await PostMessage.findByIdAndUpdate(id, post, { new: true});
    res.json(updatedPost);
}

export const getUserPosts = async (req, res) => {
    
    const userId = req.userId;
    try {
            
        const userPosts = await PostMessage.find({creator: userId}).sort({ _id: -1 });
        res.status(200).json({data: userPosts}); 
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error });
    }
};
export const getSpecificUserPosts = async (req, res) => {
    
    const {creator} = req.body;
    
    try {
            
        const specificUserPosts = await PostMessage.find({creator: creator}).sort({ _id: -1 });
        res.status(200).json({data: specificUserPosts}); 
        
        
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error });
    }
};
