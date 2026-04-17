# 🎵 Git Music — AI Version Control for Musical Ideas

> Like Git, but for your musical brain. Capture, analyze, version, and explore your musical ideas with AI-powered semantic indexing.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)
![Ollama](https://img.shields.io/badge/Ollama-Local_AI-blue)

## ✨ Features

- **🎙 Ambient Capture** — Rolling 60-second buffer captures your ideas with zero friction
- **🧠 AI Analysis** — Automatic BPM, key, mood, genre, and tag extraction via Ollama
- **🌿 Versioning** — Branch and track the evolution of your musical ideas like Git
- **🔍 Semantic Search** — Find ideas by mood, genre, or any natural language query
- **📊 Evolution Map** — Visual graph showing how your ideas branch and evolve
- **💎 Premium UI** — Glassmorphism design with smooth animations

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, Tailwind CSS, Zustand, React Flow |
| Backend | FastAPI, SQLAlchemy, SQLite |
| Audio | Web Audio API (AudioWorklet), librosa |
| AI | Ollama (mistral/llama3) |

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **Ollama** (optional, for AI features)

### 1. Install Ollama (Optional)

```bash
# Download from https://ollama.ai
# Then pull a model:
ollama pull mistral
```

### 2. Start the Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:main --reload --port 8000
```

### 3. Start the Frontend

```bash
cd frontend

# Install dependencies (already done if you cloned fresh)
npm install

# Run the dev server
npm run dev
```

### 4. Open the App

Navigate to **http://localhost:3000** in your browser.

## 📁 Project Structure

```
├── backend/
│   ├── main.py              # FastAPI entry point
│   ├── database.py          # SQLite + SQLAlchemy setup
│   ├── models.py            # ORM models (Idea, IdeaVersion)
│   ├── routes/
│   │   ├── capture.py       # Audio capture endpoints
│   │   ├── ideas.py         # CRUD + graph + stats
│   │   └── search.py        # Semantic search
│   └── services/
│       ├── audio_processing.py  # librosa feature extraction
│       └── ollama_client.py     # Ollama AI integration
│
├── frontend/
│   ├── public/
│   │   └── audio-worklet-processor.js  # AudioWorklet for rolling buffer
│   └── src/
│       ├── app/
│       │   ├── page.tsx         # Dashboard
│       │   ├── capture/         # Capture page
│       │   ├── ideas/           # Ideas list + detail
│       │   └── evolution/       # Graph visualization
│       ├── components/
│       │   ├── AudioCapture.tsx  # Capture engine
│       │   ├── EvolutionGraph.tsx # React Flow graph
│       │   ├── IdeaCard.tsx     # Idea preview card
│       │   ├── Navbar.tsx       # Navigation
│       │   ├── SearchBar.tsx    # Semantic search
│       │   └── WaveformVisualizer.tsx # Waveform canvas
│       └── lib/
│           ├── api.ts           # API client
│           ├── store.ts         # Zustand state
│           └── types.ts         # TypeScript types
```

## 🎧 How It Works

1. **Listen** — Open the Capture page and start the ambient listener
2. **Play** — Hum, play, or create any sound near your microphone
3. **Capture** — Hit the capture button to save the last 60 seconds
4. **Analyze** — AI automatically extracts BPM, key, mood, genre, and tags
5. **Browse** — Explore your library on the Dashboard
6. **Search** — Find any idea with natural language queries
7. **Branch** — Open an idea detail page and record a new branch from any selected version
8. **Evolve** — Track branches visually on the evolution map

## 📝 Notes

- Audio analysis works without Ollama (uses heuristic fallback)
- All data is stored locally (SQLite + filesystem)
- Microphone audio stays on your machine — nothing is sent to the cloud
