import express, { response } from "express";
import responseModel from "../models/Response.js";
import fs from "fs";
import { s3, s3Client } from "../s3.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// after uploading the video directly add it directly to the list of videos for the response
const videoUpload = async (req, res) => {
  req.connection.setTimeout(400000);
  const video = req.files.file;
  const resid = req.body.responseid;
  const type = req.body.type;
  try {
    const vid_name = `${Date.now()}-${video.name}`;
    const response = await s3.putObject({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: vid_name,
      Body: video.data,
    });
    if (response.$metadata.httpStatusCode === 200) {
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: vid_name,
      });
      // Generate a pre-signed URL for the media item
      const vid = await getSignedUrl(s3Client, command);
      if (!type) {
        res.status(203).json(vid);
      }
      // first find response and then push video in it
      responseModel.findById(resid, (err, result1) => {
        if (type === "video") {
          let newvideos = result1.videos;
          newvideos.push(vid);

          responseModel.findByIdAndUpdate(
            resid,
            { videos: newvideos },
            { new: true },
            (err, result2) => {
              if (err) {
                res.status(203).json({ error: err });
              } else {
                console.log(result2);
              }
            }
          );
          fs.unlinkSync(video.tempFilePath);
          res.status(203).json(vid);
        } else if (type === "screen") {
          let newvideos = result1.screenRecording;
          newvideos.push(vid);
          responseModel.findByIdAndUpdate(
            resid,
            { screenRecording: newvideos },
            { new: true },
            (err, result2) => {
              if (err) {
                res.status(203).json({ error: err });
              } else {
                console.log(result2);
              }
            }
          );
          fs.unlinkSync(video.tempFilePath);
          res.status(203).json(vid);
        } else if (type === "audio") {
          let newvideos = result1.audioRecording;
          newvideos.push(vid);
          responseModel.findByIdAndUpdate(
            resid,
            { audioRecording: newvideos },
            { new: true },
            (err, result2) => {
              if (err) {
                res.status(203).json({ error: err });
              } else {
                console.log(result2);
              }
            }
          );
          fs.unlinkSync(video.tempFilePath);
          res.status(203).json(vid);
        }
      });
    }
  } catch (error) {
    res.status(403).json({ message: error });
  }
  console.log("video end");
};

export default videoUpload;
