import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import { useState, useEffect } from 'react'
import ProtectedRoute from './components/ProtectedRoute'
import { NotificationsProvider } from './context/NotificationsContext'

// pages
import Home from './pages/Home'
import Login from './pages/Login'
import Events from './pages/Events'
import CreateEvent from './pages/CreateEvent'
import EventDetails from './pages/EventDetails'
import Register from './pages/Register'
import ParticipantDashboard from './pages/ParticipantDashboard'
import OrganizerDashboard from './pages/OrganizerDashboard'
import EventRegistrations from './pages/EventRegistrations'
import ForgotPassword from './pages/ForgotPassword'
import VerifyEmail from './pages/VerifyEmail'
import OrganizerStats from './pages/OrganizerStats'
import Notifications from './pages/Notifications'

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in local storage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Verify authentication with backend
    const verifyAuth = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/auth/check', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          // Clear local storage if authentication fails
          localStorage.removeItem('user');
          setUser(null);
        }
      } catch (error) {
        console.error('Authentication verification failed:', error);
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <NotificationsProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar user={user} setUser={setUser} />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login setUser={setUser} />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetails user={user} />} />
              <Route path="/register" element={<Register setUser={setUser} />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-email" element={<VerifyEmail setUser={setUser}/>} />
              <Route path="/organizer-stats" element={<OrganizerStats />} />
              {/* 
              <Route path="/events/:id" element={<EventDetails />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/register" element={<Register setUser={setUser} />} />
              <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
              <Route path="/create-event" element={<CreateEvent user={user} />} />
              <Route path="/my-events" element={<MyEvents user={user} />} />
              <Route path="*" element={<NotFound />} />
              <Route  path='/profile' element={<Profile />} />
               */}

              {/** Protected routes */}
              <Route path='/create-event' element= {
                <ProtectedRoute user={user}>
                  <CreateEvent user={user}/>
                </ProtectedRoute>} />
              <Route path='/profile-participant' element={
                <ProtectedRoute user = {user}>
                  <ParticipantDashboard user={user}/>
                </ProtectedRoute>} />
              <Route path='/profile-organizer' element={
                <ProtectedRoute user = {user}>
                  <OrganizerDashboard user={user} setUser={setUser}/>
                </ProtectedRoute>} />

                <Route path="/event/:eventId/registrations" element={
                    <ProtectedRoute user={user}>
                      <EventRegistrations user={user} />
                    </ProtectedRoute> } />
              <Route path="/notifications" element={
                <ProtectedRoute user={user}>
                  <Notifications />
                </ProtectedRoute>} />
            </Routes>


          </main>
          <footer className="bg-gray-800 text-white py-6">
            <div className="max-w-7xl mx-auto px-4">
              <p className="text-center">© 2025 EventHub. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </NotificationsProvider>
    </Router>
  );
};

export default App;
