import { NextResponse } from 'next/server';
import { db } from '@/db';
import { events, characters, locations } from '@/db/schema';
import { desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const allEvents = db.select().from(events).orderBy(desc(events.timestamp)).limit(50).all();
    const allCharacters = db.select().from(characters).all();
    const allLocations = db.select().from(locations).all();
    
    return NextResponse.json({ 
      events: allEvents, 
      characters: allCharacters,
      locations: allLocations 
    });
  } catch (error) {
    console.error("Failed to fetch world state:", error);
    return NextResponse.json({ error: 'Failed to fetch world state.' }, { status: 500 });
  }
}