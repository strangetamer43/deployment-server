import express from 'express';
import auth from '../middleware/auth.js';
import { signup, signin, createUser, getSpecificUser } from '../controllers/user.js';
const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post("/createUser", createUser);
router.patch("/", getSpecificUser);
router.post("/follow", auth, addFollower);
router.post("/unfollow", auth, removerFollower);
export default router;
