import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB } from './lib/db.js';
import cors from 'cors';

import authRoutes from './routes/auth.route.js';
import eventsRoute from './routes/events.route.js';
import registrationRoute from './routes/registration.route.js'
import statsRoute from './routes/stats.route.js'


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
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));


app.use("/api/auth", authRoutes);
app.use("/api/events", eventsRoute);
app.use("/api/registrations", registrationRoute);
app.use("/api/stats", statsRoute);

app.listen(5001, () => {
    connectDB();
    console.log(`Server running on port ${process.env.PORT}`);
})