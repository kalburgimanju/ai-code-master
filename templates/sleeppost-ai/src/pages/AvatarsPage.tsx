import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import AvatarGallery from '../components/dashboard/AvatarGallery';
import CreateAvatarModal from '../components/CreateAvatarModal';

const AvatarsPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const { avatars, removeAvatar } = useApp();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Avatars</h1>
        <p className="text-gray-400">
          Create and manage your AI-generated social media avatars.
        </p>
      </div>

      <AvatarGallery onCreateClick={() => setShowModal(true)} />

      {avatars.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Manage Avatars</h3>
          <div className="space-y-3">
            {avatars.map((avatar) => (
              <div key={avatar.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                <div
                  className="w-12 h-12 rounded-lg overflow-hidden shrink-0"
                  dangerouslySetInnerHTML={{ __html: avatar.svgData }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium">{avatar.name}</p>
                  <p className="text-gray-400 text-sm capitalize">{avatar.style} · {avatar.platforms.length} platforms</p>
                </div>
                <button
                  onClick={() => removeAvatar(avatar.id)}
                  className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <CreateAvatarModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default AvatarsPage;
