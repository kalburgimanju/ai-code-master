import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon, Check, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface UploadPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, slideNumber: number) => void;
  currentSlide: number;
}

export const UploadPanel: React.FC<UploadPanelProps> = ({
  isOpen,
  onClose,
  onUpload,
  currentSlide
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({
    '.ppt': 0,
    '.pptx': 0,
    '.pdf': 0,
    '.png': 0,
    '.jpg': 0,
    '.jpeg': 0,
    '.svg': 0
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = [
    'presentation/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-powerpoint',
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/svg+xml'
  ];

  const acceptedExtensions = ['.ppt', '.pptx', '.pdf', '.png', '.jpg', '.jpeg', '.svg'];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const simulateUpload = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension) return;

    const key = `.${extension}`;
    if (!uploadProgress[key]) return;

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(prev => ({
        ...prev,
        [key]: progress
      }));

      if (progress >= 100) {
        clearInterval(interval);
        onUpload(file, currentSlide);
        setTimeout(() => {
          setUploadProgress(prev => ({
            ...prev,
            [key]: 0
          }));
        }, 2000);
      }
    }, 300);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      simulateUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      simulateUpload(e.dataTransfer.files[0]);
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'ppt':
      case 'pptx':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'pdf':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
        return <ImageIcon className="w-5 h-5 text-green-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Upload Presentation</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200
              ${isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Drop files here</h3>
            <p className="text-gray-600 mb-4">or</p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="mb-4"
            >
              Choose Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedExtensions.join(',')}
              onChange={handleFileUpload}
              className="hidden"
            />
            <p className="text-sm text-gray-500">
              Accepted: {acceptedExtensions.join(', ')} (max 50MB)
            </p>
          </div>

          {(Object.entries(uploadProgress).some(([_, progress]) => progress > 0) && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Upload Progress</h3>
              {Object.entries(uploadProgress).map(([extension, progress]) => (
                progress > 0 && (
                  <div key={extension} className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600 flex items-center">
                        {getFileIcon(extension)}
                        <span className="ml-2">{extension}</span>
                      </span>
                      <span className="text-sm text-gray-500">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};