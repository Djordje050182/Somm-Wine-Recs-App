
import React, { useState, useRef } from 'react';
import { Sparkles, Image as ImageIcon, Video, Send, Loader2, Download, Trash2, Sliders, Maximize, ScanLine, Eraser, Palette, Camera } from 'lucide-react';
import { generateProImage, editImageWithPrompt, generateVeoVideo } from '../services/geminiService';

const CreativeCellar: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'generate' | 'edit' | 'video'>('generate');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState('1K');
  const [selectedRatio, setSelectedRatio] = useState('16:9');
  const [uploadBase64, setUploadBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRun = async () => {
    if (!prompt.trim() && activeMode !== 'edit') return;
    setIsGenerating(true);
    setResult(null);

    try {
      if (activeMode === 'generate') {
        const url = await generateProImage(prompt, selectedRatio, selectedSize);
        setResult(url);
      } else if (activeMode === 'edit' && uploadBase64) {
        const url = await editImageWithPrompt(uploadBase64.split(',')[1], prompt);
        setResult(url);
      } else if (activeMode === 'video') {
        const url = await generateVeoVideo(prompt, uploadBase64?.split(',')[1], selectedRatio as any);
        setResult(url);
      }
    } catch (e) {
      alert("AI Generation failed. Please check your API key and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const loadingMessages = [
    "Cultivating your vision...",
    "Pouring digital textures...",
    "Aging the pixels for perfection...",
    "Consulting the muse...",
    "Almost ready to serve..."
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-in fade-in duration-500">
      <div className="text-center mb-12">
        <div className="inline-flex p-3 bg-purple-50 rounded-full mb-4">
          <Sparkles className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-5xl font-black text-[#1a1a1a] font-serif">Creative Cellar</h2>
        <p className="text-gray-500 mt-2">Professional wine branding and vineyard visualization engine.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Sidebar Controls */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] border border-[#e5e1da] p-6 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
              <Sliders className="w-3 h-3" /> Select Engine
            </h3>
            <div className="space-y-2">
              {[
                { id: 'generate', label: 'Pro Image Gen', icon: ImageIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
                { id: 'edit', label: 'Label Editor', icon: Palette, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { id: 'video', label: 'Veo Cinematic', icon: Video, color: 'text-purple-600', bg: 'bg-purple-50' }
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => { setActiveMode(m.id as any); setResult(null); }}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${activeMode === m.id ? `${m.bg} ${m.color} scale-[1.02] shadow-sm` : 'hover:bg-gray-50 text-gray-500'}`}
                >
                  <m.icon className="w-5 h-5" />
                  <span className="font-bold">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-[#e5e1da] p-6 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Configuration</h3>
            
            {activeMode !== 'edit' && (
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Aspect Ratio</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['1:1', '16:9', '9:16', '3:4', '4:3', '21:9'].map(r => (
                      <button
                        key={r}
                        onClick={() => setSelectedRatio(r)}
                        className={`py-2 rounded-lg text-xs font-bold transition-all border ${selectedRatio === r ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                {activeMode === 'generate' && (
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Image Size</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['1K', '2K', '4K'].map(s => (
                        <button
                          key={s}
                          onClick={() => setSelectedSize(s)}
                          className={`py-2 rounded-lg text-xs font-bold transition-all border ${selectedSize === s ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {(activeMode === 'edit' || activeMode === 'video') && (
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Reference Asset</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-100 rounded-2xl p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  {uploadBase64 ? (
                    <img src={uploadBase64} className="w-full h-32 object-cover rounded-lg" />
                  ) : (
                    <div className="text-gray-300 flex flex-col items-center gap-2">
                      <Camera className="w-8 h-8" />
                      <span className="text-[10px] font-bold">Upload Image</span>
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*" />
              </div>
            )}
          </div>
        </div>

        {/* Workspace */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-[#e5e1da] p-8 shadow-lg min-h-[600px] flex flex-col">
            <div className="relative flex-1 bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 mb-6 flex items-center justify-center">
              {isGenerating ? (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <div className="space-y-2">
                    <p className="font-serif italic text-xl text-purple-900 animate-pulse">
                      {loadingMessages[Math.floor(Date.now() / 3000) % loadingMessages.length]}
                    </p>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Veo/Pro Engines are computing...</p>
                  </div>
                </div>
              ) : result ? (
                activeMode === 'video' ? (
                  <video src={result} controls className="w-full h-full object-contain" />
                ) : (
                  <img src={result} className="w-full h-full object-contain" />
                )
              ) : (
                <div className="text-center p-12">
                   <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6 text-gray-300">
                      {activeMode === 'generate' && <ImageIcon className="w-10 h-10" />}
                      {activeMode === 'edit' && <Palette className="w-10 h-10" />}
                      {activeMode === 'video' && <Video className="w-10 h-10" />}
                   </div>
                   <h4 className="text-lg font-bold text-gray-400">Canvas Ready</h4>
                   <p className="text-sm text-gray-300 max-w-xs mx-auto mt-2">Enter your prompt below to start the engine.</p>
                </div>
              )}

              {result && (
                <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={() => setResult(null)} className="bg-white/90 backdrop-blur p-3 rounded-full text-red-500 shadow-xl hover:bg-white transition-all">
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <a href={result} download="somm-creation" className="bg-white/90 backdrop-blur p-3 rounded-full text-[#1a1a1a] shadow-xl hover:bg-white transition-all">
                    <Download className="w-5 h-5" />
                  </a>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <div className="flex-1 relative">
                <input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    activeMode === 'generate' ? "Describe your dream vineyard..." :
                    activeMode === 'edit' ? "e.g. Add a retro film filter and remove background" :
                    "Describe a cinematic drone shot..."
                  }
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-5 px-6 focus:outline-none focus:ring-4 focus:ring-purple-600/5 text-lg shadow-inner font-medium"
                />
              </div>
              <button
                onClick={handleRun}
                disabled={isGenerating || (!prompt && activeMode !== 'edit')}
                className="bg-[#1a1a1a] text-white px-10 rounded-2xl font-bold shadow-xl hover:bg-black transition-all flex items-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                Run
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreativeCellar;
