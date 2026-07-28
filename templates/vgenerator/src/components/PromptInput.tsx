import { useState } from 'react';
import { Sparkles, Settings2, Wand2 } from 'lucide-react';
import type { VideoSettings } from '../types';

interface PromptInputProps {
  onSubmit: (topic: string, script: string, settings: VideoSettings) => void;
  settings: VideoSettings;
  onSettingsChange: (s: VideoSettings) => void;
  isGenerating: boolean;
}

export default function PromptInput({ onSubmit, settings, onSettingsChange, isGenerating }: PromptInputProps) {
  const [topic, setTopic] = useState('');
  const [script, setScript] = useState('');
  const [useCustomScript, setUseCustomScript] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onSubmit(topic.trim(), script.trim(), settings);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Topic Input */}
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1.5">
          Video Topic
        </label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Complete PyTorch Guide, How AI is changing everyday life..."
          rows={3}
          className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none focus:border-finance-500 transition-all resize-none"
          disabled={isGenerating}
        />
      </div>

      {/* Custom Script Toggle */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setUseCustomScript(!useCustomScript)}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
            useCustomScript
              ? 'bg-finance-600/20 text-finance-400 border border-finance-500/30'
              : 'text-dark-400 hover:text-dark-300 border border-dark-700'
          }`}
        >
          <Wand2 className="w-3.5 h-3.5" />
          Custom Script
        </button>
      </div>

      {/* Custom Script Textarea */}
      {useCustomScript && (
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-1.5">
            Video Script (optional — leave blank for AI-generated)
          </label>
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="Write your own script here, or leave blank and the AI will generate one..."
            rows={5}
            className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none focus:border-finance-500 transition-all resize-none"
            disabled={isGenerating}
          />
        </div>
      )}

      {/* Settings Toggle */}
      <button
        type="button"
        onClick={() => setShowSettings(!showSettings)}
        className="flex items-center gap-1.5 text-xs font-medium text-dark-400 hover:text-dark-300 transition-colors"
      >
        <Settings2 className="w-3.5 h-3.5" />
        {showSettings ? 'Hide Settings' : 'Show Settings'}
      </button>

      {/* Settings Panel */}
      {showSettings && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-dark-900/50 border border-dark-800 rounded-xl">
          {/* Voice */}
          <div>
            <label className="block text-xs font-medium text-dark-400 mb-1">Voice</label>
            <select
              value={settings.voiceName}
              onChange={(e) => onSettingsChange({ ...settings, voiceName: e.target.value })}
              className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-xs text-white focus:outline-none focus:border-finance-500"
              disabled={isGenerating}
            >
              <option value="en-IN-NeerjaNeural-Female">Indian English Female (Neerja)</option>
              <option value="en-IN-PallaviNeural-Female">Indian English Female (Pallavi)</option>
              <option value="en-US-JennyNeural-Female">US English Female (Jenny)</option>
              <option value="en-US-GuyNeural-Male">US English Male (Guy)</option>
              <option value="en-GB-SoniaNeural-Female">UK English Female (Sonia)</option>
            </select>
          </div>

          {/* Video Source */}
          <div>
            <label className="block text-xs font-medium text-dark-400 mb-1">Video Source</label>
            <select
              value={settings.videoSource}
              onChange={(e) => onSettingsChange({ ...settings, videoSource: e.target.value as 'pexels' | 'pixabay' | 'coverr' | 'local' })}
              className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-xs text-white focus:outline-none focus:border-finance-500"
              disabled={isGenerating}
            >
              <option value="pexels">Pexels</option>
              <option value="pixabay">Pixabay</option>
              <option value="coverr">Coverr</option>
              <option value="local">Local Files</option>
            </select>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="block text-xs font-medium text-dark-400 mb-1">Aspect Ratio</label>
            <select
              value={settings.aspectRatio}
              onChange={(e) => onSettingsChange({ ...settings, aspectRatio: e.target.value as '9:16' | '16:9' | '1:1' })}
              className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-xs text-white focus:outline-none focus:border-finance-500"
              disabled={isGenerating}
            >
              <option value="9:16">Portrait 9:16 (TikTok/Reels)</option>
              <option value="16:9">Landscape 16:9 (YouTube)</option>
              <option value="1:1">Square 1:1 (Instagram)</option>
            </select>
          </div>

          {/* Background Music */}
          <div>
            <label className="block text-xs font-medium text-dark-400 mb-1">Background Music</label>
            <select
              value={settings.bgmType}
              onChange={(e) => onSettingsChange({ ...settings, bgmType: e.target.value as 'none' | 'random' | 'custom' })}
              className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-xs text-white focus:outline-none focus:border-finance-500"
              disabled={isGenerating}
            >
              <option value="random">Random BGM</option>
              <option value="none">No BGM</option>
              <option value="custom">Custom BGM</option>
            </select>
          </div>

          {/* Subtitles */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-dark-400">Subtitles</label>
            <button
              type="button"
              onClick={() => onSettingsChange({ ...settings, subtitleEnabled: !settings.subtitleEnabled })}
              className={`relative w-10 h-5 rounded-full transition-all ${
                settings.subtitleEnabled ? 'bg-finance-600' : 'bg-dark-700'
              }`}
              disabled={isGenerating}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                  settings.subtitleEnabled ? 'left-5' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!topic.trim() || isGenerating}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-finance-600 to-prop-600 hover:from-finance-500 hover:to-prop-500 disabled:from-dark-800 disabled:to-dark-800 disabled:text-dark-500 text-white font-medium rounded-xl transition-all disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate Video
          </>
        )}
      </button>
    </form>
  );
}
