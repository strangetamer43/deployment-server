import mongoose from "mongoose";
import PostMessage from "../models/postMessage.js";
import User from "../models/user.js";
import ProfileMessage from "../models/profileMessage.js";
import { s3, s3Client } from "../s3.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

export const getPosts = async (req, res) => {
  try {
    const posts = await PostMessage.find().sort({ _id: -1 });

    res.status(200).json({ data: posts });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
export const getPost = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await PostMessage.findById(id);

    res.status(200).json(post);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
export const getPostsBySearch = async (req, res) => {
  const { searchQuery, tags } = req.query;
  try {
    const title = new RegExp(searchQuery, "i");
    const posts = await PostMessage.find({
      $or: [{ title }, { tags: { $in: tags.split(",") } }],
    });
    res.json({ data: posts });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
export const createPost = async (req, res) => {
  var data = req.body;
  data["createdAt"] = new Date().toISOString();
  const newPost = new PostMessage(data);
  try {
    newPost.save();
    res.status(203).json(newPost);
  } catch (error) {
    console.log(error);
    res.status(403).json(error);
  }

  const video = req.files.video;
  const image = req.files.image;

  console.log({ video, image });

  if (!image) {
    const vid_name = `${Date.now()}-${video.name}`;
    const response = await s3.putObject({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: vid_name,
      Body: video.data,
    });
    if (response.$metadata.httpStatusCode === 200) {
      const { title, message, tags, name, avatarUrl } = req.body;

      const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: vid_name,
      });
      // Generate a pre-signed URL for the media item
      const vid = await getSignedUrl(s3Client, command);

      const pub = vid_name;
      const newPost = new PostMessage({
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
        newPost.save();
        fs.unlinkSync(video.tempFilePath);
        res.status(201).json(newPost);
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
      const { title, message, tags, name, avatarUrl } = req.body;

      const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: img_name,
      });
      // Generate a pre-signed URL for the media item
      const img = await getSignedUrl(s3Client, command);
      const pub = img_name;

      const newPost = new PostMessage({
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
        newPost.save();
        fs.unlinkSync(image.tempFilePath);
        res.status(201).json(newPost);
      } catch (error) {
        res.status(409).json({ message: error.message });
      }
    }
  } else if (!image && !video) {
    const { title, message, tags, name, avatarUrl } = req.body;
    const newPost = new PostMessage({
      title,
      message,
      tags,
      name,
      avatarUrl,
      creator: req.userId,
      createdAt: new Date().toISOString(),
    });
    try {
      await newPost.save();
      res.status(201).json(newPost);
    } catch (error) {
      res.status(409).json({ message: error.message });
    }
  }
};

export const updatePost = async (req, res) => {
  const { id: _id } = req.params;
  const post = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send("No post with that ID");
  const updatedPost = await PostMessage.findByIdAndUpdate(
    _id,
    { ...post, _id },
    { new: true }
  );
  res.json(updatedPost);
};
export const deletePost = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send("No post with that ID");
  const post = await PostMessage.findById(id);
  if (post.public_id) {
    await s3.deleteObject({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: post.public_id,
    });
  } else {
    await s3.deleteObject({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: post.public_idV,
    });
  }
  await PostMessage.findByIdAndRemove(id);

  res.json({ message: "Post Deleted Successfully" });
};
export const likePost = async (req, res) => {
  const { id } = req.params;
  if (!req.userId) return res.json({ message: "Unauthenticated" });
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send("No post with that ID");
  const post = await PostMessage.findById(id);
  const index = post.likes.findIndex((id) => id === String(req.userId));
  if (index === -1) {
    post.likes.push(req.userId);
  } else {
    post.likes = post.likes.filter((id) => id !== String(req.userId));
  }
  const updatedPost = await PostMessage.findByIdAndUpdate(id, post, {
    new: true,
  });
  res.json(updatedPost);
};
export const disLikePost = async (req, res) => {
  const { id } = req.params;

  if (!req.userId) return res.json({ message: "Unauthenticated" });
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send("No post with that ID");
  const post = await PostMessage.findById(id);
  const index = post.disLikes.findIndex((id) => id === String(req.userId));
  if (index === -1) {
    post.disLikes.push(req.userId);
  } else {
    post.disLikes = post.disLikes.filter((id) => id !== String(req.userId));
  }
  const updatedPost = await PostMessage.findByIdAndUpdate(id, post, {
    new: true,
  });

  res.json(updatedPost);
};
export const commentPost = async (req, res) => {
  const { id } = req.params;
  const message = req.body.value;
  const post = await PostMessage.findById(id);
  post.comments.push(message);
  const updatedPost = await PostMessage.findByIdAndUpdate(id, post, {
    new: true,
  });
  res.json(updatedPost);
};

export const getUserPosts = async (req, res) => {
  const userId = req.body.userId;
  try {
    const userPosts = await PostMessage.find({ creator: userId }).sort({
      _id: -1,
    });
    res.status(200).json({ data: userPosts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
};
export const getSpecificUserPosts = async (req, res) => {
  const { creator } = req.body;

  try {
    const specificUserPosts = await PostMessage.find({ creator: creator }).sort(
      { _id: -1 }
    );
    res.status(200).json({ data: specificUserPosts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
};

export const getProfileByCreator = async (req, res) => {
  try {
    const creator = req.body.creator;
    const user = await ProfileMessage.findOne({ creator: creator });
    return res.status(203).json(user);
  } catch (error) {
    return res.status(403).json(error);
  }
};

export const getPostLazyLoading = async (req, res) => {
  try {
    const { page } = req.body;
    const LIMIT = 4;
    const startIndex = (Number(page) - 1) * LIMIT;

    const posts = await PostMessage.find()
      .sort({ _id: -1 })
      .limit(LIMIT)
      .skip(startIndex);
    res.status(203).json(posts);
  } catch (error) {
    console.log(error);
    res.status(403).json(error);
  }
};
