import express from 'express';
import { login, logout, signup, updateProfile, checkAuth, sendVerifyEmail, verifyEmail, sendResetEmailtoken, resetPassword } from '../controllers/auth.controller.js';
import { protectedRoute } from '../middlewares/auth.middleware.js';
import multer from 'multer';

const router = express.Router();


// Configure multer for this route
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (validImageTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG, PNG, and GIF images are allowed'), false);
        }
    },
});


router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/updateProfile", protectedRoute,upload.single("profilePic"), updateProfile);
router.get("/check", protectedRoute, checkAuth);

// email si password reset
router.post("/send-verify-token", sendVerifyEmail);
router.post("/verify-account", verifyEmail);
router.post("/send-reset-token", sendResetEmailtoken);
router.post("/reset-password", resetPassword);

export default router;


