'use client';

import { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

interface UploadFormProps {
  videoBlob: Blob;
  channelId: string;
  onSuccess: (youtubeUrl: string) => void;
}

export default function UploadForm({ videoBlob, channelId, onSuccess }: UploadFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'unlisted' | 'private'>('private');
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      const file = new File([videoBlob], `recording-${Date.now()}.webm`, { type: 'video/webm' });
      formData.append('video', file);
      formData.append('metadata', JSON.stringify({
        title: title.trim(),
        description: description.trim(),
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        privacy,
        channelId,
      }));

      const res = await fetch('/api/youtube/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadedUrl(data.youtubeUrl);
      onSuccess(data.youtubeUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  if (uploadedUrl) {
    return (
      <div className="bg-white rounded-2xl border border-neon-200 p-6">
        <div className="flex items-start gap-3">
          <CheckCircle size={20} className="text-neon-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-dark-900">Upload Successful</h3>
            <p className="text-xs text-dark-400 mt-1">Your video has been uploaded to YouTube.</p>
            <a
              href={uploadedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
            >
              <ExternalLink size={14} />
              Watch on YouTube
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-dark-200 overflow-hidden">
      <div className="p-4 border-b border-dark-100">
        <h3 className="text-sm font-semibold text-dark-900">Upload to YouTube</h3>
        <p className="text-xs text-dark-400 mt-0.5">Add a title and description for your video.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-fire-50 border border-fire-200">
            <AlertCircle size={16} className="text-fire-500 mt-0.5 shrink-0" />
            <p className="text-xs text-fire-700">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-xs font-medium text-dark-700 mb-1.5">
            Title <span className="text-fire-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My awesome video"
            required
            maxLength={100}
            className="w-full px-3 py-2 rounded-xl border border-dark-200 bg-white text-sm text-dark-900 placeholder:text-dark-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
          />
          <p className="mt-1 text-xs text-dark-400 text-right">{title.length}/100</p>
        </div>

        <div>
          <label htmlFor="description" className="block text-xs font-medium text-dark-700 mb-1.5">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell viewers about your video..."
            rows={3}
            maxLength={5000}
            className="w-full px-3 py-2 rounded-xl border border-dark-200 bg-white text-sm text-dark-900 placeholder:text-dark-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none"
          />
          <p className="mt-1 text-xs text-dark-400 text-right">{description.length}/5000</p>
        </div>

        <div>
          <label htmlFor="tags" className="block text-xs font-medium text-dark-700 mb-1.5">
            Tags
          </label>
          <input
            id="tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="technology, tutorial, demo (comma separated)"
            className="w-full px-3 py-2 rounded-xl border border-dark-200 bg-white text-sm text-dark-900 placeholder:text-dark-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-dark-700 mb-2">Visibility</label>
          <div className="flex gap-2">
            {(['private', 'unlisted', 'public'] as const).map((option) => (
              <label
                key={option}
                className={`flex-1 flex items-center justify-center px-3 py-2 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                  privacy === option
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-dark-200 bg-white text-dark-500 hover:border-dark-300'
                }`}
              >
                <input
                  type="radio"
                  name="privacy"
                  value={option}
                  checked={privacy === option}
                  onChange={(e) => setPrivacy(e.target.value as typeof privacy)}
                  className="sr-only"
                />
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading || !title.trim()}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-fire-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-brand-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload size={18} />
              Upload to YouTube
            </>
          )}
        </button>
      </form>
    </div>
  );
}
