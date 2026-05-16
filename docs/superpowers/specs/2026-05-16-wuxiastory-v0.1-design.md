# WuxiaStory v0.1 — Full Overhaul Design Spec

**Date:** 2026-05-16  
**Version:** 0.1  
**Status:** Approved

---

## Overview

WuxiaStory v0.1 transforms the existing passive NPC viewer into a fully simulation-driven Wuxia sandbox. The player is one cultivator among many — no quests, no objectives, no railroading. Every outcome emerges from stats, relationships, and choices colliding in the simulation. The same seed always produces the same starting world.

---

## Section 1: Architecture & Data Flow

### New API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/player/action` | POST | Player submits chosen action for the current tick |
| `/api/ai-config` | GET / POST | Read/write AI mode setting (ollama vs api) |
| `/api/leaderboard` | GET | Live rankings: cultivation, sect hierarchy, family registry |

### Tick Flow (Updated)

1. Player submits action via `/api/player/action` (or auto-acts on personality if skipped)
2. `POST /api/tick` processes player action first, then all NPCs via GOAP
3. NPC GOAP gains two new goal types:
   - `travel` — move to a connected location based on goal context
   - `faction_event` — report to sect master, challenge a rival sect
4. Relationships table is read and written each tick — winning a duel increases rivalry, shared location over time raises affinity
5. Narrative prompt enriched with relationship context + character memory snippets

### Dual AI Mode

- A `game_state` table stores `ai_mode` (`'ollama'` | `'api'`), `ai_model`, and `ai_api_key`
- A shared `generateNarrative(prompt, config)` helper in `/src/lib/ai.ts` branches to Ollama or Cursor API
- Cursor API uses an OpenAI-compatible endpoint (`https://api.cursor.sh/v1`) with the `crsr_` key in the Authorization header — implemented via a plain `fetch` call (no extra SDK needed)
- The Cursor API key is stored server-side only — never sent to the client
- Settings gear icon in the UI opens a drawer to toggle mode and set the key

### Schema Additions

**`game_state` table** (single row):
- `id` — always `'global'`
- `worldTick` — current simulation tick counter
- `seed` — the seed string used at world initialization
- `aiMode` — `'ollama'` | `'api'`
- `aiModel` — model name string
- `aiApiKey` — stored server-side only

**`factions` table**:
- `id`, `name`, `alignment` (`'righteous'` | `'demonic'` | `'neutral'`), `powerScore`

**`locations` table addition**:
- `connections` — JSON array of location IDs this location connects to (seeded at world init, used by travel action and SVG map path rendering)

**`characters` table additions**:
- `sectRank` — `'outer_disciple'` | `'inner_disciple'` | `'core_disciple'` | `'elder'` | `'grand_elder'` | `'sect_master'`
- `familyName` — surname for family grouping

**`relationships` table — extended type vocabulary**:
`parent`, `child`, `sibling`, `spouse`, `lover`, `rival`, `friend`, `enemy`, `master`, `disciple`

---

## Section 2: UI & Visual Design

### Layout

3-column layout retained. Every panel visually overhauled.

### Color & Theme

- Base palette: ink/paper (existing) with faction accent overlays
  - Crimson (`#8b2626`) — righteous sects
  - Jade (`#2f5f4f`) — neutral
  - Obsidian (`#1a1a2e`) — demonic
- Brush-stroke SVG dividers between sections
- Subtle animated `radial-gradient` pulse on Qi bars when cultivating
- `dark-scroll` CSS panel variant: dark brushed-ink header band, parchment body

### WorldMap → SVG Node Map

- Locations rendered as named nodes on a stylized SVG canvas
- Parchment background, hand-drawn style paths between nodes
- Character dots (colored by faction) at their current location
- Dots animate between nodes when NPCs travel
- Hover tooltip: location name, Qi density, danger level, current inhabitants

### ActionPanel (new component)

- Replaces the "Advance Time" button at the bottom of the center column
- Each tick shows 4–6 action cards: **Cultivate**, **Travel**, **Challenge**, **Meditate**, **Scavenge**, **Interact**
- Travel shows a destination picker; Challenge shows rivals present at your location
- Selected card glows gold; confirm button triggers tick
- If player does not confirm within the tick window, auto-acts on personality

### EventLog Enhancements

- Filter tabs: All / Combat / Cultivation / World
- Each entry: icon, left-border color-coded by event type
- Combat entries show a mini VS banner with character names and outcome

### CharacterPanel Enhancements

- Existing stats retained
- New **Relationships** section: top 3 rivals/allies with affinity bars
- New **Inventory** section: equipped item + held manuals
- New **Family** section: parents, siblings, spouse/lover if any

### Right Column

- WorldRumors fetched dynamically from DB (no hardcoded names)
- **Top Cultivators** leaderboard: live-ranked by realm + stage + reputation
- **Sect Hierarchy** tab: per-sect tree (Sect Master → Elders → Disciples)
- **Family Registry** tab: notable families with parent/child/spouse links
- **Faction Standings** widget: faction power scores with alignment color

### Settings Drawer

