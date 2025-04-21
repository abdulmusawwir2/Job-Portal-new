import jwt from 'jsonwebtoken';
import Company from '../models/Company.js';

// decode jwt token and company id

export const protectCompany = async (req, res, next) => { 
    const token = req.headers.token;
    if (!token) {
        return res.json({ success: false, message: "Not Authorized Login again" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // we use decoded id to fetch the company data using company model
        req.company = await Company.findById(decoded.id).select('-password');  //select('-password') is used to not send password in response
        next();
    }
    catch(error) {
        res.json({ success: false, message: error.message});
    }
}