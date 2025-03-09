import express from 'express';
import { registerForEvent, getUserRegistrations, cancelRegistration, checkRegistrationStatus } from '../controllers/registrations.controller.js';
import { protectedRoute } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All registration routes require authentication
router.use(protectedRoute);

// Register for an event
router.post('/register', registerForEvent);

// Get user's registrations
router.get('/my-registrations', getUserRegistrations);

// Cancel a registration
router.put('/cancel/:registrationId', cancelRegistration);

// Check if user is registered for an event
router.get('/check/:eventId', checkRegistrationStatus);

export default router;