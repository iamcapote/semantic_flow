# Architecture Overview

This document provides a high-level overview of the technical architecture for the Semantic Flow application.

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Flow
- **Backend**: Node.js, Fastify, tRPC
- **Database**: PostgreSQL with Prisma ORM
- **UI Components**: shadcn/ui, Radix UI
- **State Management**: React Query (TanStack Query)

## System Design

The application is a full-stack TypeScript monorepo composed of two main parts: a React frontend and a tRPC backend.

### Frontend

The frontend is a single-page application (SPA) built with React and Vite.
- **React Flow**: Core of the visual interface, providing the canvas, nodes, and edges for building workflows.
- **shadcn/ui**: UI component library, providing the building blocks for our interface.
- **Tailwind CSS**: Used for all styling.
- **tRPC Client**: Type-safe communication with the backend API.

### Backend

The backend is a Node.js server built with Fastify and tRPC.
- **Fastify**: Low-overhead web framework for Node.js.
- **tRPC**: End-to-end type safety for APIs, no code generation required.
- **Prisma**: ORM for PostgreSQL, providing a type-safe database client and handling migrations.

### Database

We use a PostgreSQL database, managed by Prisma. The schema is defined in `prisma/schema.prisma` and includes tables for:
- `User`: Stores user information.
- `Workflow`: Stores the created workflows, including the JSON representation of the graph.
- `ProviderConfig`: Manages user-specific configurations for different AI providers.
- `WorkflowExecution`: Tracks the execution history of workflows.
- `NodeExecution`: Tracks execution of individual nodes.
- And other related tables for configurations, executions, and API keys.

## Workflow Execution Engine

The execution engine is a backend component responsible for:
1. **Parsing** the workflow graph (nodes and edges).
2. **Topologically sorting** the nodes to determine the correct execution order.
3. **Executing** each node's logic, which may involve calling external AI APIs.
4. **Managing state** and passing the output of one node as the input to the next.
5. **Handling** errors and managing the overall execution lifecycle.

## Ontology Clusters & Node Types

The heart of Semantic Flow is its extensive ontology, defined in `src/lib/ontology.js`. It includes 16 clusters and 100+ node types for agentic workflows, world-building, code generation, and more:

| Cluster | Description |
| :--- | :--- |
| **Proposition (PROP)** | Basic truth assertions and statements. |
| **Inquiry (INQ)** | Nodes for seeking information and defining problems. |
| **Hypothesis/Evidence/Method (HEM)** | Scientific method building blocks. |
| **Reasoning (RSN)** | Core logic operations like deduction and induction. |
| **Evaluation Gates (EVL)** | Quality checks for consistency and validity. |
| **Modal & Mental-State (MOD)** | Logic, beliefs, and intentions. |
| **Speech-Act Markers (SPA)** | Communication intents. |
| **Discourse Meta (DSC)** | Managing discourse structure. |
| **Control & Meta Engines (CTL)** | Flow control and meta-level operations. |
| **Error/Exception (ERR)** | Handling errors and contradictions. |
| **Creative Operations (CRT)** | Brainstorming and combining concepts. |
| **Mathematical Reasoning (MTH)** | Mathematical logic and proofs. |
| **Cognitive Mechanics (COG)** | Modeling cognitive processes. |
| **Mind Constructs (MND)** | High-level mental and philosophical concepts. |
| **Non-Classical Logic (NCL)** | Alternative systems of logic. |
| **Dynamic Semantics (DYN)** | Handling context and meaning that changes over time. |
| **Utility (UTIL)** | Utility nodes for metadata and blank nodes. |

Refer to `src/lib/ontology.js` for the full, up-to-date list of clusters and node types.

## API Reference

The backend is powered by tRPC, providing type-safe API endpoints for workflows, providers, and execution. See `README.md` for details.

---

**Last Updated:** July 19, 2025
**Maintainers:** GitHub Copilot Engineering Team
