import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Camera, MessageSquare, Mic } from 'lucide-react';
import SommelierChat from '../../components/SommelierChat';
import WineScanner from '../../components/WineScanner';
import { useAuth } from '../../contexts/AuthContext';

// The voice SDK (WebRTC) is a heavy guest — only invited when the tab opens
const VoiceSomm = lazy(() => import('./VoiceSomm'));

// The Somm — chat with the region's master sommelier, talk to him out loud,
// or point the camera at a label and let him read it.

const SommelierPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [mode, setMode] = useState<'chat' | 'scan' | 'talk'>(searchParams.get('scan') ? 'scan' : 'chat');

  useEffect(() => {
    if (searchParams.get('scan')) setMode('scan');
  }, [searchParams]);

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex gap-6 border-b border-hairline pt-6 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setMode('chat')}
          className={`flex items-center gap-2 font-ui text-sm font-semibold whitespace-nowrap shrink-0 pb-3 -mb-px border-b-2 transition-colors ${
            mode === 'chat' ? 'border-claret text-claret' : 'border-transparent text-ink/50 hover:text-ink'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Ask the Somm
        </button>
        <button
          onClick={() => setMode('talk')}
          className={`flex items-center gap-2 font-ui text-sm font-semibold whitespace-nowrap shrink-0 pb-3 -mb-px border-b-2 transition-colors ${
            mode === 'talk' ? 'border-claret text-claret' : 'border-transparent text-ink/50 hover:text-ink'
          }`}
        >
          <Mic className="w-4 h-4" /> Talk to the Somm
        </button>
        <button
          onClick={() => setMode('scan')}
          className={`flex items-center gap-2 font-ui text-sm font-semibold whitespace-nowrap shrink-0 pb-3 -mb-px border-b-2 transition-colors ${
            mode === 'scan' ? 'border-claret text-claret' : 'border-transparent text-ink/50 hover:text-ink'
          }`}
        >
          <Camera className="w-4 h-4" /> Scan a label
        </button>
      </div>

      {mode === 'chat' && <SommelierChat />}
      {mode === 'talk' && (
        <Suspense fallback={<div className="py-20 text-center font-body text-ink/40">The Somm is on his way…</div>}>
          <VoiceSomm />
        </Suspense>
      )}
      {mode === 'scan' && <WineScanner user={user} />}
    </div>
  );
};

export default SommelierPage;
