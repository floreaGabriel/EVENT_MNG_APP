import User from '../models/user.model.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail, sendTemporaryPasswordEmail } from '../lib/emailService.js';

/**
 * Obține toți utilizatorii cu opțiuni de filtrare și paginare
 */
export const getUsers = async (req, res) => {
    try {
        const { 
            search, 
            role, 
            status, 
            sort = 'createdAt', 
            order = 'desc',
            page = 1, 
            limit = 10 
        } = req.query;

        // Construiește filtrul de căutare
        const filter = {};

        // Filtrare după text (nume, email, username)
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            filter.$or = [
                { firstname: searchRegex },
                { lastname: searchRegex },
                { email: searchRegex },
                { username: searchRegex }
            ];
        }
        
        // Filtrare după rol
        if (role) {
            filter.roles = role;
        }

        // Filtrare după status
        if (status) {
            filter.status = status;
        }

        // Calculează numărul de documente de sărit pentru paginare
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Determină ordinul de sortare
        const sortOrder = order === 'asc' ? 1 : -1;
        const sortOption = { [sort]: sortOrder };

        // Execută interogarea cu paginare
        const users = await User.find(filter)
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit))
            .select('-password -__v');

        // Obține numărul total de utilizatori pentru paginare
        const total = await User.countDocuments(filter);

        return res.status(200).json({
            success: true,
            data: users,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error.message
        });
    }
};

/**
 * Obține un utilizator după ID
 */
export const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;

        // Verificare dacă ID-ul este valid
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }

        const user = await User.findById(userId).select('-password -__v');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch user',
            error: error.message
        });
    }
};

/**
 * Creează un utilizator nou
 */
export const createUser = async (req, res) => {
    try {
        const { 
            email, 
            password, 
            firstname, 
            lastname, 
            username, 
            roles = ['PARTICIPANT'], 
            status = 'ACTIVE' 
        } = req.body;

        // Verifică dacă email-ul sau username-ul există deja
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });

        if (existingUser) {
            const field = existingUser.email === email ? 'email' : 'username';
            return res.status(400).json({
                success: false,
                message: `User with this ${field} already exists`
            });
        }

        // Verifică dacă rolurile sunt valide
        const validRoles = ['PARTICIPANT', 'ORGANIZER', 'ADMIN'];
        const hasInvalidRole = roles.some(role => !validRoles.includes(role));
        
        if (hasInvalidRole) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role specified'
            });
        }

        // Hash parola
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, 10);

        // Creează un token de verificare pentru email
        const verificationToken = Math.random().toString(36).substring(2, 15) + 
                                  Math.random().toString(36).substring(2, 15);
        const tokenExpiration = new Date();
        tokenExpiration.setHours(tokenExpiration.getHours() + 24); // Token valid 24 ore

        // Creează utilizatorul
        const newUser = new User({
            email,
            password: hashedPassword,
            firstname,
            lastname,
            username,
            roles,
            status,
            isVerified: status === 'ACTIVE', // Dacă statusul este ACTIVE, setăm isVerified la true
            verificationToken: status !== 'ACTIVE' ? verificationToken : undefined,
            verificationTokenExpires: status !== 'ACTIVE' ? tokenExpiration : undefined
        });

        await newUser.save();

        // Trimite email de verificare dacă utilizatorul nu este deja verificat
        if (status !== 'ACTIVE') {
            try {
                await sendVerificationEmail(newUser);
            } catch (emailError) {
                console.error('Failed to send verification email:', emailError);
                // Continuăm chiar dacă emailul nu a fost trimis
            }
        }

        // Returnează utilizatorul creat fără parolă
        const userResponse = { ...newUser.toObject() };
        delete userResponse.password;
        delete userResponse.__v;

        return res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: userResponse
        });
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create user',
            error: error.message
        });
    }
};

/**
 * Actualizează un utilizator existent
 */
