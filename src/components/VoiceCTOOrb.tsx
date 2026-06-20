"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mic, Send, Volume2, VolumeX } from "lucide-react";

type TabId = "dashboard" | "digitaltwin" | "parallel" | "boardroom" | "predictor" | "hacker" | "incidents" | "timemachine" | "pipeline" | "gitlab";

interface ChatMessage {
  sender: "user" | "bot";
  text: string;
}

interface VoiceCTOProps {
  setActiveTab: React.Dispatch<React.SetStateAction<TabId>>;
  triggerBoardroom: () => void;
}

export default function VoiceCTOOrb({ setActiveTab, triggerBoardroom }: VoiceCTOProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState("STANDBY");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: "bot", text: "Voice CTO Jarvis active. Speak or type commands. Try: 'open boardroom', 'simulate pipeline failure', 'risk summary', or 'incident command'." }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const historyRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const isMutedRef = useRef(isMuted);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  const speakMessage = useCallback((text: string) => {
    if (isMutedRef.current || typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 0.95;
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  }, []);

  const handleCommandSubmit = useCallback((command: string) => {
    if (!command.trim()) return;

    setMessages(prev => [...prev, { sender: "user", text: command }]);
    setStatus("THINKING...");

    setTimeout(() => {
      let reply = "Accessing GitLab Orbit codebase details. I\u2019ve logged the query. Can you clarify the target repository?";
      const cmd = command.toLowerCase();

      if (cmd.includes("boardroom") || cmd.includes("meeting") || cmd.includes("debate")) {
        reply = "Understood, Commander. Navigating to the AI Boardroom and convening the executive agents for analysis.";
        setActiveTab("boardroom");
        triggerBoardroom();
      } else if (cmd.includes("pipeline") || cmd.includes("healing") || cmd.includes("ci")) {
        reply = "Acknowledged. Switching to the Self-Healing Pipeline console. Auto-monitoring active.";
        setActiveTab("pipeline");
      } else if (cmd.includes("incident") || cmd.includes("outage") || cmd.includes("incidents")) {
        reply = "Opening the incident response deck. INC-4029 telemetry on screen.";
        setActiveTab("incidents");
      } else if (cmd.includes("twin") || cmd.includes("topology") || cmd.includes("graph")) {
        reply = "Initiating GitLab codebase topology twin. Core services maps loaded.";
        setActiveTab("digitaltwin");
      } else if (cmd.includes("parallel") || cmd.includes("universe") || cmd.includes("scenario")) {
        reply = "Right away, sir. Initializing the Parallel Universe Simulator. Awaiting core parameters.";
        setActiveTab("parallel");
      } else if (cmd.includes("predict") || cmd.includes("doom") || cmd.includes("risk")) {
        reply = "Doom Predictor active. Synthesizing risk metrics and release vectors.";
        setActiveTab("predictor");
      } else if (cmd.includes("security") || cmd.includes("hacker") || cmd.includes("arena")) {
        reply = "Opening the Security Arena. Red Team and Blue Team simulations synchronized.";
        setActiveTab("hacker");
      } else if (cmd.includes("time") || cmd.includes("history")) {
        reply = "Accessing historical archives. Loading the codebase Time Machine.";
        setActiveTab("timemachine");
      } else if (cmd.includes("dashboard") || cmd.includes("mission") || cmd.includes("control")) {
        reply = "Returning to Mission Control. Synchronizing real-time telemetry.";
        setActiveTab("dashboard");
      } else if (cmd.includes("deploy") || cmd.includes("ship")) {
        reply = "We are currently not ready to deploy. Release Doom Predictor indicates an elevated 64% incident risk on the authentication database cluster. Consensuses suggest delaying the release by 2 weeks to clear architectural debt.";
      } else if (cmd.includes("risk") || cmd.includes("threat")) {
        reply = "Our primary risk factor is INC-4029 connection pool starvation on auth-service replica nodes. Mitigation stands active at 72% recovery.";
      } else if (cmd.includes("confidence")) {
        reply = "Release confidence stands at 84% (Safe to Ship) with only 4% rollback risk predicted.";
      }

      setMessages(prev => [...prev, { sender: "bot", text: reply }]);
      setStatus("SPEAKING...");
      speakMessage(reply);
      
      setTimeout(() => {
        setStatus("STANDBY");
      }, 3000);
    }, 1200);
  }, [setActiveTab, triggerBoardroom, speakMessage]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognitionConstructor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognitionConstructor) {
        const rec = new SpeechRecognitionConstructor();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "en-US";

        rec.onstart = () => {
          setStatus("LISTENING...");
          setIsListening(true);
        };

        rec.onerror = () => {
          setStatus("STANDBY");
          setIsListening(false);
        };

        rec.onend = () => {
          setStatus("STANDBY");
          setIsListening(false);
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rec.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          handleCommandSubmit(text);
        };

        recognitionRef.current = rec;
      }
    }
  }, [handleCommandSubmit]);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleMic = () => {
    const rec = recognitionRef.current;
    if (!rec) {
      alert("Speech recognition is not supported in this browser. Please type your command.");
      return;
    }

    if (isListening) {
      rec.stop();
    } else {
      rec.start();
    }
  };

  return (
    <div className="absolute bottom-[140px] right-8 z-50 flex flex-col items-center">
      {/* Visual Floating Orb */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-[60px] h-[60px] flex flex-col items-center justify-center cursor-pointer group"
      >
        <div className="relative w-11 h-11 flex items-center justify-center">
          <div className="w-4 h-4 bg-[#00f0ff] rounded-full voice-core-pulse z-10" />
          <div className="absolute w-[24px] h-[24px] border border-[#00f0ff] rounded-full opacity-30 voice-ring-spin-cw border-t-transparent" />
          <div className="absolute w-[34px] h-[34px] border border-[#00f0ff] rounded-full opacity-35 voice-ring-spin-ccw border-b-transparent" />
          <div className="absolute w-[44px] h-[44px] border border-[#00f0ff] rounded-full opacity-20 voice-ring-spin-cw border-l-transparent" />
        </div>
        <span className="font-mono text-[9px] font-bold tracking-wider text-[#00f0ff] mt-1.5 uppercase select-none text-shadow-[0_0_8px_rgba(0,240,255,0.6)]">
          VOICE CTO
        </span>
      </div>

      {/* Floating Speech Dialog Overlay */}
      {isOpen && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-[75px] right-0 w-[330px] glass-panel p-4 flex flex-col gap-3 z-50 border border-white/5 shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-300"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <div>
              <h4 className="text-xs font-bold tracking-tight text-white uppercase">Voice CTO Jarvis</h4>
              <span className="font-mono text-[9px] text-[#00f0ff] uppercase">{status}</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsMuted(!isMuted)} 
                className="text-white/60 hover:text-white transition"
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
            </div>
          </div>

          {/* History */}
          <div 
            ref={historyRef}
            className="h-[180px] overflow-y-auto flex flex-col gap-2.5 pr-1"
          >
            {messages.map((msg, i) => (
              <p 
                key={i} 
                className={`text-[11px] leading-relaxed pl-2.5 py-0.5 border-l-2 ${
                  msg.sender === "bot" 
                    ? "text-slate-300 border-[#00f0ff]" 
                    : "text-white border-purple-500 self-end w-[90%]"
                }`}
              >
                {msg.text}
              </p>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5">
            <button 
              onClick={toggleMic}
              className={`p-2 rounded-lg border transition ${
                isListening 
                  ? "bg-red-500/10 border-red-500/30 text-red-400" 
                  : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
              }`}
            >
              <Mic size={14} className={isListening ? "animate-pulse" : ""} />
            </button>
            <input 
              type="text" 
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCommandSubmit(inputVal);
                  setInputVal("");
                }
              }}
              placeholder="Submit prompt code..."
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#00f0ff]/40 transition"
            />
            <button 
              onClick={() => {
                handleCommandSubmit(inputVal);
                setInputVal("");
              }}
              className="p-2 rounded-lg bg-[#00f0ff] text-slate-950 font-bold hover:bg-[#00f0ff]/80 transition"
            >
              <Send size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
