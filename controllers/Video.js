import express from "express";
import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API,
    api_secret: process.env.CLOUDINARY_SECRET,
});

// after uploading the video directly add it directly to the list of videos for the response 
const videoUpload = async (req, res) => {
    console.log("Hello i am here")
    const responseId = req.body.resid;
    const video = req.files.file;
    console.log(video)
    try {
        await cloudinary.uploader.upload(video.tempFilePath, {
            resource_type: "video",
            chunk_size: 6000000,
            eager: [
                { width: 300, height: 300, crop: "pad", audio_codec: "none" },
                { width: 160, height: 100, crop: "crop", gravity: "south", audio_codec: "none" }],
        }).then((result) => {

            console.log(result.url)
            fs.unlinkSync(video.tempFilePath)
            res.status(203).json(result.url)
        })

    } catch (error) {
        res.status(403).json({ message: error })
    }

}

export default videoUpload;