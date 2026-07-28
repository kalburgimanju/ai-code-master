import React, { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { Slide } from './Slide';
import { motion, AnimatePresence } from 'framer-motion';
import { PanelLeft, Maximize2, Minimize2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface SlideData {
  number: number;
  title: string;
  content: string;
}

export const Presentation: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [slides, setSlides] = useState<SlideData[]>([
    { number: 1, title: "Welcome to Presentation", content: "A beautiful presentation created with PPTCreator" },
    { number: 2, title: "Getting Started", content: "Use navigation buttons to move between slides" },
    { number: 3, title: "Upload Feature", content: "Click on any slide to upload your presentation files" },
    { number: 4, title: "Full Screen", content: "Press the maximize button to enter fullscreen mode" },
    { number: 5, title: "Save & Export", content: "Download your presentation as a PDF or image" }
  ]);

  const totalSlides = slides.length;

  const handleNext = () => {
    if (currentSlide < totalSlides) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 1) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleUpload = (file: File) => {
    setUploadedFile(file);
    toast.success(`File ${file.name} uploaded successfully!`);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        handleNext();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        handlePrevious();
        break;
      case 'f':
        if (e.ctrlKey) {
          e.preventDefault();
          toggleFullscreen();
        }
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  const currentSlideData = slides.find(slide => slide.number === currentSlide) || slides[0];

  // Listen for AI-generated slides
  useEffect(() => {
    const handleGenerateSlides = (event: Event) => {
      const customEvent = event as CustomEvent<SlideData[]>;
      const generatedSlides = customEvent.detail;
      setSlides(generatedSlides);
      if (currentSlide !== 1) {
        setCurrentSlide(1);
      }
    };

    window.addEventListener('generateSlides', handleGenerateSlides);

    return () => window.removeEventListener('generateSlides', handleGenerateSlides);
  }, [currentSlide]);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}
    >
      <Navigation
        onNext={handleNext}
        onPrevious={handlePrevious}
        currentSlide={currentSlide}
        totalSlides={totalSlides}
      />

      <main className={`pt-20 transition-all duration-300 ${isPanelOpen ? 'ml-64' : 'ml-0'}`}
      >
        <div className="max-w-7xl mx-auto px-8">
          <AnimatePresence mode="wait">
            {slides.map((slide) => (
              <Slide
                key={slide.number}
                slideNumber={slide.number}
                title={slide.title}
                content={slide.content}
                isActive={slide.number === currentSlide}
                onUpload={handleUpload}
                showUploadPrompt={slide.number === currentSlide && currentSlide > 1}
              />
            ))}
          </AnimatePresence>

          <div className="mt-8 mb-16 flex justify-center items-center space-x-4">
            <button
              onClick={() => setIsPanelOpen(!isPanelOpen)}
              className="p-2 rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow"
            >
              {isPanelOpen ? <Minimize2 className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </main>

      {uploadedFile && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-40">
          <span className="text-sm">Uploaded: {uploadedFile.name}</span>
        </div>
      )}
    </div>
  );
};