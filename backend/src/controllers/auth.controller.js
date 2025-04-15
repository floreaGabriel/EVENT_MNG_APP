import User from "../models/user.model.js";
import bcrypt from 'bcryptjs';
import { generateTokenAndSetCookie } from "../lib/utils/generateTokenAndSetCookie.js";
import cloudinary from '../lib/cloudinary.js';
import transporter from "../lib/nodemailer.js";


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

        const newUser = new User ({
            ...user,
            password: hashedPassword,

        });

        await newUser.save();
        console.log(`user created: ${newUser.username}`);

        try {
            await sendVerifyEmailHelper(newUser._id);
        } catch (emailError) {
            // Dacă trimiterea emailului eșuează, șterge utilizatorul
            await User.findByIdAndDelete(newUser._id);
            console.log(`User ${newUser.username} deleted due to email sending failure`);
            return res.status(500).json({ success: false, message: 'Failed to send verification email', error: emailError.message });
        }

        const { password, ...userWithoutPassword } = newUser.toObject();
        res.status(201).json({ success: true, message: 'user created successfully', data: userWithoutPassword });
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

        if (!user.isVerified) {
            return res.status(403).json({
                 success: false,
                  message: 'Email not verified. Please verify your email to log in.' 
                });
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
    console.log("Actualizare profil ...");
    try {
        const userData = req.body;
        const userID = req.user._id;

        // Parse the user data from FormData (non-file fields)
        const updateData = {};
        for (const [key, value] of Object.entries(req.body)) {
            try {
                // Try to parse the value as JSON (for nested objects like participantProfile, organizerProfile)
                updateData[key] = JSON.parse(value);
            } catch (e) {
                // If parsing fails, treat it as a string
                updateData[key] = value;
            }
        }

        console.log("Imagine: ", req.file);
        
        // Handle the profile picture if uploaded
        let profilePicUrl = undefined;
        if (req.file) {
            console.log("Uploading profile picture to Cloudinary...");
            const uploadResponse = await cloudinary.uploader.upload(
                `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
                {
                    folder: 'profiles', // Store profile pictures in a 'profiles' folder
                    resource_type: 'image',
                }
            );
            profilePicUrl = uploadResponse.secure_url;
            console.log("Cloudinary upload result:", uploadResponse);
        }

        // Build the update object
        if (updateData.firstname) updateData.firstname = updateData.firstname;
        if (updateData.lastname) updateData.lastname = updateData.lastname;
        if (updateData.username) updateData.username = updateData.username;
        if (updateData.email) updateData.email = updateData.email;
        if (profilePicUrl) updateData.avatar = profilePicUrl;

        // For participant profile
        if (updateData.participantProfile) {
            updateData.participantProfile = {
                preferences: updateData.participantProfile.preferences || {},
                contactInfo: updateData.participantProfile.contactInfo || {},
                socialMedia: updateData.participantProfile.socialMedia || {},
                description: updateData.participantProfile.description || '',
            };
        }

        // For organizer profile
        if (updateData.organizerProfile) {
            updateData.organizerProfile = {
                description: updateData.organizerProfile.description || '',
                contactInfo: updateData.organizerProfile.contactInfo || {},
                subscriptionPlan: updateData.organizerProfile.subscriptionPlan || 'FREE',
            };
        }

        const options = {
            new: true, // Return the updated document
            runValidators: true, // Validate the data before updating
        };

        const updatedUser = await User.findByIdAndUpdate(userID, updateData, options);

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "Utilizatorul nu a fost găsit",
            });
        }

        // Return the user object without the password
        const { password, ...userWithoutPassword } = updatedUser.toObject();

        res.status(200).json({
            success: true,
            message: "Profil actualizat cu succes",
            data: userWithoutPassword,
        });
    } catch (err) {
        console.log('Eroare la actualizarea profilului:', err);
        res.status(500).json({
            success: false,
            message: "Eroare la actualizarea profilului",
            error: err.message,
        });
    }
};

export const checkAuth = (req, res) => {
    try {
        console.log("Check AUTH");
        res.status(200).json(req.user); 
        console.log("Am trecut de check AUTH...");
    } catch(err) {
        console.log("Error in checkAuth");
        res.status(500).json({message: "Internal server error"});
    }
}

const sendVerifyEmailHelper = async (userId) => {
    try {
        console.log("Send verify email function");

        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        console.log("User: ", user.username);

        if (user.isVerified) {
            throw new Error("User is already verified");
        }

        console.log("User is not verified");

        const emailToken = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationToken = emailToken;
        user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 ore

        await user.save();

        console.log("Email token: ", emailToken);

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account verification token',
            text: `Your token is ${emailToken}. Verify your account with this token.`
        };

        console.log("Email send to: ", user.email);

        await transporter.sendMail(mailOption);
        console.log("Email sent to: ", user.email);
    } catch (error) {
        console.log("Error in sendVerifyEmailHelper:", error.message);
        throw error;
    }
};

export const sendVerifyEmail = async (req,res) => {
    try {
        const { userId } = req.body;

        await sendVerifyEmailHelper(userId);

        return res.status(200).json({
            success: true,
            message: "Verification email sent successfully"
        });
    } catch (error) {
        console.log("Error in sendVerifyEmail:", error.message);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}

export const verifyEmail = async (req, res) => {
    try {
        const {userId, emailToken} = req.body;

        if (!userId || !emailToken) {
            return res.status(400).json({
                success: false,
                message: "Invalid request"
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false, 
                message: 'User not foound'
            })
        }

        if (user.verificationToken === '' || user.verificationToken !== emailToken) {
            return res.status(400).json({
                success: false, 
                message: 'Invalid token'
            })
        }

        if (user.verificationTokenExpires < Date.now()) {
            return res.status(400).json({
                success: false, 
                message: 'Email auth token expired'
            })
        }

        user.isVerified = true;
        user.verificationToken = '';
        user.verificationTokenExpires = undefined;

        await user.save();

        generateTokenAndSetCookie(user._id, res);

        const {password, ...userWithoutPassword} = user.toObject();


        return res.status(200).json({
            success: true,
            message: 'Email verified successfully',
            data: userWithoutPassword
        });
    } catch (error) {
        return res.status(500).json({
            success: false, 
            message: 'Internal server error. In functia de verifyEmail.'
        });
    }
}

export const sendResetEmailtoken = async (req, res) =>{

    try {
        console.log("Send reset email token function")
        const  {email} = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required."
            });
        }


        const user = await User.findOne({email});
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "user not found"
            })
        }

        const emailToken = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordToken = emailToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

        await user.save();

        console.log("User: ", user);
        
        console.log("Email token: ", emailToken);

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password Reset token',
            text: `Your token is ${emailToken}. Use this to reset your password.`
        };

        await transporter.sendMail(mailOption);

        return res.status(200).json({
            success: true,
            message: "Password reset token sent successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false, 
            message: 'Internal server error. In functia de sendResetEmail.'
        });
    }
}

export const resetPassword = async (req,res) => {
    try {
        console.log("Reset password function");
        const {email, token, newPassword} = req.body;

        console.log("Email: ", email);
        console.log("New password: ", newPassword);
        if (!email || !token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Email, token and new password are required."
            });
        }

        const user = await User.findOne({email});
        if (!user) {
            return res.status(404).json({
                success: false, 
                message: 'User not found'
            })
        }
        console.log("User reset token:", user.resetPasswordToken);
        console.log("Token: ", token);
        if ( user.resetPasswordToken === "" || user.resetPasswordToken !== token) {
            return res.status(400).json({
                success: false, 
                message: 'Invalid token'
            })
        }

        if (user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({
                success: false, 
                message: 'Password reset token expired'
            })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;


        user.resetPasswordToken = '';
        user.resetPasswordExpires = undefined;

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Password reset successfully'
        });

    } catch (error) {
        return res.status(500).json({
            success: false, 
            message: 'Internal server error. In functia de resetPassword.'
        });
    }
}

