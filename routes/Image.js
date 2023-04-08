import express from "express";
import imageUpload from "../controllers/Image.js";
import videoUpload from "../controllers/Video.js";
import audioUpload from "../controllers/audio.js";
const router = express.Router();

router.post("/uploadImage", imageUpload);
router.patch("/uploadVideo", videoUpload)
router.post("/uploadAudio", audioUpload);

export default router;
