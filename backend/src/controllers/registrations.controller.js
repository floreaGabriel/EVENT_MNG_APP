import Registration from "../models/registration.model.js";
import Event from "../models/event.model.js";
import User from "../models/user.model.js";
import { createNotification } from "./notifications.controller.js";

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

        // Obținem datele utilizatorului pentru a le include în notificare
        const user = await User.findById(userId).select('firstname lastname username');
        const userName = user ? `${user.firstname} ${user.lastname}` : 'Un utilizator';

        const existingRegistration = await Registration.findOne({
            event: eventId,
            attendee: userId
        });

        // daca exista deja o inregistrare nu te mai poti inregistra
        if (existingRegistration) {
            console.log("Exista deja inregistrarea...", existingRegistration);

            if (existingRegistration.status === 'CANCELLED') {
                existingRegistration.status = 'PENDING';
                existingRegistration.paymentStatus = event.pricing.isFree ? 'PAID' : 'UNPAID';
                existingRegistration.paymentMethod = event.pricing.isFree ? 'FREE' : undefined;
                existingRegistration.quantity = quantity;
                existingRegistration.totalPrice = totalPrice;
                existingRegistration.ticketType = ticketType;

                await existingRegistration.save();

                if (selectedTicket.availableQuantity !== undefined) {
                    selectedTicket.availableQuantity -= quantity;
                    await event.save();
                }

                event.currentAttendees = (event.currentAttendees || 0) + quantity;
                await event.save();

                if (event.pricing.isFree) {
                    existingRegistration.status = 'CONFIRMED';
                    await existingRegistration.save();
                    
                    // Adăugare notificare pentru confirmare înregistrare (participant)
                    await createNotification(
                        userId,
                        'participation_confirmed',
                        `Participarea ta la evenimentul "${event.title}" a fost confirmată.`,
                        eventId
                    );

                    // Adăugare notificare pentru organizator
                    await createNotification(
                        event.organizer,
                        'event_update',
                        `${userName} și-a reconfirmat participarea la evenimentul tău "${event.title}".`,
                        eventId
                    );
                }

                console.log("Inregistrarea a fost updatata...", existingRegistration);

                return res.status(200).json({
                    success: true,
                    message: 'Registration successful',
                    data: existingRegistration
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'You are already registered for this event'
                });
            }
        }

        // atunci cream inregistrarea 
        console.log("Cream inregistrarea...");

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

        if (event.pricing.isFree) {
            registration.status = 'CONFIRMED';
            await registration.save();

            await User.findByIdAndUpdate(userId, {
                $addToSet: { 'participantProfile.attendedEvents': eventId }
            });
            
            // Adăugare notificare pentru confirmare înregistrare (participant)
            await createNotification(
                userId,
                'participation_confirmed',
                `Participarea ta la evenimentul "${event.title}" a fost confirmată.`,
                eventId
            );
            
            // Adăugare notificare pentru organizator - înregistrare confirmată
            await createNotification(
                event.organizer,
                'event_update',
                `${userName} s-a înscris la evenimentul tău "${event.title}" și participarea a fost confirmată automat.`,
                eventId
            );
        } else {
            // Adăugare notificare pentru înregistrare în așteptare (participant)
            await createNotification(
                userId,
                'event_invite',
                `Te-ai înregistrat cu succes la evenimentul "${event.title}". Plata este în așteptare.`,
                eventId
            );
            
            // Adăugare notificare pentru organizator - înregistrare în așteptare
            await createNotification(
                event.organizer,
                'event_update',
                `${userName} s-a înscris la evenimentul tău "${event.title}" și așteaptă confirmarea.`,
                eventId
            );
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
        console.log("Get user registrations function ...");

        const userId = req.user._id;

        const registrations = await Registration.find({attendee: userId})
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

        const registration = await Registration.findById(registrationId)
            .populate('event', 'title organizer');
            
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

        // Obținem datele utilizatorului pentru a le include în notificare
        const user = await User.findById(userId).select('firstname lastname username');
        const userName = user ? `${user.firstname} ${user.lastname}` : 'Un utilizator';

        // Update registration status
        registration.status = 'CANCELLED';
        if (registration.paymentStatus === 'PAID') {
            registration.paymentStatus = 'REFUNDED';
        }
        
        await registration.save();

        // Update event's current attendees count
        const event = await Event.findById(registration.event);
        if (event) {
            console.log("Current attendees: ", event.currentAttendees);
            event.currentAttendees = Math.max(0, (event.currentAttendees || 0) - registration.quantity);
            console.log("Verific daca s-a sters in functia cancel...");
            console.log("current attendes: ", event.currentAttendees);
            // Return tickets to available pool if applicable
            const ticketIndex = event.pricing.tickets.findIndex(t => t.type === registration.ticketType);
            if (ticketIndex >= 0 && event.pricing.tickets[ticketIndex].availableQuantity !== undefined) {
                event.pricing.tickets[ticketIndex].availableQuantity += registration.quantity;
            }
            
            await event.save();
            
            // Adăugare notificare pentru organizator despre anularea participării
            await createNotification(
                event.organizer,
                'event_update',
                `${userName} și-a anulat participarea la evenimentul tău "${event.title}".`,
                event._id
            );
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

export const getEventRegistrations = async (req, res) => {
    try {
        const { eventId } = req.params;
        const organizerId = req.user._id;

        console.log("Get event registrations...");
        // verificam daca evenimentul exista si este al organizatorului curent
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }


        if (event.organizer.toString() !== organizerId.toString()) {

            console.log("event org:", event.organizer.toString());
            console.log("id event org:", organizerId.toString());

            return res.status(403).json({
                success: false,
                message: 'Unauthorized to view registrations for this event'
            })
        }

        // preluam toate inregistrarile la eveniment

        const registrations = await Registration.find({event: eventId})
            .populate({
                path: 'attendee',
                select: 'username firstname lastname email avatar participantProfile'
            })
            .sort({createdAt: -1});
        

        console.log("Registrations: ", registrations);

        res.status(200).json({
            success: true,
            count: registrations.length,
            data: registrations
            });
    } catch (error) {
        console.error('Error fetching event registrations:', error);
        res.status(500).json({
        success: false,
        message: 'Failed to retrieve registrations',
        error: error.message
        });
    }
}

export const updateRegistrationStatus = async (req, res) => {
    try {
        console.log("Update registration...");

        const {registrationId} = req.params;
        const {status} = req.body; // poate fi CANCELLED sau CONFIRMED
        const organizerId = req.user._id;
        //console.log("Status: ", status);    

        if (!['CONFIRMED', 'CANCELLED'].includes(status)) {
            console.log("Invalid status...", status);
            return res.status(400).json({
              success: false,
              message: 'Invalid status. Must be CONFIRMED or CANCELLED'
            });
          }
      
          // Find the registration
          const registration = await Registration.findById(registrationId)
            .populate('event', 'title organizer capacity currentAttendees pricing dates')
            .populate('attendee', 'email firstname lastname username');
          if (!registration) {
            return res.status(404).json({
              success: false,
              message: 'Registration not found'
            });
          }
      
        //console.log("event id: ", registration.event);
        
          // Verify the organizer owns this event
          const event = registration.event;
          
          // Verificăm dacă event.organizer există
          if (!event || !event.organizer || event.organizer.toString() !== organizerId.toString()) {
            return res.status(403).json({
              success: false,
              message: 'Unauthorized: You can only manage registrations for your own events'
            });
          }
      
          //console.log("Status inainte: ", registration.status);

          // Update the registration status
          const oldStatus = registration.status;
          registration.status = status;

          //console.log("Status dupa: ", registration.status);
          
          const attendeeName = registration.attendee ? 
            `${registration.attendee.firstname} ${registration.attendee.lastname}` : 
            'Participantul';
          
          // Handle ticket inventory and attendee count
          if (status === 'CANCELLED' && oldStatus !== 'CANCELLED') {
            // If cancelling a previously confirmed registration
            event.currentAttendees = Math.max(0, (event.currentAttendees || 0) - registration.quantity);
            
            // Return tickets to available pool
            const ticketIndex = event.pricing.tickets.findIndex(t => t.type === registration.ticketType);
            if (ticketIndex >= 0 && event.pricing.tickets[ticketIndex].availableQuantity !== undefined) {
              event.pricing.tickets[ticketIndex].availableQuantity += registration.quantity;
            }
            
            // Update payment status if paid
            if (registration.paymentStatus === 'PAID') {
              registration.paymentStatus = 'REFUNDED';
            }
            
            // Adăugare notificare pentru anulare participare (pentru participant)
            await createNotification(
                registration.attendee._id,
                'event_update',
                `Participarea ta la evenimentul "${event.title}" a fost anulată de organizator.`,
                event._id
            );
            
            // Notificare pentru organizator despre acțiunea proprie
            await createNotification(
                organizerId,
                'event_update',
                `Ai anulat participarea lui ${attendeeName} la evenimentul "${event.title}".`,
                event._id
            );
          } else if (status === 'CONFIRMED' && oldStatus !== 'CONFIRMED') {
            // Adăugare notificare pentru confirmare participare (pentru participant)
            await createNotification(
                registration.attendee._id,
                'participation_confirmed',
                `Participarea ta la evenimentul "${event.title}" a fost confirmată de organizator.`,
                event._id
            );
            
            // Notificare pentru organizator despre acțiunea proprie
            await createNotification(
                organizerId,
                'event_update',
                `Ai confirmat participarea lui ${attendeeName} la evenimentul "${event.title}".`,
                event._id
            );
          }
          
          await registration.save();
          await event.save();
      
          res.status(200).json({
            success: true,
            message: `Registration ${status === 'CONFIRMED' ? 'approved' : 'rejected'} successfully`,
            data: registration
          });
    } catch (error) {
        console.error('Error updating registration status:', error);
        res.status(500).json({
        success: false,
        message: 'Failed to update registration status',
        error: error.message
        });
    }
}

export const getSavedEventsByIds = async (req, res) => {

    try {
        const userId = req.user._id;

        const user = await User.findById(userId).select('participantProfile.savedEvents');

        if (!user || !user.participantProfile || !user.participantProfile.savedEvents) {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        const savedEventsIds = user.participantProfile.savedEvents;
        if (savedEventsIds.length == 0) {
            // inseamna ca nu are salavate evenimente
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        const events = await Event.find({
            _id: {$in: savedEventsIds}
        }).select('title dates description shortDescription location media category status organizer');


        res.status(200).json({
            success: true,
            data: events
          });

    } catch (error) {
        console.error('Error in getSavedEvents:', error);
        res.status(500).json({
        success: false,
        message: 'Failed to fetch saved events',
        error: error.message
        });
    }
}