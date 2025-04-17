# EventHub - Event Management Platform

EventHub is a full-stack web application designed for creating, managing, and discovering events. The platform has three types of users: participants (who can browse and register for events), organizers (who can create and manage events), and administrators (who can manage users and platform operations).

## 📑 Table of Contents
- [📋 Features](#📋-features)
  - [For Participants](#for-participants)
  - [For Organizers](#for-organizers)
  - [For Administrators](#for-administrators)
  - [General Features](#general-features)
- [🛠️ Technology Stack](#️🛠️technology-stack)
- [📁 Project Structure](#📁-project-structure)
- [🚀 Installation and Setup](#🚀-installation-and-setup)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [🧪 Setting Up Test Data](#🧪-setting-up-test-data)
- [📝 API Documentation](#📝-api-documentation)
- [🔒 User Roles and Permissions](#🔒-user-roles-and-permissions)
- [Scenario for testing](#scenario-for-testing)
- [👥 Contributors](#👥-contributors)

## 📋 Features

### For Participants
- Browse and search events by category, location, date, and other filters
- View detailed event information including location, time, price, and organizer details
- Register for events with different ticket types
- Save favorite events
- Manage event registrations (view, cancel)
- Receive notifications about event updates
- Process payments for paid events

### For Organizers
- Create and publish events with rich descriptions, images, and ticket options
- Track registrations and attendees
- Manage event details and updates
- View analytics and statistics about events
- Different subscription plans (FREE, PREMIUM, ENTERPRISE) with various limits and features

### For Administrators
- Manage users (create, update, delete, change status)
- View platform statistics
- Reset user passwords

### General Features
- User authentication (signup, login, password reset)
- Profile management
- Email notifications
- Responsive design

## 🛠️Technology Stack

### Backend
- **Node.js** and **Express** - Server framework
- **MongoDB** with **Mongoose** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Nodemailer** - Email service
- **Cloudinary** - Image storage

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Axios** - API client

## 📁 Project Structure

```
/
├── backend/           # Backend Node.js application
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── lib/             # Utility functions and services
│   │   ├── middlewares/     # Express middlewares
│   │   ├── models/          # Mongoose models
│   │   └── routes/          # Express routes
|   |   index.js        # Backend entrypoint
├── frontend/          # Frontend React application
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── context/         # React context providers
│   │   ├── pages/           # Page components
│   │   └── services/        # API services
|   |   App.jsx     # Frontend Entrypoint
```

## 🚀 Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Cloudinary account
- SMTP email provider

### Backend Setup

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. Install backend dependencies
   ```bash
   cd backend
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   
   ```
   PORT=5001
    MONGODB_URI=mongodb+srv://gflorea2004:1hQ0ZOYlqtssPvWi@cluster0.36w4q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
    JWT_SECRET=0k7gYR3kVUYeb3U2vwuPr3ELTAgsXL2JlUQnBZel3Uc=

    CLOUDINARY_CLOUD_NAME=duairwgys
    CLOUDINARY_API_KEY=145281994757412
    CLOUDINARY_API_SECRET=0_nZ3I4KVQUpSnO1TyZKA5ZBYXI

    SMTP_USER ="virgil.schiller93@ethereal.email"
    SMTP_PASS = "7QMfp8My9YWxJZpjrc"


    SENDER_EMAIL = "consiliu.ai@gmail.com"
   ```

4. Start the backend development server
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Install frontend dependencies
   ```bash
   cd frontend
   npm install
   ```

2. Create a `.env` file in the frontend directory with the following variables:
   ```
   PORT=5000
   ```

3. Start the frontend development server
   ```bash
   npm run dev
   ```

4. Access the application at `http://localhost:5000`

## 🧪 Setting Up Test Data

To set up test data, you can use the following steps:

1. Create an admin user through the registration process
2. Use MongoDB Compass or another MongoDB client to update the user's roles to include 'ADMIN'
3. Log in as the admin and create other users through the admin interface

## 📝 API Documentation

The API is organized around RESTful principles. It uses standard HTTP response codes and returns responses in JSON format.

### Base URL
```
http://localhost:5001/api
```

### Authentication

Most endpoints require authentication using a JWT token. The token is obtained after login and should be included in the `Authorization` header as a Bearer token or in a cookie named `jwt`.

### Key Endpoints

- **Auth**
  - `POST /auth/signup` - Register a new user
  - `POST /auth/login` - Log in a user
  - `POST /auth/logout` - Log out a user
  - `PUT /auth/updateProfile` - Update user profile

- **Events**
  - `GET /events` - Get all events
  - `GET /events/:id` - Get event by ID
  - `POST /events/createEvent` - Create a new event
  - `PUT /events/update/:id` - Update an event
  - `DELETE /events/deleteEvent/:id` - Delete an event

- **Registrations**
  - `POST /registrations/register` - Register for an event
  - `GET /registrations/my-registrations` - Get user's registrations
  - `PUT /registrations/cancel/:registrationId` - Cancel a registration

- **Admin**
  - `GET /admin/users` - Get all users
  - `POST /admin/users` - Create a user
  - `PUT /admin/users/:id` - Update a user
  - `DELETE /admin/users/:id` - Delete a user

## 🔒 User Roles and Permissions

The application has three user roles:

1. **PARTICIPANT** - Can browse events, register for events, and manage their registrations
2. **ORGANIZER** - Can create and manage events, view registrations for their events
3. **ADMIN** - Has full access to manage users and system settings

## Scenario for testing

### Scenario 1: Participant Experience - Browsing and Registering for Events

1. **Login as Participant**
   - Navigate to `http://localhost:5000/login`
   - Enter the participant credentials:
     - Email: g.florea2004@gmail.com (or other participant account from database)
     - Password: 12345678
   - Click "Sign in"

2. **Browse Available Events**
   - From the homepage, click on "Browse Events"
   - You'll see a list of all published events
   - Use the search bar or filters to narrow down events by:
     - Category (e.g., "Festival", "Concert", "Party")
     - Location (e.g., "Bucharest", "Cluj")
     - Date
    - Keep in mind that you will see only the events that are upcoming ! Past events won't be shown.

3. **View Event Details**
   - Click on the "View Details" button for any event (e.g., "unghii maine")
   - Review the event information:
     - Description
     - Date and time
     - Venue details with map
     - Ticket options and pricing
     - Organizer information

4. **Register for an Event**
   - While viewing the event details, click on a ticket type (e.g., "Bilet normal" - 500.00 RON)
   - Click the "Register" button
   - Confirm your registration
   - After registration, you'll be redirected to the event page with a confirmation

5. **Check Your Registrations**
   - Navigate to your profile by clicking on your profile picture in the top right
   - Select "My Events" from the dashboard menu
   - You should see the event you just registered for with status "CONFIRMED" or "PENDING"
   - You can view your ticket details or cancel your registration

6. **Check Notifications**
   - Click on the bell icon in the top navigation bar
   - View registration confirmation notifications
   - Note: You may need to refresh the page to see new notifications

### Scenario 2: Organizer Experience - Creating and Managing Events

1. **Login as Organizer**
   - Navigate to `http://localhost:5000/login`
   - Enter the organizer credentials:
     - Email: 123@gmail.com
     - Password: 12345678
   - Click "Sign in"

2. **Create a New Event**
   - From the homepage, click on "Create Event"
   - Fill in the event details:
     - Event title: "Workshop JavaScript"
     - Description: "Learn JavaScript basics and advanced techniques"
     - Category: "Workshop"
     - Location: "Online"
     - Date & Time: Select a future date
     - Ticket information:
       - Free event: No
       - Ticket type: "General Admission"
       - Price: 50 RON
       - Available quantity: 30
   - Upload a cover image (optional)
   - Set status to "PUBLISHED" to make it visible
   - Click "Create Event"

3. **Manage Event Registrations**
   - Navigate to your organizer dashboard
   - Click on "My Events"
   - Find the event you created and click "Manage Registrations"
   - View all registrations for your event
   - Approve or reject pending registrations
   - Send notifications to registered participants


### Scenario 3: Administrator Experience - Managing Users

1. **Login as Admin**
   - Navigate to `http://localhost:5000/login`
   - Enter the admin credentials:
     - Email: admin@email.com
     - Password: 12345678
   - Click "Sign in"

2. **View User Management Dashboard**
   - Navigate to the admin dashboard (on the top righ corner icon)
   - View overall platform statistics:
     - Total users
     - Active users
     - Organizers
     - Participants

3. **Manage Users**
   - Click on "User Management"
   - View the list of all users with their details
   - Filter users by:
     - Role (PARTICIPANT, ORGANIZER, ADMIN)
     - Status (ACTIVE, INACTIVE, SUSPENDED)
     - Search by name or email

4. **Create a New User**
   - Click "Create User"
   - Fill in the user details:
     - Email
     - Password
     - First name
     - Last name
     - Username
     - Role (select PARTICIPANT or ORGANIZER)
     - Status (ACTIVE)
   - Click "Create"

5. **Edit User Details**
   - From the user list, select a user to edit
   - Update their details as needed
   - Save changes

6. **Reset User Password**
   - From the user list, select a user
   - Click "Reset Password"
   - Confirm the action
   - The system will generate a temporary password and send it to the user

Note: When testing the application, remember that you may need to refresh the page to see updates for notifications and some real-time changes.


## 👥 Contributors

- Florea Cristian Gabriel - Work and development

---

Made with ❤️ using Node.js, Express, React, and MongoDB
