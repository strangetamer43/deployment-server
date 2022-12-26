import express from "express";
import { createContact } from "../controllers/contact.js";

import expressFormidable from 'express-formidable';

const router = express.Router();

router.post('/', auth, createContact);
