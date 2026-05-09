import { NextResponse } from 'next/server';
import { db } from '@/db';
import { characters, events, locations } from '@/db/schema';
import crypto from 'crypto';
import { Ollama } from 'ollama';
import { eq } from 'drizzle-orm';

const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const allNpcs = db.select().from(characters).where(eq(characters.isPlayer, false)).all();
    if (allNpcs.length === 0) {
      return NextResponse.json({ message: 'No NPCs to simulate.' });
    }

    // 1. Pick a random NPC to take an action
    const actor = allNpcs[Math.floor(Math.random() * allNpcs.length)];
    
    // 2. Determine basic action intent based on personality
    let actionIntent = "wanders the jianghu";
    if (actor.personality === 'arrogant') actionIntent = "challenges a rival to a duel to prove their superiority";
    if (actor.personality === 'strict') actionIntent = "disciplines junior disciples and cultivates in seclusion";
    if (actor.personality === 'scheming') actionIntent = "plots to steal a heavenly treasure or ruin an enemy's reputation";
    if (actor.personality === 'righteous') actionIntent = "hunts demonic beasts to protect the mortals";

    // 3. Ask Ollama to generate a dynamic event
    const prompt = `You are an AI narrator for a Wuxia sandbox simulation.
    Generate a 1-2 sentence short, immersive narrative event about the following NPC:
    Name: ${actor.name}
    Cultivation: ${actor.cultivationRealm} (Stage ${actor.cultivationStage})
    Sect: ${actor.sect || 'Rogue Cultivator'}
    Personality: ${actor.personality}
    Intent: ${actionIntent}
    
    Do not include any greeting or explanation. Just return the narrative text in a dramatic, manhua-style tone.`;

    let generatedText = `${actor.name} ${actionIntent}.`; // Fallback
    try {
      const response = await ollama.generate({
        model: 'llama3', // User can change this to mistral or deepseek-coder
        prompt: prompt,
        stream: false,
      });
      generatedText = response.response.trim();
    } catch (ollamaError) {
      console.warn("Ollama is not reachable or failed. Using fallback text.", ollamaError);
    }

    // 4. Update the World State (Simplified: maybe they gain Qi or Stage)
    let newQi = actor.qi + Math.floor(Math.random() * 10);
    db.update(characters)
      .set({ qi: newQi })
      .where(eq(characters.id, actor.id))
      .run();

    // 5. Save Event
    const newEvent = {
      id: crypto.randomUUID(),
      title: `${actor.name}'s Action`,
      description: generatedText,
      type: 'rumor',
      locationId: actor.locationId,
      involvedCharacterIds: JSON.stringify([actor.id]),
      timestamp: Date.now(),
    };
    
    db.insert(events).values(newEvent).run();

    return NextResponse.json({ message: 'Tick processed', event: newEvent });
  } catch (error) {
    console.error("Tick error:", error);
    return NextResponse.json({ error: 'Failed to process tick.' }, { status: 500 });
  }
}
