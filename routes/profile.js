import express, { Router } from "express";
import { getProfileByCreator } from "../controllers/posts.js";
import { createProfile, updateProfile, getProfiles, getUserProfile, getSpecificUserProfile, getProfile, addExperience } from "../controllers/profile.js";
import auth from '../middleware/auth.js';

const router = express.Router();





router.get('/all', auth, getProfiles);
router.get('/', auth, getUserProfile);
router.post('/', auth, createProfile);
router.patch('/:id', auth, updateProfile);
router.post('/userspecific', auth, getSpecificUserProfile);
router.get('/:id', auth, getProfile);
router.post('/getProfile', getProfileByCreator);
router.patch("/addExperience/:id", auth, addExperience);


export default router;
