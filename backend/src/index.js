import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.route.js'
import dotenv from 'dotenv';
import { connectDB } from './lib/db.js';
import cors from 'cors';
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['set-cookie']
}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use("/api/auth", authRoutes);
app.use("api/events", eventsRoute);

app.listen(5001, () => {
    connectDB();
    console.log(`Server running on port ${process.env.PORT}`);
})