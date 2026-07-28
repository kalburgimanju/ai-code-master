"""
Component to display resume analysis results.
"""

import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFileUpload, FaDownload, FaCheck, FaTimes, FaLightbulb } from 'react-icons/fa';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ScoreBreakdown {
  keywordMatch: number;
  skillsAlignment: number;
  experienceMatch: number;
  educationMatch: number;
  grammarScore: number;
  completenessScore: number;
}

interface AnalysisResult {
  atsScore: number;
  scoreBreakdown: ScoreBreakdown;
  extractedSkills: string[];
  extractedExperience: string[];
  extractedEducation: string[];
  missingKeywords: string[];
  suggestedSkills: string[];
  improvements: string[];
  strongestMatches: string[];
  strengths: string[];
  weaknesses: string[];
  analysisDate: string;
  processingTime: number;
}

interface AnalysisResultsProps {
  result: AnalysisResult;
  onExport?: () => void;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result, onExport }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const barChartData = {
    labels: [
      'Keyword Match',
      'Skills Alignment',
      'Experience Match',
      'Education Match',
      'Grammar Score',
      'Completeness Score'
    ],
    datasets: [
      {
        label: 'Score',
        data: [
          result.scoreBreakdown.keywordMatch,
          result.scoreBreakdown.skillsAlignment,
          result.scoreBreakdown.experienceMatch,
          result.scoreBreakdown.educationMatch,
          result.scoreBreakdown.grammarScore,
          result.scoreBreakdown.completenessScore
        ],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgba(99, 102, 241, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(251, 146, 60, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2,
      }
    ]
  };

  const doughnutData = {
    labels: ['Passed', 'Remaining'],
    datasets: [
      {
        data: [result.atsScore, 100 - result.atsScore],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(229, 231, 235, 0.8)'
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(229, 231, 235, 1)'
        ],
        borderWidth: 1,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value: any) => `${value}%`
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `Score: ${context.raw}%`
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.raw;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${percentage}%`;
          }
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Results</h2>
          <p className="text-gray-600">Analyzed on {new Date(result.analysisDate).toLocaleDateString()}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold" style={{ color: getScoreColor(result.atsScore) }}>
            {result.atsScore}
          </div>
          <div className="text-sm text-gray-600">ATS Score</div>
          <div className="text-xs text-gray-500" style={{ color: getScoreColor(result.atsScore) }}>
            {getScoreLabel(result.atsScore)}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {['overview', 'keywords', 'improvements', 'details'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Breakdown</h3>
                <div className="h-64">
                  <Bar data={barChartData} options={chartOptions} />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Score</h3>
                <div className="h-64 flex items-center justify-center">
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                </div>
              </div>
            </div>

            {/* Strengths and Weaknesses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                  <FaCheck className="mr-2" /> Strengths
                </h3>
                {result.strengths.length > 0 ? (
                  <ul className="space-y-2">
                    {result.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-sm text-green-800">{strength}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-600">No significant strengths identified.</p>
                )}
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-900 mb-3 flex items-center">
                  <FaTimes className="mr-2" /> Areas for Improvement
                </h3>
                {result.weaknesses.length > 0 ? (
                  <ul className="space-y-2">
                    {result.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-sm text-red-800">{weakness}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-600">No significant weaknesses identified.</p>
                )}
              </div>
            </div>

            {/* Key Skills and Matches */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Strongest Keyword Matches</h3>
                <div className="flex flex-wrap gap-2">
                  {result.strongestMatches.slice(0, 10).map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-900 mb-3">Suggested Skills to Add</h3>
                <div className="flex flex-wrap gap-2">
                  {result.suggestedSkills.slice(0, 8).map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'keywords' && (
          <motion.div
            key="keywords"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Missing Keywords */}
            <div className="bg-red-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-900 mb-3">Missing Keywords (Job Required)</h3>
              <div className="flex flex-wrap gap-2">
                {result.missingKeywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-sm font-medium"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Consider including these keywords in your resume to improve matching.
              </p>
            </div>

            {/* Extracted Skills */}
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-900 mb-3">Skills Extracted from Resume</h3>
              <div className="flex flex-wrap gap-2">
                {result.extractedSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'improvements' && (
          <motion.div
            key="improvements"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center">
                <FaLightbulb className="mr-2" /> Improvement Suggestions
              </h3>
              <ol className="space-y-3">
                {result.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-yellow-200 text-yellow-900 rounded-full text-sm font-medium flex items-center justify-center mr-3">
                      {index + 1}
                    </span>
                    <span className="text-sm text-yellow-800">{improvement}</span>
                  </li>
                ))}
              </ol>
            </div>
          </motion.div>
        )}

        {activeTab === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Experience Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Extracted Experience</h3>
              {result.extracted_experience.length > 0 ? (
                <ul className="space-y-2">
                  {result.extracted_experience.map((exp, index) => (
                    <li key={index} className="text-sm text-gray-700 pl-4 border-l-2 border-gray-300">
                      {exp}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-600">No experience details extracted.</p>
              )}
            </div>

            {/* Education Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Extracted Education</h3>
              {result.extracted_education.length > 0 ? (
                <ul className="space-y-2">
                  {result.extracted_education.map((edu, index) => (
                    <li key={index} className="text-sm text-gray-700 pl-4 border-l-2 border-gray-300">
                      {edu}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-600">No education details extracted.</p>
              )}
            </div>

            {/* Analysis Metadata */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Analysis Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Processing Time:</span> {result.processingTime.toFixed(2)} seconds
                </div>
                <div>
                  <span className="font-medium">Analysis Date:</span> {new Date(result.analysisDate).toLocaleString()}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Button */}
      {onExport && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onExport}
            className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FaDownload className="mr-2" />
            Export Results
          </button>
        </div>
      )}
    </div>
  );
};

export default AnalysisResults;