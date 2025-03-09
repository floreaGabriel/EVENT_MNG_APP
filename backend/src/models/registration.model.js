import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema({
    event: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Event',
        required: true 
    },
    attendee: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    ticketType: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    totalPrice: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        enum: ['RON', 'EUR', 'USD'],
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'ATTENDED'],
        default: 'PENDING'
    },
    paymentStatus: {
        type: String,
        enum: ['UNPAID', 'PAID', 'REFUNDED'],
        default: 'UNPAID'
    },
    paymentMethod: {
        type: String,
        enum: ['CARD', 'TRANSFER', 'CASH', 'FREE'],
        default: 'FREE'
    },
    checkInCode: {
        type: String,
        unique: true,
        sparse: true
    },
    additionalNotes: String
}, {
    timestamps: true
});

// ne asiguram ca un user nu se poate inregistra de mai multe ori
registrationSchema.index({ event: 1, attendee: 1 }, { unique: true });


// generam un cod unic
registrationSchema.pre('save', async function(next) {
    if (this.isNew || (this.isModified('status') && this.status === 'CONFIRMED' && !this.checkInCode)) {
        // Generate a random 6-character alphanumeric code
        this.checkInCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    next();
});

const Registration = mongoose.model('Registration', registrationSchema);
export default Registration;