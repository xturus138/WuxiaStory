"use client";

import { motion } from "framer-motion";
import { User, Heart, Zap, Scroll, Shield } from "lucide-react";
import { useEffect, useState } from "react";

type Character = {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  qi: number;
  maxQi: number;
  cultivationRealm: string;
  cultivationStage: number;
  sect: string | null;
};

export function CharacterPanel() {
  const [player, setPlayer] = useState<Character | null>(null);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const res = await fetch('/api/world');
        const data = await res.json();
        if (data.characters) {
          const mainChar = data.characters.find((c: any) => c.isPlayer);
          setPlayer(mainChar || null);
        }
      } catch (e) {
        console.error(e);
      }
    };
    
    fetchPlayer();
    const interval = setInterval(fetchPlayer, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!player) {
    return <div className="p-5 border-2 border-ink-dark/10 bg-paper/80 shadow-md">Loading...</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-5 border-2 border-ink-dark/10 bg-paper/80 shadow-md relative"
    >
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/40 m-2"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary/40 m-2"></div>

      <div className="flex items-center gap-4 mb-6 border-b border-border pb-4">
        <div className="w-16 h-16 rounded-full bg-ink-light flex items-center justify-center text-paper overflow-hidden border-2 border-gold shrink-0">
          <User size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-ink-dark font-serif">{player.name}</h2>
          <p className="text-sm text-ink-light italic">Player Character</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-1"><Heart size={14} className="text-primary" /> Health</span>
            <span>{player.health} / {player.maxHealth}</span>
          </div>
          <div className="h-2 bg-ink-dark/10 rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${(player.health / player.maxHealth) * 100}%` }}></div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-1"><Zap size={14} className="text-secondary" /> Qi</span>
            <span>{player.qi} / {player.maxQi}</span>
          </div>
          <div className="h-2 bg-ink-dark/10 rounded-full overflow-hidden">
            <div className="h-full bg-secondary transition-all duration-500" style={{ width: `${Math.min((player.qi / player.maxQi) * 100, 100)}%` }}></div>
          </div>
        </div>

        <div className="pt-4 border-t border-border space-y-2">
          <h3 className="font-bold flex items-center gap-2"><Scroll size={16}/> Cultivation</h3>
          <div className="bg-ink-dark text-paper p-3 text-sm text-center border border-gold font-serif">
            {player.cultivationRealm} (Stage {player.cultivationStage})
          </div>
        </div>

        <div className="pt-2 space-y-2">
          <h3 className="font-bold flex items-center gap-2"><Shield size={16}/> Affiliation</h3>
          <p className="text-sm">{player.sect || "Rogue Cultivator"}</p>
        </div>
      </div>
    </motion.div>
  );
}