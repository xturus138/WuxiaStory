"use client";

import { useState } from "react";
import { CharacterPanel } from "@/components/game/CharacterPanel";
import { EventLog } from "@/components/game/EventLog";
import { WorldRumors } from "@/components/game/WorldRumors";
import { WorldMap } from "@/components/game/WorldMap";
import { ScrollText, Map as MapIcon } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<'timeline' | 'map'>('timeline');

  return (
    <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0">
      
      {/* Left Column: Character & Status */}
      <section className="lg:col-span-3 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
        <CharacterPanel />
      </section>

      {/* Center Column: Main Interactive Area & Story */}
      <section className="lg:col-span-6 flex flex-col overflow-hidden bg-paper/50 border border-border shadow-sm rounded-sm backdrop-blur-sm relative">
        <div className="absolute top-0 left-0 right-0 z-20 flex border-b border-border bg-paper shadow-sm">
          <button 
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 py-3 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'timeline' ? 'bg-ink-dark text-paper' : 'text-ink-dark hover:bg-ink-dark/5'}`}
          >
            <ScrollText size={18} /> Timeline
          </button>
          <button 
            onClick={() => setActiveTab('map')}
            className={`flex-1 py-3 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'map' ? 'bg-ink-dark text-paper' : 'text-ink-dark hover:bg-ink-dark/5'}`}
          >
            <MapIcon size={18} /> World Map
          </button>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 pt-12">
          {activeTab === 'timeline' ? <EventLog /> : <WorldMap />}
        </div>
      </section>

      {/* Right Column: World & Faction News */}
      <section className="lg:col-span-3 flex flex-col overflow-y-auto pl-2 custom-scrollbar">
        <WorldRumors />
      </section>
      
    </main>
  );
}