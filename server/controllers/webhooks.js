import { Webhook } from "svix";
import User from "../models/User.js";

export const clerkWebhooks = async (req, res) => {
    try {
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        // Verify the webhook
        await whook.verify(JSON.stringify(req.body), {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        });

        const { data, type } = req.body;

        switch (type) {
            case 'user.created': {
                const email = data.email_addresses?.[0]?.email_address || "";
                const userData = {
                    _id: data.id,
                    email,
                    name: `${data.first_name} ${data.last_name}`,
                    image: data.image_url,
                    resume: ""
                };
                await User.create(userData);
                res.json({ success: true });
                break;
            }
            case 'user.updated': {
                const email = data.email_addresses?.[0]?.email_address || "";
                const userData = {
                    email,
                    name: `${data.first_name} ${data.last_name}`,
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
