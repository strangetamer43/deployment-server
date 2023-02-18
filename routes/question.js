import express from "express";
import { getQuestionsBySearch, getQuestions, getQuestion, createQuestion, updateQuestion, deleteQuestion, likeQuestion, disLikeQuestion, commentQuestion, getUserQuestions, getSpecificUserQuestions, getQuestionsLazyLoading } from "../controllers/questions.js";
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/search', getQuestionsBySearch );
router.get('/', getQuestions );
router.get('/:id', getQuestion);
router.patch('/', auth, getUserQuestions);
router.patch('/userspecific', auth, getSpecificUserQuestions);
router.post('/', auth, createQuestion);
router.patch('/:id', auth, updateQuestion);
router.delete('/:id', auth, deleteQuestion);
router.patch('/:id/likeQuestion', auth, likeQuestion);
router.post('/:id/commentQuestion', auth, commentQuestion);
router.patch('/:id/disLikeQuestion', auth, disLikeQuestion);
router.post("/getQuestionRange", getQuestionsLazyLoading);


export default router;
