import express from "express";
import fs from "fs";
import { s3, s3Client } from "../s3.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// after uploading the video directly add it directly to the list of videos for the response
const audioUpload = async (req, res) => {
  const video = req.files.file;
  console.log(video);
  try {
    const vid_name = `${Date.now()}-${video.name}`;
    const response = await s3.putObject({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: vid_name,
      Body: video.data,
    });
    if (response.$metadata.httpStatusCode === 200) {
      // Create a command to fetch the media item from AWS S3
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: mediaItem.key,
      });
      // Generate a pre-signed URL for the media item
      const url = await getSignedUrl(s3Client, command);
      console.log(url);
      fs.unlinkSync(video.tempFilePath);
      res.status(203).json(url);
    }
  } catch (error) {
    res.status(403).json({ message: error });
  }
};

export default audioUpload;
