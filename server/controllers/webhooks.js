import { Webhook } from "svix";
import User from "../models/User.js";

// API Controller function to manage clerk user with database
export const clerkWebhooks = async (req, res) => {
    try {
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        // Verify the webhook
        await whook.verify(JSON.stringify(req.body), {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        });

        // getting data from request body
        const { data, type } = req.body;

        switch (type) {
            case 'user.created': {
                const userData = {
                    _id: data.id,
                    email:data.email_addresses[0].email_address,
                    name: data.first_name+" "+data.last_name,
                    image: data.image_url,
                    resume: ''
                };
                console.log("🔹 Saving User Data:", userData); 
                await User.create(userData);   //save data in database
                console.log("✅ User Data Saved");
                res.json({ success: true });
                break;
            }
            case 'user.updated': {
                const userData = {
                    email:data.email_addresses[0].email_address,
                    name: data.first_name+" "+data.last_name,
                    image: data.image_url,
                };
                await User.findByIdAndUpdate(data.id, userData);
                res.json({ success: true });
                break;
            }
            case 'user.deleted': {
                await User.findByIdAndDelete(data.id);
                res.json({ success: true });
                break;
            }
            default:
                res.status(400).json({ success: false, message: 'Invalid event type' });
        }
    } catch (error) {
        console.error("Webhook Error:", error);
        res.status(500).json({ success: false, message: 'Webhooks Error' });
    }
};
