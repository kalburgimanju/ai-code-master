'use client';

import { useState } from 'react';
import { useStore } from '@/store';
import { v4 as uuid } from 'uuid';
import { FileText, Plus, Trash2, Edit3, Save, X } from 'lucide-react';

export default function ScriptsPanel() {
  const { currentProject, addScript } = useStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('en');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const scripts = currentProject?.scripts || [];

  function handleAddScript() {
    if (!title.trim() || !content.trim()) return;
    addScript({
      id: uuid(),
      projectId: currentProject?.id || '',
      title: title.trim(),
      content: content.trim(),
      language,
      createdAt: new Date().toISOString(),
    });
    setTitle('');
    setContent('');
  }

  function handleDownload(script: typeof scripts[0]) {
    const blob = new Blob([script.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${script.title.replace(/\s+/g, '_').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Add Script Form */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-400" />
          New Script
        </h3>
        <div className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            placeholder="Script title..."
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="input-field min-h-[150px] resize-y font-mono text-sm"
            placeholder="Write your script here... This will be used by the TTS agent to generate voiceovers and by the video agent to create scenes."
          />
          <div className="flex items-center gap-3">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="input-field w-auto"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="hi">Hindi</option>
              <option value="ja">Japanese</option>
              <option value="pt">Portuguese</option>
            </select>
            <button onClick={handleAddScript} className="btn-primary ml-auto flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Script
            </button>
          </div>
        </div>
      </div>

      {/* Script List */}
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">
          Scripts ({scripts.length})
        </h3>
        {scripts.length === 0 ? (
          <div className="card text-center py-10">
            <FileText className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No scripts yet. Add one above to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {scripts.map((script) => (
              <div key={script.id} className="card">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-white">{script.title}</h4>
                    <span className="badge-blue text-xs mt-1">{script.language.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDownload(script)}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      Download
                    </button>
                  </div>
                </div>
                {editingId === script.id ? (
                  <div className="mt-3">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="input-field min-h-[100px] resize-y font-mono text-sm"
                    />
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => setEditingId(null)} className="btn-secondary text-xs py-1">
                        <X className="w-3 h-3 inline mr-1" />Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm mt-2 line-clamp-3 whitespace-pre-wrap">
                    {script.content}
                  </p>
                )}
                <p className="text-xs text-gray-600 mt-2">
                  {new Date(script.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
