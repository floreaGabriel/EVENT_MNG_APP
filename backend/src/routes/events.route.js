import express from 'express';
import { getEvents, createEvent, getEventById, updateEvent,toggleSaveEvent,checkSavedEvent, deleteEvent } from '../controllers/events.controller.js';
import { protectedRoute } from '../middlewares/auth.middleware.js';
import multer from 'multer';


const router = express.Router();


const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (validImageTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG, PNG, and GIF images are allowed'), false);
        }
    }
});

// rute neprotejate
router.get("/", getEvents);
router.get("/:id", getEventById);

// rute protejate pentru organizatori
router.post("/createEvent", protectedRoute, upload.single('coverImage'), createEvent);
router.put("/update/:id", protectedRoute, upload.single('coverImage'), updateEvent);

router.post("/save/:eventId", protectedRoute, toggleSaveEvent);
router.get("/saved/:eventId", protectedRoute, checkSavedEvent);

router.delete("/deleteEvent/:id", protectedRoute, deleteEvent);

export default router;
