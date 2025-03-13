import express from 'express';
import { login, logout, signup, updateProfile, checkAuth, sendVerifyEmail, verifyEmail, sendResetEmailtoken, resetPassword } from '../controllers/auth.controller.js';
import { protectedRoute } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/updateProfile", protectedRoute, updateProfile);
router.get("/check", protectedRoute, checkAuth);

// email si password reset
router.post("/send-verify-token", protectedRoute, sendVerifyEmail);
router.post("/verify-account", protectedRoute, verifyEmail);
router.post("/send-reset-token", sendResetEmailtoken);
router.post("/reset-password", resetPassword);

export default router;


