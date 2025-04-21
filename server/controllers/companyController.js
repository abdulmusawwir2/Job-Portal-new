import Company from "../models/Company.js";
import { v2 as cloudinary } from "cloudinary";
import bcrypt from "bcryptjs";
import generateToken  from "../utils/generateToken.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js"

// Register a new company
export const registerCompany = async (req, res) => {
    const { name, email, password } = req.body;
    const imageFile = req.file;
    if (!name || !email || !password || !imageFile) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        const companyExists = await Company.findOne({ email })
        if (companyExists) {
            return res.status(400).json({ success: false, message: "Company already registered" });
        }
        const salt=await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // upload image in cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path);
        
        const company = new Company({
            name,
            email,
            password: hashedPassword,
            image: imageUpload.secure_url
        });
        await company.save();
        res.json({
            success: true,
            company: {
                _id: company._id,
                name: company.name,
                email: company.email,
                image: company.image
            },
            token: generateToken(company._id),
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}


// comany login
export const loginCompany = async (req,res) => {
    const { email, password } = req.body;
    try {
        const company = await Company.findOne({ email });
        if (await bcrypt.compare(password, company.password)) {
            res.json({
                success: true,
                company: {
                    _id: company._id,
                    name: company.name,
                    email: company.email,
                    image: company.image
                },
                token: generateToken(company._id),
            });
        }
        else {
            res.json({ success: false, message: "Invalid email or password" });
        }
    }
    catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// get company data
export const getCompanyData = async (req, res) => { 
    
    try {
        const company = req.company 
        res.json({success:true,company})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
    
}

export const postJob = async (req, res) => {
    const { title, description, location, salary,level,category } = req.body;
    const companyId = req.company._id;
    try {
        const newJob = new Job({
            title,
            description,
            location,
            salary,
            companyId,
            date: Date.now(),
            level,
            category
        })
        await newJob.save();
        res.json({success:true,newJob})
    }
    catch (error) {
        res.json({success:false,message:error.message})
    }
}

// get company job applicants
export const getCompanyJobApplicants = async (req, res) => { 
    try {
        const companyId = req.company._id
        // find job applications for the user and opulate related data
        const applications = await JobApplication.find({ companyId })
            .populate("userId","name image resume")
            .populate("jobId","title location category level salary ")
            .exec()
        
        return res.json({success:true,applications})
        
    }
    catch (error) {
        res.json({success:false,message:error.message})
    }

    
}

// get compaany posted jobs
export const getCompanyPostedJobs = async (req, res) => { 
    try {
        const companyId = req.company._id
        const jobs = await Job.find({ companyId })

        // adding number of applicants info in data
        const jobsData = await Promise.all(jobs.map(async (job) => {
            const applicants = await JobApplication.find({ jobId: job._id })
            return {...job.toObject(),applicants:applicants.length}
        }))
        res.json({success:true,jobsData})
    } catch (error) {
       res.json({success:false,message:error.message})
    }
}

// change job application status (Accept/reject)
export const changeJobApplicationsStatus = async (req, res) => { 
    try {
        const { id, status } = req.body 
        // find job application and update status
        await JobApplication.findOneAndUpdate({ _id: id }, { status })
        
        res.json({ success: true, message: "Status updated successfully" })
    }
    catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// change job visibility (check box )
export const changeJobVisibility = async (req, res) => { 
    try {
        const { id } = req.body
        
        const companyId = req.company._id
        
        const job = await Job.findById(id)
        
        //This ensures that only the company that created the job can modify its visibility.
        if (companyId.toString() === job.companyId.toString()) {
            job.visible = !job.visible  // toggle the visibility of the job
            
        }
        await job.save()
        res.json({ success: true, job })
        
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}


