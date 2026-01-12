
import React, { useRef, useState, useEffect } from 'react';
import { analyzeWineLabel, analyzeVideoContent } from '../services/geminiService';
import { Camera, RefreshCw, Loader2, Wine, Info, FileText, User, X, Check, AlertCircle, WifiOff, Cloud, ShoppingBag, Video, Sparkles } from 'lucide-react';
import { addToCart } from '../services/commerceService';

interface WineScannerProps {
    user?: { name: string; email: string; tier?: string } | null;
}

const WineScanner: React.FC<WineScannerProps> = ({ user }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<'bottle' | 'atmosphere'>('bottle');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<{title: string, msg: string} | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleStatusChange = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    return () => {
        window.removeEventListener('online', handleStatusChange);
        window.removeEventListener('offline', handleStatusChange);
    }
  }, []);

  const startCamera = async () => {
    if (isOffline) {
        setError({title: "Offline Mode", msg: "Scanner requires internet connection for Pro AI analysis."});
        return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (err: any) {
      setError({title: "Camera Blocked", msg: "Please allow camera access in browser settings."});
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setShowCamera(false);
    }
  };

  const captureAndAnalyze = async () => {
    if (isOffline || !videoRef.current || !canvasRef.current) return;
    
    setScanning(true);
    setError(null); 
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      const base64 = dataUrl.split(',')[1];
      
      try {
        if (mode === 'bottle') {
            const analysis = await analyzeWineLabel(base64);
            const parsed = JSON.parse(analysis);
            if (parsed.isWine === false) {
                setError({title: "No Wine Detected", msg: "Please center the bottle label."});
            } else {
                setResult(parsed);
            }
        } else {
            const analysis = await analyzeVideoContent(base64, "Describe the atmosphere and wine selection visible in this still frame.");
            setResult({ atmosphere: analysis });
        }
        stopCamera();
      } catch (err) {
        setError({title: "Pro Analysis Error", msg: "Gemini 3 Pro reasoning engine is at capacity."});
      }
    }
    setScanning(false);
  };

  return (
    <div className="p-4 md:p-10 max-w-4xl mx-auto min-h-screen">
      <div className="flex justify-between items-start mb-8">
        <div>
            <h2 className="text-3xl font-black text-[#6b1e2e] font-serif">Vision Scanner</h2>
            <p className="text-gray-500 text-sm">Now powered by Gemini 3 Pro Reasoning.</p>
        </div>
      </div>

      <div className="flex bg-white rounded-full p-1 border border-[#e5e1da] shadow-sm mb-8 max-w-sm mx-auto">
        <button 
            onClick={() => { setMode('bottle'); setResult(null); stopCamera(); }}
            className={`flex-1 py-3 rounded-full flex items-center justify-center gap-2 font-bold transition-all ${mode === 'bottle' ? 'bg-[#6b1e2e] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
        >
            <Wine className="w-4 h-4" /> Bottle
        </button>
        <button 
            onClick={() => { setMode('atmosphere'); setResult(null); stopCamera(); }}
            className={`flex-1 py-3 rounded-full flex items-center justify-center gap-2 font-bold transition-all ${mode === 'atmosphere' ? 'bg-[#6b1e2e] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
        >
            <Video className="w-4 h-4" /> Atmosphere
        </button>
      </div>

      {!showCamera && !result && (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#e5e1da] rounded-[2.5rem] p-16 bg-white animate-in zoom-in-95">
          <div className="p-8 rounded-full mb-6 bg-purple-50 text-purple-600 relative">
             <Sparkles className="w-12 h-12" />
             <div className="absolute -bottom-2 -right-2 bg-[#6b1e2e] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Gemini 3 Pro</div>
          </div>
          <h3 className="text-2xl font-black text-[#1a1a1a] mb-2 font-serif">
            {mode === 'bottle' ? 'Professional Label Analysis' : 'Vineyard Atmosphere AI'}
          </h3>
          <p className="text-gray-400 text-center mb-8 max-w-xs text-sm">
            {mode === 'bottle' ? 'Get expert-level notes on vintage conditions, soil impact, and cellaring advice.' : 'Identify wine varietals and estate vibes instantly through visual reasoning.'}
          </p>
          <button onClick={startCamera} className="px-10 py-4 rounded-full font-bold shadow-xl transition-all flex items-center gap-2 bg-[#1a1a1a] text-white hover:scale-105 shadow-black/10">
            <Camera className="w-5 h-5" /> Activate Scanner
          </button>
        </div>
      )}

      {showCamera && (
        <div className="relative rounded-[3rem] overflow-hidden shadow-2xl bg-black aspect-[3/4] flex items-center justify-center border-8 border-white">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-4">
            <button 
              disabled={scanning}
              onClick={captureAndAnalyze}
              className="bg-white text-[#6b1e2e] w-24 h-24 rounded-full flex items-center justify-center shadow-2xl disabled:opacity-50 hover:scale-110 transition-all border-4 border-[#f8f4f0]"
            >
              {scanning ? <Loader2 className="w-10 h-10 animate-spin" /> : <div className="w-16 h-16 rounded-full bg-[#6b1e2e]"></div>}
            </button>
            <button onClick={stopCamera} className="absolute right-8 top-1/2 -translate-y-1/2 bg-black/30 p-4 rounded-full backdrop-blur-md text-white hover:bg-black/50">
                <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-[#e5e1da] animate-in slide-in-from-bottom duration-500">
          <div className="bg-[#6b1e2e] p-8 text-white">
            <h3 className="text-3xl font-black font-serif">{result.wineName || 'Analysis Complete'}</h3>
            <p className="opacity-80 font-bold uppercase tracking-widest text-xs mt-2">{result.producer || 'Atmosphere Analysis'}</p>
          </div>
          <div className="p-8">
            <p className="text-xl leading-relaxed italic text-gray-700 font-serif">
              "{result.sommelierNotes || result.atmosphere}"
            </p>
            <div className="mt-8 pt-8 border-t border-gray-100 flex justify-between items-center">
              <button onClick={() => {setResult(null); startCamera();}} className="text-[#6b1e2e] font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:underline">
                 <RefreshCw className="w-4 h-4" /> Scan Another
              </button>
              {result.wineName && (
                <button onClick={() => addToCart('w1')} className="bg-[#1a1a1a] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg">
                  <ShoppingBag className="w-4 h-4" /> Buy Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-8 p-8 bg-red-50 text-red-600 rounded-[2rem] text-center border border-red-100 animate-in shake">
          <AlertCircle className="w-10 h-10 mx-auto mb-2 text-red-500" />
          <h4 className="font-black text-xl text-red-800 mb-1">{error.title}</h4>
          <p className="text-sm text-red-700">{error.msg}</p>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default WineScanner;
