import express from 'express';
import { processPayment, getPaymentStatus } from '../controllers/payments.controller.js';
import { protectedRoute } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Procesarea plății
router.post('/process', protectedRoute, processPayment);

// Obținerea statusului plății
router.get('/status/:registrationId', protectedRoute, getPaymentStatus);

export default router;