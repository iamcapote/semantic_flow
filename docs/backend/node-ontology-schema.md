# Node Ontology Schema

This document defines the schema for the various node types in our Semantic-Logic AI Workflow Builder.

## Overview

The node ontology is organized into clusters, with each node having a specific kind identifier that follows the pattern `{CLUSTER}-{TYPE}`. For example, `PROP-STM` represents a Statement node in the Proposition Cluster.

## Base Node Structure

```typescript
interface Node {
  id: string;              // Unique identifier for the node
  kind: NodeKind;          // Type of node (from the ontology)
  label: string;           // Human-readable label
  position?: {             // Position in the canvas (frontend use)
    x: number;
    y: number;
  };
  ports: Port[];           // Connection points for edges
  payload: Record<string, unknown>; // Node-specific data
  metadata?: {             // Optional metadata
    created: string;       // ISO timestamp
    modified: string;      // ISO timestamp
    tags: string[];        // User-defined tags
  };
}

interface Port {
  id: string;              // Unique identifier for the port
  name: string;            // Human-readable name
  type: "in" | "out";      // Direction of the port
  dataType?: string;       // Optional type specification for the data
}

interface Edge {
  id: string;              // Unique identifier for the edge
  source: string;          // Source node ID
  sourcePortId: string;    // Source port ID
  target: string;          // Target node ID
  targetPortId: string;    // Target port ID
  condition?: string;      // Optional JS expression for conditional flow
  relation?: EdgeRelation; // Semantic relation type
}

type EdgeRelation = "supports" | "contradicts" | "elaborates" | "causes";
```

## Node Kind Enumeration

The `NodeKind` enum defines all possible node types in our ontology:

```typescript
enum NodeKind {
  // Proposition Cluster
  PROP_STM = "PROP-STM", // Statement
  PROP_CLM = "PROP-CLM", // Claim
  PROP_DEF = "PROP-DEF", // Definition
  PROP_OBS = "PROP-OBS", // Observation
  PROP_CNC = "PROP-CNC", // Concept

  // Inquiry Cluster
  INQ_QRY = "INQ-QRY", // Query
  INQ_QST = "INQ-QST", // Question
  INQ_PRB = "INQ-PRB", // Problem

  // Hypothesis/Evidence/Method
  HEM_HYP = "HEM-HYP", // Hypothesis
  HEM_EVD = "HEM-EVD", // Evidence
  HEM_DAT = "HEM-DAT", // Data
  HEM_CTX = "HEM-CTX", // Counterexample
  HEM_MTH = "HEM-MTH", // Method
  HEM_PRC = "HEM-PRC", // Procedure
  HEM_ALG = "HEM-ALG", // Algorithm
  HEM_PRT = "HEM-PRT", // Protocol

  // Reasoning Cluster
  RSN_DED = "RSN-DED", // Deduction
  RSN_IND = "RSN-IND", // Induction
  RSN_ABD = "RSN-ABD", // Abduction
  RSN_ANL = "RSN-ANL", // Analogy
  RSN_IRL = "RSN-IRL", // InferenceRule

  // Evaluation Gates
  EVL_VER = "EVL-VER", // Verification
  EVL_VAL = "EVL-VAL", // Validation
  EVL_FAL = "EVL-FAL", // FalsifiabilityGate
  EVL_CON = "EVL-CON", // ConsistencyCheck

  // Modal / Mental-State Tags
  MOD_NEC = "MOD-NEC", // Necessity
  MOD_POS = "MOD-POS", // Possibility
  MOD_OBL = "MOD-OBL", // Obligation
  MOD_PER = "MOD-PER", // Permission
  MOD_TMP = "MOD-TMP", // TemporalTag
  MOD_EPI = "MOD-EPI", // EpistemicTag
  MOD_BEL = "MOD-BEL", // Belief
  MOD_DES = "MOD-DES", // Desire
  MOD_INT = "MOD-INT", // Intent

  // Speech-Act Markers
  SPA_AST = "SPA-AST", // Assertion
  SPA_REQ = "SPA-REQ", // Request
  SPA_CMD = "SPA-CMD", // Command
  SPA_ADV = "SPA-ADV", // Advice
  SPA_WRN = "SPA-WRN", // Warning
  SPA_PRM = "SPA-PRM", // Promise
  SPA_APO = "SPA-APO", // Apology

  // Discourse Meta
  DSC_ANN = "DSC-ANN", // Annotation
  DSC_REV = "DSC-REV", // Revision
  DSC_SUM = "DSC-SUM", // Summarization
  DSC_CIT = "DSC-CIT", // Citation
  DSC_CAV = "DSC-CAV", // Caveat

  // Control & Meta Engines
  CTL_BRN = "CTL-BRN", // Branch
  CTL_CND = "CTL-CND", // Condition
  CTL_LOP = "CTL-LOP", // Loop
  CTL_HLT = "CTL-HLT", // Halt
  CTL_ABD = "CTL-ABD", // AbductionEngine
  CTL_HSL = "CTL-HSL", // HeuristicSelector
  CTL_CRS = "CTL-CRS", // ConflictResolver
  CTL_PDX = "CTL-PDX", // ParadoxDetector

  // Error / Exception
  ERR_CON = "ERR-CON", // Contradiction
  ERR_FAL = "ERR-FAL", // Fallacy
  ERR_EXC = "ERR-EXC", // Exception

  // Creative Operations
  CRT_INS = "CRT-INS", // Insight
  CRT_DIV = "CRT-DIV", // DivergentThought
  CRT_COM = "CRT-COM", // ConceptCombination

  // Mathematical Reasoning
  MTH_PRF = "MTH-PRF", // ProofStrategy
  MTH_CON = "MTH-CON", // Conjecture
  MTH_UND = "MTH-UND", // UndecidableTag

  // Cognitive Mechanics
  COG_CHN = "COG-CHN", // Chunk
  COG_SCH = "COG-SCH", // Schema
  COG_CLD = "COG-CLD", // CognitiveLoad
  COG_PRM = "COG-PRM", // Priming
  COG_INH = "COG-INH", // Inhibition
  COG_THG = "COG-THG", // ThresholdGate
  COG_FLU = "COG-FLU", // FluidIntelligence
  COG_CRY = "COG-CRY", // CrystallizedProxy

  // Mind Constructs
  MND_PHF = "MND-PHF", // PhenomenalField
  MND_ACC = "MND-ACC", // AccessConsciousness
  MND_ZOM = "MND-ZOM", // ZombieArgument
  MND_SUP = "MND-SUP", // SupervenienceTag
  MND_EXT = "MND-EXT", // ExtendedMind
  MND_EMB = "MND-EMB", // EmbeddedProcess

  // Non-Classical Logic
  NCL_REL = "NCL-REL", // RelevanceMarker
  NCL_LIN = "NCL-LIN", // LinearResource
  NCL_MNV = "NCL-MNV", // ManyValued
  NCL_QNT = "NCL-QNT", // QuantumLogic
  NCL_REV = "NCL-REV", // BeliefRevision
  NCL_AGM = "NCL-AGM", // AGM-Operator

  // Dynamic Semantics
  DYN_UPD = "DYN-UPD", // UpdateProcedure
  DYN_CSH = "DYN-CSH", // ContextShift
  DYN_REF = "DYN-REF", // DiscourseReferent
  DYN_ANA = "DYN-ANA", // AnaphoraTag
  DYN_CGD = "DYN-CGD", // CommonGround
  DYN_PRS = "DYN-PRS", // Presupposition

  // Cross-cutting Deficit Nodes
  HYB_NEU = "HYB-NEU", // NeuroSymbolicMap
  ATT_ECO = "ATT-ECO", // AttentionBudget
  ETH_BIA = "ETH-BIA", // BiasAudit
}
```

