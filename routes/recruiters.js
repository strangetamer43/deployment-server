import express from 'express';
import { signup , signin , createRecruiter , getRecruiter, getSpecificRecruiter} from '../controllers/recruiters.js';
import auth from '../middleware/auth.js'
//import recruiterController from "../controllers/recruiters.js";
import authRecruiter from "../middleware/authRecruiter.js"
const router = express.Router();


router.post('/signupRecruiter',signup);
router.post('/signinRecruiter', signin);
//router.post('/createTest', recruiterController.addTest);
//router.get("/recruiter"  , getRecruiter); //whether user logged in
router.post("/createRecruiter", createRecruiter)
router.get("/getRecruiter/:id" ,getRecruiter)
router.get("/recruiterSpecific",getSpecificRecruiter)
/* router.post("/follow", auth, addFollower)
router.post("/unfollow", auth, removerFollower)
 */
export default router;
