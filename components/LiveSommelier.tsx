import React from 'react';
import { Mic, MessageSquare } from 'lucide-react';

const LiveSommelier: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
    <div className="w-20 h-20 bg-wine/10 rounded-full flex items-center justify-center mb-6">
      <Mic className="w-9 h-9 text-wine" />
    </div>
    <h2 className="text-2xl font-black font-serif text-gray-900 mb-2">Live Voice Sommelier</h2>
    <p className="text-gray-500 text-sm max-w-xs mb-6 leading-relaxed">Real-time voice conversation coming soon. In the meantime, use the text sommelier for expert wine advice.</p>
    <div className="flex items-center gap-2 text-xs text-wine bg-wine/10 px-4 py-2.5 rounded-full font-bold">
      <MessageSquare className="w-3.5 h-3.5" /> Use Sommelier Chat for now
    </div>
  </div>
);

export default LiveSommelier;
