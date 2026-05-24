import React from 'react';
import { Palette, Sparkles, Image, Video } from 'lucide-react';

const CreativeCellar: React.FC = () => {
  return (
    <div className="p-4 md:p-10 max-w-3xl mx-auto min-h-screen">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-wine font-serif">Creative Cellar</h2>
        <p className="text-gray-500 text-sm mt-1">AI-powered creative tools for wine lovers</p>
      </div>

      <div className="grid gap-4">
        {[
          { icon: <Image className="w-6 h-6" />, title: 'Label Art Generator', desc: 'Generate bespoke wine label artwork using AI image generation.', badge: 'Coming Soon' },
          { icon: <Palette className="w-6 h-6" />, title: 'Trail Map Art', desc: 'Create a beautiful illustrated map of your Hunter Valley wine trail.', badge: 'Coming Soon' },
          { icon: <Video className="w-6 h-6" />, title: 'Video Reels', desc: 'Generate short cinematic reels of your wine tour experience.', badge: 'Coming Soon' },
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex gap-4 items-start opacity-60">
            <div className="w-12 h-12 bg-wine/10 rounded-xl flex items-center justify-center text-wine shrink-0">
              {item.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-gray-900">{item.title}</h3>
                <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase">{item.badge}</span>
              </div>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-wine/5 border border-wine/10 rounded-2xl p-6 text-center">
        <Sparkles className="w-8 h-8 text-wine mx-auto mb-3" />
        <p className="font-bold text-gray-800 text-sm">Image generation features require additional AI service configuration.</p>
        <p className="text-xs text-gray-500 mt-1">These features will be enabled in a future update.</p>
      </div>
    </div>
  );
};

export default CreativeCellar;
