// routes/stats.routes.js
import express from 'express';
import { getOrganizerStats } from '../controllers/stats.controller.js';
import { protectedRoute } from '../middlewares/auth.middleware.js';

const router = express.Router();

// GET /api/stats/organizer - Obține statisticile pentru organizator
router.get('/organizer', protectedRoute, getOrganizerStats);

export default router;