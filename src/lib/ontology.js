// Semantic Logic AI Workflow Builder - Ontology Definitions
// Based on newplan.md specifications

export const ONTOLOGY_CLUSTERS = {
  PROP: { name: 'Proposition', icon: '📝', description: 'Basic truth assertions' },
  INQ: { name: 'Inquiry', icon: '❓', description: 'Information seeking' },
  HEM: { name: 'Hypothesis/Evidence/Method', icon: '🔬', description: 'Scientific method' },
  RSN: { name: 'Reasoning', icon: '🧠', description: 'Logic operations' },
  EVL: { name: 'Evaluation Gates', icon: '✅', description: 'Quality gates' },
  MOD: { name: 'Modal & Mental-State', icon: '💭', description: 'Logical modalities' },
  SPA: { name: 'Speech-Act Markers', icon: '💬', description: 'Communication intents' },
  DSC: { name: 'Discourse Meta', icon: '📚', description: 'Discourse management' },
  CTL: { name: 'Control & Meta Engines', icon: '⚙️', description: 'Flow control' },
  ERR: { name: 'Error/Exception', icon: '⚠️', description: 'Error handling' },
  CRT: { name: 'Creative Operations', icon: '🎨', description: 'Creative processes' },
  MTH: { name: 'Mathematical Reasoning', icon: '📐', description: 'Mathematical logic' },
  COG: { name: 'Cognitive Mechanics', icon: '🧩', description: 'Cognitive processes' },
  MND: { name: 'Mind Constructs', icon: '🧘', description: 'Mental constructs' },
  NCL: { name: 'Non-Classical Logic', icon: '🔀', description: 'Alternative logic systems' },
  DYN: { name: 'Dynamic Semantics', icon: '⚡', description: 'Dynamic meaning' },
  UTIL: { name: 'Utility', icon: '🛠️', description: 'Utility nodes (blank, metadata)' },
  CRY: { name: 'Crypto/Web3', icon: '🪙', description: 'Wallets, tokens, DEX, lending, bridges, oracles' }
};

