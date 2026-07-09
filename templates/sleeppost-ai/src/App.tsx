import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './pages/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import AvatarsPage from './pages/AvatarsPage';
import ContentPage from './pages/ContentPage';
import MarketingPage from './pages/MarketingPage';
import RevenuePage from './pages/RevenuePage';
import SettingsPage from './pages/SettingsPage';

const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <div className="min-h-screen">
                <Navbar />
                <main>
                  <LandingPage />
                </main>
                <Footer />
              </div>
            }
          />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="avatars" element={<AvatarsPage />} />
            <Route path="content" element={<ContentPage />} />
            <Route path="marketing" element={<MarketingPage />} />
            <Route path="revenue" element={<RevenuePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
