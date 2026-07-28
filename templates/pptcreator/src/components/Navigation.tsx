import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NavigationProps {
  onNext: () => void;
  onPrevious: () => void;
  currentSlide: number;
  totalSlides: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  onNext,
  onPrevious,
  currentSlide,
  totalSlides,
}) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Slide {currentSlide} of {totalSlides}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onPrevious}
              disabled={currentSlide <= 1}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={onNext}
              disabled={currentSlide >= totalSlides}
              className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};