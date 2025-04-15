import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    type: { type: String, enum: ['event_invite', 'event_update', 'participation_confirmed', 'reminder'], required: true }, 
    message: { type: String, required: true }, 
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' }, 
    read: { type: Boolean, default: false }, 
    createdAt: { type: Date, default: Date.now } 
});
  
const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;

