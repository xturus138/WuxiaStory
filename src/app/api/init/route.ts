import { NextResponse } from 'next/server';
import { db } from '@/db';
import { characters, locations, events, items, manuals } from '@/db/schema';
import crypto from 'crypto';

export async function POST() {
  try {
    // 1. Check if we already have data
    const existingChars = db.select().from(characters).all();
    if (existingChars.length > 0) {
      return NextResponse.json({ message: 'World already initialized.' });
    }

    // 2. Create initial locations
    const locs = [
      { 
        id: 'loc_sect_azure', 
        name: 'Azure Cloud Sect', 
        type: 'sect', 
        description: 'A righteous sect located high in the Misty Peaks.',
        qiDensity: 5,
        dangerLevel: 1
      },
      { 
        id: 'loc_town_bamboo', 
        name: 'Bamboo Creek Village', 
        type: 'town', 
        description: 'A quiet village at the base of the mountain.',
        qiDensity: 1,
        dangerLevel: 0
      },
      { 
        id: 'loc_wild_eastern', 
        name: 'Eastern Demon Woods', 
        type: 'wilderness', 
        description: 'A dark forest infested with low-level demonic beasts.',
        qiDensity: 2,
        dangerLevel: 4
      },
      { 
        id: 'loc_ruin_ancient', 
        name: 'Ancient Sword Grave', 
        type: 'ruin', 
        description: 'The desolate remains of a forgotten battlefield.',
        qiDensity: 8,
        dangerLevel: 10
      },
    ];
    locs.forEach(l => db.insert(locations).values(l).run());

    // 3. Create Player Character
    db.insert(characters).values({
      id: 'char_player',
      name: 'Li Feng',
      isPlayer: true,
      health: 120,
      maxHealth: 120,
      qi: 50,
      maxQi: 100,
      spiritStones: 10,
      strength: 15,
      agility: 12,
      spirit: 20,
      luck: 10,
      cultivationRealm: 'Qi Condensation',
      cultivationStage: 3,
      sect: 'Azure Cloud Sect',
      locationId: 'loc_sect_azure',
      personality: 'righteous',
    }).run();

    // 4. Create Initial NPCs
    const npcs = [
      { 
        id: 'char_npc_1', name: 'Elder Zhao', isPlayer: false, 
        strength: 50, agility: 40, spirit: 80, luck: 20,
        spiritStones: 500,
        cultivationRealm: 'Core Formation', cultivationStage: 5, 
        sect: 'Azure Cloud Sect', locationId: 'loc_sect_azure', personality: 'strict' 
      },
      { 
        id: 'char_npc_2', name: 'Wang Wei', isPlayer: false, 
        strength: 20, agility: 15, spirit: 25, luck: 5,
        spiritStones: 50,
        cultivationRealm: 'Qi Condensation', cultivationStage: 8, 
        sect: 'Azure Cloud Sect', locationId: 'loc_sect_azure', personality: 'arrogant' 
      },
      { 
        id: 'char_npc_3', name: 'Xue Yin', isPlayer: false, 
        strength: 35, agility: 30, spirit: 45, luck: 15,
        spiritStones: 150,
        cultivationRealm: 'Foundation Establishment', cultivationStage: 2, 
        sect: 'Blood Demon Cult', locationId: 'loc_wild_eastern', personality: 'scheming' 
      },
      { 
        id: 'char_npc_4', name: 'Merchant Shen', isPlayer: false, 
        strength: 10, agility: 10, spirit: 10, luck: 50,
        spiritStones: 2000,
        cultivationRealm: 'Mortal', cultivationStage: 1, 
        sect: null, locationId: 'loc_town_bamboo', personality: 'neutral' 
      },
    ];
    npcs.forEach(n => db.insert(characters).values(n as any).run());

    // 5. Create basic items
    const baseItems = [
      { id: 'item_pill_qi', name: 'Low-Grade Qi Pill', type: 'pill', rarity: 'mortal', value: 10, effect: JSON.stringify({ qi: 20 }), description: 'A common pill to restore Qi.' },
      { id: 'item_sword_iron', name: 'Iron Sword', type: 'weapon', rarity: 'mortal', value: 50, effect: JSON.stringify({ strength: 5 }), description: 'A standard iron sword.' },
    ];
    baseItems.forEach(i => db.insert(items).values(i).run());

    // 6. Create initial events
    db.insert(events).values({
      id: crypto.randomUUID(),
      title: 'World Awakens',
      description: 'The Jianghu Stirs. The Heavenly Dao begins to turn.',
      type: 'world',
      timestamp: Date.now(),
    }).run();

    return NextResponse.json({ message: 'World initialized successfully with high-fidelity data.' });
  } catch (error) {
    console.error("Initialization error:", error);
    return NextResponse.json({ error: 'Failed to initialize world.' }, { status: 500 });
  }
}
