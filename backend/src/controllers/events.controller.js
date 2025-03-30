import Event from '../models/event.model.js';
import User from '../models/user.model.js';
import cloudinary from 'cloudinary';
import { createNotification, deleteEventNotifications } from './notifications.controller.js';
import Registration from '../models/registration.model.js';

export const getEvents = async (req, res) => {
    try {

        console.log("GET EVENTS FUNCTION");
        const {
            category,
            city, 
            startDate,
            endDate,
            search,
            status,
            isFree,
            visibility,
            sortBy,
            sortOrder,
            page = 1,
            limit = 10
        } = req.query;

        // construim filtrul

        const filter = {};

        // Filtrăm după visibility (case-insensitive)
        if (visibility) {
            filter.visibility = { $regex: `^${visibility}$`, $options: 'i' };
        } else {
            // Implicit, afișăm doar evenimentele publice
            filter.visibility = { $regex: '^PUBLIC$', $options: 'i' };
        }
        
        if (status) filter.status = status;
        if (category) filter.category = category;
        if (city) filter['location.city'] = { $regex: city, $options: 'i'};
        if (isFree) filter['pricing.isFree'] = isFree === 'true';

        if (startDate) {
            filter['dates.start'] = {
                $gte: new Date(startDate)
            };
        }

        if (endDate) {
            filter['dates.end'] = {
                $lte: new Date(endDate)
            };
        }



        // asta e searchul
        if (search) {
            // $or ne permite sa cautam in mai multe campuri odata
            // $options: 'i' -> pentru a face cautarea insensitive
            filter.$or = [
                {title: {$regex: search, $options: 'i'}},
                {description: {$regex: search, $options: 'i'}},
                {tags: {$in: [new RegExp(search, 'i')]}}
            ];
        }

        const skip = (parseInt(page) - 1) * (parseInt(limit));

        const sort = {};

        if (sortBy) {

            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        } else {
            sort['dates.start'] = 1;
        }

        const events = await Event.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('organizer', 'username avatar organizerProfile.rating');

        const total = await Event.countDocuments(filter);

        console.log("Evenimente filtrate", events);

        res.status(200).json({
            success: true, 
            data: events,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            } 
        })
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch events', 
            error: error.message 
        });
    }
};