export const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const updateData = { ...req.body };

        // Verificare dacă ID-ul este valid
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }

        // Găsește utilizatorul
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Nu permitem actualizarea directă a parolei prin această rută
        if (updateData.password) {
            delete updateData.password;
        }

        // Verifică dacă email-ul sau username-ul există deja la alt utilizator
        if (updateData.email || updateData.username) {
            const query = { _id: { $ne: userId } };
            
            if (updateData.email) query.email = updateData.email;
            if (updateData.username) query.username = updateData.username;
            
            const existingUser = await User.findOne(query);
            
            if (existingUser) {
                const field = existingUser.email === updateData.email ? 'email' : 'username';
                return res.status(400).json({
                    success: false,
                    message: `Another user with this ${field} already exists`
                });
            }
        }

        // Actualizează utilizatorul
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password -__v');

        return res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: updatedUser
        });
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update user',
            error: error.message
        });
    }
};

/**
 * Șterge un utilizator
 */
export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // Verificare dacă ID-ul este valid
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }

        // Verifică dacă utilizatorul există
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Șterge utilizatorul
        await User.findByIdAndDelete(userId);

        // Opțional: Șterge și alte date asociate utilizatorului (evenimente, înregistrări)
        // Acest lucru ar trebui făcut cu atenție și posibil asincron în producție

        return res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            error: error.message
        });
    }
};

/**
 * Schimbă statusul unui utilizator (activare/dezactivare)
 */
export const changeUserStatus = async (req, res) => {
    try {
        const userId = req.params.id;
        const { status } = req.body;

        // Verificare dacă ID-ul este valid
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }

        // Verificare dacă statusul este valid
        const validStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value. Must be ACTIVE, INACTIVE, or SUSPENDED'
            });
        }

        // Găsește și actualizează utilizatorul
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { status } },
            { new: true, runValidators: true }
        ).select('-password -__v');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Creează o notificare pentru utilizator
        const notificationMessage = status === 'ACTIVE' 
            ? 'Your account has been activated' 
            : (status === 'INACTIVE' ? 'Your account has been deactivated' : 'Your account has been suspended');

        const notification = new Notification({
            userId: userId,
            type: 'ACCOUNT_STATUS',
            content: notificationMessage,
            details: { status }
        });

        await notification.save();

        return res.status(200).json({
            success: true,
            message: `User status changed to ${status} successfully`,
            data: updatedUser
        });
    } catch (error) {
        console.error('Error changing user status:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to change user status',
            error: error.message
        });
    }
};

/**
 * Resetează parola unui utilizator
 */
export const resetUserPassword = async (req, res) => {
    try {
        const userId = req.params.id;

        // Verificare dacă ID-ul este valid
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }

        // Găsește utilizatorul
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Generează o parolă temporară aleatorie
        const temporaryPassword = Math.random().toString(36).substring(2, 10);
        
        // Hash parola temporară
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

        // Actualizează parola utilizatorului
        user.password = hashedPassword;
        await user.save();

        // Trimite e-mail cu parola temporară
        try {
            await sendTemporaryPasswordEmail(user, temporaryPassword);
            console.log(`Email cu parolă temporară trimis la ${user.email}`);
        } catch (emailError) {
            console.error('Failed to send temporary password email:', emailError);
            // Continuăm chiar dacă emailul nu a fost trimis
        }

        return res.status(200).json({
            success: true,
            message: 'User password reset successfully',
            temporaryPassword: process.env.NODE_ENV === 'development' ? temporaryPassword : undefined
        });
    } catch (error) {
        console.error('Error resetting user password:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to reset user password',
            error: error.message
        });
    }
};

/**
 * Obține statistici generale despre utilizatori și platformă
 */
export const getUserStats = async (req, res) => {
    try {
        // Numărul total de utilizatori
        const totalUsers = await User.countDocuments();
        
        // Utilizatori activi
        const activeUsers = await User.countDocuments({ status: 'ACTIVE' });
        
        // Numărul de organizatori
        const organizers = await User.countDocuments({ roles: 'ORGANIZER' });
        
        // Numărul de participanți
        const participants = await User.countDocuments({ roles: 'PARTICIPANT' });
        
        // Numărul de administratori
        const admins = await User.countDocuments({ roles: 'ADMIN' });
        
        // Utilizatori noi în această lună
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const newUsersThisMonth = await User.countDocuments({ 
            createdAt: { $gte: startOfMonth } 
        });
        
        return res.status(200).json({
            success: true,
            totalUsers,
            activeUsers,
            organizers,
            participants,
            admins,
            newUsersThisMonth
        });
    } catch (error) {
        console.error('Error getting user stats:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get user statistics',
            error: error.message
        });
    }
}; 