'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';
import DashboardLayout from '@/components/DashboardLayout';
import ScriptsPanel from '@/components/ScriptsPanel';
import AudioPanel from '@/components/AudioPanel';
import VideoPanel from '@/components/VideoPanel';
import AvatarsPanel from '@/components/AvatarsPanel';
import AgentsPanel from '@/components/AgentCreator';
import GeneratePanel from '@/components/GeneratePanel';

export default function DashboardPage() {
  const router = useRouter();
  const { user, activeTab, currentProject, setCurrentProject } = useStore();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token && !user) {
      router.push('/auth/login');
      return;
    }
    // Initialize with a demo project (client-side only)
    if (!currentProject) {
      setCurrentProject({
        id: 'demo-project',
        userId: user?.id || 'demo',
        name: 'My First Project',
        scripts: [],
        audioFiles: [],
        videoClips: [],
        avatars: [],
        generations: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }, []);

  const panels: Record<string, React.ReactNode> = {
    scripts: <ScriptsPanel />,
    audio: <AudioPanel />,
    video: <VideoPanel />,
    avatars: <AvatarsPanel />,
    agents: <AgentsPanel />,
    generate: <GeneratePanel />,
  };

  return (
    <DashboardLayout>
      {panels[activeTab] || <ScriptsPanel />}
    </DashboardLayout>
  );
}
