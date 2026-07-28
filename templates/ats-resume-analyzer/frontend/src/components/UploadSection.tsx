"""
Component for resume and job description upload.
"""

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUpload, FaFilePdf, FaFileWord, FaFileAlt, FaTimes, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';

interface UploadSectionProps {
  onAnalysisComplete: (result: any) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({
  onAnalysisComplete,
  isLoading,
  setIsLoading
}) => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [positionLevel, setPositionLevel] = useState<string>('auto');
  const [error, setError] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles[0]) {
      const file = acceptedFiles[0];

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      // Validate file type
      const validTypes = ['application/pdf', 'application/msword',
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                         'text/plain'];
      if (!validTypes.includes(file.type)) {
        setError('File type must be PDF, DOC, DOCX, or TXT');
        return;
      }

      setResumeFile(file);
      setError('');

      // Create preview URL for PDF files
      if (file.type === 'application/pdf') {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  const handleRemoveFile = () => {
    setResumeFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
  };

  const handleAnalyze = async () => {
    if (!resumeFile || !jobDescription.trim()) {
      setError('Please upload a resume file and enter a job description');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('job_description', jobDescription);
      formData.append('position_level', positionLevel);

      const response = await axios.post('/api/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      });

      onAnalysisComplete(response.data);

    } catch (err: any) {
      if (err.response) {
        setError(err.response.data?.message || 'Error analyzing resume');
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'application/pdf':
        return <FaFilePdf className="text-red-500" size={32} />;
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return <FaFileWord className="text-blue-500" size={32} />;
      default:
        return <FaFileAlt className="text-green-500" size={32} />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload & Analyze</h2>

      {/* Resume Upload */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Resume File (PDF, DOC, DOCX, TXT) - Max 10MB
        </label>

        <div
          {...getRootProps()}
          className={`\n            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors\n            ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'}\n            ${error ? 'border-red-500 bg-red-50' : ''}\n          `}
        >
          <input {...getInputProps()} />

          {resumeFile ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                {getFileIcon(resumeFile.type)}
                <div className="text-left">
                  <p className="font-medium text-gray-900">{resumeFile.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(resumeFile.size)}</p>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
                className="p-2 text-gray-500 hover:text-red-500 transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </motion.div>
          ) : isDragActive ? (
            <div className="text-indigo-500">
              <FaUpload size={48} className="mx-auto mb-4" />
              <p>Drop your file here...</p>
            </div>
          ) : (
            <div>
              <FaUpload size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-2">
                <span className="font-medium text-indigo-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-sm text-gray-500">PDF, DOC, DOCX or TXT files</p>
            </div>
          )}
        </div>

        {previewUrl && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">PDF Preview:</p>
            <iframe
              src={previewUrl}
              className="w-full h-64 rounded border"
              title="PDF Preview"
            />
          </div>
        )}

        {error && (
          <div className="mt-2 flex items-center text-red-600 text-sm">
            <FaInfoCircle className="mr-2" />
            {error}
          </div>
        )}
      </div>

      {/* Job Description */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Description *
        </label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          rows={8}
          maxLength={5000}
        />
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-gray-500">Minimum 50 characters recommended</p>
          <p className="text-sm text-gray-500">{jobDescription.length}/5000</p>
        </div>
      </div>

      {/* Position Level */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Position Level
        </label>
        <select
          value={positionLevel}
          onChange={(e) => setPositionLevel(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="auto">Auto-detect</option>
          <option value="junior">Junior (Entry Level)</option>
          <option value="mid">Mid-Level</option>
          <option value="senior">Senior</option>
          <option value="director">Director</option>
          <option value="executive">Executive</option>
        </select>
      </div>

      {/* Analyze Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleAnalyze}
        disabled={!resumeFile || !jobDescription.trim() || isLoading}
        className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${!resumeFile || !jobDescription.trim() || isLoading
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800'
          }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Analyzing...
          </div>
        ) : (
          'Analyze Resume'
        )}
      </motion.button>
    </div>
  );
};

export default UploadSection;