export const createEvent = async (req, res) => {

    try {

        console.log("Create event func: ");


        const userId = req.user._id; // extragem utilizatorul 

        // verificam daca este organizer
        const user = await User.findById(userId);
        if (!user.roles.includes('ORGANIZER')) {
            return res.status(403).json({ 
                success: false, 
                message: 'Only organizers can create events' 
              });
        } else {

            console.log("Verificare daca se poate crea eveniment...");
            // Check subscription plan limits
            const currentMonthEvents = await Event.countDocuments({
                organizer: userId,
                createdAt: { 
                $gte: new Date(new Date().setDate(1)) // First day of current month
                }
            });
  
            // Set limits based on subscription plan
            let eventLimit;
            switch (user.organizerProfile.subscriptionPlan) {
                case 'FREE':
                eventLimit = 5;
                break;
                case 'PREMIUM':
                eventLimit = 20;
                break;
                case 'ENTERPRISE':
                eventLimit = Infinity; // Unlimited
                break;
                default:
                eventLimit = 5; // Default to FREE plan limit
            }
            
            console.log("Evenimente create: ", currentMonthEvents);
            
            if (currentMonthEvents >= eventLimit) {
                return res.status(403).json({
                success: false,
                message: `You have reached your monthly limit of ${eventLimit} events for your ${user.organizerProfile.subscriptionPlan} plan. Please upgrade your plan to create more events.`
                });
            }
        }

        // Parse the event data from FormData
        const eventData = {};
        for (const [key, value] of Object.entries(req.body)) {
            try {
                // Try to parse the value as JSON (for nested objects like location, dates, pricing)
                eventData[key] = JSON.parse(value);
            } catch (e) {
                // If parsing fails, treat it as a string
                eventData[key] = value;
            }
        }
        // extragem datele evenimentului

        eventData.organizer = userId;

        console.log("EventData: ", eventData);

        // Handle the cover image if uploaded
        if (req.file) {
            console.log("Uploading image to Cloudinary...");
            const uploadResult = await cloudinary.uploader.upload(
                `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
                {
                    folder: 'events',
                    resource_type: 'image',
                }
            );

            console.log("Cloudinary upload result:", uploadResult);

            eventData.media = {
                ...eventData.media,
                coverImage: uploadResult.secure_url,
            };
        }

        // cream noul eveniment

        const newEvent = new Event(eventData);
        await newEvent.save();

        console.log("Event creat: ", newEvent);
        // actualizam organizatorul

        await User.findByIdAndUpdate(userId, {
            $push: {'organizerProfile.events.active': newEvent._id },
            $inc: {'organizerProfile.events.totalEvents': 1}
        });

        res.status(201).json({ 
            success: true, 
            message: 'Event created successfully', 
            data: newEvent 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to create event', 
            error: error.message 
        });
    }
};

export const getEventById = async (req, res) => {
    try {
        console.log("GetEventById");
        const {id:eventId}= req.params;
        console.log(eventId);
        const event = await Event.findById(eventId)
            .populate('organizer', 'username avatar organizerProfile');

        if (!event) {
            return res.status(404).json({ 
                success: false, 
                message: 'Event not found' 
            });
            }
              
        res.status(200).json({ success: true, data: event });
    } catch (error) {
        console.log("Eroare in functia getEventById");
        res.status(500).json({ 
            success: false, 
            message: 'Failed to get event by id', 
            error: error.message 
        });
    }
};

export const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        console.log("Id event: ", id);
        //console.log("User id: " , userId);

    
        const existingEvent = await Event.findById(id);
        if (!existingEvent) {
            return res.status(404).json({ 
              success: false, 
              message: 'Event not found' 
            });
        }

        console.log("Organizator ID: ", existingEvent.organizer);
        console.log("Utilizator ID: ", userId);
        console.log("Sunt egale?", existingEvent.organizer.toString() === userId.toString());
        
        //console.log("event gasit: ", existingEvent);
        // verificam daca useru curent este organziatorul evenimentului
        if (existingEvent.organizer.toString() !== userId.toString()) {
            return res.status(403).json({ 
                success: false, 
                message: 'You can only update your own events' 
              });
        }

        const updatedData = req.body;
        console.log("updated data: ",updatedData);
        if (updatedData.coverImageBase64) {
            const uploadResult = await cloudinary.uploader.upload(updatedData.coverImageBase64, {
                folder: 'events'
            });
            updatedData.media = {
                ...updatedData.media,
                coverImage: uploadResult.secure_url
            };
            delete updatedData.coverImageBase64;
        }

        console.log("se face update la event");
        // new: true -> returneaza noul obiect modificat, nu cel original
        const updatedEvent = await Event.findByIdAndUpdate(
            id,
            updatedData,
            { new: true}
        );
        console.log("s-a facut update la event");

        // Dacă evenimentul este publicat, trimite notificări participanților despre actualizare
        if (updatedEvent.status === 'PUBLISHED') {
            // Găsește toți participanții înregistrați la acest eveniment
            const registrations = await Registration.find({ 
                event: id, 
                status: { $in: ['CONFIRMED', 'PENDING'] } 
            });
            
            // Trimite notificări tuturor participanților
            for (const registration of registrations) {
                await createNotification(
                    registration.attendee,
                    'event_update',
                    `Evenimentul "${updatedEvent.title}" la care participi a fost actualizat.`,
                    id
                );
            }
        }

        res.status(200).json({ 
            success: true, 
            message: 'Event updated successfully', 
            data: updatedEvent 
        });
    } catch (error) {
        console.error('Error in updateEvent:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update event', 
            error: error.message 
        });
    }
};

export const toggleSaveEvent = async (req, res) => {
    try {
      const userId = req.user._id;
      const { eventId } = req.params;
      
      // Find the user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Check if event exists
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }
      
      // Initialize participantProfile if it doesn't exist
      if (!user.participantProfile) {
        user.participantProfile = {};
      }
      
      // Initialize savedEvents array if it doesn't exist
      if (!user.participantProfile.savedEvents) {
        user.participantProfile.savedEvents = [];
      }
      
      // Check if event is already saved
      const eventIndex = user.participantProfile.savedEvents.indexOf(eventId);
      let isSaved = false;
      
      if (eventIndex === -1) {
        // Event not saved, so save it
        user.participantProfile.savedEvents.push(eventId);
        isSaved = true;
      } else {
        // Event already saved, so unsave it
        user.participantProfile.savedEvents.splice(eventIndex, 1);
        isSaved = false;
      }
      
      await user.save();
      
      res.status(200).json({
        success: true,
        isSaved,
        message: isSaved ? 'Event saved successfully' : 'Event unsaved successfully'
      });
    } catch (error) {
      console.error('Error in toggleSaveEvent:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save/unsave event',
        error: error.message
      });
    }
};

export const checkSavedEvent = async (req, res) => {
    try {
      const userId = req.user._id;
      const { eventId } = req.params;
      
      // Find the user with only savedEvents field
      const user = await User.findById(userId).select('participantProfile.savedEvents');
      
      let isSaved = false;
      
      // Check if user has participant profile and saved events
      if (user && user.participantProfile && user.participantProfile.savedEvents) {
        // Check if the event is in the savedEvents array
        isSaved = user.participantProfile.savedEvents.includes(eventId);
      }
      
      res.status(200).json({
        success: true,
        isSaved
      });
    } catch (error) {
      console.error('Error in checkSavedEvent:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check if event is saved',
        error: error.message
      });
    }
};

export const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        // Găsește evenimentul
        const event = await Event.findById(id);
        
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        
        // Verifică dacă utilizatorul este organizatorul evenimentului
        if (event.organizer.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own events'
            });
        }
        
        // Găsește toți participanții înregistrați la acest eveniment
        const registrations = await Registration.find({ 
            event: id, 
            status: { $in: ['CONFIRMED', 'PENDING'] } 
        });
        
        // Trimite notificări tuturor participanților despre ștergerea evenimentului
        for (const registration of registrations) {
            await createNotification(
                registration.attendee,
                'event_update',
                `Evenimentul "${event.title}" la care participai a fost anulat de organizator.`,
                null  // Nu mai includem ID-ul evenimentului deoarece va fi șters
            );
        }
        
        // Șterge toate notificările asociate acestui eveniment
        await deleteEventNotifications(id);
        
        // Șterge toate înregistrările pentru acest eveniment
        await Registration.deleteMany({ event: id });
        
        // Șterge evenimentul din Cloudinary dacă există imagine
        if (event.media && event.media.coverImage) {
            const publicId = event.media.coverImage.split('/').pop().split('.')[0]; // Extragem publicId din URL
            await cloudinary.uploader.destroy(`events/${publicId}`);
        }
        
        // Șterge evenimentul
        await Event.findByIdAndDelete(id);
        
        res.status(200).json({
            success: true,
            message: 'Event deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteEvent:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete event',
            error: error.message
        });
    }
};