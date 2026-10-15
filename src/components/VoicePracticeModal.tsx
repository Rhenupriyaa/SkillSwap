import React, { useState, useEffect, useRef } from 'react';
import { useSkillSwap } from '../context/SkillSwapContext.tsx';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Radio,
  Sparkles,
  Send,
  AlertCircle,
  CheckCircle2,
  Headphones,
  RotateCcw,
} from 'lucide-react';

interface VoicePracticeModalProps {
  onClose: () => void;
  initialSkill?: string;
}

const PRACTICE_TOPICS = [
  {
    id: 'spanish',
    name: 'Conversational Spanish',
    category: 'Languages',
    starterPrompt: '¡Hola! ¿Cómo estás? Me gustaría practicar cómo pedir comida en un restaurante en español.',
    accent: 'es',
    voice: 'Zephyr',
    description: 'Immersive Spanish dialogue, pronunciation checks, and colloquial phrases.',
  },
  {
    id: 'python',
    name: 'Python Programming',
    category: 'Tech & Coding',
    starterPrompt: 'Can you explain the difference between a list comprehension and a generator expression with an example?',
    voice: 'Puck',
    description: 'Debug logic, explain recursion trees, and walk through algorithm problems aloud.',
  },
  {
    id: 'speaking',
    name: 'Public Speaking & Pitching',
    category: 'Communication',
    starterPrompt: 'I have a 60-second pitch for my campus startup. Can you critique my hook and pacing?',
    voice: 'Fenrir',
    description: 'Practice speech delivery, pacing, persuasive hooks, and reducing filler words.',
  },
  {
    id: 'cooking',
    name: 'Authentic Italian Cooking',
    category: 'Culinary',
    starterPrompt: 'Why does my carbonara sauce scramble instead of staying silky and creamy?',
    voice: 'Kore',
    description: 'Master kitchen timing, sauce emulsion, knife skills, and nonna secrets.',
  },
];

