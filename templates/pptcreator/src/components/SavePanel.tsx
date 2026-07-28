import React, { useState } from 'react';
import { X, Download, Save, FileText, Image as ImageIcon, Check, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface SavePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; fileType: 'pdf' | 'image' | 'both' }) => void;
}

export const SavePanel: React.FC<SavePanelProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState('My Presentation');
  const [fileType, setFileType] = useState<'pdf' | 'image' | 'both'>('pdf');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSave = async () => {
    if (!title.trim()) return;

    setIsSaving(true);
    setSaveStatus('idle');

    try {
      await onSave({ title, fileType });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Save failed:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('error'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Save className="w-5 h-5 mr-2" />
            Save Presentation
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Presentation Title
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter presentation title..."
                error={!title.trim() ? 'Title is required' : ''}
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setFileType('pdf')}
                  className={`p-3 rounded-lg border-2 transition-all
                    ${fileType === 'pdf'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'}
                  `}
                >
                  <AlertCircle className="w-6 h-6 mx-auto mb-1" />
                  <span className="text-sm font-medium">PDF</span>
                </button>

                <button
                  onClick={() => setFileType('image')}
                  className={`p-3 rounded-lg border-2 transition-all
                    ${fileType === 'image'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'}
                  `}
                >
                  <ImageIcon className="w-6 h-6 mx-auto mb-1" />
                  <span className="text-sm font-medium">Image</span>
                </button>

                <button
                  onClick={() => setFileType('both')}
                  className={`p-3 rounded-lg border-2 transition-all
                    ${fileType === 'both'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'}
                  `}
                >
                  <Download className="w-6 h-6 mx-auto mb-1" />
                  <span className="text-sm font-medium">Both</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {saveStatus === 'success' && (
                <span className="flex items-center text-green-600">
                  <Check className="w-4 h-4 mr-1" />
                  Saved successfully!
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="flex items-center text-red-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Save failed. Please try again.
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || !title.trim()}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};