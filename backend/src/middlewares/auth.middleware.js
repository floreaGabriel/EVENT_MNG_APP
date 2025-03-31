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

/**
 * Middleware pentru verificarea dacă utilizatorul autentificat are rol de administrator
 * Trebuie folosit după middleware-ul protectedRoute
 */
export const adminRoute = async (req, res, next) => {
    try {
        // Verificăm dacă există un utilizator autentificat (setat de protectedRoute)
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required' 
            });
        }

        // Verificăm dacă utilizatorul are rolul de ADMIN
        if (!req.user.roles || !req.user.roles.includes('ADMIN')) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied: Admin role required' 
            });
        }

        // Utilizatorul este admin, poate continua
        console.log("Admin route access granted");
        next();
    } catch (err) {
        return res.status(500).json({ 
            success: false, 
            message: 'Admin verification failed', 
            error: err.message 
        });
    }
};