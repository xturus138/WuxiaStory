"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { MapPin, Mountain, Tent, TreePine, Sparkles, AlertTriangle, Swords } from "lucide-react";

type Location = {
  id: string;
  name: string;
  type: string;
  description: string;
  qiDensity: number;
  dangerLevel: number;
};

export function WorldMap() {
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch('/api/world');
        const data = await res.json();
        if (data.locations) {
          setLocations(data.locations);
        }
      } catch (e) {
        console.error(e);
      }
    };
    
    fetchLocations();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'sect': return <Mountain className="text-secondary" size={32} />;
      case 'town': return <Tent className="text-gold" size={32} />;
      case 'wilderness': return <TreePine className="text-primary" size={32} />;
      case 'ruin': return <Swords className="text-red-600" size={32} />;
      default: return <MapPin size={32} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-ink-dark/5 p-6">
      <h2 className="font-bold text-2xl font-serif mb-6 text-center text-ink-dark border-b border-border pb-4">Jianghu Map</h2>
      
      <div className="flex-1 relative bg-paper border border-border shadow-sm overflow-hidden">
        {/* Stylized background representing a map */}
        <div 
          className="absolute inset-0 opacity-10 bg-repeat" 
          style={{ backgroundImage: "url('data:image/svg+xml;utf8,%3Csvg width=\"60\" height=\"60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M0 30 Q 15 0, 30 30 T 60 30\" fill=\"none\" stroke=\"%23000\" stroke-width=\"1\"/%3E%3C/svg%3E')" }} 
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-8 relative z-10 h-full overflow-y-auto">
          {locations.map((loc, idx) => (
            <motion.div 
              key={loc.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 bg-paper/90 border border-ink-dark/20 hover:border-gold transition-colors flex items-start gap-4 cursor-pointer relative overflow-hidden"
            >
              <div className="p-3 bg-ink-dark/5 rounded-full shrink-0">
                {getIcon(loc.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-lg text-ink-dark font-serif flex items-center gap-2">
                    {loc.name}
                  </h3>
                  <span className="text-[10px] uppercase px-2 py-0.5 bg-ink-dark text-paper rounded-sm">
                    {loc.type}
                  </span>
                </div>
                <p className="text-xs text-ink-light mb-3 line-clamp-2">{loc.description}</p>
                
                <div className="flex items-center gap-4 border-t border-border pt-2">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-secondary">
                    <Sparkles size={12} />
                    <span>Qi: x{loc.qiDensity}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-red-500">
                    <AlertTriangle size={12} />
                    <span>Danger: {loc.dangerLevel}</span>
                  </div>
                </div>
              </div>

              {/* Danger/Qi background indicator */}
              <div 
                className="absolute right-0 bottom-0 h-1 w-full" 
                style={{ 
                  background: `linear-gradient(to right, #4ade80 ${loc.qiDensity * 10}%, #ef4444 ${loc.dangerLevel * 10}%)`,
                  opacity: 0.2
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}