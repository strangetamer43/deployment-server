import express from "express";
import fs from "fs";
import { s3, s3Client } from "../s3.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const imageUpload = async (req, res) => {
  const image = req.files.image;
  try {
    const img_name = `${Date.now()}-${image.name}`;
    const response = await s3.putObject({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: img_name,
      Body: image.data,
    });

    if (response.$metadata.httpStatusCode === 200) {
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: img_name,
      });
      // Generate a pre-signed URL for the media item
      const img = await getSignedUrl(s3Client, command);
      fs.unlinkSync(image.tempFilePath);
      res.status(203).json(img);
    }
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
};

export default imageUpload;
