import jwt from "jsonwebtoken";
import User from "../models/user.model.js";


export const protectedRoute = async (req,res,next) => {
    try {
        console.log('Protected Route...');
         // Încearcă să obții token-ul din cookie
         let token = req.cookies?.jwt;
        
         // Dacă nu există în cookie, verifică header-ul de autorizare
         if (!token && req.headers.authorization) {
             const authHeader = req.headers.authorization;
             if (authHeader && authHeader.startsWith('Bearer ')) {
                 token = authHeader.split(' ')[1];
             }
         }
         //console.log('cookies: ', req.cookies);
         //console.log('token: ', token);
         
        if (!token) {
            console.log("No token provided error----");
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log('Token decodat:', decoded);
        
        if (!decoded) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }

        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found by middleware' });
        }

        req.user = user;
        console.log("Am trecut de protected route...");
        next();     
    } catch(err) {
        return res.status(500).json({ success: false, message: 'User retrieval failed', error: err.message });
    }
}