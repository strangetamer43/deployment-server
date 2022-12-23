import express from 'express';

import { signup, signin, createUser, getSpecificUser } from '../controllers/user.js';
const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post("/createUser", createUser)
router.patch("/getUser", getSpecificUser)
export default router;
