import mongoose  from "mongoose";
import ProfileMessage from "../models/profileMessage.js";

export const createProfile = async (req, res) => {
    const profile = req.body;
    const newProfile = new ProfileMessage({ ...profile, creator: req.userId, createdAt: new Date().toISOString() });

    try {
        await newProfile.save();
        res.status(201).json(newProfile);
    } catch (error) {
        res.status(409).json({ message: error.message});
        
    }
}
export const getProfile = async (req, res) => {
    const { id: _id } = req.params;
    try {
        const profile = await ProfileMessage.findById(id);
        
        res.status(200).json(profile);
    }   catch (error) {
        res.status(404).json({ message: error.message});  

    }
};
export const updateProfile = async (req, res) => {
    const { id: _id } = req.params;
    const profile = req.body;

    if(!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send('No profile with that ID');
    const updatedProfile = await ProfileMessage.findByIdAndUpdate(_id, { ...profile, _id }, { new: true });
    res.status(203).json(updatedProfile);
}
export const getUserProfile = async (req, res) => {
    
    const userId = req.userId;
    try {
            
        const userProfile = await ProfileMessage.findOne({creator: userId}).sort({ _id: -1 });
        res.status(200).json({data: userProfile}); 
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error });
    }
};
export const getProfiles = async (req, res) => {
    try {
        const profiles = await ProfileMessage.find().sort({ _id: -1 });
        
        res.status(200).json({ data: profiles});
    }   catch (error) {
        res.status(404).json({ message: error.message});  

    }
};
export const getSpecificUserProfile = async (req, res) => {
    
    const creator = req.body.userId;
    
    try {
            
        const specificUserProfile = await ProfileMessage.findOne({creator: creator}).sort({ _id: -1 });
        res.status(200).json({data: specificUserProfile}); 
        
        
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error });
    }
};
