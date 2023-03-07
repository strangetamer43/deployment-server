import express from 'express';
import auth from '../middleware/auth.js';
import { signup, signin, createUser, getUser, getSpecificUser, addFollower, removerFollower } from '../controllers/user.js';
const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post("/createUser", createUser);
router.patch("/", getSpecificUser);
router.post("/follow", auth, addFollower);
router.post("/unfollow", auth, removerFollower);
router.get("/getUser/:id" ,getUser);
export default router;
