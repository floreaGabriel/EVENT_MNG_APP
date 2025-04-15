import Registration from "../models/registration.model.js";
import Event from "../models/event.model.js";
import User from "../models/user.model.js";
import { createNotification } from "./notifications.controller.js";


export const processPayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { registrationId, cardDetails } = req.body;

    // Verifică dacă înregistrarea există
    const registration = await Registration.findById(registrationId)
      .populate({
        path: 'event',
        select: 'title organizer pricing',
        populate: { path: 'organizer', select: 'firstname lastname' }
      })
      .populate('attendee', 'firstname lastname email');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Înregistrarea nu a fost găsită'
      });
    }

    // Verifică dacă utilizatorul este proprietarul înregistrării
    if (registration.attendee._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Nu ești autorizat să efectuezi plata pentru această înregistrare'
      });
    }

    // Verifică dacă înregistrarea este în status CONFIRMED sau PENDING
    if (!['CONFIRMED', 'PENDING'].includes(registration.status)) {
      return res.status(400).json({
        success: false,
        message: 'Doar înregistrările confirmate sau în așteptare pot fi plătite'
      });
    }

    // Verifică dacă plata nu a fost deja efectuată
    if (registration.paymentStatus === 'PAID') {
      return res.status(400).json({
        success: false,
        message: 'Această înregistrare a fost deja plătită'
      });
    }

    // Simulăm procesarea plății (nicio validare reală)
    console.log(`Procesare plată simulată pentru înregistrarea ${registrationId}`);
    console.log('Detalii card (simulate):', cardDetails);

    // Actualizăm statusul plății la PAID
    registration.paymentStatus = 'PAID';
    registration.paymentMethod = 'CARD';
    
    // Dacă înregistrarea era PENDING, o actualizăm la CONFIRMED după plată
    if (registration.status === 'PENDING') {
      registration.status = 'CONFIRMED';
    }

    // Salvăm înregistrarea actualizată
    await registration.save();

    // Adăugăm utilizatorul la evenimentele participante (dacă nu era deja)
    await User.findByIdAndUpdate(userId, {
      $addToSet: { 'participantProfile.attendedEvents': registration.event._id }
    });

    // Creăm notificări pentru participant și organizator
    // Notificare pentru participant
    await createNotification(
      userId,
      'participation_confirmed',
      `Plata pentru evenimentul "${registration.event.title}" a fost procesată cu succes.`,
      registration.event._id
    );

    // Notificare pentru organizator
    await createNotification(
      registration.event.organizer._id,
      'event_update',
      `${registration.attendee.firstname} ${registration.attendee.lastname} a achitat taxa pentru evenimentul "${registration.event.title}".`,
      registration.event._id
    );

    // Răspuns de succes
    res.status(200).json({
      success: true,
      message: 'Plata a fost procesată cu succes',
      data: {
        registration: {
          _id: registration._id,
          status: registration.status,
          paymentStatus: registration.paymentStatus,
          event: {
            _id: registration.event._id,
            title: registration.event.title
          }
        }
      }
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la procesarea plății',
      error: error.message
    });
  }
};


export const getPaymentStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { registrationId } = req.params;

    // Verifică dacă înregistrarea există
    const registration = await Registration.findById(registrationId)
      .populate('event', 'title');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Înregistrarea nu a fost găsită'
      });
    }

    // Verifică dacă utilizatorul este proprietarul înregistrării sau organizatorul evenimentului
    const event = await Event.findById(registration.event._id);
    
    if (registration.attendee.toString() !== userId.toString() && 
        event.organizer.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Nu ești autorizat să vizualizezi statusul plății pentru această înregistrare'
      });
    }

    // Returnează statusul plății
    res.status(200).json({
      success: true,
      data: {
        registrationId: registration._id,
        eventTitle: registration.event.title,
        status: registration.status,
        paymentStatus: registration.paymentStatus,
        paymentMethod: registration.paymentMethod,
        totalPrice: registration.totalPrice,
        currency: registration.currency
      }
    });
  } catch (error) {
    console.error('Error getting payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea statusului plății',
      error: error.message
    });
  }
};