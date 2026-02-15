
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { encode, decode, decodeAudioData, floatTo16BitPCM } from '../utils/audio';

const LiveSession: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'active' | 'error'>('idle');
  const [transcript, setTranscript] = useState<string[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const frameIntervalRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close?.();
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();
    setIsActive(false);
    setStatus('idle');
  }, []);

  const handleStart = async () => {
    setStatus('connecting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: { width: 640, height: 480 } 
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const inputCtx = new AudioContext({ sampleRate: 16000 });
      const outputCtx = new AudioContext({ sampleRate: 24000 });
      audioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('active');
            setIsActive(true);
            
            // Microphone stream
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmData = floatTo16BitPCM(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({
                  media: {
                    data: encode(pcmData),
                    mimeType: 'audio/pcm;rate=16000'
                  }
                });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);

            // Camera stream (frames)
            frameIntervalRef.current = window.setInterval(() => {
              if (canvasRef.current && videoRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) {
                  ctx.drawImage(videoRef.current, 0, 0, 320, 240);
                  canvasRef.current.toBlob(async (blob) => {
                    if (blob) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const base64Data = (reader.result as string).split(',')[1];
                        sessionPromise.then(session => {
                          session.sendRealtimeInput({
                            media: { data: base64Data, mimeType: 'image/jpeg' }
                          });
                        });
                      };
                      reader.readAsDataURL(blob);
                    }
                  }, 'image/jpeg', 0.6);
                }
              }
            }, 1000); // 1 frame per second to save bandwidth
          },
          onmessage: async (message: LiveServerMessage) => {
            // Audio output
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              const ctx = outputAudioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.onended = () => sourcesRef.current.delete(source);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            // Transcriptions
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setTranscript(prev => [...prev, `Model: ${text}`]);
            } else if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              setTranscript(prev => [...prev, `You: ${text}`]);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Live error:', e);
            setStatus('error');
          },
          onclose: () => cleanup()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          },
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          systemInstruction: 'You are Lumina, a helpful and intuitive AI companion. You have vision and hearing. Be concise and friendly.'
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error('Setup error:', err);
      setStatus('error');
    }
  };

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Live Pulse</h2>
          <p className="text-gray-400">Low-latency real-time voice and vision session.</p>
        </div>
        <button
          onClick={isActive ? cleanup : handleStart}
          disabled={status === 'connecting'}
          className={`px-8 py-3 rounded-2xl font-bold transition-all shadow-lg flex items-center gap-3 ${
            isActive 
              ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white' 
              : 'bg-indigo-600 text-white hover:bg-indigo-500'
          }`}
        >
          {status === 'connecting' ? (
             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isActive ? (
            <><div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" /> End Session</>
          ) : (
            'Start Session'
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 overflow-hidden">
        {/* Video Feed */}
        <div className="bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden relative group shadow-2xl">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover scale-x-[-1]"
          />
          <canvas ref={canvasRef} width={320} height={240} className="hidden" />
          {!isActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-950/80 backdrop-blur-sm z-10 text-center p-8">
              <div>
                <svg className="w-20 h-20 text-gray-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500 text-lg">Camera feed inactive</p>
              </div>
            </div>
          )}
          {isActive && (
             <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-gray-900/60 backdrop-blur-md rounded-full border border-white/10">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-green-400">Live Feed</span>
             </div>
          )}
        </div>

        {/* Transcription / Activity */}
        <div className="bg-gray-900 rounded-3xl border border-gray-800 flex flex-col overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-gray-800 bg-gray-950/40 backdrop-blur-md flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Real-time Activity</span>
            {isActive && (
               <div className="flex gap-1">
                 {[1,2,3,4,5].map(i => (
                   <div key={i} className={`w-1 h-3 bg-indigo-500/50 rounded-full animate-pulse`} style={{animationDelay: `${i*0.1}s`}} />
                 ))}
               </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {transcript.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-600">
                <p>No activity yet. Speak to Lumina when the session is active.</p>
              </div>
            ) : (
              transcript.map((line, i) => (
                <div key={i} className={`p-3 rounded-xl border ${line.startsWith('You:') ? 'bg-indigo-500/5 border-indigo-500/10 self-end' : 'bg-gray-800/50 border-gray-700'}`}>
                  <p className="text-sm leading-relaxed text-gray-300">{line}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Latency', value: isActive ? '120ms' : '--' },
          { label: 'Audio', value: isActive ? 'PCM 16k/24k' : '--' },
          { label: 'Vision', value: isActive ? '1 FPS (JPEG)' : '--' }
        ].map(stat => (
          <div key={stat.label} className="bg-gray-900/40 border border-gray-800 p-4 rounded-2xl text-center">
            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">{stat.label}</p>
            <p className="text-sm font-mono text-indigo-400">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveSession;
