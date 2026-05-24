import * as authService from "./auth.services.js";
import { EmailQueue } from "../Queues/Queue.js";
export const signup = async (req, res) => {
    try {
        const { username, emailid, password } = req.body;
        
        const result = await authService.registerUser(username, emailid, password);
        await EmailQueue.add('sendWelcomeEmail',{
            email: result.user.emailid,
            name: result.user.username
        },{
            attempts: 2,
            backoff: {
                type: 'exponential',
                delay: 5000,
            },
            
        })
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            ...result
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const signin = async (req, res) => {
    try {
        const { emailid, password } = req.body;
        
        const result = await authService.loginUser(emailid, password);
        
        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            ...result
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

