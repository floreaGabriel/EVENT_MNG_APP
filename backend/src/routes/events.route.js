import express from 'express';
import { getEvents, createEvent, getEventById, updateEvent } from '../controllers/events.controller.js';
import { protectedRoute } from '../middlewares/auth.middleware.js';

const router = express.Router();

// rute neprotejate
router.get("/", getEvents);
router.get("/:id", getEventById);

// rute protejate pentru organizatori
router.post("/createEvent", protectedRoute, createEvent);
router.put("/update/:id", protectedRoute, updateEvent);
export default router;