export const VoicePracticeModal: React.FC<VoicePracticeModalProps> = ({
  onClose,
  initialSkill,
}) => {
  const { currentUser, addDemoCredits } = useSkillSwap();
  const [selectedTopic, setSelectedTopic] = useState(() => {
    return (
      PRACTICE_TOPICS.find((t) => t.name.toLowerCase().includes(initialSkill?.toLowerCase() || '')) ||
      PRACTICE_TOPICS[0]
    );
  });

  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inputText, setInputText] = useState('');
  const [transcript, setTranscript] = useState<
    Array<{ sender: 'user' | 'model'; text: string; time: string }>
  >([
    {
      sender: 'model',
      text: `Hello ${currentUser.name}! I am your Gemini 3.8 Live practice partner. We're practicing ${selectedTopic.name}. Tap the mic to talk, or send a question!`,
      time: 'Just now',
    },
  ]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Audio Context and WebSocket refs
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextAudioStartTimeRef = useRef<number>(0);

  // Connect to Gemini 3.8 Live WebSocket on mount or topic change
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/live?skill=${encodeURIComponent(
      selectedTopic.name
    )}`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setStatusMessage('Connected to Gemini 3.8 Live API');
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'audio' && data.audio) {
            setIsSpeaking(true);
            playPcmChunk(data.audio);
            if (data.text) {
              appendTranscript('model', data.text);
            }
          } else if (data.type === 'interrupted') {
            stopAudioPlayback();
            setIsSpeaking(false);
          } else if (data.type === 'turn_complete') {
            setIsSpeaking(false);
          } else if (data.type === 'error') {
            setStatusMessage(`Notice: ${data.message}`);
          }
        } catch (e) {
          console.error('Error handling WebSocket message:', e);
        }
      };

      ws.onerror = (e) => {
        console.warn('WebSocket connection notice (using REST fallback):', e);
        setStatusMessage('Live streaming fallback active');
      };

      ws.onclose = () => {
        setIsConnected(false);
      };

      return () => {
        ws.close();
        cleanupMic();
      };
    } catch (err) {
      console.warn('Could not establish Live WebSocket:', err);
    }
  }, [selectedTopic]);

  const appendTranscript = (sender: 'user' | 'model', text: string) => {
    setTranscript((prev) => [
      ...prev,
      {
        sender,
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const playPcmChunk = (base64Audio: string) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000,
        });
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const binary = atob(base64Audio);
      const len = binary.length;
      const buffer = new ArrayBuffer(len);
      const view = new DataView(buffer);
      for (let i = 0; i < len; i++) {
        view.setUint8(i, binary.charCodeAt(i));
      }

      // Convert 16-bit PCM to Float32
      const samples = len / 2;
      const audioBuffer = ctx.createBuffer(1, samples, 24000);
      const channelData = audioBuffer.getChannelData(0);

      for (let i = 0; i < samples; i++) {
        const int16 = view.getInt16(i * 2, true);
        channelData[i] = int16 / 32768.0;
      }

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      const currentTime = ctx.currentTime;
      if (nextAudioStartTimeRef.current < currentTime) {
        nextAudioStartTimeRef.current = currentTime;
      }
      source.start(nextAudioStartTimeRef.current);
      nextAudioStartTimeRef.current += audioBuffer.duration;

      source.onended = () => {
        if (ctx.currentTime >= nextAudioStartTimeRef.current) {
          setIsSpeaking(false);
        }
      };
    } catch (err) {
      console.error('Audio playback error:', err);
      setIsSpeaking(false);
    }
  };

  const stopAudioPlayback = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    nextAudioStartTimeRef.current = 0;
  };

  const cleanupMic = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    setIsRecording(false);
  };

  const toggleMicrophone = async () => {
    if (isRecording) {
      cleanupMic();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const inputAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });

      const source = inputAudioCtx.createMediaStreamSource(stream);
      const processor = inputAudioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const input = e.inputBuffer.getChannelData(0);
          // Convert Float32 to 16-bit PCM
          const buffer = new ArrayBuffer(input.length * 2);
          const view = new DataView(buffer);
          for (let i = 0; i < input.length; i++) {
            const s = Math.max(-1, Math.min(1, input[i]));
            view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
          }
          // Convert to base64
          let binary = '';
          const bytes = new Uint8Array(buffer);
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const base64 = btoa(binary);
          wsRef.current.send(JSON.stringify({ audio: base64 }));
        }
      };

      source.connect(processor);
      processor.connect(inputAudioCtx.destination);
      setIsRecording(true);
      setStatusMessage('Listening... speak into your microphone.');
    } catch (err: any) {
      console.warn('Microphone access denied or unavailable:', err);
      setStatusMessage('Microphone access denied. You can type or use starter voice prompts below!');
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim()) return;

    appendTranscript('user', textToSend);
    setInputText('');

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ text: textToSend }));
    } else {
      // REST fallback
      try {
        setStatusMessage('Generating voice response with Gemini 3.8 Live...');
        const res = await fetch('/api/voice-practice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: textToSend,
            skill: selectedTopic.name,
            voice: selectedTopic.voice,
          }),
        });
        const data = await res.json();
        if (data.text) {
          appendTranscript('model', data.text);
          if (data.audio) {
            playPcmChunk(data.audio);
          }
        }
        setStatusMessage(null);
      } catch (e: any) {
        setStatusMessage('Error getting voice response.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
              <Radio className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold tracking-tight">
                  Gemini 3.8 Live Voice Tutor
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-400 text-indigo-950 rounded-full">
                  gemini-3.8-live
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                Real-time spoken conversation & pronunciation practice
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Skill Selector Bar */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
            Topic:
          </span>
          {PRACTICE_TOPICS.map((topic) => (
            <button
              key={topic.id}
              onClick={() => {
                setSelectedTopic(topic);
                setTranscript([
                  {
                    sender: 'model',
                    text: `Switched to ${topic.name}! Ready to practice together.`,
                    time: 'Just now',
                  },
                ]);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedTopic.id === topic.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {topic.name}
            </button>
          ))}
        </div>

        {/* Chat / Transcript Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5 bg-slate-50/40">
          {transcript.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  {msg.sender === 'user' ? currentUser.name : `Live Tutor (${selectedTopic.name})`}
                </span>
                <span className="text-[10px] text-slate-500">· {msg.time}</span>
              </div>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs font-medium leading-relaxed shadow-2xs ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-xs'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Visual Speaking / Wave animation */}
          {isSpeaking && (
            <div className="flex items-center gap-2 p-3 bg-violet-50 border border-violet-200/70 rounded-2xl w-fit animate-in fade-in">
              <Headphones className="w-4 h-4 text-violet-600 animate-bounce" />
              <div className="flex items-center gap-1">
                <span className="w-1 h-3 bg-violet-600 rounded-full animate-pulse"></span>
                <span className="w-1 h-5 bg-violet-600 rounded-full animate-pulse delay-75"></span>
                <span className="w-1 h-2 bg-violet-600 rounded-full animate-pulse delay-150"></span>
                <span className="w-1 h-4 bg-violet-600 rounded-full animate-pulse delay-100"></span>
              </div>
              <span className="text-xs font-bold text-violet-800">
                Speaking via Live Audio (24kHz)...
              </span>
            </div>
          )}
        </div>

        {/* Quick starter prompts */}
        <div className="px-5 py-2.5 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Starter:
          </span>
          <button
            onClick={() => handleSendMessage(selectedTopic.starterPrompt)}
            className="text-xs text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200/60 truncate max-w-sm transition-colors text-left"
          >
            "{selectedTopic.starterPrompt}"
          </button>
        </div>

        {/* Voice Input & Controls */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col gap-2">
          {statusMessage && (
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 px-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>{statusMessage}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Live Mic Button */}
            <button
              onClick={toggleMicrophone}
              className={`p-3 rounded-2xl shadow-sm transition-all flex items-center gap-2 font-bold text-xs ${
                isRecording
                  ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isRecording ? <Mic className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              <span className="hidden sm:inline">
                {isRecording ? 'Listening (Tap to Stop)' : 'Live Mic'}
              </span>
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={`Ask in ${selectedTopic.name}...`}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim()}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white rounded-xl shadow-xs transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
