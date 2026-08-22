# CAMPVENTO Architecture Overview

## Introduction
CAMPVENTO is an AI-powered campus sponsorship intelligence platform designed to connect the right campus opportunities with the right sponsors.

## System Components

### 1. Frontend (`/frontend`)
- **Framework**: React 18 / 19 with TypeScript
- **Bundler / Dev Server**: Vite
- **Styling**: Tailwind CSS
- **Purpose**: Provides the user interface for organizers and sponsors to explore opportunities, manage sponsorships, and view intelligence metrics.

### 2. Backend (`/backend`)
- **Framework**: FastAPI (Python 3.10+)
- **ASGI Server**: Uvicorn
- **Configuration**: Pydantic Settings
- **Structure**:
  - `app/main.py`: Application entry point, middleware setup, router registration.
  - `app/config.py`: Centralized environment and application configuration.
  - `app/api/`: API route definitions and endpoint handlers.
- **Endpoints**:
  - `GET /health`: Basic health check endpoint confirming service status.

### 3. Separation of Concerns
- The frontend and backend are completely decoupled and communicate via REST APIs.
- CORS is preconfigured to allow local frontend development communication.
