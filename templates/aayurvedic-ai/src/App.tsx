import { useState } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import ChatPage from './components/ChatPage';
import ResourcesPage from './components/ResourcesPage';
import Footer from './components/Footer';

import './index.css';

export default function App() {
  const [page, setPage] = useState<'landing' | 'chat' | 'resources'>('landing');
  return (
    <div>
      <Navbar currentPage={page} onNavigate={setPage} />
      <main>
        {page === 'landing' && <LandingPage onNavigateToChat={() => setPage('chat')} onNavigateToResources={() => setPage('resources')} />}
        {page === 'chat' && <ChatPage />}
        {page === 'resources' && <ResourcesPage onBack={() => setPage('landing')} />}
      </main>
      <Footer />
    </div>
  );
}