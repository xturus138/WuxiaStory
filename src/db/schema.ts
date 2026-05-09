import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Locations in the world
export const locations = sqliteTable('locations', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'sect', 'town', 'wilderness', 'ruin'
  description: text('description'),
});

// Characters table (Player + NPCs)
export const characters = sqliteTable('characters', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  isPlayer: integer('is_player', { mode: 'boolean' }).default(false),
  health: integer('health').notNull().default(100),
  maxHealth: integer('max_health').notNull().default(100),
  qi: integer('qi').notNull().default(100),
  maxQi: integer('max_qi').notNull().default(100),
  cultivationRealm: text('cultivation_realm').notNull().default('Mortal'),
  cultivationStage: integer('cultivation_stage').notNull().default(1),
  sect: text('sect'),
  reputation: integer('reputation').notNull().default(0),
  locationId: text('location_id'),
  status: text('status').notNull().default('alive'), // 'alive', 'dead', 'cultivating', 'traveling'
  personality: text('personality').notNull().default('neutral'), // e.g. 'arrogant', 'righteous', 'scheming'
});

// Character Memories (Persistent context for LLM)
export const memories = sqliteTable('memories', {
  id: text('id').primaryKey(),
  characterId: text('character_id').notNull(),
  memory: text('memory').notNull(),
  importance: integer('importance').notNull().default(1), // 1-10
  timestamp: integer('timestamp').notNull(),
});

// Relationships between characters
export const relationships = sqliteTable('relationships', {
  id: text('id').primaryKey(),
  characterId1: text('character_id_1').notNull(),
  characterId2: text('character_id_2').notNull(),
  affinity: integer('affinity').notNull().default(0), // Negative for enemies, positive for friends
  type: text('type').notNull(), // e.g., 'rival', 'friend', 'master', 'disciple'
});

// World Events / Rumors / Narrative Logs
export const events = sqliteTable('events', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  type: text('type').notNull().default('narrative'), // 'narrative', 'combat', 'rumor', 'world'
  locationId: text('location_id'),
  involvedCharacterIds: text('involved_character_ids'), // comma-separated or JSON string
  timestamp: integer('timestamp').notNull(), // in-game time tick
});
