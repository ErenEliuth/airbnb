import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { ListingDetails } from './pages/ListingDetails';
import { ProfilePage } from './pages/Profile';
import { NotificationsPage } from './pages/Notifications';
import { MyBookingsPage } from './pages/MyBookings';
import { ExperienceDetails } from './pages/ExperienceDetails';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { AuthModal } from './components/AuthModal';
import { useEffect } from 'react';

const ProtectedRoute = ({ children }) => {
  const { user, openLoginModal } = useAuth();

  useEffect(() => {
    if (!user) {
      openLoginModal();
    }
  }, [user, openLoginModal]);

  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <AuthModal />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/listing/:id" element={<ListingDetails />} />
            <Route path="/experience/:id" element={<ExperienceDetails />} />
            <Route path="/host" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            } />
            <Route path="/mis-reservas" element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </SettingsProvider>
  );
}

export default App;
