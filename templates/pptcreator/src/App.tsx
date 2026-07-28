import React, { useState, useEffect } from 'react';
import { Presentation } from './components/Presentation';
import { SavePanel } from './components/SavePanel';
import { UploadPanel } from './components/UploadPanel';
import { PDFViewer } from './components/PDFViewer';
import { Toaster } from 'react-hot-toast';
import { FileText, Download, Upload as UploadIcon, Save as SaveIcon, Cpu } from 'lucide-react';
import toast from 'react-hot-toast';

export default function App() {
  const [currentView, setCurrentView] = useState<'presentation' | 'save' | 'upload'>('presentation');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showSavePanel, setShowSavePanel] = useState(false);
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleUploadComplete = (file: File, slideNumber: number) => {
    setUploadedFile(file);
    setShowUploadPanel(false);
    toast.success(`File ${file.name} uploaded successfully!`);

    if (file.type === 'application/pdf') {
      setShowPDFViewer(true);
    }
  };

  const handleSaveComplete = async (data: { title: string; fileType: 'pdf' | 'image' | 'both' }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Saving presentation:', data);
    toast.success(`Presentation saved as ${data.title} (${data.fileType})`);
    setShowSavePanel(false);
  };

  const handlePDFUpload = (file: File) => {
    setUploadedFile(file);
    setShowPDFViewer(true);
    toast.success(`PDF loaded: ${file.name}`);
  };

  const generatePresentationFromPrompt = async (prompt: string) => {
    setIsGenerating(true);

    const generatedSlides = [
      {
        number: 1,
        title: prompt.split('.')[0] || 'Generated Title',
        content: prompt
      },
      {
        number: 2,
        title: "Introduction",
        content: "This slide was generated based on your prompt: " + prompt
      },
      {
        number: 3,
        title: "Key Points",
        content: "Expanding on the main concepts from your input..." + '\n\n' + '- Point 1: Major insight\n- Point 2: Secondary insight\n- Point 3: Supporting detail'
      }
    ];

    const updateEvent = new CustomEvent('generateSlides', {
      detail: generatedSlides
    });
    window.dispatchEvent(updateEvent);

    toast.success('Presentation generated from your prompt!');
    setIsGenerating(false);
  };

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      window.location.reload();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const promptFromUrl = urlParams.get('prompt');
    if (promptFromUrl && !promptText) {
      setPromptText(promptFromUrl);
      generatePresentationFromPrompt(promptFromUrl);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster
        position="top-right"
        toastOptions={{ duration: 3000 }}
      />

      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">PPT</span>
            <span className="text-2xl font-bold text-purple-600">Creator</span>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => setCurrentView('upload')}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <UploadIcon className="w-4 h-4" />
              <span>Upload</span>
            </button>
            <button
              onClick={() => setShowSavePanel(true)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <SaveIcon className="w-4 h-4" />
              <span>Save</span>
            </button>
            <button
              onClick={() => setCurrentView('save')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={() => setShowUploadPanel(true)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <UploadIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowSavePanel(true)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <SaveIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {currentView === 'presentation' && <Presentation />}
      </main>

      <SavePanel
        isOpen={showSavePanel}
        onClose={() => setShowSavePanel(false)}
        onSave={handleSaveComplete}
      />

      <UploadPanel
        isOpen={showUploadPanel || currentView === 'upload'}
        onClose={() => {
          setShowUploadPanel(false);
          setCurrentView('presentation');
        }}
        onUpload={handleUploadComplete}
        currentSlide={1}
      />

      <PDFViewer
        file={uploadedFile}
        onClose={() => setShowPDFViewer(false)}
      />

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">PPTCreator</span>
            </div>
            <div className="text-sm text-gray-600">
              © 2024 PPTCreator - Make beautiful presentations
            </div>
          </div>
        </div>
      </footer>

      <div className="fixed bottom-4 right-4 bg-white rounded-2xl shadow-lg p-4 max-w-md z-30">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">AI Prompt Input</h3>
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="e.g., Create a presentation about renewable energy..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && promptText.trim()) {
                  e.preventDefault();
                  generatePresentationFromPrompt(promptText);
                }
              }
            />
            <button
              onClick={() => {
                if (promptText.trim()) {
                  generatePresentationFromPrompt(promptText);
                }
              }}
              disabled={isGenerating || !promptText.trim()}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? 'Generating...' : 'Generate'}
            </button>
          </div>
          {promptText && (
            <div className="text-xs text-gray-500">
              Enter a prompt to generate a presentation with AI
            </div>
          )}
        </div>
      </div>
    </div>
  );
}