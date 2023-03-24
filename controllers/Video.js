import express, { response } from "express";
import { v2 as cloudinary } from 'cloudinary';
import responseModel from "../models/Response.js";
import fs from "fs"




cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API,
    api_secret: process.env.CLOUDINARY_SECRET,
});

// after uploading the video directly add it directly to the list of videos for the response 
const videoUpload = async (req, res) => {
    const video = req.files.file;
    const resid = req.body.responseid;
    const type = req.body.type;
    try {
        await cloudinary.uploader.upload(video.tempFilePath, {
            resource_type: "video",
            chunk_size: 6000000,
            eager: [
                { width: 300, height: 300, crop: "pad", audio_codec: "none" },
                { width: 160, height: 100, crop: "crop", gravity: "south", audio_codec: "none" }],
        }).then((result) => {

            console.log(result.url)
            if (!type) {
                res.status(203).json(result.url)
            }
            // first find response and then push video in it 
            responseModel.findById(resid, (err, result1) => {
                if (type === "video") {
                    let newvideos = result1.videos;
                    newvideos.push(result.url)

                    responseModel.findByIdAndUpdate(resid, { videos: newvideos }, { new: true }, (err, result2) => {
                        if (err) {
                            res.status(203).json({ error: err })
                        } else {
                            console.log(result2);
                        }
                    })
                    fs.unlinkSync(video.tempFilePath)
                    res.status(203).json(result.url)
                } else if (type === "screen") {
                    let newvideos = result1.screenRecording;
                    newvideos.push(result.url)
                    responseModel.findByIdAndUpdate(resid, { screenRecording: newvideos }, { new: true }, (err, result2) => {
                        if (err) {
                            res.status(203).json({ error: err })
                        } else {
                            console.log(result2);
                        }
                    })
                    fs.unlinkSync(video.tempFilePath)
                    res.status(203).json(result.url)

                } else if (type === "audio") {
                    let newvideos = result1.audioRecording;
                    newvideos.push(result.url)
                    responseModel.findByIdAndUpdate(resid, { audioRecording: newvideos }, { new: true }, (err, result2) => {
                        if (err) {
                            res.status(203).json({ error: err })
                        } else {
                            console.log(result2);
                        }
                    })
                    fs.unlinkSync(video.tempFilePath)
                    res.status(203).json(result.url)
                }
            })
        })

    } catch (error) {
        res.status(403).json({ message: error })
    }
    console.log("video end")


}

export default videoUpload;
