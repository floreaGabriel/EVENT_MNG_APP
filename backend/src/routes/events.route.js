import express from 'express';
import { getEvents } from '../controllers/events.controller.js';
import { protectedRoute } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get("/getEvents", protectedRoute ,getEvents);

export default router;
