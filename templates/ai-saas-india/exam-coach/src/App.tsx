import { useState } from 'react';
import LandingPage from './components/LandingPage';
import DemoPage from './components/DemoPage';

type Page = 'landing' | 'demo';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');

  return (
    <div className="min-h-screen bg-gray-50">
      {currentPage === 'landing' ? (
        <LandingPage onNavigateToDemo={() => setCurrentPage('demo')} />
      ) : (
        <DemoPage onBack={() => setCurrentPage('landing')} />
      )}
    </div>
  );
}

export default App;
