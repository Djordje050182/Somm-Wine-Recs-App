import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, Loader2, X, AlertCircle, WifiOff, ShoppingBag, UtensilsCrossed, Clock, Check } from 'lucide-react';
import { analyzeWineLabel, isAIEnabled } from '../services/claudeService';
import { useRegion } from '../contexts/RegionContext';
import { useCatalog } from '../contexts/CatalogContext';
import { useCart } from '../contexts/CartContext';
import { SectionHeading, Button, Card, Kicker, Tag } from './ui';

// Point it at a label. The Somm will read it — tasting note, pairings and
// whether the bottle deserves a few more years in the dark.

interface WineScannerProps {
  user?: { name: string; email: string; tier?: string } | null;
}

const WineScanner: React.FC<WineScannerProps> = ({ user: _user }) => {
  const { region } = useRegion();
  const { wines } = useCatalog();
  const { addToCart } = useCart();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<{ title: string; msg: string } | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [addedToCase, setAddedToCase] = useState(false);
  const aiEnabled = isAIEnabled();

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setShowCamera(false);
  }, []);

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
  }, [stopCamera]);

  const startCamera = async () => {
    if (isOffline) {
      setError({ title: 'You are offline', msg: 'The Somm needs a connection to read a label.' });
      return;
    }
    if (!aiEnabled) {
      setError({ title: 'The Somm is unavailable', msg: 'Set VITE_AI_PROXY_URL to enable the label reader.' });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setShowCamera(true);
      setError(null);
    } catch {
      setError({ title: 'Camera blocked', msg: 'Allow camera access in your browser settings to read labels.' });
    }
  };

  const captureAndAnalyse = async () => {
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
      const analysis = await analyzeWineLabel(region, base64);
      if (!analysis.isWine) {
        setError({ title: 'No label in sight', msg: 'Centre the bottle in frame and try again.' });
      } else {
        // Match against the region's catalogue
        const matched = wines.find(
          w => analysis.wineName && w.name.toLowerCase().includes(analysis.wineName.toLowerCase().split(' ')[0])
        );
        setResult({ ...analysis, matchedWineId: matched?.id });
        setAddedToCase(false);
        stopCamera();
      }
    } catch {
      setError({ title: 'The light was wrong', msg: 'Could not read the label. Try better lighting or a squarer angle.' });
    }
    setScanning(false);
  };

  const handleAddToCase = () => {
    if (result?.matchedWineId) {
      addToCart(result.matchedWineId);
      setAddedToCase(true);
      setTimeout(() => setAddedToCase(false), 2400);
    }
  };

  return (
    <div className="py-10 max-w-2xl mx-auto animate-fade-in">
      <SectionHeading
        kicker="The label reader"
        title="Point it at a label. The Somm will read it."
        standfirst="A tasting note, the right food and a cellaring verdict — from any bottle you can hold up to the light."
      />

      {!showCamera && !result && (
        <Card className="mt-10 flex flex-col items-center justify-center p-14 text-center animate-scale-in">
          <div className="w-16 h-16 border border-hairline rounded-sm flex items-center justify-center text-claret mb-6">
            <Camera className="w-7 h-7" />
          </div>
          <p className="font-body text-ink/60 max-w-sm mb-8">
            Hold a bottle steady, keep the label in frame, and the Somm will tell you what you are holding.
          </p>
          {!aiEnabled && (
            <div className="flex items-center gap-2 font-ui text-xs text-terracotta border border-terracotta/40 rounded-sm px-4 py-2.5 mb-6">
              <WifiOff className="w-3.5 h-3.5 shrink-0" /> The Somm is away from the table. Set VITE_AI_PROXY_URL.
            </div>
          )}
          <Button size="lg" onClick={startCamera} disabled={!aiEnabled || isOffline}>
            <Camera className="w-4 h-4" /> Open the camera
          </Button>
        </Card>
      )}

      {showCamera && (
        <div className="mt-10 relative rounded-sm overflow-hidden bg-ink aspect-[3/4] flex items-center justify-center border border-hairline">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-64 border border-parchment/70 rounded-sm" />
          </div>
          <div className="absolute bottom-8 left-0 right-0 flex justify-center">
            <button
              disabled={scanning}
              onClick={captureAndAnalyse}
              className="bg-paper w-20 h-20 rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-parchment transition-colors border border-hairline"
              aria-label="Read the label"
            >
              {scanning ? <Loader2 className="w-8 h-8 animate-spin text-claret" /> : <span className="w-14 h-14 rounded-full bg-claret" />}
            </button>
          </div>
          <button
            onClick={stopCamera}
            className="absolute top-4 right-4 bg-ink/60 p-2.5 rounded-sm text-parchment hover:bg-ink transition-colors"
            aria-label="Close camera"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {result && (
        <Card className="mt-10 overflow-hidden animate-slide-up">
          <div className="bg-claret p-6 md:p-7 text-parchment">
            <p className="font-ui text-[11px] font-semibold uppercase tracking-kicker text-parchment/60 mb-1">{result.producer}</p>
            <h3 className="font-display text-2xl md:text-3xl leading-tight">{result.wineName}</h3>
            <div className="flex gap-2 mt-4 flex-wrap">
              {result.vintage && (
                <span className="font-ui text-[10px] font-semibold uppercase tracking-kicker border border-parchment/30 px-2 py-1 rounded-sm">{result.vintage}</span>
              )}
              {result.variety && (
                <span className="font-ui text-[10px] font-semibold uppercase tracking-kicker border border-parchment/30 px-2 py-1 rounded-sm">{result.variety}</span>
              )}
            </div>
          </div>

          <div className="p-6 md:p-7 space-y-6">
            {result.sommelierNotes && (
              <div>
                <Kicker className="mb-2">The Somm's note</Kicker>
                <p className="font-body text-ink/80 text-lg leading-relaxed italic">{result.sommelierNotes}</p>
              </div>
            )}

            {result.foodPairings?.length > 0 && (
              <div>
                <Kicker className="mb-2 flex items-center gap-1.5">
                  <UtensilsCrossed className="w-3 h-3" /> At the table
                </Kicker>
                <div className="flex flex-wrap gap-2">
                  {result.foodPairings.map((f: string, i: number) => (
                    <Tag key={i}>{f}</Tag>
                  ))}
                </div>
              </div>
            )}

            {result.cellarPotential && (
              <div className="flex items-start gap-2 font-body text-sm text-ink/70 border border-hairline rounded-sm px-4 py-3">
                <Clock className="w-4 h-4 text-brass shrink-0 mt-0.5" />
                <span><span className="font-semibold text-ink">In the cellar:</span> {result.cellarPotential}</span>
              </div>
            )}

            <div className="pt-4 border-t border-hairline flex justify-between items-center gap-4">
              <button
                onClick={() => { setResult(null); startCamera(); }}
                className="font-ui text-sm font-semibold text-claret hover:text-claret-deep flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Read another
              </button>
              {result.matchedWineId ? (
                <Button size="sm" onClick={handleAddToCase}>
                  {addedToCase ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                  {addedToCase ? 'In your case' : 'Add to your case'}
                </Button>
              ) : (
                <span className="font-ui text-xs text-ink/40">Not in our list — yet</span>
              )}
            </div>
          </div>
        </Card>
      )}

      {error && (
        <div className="mt-8 p-6 border border-terracotta/40 rounded-sm bg-paper animate-fade-in text-center">
          <AlertCircle className="w-7 h-7 mx-auto mb-3 text-terracotta" />
          <h4 className="font-display text-lg text-ink mb-1">{error.title}</h4>
          <p className="font-body text-sm text-ink/60">{error.msg}</p>
          <Button variant="secondary" size="sm" className="mt-5" onClick={startCamera}>
            Try again
          </Button>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default WineScanner;
