import express, { Router } from "express";
import { getProfileByCreator } from "../controllers/posts.js";
import { createProfile, updateProfile, getProfiles, getUserProfile, getSpecificUserProfile, getProfile } from "../controllers/profile.js";
import auth from '../middleware/auth.js';

const router = express.Router();





router.get('/all', auth, getProfiles);
router.post('/', auth, getUserProfile);
router.post('/create', auth, createProfile);
router.patch('/:id', auth, updateProfile);
router.post('/userspecific', auth, getSpecificUserProfile);
router.get("/:id", auth, getProfile);
router.post("/getProfile", getProfileByCreator);



export default router;
