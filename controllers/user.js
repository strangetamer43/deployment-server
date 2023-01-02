import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import dotenv from 'dotenv';

import User from '../models/user.js';

dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API,
    api_secret: process.env.CLOUDINARY_SECRET
});

export const signup = async (req, res) => {
    const image = req.files.image;
    cloudinary.uploader.upload(image.tempFilePath, async (err, resultB) => {
        const { name, username, password, confirmPassword, phoneNumber, emailId } = req.body;
        const img = resultB.url;
        const pub = resultB.public_id;
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            console.log("user exist")
            return res.status(400).json({ message: "User already exists!" });
        }
        if (password.length < 8) {
            console.log("password short")
            return res.status(400).json({ message: "Password is too short!" });
        }
        if (password !== confirmPassword) {
            console.log("password not match")
            return res.status(400).json({ message: "Passwords don't match!" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        if (phoneNumber.length !== 10) {
            console.log("mobile number")
            return res.status(400).json({ message: "Phone number is invalid!" });
        }
        const result = await User.create({ username, password: hashedPassword, name, phoneNumber, emailId, imageUrl: img });
        try {

            const token = jwt.sign({ username: result.username, id: result._id }, process.env.JWT_SECRET, { expiresIn: "2h" });
            fs.unlinkSync(image.tempFilePath)
            res.status(200).json({ result, token });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error });
        }
    });
};



export const signin = async (req, res) => {
    const { username, password } = req.body;
    try {


        const existingUser = await User.findOne({ username });

        if (!existingUser) return res.status(404).json({ message: "User doesn't exist!" });

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid Credentials!" });
        const token = jwt.sign({ username: existingUser.username, id: existingUser._id }, process.env.JWT_SECRET, { expiresIn: "2h" });

        res.status(200).json({ result: existingUser, token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error });
    }
};


export const createUser = async (req, res) => {
    try {
        console.log(":nw");
        const data = req.body;
        console.log(data);
        await User.findOne({ googleId: data.googleId }, async (err, result) => {
            if (err) {
                res.status(403).json({ message: err })
            } else if (result) {
                console.log(result);
                res.status(203).json(result)
            } else {
                const result = await User.create({ name: data.name, emailId: data.email, username: data.givenName, googleId: data.googleId, imageUrl: data.imageUrl })
                console.log(res);
                res.status(203).json(result)

            }
        })
    } catch (error) {
        res.status(403).json({ message: error })

    }
};

export const getSpecificUser = async (req, res) => {
    
    const {data} = req.body;
    
    if (data.length > 22){
    try {
            
        const specificUser = await User.findOne({ _id: data }).sort({ _id: -1 });
        res.status(200).json({data: specificUser}); 
        
        
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error });
    }}
    else {
        try {
            
            const specificUser = await User.findOne({ googleId: data }).sort({ _id: -1 });
            res.status(200).json({data: specificUser}); 
            
            
            
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error });
        }
    }
};

export const removerFollower = async (req, res) => {
    const follower = req.body.follower;
    const user = req.body.user;
    try {
        User.updateOne(
            { _id: user._id },
            { $pull: { followers: { user: follower._id, name: follower.name, userName: follower.username } } })
            .then(() => {
                console.log("Follower removed")
            }).catch((err) => {
                console.log(err)
            })

        User.updateOne(
            { _id: follower._id },
            { $pull: { following: { user: user._id, name: user.name, userName: user.username } } })
            .then(() => {
                console.log("Follower removed")
            }).catch((err) => {
                console.log(err)
            })
        User.findById(follower._id, (err, result2) => {
            if (err) {
                console.log(err)
                res.status(403).json(err)

            } else {
                res.status(203).json(result2)

            }
        })
    } catch (error) {
        console.log(error)
        res.status(403).json(error)
    }
};

export const addFollower = async (req, res) => {
    const follower = req.body.follower;
    const user = req.body.user;
    console.log(user)
    console.log(follower)
    try {
        User.findById(follower._id, (err, result) => {
            if (err) {
                res.status(403).json(err)
            } else {
                var i;
                for (i = 0; i < result.following.length; i++) {
                    if (result.following[i].user === user._id) {
                        res.status(203).json(result)
                        return
                    }
                }
                if (!result.following.includes()) {

                    User.updateOne(
                        { _id: user._id },
                        { $push: { followers: { user: follower._id, name: follower.name, userName: follower.username } } })
                        .then(() => {
                            console.log("New Following added")
                        }).catch(error => console.log(error)

                        )
                    User.updateOne(
                        { _id: follower._id },
                        { $push: { following: { user: user._id, name: user.name, userName: user.username } } })
                        .then(() => {
                            console.log("New Following added")
                        }).catch(error => console.log(error)
                        )
                    User.findById(follower._id, (err, result2) => {
                        if (err) {
                            res.status(403).json(err)

                        } else {
                            res.status(203).json(result2)

                        }
                    })

                } else {
                    res.status(203).json(result)

                }
            }
        })


    }
    catch (err) {
        console.log(err)
        res.status(403).json(err)
    }
};
