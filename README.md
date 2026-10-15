# SkillSwap — Learn by Exchange

A modern peer-to-peer skill exchange platform for college students. Teach what you know, learn what you love, earn and spend Skill Credits, discover multi-person exchange cycles, and practice conversational skills with Gemini 3.8 Live Voice.

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18+)
- npm

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Full-Stack Server
```bash
npm run dev
```
The application will launch on `http://localhost:3000` running Express + Vite with WebSocket `/api/live` for Gemini Live API and Firebase Firestore/Auth integration.

### 3. Run Logic Unit Tests
```bash
node --test src/utils/*.test.ts
```

### 4. Build for Production
```bash
npm run build
```

---

## 🌟 New Integrations & Features

1. **Custom SkillSwap Brand Logo**:
   - Distinctive dual exchange ribbon arcs representing peer-to-peer reciprocity.
   - Central amber/gold star spark representing the spark of knowledge and voice exchange.

2. **Firebase Authentication & Firestore Data Persistence**:
   - Google Sign-in with Firebase Auth (`signInWithPopup`).
   - Provisioned Firestore database with strict security rules (`firestore.rules` deployed via `DeployRules` RPC).
   - Data models for `users`, `requests`, `sessions`, `transactions`, and `reviews` registered in `firebase-blueprint.json`.
   - Boot connection validation and automatic user profile sync upon Google login.

3. **Gemini 3.8 Live Voice Tutor (`gemini-3.8-live`)**:
   - Real-time spoken voice conversations for skill practice.
   - Full bi-directional audio support via WebSocket (`/api/live`) streaming 16kHz PCM input and playing back 24kHz audio output.
   - Multi-topic skill coaching:
     - 🇪🇸 **Conversational Spanish**: Real-time language dialogues, food ordering, and accent feedback.
     - 🐍 **Python Programming**: Verbal algorithm explanations and debugging out loud.
     - 🎤 **Public Speaking & Pitching**: 60-second elevator pitch critique and pacing advice.
     - 🍳 **Authentic Italian Cooking**: Sauce emulsification, pasta timing, and technique tips.
   - Live audio wave visualizer, audio stream management, and REST fallback support.

---

## 💡 Core Platform Capabilities

- **Dashboard & Overview**: Active stats, incoming requests banner, upcoming sessions with video classroom links, and recommended peer matches.
- **Skill Discovery**: Search across teachers and skills with category and proficiency filters.
- **Direct & Mutual Matching**: Finds students offering skills on your wishlist, and flags 100% reciprocal mutual swaps.
- **Learning Requests**: Propose sessions with credit checks, note inputs, and 1-click teacher acceptance.
- **Exchange Sessions**: Track upcoming video rooms, mark sessions complete, and automatically settle Skill Credits.
- **Skill Credits**: 1 hour = 1 credit rule, prevents duplicate charges or negative balances, complete transaction ledger.
- **Reviews & Ratings**: Post-session 5-star student reviews updating teacher profiles.
- **Skill Chain Finder**: Detects 3-person closed loops (A teaches B → B teaches C → C teaches A) where everyone exchanges skills with zero net credit cost.
- **Demo Role Switcher**: Switch between student personas (`Maya Lin`, `David Chen`, `Maria Gomez`, `Elena Rostova`, `Marco Rossi`, `Jordan Hayes`) or sign in with real Google accounts.
