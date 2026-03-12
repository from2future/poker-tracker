# 🦉 Poker Tracker (Cosmic Owl Edition)

A beautifully themed, retro Y2K web application designed to track poker sessions and debts among friends. No more confusing spreadsheets or lost money—this app keeps your ledger balanced while looking incredibly stylish.

## ✨ Features

- **Multi-Room Architecture**: Host infinite isolated poker groups. Create a new room with a unique name and passcode, or join an existing one to see your group's private ledger.
- **Session Tracking**: Log new game nights (Notes), track where they happened, and add specific details.
- **Player Management**: Easily add friends to your room and manage who played in which session.
- **Ledger & Debt Management**: Track exactly what every player bought in for and cashed out for. The app automatically calculates net discrepancies to ensure no money goes missing and your ledger is perfectly balanced.
- **Cosmic Owl Aesthetic**: A fully custom Y2K digital aesthetic featuring pastel color palettes, 8-bit pixel fonts, harsh retro shadows, nostalgic cursor replacements, and decorative digital stickers.

## 🛠 Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS (with heavy custom CSS variables for the retro theme)
- **State Management**: Zustand
- **Routing**: React Router v7
- **Backend / Database**: Supabase (PostgreSQL)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- A Supabase project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/from2future/poker-tracker.git
   cd poker-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`.

## 🎨 Design Details
The "Cosmic Owl" redesign completely transforms generic dashboard UI into a customized board-game night experience. It leverages `Press Start 2P` for data readability and `Dancing Script` for title accents, combined with carefully placed static assets (`/public/cosmic-owl/stickers`) to give the UI a living, scrapbook feel.
