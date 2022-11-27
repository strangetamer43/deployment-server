import express from "express";
import { getTasks, getTask, createTask, updateTask, registerTask, completeTask } from "../controllers/tasks.js";
import auth from '../middleware/auth.js';
import TaskMessage from "../models/taskMessage.js";


const router = express.Router();


router.get('/', getTasks );
router.get('/:id', getTask);

router.post('/', auth, createTask);

router.patch('/:id', auth,(req,res)=>{
    TaskMessage.findById(req.params.id).then(task=>{
        task.registrations.push(req.body.registrations);
        task.save().then(result=>{
            res.json(result)
        }).catch(err=>{
            res.status(400).send(err);
        })
    }).catch(err=>{
        res.status(200).send(err);
    })
});

router.patch('/:id/registerTask', auth, registerTask);

router.patch('/:id/completeTask', auth, completeTask);

export default router;