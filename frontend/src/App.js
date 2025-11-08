import { useEffect, useState } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';
import MapView from './components/MapView';
import PredictPage from './components/PredictPage';
import ReservePage from './components/ReservePage';
import PaymentPage from './components/PaymentPage';
import RewardsPage from './components/RewardsPage';
import HistoryPage from './components/HistoryPage';
import WalletPage from './components/WalletPage';
import ProfilePage from './components/ProfilePage';
import SharedSpaces from './components/SharedSpaces';
import { Toaster } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const axiosInstance = axios.create({
  baseURL: API,
  withCredentials: true
});

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hash = window.location.hash;
    const sessionIdMatch = hash.match(/session_id=([^&]+)/);

    if (sessionIdMatch) {
      const sessionId = sessionIdMatch[1];
      processSessionId(sessionId);
    } else {
      checkExistingSession();
    }
  }, []);

  const processSessionId = async (sessionId) => {
    try {
      const response = await axiosInstance.post('/auth/session-data', null, {
        headers: { 'X-Session-ID': sessionId }
      });
      setUser(response.data.user);
      window.location.hash = '';
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Session processing failed:', error);
      setLoading(false);
    }
  };

  const checkExistingSession = async () => {
    try {
      const response = await axiosInstance.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.log('No existing session');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center">
        <div className="text-[#1976D2] text-xl font-medium">Loading...</div>
      </div>
    );
  }

  return (
    <div className="App">
      <Toaster position="top-center" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
          <Route
            path="/dashboard"
            element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/" />}
          />
          <Route
            path="/map"
            element={user ? <MapView user={user} onLogout={handleLogout} /> : <Navigate to="/" />}
          />
          <Route
            path="/predict"
            element={user ? <PredictPage user={user} onLogout={handleLogout} /> : <Navigate to="/" />}
          />
          <Route
            path="/reserve/:spotId"
            element={user ? <ReservePage user={user} onLogout={handleLogout} /> : <Navigate to="/" />}
          />
          <Route
            path="/payment/:bookingId"
            element={user ? <PaymentPage user={user} onLogout={handleLogout} /> : <Navigate to="/" />}
          />
          <Route
            path="/rewards"
            element={user ? <RewardsPage user={user} onLogout={handleLogout} /> : <Navigate to="/" />}
          />
          <Route
            path="/history"
            element={user ? <HistoryPage user={user} onLogout={handleLogout} /> : <Navigate to="/" />}
          />
          <Route
            path="/wallet"
            element={user ? <WalletPage user={user} onLogout={handleLogout} /> : <Navigate to="/" />}
          />
          <Route
            path="/profile"
            element={user ? <ProfilePage user={user} onLogout={handleLogout} /> : <Navigate to="/" />}
          />
          <Route
            path="/shared-spaces"
            element={user ? <SharedSpaces user={user} onLogout={handleLogout} /> : <Navigate to="/" />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;