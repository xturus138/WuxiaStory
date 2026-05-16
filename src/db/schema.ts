import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Locations in the world
export const locations = sqliteTable('locations', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'sect', 'town', 'wilderness', 'ruin'
  description: text('description'),
  qiDensity: integer('qi_density').notNull().default(1), // multiplier for cultivation
  dangerLevel: integer('danger_level').notNull().default(0), // encounter rate/strength
});

// Characters table (Player + NPCs)
export const characters = sqliteTable('characters', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  isPlayer: integer('is_player', { mode: 'boolean' }).default(false),
  
  // Vitals
  health: integer('health').notNull().default(100),
  maxHealth: integer('max_health').notNull().default(100),
  qi: integer('qi').notNull().default(100),
  maxQi: integer('max_qi').notNull().default(100),
  spiritStones: integer('spirit_stones').notNull().default(0),

  // Attributes (Deterministic Combat/Action engine)
  strength: integer('strength').notNull().default(10), // Physical damage
  agility: integer('agility').notNull().default(10),   // Dodge/Speed
  spirit: integer('spirit').notNull().default(10),     // Qi potency
  luck: integer('luck').notNull().default(10),         // Criticals/Treasure finds
  
  // Cultivation
  cultivationRealm: text('cultivation_realm').notNull().default('Mortal'),
  cultivationStage: integer('cultivation_stage').notNull().default(1),
  qiDeviationRisk: integer('qi_deviation_risk').notNull().default(0), // 0-100%
  
  // Social/Identity
  sect: text('sect'),
  reputation: integer('reputation').notNull().default(0),
  locationId: text('location_id'),
  status: text('status').notNull().default('alive'), // 'alive', 'dead', 'cultivating', 'traveling'
  personality: text('personality').notNull().default('neutral'), // e.g. 'arrogant', 'righteous', 'scheming'
  goalStack: text('goal_stack'), // JSON string of NPC goals
});

// Martial Arts and Qi Methods
export const manuals = sqliteTable('manuals', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'technique' (combat) or 'method' (cultivation)
  rarity: text('rarity').notNull(), // 'mortal', 'earth', 'heaven', 'divine'
  elementalAffinity: text('elemental_affinity'), // 'fire', 'water', 'earth', 'wood', 'metal', 'none'
  description: text('description'),
  requirementSpirit: integer('requirement_spirit').default(0),
});

// Items (Pills, Weapons, Treasures)
export const items = sqliteTable('items', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'pill', 'weapon', 'treasure', 'material'
  rarity: text('rarity').notNull(),
  value: integer('value').notNull(), // in spirit stones
  effect: text('effect'), // JSON string of effects (e.g., { "health": 50, "qi": 20 })
  description: text('description'),
});

// Inventory (Links items/manuals to characters)
export const inventory = sqliteTable('inventory', {
  id: text('id').primaryKey(),
  characterId: text('character_id').notNull(),
  itemId: text('item_id'),
  manualId: text('manual_id'),
  quantity: integer('quantity').notNull().default(1),
  isEquipped: integer('is_equipped', { mode: 'boolean' }).default(false),
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