export const NODE_TYPES = {
  // Crypto/Web3 Cluster CRY-*
  'CRY-WALLET': { label: 'Wallet', icon: '👛', tags: ['crypto','account'], description: 'Represents a user or system wallet/account. Holds keys and manages on-chain actions.', cluster: 'CRY' },
  'CRY-TOKEN': { label: 'Token', icon: '🪙', tags: ['crypto','asset'], description: 'Fungible or non-fungible asset reference. Use to model inputs/outputs and balances.', cluster: 'CRY' },
  'CRY-DEX-SWAP': { label: 'DEX Swap', icon: '🔄', tags: ['dex','swap'], description: 'Swaps one token for another using a DEX. Parameters: pool, fee, slippage.', cluster: 'CRY' },
  'CRY-LEND': { label: 'Lend/Deposit', icon: '🏦', tags: ['lending','deposit'], description: 'Deposits collateral into a lending protocol or vault.', cluster: 'CRY' },
  'CRY-BORROW': { label: 'Borrow', icon: '📉', tags: ['lending','borrow'], description: 'Borrows a token against collateral. Parameters: LTV, thresholds.', cluster: 'CRY' },
  'CRY-RISK': { label: 'Risk Guard', icon: '🛡️', tags: ['risk','health'], description: 'Monitors health factor and routes either to loop or exit based on thresholds.', cluster: 'CRY' },
  'CRY-ORACLE': { label: 'Price Oracle', icon: '📈', tags: ['oracle','price'], description: 'Provides price data for tokens. Use for simulation and validation.', cluster: 'CRY' },
  'CRY-BRIDGE': { label: 'Bridge', icon: '🌉', tags: ['bridge','chain'], description: 'Transfers tokens across chains. Parameters: source, destination, bridge.', cluster: 'CRY' },
  'CRY-VAULT': { label: 'Vault', icon: '🗄️', tags: ['vault','strategy'], description: 'Aggregates deposits with a strategy (auto-compound, yield).', cluster: 'CRY' },
  'CRY-STRAT': { label: 'Strategy', icon: '🧭', tags: ['yield','automation'], description: 'Defines a multi-step automated plan (e.g., leverage loop).', cluster: 'CRY' },

  // Speech-Act Markers Cluster SPA-*
  'SPA-REQ': { label: 'Request', icon: '🙏', tags: ['speech-act','request'], description: 'Initiates an action or asks for information from another agent or node. Used to drive workflow steps and inter-node communication.', cluster: 'SPA' },
  'SPA-ACK': { label: 'Acknowledgment', icon: '👍', tags: ['speech-act','ack'], description: 'Confirms receipt or understanding of a message or action. Useful for workflow synchronization and error handling.', cluster: 'SPA' },
  'SPA-APPR': { label: 'Approval', icon: '✅', tags: ['speech-act','approval'], description: 'Indicates acceptance or endorsement of a proposal, result, or action. Used for gating and decision points.', cluster: 'SPA' },
  'SPA-DECL': { label: 'Declaration', icon: '📢', tags: ['speech-act','declaration'], description: 'Makes a formal statement or announcement. Used for workflow state changes and notifications.', cluster: 'SPA' },
  'SPA-REF': { label: 'Refusal', icon: '🚫', tags: ['speech-act','refusal'], description: 'Denies a request or rejects a proposal. Used for error handling and alternative path selection.', cluster: 'SPA' },

  // Discourse Meta Cluster DSC-*
  'DSC-TOPIC': { label: 'Topic', icon: '🗂️', tags: ['discourse','topic'], description: 'Defines the subject or theme of a discourse segment. Used for organizing workflows and semantic navigation.', cluster: 'DSC' },
  'DSC-FOCUS': { label: 'Focus', icon: '🎯', tags: ['discourse','focus'], description: 'Highlights the current point of attention or priority in a workflow. Guides user or agent actions.', cluster: 'DSC' },
  'DSC-SEG': { label: 'Segment', icon: '✂️', tags: ['discourse','segment'], description: 'Divides discourse or workflow into manageable sections. Useful for modularity and clarity.', cluster: 'DSC' },
  'DSC-REF': { label: 'Reference', icon: '🔗', tags: ['discourse','reference'], description: 'Links to other nodes, documents, or external resources. Enables cross-referencing and semantic integration.', cluster: 'DSC' },

  // Control & Meta Engines Cluster CTL-*
  'CTL-START': { label: 'Start', icon: '🚦', tags: ['control','start'], description: 'Marks the entry point of a workflow or process. Used to initialize and trigger execution.', cluster: 'CTL' },
  'CTL-END': { label: 'End', icon: '🏁', tags: ['control','end'], description: 'Marks the termination point of a workflow or process. Used to finalize and clean up execution.', cluster: 'CTL' },
  'CTL-PAUSE': { label: 'Pause', icon: '⏸️', tags: ['control','pause'], description: 'Temporarily halts workflow execution. Useful for debugging, user intervention, or conditional logic.', cluster: 'CTL' },
  'CTL-RESUME': { label: 'Resume', icon: '▶️', tags: ['control','resume'], description: 'Continues workflow execution after a pause. Used for stepwise or conditional processing.', cluster: 'CTL' },
  'CTL-BRANCH': { label: 'Branch', icon: '🌿', tags: ['control','branch'], description: 'Splits workflow into multiple paths based on conditions. Enables parallelism and decision logic.', cluster: 'CTL' },
  'CTL-MERGE': { label: 'Merge', icon: '🔀', tags: ['control','merge'], description: 'Combines multiple workflow paths into one. Used for synchronization and result aggregation.', cluster: 'CTL' },

  // Error/Exception Cluster ERR-*
  'ERR-EXC': { label: 'Exception', icon: '⚠️', tags: ['error','exception'], description: 'Represents an error or exceptional condition in workflow execution. Used for error handling and recovery.', cluster: 'ERR' },
  'ERR-REC': { label: 'Recovery', icon: '🛠️', tags: ['error','recovery'], description: 'Defines steps to recover from errors or exceptions. Ensures workflow robustness and reliability.', cluster: 'ERR' },
  'ERR-LOG': { label: 'Error Log', icon: '📋', tags: ['error','log'], description: 'Records errors and exceptions for analysis and debugging. Useful for monitoring and improvement.', cluster: 'ERR' },

  // Creative Operations Cluster CRT-*
  'CRT-IDEA': { label: 'Idea', icon: '💡', tags: ['creative','idea'], description: 'Captures a creative thought, suggestion, or innovation. Used for brainstorming and workflow expansion.', cluster: 'CRT' },
  'CRT-GEN': { label: 'Generate', icon: '✨', tags: ['creative','generate'], description: 'Initiates creative generation of content, solutions, or alternatives. Drives innovation and exploration.', cluster: 'CRT' },
  'CRT-MOD': { label: 'Modify', icon: '🛠️', tags: ['creative','modify'], description: 'Alters or adapts existing content or solutions. Enables iterative improvement and customization.', cluster: 'CRT' },
  'CRT-COMB': { label: 'Combine', icon: '🔗', tags: ['creative','combine'], description: 'Merges multiple ideas, solutions, or data sources. Used for synthesis and integration.', cluster: 'CRT' },

  // Mathematical Reasoning Cluster MTH-*
  'MTH-EXPR': { label: 'Expression', icon: '🧮', tags: ['math','expression'], description: 'Represents a mathematical formula or computation. Used for calculation and modeling.', cluster: 'MTH' },
  'MTH-EQ': { label: 'Equation', icon: '🟰', tags: ['math','equation'], description: 'Defines a mathematical relationship between variables. Central to modeling and problem solving.', cluster: 'MTH' },
  'MTH-THM': { label: 'Theorem', icon: '📐', tags: ['math','theorem'], description: 'States a proven mathematical result. Used for logical reasoning and workflow validation.', cluster: 'MTH' },
  'MTH-PRF': { label: 'Proof', icon: '📝', tags: ['math','proof'], description: 'Demonstrates the validity of a theorem or claim. Essential for rigorous reasoning and verification.', cluster: 'MTH' },

  // Cognitive Mechanics Cluster COG-*
  'COG-PLAN': { label: 'Plan', icon: '🗺️', tags: ['cognitive','plan'], description: 'Outlines a sequence of actions or steps to achieve a goal. Used for workflow design and execution.', cluster: 'COG' },
  'COG-GOAL': { label: 'Goal', icon: '🎯', tags: ['cognitive','goal'], description: 'Defines a desired end state or objective. Central to motivation and workflow direction.', cluster: 'COG' },
  'COG-DEC': { label: 'Decision', icon: '🗳️', tags: ['cognitive','decision'], description: 'Represents a choice made between alternatives. Used for branching and workflow control.', cluster: 'COG' },
  'COG-EVAL': { label: 'Evaluation', icon: '✅', tags: ['cognitive','evaluation'], description: 'Assesses options, outcomes, or processes. Guides optimization and improvement.', cluster: 'COG' },

  // Mind Constructs Cluster MND-*
  'MND-BEL': { label: 'Belief', icon: '🧠', tags: ['mind','belief'], description: 'Represents a held assumption or conviction. Used for reasoning, decision-making, and workflow context.', cluster: 'MND' },
  'MND-DES': { label: 'Desire', icon: '❤️', tags: ['mind','desire'], description: 'Captures a want or preference. Influences workflow objectives and priorities.', cluster: 'MND' },
  'MND-INT': { label: 'Intention', icon: '🤔', tags: ['mind','intention'], description: 'Indicates a planned action or commitment. Drives workflow execution and agent behavior.', cluster: 'MND' },

  // Non-Classical Logic Cluster NCL-*
  'NCL-FUZZY': { label: 'Fuzzy Logic', icon: '🌫️', tags: ['non-classical','fuzzy'], description: 'Handles reasoning with degrees of truth rather than binary values. Used for uncertainty and approximate reasoning.', cluster: 'NCL' },
  'NCL-MODAL': { label: 'Modal Logic', icon: '🔮', tags: ['non-classical','modal'], description: 'Explores necessity, possibility, and other modalities. Useful for advanced reasoning and workflow constraints.', cluster: 'NCL' },
  'NCL-INTU': { label: 'Intuitionistic Logic', icon: '🧘', tags: ['non-classical','intuitionistic'], description: 'Rejects the law of excluded middle. Used for constructive proofs and alternative reasoning.', cluster: 'NCL' },

  // Dynamic Semantics Cluster DYN-*
  'DYN-CNTXT': { label: 'Context', icon: '🌐', tags: ['dynamic','context'], description: 'Defines the situational or semantic context for workflow execution. Enables adaptive and context-aware logic.', cluster: 'DYN' },
  'DYN-UPDATE': { label: 'Update', icon: '🔄', tags: ['dynamic','update'], description: 'Modifies the state or context during workflow execution. Used for dynamic adaptation and learning.', cluster: 'DYN' },
  // Utility Cluster UTIL-*
  'UTIL-BLANK': { label: 'Blank Node', icon: '⬜', tags: ['utility'], description: 'A fully editable placeholder node. You can change its name, contents, and all properties. Use to reserve space, scaffold workflows, visually separate sections, or create custom nodes.', cluster: 'UTIL' },
  'UTIL-META': { label: 'Metadata Node', icon: '🗂️', tags: ['utility','meta'], description: 'Stores workflow or node metadata such as author, version, or custom tags. Useful for documentation and tracking.', cluster: 'UTIL' },

  // Coding Paradigm Cluster CODE-PARADIGM-*
  'CODE-IMP': { label: 'Imperative', icon: '📝', tags: ['paradigm','imperative'], description: 'Directly manipulates program state using statements and assignments. Common in languages like C, Java, and Python.', cluster: 'CODE' },
  'CODE-OBJ': { label: 'Object-Oriented', icon: '🧩', tags: ['paradigm','oop'], description: 'Organizes code into objects with encapsulated state and behavior. Supports inheritance, polymorphism, and modularity.', cluster: 'CODE' },
  'CODE-CONC': { label: 'Concurrent/Parallel', icon: '🔀', tags: ['paradigm','concurrent'], description: 'Executes multiple computations simultaneously using threads, processes, or distributed systems. Enables scalable and responsive applications.', cluster: 'CODE' },
  'CODE-ACTOR': { label: 'Actor Model', icon: '🎭', tags: ['paradigm','actor'], description: 'Models computation as independent actors communicating via message passing. Used in distributed and concurrent systems.', cluster: 'CODE' },
  'CODE-EVENT': { label: 'Event-Driven', icon: '⚡', tags: ['paradigm','event'], description: 'Responds to events or signals, often using callbacks or listeners. Common in UI, network, and asynchronous programming.', cluster: 'CODE' },
  'CODE-REACT': { label: 'Reactive', icon: '🔁', tags: ['paradigm','reactive'], description: 'Handles asynchronous data streams and propagates changes automatically. Enables responsive and scalable systems.', cluster: 'CODE' },
  'CODE-DATAFLOW': { label: 'Dataflow', icon: '🔗', tags: ['paradigm','dataflow'], description: 'Represents computation as a directed graph of data dependencies. Nodes execute when inputs are available.', cluster: 'CODE' },
  'CODE-PIPE': { label: 'Pipeline/Stream', icon: '🚰', tags: ['paradigm','pipeline'], description: 'Processes data through a sequence of transformations, often in a streaming fashion. Used in ETL and functional programming.', cluster: 'CODE' },
  'CODE-DECL': { label: 'Declarative', icon: '📜', tags: ['paradigm','declarative'], description: 'Specifies what to compute, not how. Includes SQL, HTML, and configuration languages. Focuses on desired outcomes.', cluster: 'CODE' },
  'CODE-FUNC': { label: 'Functional', icon: '🧮', tags: ['paradigm','functional'], description: 'Emphasizes pure functions, immutability, and higher-order functions. Avoids side effects for predictable code.', cluster: 'CODE' },
  'CODE-LOGIC': { label: 'Logic', icon: '🔎', tags: ['paradigm','logic'], description: 'Uses facts and rules to infer conclusions. Common in Prolog and other logic programming languages.', cluster: 'CODE' },
  'CODE-CONSTR': { label: 'Constraint', icon: '🛑', tags: ['paradigm','constraint'], description: 'Solves problems by specifying constraints and letting solvers find solutions. Used in scheduling and optimization.', cluster: 'CODE' },
  'CODE-RULE': { label: 'Rule-Based', icon: '📋', tags: ['paradigm','rule'], description: 'Applies if-then rules to derive new facts or trigger actions. Used in expert systems and production systems.', cluster: 'CODE' },
  'CODE-REL': { label: 'Relational/Query', icon: '🔍', tags: ['paradigm','relational'], description: 'Models data as relations and queries using set operations. Central to SQL and database systems.', cluster: 'CODE' },
  'CODE-PROB': { label: 'Probabilistic', icon: '📊', tags: ['paradigm','probabilistic'], description: 'Represents uncertainty and inference using probability distributions. Used in Bayesian networks and statistical models.', cluster: 'CODE' },
  'CODE-DIFF': { label: 'Differentiable', icon: '🧠', tags: ['paradigm','differentiable'], description: 'Supports automatic differentiation for machine learning and optimization. Enables gradient-based computation.', cluster: 'CODE' },
  'CODE-SYM': { label: 'Symbolic', icon: '🔣', tags: ['paradigm','symbolic'], description: 'Manipulates symbols and expressions for algebraic computation, theorem proving, and symbolic AI.', cluster: 'CODE' },
  'CODE-META': { label: 'Metaprogramming', icon: '🛠️', tags: ['paradigm','meta'], description: 'Programs that generate, transform, or introspect other programs. Enables code reuse and automation.', cluster: 'CODE' },
  'CODE-GEN': { label: 'Generic', icon: '🔧', tags: ['paradigm','generic'], description: 'Defines algorithms and data structures parameterized by types. Promotes code reuse and type safety.', cluster: 'CODE' },
  'CODE-ASPECT': { label: 'Aspect-Oriented', icon: '🎯', tags: ['paradigm','aspect'], description: 'Separates cross-cutting concerns (like logging, security) from core logic using aspects. Improves modularity.', cluster: 'CODE' },
  'CODE-AGENT': { label: 'Agent-Oriented', icon: '🤖', tags: ['paradigm','agent'], description: 'Models autonomous agents with goals and behaviors. Used in AI, robotics, and distributed systems.', cluster: 'CODE' },
  'CODE-ARRAY': { label: 'Array Programming', icon: '🧮', tags: ['paradigm','array'], description: 'Operates on whole arrays or vectors at once for concise and efficient computation. Common in MATLAB, NumPy.', cluster: 'CODE' },
  'CODE-DATA': { label: 'Data-Driven', icon: '📈', tags: ['paradigm','data-driven'], description: 'Focuses on data layout and transformation as primary design. Used in data engineering and analytics.', cluster: 'CODE' },
  'CODE-AUTO': { label: 'Automata-Based', icon: '🔄', tags: ['paradigm','automata'], description: 'Uses explicit state machines to model computation, control flow, or protocols.', cluster: 'CODE' },
  'CODE-ATTR': { label: 'Attribute-Oriented', icon: '🏷️', tags: ['paradigm','attribute'], description: 'Uses compile-time attributes or annotations to steer code generation and behavior.', cluster: 'CODE' },
  'CODE-CONLOG': { label: 'Constraint Logic', icon: '🧩', tags: ['paradigm','constraint-logic'], description: 'Combines logic and constraint solving for expressive problem modeling.', cluster: 'CODE' },
  'CODE-CHOREO': { label: 'Choreographic', icon: '🕺', tags: ['paradigm','choreographic'], description: 'Specifies global interactions compiled to local processes. Used in distributed protocols.', cluster: 'CODE' },
  'CODE-EVSRC': { label: 'Event-Sourcing/CQRS', icon: '📦', tags: ['paradigm','event-sourcing'], description: 'Captures all changes as events and reconstructs state from event history. Used in scalable systems.', cluster: 'CODE' },
  'CODE-VISUAL': { label: 'Visual/Diagrammatic', icon: '🖼️', tags: ['paradigm','visual'], description: 'Composes logic and computation graphically. Used in block-based programming and modeling tools.', cluster: 'CODE' },
  'CODE-LIT': { label: 'Literate Programming', icon: '📚', tags: ['paradigm','literate'], description: 'Intertwines code and documentation for clarity and maintainability. Popularized by Donald Knuth.', cluster: 'CODE' },
  'CODE-DSL': { label: 'DSL-Oriented', icon: '📝', tags: ['paradigm','dsl'], description: 'Uses domain-specific languages tailored for particular tasks or domains. Enables concise and expressive solutions.', cluster: 'CODE' },

  // Coding Language Cluster CODE-LANG-*
  'CODE-C': { label: 'C', icon: '💻', tags: ['language','systems'], description: 'A foundational systems programming language known for speed, portability, and direct memory access. Used in OS, embedded, and performance-critical code.', cluster: 'CODE' },
  'CODE-CPP': { label: 'C++', icon: '💻', tags: ['language','systems'], description: 'An extension of C with object-oriented features, templates, and advanced memory management. Widely used for applications, games, and high-performance systems.', cluster: 'CODE' },
  'CODE-JAVA': { label: 'Java', icon: '☕', tags: ['language','general-purpose'], description: 'A versatile, object-oriented language running on the JVM. Popular for enterprise, mobile, and web applications due to its portability and robustness.', cluster: 'CODE' },
  'CODE-PY': { label: 'Python', icon: '🐍', tags: ['language','general-purpose','data-science'], description: 'A high-level, readable language with dynamic typing. Used for scripting, web, data science, AI, and automation. Extensive libraries and community.', cluster: 'CODE' },
  'CODE-JS': { label: 'JavaScript', icon: '🟨', tags: ['language','web'], description: 'The primary language for web development, enabling interactive UIs and dynamic content. Runs in browsers and on servers (Node.js).', cluster: 'CODE' },
  'CODE-TS': { label: 'TypeScript', icon: '🟦', tags: ['language','web'], description: 'A statically typed superset of JavaScript that improves reliability and maintainability for large-scale web applications.', cluster: 'CODE' },
  'CODE-CS': { label: 'C#', icon: '🎹', tags: ['language','.net'], description: 'A modern, object-oriented language for the .NET ecosystem. Used in desktop, web, cloud, and game development (Unity).', cluster: 'CODE' },
  'CODE-GO': { label: 'Go', icon: '🐹', tags: ['language','systems'], description: 'A statically typed language designed for simplicity, concurrency, and scalability. Used in cloud, networking, and infrastructure projects.', cluster: 'CODE' },
  'CODE-RUST': { label: 'Rust', icon: '🦀', tags: ['language','systems'], description: 'A safe, fast systems language with modern features and memory safety guarantees. Used for performance-critical and concurrent applications.', cluster: 'CODE' },
  'CODE-SWIFT': { label: 'Swift', icon: '🦅', tags: ['language','mobile'], description: 'Apple’s modern language for iOS, macOS, and server-side development. Emphasizes safety, speed, and expressiveness.', cluster: 'CODE' },
  'CODE-KOTLIN': { label: 'Kotlin', icon: '🤖', tags: ['language','mobile'], description: 'A concise, expressive JVM language. Official for Android development and interoperable with Java.', cluster: 'CODE' },
  'CODE-PHP': { label: 'PHP', icon: '🐘', tags: ['language','web'], description: 'A widely used scripting language for server-side web development. Powers many content management systems and dynamic sites.', cluster: 'CODE' },
  'CODE-RUBY': { label: 'Ruby', icon: '💎', tags: ['language','web'], description: 'A dynamic, object-oriented language known for developer happiness and rapid prototyping. Popular for web apps (Rails).', cluster: 'CODE' },
  'CODE-R': { label: 'R', icon: '📊', tags: ['language','data-science'], description: 'A language and environment for statistical computing and graphics. Used in data analysis, visualization, and research.', cluster: 'CODE' },
  'CODE-JULIA': { label: 'Julia', icon: '🔬', tags: ['language','data-science'], description: 'A high-performance language for technical computing, combining ease of use with speed. Used in scientific and numerical analysis.', cluster: 'CODE' },
  'CODE-MATLAB': { label: 'MATLAB', icon: '📈', tags: ['language','data-science'], description: 'A proprietary language and environment for numerical computation, visualization, and simulation. Used in engineering and research.', cluster: 'CODE' },
  'CODE-SQL': { label: 'SQL', icon: '🗄️', tags: ['language','database'], description: 'A declarative language for querying and managing relational databases. Central to data storage, analytics, and reporting.', cluster: 'CODE' },
  'CODE-BASH': { label: 'Bash/Shell', icon: '🐚', tags: ['language','scripting'], description: 'A command-line scripting language for Unix/Linux systems. Automates tasks, manages files, and controls system processes.', cluster: 'CODE' },
  // Argumentation Cluster ARG-*
  'ARG-PRM': { label: 'Premise', icon: '🧩', tags: ['support'], description: 'A supporting reason or foundational statement in an argument. Used to justify claims and build logical structure.', cluster: 'ARG' },
  'ARG-CNC': { label: 'Conclusion', icon: '🏁', tags: ['result'], description: 'The drawn inference or final statement in an argument. Represents the outcome of reasoning or workflow.', cluster: 'ARG' },
  'ARG-WRR': { label: 'Warrant', icon: '🔗', tags: ['justification'], description: 'The inferential link connecting premises to conclusions. Provides justification for logical transitions.', cluster: 'ARG' },
  'ARG-BCK': { label: 'Backing', icon: '🛡️', tags: ['foundation'], description: 'Underlying support or foundation for a warrant. Adds robustness and credibility to arguments.', cluster: 'ARG' },
  'ARG-RBT': { label: 'Rebuttal', icon: '⚔️', tags: ['counter'], description: 'An opposing reason or counterargument. Used to challenge claims, test robustness, and explore alternatives.', cluster: 'ARG' },
  'ARG-QLF': { label: 'Qualifier', icon: '📉', tags: ['modality'], description: 'Indicates the degree of certainty or modality of a claim. Useful for nuanced reasoning and probabilistic workflows.', cluster: 'ARG' },

  // Modal & Mental-State Cluster MOD-*
  'MOD-REQ': { label: 'Requirement', icon: '📋', tags: ['must'], description: 'A necessary condition or constraint for workflow success. Used to define essential criteria and guide process design.', cluster: 'MOD' },
  'MOD-OPT': { label: 'Option', icon: '⚙️', tags: ['may'], description: 'A permissible alternative or choice within a workflow. Enables flexibility and branching in process logic.', cluster: 'MOD' },
  'MOD-PRF': { label: 'Preference', icon: '💎', tags: ['better'], description: 'A desirable alternative or prioritized choice. Used to optimize workflows and express user or system priorities.', cluster: 'MOD' },
  'MOD-OBJ': { label: 'Objective', icon: '🎯', tags: ['goal'], description: 'A desired outcome or goal for the workflow. Central to planning, evaluation, and success measurement.', cluster: 'MOD' },
  'CODE-LUA': { label: 'Lua', icon: '🌙', tags: ['language','scripting'], description: 'A lightweight, embeddable scripting language. Used in games, embedded systems, and extensible applications.', cluster: 'CODE' },
  'CODE-SOL': { label: 'Solidity', icon: '🪙', tags: ['language','blockchain'], description: 'A contract-oriented language for Ethereum and blockchain smart contracts. Enables decentralized applications and protocols.', cluster: 'CODE' },
  'CODE-HASKELL': { label: 'Haskell', icon: 'λ', tags: ['language','functional'], description: 'A pure functional language emphasizing immutability and type safety. Used in research, finance, and robust software.', cluster: 'CODE' },
  'CODE-ERLANG': { label: 'Erlang', icon: '🦉', tags: ['language','functional'], description: 'A functional language designed for concurrent, distributed, and fault-tolerant systems. Used in telecom and messaging.', cluster: 'CODE' },
  'CODE-ELIXIR': { label: 'Elixir', icon: '💧', tags: ['language','functional'], description: 'A dynamic, functional language built on the Erlang VM. Used for scalable, maintainable web and distributed systems.', cluster: 'CODE' },
  'CODE-OCAML': { label: 'OCaml', icon: '🐫', tags: ['language','functional'], description: 'A functional and object-oriented language with strong type inference. Used in finance, research, and compilers.', cluster: 'CODE' },
  'CODE-FSHARP': { label: 'F#', icon: '🎼', tags: ['language','functional'], description: 'A functional-first language for .NET. Combines functional, object-oriented, and imperative styles.', cluster: 'CODE' },
  'CODE-LISP': { label: 'Lisp', icon: '🧠', tags: ['language','functional','meta'], description: 'A family of homoiconic languages for symbolic computation, AI, and metaprogramming. Known for macros and flexibility.', cluster: 'CODE' },
  'CODE-SCALA': { label: 'Scala', icon: '🦑', tags: ['language','jvm'], description: 'A JVM language combining object-oriented and functional programming. Used for big data, web, and scalable systems.', cluster: 'CODE' },
  'CODE-GROOVY': { label: 'Groovy', icon: '🎷', tags: ['language','jvm'], description: 'A dynamic JVM language with concise syntax. Used for scripting, automation, and web development.', cluster: 'CODE' },
  'CODE-CLOJURE': { label: 'Clojure', icon: '🍃', tags: ['language','jvm'], description: 'A modern Lisp for the JVM. Emphasizes immutability, concurrency, and functional programming.', cluster: 'CODE' },
  'CODE-ADA': { label: 'Ada', icon: '🛡️', tags: ['language','systems'], description: 'A strongly typed language for safety-critical and embedded systems. Used in aerospace, defense, and transportation.', cluster: 'CODE' },
  'CODE-FORTRAN': { label: 'Fortran', icon: '📐', tags: ['language','scientific'], description: 'A pioneering language for scientific and engineering computation. Used in HPC, simulations, and legacy code.', cluster: 'CODE' },
  'CODE-COBOL': { label: 'COBOL', icon: '🏦', tags: ['language','legacy'], description: 'A legacy language for business, finance, and administrative systems. Still used in enterprise and government.', cluster: 'CODE' },
  'CODE-ABAP': { label: 'ABAP', icon: '🏢', tags: ['language','enterprise'], description: 'A language for SAP enterprise applications. Used in business process automation and ERP systems.', cluster: 'CODE' },
  'CODE-SAS': { label: 'SAS', icon: '📊', tags: ['language','stats'], description: 'A language and suite for statistical analysis, data management, and business intelligence.', cluster: 'CODE' },
  'CODE-HTML': { label: 'HTML', icon: '🌐', tags: ['language','markup'], description: 'The standard markup language for web pages. Structures content and integrates with CSS and JavaScript.', cluster: 'CODE' },
  'CODE-CSS': { label: 'CSS', icon: '🎨', tags: ['language','markup'], description: 'A style sheet language for designing and customizing web page appearance. Works with HTML for UI.', cluster: 'CODE' },
  'CODE-JSON': { label: 'JSON', icon: '🗃️', tags: ['language','config'], description: 'A lightweight data-interchange format. Used for configuration, APIs, and data serialization.', cluster: 'CODE' },
  'CODE-YAML': { label: 'YAML', icon: '📄', tags: ['language','config'], description: 'A human-friendly data serialization format. Used for configuration files and data exchange.', cluster: 'CODE' },
  'CODE-XML': { label: 'XML', icon: '📄', tags: ['language','config'], description: 'A markup language for structured data representation and exchange. Used in documents, APIs, and config.', cluster: 'CODE' },
  // Add more as needed

  // Proposition Cluster PROP-*
  'PROP-STM': { label: 'Statement', icon: '📄', tags: ['atomic'], description: 'A basic, truth-apt sentence representing a fact or assertion. Used as the foundation for logical reasoning and workflow steps.', cluster: 'PROP' },
  'PROP-CLM': { label: 'Claim', icon: '🔔', tags: ['assertive'], description: 'A contestable assertion that can be supported or refuted. Useful for argumentation, debate, and hypothesis formation.', cluster: 'PROP' },
  'PROP-DEF': { label: 'Definition', icon: '📖', tags: ['lexical'], description: 'Provides the meaning or explanation of a term or concept. Essential for clarity and semantic precision in workflows.', cluster: 'PROP' },
  'PROP-OBS': { label: 'Observation', icon: '👁️', tags: ['empirical'], description: 'Records empirical data or sensory measurement. Used to ground reasoning in real-world evidence and support hypotheses.', cluster: 'PROP' },
  'PROP-CNC': { label: 'Concept', icon: '💡', tags: ['abstraction'], description: 'Represents an abstract idea or mental model. Useful for organizing knowledge, categorizing nodes, and semantic mapping.', cluster: 'PROP' },

  // Inquiry Cluster INQ-*
  'INQ-QRY': { label: 'Query', icon: '🔍', tags: ['interrogative'], description: 'Requests specific data or information from other nodes or external sources. Used to drive workflow logic and data retrieval.', cluster: 'INQ' },
  'INQ-QST': { label: 'Question', icon: '❓', tags: ['wh', 'polar'], description: 'Represents an open or closed question, highlighting an information gap. Useful for inquiry, exploration, and hypothesis testing.', cluster: 'INQ' },
  'INQ-PRB': { label: 'Problem', icon: '🎯', tags: ['challenge'], description: 'Defines a challenge or desired-state mismatch to be solved. Central to workflow design, solution finding, and reasoning.', cluster: 'INQ' },

  // Hypothesis/Evidence/Method HEM-*
  'HEM-HYP': { label: 'Hypothesis', icon: '🔮', tags: ['tentative'], description: 'A testable proposition or educated guess. Used to drive scientific reasoning, experimentation, and workflow branching.', cluster: 'HEM' },
  'HEM-EVD': { label: 'Evidence', icon: '📊', tags: ['support'], description: 'Supports or refutes hypotheses and claims. Can be empirical, statistical, or logical. Central to validation and decision-making.', cluster: 'HEM' },
  'HEM-DAT': { label: 'Data', icon: '📈', tags: ['raw'], description: 'Raw, uninterpreted records or measurements. Used as input for analysis, modeling, and evidence generation.', cluster: 'HEM' },
  'HEM-CTX': { label: 'Counterexample', icon: '❌', tags: ['refuter'], description: 'An instance that violates a hypothesis or rule. Used to test robustness, falsifiability, and logical soundness.', cluster: 'HEM' },
  'HEM-MTH': { label: 'Method', icon: '🔬', tags: ['procedure'], description: 'A high-level approach or strategy for investigation. Guides workflow structure, analysis, and problem solving.', cluster: 'HEM' },
  'HEM-PRC': { label: 'Procedure', icon: '📋', tags: ['stepwise'], description: 'An ordered sequence of steps or actions. Used to formalize processes, ensure repeatability, and automate workflows.', cluster: 'HEM' },
  'HEM-ALG': { label: 'Algorithm', icon: '🤖', tags: ['computable'], description: 'A finite, deterministic routine for solving problems or processing data. Central to automation, computation, and logic.', cluster: 'HEM' },
  'HEM-PRT': { label: 'Protocol', icon: '📜', tags: ['standard'], description: 'A formalized procedure or set of rules for interaction. Used in communication, distributed systems, and workflow coordination.', cluster: 'HEM' },

  // Reasoning Cluster RSN-*
  'RSN-DED': { label: 'Deduction', icon: '➡️', tags: ['validity'], description: 'Draws necessary conclusions from given premises using formal logic. Ensures validity and soundness in reasoning.', cluster: 'RSN' },
  'RSN-IND': { label: 'Induction', icon: '🔄', tags: ['generalise'], description: 'Extrapolates patterns from specific instances to general rules. Used for learning, prediction, and hypothesis formation.', cluster: 'RSN' },
  'RSN-ABD': { label: 'Abduction', icon: '🕵️', tags: ['explain'], description: 'Generates best-fit hypotheses to explain observations. Central to diagnostic reasoning and creative problem solving.', cluster: 'RSN' },
  'RSN-ANL': { label: 'Analogy', icon: '🔗', tags: ['similarity'], description: 'Maps similarities from a source to a target domain to infer new knowledge. Useful for transfer learning and conceptual blending.', cluster: 'RSN' },
  'RSN-IRL': { label: 'InferenceRule', icon: '📐', tags: ['schema'], description: 'Defines formal patterns for deriving conclusions. Used to automate reasoning and ensure logical consistency.', cluster: 'RSN' },

  // Evaluation Gates EVL-*
  'EVL-VER': { label: 'Verification', icon: '✅', tags: ['internal'], description: 'Checks if a workflow or result meets its specification or logical requirements. Used for internal quality control.', cluster: 'EVL' },
  'EVL-VAL': { label: 'Validation', icon: '🎯', tags: ['external'], description: 'Ensures that a workflow or result meets real-world needs or external criteria. Used for user acceptance and deployment.', cluster: 'EVL' },
  'EVL-FAL': { label: 'FalsifiabilityGate', icon: '🚫', tags: ['Popper'], description: 'Rejects claims or hypotheses if counterevidence is found. Central to scientific rigor and robust workflows.', cluster: 'EVL' },
  'EVL-CON': { label: 'ConsistencyCheck', icon: '⚖️', tags: ['coherence'], description: 'Scans for contradictions or incoherence in logic or data. Ensures semantic integrity and reliability.', cluster: 'EVL' },

  // Modal & Mental-State Tags MOD-*
  'MOD-NEC': { label: 'Necessity', icon: '🔒', tags: ['◻'], description: 'Indicates that a statement or condition is true in all possible worlds. Used for strict constraints and logical requirements.', cluster: 'MOD' },
  'MOD-POS': { label: 'Possibility', icon: '🔓', tags: ['◇'], description: 'Indicates that a statement or condition is true in at least one possible world. Enables flexible and exploratory workflows.', cluster: 'MOD' },
  'MOD-OBL': { label: 'Obligation', icon: '⚖️', tags: ['deontic'], description: 'Represents a duty-bound requirement or action. Used for compliance, ethics, and workflow constraints.', cluster: 'MOD' },
  'MOD-PER': { label: 'Permission', icon: '✅', tags: ['deontic'], description: 'Indicates that an action or condition is allowed. Used for access control and workflow flexibility.', cluster: 'MOD' },
  'MOD-TMP': { label: 'TemporalTag', icon: '⏰', tags: ['time'], description: 'Marks the temporal context (past, present, future) of a node or workflow. Enables time-based logic and scheduling.', cluster: 'MOD' },
  'MOD-EPI': { label: 'EpistemicTag', icon: '🧠', tags: ['knowledge'], description: 'Represents the level of certainty or knowledge about a statement. Used for reasoning under uncertainty.', cluster: 'MOD' },
  'MOD-BEL': { label: 'Belief', icon: '💭', tags: ['mental'], description: 'Indicates that an agent accepts a proposition as true. Used for modeling mental states and context.', cluster: 'MOD' },
  'MOD-DES': { label: 'Desire', icon: '💖', tags: ['mental'], description: 'Captures what an agent wants or prefers. Influences workflow objectives and prioritization.', cluster: 'MOD' },
  'MOD-INT': { label: 'Intent', icon: '🎯', tags: ['mental'], description: 'Represents an agent’s plan or commitment to act. Drives workflow execution and agent behavior.', cluster: 'MOD' },

  // Speech-Act Markers SPA-*
  'SPA-AST': { label: 'Assertion', icon: '💬', tags: ['constative'], description: 'Claims the truth of a statement or fact. Used to establish knowledge and drive workflow logic.', cluster: 'SPA' },
  'SPA-REQ': { label: 'Request', icon: '🙏', tags: ['directive'], description: 'Asks for an action or information from another agent or node. Used for workflow coordination and interactivity.', cluster: 'SPA' },
  'SPA-CMD': { label: 'Command', icon: '📢', tags: ['imperative'], description: 'Orders an action to be performed. Used for direct control and automation in workflows.', cluster: 'SPA' },
  'SPA-ADV': { label: 'Advice', icon: '💡', tags: ['directive'], description: 'Recommends a course of action or solution. Used for guidance, optimization, and collaborative workflows.', cluster: 'SPA' },
  'SPA-WRN': { label: 'Warning', icon: '⚠️', tags: ['directive'], description: 'Alerts to potential hazards or issues. Used for error prevention and risk management.', cluster: 'SPA' },
  'SPA-PRM': { label: 'Promise', icon: '🤝', tags: ['commissive'], description: 'Commits to a future action or outcome. Used for planning, coordination, and trust-building.', cluster: 'SPA' },
  'SPA-APO': { label: 'Apology', icon: '😔', tags: ['expressive'], description: 'Expresses regret or responsibility for an action. Used for error handling and relationship management.', cluster: 'SPA' },

  // Control & Meta Engines CTL-*
  'CTL-BRN': { label: 'Branch', icon: '🔀', tags: ['if'], description: 'Creates a conditional fork in the workflow based on logic or data. Enables parallelism and decision-making.', cluster: 'CTL' },
  'CTL-CND': { label: 'Condition', icon: '❓', tags: ['guard'], description: 'Applies a boolean filter to control workflow execution. Used for gating, validation, and error prevention.', cluster: 'CTL' },
  'CTL-LOP': { label: 'Loop', icon: '🔄', tags: ['iterate'], description: 'Repeats workflow steps until a condition is met. Used for iteration, automation, and process control.', cluster: 'CTL' },
  'CTL-HLT': { label: 'Halt', icon: '🛑', tags: ['terminal'], description: 'Stops workflow execution at a terminal point. Used for error handling, completion, or interruption.', cluster: 'CTL' },
  'CTL-ABD': { label: 'AbductionEngine', icon: '🧬', tags: ['generator'], description: 'Automatically generates hypotheses or solutions. Used for creative reasoning and workflow expansion.', cluster: 'CTL' },
  'CTL-HSL': { label: 'HeuristicSelector', icon: '🧭', tags: ['search'], description: 'Selects the best rule or option based on heuristics. Used for optimization and adaptive workflows.', cluster: 'CTL' },
  'CTL-CRS': { label: 'ConflictResolver', icon: '🤝', tags: ['merge'], description: 'Resolves contradictions or conflicts in logic or data. Ensures workflow consistency and reliability.', cluster: 'CTL' },
  'CTL-PDX': { label: 'ParadoxDetector', icon: '🌀', tags: ['selfref'], description: 'Flags paradoxes or self-referential loops. Used for error detection and logical soundness.', cluster: 'CTL' },

  // Error/Exception ERR-*
  'ERR-CON': { label: 'Contradiction', icon: '⚠️', tags: ['⊥'], description: 'Represents a logical inconsistency (p ∧ ¬p). Used for error detection, debugging, and workflow correction.', cluster: 'ERR' },
  'ERR-FAL': { label: 'Fallacy', icon: '❌', tags: ['invalid'], description: 'Identifies faulty reasoning or invalid logic. Used for quality control, education, and workflow improvement.', cluster: 'ERR' },
  'ERR-EXC': { label: 'Exception', icon: '💥', tags: ['runtime'], description: 'Indicates engine failure or runtime error. Used for error handling, recovery, and robustness.', cluster: 'ERR' },

  // Discourse Meta DSC-*
  'DSC-ANN': { label: 'Annotation', icon: '📝', tags: ['meta'], description: 'Adds a side note or comment to a node or workflow. Used for documentation, clarification, and collaboration.', cluster: 'DSC' },
  'DSC-REV': { label: 'Revision', icon: '✏️', tags: ['edit'], description: 'Modifies or updates prior content. Used for version control, improvement, and workflow evolution.', cluster: 'DSC' },
  'DSC-SUM': { label: 'Summarization', icon: '📄', tags: ['abbrev'], description: 'Condenses content into a shorter form. Used for abstraction, reporting, and workflow optimization.', cluster: 'DSC' },
  'DSC-CIT': { label: 'Citation', icon: '📚', tags: ['source'], description: 'References external sources or documents. Used for validation, attribution, and semantic integration.', cluster: 'DSC' },
  'DSC-CAV': { label: 'Caveat', icon: '⚠️', tags: ['limitation'], description: 'Adds a scope warning or limitation note. Used for risk management, clarity, and workflow safety.', cluster: 'DSC' },

  // Creative Operations CRT-*
  'CRT-INS': { label: 'Insight', icon: '💡', tags: ['aha'], description: 'Represents a sudden re-framing or new perspective. Used for creative breakthroughs and workflow innovation.', cluster: 'CRT' },
  'CRT-DIV': { label: 'DivergentThought', icon: '🎨', tags: ['brainstorm'], description: 'Expands ideas through brainstorming and exploration. Used for creativity, problem solving, and workflow design.', cluster: 'CRT' },
  'CRT-COM': { label: 'ConceptCombination', icon: '🔗', tags: ['blend'], description: 'Merges disparate concepts to create new ideas. Used for synthesis, innovation, and semantic integration.', cluster: 'CRT' },

  // Mathematical Reasoning MTH-*
  'MTH-PRF': { label: 'ProofStrategy', icon: '📐', tags: ['meta-proof'], description: 'Defines a method or approach to derive a theorem. Used for rigorous reasoning and workflow validation.', cluster: 'MTH' },
  'MTH-CON': { label: 'Conjecture', icon: '🤔', tags: ['open'], description: 'Represents an unproven proposition or hypothesis. Used for exploration, research, and workflow expansion.', cluster: 'MTH' },
  'MTH-UND': { label: 'UndecidableTag', icon: '❓', tags: ['Gödel'], description: 'Indicates that the truth value of a statement is unresolvable. Used for advanced logic, risk management, and workflow safety.', cluster: 'MTH' },

  // Cognitive Mechanics COG-*
  'COG-CHN': { label: 'Chunk', icon: '🧩', tags: ['memory'], description: 'Represents a unitized piece of information for efficient memory and processing. Used for cognitive modeling and workflow optimization.', cluster: 'COG' },
  'COG-SCH': { label: 'Schema', icon: '🗂️', tags: ['frame'], description: 'Organizes prior knowledge into structured frameworks. Used for semantic mapping, learning, and workflow design.', cluster: 'COG' },
  'COG-CLD': { label: 'CognitiveLoad', icon: '⚖️', tags: ['resource'], description: 'Working-memory usage', cluster: 'COG' },
  'COG-PRM': { label: 'Priming', icon: '🎯', tags: ['bias'], description: 'Prior activation', cluster: 'COG' },
  'COG-INH': { label: 'Inhibition', icon: '🚫', tags: ['suppress'], description: 'Filter interference', cluster: 'COG' },
  'COG-THG': { label: 'ThresholdGate', icon: '🚪', tags: ['attention'], description: 'Fire only if salience≥δ', cluster: 'COG' },
  'COG-FLU': { label: 'FluidIntelligence', icon: '🌊', tags: ['gf'], description: 'Novel problem solving', cluster: 'COG' },
  'COG-CRY': { label: 'CrystallizedProxy', icon: '💎', tags: ['gc'], description: 'Stored knowledge metric', cluster: 'COG' },

  // Mind Constructs MND-*
  'MND-PHF': { label: 'PhenomenalField', icon: '🌟', tags: ['qualia'], description: 'First-person content', cluster: 'MND' },
  'MND-ACC': { label: 'AccessConsciousness', icon: '🔓', tags: ['reportable'], description: 'Info globally available', cluster: 'MND' },
  'MND-ZOM': { label: 'ZombieArgument', icon: '🧟', tags: ['philosophy'], description: 'Absence of qualia test', cluster: 'MND' },
  'MND-SUP': { label: 'SupervenienceTag', icon: '🔼', tags: ['dependence'], description: 'Higher-level on base', cluster: 'MND' },
  'MND-EXT': { label: 'ExtendedMind', icon: '🌐', tags: ['4E'], description: 'Mind beyond skull', cluster: 'MND' },
  'MND-EMB': { label: 'EmbeddedProcess', icon: '🏠', tags: ['situated'], description: 'Cognition in env', cluster: 'MND' },

  // Non-Classical Logic NCL-*
  'NCL-REL': { label: 'RelevanceMarker', icon: '🔗', tags: ['R-logic'], description: 'Enforce premise relevance', cluster: 'NCL' },
  'NCL-LIN': { label: 'LinearResource', icon: '🔄', tags: ['⊗'], description: 'Consume-once proposition', cluster: 'NCL' },
  'NCL-MNV': { label: 'ManyValued', icon: '🎚️', tags: ['Łukasiewicz'], description: '>2 truth degrees', cluster: 'NCL' },
  'NCL-QNT': { label: 'QuantumLogic', icon: '⚛️', tags: ['orthomodular'], description: 'Non-distributive lattice', cluster: 'NCL' },
  'NCL-REV': { label: 'BeliefRevision', icon: '🔄', tags: ['AGM'], description: 'Update (K, φ)→K*', cluster: 'NCL' },
  'NCL-AGM': { label: 'AGM-Operator', icon: '🔧', tags: ['∘'], description: 'Contraction/revision func', cluster: 'NCL' },

  // Dynamic Semantics DYN-*
  'DYN-UPD': { label: 'UpdateProcedure', icon: '🔄', tags: ['context'], description: 'Modify discourse state', cluster: 'DYN' },
  'DYN-CSH': { label: 'ContextShift', icon: '🔀', tags: ['indexical'], description: 'Change evaluation world', cluster: 'DYN' },
  'DYN-REF': { label: 'DiscourseReferent', icon: '🔗', tags: ['DRT'], description: 'Entity slot', cluster: 'DYN' },
  'DYN-ANA': { label: 'AnaphoraTag', icon: '↩️', tags: ['coref'], description: 'Pronoun link', cluster: 'DYN' },
  'DYN-CGD': { label: 'CommonGround', icon: '🤝', tags: ['shared'], description: 'Mutual belief store', cluster: 'DYN' },
  'DYN-PRS': { label: 'Presupposition', icon: '📋', tags: ['presup'], description: 'Background truth', cluster: 'DYN' }
};

