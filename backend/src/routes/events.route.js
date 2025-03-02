import express from 'express';
import { getEvents, createEvent } from '../controllers/events.controller.js';
import { protectedRoute } from '../middlewares/auth.middleware.js';

const router = express.Router();

// rute neprotejate
router.get("/", getEvents);


// rute protejate
router.post("/createEvent", protectedRoute, createEvent);

export default router;
