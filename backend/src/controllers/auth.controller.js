import User from "../models/user.model.js";
import bcrypt from 'bcryptjs';
import { generateTokenAndSetCookie } from "../lib/utils/generateTokenAndSetCookie.js";
import cloudinary from '../lib/cloudinary.js';


export const signup = async (req, res) => {
    console.log("Signup function!!!");
    try {
        const user = req.body;
        console.log(user);
        if ( !user.email ||  !user.password ||  !user.firstname ||  !user.lastname ||  !user.roles ||  !user.status || !user.username) {
            return res.status(400).json({ success: false,  message: 'Please fill in all fields' });
        }
        
        const existingUsername = await User.findOne({ username: user.username });
        if (existingUsername) {
            return res.status(400).json({ success: false, message: 'Username already in use' });
        }

        const existingEmail = await User.findOne({ email: user.email });
        if (existingEmail) {
            return res.status(400).json({ success: false, message: 'Email already in use' });
        }

        if (user.password.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
        }


        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash (user.password, salt);

        const newUser = new User (user);
        newUser.password = hashedPassword;

    
        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res);
            await newUser.save();
            console.log(`user created: ${newUser.username}`);

            const { password, ...userWithoutPassword } = newUser.toObject();
            res.status(201).json({ success: true, message: 'user created successfully', data: userWithoutPassword });
        }
        else {
            res.status(400).json({ success: false, message: 'Invalid user data' });
        }
    } catch(error) {
        res.status(500).json({ success: false, message:  'user creation failed', error: error.message });
    }
}

export const login = async (req, res) => {
    console.log("Attempting to login...");

    try {
        const { email, password: userPassword }  = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            console.log('User not found');
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const isPasswordCorrect = await bcrypt.compare(userPassword, user.password);
        if (!isPasswordCorrect) {
            console.log('Password incorrect');
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const token = generateTokenAndSetCookie(user._id, res);
        console.log('Token generated and cookie set');
        
        const { password, ...userWithoutPassword } = user.toObject();

        console.log('Cookies setate:', res.getHeaders()['set-cookie']);

        res.status(200).json({ 
            success: true,
            message: 'User logged in successfully',
            data: userWithoutPassword,
            token: token
         });
    } catch(err) {
        res.status(500).json({ success: false, message:  'user login failed', error: err.message });
    }
}

export const logout = async (req, res) => {
    try {
        console.log('Sterg cookies-ul token...');
        res.clearCookie('jwt', { maxAge: 0, httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV !== 'development' });
        res.status(200).json({ success: true, message: 'User logged out successfully' });
    } catch (error) {
        console.error('Eroare la logout:', error);
        res.status(500).json({ success: false, message: 'User logout failed', error: error.message });
    }
}

export const updateProfile = async (req, res) => {
    try {
        const {profilePic} = req.body;
        const userID = req.user._id;

        if (!profilePic) {
            return res.status(400).json({
                message: "Profile pic is required" 
            })
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);

        const updatedUser = await User.findByIdAndUpdate(userID, {profilePic: uploadResponse.secure_url}, {new:true});

        res.status(200).json(updatedUser);


    } catch(err) {
        console.log('Error in update profile');
        res.status(500).json({message: "Error in updateProfile"});
    }
}

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user); 
    } catch(err) {
        console.log("Error in checkAuth");
        res.status(500).json({message: "Internal server error"});
    }
}