# Engineering Workspace & Project Context
## Semantic Logic AI Workflow Builder v1.0.0

**Status**: ✅ PRODUCTION READY MVP  
**Version**: 1.0.0 (See [CHANGELOG.md](./CHANGELOG.md))  
**Last Updated**: July 17, 2025

---

## 📖 How to Use This Workspace

This document is the central log for engineering coordination. It serves as a living record of the project's status, key technical decisions, and handoffs between team members.

### Best Practices (Learnings from v1.0.0 Development)
- **Reverse Chronological Order**: Keep the latest status and updates at the top. Older development history is preserved at the bottom for context.
- **Log Key Decisions**: When a significant technical choice is made (e.g., switching database providers, refactoring an API), document the *what* and *why*.
- **Clear Handoffs**: Use explicit headings (e.g., `🎯 READY FOR ENGINEER #1`) to delineate responsibility and ensure smooth transitions.
- **Link to Artifacts**: Reference important files (`prisma/schema.prisma`), documentation (`DEPLOYMENT.md`), or specific API endpoints to provide direct context.

---

## 🚀 Developer Quick Start

### Prerequisites
- **Node.js**: v18+
- **Docker**: For running the PostgreSQL database.

### 1. Installation
```bash
# Install root and server dependencies
npm install
cd server && npm install && cd ..
```

### 2. Database Setup
```bash
# Start PostgreSQL container (listens on 127.0.0.1:5432)
docker run --name semantic-workflows-db -e POSTGRES_PASSWORD=password -p 127.0.0.1:5432:5432 -d postgres

# Apply database schema
npx prisma migrate dev --schema=./prisma/schema.prisma
```

### 3. Run The Application
```bash
# Terminal 1: Start Frontend (Vite)
# URL: http://localhost:8080
npm run dev

# Terminal 2: Start Backend (tRPC)
# URL: http://localhost:3001
cd server && npm run dev:server
```

---

## 🏗️ Project Status & Architecture (v1.0.0)

The project is a production-ready visual tool for building, testing, and executing AI reasoning workflows with multi-provider support.

### Core Features
- **Visual Workflow Builder**: A React Flow canvas with 50+ semantic nodes for constructing complex logic chains.
- **Multi-Provider AI**: Supports OpenAI, OpenRouter, Venice AI, and custom endpoints, with user-configurable API keys and models.
- **BYOK Security Model**: "Bring Your Own Key" ensures user API keys are never stored on the server, using session-only browser storage.
- **Multi-Format Export**: Workflows can be exported to JSON, YAML, Markdown, and XML.

### Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, shadcn/ui
- **State Management**: TanStack Query (React Query)
- **Backend**: Node.js, Fastify
- **API**: tRPC for end-to-end type-safe communication
- **Database**: PostgreSQL with Prisma ORM

### Architectural Map (Key Files & Folders)

- **`DOCUMENTATION.md`**: The main index for all project documentation.
- **`DEPLOYMENT.md` / `OPTIMIZATION.md`**: Guides for production deployment and performance tuning.

- **`src/`**: Frontend React application.
  - `pages/WorkflowBuilderPage.jsx`: The main UI container for the application.
  - `components/LabCanvas.jsx`: The core React Flow canvas component where workflows are built.
  - `components/ProviderSettings.jsx`: The UI for managing AI provider configurations.
  - `lib/ontology.js`: **The heart of the application's logic**, defining the 50+ semantic node types.
  - `lib/trpc.ts`: tRPC client configuration and initialization.

- **`server/`**: Backend tRPC API server.
  - `index.ts`: Fastify server entry point and tRPC plugin registration.
  - `routers/index.ts`: The main `appRouter` that combines all API modules.
  - `routers/workflow.ts`: tRPC router for core workflow CRUD operations.
  - `routers/provider.ts`: tRPC router for the multi-provider AI configuration system.

- **`prisma/`**: Database layer.
  - `schema.prisma`: **The single source of truth for all data models**. Defines the structure for `User`, `Workflow`, `ProviderConfig`, etc.

### API Reference (tRPC Endpoints)

#### Workflows (`workflow.*`)
- `list`: Fetches all workflows for the current user.
- `get`: Retrieves a single workflow by its ID.
- `create`: Creates a new workflow.
- `update`: Updates an existing workflow.
- `delete`: Deletes a workflow.

#### AI Providers (`provider.*`)
- `getConfig`: Retrieves the provider configurations for a user, creating defaults if none exist.
- `updateConfig`: Updates a user's provider settings.
- `testNode`: Executes a test prompt against a specific provider and model.

---

## 📜 Development History (Condensed Milestones)

This section summarizes the major development phases that led to the v1.0.0 release.

- **Phase 1: Core Architecture & Semantic Ontology**
  - Established the foundational project structure.
  - Defined the 50+ semantic node types in `ontology.js` and the core `graphSchema.js`.
  - Built the initial React Flow canvas and node palette.

- **Phase 2: Full-Stack Integration**
  - Developed the backend tRPC server with Fastify.
  - Implemented the Prisma schema and connected to a PostgreSQL database.
  - Integrated the frontend and backend, replacing localStorage with API calls for workflow persistence.

- **Phase 3: Security & Session Management**
  - Implemented the "Bring Your Own Key" (BYOK) security model.
  - Ensured API keys are only stored in the browser's session storage and never on the server.
  - Secured the database to only accept localhost connections.

- **Phase 4: Professional UI/UX Enhancement**
  - Overhauled the visual design with a professional color scheme and layout.
  - Implemented a comprehensive dark mode.
  - Improved responsiveness and created a modern landing page.

- **Phase 5: Multi-Provider AI Integration & Finalization**
  - Architected and implemented the multi-provider AI system.
  - Added database models and API endpoints for managing provider configurations.
  - Built the frontend UI for users to configure and test different AI providers.
  - Completed final debugging, documentation updates, and declared the project production-ready.