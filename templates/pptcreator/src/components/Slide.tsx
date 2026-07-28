import React from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Upload as UploadIcon } from 'lucide-react';
import { Button } from './ui/Button';

interface SlideProps {
  slideNumber: number;
  title: string;
  content: string;
  isActive?: boolean;
  onUpload?: (file: File) => void;
  showUploadPrompt?: boolean;
}

export const Slide: React.FC<SlideProps> = ({
  slideNumber,
  title,
  content,
  isActive = false,
  onUpload,
  showUploadPrompt = false
}) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onUpload) {
      onUpload(e.target.files[0]);
    }
  };

  const handleUploadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.ppt,.pptx,.pdf,.png,.jpg,.jpeg,.svg';
    fileInput.onchange = handleFileUpload;
    fileInput.click();
  };

  return (
    <motion.div
      className={`absolute inset-0 w-full h-screen p-8 flex flex-col transition-all duration-500
        ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}
        ${showUploadPrompt ? 'border-2 border-dashed border-gray-300 bg-gray-50' : ''}
      `}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.95 }}
      transition={{ duration: 0.4 }}
    >
      {showUploadPrompt ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <UploadIcon className="w-12 h-12 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-2">Upload your presentation</p>
          <p className="text-sm text-gray-400">Drag & drop or click to browse</p>
          <input
            type="file"
            accept=".ppt,.pptx,.pdf,.png,.jpg,.jpeg,.svg"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {slideNumber === 1 && (
            <div className="flex items-center justify-center flex-1">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">{content}</p>
              </div>
            </div>
          )}
          {slideNumber > 1 && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">{title}</h2>
                  <div className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                    {content}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-8">
        <div className="text-sm text-gray-500">
          Slide {slideNumber}
        </div>
        <div className="flex items-center space-x-2">
          {slideNumber === 1 && (
            <div className="flex items-center text-sm text-blue-600">
              <FileText className="w-4 h-4 mr-1" />
              Title Slide
            </div>
          )}
          {slideNumber > 1 && (
            <div className="flex items-center text-sm text-green-600">
              <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
              Content Slide
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleUploadClick}
            className="ml-4"
          >
            <Upload className="w-4 h-4 mr-1" /> Upload
          </Button>
        </div>
      </div>
    </motion.div>
  );
};