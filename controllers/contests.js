import mongoose  from "mongoose";
import ContestMessage from "../models/contestMessage.js";

export const getContests = async (req, res) => {
    try {
        const contests = await ContestMessage.find().sort({ _id: -1 });
        
        res.status(200).json({ data: contests});
    }   catch (error) {
        res.status(404).json({ message: error.message});  

    }
};
export const getContest = async (req, res) => {
    const { id } = req.params;
    try {
        const contest = await ContestMessage.findById(id);
        
        res.status(200).json(contest);
    }   catch (error) {
        res.status(404).json({ message: error.message});  

    }
};
export const getContestsBySearch = async (req, res) => {
    const { searchQuery, tags } = req.query
    try {
        const title = new RegExp(searchQuery, 'i');
        const contests = await ContestMessage.find({ $or : [ {title}, { tags: { $in: tags.split(',') } } ]});
        res.json({ data: contests });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}
export const createContest = async (req, res) => {
    const contest = req.body;
    const newContest = new ContestMessage({ ...contest, creator: req.userId, createdAt: new Date().toISOString() });

    try {
        await newContest.save();
        res.status(201).json(newContest);
    } catch (error) {
        res.status(409).json({ message: error.message});
        
    }
}

export const updateContest = async (req, res) => {
    const { id: _id } = req.params;
    const contest = req.body;

    if(!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send('No contest with that ID');
    const updatedContest = await ContestMessage.findByIdAndUpdate(_id, { ...contest, _id }, { new: true });
    res.json(updatedContest);
}
export const deleteContest = async (req, res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No Contest with that ID');

    await ContestMessage.findByIdAndRemove(id);
    
    res.json({ message: 'Contest Deleted Successfully' });
}
export const likeContest = async (req, res) => {
    const { id } = req.params;
    if(!req.userId) return res.json({ message: "Unauthenticated" });
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No Contest with that ID');
    const contest = await ContestMessage.findById(id);
    const index = contest.likes.findIndex((id) => id === String(req.userId));
    if(index === -1) {
        contest.likes.push(req.userId);
    } else {
        contest.likes = contest.likes.filter((id) => id !== String(req.userId));
    }
    const updatedContest = await ContestMessage.findByIdAndUpdate(id, contest, { new: true } );
    res.json(updatedContest);

}
export const disLikeContest = async (req, res) => {
    const { id } = req.params;
    if(!req.userId) return res.json({ message: "Unauthenticated" });
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No Contest with that ID');
    const contest = await ContestMessage.findById(id);
    const index = contest.disLikes.findIndex((id) => id === String(req.userId));
    if(index === -1) {
        contest.disLikes.push(req.userId);
    } else {
        contest.disLikes = contest.disLikes.filter((id) => id !== String(req.userId));
    }
    const updatedContest = await ContestMessage.findByIdAndUpdate(id, contest, { new: true } );
    
    res.json(updatedContest);

}
export const registeredUser = async (req, res) => {
    const { id } = req.params;
    if(!req.userId) return res.json({ message: "Unauthenticated" });
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No Contest with that ID');
    const contest = await ContestMessage.findById(id);
    const index = contest.registeredUsers.findIndex((id) => id === String(req.userId));
    if(index === -1) {
        contest.registeredUsers.push(req.userId);
    } else {
        contest.registeredUsers = contest.registeredUsers.filter((id) => id !== String(req.userId));
    }
    const updatedContest = await ContestMessage.findByIdAndUpdate(id, contest, { new: true } );
    
    res.json(updatedContest);

}
export const commentContest = async (req, res) => {
    const { id } = req.params;
    const msg = req.body.value;
    const contest = await ContestMessage.findById(id);
    contest.comments.push(msg);
    const updatedContest = await ContestMessage.findByIdAndUpdate(id, contest, { new: true});
    res.json(updatedContest);
}
