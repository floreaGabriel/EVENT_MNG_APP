import express from 'express';
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification 
} from '../controllers/notifications.controller.js';
import { protectedRoute } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Adăugăm middleware-ul protectedRoute pentru fiecare rută individual, nu global cu router.use()
// Rută pentru obținerea tuturor notificărilor utilizatorului
router.get('/', protectedRoute, getUserNotifications);

// Rută pentru marcarea unei notificări ca citită
router.put('/:id/read', protectedRoute, markNotificationAsRead);

// Rută pentru marcarea tuturor notificărilor ca citite
router.put('/read-all', protectedRoute, markAllNotificationsAsRead);

// Rută pentru ștergerea unei notificări
router.delete('/:id', protectedRoute, deleteNotification);

export default router; 