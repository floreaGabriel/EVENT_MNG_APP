import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB } from './lib/db.js';
import cors from 'cors';
import multer from 'multer';

import authRoutes from './routes/auth.route.js';
import eventsRoute from './routes/events.route.js';
import registrationRoute from './routes/registration.route.js'
import statsRoute from './routes/stats.route.js'
import notificationsRoute from './routes/notifications.route.js';
import paymentsRoute from './routes/payments.route.js';
import adminRoutes from './routes/admin.route.js';


dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['set-cookie']
}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// multer for storage 
// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory (you can also use diskStorage to save to disk)
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (validImageTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG, PNG, and GIF images are allowed'), false);
        }
    }
});

app.use("/api/auth", authRoutes);
app.use("/api/events", eventsRoute);
app.use("/api/registrations", registrationRoute);
app.use("/api/stats", statsRoute);
app.use("/api/notifications", notificationsRoute);
app.use("/api/payments", paymentsRoute);
app.use("/api/admin", adminRoutes);

app.listen(5001, () => {
    connectDB();
    console.log(`Server running on port ${process.env.PORT}`);
})
