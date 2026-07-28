import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AnalysisResult } from './types';
import UploadSection from './components/UploadSection';
import AnalysisResults from './components/AnalysisResults';
import './App.css';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setShowResults(true);
    setIsLoading(false);
  };

  const handleNewAnalysis = () => {
    setAnalysisResult(null);
    setShowResults(false);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              ATS Resume Analyzer
            </h1>
            <p className="text-lg text-gray-600">
              Get your resume scored against job descriptions and discover improvement opportunities
            </p>
          </header>

          {/* Main Content */}
          <main>
            {!showResults ? (
              <UploadSection
                onAnalysisComplete={handleAnalysisComplete}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            ) : analysisResult ? (
              <div className="animate-fade-in">
                <button
                  onClick={handleNewAnalysis}
                  className="mb-6 flex items-center text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  New Analysis
                </button>
                <AnalysisResults
                  result={analysisResult}
                  onExport={() => console.log('Export clicked')}
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Analyzing your resume...</p>
              </div>
            )}
          </main>

          {/* Footer */}
          <footer className="mt-12 text-center text-gray-500 text-sm">
            <p>© 2024 ATS Resume Analyzer | Built with React & FastAPI</p>
            <p className="mt-1">Powered by AI for better career opportunities</p>
          </footer>
        </div>

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
};

export default App;