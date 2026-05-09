"use client";

import { motion } from "framer-motion";
import { Flame, Crown } from "lucide-react";
import { useEffect, useState } from "react";

type LogEntry = {
  id: string;
  title: string;
  description: string;
  type: string;
  timestamp: number;
};

export function WorldRumors() {
  const [rumors, setRumors] = useState<LogEntry[]>([]);

  useEffect(() => {
    const fetchRumors = async () => {
      try {
        const res = await fetch('/api/world');
        const data = await res.json();
        if (data.events) {
          const onlyRumors = data.events.filter((e: LogEntry) => e.type === 'rumor').slice(0, 5);
          setRumors(onlyRumors);
        }
      } catch (e) {
        console.error(e);
      }
    };
    
    fetchRumors();
    const interval = setInterval(fetchRumors, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="p-4 border border-border bg-paper/80 relative">
        <div className="absolute -top-3 left-4 bg-paper px-2 text-sm font-bold text-gold flex items-center gap-1">
          <Flame size={14} /> Jianghu Rumors
        </div>
        <ul className="space-y-3 text-sm mt-2">
          {rumors.length === 0 ? (
            <li className="italic text-ink-light">The jianghu is quiet...</li>
          ) : rumors.map(rumor => (
            <li key={rumor.id} className="border-b border-border pb-2 italic text-ink-light line-clamp-2">
              "{rumor.description}"
            </li>
          ))}
        </ul>
      </div>
      
      <div className="p-4 border border-border bg-paper/80 relative">
        <div className="absolute -top-3 left-4 bg-paper px-2 text-sm font-bold text-primary flex items-center gap-1">
          <Crown size={14} /> Top Cultivators
        </div>
        <ul className="space-y-3 text-sm mt-2">
          <li className="flex justify-between border-b border-border pb-2">
            <span className="font-bold">Elder Zhao</span>
            <span className="text-xs text-ink-light">Core Formation</span>
          </li>
          <li className="flex justify-between pb-1">
            <span className="font-bold">Wang Wei</span>
            <span className="text-xs text-ink-light">Qi Condensation</span>
          </li>
        </ul>
      </div>

    </motion.div>
  );
}