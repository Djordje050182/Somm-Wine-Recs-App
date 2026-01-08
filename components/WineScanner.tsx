
import React, { useRef, useState, useEffect } from 'react';
import { analyzeWineLabel, analyzeTastingMenu } from '../services/geminiService';
import { Camera, RefreshCw, Loader2, Wine, Info, FileText, User, Settings, ThumbsUp, ThumbsDown, X, Check, AlertCircle, WifiOff, Cloud, ShoppingBag, HelpCircle } from 'lucide-react';
import { UserProfile, TastingMenuItem } from '../types';
import { addToCart } from '../services/commerceService';
import { WINES } from '../data/wineries';

interface WineScannerProps {
    user?: { name: string; email: string; tier?: string } | null;
}

const WineScanner: React.FC<WineScannerProps> = ({ user }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<'bottle' | 'menu'>('bottle');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null); // For bottle result
  const [menuResult, setMenuResult] = useState<TastingMenuItem[] | null>(null); // For menu result
  const [error, setError] = useState<{title: string, msg: string} | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  // State to track matched wine ID for commerce
  const [matchedWineId, setMatchedWineId] = useState<string | null>(null);

  // Default Profile
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: user ? user.name : 'Guest',
    likes: ['Shiraz', 'Full-bodied Reds'],
    dislikes: ['Sweet Wines'],
    adventurousness: 'Curious',
    experienceLevel: 'Enthusiast'
  });

  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }

    const handleStatusChange = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    return () => {
        window.removeEventListener('online', handleStatusChange);
        window.removeEventListener('offline', handleStatusChange);
    }
  }, []);

  // Ensure camera is stopped when unmounting
  useEffect(() => {
      return () => {
          stopCamera();
      };
  }, []);

  const saveProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    localStorage.setItem('userProfile', JSON.stringify(newProfile));
  };

  const updatePreference = (type: 'like' | 'dislike', value: string) => {
    const newProfile = { ...userProfile };
    if (type === 'like') {
      if (!newProfile.likes.includes(value)) newProfile.likes.push(value);
      newProfile.dislikes = newProfile.dislikes.filter(d => d !== value);
    } else {
      if (!newProfile.dislikes.includes(value)) newProfile.dislikes.push(value);
      newProfile.likes = newProfile.likes.filter(l => l !== value);
    }
    saveProfile(newProfile);
  };

  const startCamera = async () => {
    if (isOffline) {
        setError({title: "Offline Mode", msg: "Scanner requires internet connection for AI analysis."});
        return;
    }

    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (err: any) {
      console.error("Camera access failed", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError({title: "Camera Blocked", msg: "Please allow camera access in your browser settings to scan."});
      } else if (err.name === 'NotFoundError') {
          setError({title: "No Camera", msg: "No camera found on this device."});
      } else {
          setError({title: "Camera Error", msg: "Unable to access camera. Please check your browser permissions."});
      }
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
    if (isOffline) return;
    if (!videoRef.current || !canvasRef.current) return;
    
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
            try {
              const parsed = JSON.parse(analysis);
              
              // QA CHECK: Is it actually wine?
              if (parsed.isWine === false) {
                  setError({
                      title: "No Wine Detected", 
                      msg: "That doesn't look like a wine label. Please center the bottle label in the frame."
                  });
                  setResult(null);
              } else {
                  setResult(parsed);
                  const matched = WINES.find(w => 
                      w.name.toLowerCase().includes(parsed.wineName?.toLowerCase()) ||
                      parsed.wineName?.toLowerCase().includes(w.name.toLowerCase())
                  );
                  setMatchedWineId(matched ? matched.id : null);
              }
              stopCamera();
            } catch (jsonErr) {
              console.error("JSON Parse Error", jsonErr);
              setError({title: "Read Error", msg: "Couldn't read the label clearly. Try improving lighting."});
            }
        } else {
            const analysis = await analyzeTastingMenu(base64, userProfile);
            try {
              const parsed = JSON.parse(analysis);
              if (parsed.wines && parsed.wines.length > 0) {
                setMenuResult(parsed.wines);
                stopCamera();
              } else {
                setError({title: "No Menu Found", msg: "We couldn't detect any wines text. Is this a menu?"});
              }
            } catch (jsonErr) {
              setError({title: "Analysis Failed", msg: "Couldn't read the menu. Please ensure text is in focus."});
            }
        }
      } catch (err) {
        console.error(err);
        setError({title: "Connection Error", msg: "Network or AI processing failed. Please try again."});
      }
    }
    setScanning(false);
  };

  const handleQuickAdd = () => {
      if (matchedWineId) {
          addToCart(matchedWineId);
      }
  };

  // ... (Profile Modal Code - preserved)
  const renderProfileModal = () => (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-[#6b1e2e] font-serif italic">My Palate Profile</h3>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                {user ? (
                    <span className="text-green-600 flex items-center gap-1"><Cloud className="w-3 h-3"/> Cloud Sync Active</span>
                ) : (
                    <span className="text-amber-600">Local Guest Profile</span>
                )}
            </p>
          </div>
          <button onClick={() => setShowProfile(false)}><X className="w-6 h-6 text-gray-400" /></button>
        </div>
        
        <div className="space-y-6">
            <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">I Love</label>
                <div className="flex flex-wrap gap-2">
                    {userProfile.likes.map(like => (
                        <span key={like} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                            {like} <button onClick={() => saveProfile({...userProfile, likes: userProfile.likes.filter(l => l !== like)})}><X className="w-3 h-3" /></button>
                        </span>
                    ))}
                    <button 
                        onClick={() => {
                            const val = prompt("Add a style or variety you like:");
                            if(val) updatePreference('like', val);
                        }} 
                        className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-sm font-bold hover:bg-gray-200"
                    >
                        + Add
                    </button>
                </div>
            </div>

            <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">I Avoid</label>
                <div className="flex flex-wrap gap-2">
                    {userProfile.dislikes.map(dislike => (
                        <span key={dislike} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                            {dislike} <button onClick={() => saveProfile({...userProfile, dislikes: userProfile.dislikes.filter(d => d !== dislike)})}><X className="w-3 h-3" /></button>
                        </span>
                    ))}
                    <button 
                         onClick={() => {
                            const val = prompt("Add a style you dislike:");
                            if(val) updatePreference('dislike', val);
                        }} 
                        className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-sm font-bold hover:bg-gray-200"
                    >
                        + Add
                    </button>
                </div>
            </div>

            <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">Adventurousness</label>
                <div className="flex bg-gray-100 rounded-lg p-1">
                    {['Safe', 'Curious', 'Wild'].map((lvl) => (
                        <button 
                            key={lvl}
                            onClick={() => saveProfile({...userProfile, adventurousness: lvl as any})}
                            className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${userProfile.adventurousness === lvl ? 'bg-white text-[#6b1e2e] shadow-sm' : 'text-gray-400'}`}
                        >
                            {lvl}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-10 max-w-4xl mx-auto min-h-screen">
      {showProfile && renderProfileModal()}

      <div className="flex justify-between items-start mb-8">
        <div>
            <h2 className="text-3xl font-bold text-[#6b1e2e] mb-2 font-serif">Visual Sommelier</h2>
            <p className="text-gray-500 text-sm md:text-base">AI-powered analysis of bottles and tasting menus.</p>
        </div>
        <button 
            onClick={() => setShowProfile(true)}
            className="flex flex-col items-center gap-1 text-[#a68d60] hover:text-[#6b1e2e] transition-colors"
        >
            <div className="w-10 h-10 rounded-full border border-[#a68d60] flex items-center justify-center">
                <User className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider">Profile</span>
        </button>
      </div>

      {/* Mode Toggle */}
      <div className="flex bg-white rounded-full p-1 border border-[#e5e1da] shadow-sm mb-8 max-w-sm mx-auto">
        <button 
            onClick={() => { setMode('bottle'); setResult(null); setMenuResult(null); setError(null); stopCamera(); }}
            className={`flex-1 py-3 rounded-full flex items-center justify-center gap-2 font-bold transition-all ${mode === 'bottle' ? 'bg-[#6b1e2e] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
        >
            <Wine className="w-4 h-4" /> Bottle
        </button>
        <button 
            onClick={() => { setMode('menu'); setResult(null); setMenuResult(null); setError(null); stopCamera(); }}
            className={`flex-1 py-3 rounded-full flex items-center justify-center gap-2 font-bold transition-all ${mode === 'menu' ? 'bg-[#6b1e2e] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
        >
            <FileText className="w-4 h-4" /> Tasting Menu
        </button>
      </div>

      {!showCamera && !result && !menuResult && (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#e5e1da] rounded-3xl p-12 bg-white animate-in zoom-in-95 duration-300">
          <div className={`p-6 rounded-full mb-6 relative ${isOffline ? 'bg-gray-100' : 'bg-[#f8f4f0]'}`}>
            {isOffline ? <WifiOff className="w-12 h-12 text-gray-400" /> : <Camera className="w-12 h-12 text-[#a68d60]" />}
            {!isOffline && (
                <div className="absolute -bottom-2 -right-2 bg-[#6b1e2e] text-white text-[10px] font-bold px-2 py-1 rounded-full">
                    AI Ready
                </div>
            )}
          </div>
          <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">
            {mode === 'bottle' ? 'Scan a Bottle Label' : 'Scan a Tasting List'}
          </h3>
          <p className="text-gray-400 text-center mb-8 max-w-xs text-sm">
            {isOffline 
                ? 'Offline Mode Active. Connect to internet for AI analysis.' 
                : mode === 'bottle' 
                    ? 'Get instant tasting notes, pairings, and vintage info.' 
                    : 'Our AI will read the menu and recommend wines based on YOUR specific palate profile.'}
          </p>
          <button 
            onClick={startCamera}
            disabled={isOffline}
            className={`px-8 py-3 rounded-full font-bold shadow-lg transition-transform flex items-center gap-2 ${isOffline ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' : 'bg-[#6b1e2e] text-white hover:scale-105 shadow-[#6b1e2e]/20'}`}
          >
            {isOffline ? 'Connection Required' : <><Camera className="w-4 h-4" /> Start Camera</>}
          </button>
        </div>
      )}

      {showCamera && (
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-black aspect-[3/4] md:aspect-video flex items-center justify-center">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
          <div className={`absolute inset-0 border-2 border-[#a68d60] opacity-50 pointer-events-none m-8 rounded-xl ${mode === 'menu' ? 'border-dashed' : ''}`}></div>
          {mode === 'menu' && (
             <div className="absolute top-12 bg-black/50 text-white px-4 py-1 rounded-full text-xs font-bold backdrop-blur-md">
                Align menu text within frame
             </div>
          )}
          
          <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-4">
            <button 
              disabled={scanning}
              onClick={captureAndAnalyze}
              className="bg-white text-[#6b1e2e] w-20 h-20 rounded-full flex items-center justify-center shadow-xl disabled:opacity-50 hover:scale-105 transition-transform"
            >
              {scanning ? <Loader2 className="w-8 h-8 animate-spin" /> : <div className="w-16 h-16 rounded-full border-4 border-[#6b1e2e] flex items-center justify-center"><div className="w-12 h-12 bg-[#6b1e2e] rounded-full"></div></div>}
            </button>
            <button 
                onClick={stopCamera}
                className="absolute right-8 top-1/2 -translate-y-1/2 bg-white/20 p-3 rounded-full backdrop-blur-md text-white hover:bg-white/40"
            >
                <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* RESULT: BOTTLE */}
      {result && mode === 'bottle' && (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-[#e5e1da] animate-in slide-in-from-bottom duration-500">
          <div className="bg-[#6b1e2e] p-6 text-white flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold">{result.wineName}</h3>
              <p className="opacity-80">{result.producer} • {result.vintage}</p>
            </div>
            <button 
              onClick={() => {setResult(null); startCamera();}}
              className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-[#a68d60]" />
                <h4 className="font-bold uppercase tracking-widest text-sm text-gray-400">Sommelier's Perspective</h4>
              </div>
              <p className="text-lg leading-relaxed italic text-gray-700">"{result.sommelierNotes}"</p>
              
              <div className="mt-8 flex flex-wrap gap-2">
                <span className="bg-[#f8f4f0] px-4 py-2 rounded-full text-sm font-semibold text-[#6b1e2e]">{result.region}</span>
                <span className="bg-[#f8f4f0] px-4 py-2 rounded-full text-sm font-semibold text-[#6b1e2e]">{result.variety}</span>
              </div>

              {matchedWineId && (
                  <div className="mt-8 pt-6 border-t border-dashed border-[#e5e1da]">
                      <div className="flex items-center justify-between bg-[#fdfcfb] border border-[#6b1e2e]/20 p-4 rounded-2xl">
                          <div>
                              <div className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                                  <Check className="w-3 h-3" /> In Stock
                              </div>
                              <div className="font-bold text-[#1a1a1a]">Available from Cellar</div>
                          </div>
                          <button 
                            onClick={handleQuickAdd}
                            className="bg-[#1a1a1a] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#6b1e2e] transition-colors flex items-center gap-2 shadow-lg"
                          >
                              <ShoppingBag className="w-4 h-4" /> Add to Cart
                          </button>
                      </div>
                  </div>
              )}
            </div>
            
            <div className="bg-[#f8f4f0] rounded-2xl p-6">
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <Wine className="w-4 h-4 text-[#6b1e2e]" /> Perfect Pairings
              </h4>
              <ul className="space-y-3">
                {result.pairings?.map((pairing: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-[#a68d60] font-bold">•</span>
                    {pairing}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* RESULT: TASTING MENU */}
      {menuResult && mode === 'menu' && (
        <div className="space-y-6 animate-in slide-in-from-bottom duration-700">
            <div className="bg-[#a68d60] text-white p-6 rounded-3xl flex justify-between items-center shadow-lg">
                <div>
                    <h3 className="text-xl font-bold font-serif italic">Menu Analysis Complete</h3>
                    <p className="text-sm opacity-90">Personalized for {userProfile.name} • {userProfile.likes.length} Preferences Active</p>
                </div>
                <button 
                    onClick={() => {setMenuResult(null); startCamera();}}
                    className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            <div className="grid gap-4">
                {menuResult.map((item, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-[#e5e1da] shadow-sm flex flex-col md:flex-row gap-4 relative overflow-hidden">
                        <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-xs font-bold uppercase tracking-wider ${item.matchScore > 80 ? 'bg-green-100 text-green-800' : item.matchScore > 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-500'}`}>
                            {item.matchScore}% Match
                        </div>

                        <div className="flex-1">
                            <h4 className="font-bold text-lg text-[#1a1a1a] mb-1">{item.wineName}</h4>
                            <p className="text-sm text-gray-600 mb-3 italic">"{item.reasoning}"</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {item.flavorTags.map(tag => (
                                    <span key={tag} className="text-[10px] bg-[#f8f4f0] text-[#6b1e2e] px-2 py-1 rounded-md font-bold uppercase">{tag}</span>
                                ))}
                            </div>
                            
                            <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                                <span className="text-xs text-gray-400 font-medium">Have you tasted this?</span>
                                <button 
                                    onClick={() => {
                                        updatePreference('like', item.flavorTags[0] || 'This Style');
                                        alert("Profile Updated! We've noted you enjoyed this style.");
                                    }}
                                    className="p-1.5 rounded-full hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"
                                >
                                    <ThumbsUp className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => {
                                        updatePreference('dislike', item.flavorTags[0] || 'This Style');
                                        alert("Profile Updated! We'll avoid similar styles in future.");
                                    }}
                                    className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                                >
                                    <ThumbsDown className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* ERROR DISPLAY */}
      {error && (
        <div className="mt-4 p-6 bg-red-50 text-red-600 rounded-[2rem] text-center border border-red-100 animate-in slide-in-from-top-4 shadow-sm max-w-md mx-auto">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
          <h4 className="font-bold text-lg text-red-800 mb-1">{error.title}</h4>
          <p className="text-sm text-red-700">{error.msg}</p>
          <button onClick={() => setError(null)} className="mt-4 text-xs font-bold underline">Dismiss</button>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default WineScanner;
