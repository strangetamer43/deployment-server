import express from "express";
import imageUpload from "../controllers/Image.js";
import videoUpload from "../controllers/Video.js";
const router = express.Router();

router.post("/uploadImage", imageUpload);
router.post("/uploadVideo", videoUpload)

export default router;