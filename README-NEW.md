# 🧠 Semantic Logic AI Workflow Builder

> **Transform complex reasoning into elegant visual workflows**  
> Build sophisticated AI logic chains using our semantic node system with 50+ ontology-driven components.

![Project Status](https://img.shields.io/badge/Status-Production%20Ready-green)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ✨ What Is This?

The **Semantic Logic AI Workflow Builder** is a revolutionary visual tool that transforms the way we build AI reasoning systems. Instead of writing complex prompts in text, you construct **semantic workflows** using drag-and-drop nodes representing formal logic concepts like hypotheses, evidence, deductions, and speech acts.

**Think of it as "Prompt Engineering on Steroids" - but visual, intuitive, and grounded in cognitive science.**

### 🎯 Perfect For:
- **Researchers** building complex reasoning chains
- **AI Engineers** designing sophisticated prompt workflows  
- **Educators** teaching logic and critical thinking
- **Anyone** who wants to make AI reasoning transparent and debuggable

---

## 🚀 Quick Start Guide

### For Non-Technical Users

1. **Start the Application**
   ```bash
   # Clone and navigate to the project
   git clone <repository-url>
   cd chatgpt-clone-285
   
   # Install dependencies and start
   npm install
   npm run dev
   ```

2. **Access the App**
   - Open your browser to `http://localhost:8080`
   - Enter your OpenAI API key on the landing page
   - Start building workflows immediately!

3. **Create Your First Workflow**
   - Drag nodes from the left palette onto the canvas
   - Connect them by clicking and dragging between node handles
   - Add content to each node by clicking on them
   - Execute your workflow to see AI reasoning in action

### For Technical Users

#### Prerequisites
- Node.js 18+ 
- PostgreSQL (via Docker)
- OpenAI API key

#### Development Setup
```bash
# 1. Install dependencies
npm install
cd server && npm install && cd ..

# 2. Start PostgreSQL database
docker run --name postgres-workflow \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=workflow_db \
  -p 127.0.0.1:5432:5432 \
  -d postgres:13

# 3. Setup database schema
cd server
npx prisma migrate dev
node seed-user.js
cd ..

# 4. Start development servers
# Terminal 1: Frontend (Vite)
npm run dev

# Terminal 2: Backend (tRPC + Fastify)
cd server && npm run dev:server
```

#### Production Build
```bash
npm run build:dev
npm run preview
```

---

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, React Flow
- **Backend**: Node.js, Fastify, tRPC, Prisma ORM
- **Database**: PostgreSQL
- **UI Components**: shadcn/ui, Radix UI
- **State Management**: React Query (TanStack Query)

### Project Structure
```
chatgpt-clone-285/
├── src/                          # Frontend React application
│   ├── components/               # Reusable UI components
│   │   ├── ui/                   # Base UI components (shadcn)
│   │   ├── NodePalette.jsx       # Semantic node library
│   │   ├── LabCanvas.jsx         # React Flow workflow canvas
│   │   └── SemanticNode.jsx      # Custom workflow nodes
│   ├── pages/                    # Main application pages
│   │   ├── LandingPage.jsx       # API key entry & onboarding
│   │   ├── WorkflowBuilderPage.jsx # Main workflow editor
│   │   └── ChatPage.jsx          # Chat interface
│   ├── lib/                      # Core libraries
│   │   ├── ontology.js           # 50+ semantic node definitions
│   │   ├── graphSchema.js        # Workflow data structures
│   │   ├── exportUtils.js        # Multi-format export
│   │   └── trpc.js              # API client configuration
│   └── integrations/             # External service integrations
│       └── supabase/             # Database client (fallback)
├── server/                       # Backend tRPC API server
│   ├── src/
│   │   ├── routers/              # API route definitions
│   │   ├── context.ts            # Request context setup
│   │   └── index.ts              # Server entry point
│   ├── prisma/                   # Database schema & migrations
│   └── package.json              # Backend dependencies
└── public/                       # Static assets
```

---

## 🎨 Features

### 🧩 **Visual Workflow Builder**
- **50+ Semantic Node Types** across 10 ontological clusters
- **Drag-and-Drop Interface** with React Flow canvas
- **Real-time Collaboration** ready architecture
- **Zoom, Pan, and Navigate** large workflow graphs

### 🎯 **Semantic Ontology**
| Cluster | Node Types | Purpose |
|---------|------------|---------|
| **Proposition** | Statement, Claim, Definition, Observation | Basic truth assertions |
| **Inquiry** | Query, Question, Problem | Information seeking |
| **Evidence** | Hypothesis, Evidence, Data, Counterexample | Scientific method |
| **Reasoning** | Deduction, Induction, Abduction, Analogy | Logic operations |
| **Evaluation** | Verification, Validation, Consistency Check | Quality gates |
| **Modal** | Necessity, Possibility, Temporal Tags | Logical modalities |
| **Speech Acts** | Assertion, Request, Command, Promise | Communication intents |
| **Meta** | Annotation, Revision, Citation | Discourse management |
| **Control** | Branch, Loop, Condition | Flow control |
| **Error** | Contradiction, Fallacy, Exception | Error handling |

### 🔧 **Professional Tools**
- **Multi-Format Export**: JSON, YAML, Markdown, XML
- **AI Text-to-Workflow**: Convert text into preliminary node graphs
- **Session Security**: BYOK (Bring Your Own Key) model
- **Theme Support**: Professional light/dark modes
- **Responsive Design**: Works on desktop, tablet, and mobile

### ⚡ **AI Integration**
- **OpenAI GPT-4/GPT-4o** integration
- **Configurable Models** and parameters
- **Step-by-step Execution** with visual feedback
- **Chat Interface** for testing workflows
- **Streaming Results** for real-time interaction

---

## 🔐 Security & Privacy

### BYOK (Bring Your Own Key) Model
- **No API Key Storage**: Your OpenAI keys never leave your browser session
- **Session-Only Persistence**: Keys cleared when you close the browser
- **Local Database**: PostgreSQL bound to localhost only
- **Encrypted Communication**: All API calls use HTTPS

### Data Handling
- **Workflows**: Stored locally in PostgreSQL database
- **Session Data**: Browser sessionStorage only
- **Export Control**: You own and control all your data

---

## 📚 Usage Examples

### Example 1: Scientific Hypothesis Testing
```
[Research Question] → [Hypothesis] → [Evidence Collection] 
     ↓                    ↓               ↓
[Literature Review] → [Experimental Design] → [Data Analysis]
     ↓                    ↓               ↓
[Peer Review] → [Publication] → [Replication Studies]
```

### Example 2: Legal Argument Structure
```
[Legal Claim] → [Precedent Evidence] → [Statutory Analysis]
     ↓               ↓                    ↓
[Counterarguments] → [Rebuttal] → [Judicial Decision]
```

### Example 3: Business Decision Making
```
[Problem Definition] → [Stakeholder Analysis] → [Option Generation]
     ↓                    ↓                      ↓
[Risk Assessment] → [Cost-Benefit Analysis] → [Implementation Plan]
```

---

## 🚀 API Reference

### tRPC Endpoints

#### Workflows
```typescript
// List all workflows
workflow.list.useQuery()

// Get specific workflow
workflow.get.useQuery(workflowId)

// Create new workflow
workflow.create.useMutation({
  title: string,
  description?: string,
  content: {
    nodes: Node[],
    edges: Edge[],
    viewport: Viewport
  }
})

// Update workflow
workflow.update.useMutation({
  id: string,
  data: Partial<WorkflowData>
})

// Delete workflow
workflow.delete.useMutation(workflowId)
```

#### Node Schema
```typescript
interface SemanticNode {
  id: string
  type: 'semantic'
  position: { x: number, y: number }
  data: {
    type: string          // Node type code (e.g., 'PROP-STM')
    label: string         // Display name
    content: string       // User-entered content
    metadata: {
      cluster: string     // Ontological cluster
      tags: string[]      // Semantic tags
      color: string       // Visual color code
    }
  }
}
```

---

## 🛠️ Development

### Available Scripts

#### Frontend
```bash
npm run dev          # Start Vite development server (port 8080)
npm run build        # Production build
npm run build:dev    # Development build
npm run preview      # Preview production build
npm run lint         # ESLint code checking
```

#### Backend
```bash
cd server
npm run dev:server   # Start tRPC development server (port 3001)
npx prisma studio    # Database admin interface
npx prisma migrate dev # Run database migrations
```

#### Database
```bash
# Start PostgreSQL container
docker run --name postgres-workflow \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=workflow_db \
  -p 127.0.0.1:5432:5432 \
  -d postgres:13

# Seed default user
cd server && node seed-user.js
```

### Environment Variables
```bash
# server/.env
DATABASE_URL="postgresql://postgres:password@localhost:5432/workflow_db"
SUPABASE_URL="your-supabase-url"
SUPABASE_ANON_KEY="your-supabase-key"
```

### Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📋 Troubleshooting

### Common Issues

**Q: The landing page doesn't appear**
A: Clear your browser's sessionStorage: `sessionStorage.clear(); location.reload()`

**Q: Backend server won't start**
A: Ensure PostgreSQL is running and the DATABASE_URL is correct

**Q: Node palette appears white in dark mode**
A: Hard refresh your browser (Ctrl+F5) to reload the CSS

**Q: Workflow execution fails**
A: Verify your OpenAI API key is valid and has sufficient credits

### Server Status Check
```bash
# Check if services are running
curl http://localhost:3001/health  # Backend health
curl http://localhost:8080         # Frontend status
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **React Flow** for the incredible workflow canvas library
- **shadcn/ui** for the beautiful component system
- **tRPC** for type-safe API development
- **Tailwind CSS** for the utility-first styling approach
- **OpenAI** for the powerful language models

---

## 📞 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Open a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas

---

**Built with ❤️ for the future of AI reasoning**
