# CAMPVENTO

> **AI-Powered Campus Sponsorship Intelligence Platform**  
> *"Connecting the right campus opportunities with the right sponsors."*

CAMPVENTO is a platform built to bridge student organizers and sponsors using intelligent matchmaking, sponsorship analytics, and streamlined campaign execution.

---

## Repository Structure

```
campvento/
├── frontend/             # React + Vite + TypeScript + Tailwind CSS
├── backend/              # Python + FastAPI Application
│   ├── app/
│   │   ├── main.py       # FastAPI application entry point
│   │   ├── config.py     # Configuration and environment settings
│   │   └── api/          # API route definitions
│   ├── requirements.txt  # Python backend dependencies
│   └── .env              # Backend environment variables
├── docs/                 # Documentation and architecture guides
│   └── architecture.md
├── .gitignore            # Git ignore rules
├── .env.example          # Environment variable template
└── README.md             # Project documentation
```

---

## Prerequisites

- **Node.js**: `v18.0.0` or higher (recommended: `v20+` or `v24+`)
- **npm**: `v9.0.0` or higher
- **Python**: `3.10` or higher

---

## Quick Start Guide

### 1. Backend Setup (FastAPI)

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv .venv
     .\.venv\Scripts\Activate.ps1
     ```
   - **macOS / Linux**:
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create the `.env` file (copied from `.env.example` or configured directly):
   ```bash
   # Ensure backend/.env exists with appropriate settings
   ```

5. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

6. Verify the backend is running:
   - Health Check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
   - Interactive API Docs (Swagger): [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
   - Alternative API Docs (ReDoc): [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

### 2. Frontend Setup (React + Vite + TypeScript)

1. Open another terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   - [http://localhost:5173](http://localhost:5173)

---

## Health Check Verification

To verify that the backend API is up and running, send a GET request to `/health`:

```bash
curl http://127.0.0.1:8000/health
```

**Expected Response**:
```json
{
  "status": "ok",
  "service": "campvento-api"
}
```

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons |
| **Backend** | Python 3.14, FastAPI, Uvicorn, Pydantic v2 |
| **Tooling** | Git, PostCSS, Vite Dev Server |
