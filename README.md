# 🧠 ScholarMind

**From question to insight — in minutes.**

ScholarMind is a globally deployed, multi-agent AI research synthesis platform. It orchestrates a team of specialized AI agents to convert complex research questions into structured, peer-reviewed surveys, synthesising literature from millions of papers via the Semantic Scholar API.

---

## ✨ Features

- **Autonomous Research Agents**: 7-phase synthesis lifecycle from query to final assembly.
- **Real-time Synthesis**: Live "thought stream" and status updates via Server-Sent Events (SSE).
- **Interactive Visualization**: D3-based Knowledge Graphs of research themes and connections.
- **Paper Selection**: Human-in-the-loop interface to refine the research corpus.
- **Production Ready**: Fully type-safe, accessible, and optimized for speed.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend**: FastAPI, Python 3.10+, Uvicorn.
- **AI/LLM**: Claude 3.5 Sonnet (via Anthropic API).
- **Research Data**: Semantic Scholar API.
- **Deployment**: Vercel (Frontend), Railway (Backend).

---

## 🚀 Getting Started

### 1. Prerequisites

- Node.js 18+
- Python 3.10+
- Anthropic API Key (for synthesis)
- Semantic Scholar API Key (optional, for higher rate limits)

### 2. Clone and Install

```bash
git clone https://github.com/your-repo/scholar-mind.git
cd scholar-mind
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (if not already there)
cd scholar-mind

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# Run development server
npm run dev
```

### 4. Backend Setup

```bash
# Open a new terminal
cd scholar-mind/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run backend server
uvicorn main:app --reload --port 8000
```

---

## ⚙️ Environment Variables

Create a `.env.local` in the `scholar-mind` directory:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
ANTHROPIC_API_KEY=your_key_here
SEMANTIC_SCHOLAR_API_KEY=your_key_here
```

---

## 🏗 Architecture

1. **Query Phase**: Intelligent research question formulation.
2. **Selection Phase**: Semantic Scholar fetching & user-curated paper selection.
3. **Synthesis Phase**: 
   - **Data Acquisition Agent**: Fetches full contexts.
   - **Analysis Agent**: Clusters themes and methodologies.
   - **Drafting Agent**: Generates structured survey content.
4. **Output Phase**: Markdown rendering with interactive citations and PDF export.

---

## 🎨 Design Aesthetic

ScholarMind follows the **"Dark Matter Luxury"** design system:
- **Typography**: Instrument Serif (Display) & Inter (Body).
- **Colors**: Deep obsidian backgrounds, electric blue accents, and glassmorphic surfaces.
- **Animations**: Spring-based micro-interactions using Framer Motion.

---

Built with ❤️ for the world's researchers.