## Port Configurations

Each node type has a specific port configuration. Here are some examples:

### Proposition Nodes (PROP-*)
```typescript
// Statement Node
{
  id: "uuid",
  kind: NodeKind.PROP_STM,
  label: "Statement: The sky is blue",
  ports: [
    { id: "in", name: "input", type: "in" },
    { id: "out", name: "output", type: "out" }
  ],
  payload: {
    content: "The sky is blue",
    truthValue: true
  }
}
```

### Reasoning Nodes (RSN-*)
```typescript
// Deduction Node
{
  id: "uuid",
  kind: NodeKind.RSN_DED,
  label: "Modus Ponens",
  ports: [
    { id: "premise1", name: "Major Premise", type: "in" },
    { id: "premise2", name: "Minor Premise", type: "in" },
    { id: "conclusion", name: "Conclusion", type: "out" }
  ],
  payload: {
    rule: "Modus Ponens",
    description: "If P implies Q, and P is true, then Q must be true"
  }
}
```

### Evaluation Gates (EVL-*)
```typescript
// Consistency Check Node
{
  id: "uuid",
  kind: NodeKind.EVL_CON,
  label: "Consistency Check",
  ports: [
    { id: "statements", name: "Statements", type: "in" },
    { id: "result", name: "Result", type: "out" }
  ],
  payload: {
    checkType: "non-contradiction",
    errorMessage: "Statements are inconsistent"
  }
}
```

## Execution Context

During execution, nodes manipulate a context object that contains:

```typescript
interface ExecutionContext {
  symbols: Record<string, any>;  // Symbol table for variables
  traces: Array<{               // Execution traces for debugging
    nodeId: string;
    timestamp: string;
    action: string;
    result: any;
  }>;
  errors: Array<{               // Errors encountered
    nodeId: string;
    message: string;
    severity: "warning" | "error";
  }>;
}
```

## Edge Conditions

Edge conditions are JavaScript expressions that can reference the context object:

```typescript
// Example edge condition
{
  id: "edge1",
  source: "node1",
  target: "node2",
  condition: "ctx.symbols.temperature > 30"
}
```

The condition is evaluated during runtime to determine if the edge should be traversed.
