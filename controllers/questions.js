import mongoose from "mongoose";
import QuestionMessage from "../models/questionMessage.js";
import dotenv from "dotenv";
import fs from "fs";
import { s3, s3Client } from "../s3.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
dotenv.config();

export const getQuestions = async (req, res) => {
  try {
    const questions = await QuestionMessage.find().sort({ _id: -1 });

    res.status(200).json({ data: questions });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
export const getQuestion = async (req, res) => {
  const { id } = req.params;
  try {
    const question = await QuestionMessage.findById(id);

    res.status(200).json(question);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
export const getQuestionsBySearch = async (req, res) => {
  const { searchQuery, tags } = req.query;
  try {
    const title = new RegExp(searchQuery, "i");
    const questions = await QuestionMessage.find({
      $or: [{ title }, { tags: { $in: tags.split(",") } }],
    });
    res.json({ data: questions });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
export const createQuestion = async (req, res) => {
  const video = req.files.video;
  const image = req.files.image;

  if (!image) {
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
      const pub = vid_name;

      const { title, message, tags, name, avatarUrl } = req.body;

      const newQuestion = new QuestionMessage({
        title,
        message,
        tags,
        name,
        avatarUrl,
        videoUrl: vid,
        public_idV: pub,
        creator: req.userId,
        createdAt: new Date().toISOString(),
      });

      try {
        newQuestion.save();
        fs.unlinkSync(video.tempFilePath);
        res.status(201).json(newQuestion);
      } catch (error) {
        res.status(409).json({ message: error.message });
      }
    }
  } else if (!video) {
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
      const pub = img_name;

      const { title, message, tags, name, avatarUrl } = req.body;
      const newQuestion = new QuestionMessage({
        title,
        message,
        tags,
        name,
        avatarUrl,
        imageUrl: img,
        public_id: pub,
        creator: req.userId,
        createdAt: new Date().toISOString(),
      });

      try {
        newQuestion.save();
        fs.unlinkSync(image.tempFilePath);
        res.status(201).json(newQuestion);
      } catch (error) {
        res.status(409).json({ message: error.message });
      }
    }
  }
};

export const updateQuestion = async (req, res) => {
  const { id: _id } = req.params;
  const question = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send("No question with that ID");
  const updatedQuestion = await QuestionMessage.findByIdAndUpdate(
    _id,
    { ...question, _id },
    { new: true }
  );
  res.json(updatedQuestion);
};
export const deleteQuestion = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send("No question with that ID");
  const question = await QuestionMessage.findById(id);
  if (question.public_id) {
    await s3.deleteObject({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: question.public_id,
    });
  } else {
    await s3.deleteObject({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: question.public_idV,
    });
  }

  await QuestionMessage.findByIdAndRemove(id);

  res.json({ message: "Question Deleted Successfully" });
};
export const likeQuestion = async (req, res) => {
  const { id } = req.params;
  if (!req.userId) return res.json({ message: "Unauthenticated" });
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send("No question with that ID");
  const question = await QuestionMessage.findById(id);
  const index = question.likes.findIndex((id) => id === String(req.userId));
  if (index === -1) {
    question.likes.push(req.userId);
  } else {
    question.likes = question.likes.filter((id) => id !== String(req.userId));
  }
  const updatedQuestion = await QuestionMessage.findByIdAndUpdate(
    id,
    question,
    { new: true }
  );
  res.json(updatedQuestion);
};
export const disLikeQuestion = async (req, res) => {
  const { id } = req.params;
  if (!req.userId) return res.json({ message: "Unauthenticated" });
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send("No question with that ID");
  const question = await QuestionMessage.findById(id);
  const index = question.disLikes.findIndex((id) => id === String(req.userId));
  if (index === -1) {
    question.disLikes.push(req.userId);
  } else {
    question.disLikes = question.disLikes.filter(
      (id) => id !== String(req.userId)
    );
  }
  const updatedQuestion = await QuestionMessage.findByIdAndUpdate(
    id,
    question,
    { new: true }
  );

  res.json(updatedQuestion);
};
export const commentQuestion = async (req, res) => {
  const { id } = req.params;
  const msg = req.body.value;
  const question = await QuestionMessage.findById(id);
  question.comments.push(msg);
  const updatedQuestion = await QuestionMessage.findByIdAndUpdate(
    id,
    question,
    { new: true }
  );
  res.json(updatedQuestion);
};
export const getUserQuestions = async (req, res) => {
  const userId = req.userId;
  try {
    const userQuestions = await QuestionMessage.find({ creator: userId }).sort({
      _id: -1,
    });
    res.status(200).json({ data: userQuestions });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
};
export const getSpecificUserQuestions = async (req, res) => {
  const { creator } = req.body;

  try {
    const specificUserQuestions = await QuestionMessage.find({
      creator: creator,
    }).sort({ _id: -1 });
    res.status(200).json({ data: specificUserQuestions });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
};

export const getQuestionsLazyLoading = async (req, res) => {
  try {
    const { page } = req.body;
    const LIMIT = 4;
    const startIndex = (Number(page) - 1) * LIMIT;

    const questions = await QuestionMessage.find()
      .sort({ _id: -1 })
      .limit(LIMIT)
      .skip(startIndex);
    res.status(203).json(questions);
  } catch (error) {
    console.log("fkdpk");
    console.log(error);
    res.status(403).json(error);
  }
};
