
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { encodeAudio, decodeAudio, decodeAudioData } from '../services/geminiService';
import { addToPlanner, addToFavorites, toolsDef } from '../services/actionService';
import { Mic, MicOff, Volume2, ShieldAlert, Wine, Loader2, Sparkles, Key, Info, MapPin, Heart, Settings } from 'lucide-react';

const LiveSommelier: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string>('');
  const [hasSelectedKey, setHasSelectedKey] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  useEffect(() => {
    const checkKeyStatus = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasSelectedKey(hasKey);
      }
    };
    checkKeyStatus();
  }, []);

  const cleanup = useCallback(() => {
    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch (e) {}
      sessionRef.current = null;
    }
    sourcesRef.current.forEach(s => {
      try { s.stop(); } catch (e) {}
    });
    sourcesRef.current.clear();
    setIsActive(false);
    setIsConnecting(false);
    nextStartTimeRef.current = 0;
  }, []);

  const handleKeySetup = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasSelectedKey(true);
      setError(null);
    }
  };

  const startSession = async () => {
    const checkKey = window.aistudio?.hasSelectedApiKey ? await window.aistudio.hasSelectedApiKey() : false;
    if (!checkKey && !hasSelectedKey) {
      setError("Please select a valid API key first.");
      return;
    }

    setIsConnecting(true);
    setError(null);
    setTranscription('');
    setLastAction(null);

    try {
      // Use process.env.API_KEY as per guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      }
      if (!outputAudioContextRef.current) {
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      await Promise.all([
        audioContextRef.current.state === 'suspended' ? audioContextRef.current.resume() : Promise.resolve(),
        outputAudioContextRef.current.state === 'suspended' ? outputAudioContextRef.current.resume() : Promise.resolve()
      ]);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: "You are a world-class Master Sommelier for the Hunter Valley. You are refined, witty, and deeply knowledgeable. You can also use tools to add wineries to the user's planner or favorites if they ask.",
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          tools: toolsDef, 
        },
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encodeAudio(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setTranscription(prev => prev + ' ' + message.serverContent?.outputTranscription?.text);
            }

            if (message.toolCall) {
                for (const fc of message.toolCall.functionCalls) {
                    let result = "Failed to execute.";
                    try {
                        if (fc.name === 'addToPlanner') {
                            const name = fc.args['wineryName'] as string;
                            result = addToPlanner(name);
                            setLastAction(`Added ${name} to Planner`);
                        } else if (fc.name === 'addToFavorites') {
                            const name = fc.args['name'] as string;
                            const type = fc.args['type'] as any;
                            result = addToFavorites(name, type);
                            setLastAction(`Saved ${name} to Favorites`);
                        }
                    } catch(e) { console.error(e); }
                    
                    sessionPromise.then((session) => {
                        session.sendToolResponse({
                            functionResponses: {
                                id: fc.id,
                                name: fc.name,
                                response: { result: result }
                            }
                        });
                    });
                }
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(
                decodeAudio(base64Audio),
                ctx,
                24000,
                1
              );
              
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => { try { s.stop(); } catch (e) {} });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e: any) => {
            console.error("Live Session Error", e);
            if (e.message?.toLowerCase().includes("not found") || e.message?.toLowerCase().includes("network")) {
              setHasSelectedKey(false);
              setError("Session failed. This often happens with restricted or invalid API keys. Please re-select a paid key.");
            } else {
              setError("A network error occurred. Please check your connection and try again.");
            }
            cleanup();
          },
          onclose: () => cleanup()
        }
      });

      sessionRef.current = await sessionPromise;

    } catch (err: any) {
      console.error("Session Startup Error", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError("Microphone access denied. Please unblock the microphone in your browser settings to talk to the Sommelier.");
      } else if (err.name === 'NotFoundError') {
          setError("No microphone found. Please connect a microphone to use Live mode.");
      } else if (err.message?.toLowerCase().includes("not found") || err.message?.toLowerCase().includes("network")) {
        setHasSelectedKey(false);
        setError("Failed to initialize session. Please ensure your API key is from a project with billing enabled.");
      } else {
        setError("Unable to start audio session. Please refresh and try again.");
      }
      setIsConnecting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-in fade-in duration-500 overflow-y-auto">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="inline-flex p-4 bg-[#6b1e2e]/10 rounded-full">
            <Wine className="w-12 h-12 text-[#6b1e2e]" />
          </div>
          <h2 className="text-5xl font-black text-[#1a1a1a] font-serif tracking-tight">Somm<span className="text-[#a68d60]">.</span> Live</h2>
          <p className="text-gray-500 text-lg max-w-md mx-auto">Real-time, zero-latency conversation with our AI Master Sommelier.</p>
        </div>

        <div className="relative flex items-center justify-center h-64">
          {isActive ? (
            <div className="flex items-center gap-2">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-3 bg-[#6b1e2e] rounded-full animate-bounce" 
                  style={{ 
                    height: `${30 + Math.random() * 80}px`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '0.8s'
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="w-56 h-56 rounded-full border-4 border-dashed border-[#e5e1da] flex items-center justify-center bg-white shadow-inner">
              <Mic className="w-20 h-20 text-[#e5e1da]" />
            </div>
          )}
          
          {isActive && (
            <div className="absolute -top-4 bg-[#a68d60] text-white px-6 py-2 rounded-full text-sm font-black tracking-widest animate-pulse shadow-lg">
              LISTENING
            </div>
          )}
        </div>
        
        {lastAction && (
             <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-bold text-sm inline-flex items-center gap-2 animate-in zoom-in slide-in-from-bottom-2">
                 {lastAction.includes('Planner') ? <MapPin className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
                 {lastAction}
             </div>
        )}

        {transcription && (
          <div className="bg-white p-8 rounded-[2rem] border border-[#e5e1da] shadow-sm min-h-[120px] flex items-center justify-center max-h-40 overflow-y-auto">
            <p className="italic text-gray-700 text-lg font-serif">"{transcription.trim()}"</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-4 bg-red-50 text-red-600 p-6 rounded-[2rem] border border-red-100 max-w-md mx-auto">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <p className="text-sm font-bold leading-tight">{error}</p>
            </div>
            {!hasSelectedKey && !error.includes("microphone") && (
              <button 
                onClick={handleKeySetup}
                className="bg-red-600 text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-all min-h-[44px]"
              >
                Reset API Key
              </button>
            )}
            {error.includes("microphone") && (
                <div className="text-xs text-red-500 bg-white px-3 py-1 rounded-lg border border-red-100 flex items-center gap-1">
                    <Settings className="w-3 h-3" /> Check Browser Settings &gt; Privacy &gt; Microphone
                </div>
            )}
          </div>
        )}

        <div className="flex justify-center flex-col items-center gap-4">
          {!hasSelectedKey ? (
            <div className="bg-amber-50 border border-amber-200 p-8 rounded-[2.5rem] space-y-6 max-w-sm shadow-sm">
              <div className="flex items-center gap-2 justify-center text-amber-800">
                <Info className="w-5 h-5" />
                <h4 className="font-bold uppercase text-xs tracking-widest">Setup Required</h4>
              </div>
              <p className="text-sm text-amber-900 leading-relaxed font-medium">Gemini Live requires a paid API key from a project with billing enabled.</p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleKeySetup}
                  className="w-full bg-[#1a1a1a] text-white py-4 rounded-full font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-black transition-all min-h-[48px]"
                >
                  <Key className="w-4 h-4 text-[#a68d60]" />
                  Select Key & Connect
                </button>
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-xs text-amber-600 underline font-bold uppercase tracking-widest">
                  Billing Instructions
                </a>
              </div>
            </div>
          ) : (
            <>
              {!isActive ? (
                <button 
                  disabled={isConnecting}
                  onClick={startSession}
                  className="bg-[#6b1e2e] text-white px-12 py-5 rounded-full text-xl font-bold shadow-[0_10px_30px_rgba(107,30,46,0.3)] hover:bg-[#852539] transition-all flex items-center gap-4 disabled:opacity-50 hover:scale-105 active:scale-95 min-h-[56px]"
                >
                  {isConnecting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Mic className="w-6 h-6" />}
                  {isConnecting ? 'Establishing Connection...' : 'Enter the Cellar Door'}
                </button>
              ) : (
                <button 
                  onClick={cleanup}
                  className="bg-white border-2 border-[#e5e1da] text-[#1a1a1a] px-12 py-5 rounded-full text-xl font-bold hover:bg-[#f8f4f0] transition-all flex items-center gap-4 shadow-sm min-h-[56px]"
                >
                  <MicOff className="w-6 h-6" />
                  Close Conversation
                </button>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-center gap-6 md:gap-10 pt-8 border-t border-[#e5e1da] max-w-md mx-auto">
          <div className="flex flex-col items-center gap-1">
            <Volume2 className="w-5 h-5 text-gray-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Low Latency</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <ShieldAlert className="w-5 h-5 text-gray-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Encrypted</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Sparkles className="w-5 h-5 text-gray-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Real-Time AI</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveSommelier;
