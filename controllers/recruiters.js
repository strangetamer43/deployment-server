import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
import dotenv from 'dotenv';

import Recruiter from '../models/recruiters.js';

dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API,
    api_secret: process.env.CLOUDINARY_SECRET
});

export const signup = async (req, res) => {
    const image = req.files.image;
    console.log(image);
    cloudinary.uploader.upload(image.tempFilePath, async (err, resultB) => {
        const { name, username, password, confirmPassword, phoneNumber, emailId } = req.body;
        const img = resultB.url;
        const pub = resultB.public_id;
        const existingRecruiter = await Recruiter.findOne({ username });
        if (existingRecruiter) {
            console.log("Recruiter exist")
            return res.status(400).json({ message: "Recruiter already exists!" });
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
        const result = await Recruiter.create({ username, password: hashedPassword, name, phoneNumber, emailId, imageUrl: img });
        try {

            const token = jwt.sign({ username: result.username, id: result._id }, 'test', { expiresIn: "2h" });
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


        const existingRecruiter = await Recruiter.findOne({ username });

        if (!existingRecruiter) return res.status(404).json({ message: "User doesn't exist!" });

        const isPasswordCorrect = await bcrypt.compare(password, existingRecruiter.password);
        if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid Credentials!" });
        const token = jwt.sign({ username: existingRecruiter.username, id: existingRecruiter._id }, 'test', { expiresIn: "2h" });

        res.status(200).json({ result: existingRecruiter, token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error });
    }
};
/* export const getUser = async (req , res) => {
    const user = await User.findById(req.user.id).select('-password')
    if(!user)
    {
        return res.status(400).json({msg : "User does not exist"})
    }
    res.json(user) ;
    //res.json(req.user) Id of the user
};
 */
export const createRecruiter = async (req, res) => {
    try {
        
        const data = req.body;
        
        await Recruiter.findOne({ googleId: data.googleId }, async (err, result) => {
            if (err) {
                res.status(403).json({ message: err })
            } else if (result) {
                console.log(result);
                res.status(203).json(result)
            } else {
                const result = await Recruiter.create({ name: data.name, emailId: data.email, username: data.givenName, googleId: data.googleId, imageUrl: data.imageUrl })
                console.log(res);
                res.status(203).json(result)

            }
        })
    } catch (error) {
        
        res.status(403).json({ message: error })

    }
};
/* export const getUser = async (req , res) => {
    const { data } = req.body;
    console.log(data)
    const userr =await User.findOne({ googleId: data }).sort({ _id: -1 });
    if(!userr)
    {
        return res.status(400).json({msg : "User does not exist"})
    }
    res.json({data : userr}) ;
    //res.json(req.user) Id of the user
}; */
export const getRecruiter = async (req,res) =>{
    
    const { id } = req.params;
    try {
        const recruiter = await Recruiter.findById(id);

        res.status(200).json(recruiter);
    } catch (error) {
        res.status(404).json({ message: error.message });

    }
}
export const getSpecificRecruiter = async (req, res) => {
    const { data } = req.body;
    console.log(data)

    try {

        const specificRecruiter = await Recruiter.findOne({ googleId: data }).sort({ _id: -1 });
        if (specificRecruiter) {

            res.status(200).json({ data: specificRecruiter });
        } else {
            Recruiter.findById(data, (err, result) => {
                if (err) {
                    res.status(403).json(err)
                } else {
                    res.status(203).json({ data: result })
                }
            })
        }



    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error });
    }
};



/* export const removerFollower = async (req, res) => {
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
}
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
} */
