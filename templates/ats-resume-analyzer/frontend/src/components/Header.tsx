"""
Header component for the ATS Resume Analyzer application.
"""

import React from 'react';
import { FaFileUpload, FaChartBar, FaInfo } from 'react-icons/fa';

interface HeaderProps {
  currentStep: 'upload' | 'analysis' | 'results';
}

const Header: React.FC<HeaderProps> = ({ currentStep }) => {
  const getStepLabel = () => {
    switch (currentStep) {
      case 'upload':
        return 'Upload Resume & Job Description';
      case 'analysis':
        return 'Analyzing Your Resume';
      case 'results':
        return 'Analysis Complete';
      default:
        return 'Upload Resume & Job Description';
    }
  };

  const getStepIcon = () => {
    switch (currentStep) {
      case 'upload':
        return <FaFileUpload className="text-indigo-600" size={20} />;
      case 'analysis':
        return <FaChartBar className="text-indigo-600" size={20} />;
      case 'results':
        return <FaInfo className="text-indigo-600" size={20} />;
      default:
        return <FaFileUpload className="text-indigo-600" size={20} />;
    }
  };

  return (
    <header className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-100 rounded-full p-2">
            {getStepIcon()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ATS Resume Analyzer</h1>
            <p className="text-gray-600">AI-powered resume analysis and job compatibility scoring</p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center space-x-2">
          {['upload', 'analysis', 'results'].map((step, index) => (
            <React.Fragment key={step}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium\n                  ${currentStep === step
                    ? 'bg-indigo-600 text-white'
                    : currentStep === 'results' && index < 2
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                  }\n                `}
              >
                {index + 1}
              </div>
              {index < 2 && (
                <div className={`h-1 w-12 rounded-full\n                  ${currentStep === step || (currentStep === 'results' && index < 2)
                    ? 'bg-indigo-600'
                    : 'bg-gray-200'
                  }\n                `} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Current Step Description */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Current Step: {getStepLabel()}</h2>
        <div className="text-sm text-gray-600 space-y-1">
          {currentStep === 'upload' && (
            <>
              <p>• Upload your resume (PDF, DOCX, or TXT format)</p>
              <p>• Paste the job description you want to apply for</p>
              <p>• Select your experience level for better matching</p>
            </>
          )}
          {currentStep === 'analysis' && (
            <>
              <p>• Our AI is analyzing your resume against the job description</p>
              <p>• Calculating keyword matches and skills alignment</p>
              <p>• Generating personalized improvement suggestions</p>
            </>
          )}
          {currentStep === 'results' && (
            <>
              <p>• Review your ATS compatibility score</p>
              <p>• See detailed breakdown of matching criteria</p>
              <p>• Get actionable recommendations to improve your resume</p>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;