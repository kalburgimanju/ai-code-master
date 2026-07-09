import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AvatarGalleryProps {
  onCreateClick?: () => void;
}

const AvatarGallery: React.FC<AvatarGalleryProps> = ({ onCreateClick }) => {
  const { avatars } = useApp();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Your Avatars</h3>
        {onCreateClick && (
          <button
            onClick={onCreateClick}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-500/10 text-brand-400 text-sm hover:bg-brand-500/20 transition-colors"
          >
            <Plus size={14} /> New Avatar
          </button>
        )}
      </div>

      {avatars.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-gray-400 mb-4">No avatars yet</p>
          {onCreateClick && (
            <button
              onClick={onCreateClick}
              className="px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
            >
              Create Your First Avatar
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {avatars.map((avatar, i) => (
            <motion.div
              key={avatar.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-xl p-4 glow-card text-center"
            >
              <div
                className="w-20 h-20 mx-auto mb-3 rounded-xl overflow-hidden"
                dangerouslySetInnerHTML={{ __html: avatar.svgData }}
              />
              <p className="text-white text-sm font-medium truncate">{avatar.name}</p>
              <p className="text-gray-400 text-xs capitalize">{avatar.style}</p>
              <div className="flex flex-wrap justify-center gap-1 mt-2">
                {avatar.platforms.map((p) => (
                  <span key={p} className="px-1.5 py-0.5 rounded bg-white/5 text-gray-400 text-[10px] capitalize">
                    {p}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvatarGallery;
