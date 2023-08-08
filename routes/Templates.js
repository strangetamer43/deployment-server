import express from "express";
import { addTemplate, getTemplateQuizes, getQuizsLazyLoading, getQuizBySearch, getTemplateById, internalTemplateSwitch } from "../controllers/Templates.js";

import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/addTemplate", auth, addTemplate);
router.get("/", getTemplateQuizes);
router.post("/lazy", auth, getQuizsLazyLoading);
router.get("/getQuizBySearch/:search", getQuizBySearch);
router.get("/getTemplateById/:quizId", auth, getTemplateById);
router.post("/internalTemplate", auth, internalTemplateSwitch);
export default router;  
