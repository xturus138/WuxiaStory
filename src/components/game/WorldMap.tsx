"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { MapPin, Mountain, Tent, TreePine } from "lucide-react";

type Location = {
  id: string;
  name: string;
  type: string;
  description: string;
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
              className="p-4 bg-paper/90 border border-ink-dark/20 hover:border-gold transition-colors flex items-start gap-4 cursor-pointer"
            >
              <div className="p-3 bg-ink-dark/5 rounded-full shrink-0">
                {getIcon(loc.type)}
              </div>
              <div>
                <h3 className="font-bold text-lg text-ink-dark font-serif flex items-center gap-2">
                  {loc.name}
                  <span className="text-[10px] uppercase px-2 py-0.5 bg-ink-dark text-paper rounded-sm">
                    {loc.type}
                  </span>
                </h3>
                <p className="text-sm text-ink-light mt-1">{loc.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}