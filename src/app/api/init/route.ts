import { NextResponse } from 'next/server';
import { db } from '@/db';
import { characters, locations, events } from '@/db/schema';
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
      { id: 'loc_sect_azure', name: 'Azure Cloud Sect', type: 'sect', description: 'A righteous sect located high in the Misty Peaks.' },
      { id: 'loc_town_bamboo', name: 'Bamboo Creek Village', type: 'town', description: 'A quiet village at the base of the mountain.' },
      { id: 'loc_wild_eastern', name: 'Eastern Demon Woods', type: 'wilderness', description: 'A dark forest infested with low-level demonic beasts.' },
    ];
    locs.forEach(l => db.insert(locations).values(l).run());

    // 3. Create Player Character
    db.insert(characters).values({
      id: 'char_player',
      name: 'Li Feng',
      isPlayer: true,
      cultivationRealm: 'Qi Condensation',
      cultivationStage: 3,
      sect: 'Azure Cloud Sect',
      locationId: 'loc_sect_azure',
      personality: 'righteous',
    }).run();

    // 4. Create Initial NPCs
    const npcs = [
      { id: 'char_npc_1', name: 'Elder Zhao', isPlayer: false, cultivationRealm: 'Core Formation', cultivationStage: 5, sect: 'Azure Cloud Sect', locationId: 'loc_sect_azure', personality: 'strict' },
      { id: 'char_npc_2', name: 'Wang Wei', isPlayer: false, cultivationRealm: 'Qi Condensation', cultivationStage: 8, sect: 'Azure Cloud Sect', locationId: 'loc_sect_azure', personality: 'arrogant' },
      { id: 'char_npc_3', name: 'Xue Yin', isPlayer: false, cultivationRealm: 'Foundation Establishment', cultivationStage: 2, sect: 'Blood Demon Cult', locationId: 'loc_wild_eastern', personality: 'scheming' },
      { id: 'char_npc_4', name: 'Merchant Shen', isPlayer: false, cultivationRealm: 'Mortal', cultivationStage: 1, sect: null, locationId: 'loc_town_bamboo', personality: 'neutral' },
    ];
    npcs.forEach(n => db.insert(characters).values(n).run());

    // 5. Create initial events
    db.insert(events).values({
      id: crypto.randomUUID(),
      title: 'World Awakens',
      description: 'The Jianghu Stirs. The Heavenly Dao begins to turn.',
      type: 'world',
      timestamp: Date.now(),
    }).run();

    return NextResponse.json({ message: 'World initialized successfully.' });
  } catch (error) {
    console.error("Initialization error:", error);
    return NextResponse.json({ error: 'Failed to initialize world.' }, { status: 500 });
  }
}
