import Registration from "../models/registration.model.js";
import Event from "../models/event.model.js";
import User from "../models/user.model.js";

export const registerForEvent = async (req, res) => {
    try {


        console.log("REGISTER FOR EVENT");
        const userId = req.user._id;
        const { eventId, ticketType, quantity = 1} = req.body;

        if (!eventId || !ticketType) {
            return res.status(400).json({
                succes: false,
                message: 'Event ID and ticket type are required'
            });
        }

        // verificam daca evenimentul exista

        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                succes: false,
                message: 'Event not found'
            });
        }


        // verifica daca este publicat
        if (event.status != 'PUBLISHED') {
            return res.status(404).json({
                succes: false,
                message: 'Event is not published yet'
            });
        }


        // verificam daca evenimentul a fost in trecut 

        if (new Date(event.dates.start) < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot register for past events'
            });
        }

        const selectedTicket  = event.pricing.tickets.find(ticket => ticket.type === ticketType);

        if (!selectedTicket) {
            return res.status(404).json({
                success: false,
                message: 'Selected ticket type not available'
            });
        }

        // verificam daca este valabil ticketul 

        if (selectedTicket.availableQuantity !== undefined && selectedTicket.availableQuantity < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Not enough tickets available'
            });
        }


        // calculam pretul total

        let totalPrice = selectedTicket.price * quantity;
        const currency = selectedTicket.currency;

        const existingRegistration = await Registration.findOne({
            event: eventId,
            user: userId
        });

        // daca exista deja o inregistrare nu te mai poti inregistra
        if (existingRegistration) {
            return res.status(400).json({
                success: false,
                message: 'You are already registered for this event'
            });
        }

        // atunci cream inregistrarea 

        const registration = new Registration({
            event: eventId,
            attendee: userId,
            ticketType,
            quantity,
            totalPrice,
            currency,
            status: 'PENDING',
            paymentStatus: event.pricing.isFree ? 'PAID' : 'UNPAID',
            paymentMethod: event.pricing.isFree ? 'FREE' : undefined
        });

        await registration.save();

        if (selectedTicket.availableQuantity !== undefined) {
            selectedTicket.availableQuantity -= quantity;
            await event.save();
        }

        event.currentAttendees = (event.currentAttendees || 0) + quantity;
        await event.save();

        await User.findByIdAndUpdate(userId, {
            $addToSet: { 'participantProfile.savedEvents': eventId }
        });

        if (event.pricing.isFree) {
            registration.status = 'CONFIRMED';
            await registration.save();

            await User.findByIdAndUpdate(userId, {
                $addToSet: { 'participantProfile.attendedEvents': eventId }
            });
        }

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: registration
        });
        
    } catch (error) {
        console.error('Error in registerForEvent:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to register for event',
            error: error.message
        });
    }
};

export const getUserRegistrations = async (req, res) => {

    try {
        const userId = req.user._id;

        const registrations = new Registration.find({attendee: userId})
            .populate({
                path: 'event',
                select: 'title dates location media category status'
            })
            .sort({createdAt: -1});

            res.status(200).json({
                success: true,
                data: registrations
            });
    } catch (error) {
        console.error('Error in getUserRegistrations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch registrations',
            error: error.message
        });
    }

};

export const cancelRegistration = async (req, res) => {
    try {

        console.log("Cancelling registration...");

        const userId = req.user._id;
        const { registrationId } = req.params;

        const registration = await Registration.findById(registrationId);
        if (!registration) {
            return res.status(404).json({
                success: false,
                message: 'Registration not found'
            });
        
        }

        // Verify the registration belongs to the user
        if (registration.attendee.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to cancel this registration'
            });
        }

        // Update registration status
        registration.status = 'CANCELLED';
        if (registration.paymentStatus === 'PAID') {
            registration.paymentStatus = 'REFUNDED';
        }
        
        await registration.save();

        // Update event's current attendees count
        const event = await Event.findById(registration.event);
        if (event) {
            event.currentAttendees = Math.max(0, (event.currentAttendees || 0) - registration.quantity);
            
            console.log("Verific daca s-a sters in functia cancel...");
            console.log("current attendes: ", event.currentAttendees);
            // Return tickets to available pool if applicable
            const ticketIndex = event.pricing.tickets.findIndex(t => t.type === registration.ticketType);
            if (ticketIndex >= 0 && event.pricing.tickets[ticketIndex].availableQuantity !== undefined) {
                event.pricing.tickets[ticketIndex].availableQuantity += registration.quantity;
            }
            
            await event.save();
        }

        res.status(200).json({
            success: true,
            message: 'Registration cancelled successfully'
        });
    } catch (error) {
        console.error('Error in cancelRegistration:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel registration',
            error: error.message
        });
    }
};

// TO DO: AM RAMAS LA VERIFICARE DACA MERGE SA TE INREGISTREZI LA UN EVENIMENT

export const checkRegistrationStatus = async (req, res) => {
    try {

        console.log("Check Registration function...");

        const userId = req.user._id;
        const { eventId } = req.params;

        const registration = await Registration.findOne({
            event: eventId,
            attendee: userId
        });

        if (!registration) {
            return res.status(200).json({
                success: true,
                isRegistered: false
            });
        }

        res.status(200).json({
            success: true,
            isRegistered: true,
            status: registration.status,
            data: registration
        });
    } catch (error) {
        console.error('Error in checkRegistrationStatus:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check registration status',
            error: error.message
        });
    }
};