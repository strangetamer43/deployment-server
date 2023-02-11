import express from "express";
import { getPostsBySearch, getPosts, getPost, createPost, updatePost, deletePost, likePost, disLikePost, commentPost, getUserPosts, getSpecificUserPosts, getPostLazyLoading } from "../controllers/posts.js";
import auth from '../middleware/auth.js';
import expressFormidable from 'express-formidable';

const router = express.Router();

router.get('/search', getPostsBySearch );
router.get('/', getPosts );
router.get('/:id', getPost);
router.patch('/', auth, getUserPosts);
router.post('/', auth, createPost);
router.patch('/userspecific', auth, getSpecificUserPosts)
router.patch('/:id', auth, updatePost);
router.delete('/:id', auth, deletePost);
router.patch('/:id/likePost', auth, likePost);
router.post('/:id/commentPost', auth, commentPost);
router.patch('/:id/disLikePost', auth, disLikePost);
router.post("/getPostRange", getPostLazyLoading);


export default router;
