import { NextResponse } from 'next/server';
import { db } from '@/db';
import { characters, events, locations, memories, relationships } from '@/db/schema';
import crypto from 'crypto';
import { Ollama } from 'ollama';
import { eq, and, ne } from 'drizzle-orm';

const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const allNpcs = db.select().from(characters).where(eq(characters.isPlayer, false)).all();
    const allLocations = db.select().from(locations).all();
    
    if (allNpcs.length === 0) {
      return NextResponse.json({ message: 'No NPCs to simulate.' });
    }

    const worldEvents: any[] = [];

    // Process each NPC (Global Pulse)
    for (const npc of allNpcs) {
      const currentLocation = allLocations.find(l => l.id === npc.locationId);
      
      // 1. Decision Engine (Simple GOAP: Goal -> Action)
      let goal = npc.goalStack ? JSON.parse(npc.goalStack)[0] : null;
      if (!goal) {
        // Default goals based on personality
        if (npc.personality === 'arrogant') goal = { type: 'encounter_rival' };
        else if (npc.personality === 'scheming') goal = { type: 'find_treasure' };
        else goal = { type: 'cultivate' };
      }

      // 2. Action Implementation
      let outcomeDescription = "";
      let outcomeType = "narrative";

      if (goal.type === 'cultivate' && currentLocation) {
        // Cultivation Logic: Qi gain = spirit * qiDensity
        const qiGain = Math.floor((npc.spirit / 5) * (currentLocation.qiDensity || 1));
        const newQi = Math.min(npc.qi + qiGain, npc.maxQi);
        
        // Qi Deviation Check
        const deviationRoll = Math.random() * 100;
        if (deviationRoll < npc.qiDeviationRisk) {
          const damage = Math.floor(npc.health * 0.2);
          db.update(characters).set({ 
            health: npc.health - damage, 
            status: 'injured',
            qiDeviationRisk: Math.max(0, npc.qiDeviationRisk - 5)
          }).where(eq(characters.id, npc.id)).run();
          outcomeDescription = `${npc.name} suffered Qi Deviation while cultivating at ${currentLocation.name}! Internal injuries sustained.`;
          outcomeType = 'combat';
        } else {
          db.update(characters).set({ 
            qi: newQi, 
            status: 'cultivating',
            qiDeviationRisk: Math.min(100, npc.qiDeviationRisk + 1) // Risk increases with effort
          }).where(eq(characters.id, npc.id)).run();
          
          // Breakthrough check
          if (newQi >= npc.maxQi) {
             const newStage = npc.cultivationStage + 1;
             db.update(characters).set({ 
               cultivationStage: newStage,
               qi: 0,
               maxQi: npc.maxQi + 50,
               maxHealth: npc.maxHealth + 20,
               health: npc.maxHealth + 20
             }).where(eq(characters.id, npc.id)).run();
             outcomeDescription = `${npc.name} successfully broke through to Stage ${newStage} at ${currentLocation.name}!`;
          } else {
             outcomeDescription = `${npc.name} meditates peacefully at ${currentLocation.name}, absorbing the spiritual essence of the land.`;
          }
        }
      } 
      else if (goal.type === 'find_treasure' && currentLocation) {
        // Treasure Hunt Logic
        const findRoll = Math.random() * 100 + (npc.luck / 2);
        if (findRoll > 90) {
          const stonesFound = Math.floor(Math.random() * 50) + 10;
          db.update(characters).set({ spiritStones: npc.spiritStones + stonesFound }).where(eq(characters.id, npc.id)).run();
          outcomeDescription = `${npc.name} discovered a small cache of Spirit Stones hidden in ${currentLocation.name}.`;
        } else {
          outcomeDescription = `${npc.name} scours ${currentLocation.name} for rare herbs and treasures, but finds nothing of value.`;
        }
      }
      else if (goal.type === 'encounter_rival' && currentLocation) {
        // Encounter Logic
        const possibleRivals = allNpcs.filter(n => n.id !== npc.id && n.locationId === npc.locationId);
        if (possibleRivals.length > 0) {
          const rival = possibleRivals[Math.floor(Math.random() * possibleRivals.length)];
          
          // Deterministic Spar: Strength vs Strength
          const winChance = (npc.strength / (npc.strength + rival.strength)) * 100;
          const winRoll = Math.random() * 100;
          
          if (winRoll < winChance) {
            outcomeDescription = `${npc.name} challenged ${rival.name} to a duel at ${currentLocation.name} and emerged victorious!`;
            db.update(characters).set({ reputation: npc.reputation + 10 }).where(eq(characters.id, npc.id)).run();
            db.update(characters).set({ reputation: rival.reputation - 5 }).where(eq(characters.id, rival.id)).run();
          } else {
            outcomeDescription = `${npc.name} challenged ${rival.name} to a duel at ${currentLocation.name} but was soundly defeated.`;
            db.update(characters).set({ reputation: npc.reputation - 5 }).where(eq(characters.id, npc.id)).run();
            db.update(characters).set({ reputation: rival.reputation + 10 }).where(eq(characters.id, rival.id)).run();
          }
          outcomeType = 'combat';
        } else {
           outcomeDescription = `${npc.name} searches ${currentLocation.name} for a worthy opponent, but the area is quiet.`;
        }
      }

      // 3. LLM Narration (Manhua Style)
      let narrativeEvent = outcomeDescription;
      try {
        const prompt = `You are an AI narrator for a Wuxia sandbox. 
        Transform the following systemic event into a dramatic 1-2 sentence manhua-style narrative:
        Event: ${outcomeDescription}
        NPC Stats: ${npc.name}, ${npc.cultivationRealm} (Stage ${npc.cultivationStage}), Personality: ${npc.personality}
        
        Output only the narrative text. No greetings.`;
        
        const response = await ollama.generate({
          model: 'llama3',
          prompt: prompt,
          stream: false,
        });
        narrativeEvent = response.response.trim();
      } catch (e) {
        console.warn("LLM failed, using raw description.");
      }

      // 4. Save Event
      const newEvent = {
        id: crypto.randomUUID(),
        title: `${npc.name}'s Journey`,
        description: narrativeEvent,
        type: outcomeType,
        locationId: npc.locationId,
        involvedCharacterIds: JSON.stringify([npc.id]),
        timestamp: Date.now(),
      };
      
      db.insert(events).values(newEvent).run();
      worldEvents.push(newEvent);
    }

    return NextResponse.json({ message: 'World Pulse Processed', events: worldEvents });
  } catch (error) {
    console.error("Tick error:", error);
    return NextResponse.json({ error: 'Failed to process tick.' }, { status: 500 });
  }
}
