import User from "../models/User.js"
import JobApplication from "../models/JobApplication.js"
import {v2 as cloudinary} from "cloudinary"
import Job from "../models/Job.js"
// get user data
export const getUserData = async (req, res) => { 
    // add  authentication using clerk middleware
    const userId = req.auth.userId   //clerk middleware will convert token into userId& userdetails
    
    if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized: No user ID found" });
    }
    try {
        const user = await User.findById(userId)   //get user data by id
        if(!user) {
            return res.json({ success: false, message: "User not found" })
        }
        res.json({
            success: true,
            user
        })
        
        
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}   

//Apply for a job
export const applyForJob = async (req, res) => { 
    const { jobId } = req.body
    const userId = req.auth.userId
    try {
        // if already applied job
        const isAlreadyApplied = await JobApplication.find({ jobId, userId }) 
        
        if (isAlreadyApplied.length > 0) {
            return res.json({ success: false, message: "Already applied for this job" })
        }
        // create new job application
        const jobData = await Job.findById(jobId)
        if (!jobData) {
            return res.json({ success: false, message: "Job not found" })
        }
        await JobApplication.create({
            companyId: jobData.companyId,
            jobId,
            userId,
            date:Date.now(),
        })
        res.json({ success: true, message: "Applied for job successfully" })
        
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

//fetch user applied applicants
export const getUserJobApplications = async (req, res) => { 
    try {
        const userId = req.auth.userId
        const applications = await JobApplication.find({ userId })
            .populate('companyId', 'name email image')
            .populate('jobId', 'title description location salary level category')
            .exec()
        
        // if we dont get any applications
        if (!applications) {
            return res.json({ success: false, message: "No job applications found" })
        }
        return res.json({ success: true, applications })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// update user profile (only resume)  remaing it is done by clerk
export const updateUserResume = async (req, res) => {
    try {
        const userId=req.auth.userId
        const resumeFile = req.file
        const userData = await User.findById(userId)
        
        if (resumeFile) {
            const resumeUpload = await cloudinary.uploader.upload(resumeFile.path) //upload file on cloudinary platform
            userData.resume=resumeUpload.secure_url //get url of uploaded file
        }
        await userData.save()
        res.json({ success: true, message: "Resume updated successfully" })


    } catch (error) {
        res.json({ success: false, message: error.message })        
    }
}



