import mongoose  from "mongoose";
import TaskMessage from "../models/taskMessage.js";
import User from "../models/user.js";
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API,
    api_secret: process.env.CLOUDINARY_SECRET
});
export const getTasks = async (req, res) => {
    try {
        const tasks = await TaskMessage.find().sort({ _id: -1 });
        
        res.status(200).json({ data: tasks});
    }   catch (error) {
        res.status(404).json({ message: error.message});  

    }
};
export const getTask = async (req, res) => {
    const { id } = req.params;
    try {
        const task = await TaskMessage.findById(id);
        
        res.status(200).json(task);
    }   catch (error) {
        res.status(404).json({ message: error.message});  

    }
};


export const createTask = async (req, res) => {
  
    const { title, description, peopleCount, name, field } = req.body;
    
    const newTask = new TaskMessage({ title, description, peopleCount, name, field, creator: req.userId, createdAt: new Date().toISOString() });
  
  
    try {
          await newTask.save();
          res.status(201).json(newTask);
      } catch (error) {
          res.status(409).json({ message: error.message});
          
      }
  };


export const updateTask = async (req, res) => {
    const { id: _id } = req.params;
    const task = req.body;

    if(!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send('No task with that ID');
    const updatedTask = await TaskMessage.findByIdAndUpdate(_id, { ...task, _id }, { new: true });
    res.json(updatedTask);
}

export const registerTask = async (req, res) => {
    const { id } = req.params;
    const {name, user, time} = req.body;
    if(!req.userId) return res.json({ message: "Unauthenticated" });
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No task with that ID');
    const task = await TaskMessage.findById(id);
    const index = task.registrations.user.findOne(user === String(req.userId));
    if(!index ) {
        task.registrations.push({name: name, user: user, time: time});
        task.save();
    } else {
        task.registrations = task.registrations.filter(task.registrations.user !== String(req.userId));
    }
    const updatedTask = await TaskMessage.findByIdAndUpdate(id, task, { new: true } );
    res.json(updatedTask);

}

export const completeTask = async (req, res) => {
    const { id } = req.params;
    const {name, user} = req.body;
    if(!req.userId) return res.json({ message: "Unauthenticated" });
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No task with that ID');
    const task = await TaskMessage.findById(id);
    const index = task.completions.user.findIndex((id) => id === String(req.userId));
    if(index === -1) {
        task.completions.push({name, user: req.userId, time: new Date().toISOString()});
    } else {
        task.completions = task.completions.user.filter((id) => id !== String(req.userId));
    }
    const updatedTask = await TaskMessage.findByIdAndUpdate(id, task, { new: true } );
    res.json(updatedTask);

}





