# Krew AI

Enterprise multi-agent AI platform that helps founders, startups, and product teams solve complex business problems using collaborating AI agents.

![Krew AI](https://img.shields.io/badge/Krew-AI-6366f1)
![Capstone](https://img.shields.io/badge/Google%20x%20Kaggle-Capstone%20Project-0ea5e9)

> This project is **vibecoded** for a **Google x Kaggle capstone project**.

## Features

- **Multi-Agent Orchestration** — Orchestrator coordinates 6 specialist agents (Research, Finance, Marketing, Software Architecture, Business Strategy, QA)
- **Executive Reports** — Comprehensive strategy dashboards with scores, charts, and timelines
- **Real-time Streaming** — Live agent progress via Server-Sent Events
- **Document Intelligence** — Upload PDF, Word, and text files for AI context
- **PDF Export** — Download executive reports as PDF
- **Authentication** — Secure signup/login with JWT
- **Premium UI** — Dark theme, glassmorphism, Linear-inspired dashboard

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Tailwind CSS, Vite, Recharts, Framer Motion |
| Backend | FastAPI, Python 3.12 |
| Database | PostgreSQL |
| AI | Fireworks AI (modular LLM architecture) |
| Deployment | Docker Compose |

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Fireworks AI API key (optional — demo mode works without one)

### 1. Clone and configure

```bash
cd krew-ai
cp .env.example .env
# Add your FIREWORKS_API_KEY to .env
```

### 2. Run with Docker

```bash
docker compose up --build
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### 3. Local Development (without Docker)

**Backend:**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Start PostgreSQL locally or use Docker for just the DB:
docker compose up db -d

cp ../.env.example .env
uvicorn app.main:app --reload --port 8000
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

## Usage Flow

1. **Sign up** at `/signup`
2. **Create a project** with business details, goals, budget, and optional documents
3. Click **Generate Strategy** to deploy the Orchestrator and 6 specialist agents
4. Watch **live agent progress** in the workflow panel
5. Review the **Executive Dashboard** with scores, charts, timeline, and recommendations
6. **Export** the report as PDF

## API Key Configuration

Set `FIREWORKS_API_KEY` in `.env` or add it per-user in **Settings → API Key Management**.

Without an API key, the platform runs in **demo mode** with realistic mock responses — perfect for hackathon demos.

## Project Structure

```
krew-ai/
├── backend/
│   └── app/
│       ├── main.py              # FastAPI entry point
│       ├── models/              # SQLAlchemy models
│       ├── routers/             # API endpoints
│       ├── schemas/             # Pydantic schemas
│       └── services/
│           ├── ai/
│           │   ├── fireworks_client.py  # Modular LLM client
│           │   ├── orchestrator.py      # Agent coordination
│           │   └── agents/              # Agent definitions
│           ├── auth.py
│           ├── documents.py
│           └── pdf_export.py
├── frontend/
│   └── src/
│       ├── components/          # Reusable UI components
│       ├── pages/               # Route pages
│       ├── context/             # Auth & toast providers
│       └── lib/                 # API client & utilities
└── docker-compose.yml
```

## Specialist Agents

| Agent | Role |
|-------|------|
| Orchestrator | Coordinates all agents, synthesizes final report |
| Research Agent | Market research and industry analysis |
| Finance Agent | Financial projections and ROI |
| Marketing Agent | Growth strategy and positioning |
| Software Architecture Agent | Technical stack and scalability |
| Business Strategy Agent | Business model and GTM |
| Quality Assurance Agent | Risk assessment and review |

## License

MIT