// Color scheme for different clusters
export const CLUSTER_COLORS = {
  PROP: '#3B82F6', // Blue - Propositions
  INQ: '#8B5CF6',  // Purple - Inquiry
  HEM: '#10B981',  // Green - Hypothesis/Evidence/Method
  RSN: '#F59E0B',  // Orange - Reasoning
  EVL: '#EF4444',  // Red - Evaluation Gates
  MOD: '#6366F1',  // Indigo - Modal & Mental-State
  SPA: '#EC4899',  // Pink - Speech-Act Markers
  DSC: '#84CC16',  // Lime - Discourse Meta
  CTL: '#06B6D4',  // Cyan - Control & Meta Engines
  ERR: '#DC2626',  // Dark Red - Error/Exception
  CRT: '#F97316',  // Orange - Creative Operations
  MTH: '#7C3AED',  // Violet - Mathematical Reasoning
  COG: '#059669',  // Emerald - Cognitive Mechanics
  MND: '#DB2777',  // Dark Pink - Mind Constructs
  NCL: '#0891B2',  // Sky - Non-Classical Logic
  DYN: '#65A30D',  // Dark Lime - Dynamic Semantics
  UTIL: '#64748B', // Slate - Utility nodes
  CRY: '#0EA5E9'   // Light blue - Crypto/Web3
};

// Get nodes by cluster for palette organization
export const getNodesByCluster = (clusterCode) => {
  return Object.entries(NODE_TYPES)
    .filter(([_, nodeType]) => nodeType.cluster === clusterCode)
    .map(([code, nodeType]) => ({ code, ...nodeType }));
};

// Get all clusters with their node counts
export const getClusterSummary = () => {
  return Object.entries(ONTOLOGY_CLUSTERS).map(([code, clusterData]) => ({
    code,
    name: clusterData.name,
    color: CLUSTER_COLORS[code],
    nodeCount: getNodesByCluster(code).length
  }));
};
