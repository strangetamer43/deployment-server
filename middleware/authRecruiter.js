import Recruiters from "../models/recruiters.js"
const authRecruiter = async (req , res , next) => {
    //get user info by id
    const recruiter = await Recruiters.findOneById({
        _id : req.Recruiter._id
    })
    if(recruiter.role ==0)
    {
        return res.status(400).json({msg : "Admin access denied"})
    }
    if(user.role == 1)
    {
        return res.status(400).json({msg : "Admin access approved"})

    }
    next() ;

}
export default authRecruiter;
