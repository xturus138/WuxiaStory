# 📜 WuxiaStory: High-Fidelity Jianghu Sandbox

WuxiaStory is an immersive, systemic Wuxia simulation built with Next.js, Drizzle ORM (SQLite), and Ollama. It transforms the traditional text generator into a living "Manhua Live-Feed" where NPC agency, cultivation depth, and emergent storytelling collide.

## 🌟 Key Features

- **Global Pulse Simulation:** Every character in the world acts simultaneously based on their goals and attributes.
- **GOAP-Driven AI:** NPCs use "Goal-Oriented Action Planning" to decide whether to cultivate, hunt for treasures, or challenge rivals.
- **High-Fidelity Cultivation:** Mastery is driven by **Strength, Agility, Spirit, and Luck**. breakthroughs carry the risk of **Qi Deviation**.
- **Living World Map:** Locations have **Qi Density** (affects cultivation) and **Danger Levels** (affects encounter rates).
- **Manhua Narratives:** Local LLMs generate dramatic, stylized narrative logs based on systemic simulation outcomes.

## 🛠️ Prerequisites

- **Node.js** (v18+)
- **Ollama Desktop:** Required for local narrative generation.

## 🚀 Getting Started

### 1. Setup Ollama
Make sure Ollama is running on your machine.
```bash
# Pull the default model used by WuxiaStory
ollama pull llama3
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Initialize the World
WuxiaStory requires a one-time initialization to seed the Jianghu with locations, characters, and items.
1. Start the development server: `npm run dev`
2. Open your browser and navigate to `http://localhost:3000`
3. Click the **"Initialize World"** button (or send a POST request to `/api/init`).

### 4. Run the Simulation
Once initialized, the world state will load. Click **"Advance Time"** to trigger the Global Pulse and watch the story unfold in the event log.

## 🏗️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** SQLite with Drizzle ORM
- **Styling:** Tailwind CSS + Framer Motion
- **AI Engine:** Ollama (Llama 3)
- **Icons:** Lucide React

## 📜 The Great Jianghu Master Plan
For detailed architectural goals and future roadmap, see [plan.md](./plan.md).
