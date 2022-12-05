import express from "express";
import imageUpload from "../Controller/Image.js";
import videoUpload from "../Controller/Video.js";
import audioUpload from "../controller/audio.js";
const router = express.Router();

router.post("/uploadImage", imageUpload);
router.post("/uploadVideo", videoUpload)
router.post("/uploadAudio", audioUpload);

export default router;
