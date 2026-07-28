import { useState, useEffect, useCallback } from 'react';
import { Sparkles, History, Clock, XCircle, Loader2, FileVideo, Play, Trash2 } from 'lucide-react';
import type { VideoProject, VideoSettings } from './types/index';
import { DEFAULT_SETTINGS } from './types/index';
import { videoStore } from './services/videoStore';
import PromptInput from './components/PromptInput';
import GenerationProgress from './components/GenerationProgress';
import VideoPreview from './components/VideoPreview';
import VideoCard from './components/VideoCard';

function generateId(): string {
  return `vid_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

export default function App() {
  const [projects, setProjects] = useState<VideoProject[]>([]);
  const [settings, setSettings] = useState<VideoSettings>(DEFAULT_SETTINGS);
  const [currentProject, setCurrentProject] = useState<VideoProject | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [view, setView] = useState<'generator' | 'history'>('generator');
  const [generationQueue, setGenerationQueue] = useState<string[]>([]);

  // Load projects from localStorage on mount
  useEffect(() => {
    const stored = videoStore.getAll();
    setProjects(stored);
    if (stored.length > 0) {
      setCurrentProject(stored[0]);
    }
  }, []);

  // Poll task status for running/pending projects
  const pollTask = useCallback(async (projectId: string) => {
    const project = videoStore.getById(projectId);
    if (!project || project.status === 'completed' || project.status === 'failed') return;

    try {
      const res = await fetch(`/api/task/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        const updates: Partial<VideoProject> = {
          status: data.status,
          progress: data.progress || 0,
          stage: data.stage || '',
        };

        if (data.video_file) {
          updates.videoFile = data.video_file;
          updates.taskDir = data.task_dir;
        }
        if (data.audio_duration) {
          updates.audioDuration = data.audio_duration;
        }
        if (data.error) {
          updates.error = data.error;
        }

        videoStore.update(projectId, updates);
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates } : p));
        setCurrentProject(prev => prev?.id === projectId ? { ...prev, ...updates } : prev);

        if (data.status === 'completed' || data.status === 'failed') {
          setIsGenerating(false);
          setGenerationQueue(q => q.filter(id => id !== projectId));
        } else {
          // Continue polling
          setTimeout(() => pollTask(projectId), 2000);
        }
      }
    } catch {
      setTimeout(() => pollTask(projectId), 3000);
    }
  }, []);

  const handleGenerate = async (topic: string, script: string, videoSettings: VideoSettings) => {
    setIsGenerating(true);

    const project: VideoProject = {
      id: generateId(),
      topic,
      script,
      settings: videoSettings,
      status: 'generating',
      progress: 5,
      stage: 'script',
      createdAt: new Date().toISOString(),
    };

    videoStore.add(project);
    setProjects(prev => [project, ...prev]);
    setCurrentProject(project);
    setGenerationQueue(q => [...q, project.id]);

    try {
      // Submit to backend
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          script: script || undefined,
          settings: videoSettings,
          projectId: project.id,
        }),
      });

      if (res.ok) {
        // Start polling
        setTimeout(() => pollTask(project.id), 2000);
      } else {
        const errData = await res.json().catch(() => ({}));
        const error = errData.error || `Server error: ${res.status}`;
        videoStore.update(project.id, { status: 'failed', error });
        setProjects(prev => prev.map(p => p.id === project.id ? { ...p, status: 'failed', error } : p));
        setCurrentProject(prev => prev?.id === project.id ? { ...prev, status: 'failed', error } : prev);
        setIsGenerating(false);
        setGenerationQueue(q => q.filter(id => id !== project.id));
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : 'Failed to connect to server';
      videoStore.update(project.id, { status: 'failed', error });
      setProjects(prev => prev.map(p => p.id === project.id ? { ...p, status: 'failed', error } : p));
      setCurrentProject(prev => prev?.id === project.id ? { ...prev, status: 'failed', error } : prev);
      setIsGenerating(false);
      setGenerationQueue(q => q.filter(id => id !== project.id));
    }
  };

  const handleRegenerate = (project: VideoProject) => {
    handleGenerate(project.topic, project.script, project.settings);
  };

  const handleDelete = (id: string) => {
    videoStore.delete(id);
    setProjects(prev => prev.filter(p => p.id !== id));
    setCurrentProject(prev => prev?.id === id ? (projects.length > 1 ? projects.find(p => p.id !== id) || null : null) : prev);
  };

  const handleSelectProject = (project: VideoProject) => {
    setCurrentProject(project);
    setView('generator');
  };

  return (
    <div className="flex h-screen bg-dark-950 text-dark-200">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-900/90 border-r border-dark-800 flex flex-col shrink-0">
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-dark-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-finance-500 to-prop-500 flex items-center justify-center">
            <FileVideo className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-white">VGenerator</span>
            <span className="text-[10px] text-dark-500 block leading-tight">AI Video Generator</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          <button
            onClick={() => setView('generator')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              view === 'generator'
                ? 'bg-finance-600/20 text-finance-400 border border-finance-500/20'
                : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800 border border-transparent'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Generator
          </button>
          <button
            onClick={() => setView('history')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              view === 'history'
                ? 'bg-finance-600/20 text-finance-400 border border-finance-500/20'
                : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800 border border-transparent'
            }`}
          >
            <History className="w-4 h-4" />
            History
            {projects.length > 0 && (
              <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-dark-800 text-dark-400">
                {projects.length}
              </span>
            )}
          </button>
        </nav>

        {/* Bottom section */}
        <div className="p-3 border-t border-dark-800">
          <a
            href="https://github.com/harry0703/MoneyPrinterTurbo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-dark-500 hover:text-dark-300 hover:bg-dark-800 transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            MoneyPrinterTurbo
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-dark-800 bg-dark-900/60 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-white">
              {view === 'generator' ? 'Video Generator' : 'History'}
            </h1>
            {isGenerating && (
              <span className="flex items-center gap-1.5 text-xs text-finance-400 bg-finance-600/10 px-2.5 py-1 rounded-full">
                <Loader2 className="w-3 h-3 animate-spin" />
                Generating...
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-dark-600 bg-dark-800 px-2 py-1 rounded-full">
              {projects.filter(p => p.status === 'completed').length} videos
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {view === 'generator' ? (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
              {/* Left: Prompt Input */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
                  <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-finance-400" />
                    Create Video
                  </h2>
                  <PromptInput
                    onSubmit={handleGenerate}
                    settings={settings}
                    onSettingsChange={setSettings}
                    isGenerating={isGenerating}
                  />
                </div>

                {/* Recent Videos sidebar */}
                {projects.length > 0 && (
                  <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4">
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-dark-400" />
                      Recent
                    </h3>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {projects.slice(0, 10).map(project => (
                        <VideoCard
                          key={project.id}
                          project={project}
                          onClick={() => handleSelectProject(project)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Preview / Progress */}
              <div className="lg:col-span-3">
                {currentProject ? (
                  <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
                    {currentProject.status === 'generating' || currentProject.status === 'pending' ? (
                      <div className="space-y-4">
                        <h2 className="text-base font-semibold text-white">Generating "{currentProject.topic}"</h2>
                        <GenerationProgress project={currentProject} />
                      </div>
                    ) : currentProject.status === 'completed' ? (
                      <VideoPreview
                        project={currentProject}
                        onRegenerate={() => handleRegenerate(currentProject)}
                        onDelete={() => handleDelete(currentProject.id)}
                      />
                    ) : currentProject.status === 'failed' ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-red-400">
                          <XCircle className="w-5 h-5" />
                          <h2 className="text-base font-semibold">Generation Failed</h2>
                        </div>
                        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
                          <p className="text-sm text-red-300">{currentProject.error || 'Unknown error'}</p>
                        </div>
                        <button
                          onClick={() => handleRegenerate(currentProject)}
                          className="px-4 py-2 bg-finance-600 hover:bg-finance-500 text-white text-sm font-medium rounded-lg transition-all"
                        >
                          Try Again
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6 flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                      <FileVideo className="w-16 h-16 text-dark-700 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-dark-400">No Video Selected</h3>
                      <p className="text-sm text-dark-500 mt-2">
                        Enter a topic and generate your first video
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* History View */
            <div className="max-w-4xl mx-auto">
              <h2 className="text-lg font-semibold text-white mb-6">Video History</h2>
              {projects.length === 0 ? (
                <div className="bg-dark-900 border border-dark-800 rounded-2xl p-12 text-center">
                  <History className="w-16 h-16 text-dark-700 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-dark-400">No videos yet</h3>
                  <p className="text-sm text-dark-500 mt-2">
                    Generate your first video to see it here
                  </p>
                  <button
                    onClick={() => setView('generator')}
                    className="mt-4 px-4 py-2 bg-finance-600 hover:bg-finance-500 text-white text-sm font-medium rounded-lg transition-all"
                  >
                    Create Video
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map(project => (
                    <div key={project.id} className="bg-dark-900 border border-dark-800 rounded-xl overflow-hidden group">
                      {/* Thumbnail */}
                      <div className="aspect-[9/16] bg-dark-800 flex items-center justify-center relative">
                        {project.status === 'completed' ? (
                          <>
                            <FileVideo className="w-12 h-12 text-dark-600" />
                            <button
                              onClick={() => handleSelectProject(project)}
                              className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all"
                            >
                              <Play className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-all" />
                            </button>
                          </>
                        ) : project.status === 'generating' ? (
                          <Loader2 className="w-8 h-8 text-finance-400 animate-spin" />
                        ) : project.status === 'failed' ? (
                          <XCircle className="w-8 h-8 text-red-400" />
                        ) : (
                          <Clock className="w-8 h-8 text-dark-500" />
                        )}
                      </div>
                      {/* Info */}
                      <div className="p-3">
                        <h3 className="text-sm font-semibold text-white truncate">{project.topic}</h3>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-dark-400">
                            {project.audioDuration ? `${Math.round(project.audioDuration)}s` : ''}
                            {' · '}{project.settings.aspectRatio}
                          </span>
                          <button
                            onClick={() => handleDelete(project.id)}
                            className="text-dark-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
