import express from 'express';
import { login, logout, signup, updateProfile, checkAuth } from '../controllers/auth.controller.js';
import { protectedRoute } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/updateProfile", protectedRoute, updateProfile);
router.get("/check", protectedRoute, checkAuth);

export default router;


