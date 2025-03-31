import express from 'express';
import { 
    getUsers, 
    getUserById, 
    createUser, 
    updateUser, 
    deleteUser, 
    changeUserStatus,
    resetUserPassword,
    getUserStats
} from '../controllers/admin.controller.js';
import { protectedRoute, adminRoute } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Aplică middleware-uri pentru protejarea tuturor rutelor admin
router.use(protectedRoute);
router.use(adminRoute);

// Rute pentru gestionarea utilizatorilor
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/status', changeUserStatus);
router.post('/users/:id/reset-password', resetUserPassword);

// Rute pentru statistici
router.get('/stats', getUserStats);

export default router; 