import React, { useRef, useState, useEffect, useCallback } from 'react';
import { analyzeWineLabel, isAIEnabled } from '../services/claudeService';
import { Camera, RefreshCw, Loader2, Wine, X, AlertCircle, WifiOff, ShoppingBag, Sparkles, UtensilsCrossed, Clock } from 'lucide-react';
import { addToCart } from '../services/commerceService';
import { WINES } from '../data/wineries';

interface WineScannerProps {
  user?: { name: string; email: string; tier?: string } | null;
}

const WineScanner: React.FC<WineScannerProps> = ({ user }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<{ title: string; msg: string } | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [addedToCart, setAddedToCart] = useState(false);
  const aiEnabled = isAIEnabled();

  useEffect(() => {
    const up = () => setIsOffline(false);
    const down = () => setIsOffline(true);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    if (isOffline) { setError({ title: 'Offline', msg: 'Scanner requires an internet connection.' }); return; }
    if (!aiEnabled) { setError({ title: 'AI Not Configured', msg: 'Set VITE_AI_PROXY_URL to enable the scanner.' }); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setShowCamera(true);
      setError(null);
    } catch {
      setError({ title: 'Camera Blocked', msg: 'Allow camera access in browser settings to use the scanner.' });
    }
  };

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setShowCamera(false);
  }, []);

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current || scanning) return;
    setScanning(true);
    setError(null);
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg', 0.85).split(',')[1];
    try {
      const analysis = await analyzeWineLabel(base64);
      if (!analysis.isWine) {
        setError({ title: 'No Wine Label Detected', msg: 'Centre the bottle label in frame and try again.' });
      } else {
        // Try to match to a wine in our library
        const matched = WINES.find(w =>
          analysis.wineName && w.name.toLowerCase().includes(analysis.wineName.toLowerCase().split(' ')[0])
        );
        setResult({ ...analysis, matchedWineId: matched?.id });
        stopCamera();
      }
    } catch {
      setError({ title: 'Analysis Failed', msg: 'Could not analyse the label. Try better lighting or a clearer angle.' });
    }
    setScanning(false);
  };

  const handleAddToCart = () => {
    if (result?.matchedWineId) {
      addToCart(result.matchedWineId);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  return (
    <div className="p-4 md:p-10 max-w-2xl mx-auto min-h-screen">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-wine font-serif">Label Scanner</h2>
        <p className="text-gray-500 text-sm mt-1">Point at any bottle to get tasting notes, pairings & cellar advice.</p>
      </div>

      {!showCamera && !result && (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-3xl p-16 bg-white animate-scale-in">
          <div className="p-7 rounded-full mb-5 bg-wine/5 text-wine">
            <Sparkles className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-2 font-serif">AI Label Analysis</h3>
          <p className="text-gray-400 text-center mb-8 max-w-xs text-sm">
            Instantly identify any wine. Get expert tasting notes, food pairings, and cellaring advice powered by Claude.
          </p>
          {!aiEnabled && (
            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded-xl px-4 py-2.5 mb-4">
              <WifiOff className="w-3.5 h-3.5 shrink-0" /> AI proxy not configured
            </div>
          )}
          <button
            onClick={startCamera}
            disabled={!aiEnabled || isOffline}
            className="px-8 py-3.5 rounded-full font-bold shadow-xl transition-all flex items-center gap-2 bg-[#1a1a1a] text-white hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
          >
            <Camera className="w-5 h-5" /> Activate Scanner
          </button>
        </div>
      )}

      {showCamera && (
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-black aspect-[3/4] flex items-center justify-center border-4 border-white">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-64 border-2 border-white/60 rounded-2xl" />
          </div>
          <div className="absolute bottom-8 left-0 right-0 flex justify-center">
            <button
              disabled={scanning}
              onClick={captureAndAnalyze}
              className="bg-white w-20 h-20 rounded-full flex items-center justify-center shadow-2xl disabled:opacity-50 hover:scale-105 transition-all border-4 border-gray-100"
            >
              {scanning ? <Loader2 className="w-8 h-8 animate-spin text-wine" /> : <div className="w-14 h-14 rounded-full bg-wine" />}
            </button>
          </div>
          <button onClick={stopCamera} className="absolute top-4 right-4 bg-black/40 p-2.5 rounded-full backdrop-blur-md text-white hover:bg-black/60">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {result && (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 animate-slide-up">
          <div className="bg-wine p-7 text-white">
            <p className="text-wine-light/60 text-xs font-bold uppercase tracking-widest mb-1">{result.producer}</p>
            <h3 className="text-2xl font-black font-serif">{result.wineName}</h3>
            <div className="flex gap-3 mt-3 flex-wrap">
              {result.vintage && <span className="bg-white/20 text-xs font-bold px-3 py-1 rounded-full">{result.vintage}</span>}
              {result.variety && <span className="bg-white/20 text-xs font-bold px-3 py-1 rounded-full">{result.variety}</span>}
            </div>
          </div>

          <div className="p-7 space-y-6">
            {result.sommelierNotes && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Tasting Notes</p>
                <p className="text-gray-700 leading-relaxed font-serif italic">"{result.sommelierNotes}"</p>
              </div>
            )}

            {result.foodPairings?.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1"><UtensilsCrossed className="w-3 h-3" /> Food Pairings</p>
                <div className="flex flex-wrap gap-2">
                  {result.foodPairings.map((f: string, i: number) => (
                    <span key={i} className="bg-cream-dark text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full">{f}</span>
                  ))}
                </div>
              </div>
            )}

            {result.cellarPotential && (
              <div className="flex items-start gap-2 text-sm text-gray-600 bg-amber-50 rounded-xl px-4 py-3">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span><strong>Cellar:</strong> {result.cellarPotential}</span>
              </div>
            )}

            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <button onClick={() => { setResult(null); startCamera(); }} className="text-wine font-bold text-sm flex items-center gap-1.5 hover:underline">
                <RefreshCw className="w-3.5 h-3.5" /> Scan Another
              </button>
              {result.matchedWineId ? (
                <button
                  onClick={handleAddToCart}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow ${addedToCart ? 'bg-emerald-500 text-white' : 'bg-[#1a1a1a] text-white hover:bg-black'}`}
                >
                  <ShoppingBag className="w-4 h-4" /> {addedToCart ? 'Added!' : 'Add to Cellar'}
                </button>
              ) : (
                <span className="text-xs text-gray-400">Not in our library yet</span>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-6 p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 animate-fade-in">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-400" />
          <h4 className="font-black text-base text-red-800 mb-1 text-center">{error.title}</h4>
          <p className="text-sm text-center">{error.msg}</p>
          <button onClick={startCamera} className="mt-4 w-full py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 font-bold text-sm transition">
            Try Again
          </button>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default WineScanner;
