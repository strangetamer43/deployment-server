import mongoose  from "mongoose";
import ContactForm from "../models/ContactForm.js";

export const createContact = async (req, res) => {
    const contact = req.body;
    const newContact = new ContactForm({ ...contact, createdAt: new Date().toISOString() });

    try {
        await newContact.save();
        res.status(201).json(newContact);
    } catch (error) {
        res.status(409).json({ message: error.message});
        
    }
};
