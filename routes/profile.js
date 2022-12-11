import express, { Router } from "express";
import { createProfile, updateProfile, getProfiles, getUserProfile, getSpecificUserProfile, getProfile } from "../controllers/profile.js";
import auth from '../middleware/auth.js';

const router = express.Router();





router.get('/all', auth, getProfiles);
router.get('/', auth, getUserProfile);
router.post('/', auth, createProfile);
router.patch('/:id', auth, updateProfile);
router.post('/userspecific', auth, getSpecificUserProfile);
router.get("/:id", auth, getProfile)



export default router;
