import jwt from 'jsonwebtoken';
import userModel from '../model/userModel.js';

// middleware to protect routes and verify JWT token //

export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.token;
        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        // decode the token //
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
       // user data fetch kar rahe hain by using decoded.userId jo humne token generate karte time pass ki thi jo ki utils folder me hai //
        const user = await userModel.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(401).json({ message: "Invalid token. User not found.", success: false });
        }
        req.user = user; // attach user data to request object //
        next();
    } catch (error) {
        console.log(error);
        res.json({ message: "Server error", success: false });
        
    }


}