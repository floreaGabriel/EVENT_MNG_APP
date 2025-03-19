import Event from "../models/event.model.js";
import User from "../models/user.model.js";
import Registration from "../models/registration.model.js"


export const getOrganizerStats = async (req,res) => {

    try {
        const organizerId = req.user._id;


        // Verifică dacă utilizatorul are rolul de ORGANIZER
    const organizer = await User.findById(organizerId);
    if (!organizer || !organizer.roles.includes('ORGANIZER')) {
      return res.status(403).json({ message: 'Acces interzis. Trebuie să fii organizator.' });
    }
    
    // 1. Obține toate evenimentele create de acest organizator
    const events = await Event.find({ organizer: organizerId });
    
    if (!events.length) {
      return res.status(200).json({
        totalEvents: 0,
        totalAttendees: 0,
        eventsByCategory: {},
        recentEvents: [],
        popularEvents: [],
        attendeeTrend: [],
        ticketRevenue: []
      });
    }
    
    const eventIds = events.map(event => event._id);
    
    // 2. Calculează numărul total de participanți (înregistrări)
    const registrations = await Registration.find({ 
      event: { $in: eventIds },
      status: { $in: ['CONFIRMED', 'ATTENDED'] }
    });
    
    const totalAttendees = registrations.reduce((sum, reg) => sum + reg.quantity, 0);
    
    // 3. Grupează evenimentele după categorie
    const eventsByCategory = {};
    events.forEach(event => {
      if (eventsByCategory[event.category]) {
        eventsByCategory[event.category]++;
      } else {
        eventsByCategory[event.category] = 1;
      }
    });
    
    // 4. Obține evenimentele recente (sortate după dată)
    const recentEvents = await Event.find({ organizer: organizerId })
      .sort({ 'dates.start': -1 })
      .limit(3);
    
    // Adaugă numărul de participanți pentru fiecare eveniment recent
    const recentEventsWithAttendees = await Promise.all(
      recentEvents.map(async (event) => {
        const eventRegistrations = await Registration.find({ 
          event: event._id,
          status: { $in: ['CONFIRMED', 'ATTENDED'] } 
        });
        
        const attendees = eventRegistrations.reduce((sum, reg) => sum + reg.quantity, 0);
        
        return {
          _id: event._id,
          title: event.title,
          date: event.dates.start,
          attendees: attendees
        };
      })
    );
    
    // 5. Obține cele mai populare evenimente (cu cele mai multe participări)
    const eventAttendees = await Promise.all(
      eventIds.map(async (eventId) => {
        const eventRegistrations = await Registration.find({ 
          event: eventId,
          status: { $in: ['CONFIRMED', 'ATTENDED'] } 
        });
        
        const attendees = eventRegistrations.reduce((sum, reg) => sum + reg.quantity, 0);
        const ticketsSold = eventRegistrations.filter(reg => 
          reg.paymentStatus === 'PAID'
        ).reduce((sum, reg) => sum + reg.quantity, 0);
        
        return { eventId, attendees, ticketsSold };
      })
    );
    
    // Sortează după numărul de participanți
    eventAttendees.sort((a, b) => b.attendees - a.attendees);
    
    // Ia primele 3 evenimente populare
    const topPopularEventIds = eventAttendees.slice(0, 3).map(item => item.eventId);
    
    // Obține detaliile evenimentelor populare
    const popularEvents = await Promise.all(
      topPopularEventIds.map(async (eventId, index) => {
        const event = await Event.findById(eventId);
        return {
          _id: event._id,
          title: event.title,
          attendees: eventAttendees[index].attendees,
          ticketsSold: eventAttendees[index].ticketsSold
        };
      })
    );
    
    // 6. Calculează tendința numărului de participanți pe ultimele 6 luni
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    // Grupează înregistrările pe luni
    const monthlyRegistrations = {};
    
    // Inițializează cu ultimele 6 luni
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyRegistrations[monthKey] = 0;
    }
    
    // Actualizează cu date reale
    for (const registration of registrations) {
      if (registration.createdAt >= sixMonthsAgo) {
        const regDate = new Date(registration.createdAt);
        const monthKey = `${regDate.getFullYear()}-${String(regDate.getMonth() + 1).padStart(2, '0')}`;
        
        if (monthlyRegistrations[monthKey] !== undefined) {
          monthlyRegistrations[monthKey] += registration.quantity;
        }
      }
    }
    
    // Transformă în array pentru front-end
    const attendeeTrend = Object.entries(monthlyRegistrations)
      .sort(([monthA], [monthB]) => monthA.localeCompare(monthB))
      .map(([month, count]) => {
        const [year, monthNum] = month.split('-');
        const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
        return {
          month: date.toLocaleString('default', { month: 'short' }),
          count: count
        };
      });
    
    // 7. Calculează veniturile din bilete pe categorii
    const categoryRevenue = {};
    
    // Inițializează categoriile
    Object.keys(eventsByCategory).forEach(category => {
      categoryRevenue[category] = 0;
    });
    
    // Calculează venitul pentru fiecare categorie
    await Promise.all(
      events.map(async (event) => {
        const eventRegistrations = await Registration.find({
          event: event._id,
          paymentStatus: 'PAID'
        });
        
        const revenue = eventRegistrations.reduce((sum, reg) => sum + reg.totalPrice, 0);
        categoryRevenue[event.category] = (categoryRevenue[event.category] || 0) + revenue;
      })
    );
    
    // Transformă în array pentru front-end
    const ticketRevenue = Object.entries(categoryRevenue).map(([category, revenue]) => ({
      category,
      revenue
    }));
    
    // Returnează toate statisticile
    res.status(200).json({
      totalEvents: events.length,
      totalAttendees,
      eventsByCategory,
      recentEvents: recentEventsWithAttendees,
      popularEvents,
      attendeeTrend,
      ticketRevenue
    });
    
  } catch (error) {
    console.error('Error fetching organizer statistics:', error);
    res.status(500).json({ message: 'Eroare la obținerea statisticilor', error: error.message });
  }
}