"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Sword, Wind, Play } from "lucide-react";

type LogEntry = {
  id: string;
  title: string;
  description: string;
  type: string;
  timestamp: number;
};

export function EventLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize World on mount
  useEffect(() => {
    fetch('/api/init', { method: 'POST' }).then(() => fetchWorldState());
  }, []);

  const fetchWorldState = async () => {
    try {
      const res = await fetch('/api/world');
      const data = await res.json();
      if (data.events) {
        // Sort ascending for chronological display
        setLogs(data.events.sort((a: LogEntry, b: LogEntry) => a.timestamp - b.timestamp));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // World Tick Polling
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSimulating) {
      interval = setInterval(async () => {
        await fetch('/api/tick', { method: 'POST' });
        fetchWorldState();
      }, 5000); // 5 seconds per world tick
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const toggleSimulation = () => {
    setIsSimulating(!isSimulating);
  };

  const manualTick = async () => {
    await fetch('/api/tick', { method: 'POST' });
    fetchWorldState();
  };

  return (
    <div className="flex flex-col h-full bg-ink-dark/5">
      <div className="p-4 border-b border-border bg-paper flex justify-between items-center">
        <h2 className="font-bold text-lg font-serif">Jianghu Timeline</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-ink-light flex items-center gap-1">
            {isSimulating ? (
              <><span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span> Simulating</>
            ) : (
              <><span className="w-2 h-2 rounded-full bg-ink-light"></span> Paused</>
            )}
          </span>
          <button 
            onClick={toggleSimulation}
            className={`px-3 py-1 rounded text-xs font-bold border transition-colors flex items-center gap-1 ${isSimulating ? 'border-primary text-primary hover:bg-primary/10' : 'border-secondary text-secondary hover:bg-secondary/10'}`}
          >
            {isSimulating ? 'Pause World' : 'Resume World'}
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
        {logs.map((log) => (
          <motion.div 
            key={log.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 border-l-4 ${log.type === 'world' ? 'border-gold bg-gold/5' : log.type === 'rumor' ? 'border-secondary bg-secondary/5' : 'border-ink-dark bg-paper'} shadow-sm`}
          >
            <div className="text-xs text-ink-light mb-1 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</div>
            <p className="text-ink-dark font-serif text-lg leading-relaxed">{log.description}</p>
          </motion.div>
        ))}
      </div>

      <div className="p-4 bg-paper border-t border-border mt-auto">
        <div className="flex gap-2">
          <button onClick={manualTick} className="flex-1 py-3 bg-ink-dark text-paper font-bold shadow-sm hover:bg-ink-light transition-colors flex items-center justify-center gap-2">
            <Play size={18} /> Advance Time (1 Tick)
          </button>
        </div>
      </div>
    </div>
  );
}