- Gear icon top-right of layout
- Slide-in drawer: toggle AI mode (Ollama / API), enter API key, change model name

### World Creation Screen

- Shown on first load before initialization
- Centered card with seed input field (blank = random seed)
- "Create World" button triggers `/api/init` with the seed
- After init, seed displayed in a small badge in the header

---

## Section 3: Gameplay Mechanics (Pure Simulation)

### Player = NPC with agency

The tick engine treats the player identically to NPCs. GOAP decides NPC actions; the player decides their own. If the player does not act, the simulation auto-acts on personality.

### Player Actions Per Tick

| Action | Simulation Effect |
|---|---|
| **Cultivate** | Absorb Qi (spirit × location Qi density). Qi Deviation risk increases with use |
| **Travel** | Move to any connected location. Arrives next tick |
| **Challenge** | Duel any character at current location. Deterministic outcome (stats) + LLM narrative |
| **Meditate** | Restore HP, reduce Qi Deviation risk. Slow but safe |
| **Scavenge** | Search location for items/spirit stones. Luck-driven roll |
| **Interact** | Choose a character at location — raises/lowers affinity, can trigger alliances or enmity |

### Emergent Consequences

- Repeated wins against a character → `rival` relationship auto-assigned
- Staying in a sect's territory → sect affinity rises; enemy sects react
- High reputation → NPCs seek out the player (challenge, trade, ally)
- Qi Deviation ignored → character can die. No safety net
- Faction war emerges from accumulated sect affinity scores
- Player choices can tip faction wars or remain neutral

### World Runs Without the Player

Tick fires on a 5-second interval in auto-mode. NPCs travel, fight, break through realms, form relationships, and die regardless of player action. Watching is a valid playstyle.

---

## Section 4: Family, Love & Sect Hierarchy

### Family System

- Player starts with at least one family NPC (parent — alive or deceased, seeded)
- Family relationships seeded at world init: parent/child/sibling chains
- Death of a family member triggers grief events in connected characters
- Items and manuals can be inherited on death

### Love System (Emergent)

- Two characters sharing a location over multiple ticks → affinity rises gradually
- Affinity 70+ → `lover` relationship forms automatically
- Affinity 100 + both alive + same/allied sect → can become `spouse`
- Player uses **Interact** to accelerate or cool off romantic arcs
- NPCs pursue love independently

### Sect Hierarchy

`outer_disciple` → `inner_disciple` → `core_disciple` → `elder` → `grand_elder` → `sect_master`

- Auto-promoted by simulation when cultivation realm + reputation cross thresholds
- One `sect_master` per sect — if current master dies or is defeated, highest-rank elder promoted
- Rank affects NPC interaction behavior: Sect Masters command loyalty, Outer Disciples are ignored

### Leaderboard Tabs

1. **Cultivation Ranking** — all characters ranked by realm + stage
2. **Sect Hierarchy** — per-sect tree rendered live from DB
3. **Family Registry** — family groupings by surname, with relationship links

---

## Section 5: Seed System

### Core Concept

One seed string → always the same starting world. Same names, stats, locations, family trees, faction compositions. Simulation diverges from tick 1 based on player choices, but the starting state is fully reproducible.

### Implementation

- Mulberry32 seeded PRNG (~5 lines, no external dependency) replaces all `Math.random()` calls in `/api/init`
- Seed stored in `game_state` table
- Each tick's simulation randomness uses `seed + worldTick` as entropy source for full replay determinism

### What the Seed Controls

- Number and type of locations (names, Qi density, danger level)
- NPC pool: names (from combinable surname + given name pools), stats, personalities, sect assignments, sect ranks
- Family tree wiring: parent/child/sibling/spouse at world start
- Starting relationship affinities
- Which manuals and items exist and where
- Initial faction power scores

### Procedural Content Pools (in code)

- ~50 NPC name parts (surnames + given names)
- ~15 location name templates
- ~10 personality types
- ~8 sect names with alignments
- Manual and item name pools with rarity weights

### Seed UI

- World Creation screen shown before init: seed input or blank for random
- After init: seed badge in header (copyable)
- "New World" button: wipes DB, returns to seed screen

---

## Out of Scope for v0.1

- Multiplayer
- Crafting system
- Beast taming
- Map editor
- Save/load multiple world slots (single world only)

---

## Implementation Order

1. Schema migrations (game_state, factions, sectRank, familyName fields)
2. Seed system + procedural world generation (`/api/init` rewrite)
3. Dual AI helper (`/src/lib/ai.ts`) + `/api/ai-config`
4. Tick engine upgrade (travel, faction_event, relationship writes, family events)
5. Player action API (`/api/player/action`)
6. Leaderboard API (`/api/leaderboard`)
7. UI: World Creation screen
8. UI: SVG WorldMap with character dots
9. UI: ActionPanel
10. UI: CharacterPanel enhancements (relationships, inventory, family)
11. UI: Right column (dynamic leaderboard tabs, faction standings)
12. UI: Settings drawer (AI mode toggle)
13. Visual polish (brush dividers, animated Qi bars, faction colors)
