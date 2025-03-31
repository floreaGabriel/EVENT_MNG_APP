import Notification from '../models/notifications.model.js';
import User from '../models/user.model.js';
import Event from '../models/event.model.js';
import mongoose from 'mongoose';

/**
 * @desc    Get all notifications for a user
 * @route   GET /api/notifications
 * @access  Private
 */
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Obține toate notificările pentru utilizator, ordonate după data creării (cele mai noi primele)
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .populate('eventId', 'title startDate location.address coverImage');
    
    // Calculează numărul de notificări necitite
    const unreadCount = await Notification.countDocuments({ 
      userId, 
      read: false 
    });
    
    res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea notificărilor',
      error: error.message
    });
  }
};

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
export const markNotificationAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user._id;
    
    // Verifică dacă notificarea există și aparține utilizatorului
    const notification = await Notification.findOne({ 
      _id: notificationId,
      userId
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notificarea nu a fost găsită'
      });
    }
    
    // Marchează notificarea ca citită
    notification.read = true;
    await notification.save();
    
    res.status(200).json({
      success: true,
      message: 'Notificare marcată ca citită',
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la marcarea notificării ca citită',
      error: error.message
    });
  }
};

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Actualizează toate notificările necitite ale utilizatorului
    const result = await Notification.updateMany(
      { userId, read: false },
      { $set: { read: true } }
    );
    
    res.status(200).json({
      success: true,
      message: 'Toate notificările au fost marcate ca citite',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la marcarea tuturor notificărilor ca citite',
      error: error.message
    });
  }
};

/**
 * @desc    Delete a notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
export const deleteNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user._id;
    
    // Verifică dacă notificarea există și aparține utilizatorului
    const notification = await Notification.findOne({ 
      _id: notificationId,
      userId
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notificarea nu a fost găsită'
      });
    }
    
    // Șterge notificarea
    await notification.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Notificare ștearsă cu succes'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la ștergerea notificării',
      error: error.message
    });
  }
};

/**
 * @desc    Create a notification (utility function for internal use)
 * @access  Private
 */
export const createNotification = async (userId, type, message, eventId = null) => {
  try {
    // Verifică dacă utilizatorul există
    const userExists = await User.exists({ _id: userId });
    if (!userExists) {
      throw new Error(`Utilizatorul cu ID-ul ${userId} nu există`);
    }
    
    // Verifică dacă evenimentul există (dacă este furnizat)
    if (eventId) {
      const eventExists = await Event.exists({ _id: eventId });
      if (!eventExists) {
        throw new Error(`Evenimentul cu ID-ul ${eventId} nu există`);
      }
    }
    
    // Creează notificarea
    const notification = new Notification({
      userId,
      type,
      message,
      eventId,
      read: false,
      createdAt: new Date()
    });
    
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * @desc    Delete all notifications for an event
 * @access  Private (pentru uz intern)
 */
export const deleteEventNotifications = async (eventId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      throw new Error('ID-ul evenimentului nu este valid');
    }
    
    const result = await Notification.deleteMany({ eventId });
    return result.deletedCount;
  } catch (error) {
    console.error('Error deleting event notifications:', error);
    throw error;
  }
};