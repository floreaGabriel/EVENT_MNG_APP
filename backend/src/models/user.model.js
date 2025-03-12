import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true,
        validate: {
            validator: function(v) {
                return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
            },
            message: props => `${props.value} nu este un email valid!`
        }
    },
    password: { type: String, required: true, minLength:8 },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    roles: [{ type: String, enum: ['PARTICIPANT', 'ORGANIZER', 'ADMIN']}],
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'], default: 'ACTIVE' },
    avatar: String,

    // pentru email
    isVerified:{
        type: Boolean,
        default: false
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    participantProfile: {
        preferences: {
            eventTypes: [String],
            locations: [String],
            priceRange: {
                min: Number,
                max: Number
            }
        },
        savedEvents: [{
            type: mongoose.Schema.Types.ObjectId, ref: 'Event'
        }],
        attendedEvents: [{
            type: mongoose.Schema.Types.ObjectId, ref: 'Event'
        }],
        contactInfo: {
            phone: String,
            address: {
                street: String,
                city: String,
                country: String,
                postalCode: String
            }
        },
        socialMedia: {
            linkedin: String,
            facebook: String,
            instagram: String
        },
        description: String
    },

    organizerProfile: {
        description: String,
        verificationStatus: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
        // evenimente si statistici
        events: {
            active: [{type: mongoose.Schema.Types.ObjectId, ref: 'Event'}],
            past: [{type: mongoose.Schema.Types.ObjectId, ref: 'Event'}],
            totalEvents: {type: Number, default: 0}
        },
        // abonamente si rating
        subscriptionPlan: {
            type: String,
            enum: ['FREE', 'PREMIUM', 'ENTERPRISE']
        },
        rating: {
            average: {type: Number, default: 0},
            count: {type: Number, default: 0}
        },
        contactInfo: {
            businessEmail: String,
            phone: String,
            website: String,
            socialMedia: {
                linkedin: String,
                facebook: String,
                instagram: String
            }
        },
    },

    settings: {
        language: { type: String, default: 'RO' },
        notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            sms: { type: Boolean, default: false }
        }
    }
}, {timestamps: true});

const User = mongoose.model('User', userSchema);
export default User;