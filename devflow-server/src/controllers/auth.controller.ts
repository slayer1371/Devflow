import { Request, Response } from 'express';
import { loginOrRegister } from '../services/auth.service';

/**
 * Handles user login or registration based on provided credentials.
 * @param req Express Request object
 * @param res Express Response object
 */
export const loginHandler = async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: "Email and password are required" });
            return;
        }
        
        const user = await loginOrRegister(email, password, name);
        res.json(user);
    } catch (error: any) {
        console.error("Login error:", error);
        res.status(401).json({ error: error.message || "Authentication failed" });
    }
};
