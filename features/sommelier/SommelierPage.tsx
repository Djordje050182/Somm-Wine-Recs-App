import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Camera, MessageSquare } from 'lucide-react';
import SommelierChat from '../../components/SommelierChat';
import WineScanner from '../../components/WineScanner';
import { useAuth } from '../../contexts/AuthContext';

// The Somm — chat with the region's master sommelier, or point the camera
// at a label and let them read it.

const SommelierPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [mode, setMode] = useState<'chat' | 'scan'>(searchParams.get('scan') ? 'scan' : 'chat');

  useEffect(() => {
    if (searchParams.get('scan')) setMode('scan');
  }, [searchParams]);

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex gap-6 border-b border-hairline pt-6">
        <button
          onClick={() => setMode('chat')}
          className={`flex items-center gap-2 font-ui text-sm font-semibold pb-3 -mb-px border-b-2 transition-colors ${
            mode === 'chat' ? 'border-claret text-claret' : 'border-transparent text-ink/50 hover:text-ink'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Ask the Somm
        </button>
        <button
          onClick={() => setMode('scan')}
          className={`flex items-center gap-2 font-ui text-sm font-semibold pb-3 -mb-px border-b-2 transition-colors ${
            mode === 'scan' ? 'border-claret text-claret' : 'border-transparent text-ink/50 hover:text-ink'
          }`}
        >
          <Camera className="w-4 h-4" /> Scan a label
        </button>
      </div>

      {mode === 'chat' ? <SommelierChat /> : <WineScanner user={user} />}
    </div>
  );
};

export default SommelierPage;
