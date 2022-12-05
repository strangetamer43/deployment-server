import express from "express";
import { createQuiz, editQUiz, getAllQuizOfUser, getQuizById, getAllQuizs, getQuizBySearchForUser, getQuizBySearch } from "../controllers/Challenges.js";
import { submitResponse, getResponsesByUser, getResponse, getResponseByQuizId, submittingQuiz, getAllResponse, getResponseByUserName, createResponse } from "../controllers/Response.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/createQuiz", auth, createQuiz);
router.put("/editQuiz", auth, editQUiz);
router.get("/getQuiz/:quizId", getQuizById);
router.get("/getAllQuizOfUser/:userId", auth, getAllQuizOfUser)
router.get("/getAllQuizs", getAllQuizs)
router.post("/submitResponse", auth, submitResponse)
router.get("/getResponsesOfUser/:userId", getResponsesByUser) //get Response by user id
router.get("/getResponse/:responseId", getResponse) //get Response by response id
router.get("/getResponseByQuizId/:quizId", getResponseByQuizId); //get Response by quiz id
router.get("/getAllResponse", getAllResponse) //get all the responses
router.post("/getQuizBySearchForUser/:search", getQuizBySearchForUser);
router.get("/getQuizBySearch/:search", getQuizBySearch)
router.post("/submittingQuiz", submittingQuiz);
router.get("/getResponseByUserName/:search", getResponseByUserName)
router.get("/createResponse", createResponse)




export default router;  
