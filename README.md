# ResumeForge

An ATS-friendly resume builder with real-time AI assistance, powered by local LLMs. ResumeForge combines a polished React frontend with a FastAPI backend to help users create, analyze, and optimize resumes that pass Applicant Tracking Systems.

## Key Features

- **Resume Builder** -- Full CRUD with real-time live preview across 7 resume sections
- **PDF Export** -- Server-side PDF generation using FPDF2 with 3 distinct templates (Classic ATS, Modern Professional, Minimal Clean)
- **ATS Score Analysis** -- Deterministic, locally-computed ATS scoring engine that evaluates completeness, keyword matching, skills alignment, experience quality, and format compliance
- **AI Resume Assistant** -- Local LLM-powered suggestions for improving summaries, experience descriptions, and project descriptions via LM Studio + Qwen3
- **Resume Tailoring** -- AI-driven analysis that compares your resume against a job description and provides targeted improvement suggestions
- **Firebase Authentication** -- Secure Google Sign-In with server-side token verification
- **Responsive Design** -- Mobile-first layout with form/preview tab switching on small screens

## Architecture

```
ResumeForge/
├── frontend/                  # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── templates/     # 3 resume preview templates (Classic, Modern, Minimal)
│   │   │   ├── AiAssistant.tsx
│   │   │   ├── AtsAnalysisPanel.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── TemplateSelector.tsx
│   │   ├── config/            # Firebase configuration
│   │   ├── contexts/          # Auth context provider
│   │   ├── lib/               # API client
│   │   ├── pages/             # Route pages (Login, Dashboard, Builder)
│   │   └── types/             # TypeScript type definitions
│   └── package.json
├── backend/                   # Python + FastAPI
│   ├── app/
│   │   ├── core/              # Config, database, auth, Firebase setup
│   │   ├── models/            # Pydantic request/response models
│   │   ├── routers/           # API route handlers
│   │   └── services/          # PDF generation, ATS analysis, AI service
│   ├── tests/                 # Unit tests for ATS and AI services
│   ├── main.py                # FastAPI application entry point
│   └── requirements.txt
└── .gitignore
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4 |
| Backend | Python 3.11+, FastAPI, Pydantic v2 |
| Database | SQLite (async via aiosqlite) |
| Authentication | Firebase Authentication (Google Sign-In) |
| AI | LM Studio + Qwen3 4B 2507 (fully local, no external APIs) |
| PDF | FPDF2 (server-side generation) |
| HTTP Client | httpx (async) |

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- Firebase project with Google Sign-In enabled
- LM Studio (optional, for AI features)

### 1. Clone and install

```bash
git clone <repo-url>
cd ResumeForge
```

### 2. Backend setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
```

Create `.env` from the example:

```bash
cp .env.example .env
```

Place your Firebase service account JSON at `backend/firebase_credentials.json`.

Start the backend:

```bash
uvicorn main:app --reload
```

The API runs at `http://localhost:8000`. Verify with `GET /health`.

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create `.env` from the example:

```bash
cp .env.example .env
```

Fill in your Firebase configuration values (from Firebase Console > Project Settings).

Start the frontend:

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

### 4. Configure LM Studio (optional)

1. Download and install [LM Studio](https://lmstudio.ai)
2. Download the **Qwen3 4B 2507** model (or another chat-compatible model)
3. Start the LM Studio local server (default: `http://localhost:1234/v1`)

The backend connects to LM Studio automatically. If LM Studio is unavailable, AI features return a clear 503 error and all other functionality works normally.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated allowed origins |
| `FIREBASE_CREDENTIALS_PATH` | `firebase_credentials.json` | Path to Firebase service account JSON |
| `LM_STUDIO_BASE_URL` | `http://localhost:1234/v1` | LM Studio API base URL |
| `LM_STUDIO_MODEL` | *(empty)* | Specific model name (auto-detect if empty) |
| `LM_STUDIO_TIMEOUT` | `30` | LM Studio request timeout in seconds |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE` | Backend API URL (default: `http://localhost:8000`) |
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/api/auth/me` | Get authenticated user info |
| GET | `/api/resumes` | List user's resumes |
| POST | `/api/resumes` | Create a new resume |
| GET | `/api/resumes/{id}` | Get a specific resume |
| PUT | `/api/resumes/{id}` | Update a resume |
| DELETE | `/api/resumes/{id}` | Delete a resume |
| GET | `/api/resumes/{id}/pdf?template=` | Export resume as PDF |
| POST | `/api/resumes/{id}/ats/analyze` | Run ATS score analysis |
| POST | `/api/ai/improve-summary` | AI-improve a summary |
| POST | `/api/ai/improve-experience` | AI-improve experience description |
| POST | `/api/ai/improve-project` | AI-improve project description |
| POST | `/api/ai/tailor-resume` | AI tailoring suggestions vs job description |

All endpoints except `/health` require a valid Firebase ID token in the `Authorization: Bearer <token>` header.

## Testing

### Backend tests

```bash
cd backend
python -m pytest tests/ -v
```

Covers:
- ATS analyzer (13 tests): scoring determinism, keyword matching, section analysis, edge cases
- AI service (20 tests): LM Studio communication, prompt correctness, JSON parsing, Pydantic models

### Frontend build

```bash
cd frontend
npm run build
```

### Frontend lint

```bash
cd frontend
npm run lint
```

## Security

- Firebase service account credentials (`firebase_credentials.json`) are git-ignored and never exposed to the frontend
- All API routes verify Firebase ID tokens server-side before processing requests
- Resume ownership is enforced server-side -- users can only access their own resumes
- User IDs are extracted from verified Firebase tokens, never trusted from client input
- Environment files (`.env`) containing secrets are git-ignored
- AI runs entirely locally via LM Studio -- no data is sent to external AI services
- AI system prompts explicitly prohibit fabricating information

## License

This project is for portfolio demonstration purposes.
