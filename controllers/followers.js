import mongoose  from "mongoose";
import FollowerMessage from "../models/followerMessage.js";

export const createFollowers = async (req, res) => {
    const { followers, names, owner } = req.body;
    const newFollowers = new FollowerMessage({ followers, names, owner, createdAt: new Date().toISOString() });
    try {
        await newFollowers.save();
        res.status(201).json(newFollowers);
    } catch (error) {
        res.status(409).json({ message: error.message}); 
    }
}
export const getFollowers = async (req, res) => {
    try {
        const followers = await FollowerMessage.find().sort({ _id: -1 });
        
        res.status(200).json({ data: followers});
    }   catch (error) {
        res.status(404).json({ message: error.message});  

    }
}
export const deleteFollowers = async (req, res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No Contest with that ID');

    await FollowerMessage.findByIdAndRemove(id);
    
    res.json({ message: 'Follower removed Successfully' });
}