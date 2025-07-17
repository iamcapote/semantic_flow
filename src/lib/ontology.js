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
  DYN: { name: 'Dynamic Semantics', icon: '⚡', description: 'Dynamic meaning' }
};

export const NODE_TYPES = {
  // Proposition Cluster PROP-*
  'PROP-STM': { label: 'Statement', icon: '📄', tags: ['atomic'], description: 'Truth-apt sentence', cluster: 'PROP' },
  'PROP-CLM': { label: 'Claim', icon: '🔔', tags: ['assertive'], description: 'Contestable statement', cluster: 'PROP' },
  'PROP-DEF': { label: 'Definition', icon: '📖', tags: ['lexical'], description: 'Term explication', cluster: 'PROP' },
  'PROP-OBS': { label: 'Observation', icon: '👁️', tags: ['empirical'], description: 'Sense/measurement report', cluster: 'PROP' },
  'PROP-CNC': { label: 'Concept', icon: '💡', tags: ['abstraction'], description: 'Mental representation', cluster: 'PROP' },

  // Inquiry Cluster INQ-*
  'INQ-QRY': { label: 'Query', icon: '🔍', tags: ['interrogative'], description: 'Data request', cluster: 'INQ' },
  'INQ-QST': { label: 'Question', icon: '❓', tags: ['wh', 'polar'], description: 'Information gap', cluster: 'INQ' },
  'INQ-PRB': { label: 'Problem', icon: '🎯', tags: ['challenge'], description: 'Desired-state mismatch', cluster: 'INQ' },

  // Hypothesis/Evidence/Method HEM-*
  'HEM-HYP': { label: 'Hypothesis', icon: '🔮', tags: ['tentative'], description: 'Testable proposition', cluster: 'HEM' },
  'HEM-EVD': { label: 'Evidence', icon: '📊', tags: ['support'], description: 'Observation backing/undermining', cluster: 'HEM' },
  'HEM-DAT': { label: 'Data', icon: '📈', tags: ['raw'], description: 'Uninterpreted record', cluster: 'HEM' },
  'HEM-CTX': { label: 'Counterexample', icon: '❌', tags: ['refuter'], description: 'Instance violating hypothesis', cluster: 'HEM' },
  'HEM-MTH': { label: 'Method', icon: '🔬', tags: ['procedure'], description: 'High-level approach', cluster: 'HEM' },
  'HEM-PRC': { label: 'Procedure', icon: '📋', tags: ['stepwise'], description: 'Ordered steps', cluster: 'HEM' },
  'HEM-ALG': { label: 'Algorithm', icon: '🤖', tags: ['computable'], description: 'Finite deterministic routine', cluster: 'HEM' },
  'HEM-PRT': { label: 'Protocol', icon: '📜', tags: ['standard'], description: 'Formalised procedure', cluster: 'HEM' },

  // Reasoning Cluster RSN-*
  'RSN-DED': { label: 'Deduction', icon: '➡️', tags: ['validity'], description: 'Necessitation from premises', cluster: 'RSN' },
  'RSN-IND': { label: 'Induction', icon: '🔄', tags: ['generalise'], description: 'Pattern extrapolation', cluster: 'RSN' },
  'RSN-ABD': { label: 'Abduction', icon: '🕵️', tags: ['explain'], description: 'Best-fit hypothesis generation', cluster: 'RSN' },
  'RSN-ANL': { label: 'Analogy', icon: '🔗', tags: ['similarity'], description: 'Mapping source→target infer', cluster: 'RSN' },
  'RSN-IRL': { label: 'InferenceRule', icon: '📐', tags: ['schema'], description: 'Formal derivation pattern', cluster: 'RSN' },

  // Evaluation Gates EVL-*
  'EVL-VER': { label: 'Verification', icon: '✅', tags: ['internal'], description: 'Meets spec/logic', cluster: 'EVL' },
  'EVL-VAL': { label: 'Validation', icon: '🎯', tags: ['external'], description: 'Meets real-world need', cluster: 'EVL' },
  'EVL-FAL': { label: 'FalsifiabilityGate', icon: '🚫', tags: ['Popper'], description: 'Reject if counterevidence', cluster: 'EVL' },
  'EVL-CON': { label: 'ConsistencyCheck', icon: '⚖️', tags: ['coherence'], description: 'Non-contradiction scan', cluster: 'EVL' },

  // Modal & Mental-State Tags MOD-*
  'MOD-NEC': { label: 'Necessity', icon: '🔒', tags: ['◻'], description: 'True in all worlds', cluster: 'MOD' },
  'MOD-POS': { label: 'Possibility', icon: '🔓', tags: ['◇'], description: 'True in some world', cluster: 'MOD' },
  'MOD-OBL': { label: 'Obligation', icon: '⚖️', tags: ['deontic'], description: 'Duty-bound', cluster: 'MOD' },
  'MOD-PER': { label: 'Permission', icon: '✅', tags: ['deontic'], description: 'Allowed', cluster: 'MOD' },
  'MOD-TMP': { label: 'TemporalTag', icon: '⏰', tags: ['time'], description: 'Past/Present/Future', cluster: 'MOD' },
  'MOD-EPI': { label: 'EpistemicTag', icon: '🧠', tags: ['knowledge'], description: 'Certainty level', cluster: 'MOD' },
  'MOD-BEL': { label: 'Belief', icon: '💭', tags: ['mental'], description: 'Agent accepts p', cluster: 'MOD' },
  'MOD-DES': { label: 'Desire', icon: '💖', tags: ['mental'], description: 'Agent wants p', cluster: 'MOD' },
  'MOD-INT': { label: 'Intent', icon: '🎯', tags: ['mental'], description: 'Agent plans p', cluster: 'MOD' },

  // Speech-Act Markers SPA-*
  'SPA-AST': { label: 'Assertion', icon: '💬', tags: ['constative'], description: 'Claim truth', cluster: 'SPA' },
  'SPA-REQ': { label: 'Request', icon: '🙏', tags: ['directive'], description: 'Ask action/info', cluster: 'SPA' },
  'SPA-CMD': { label: 'Command', icon: '📢', tags: ['imperative'], description: 'Order action', cluster: 'SPA' },
  'SPA-ADV': { label: 'Advice', icon: '💡', tags: ['directive'], description: 'Recommend', cluster: 'SPA' },
  'SPA-WRN': { label: 'Warning', icon: '⚠️', tags: ['directive'], description: 'Alert hazard', cluster: 'SPA' },
  'SPA-PRM': { label: 'Promise', icon: '🤝', tags: ['commissive'], description: 'Commit future act', cluster: 'SPA' },
  'SPA-APO': { label: 'Apology', icon: '😔', tags: ['expressive'], description: 'Express regret', cluster: 'SPA' },

  // Control & Meta Engines CTL-*
  'CTL-BRN': { label: 'Branch', icon: '🔀', tags: ['if'], description: 'Conditional fork', cluster: 'CTL' },
  'CTL-CND': { label: 'Condition', icon: '❓', tags: ['guard'], description: 'Boolean filter', cluster: 'CTL' },
  'CTL-LOP': { label: 'Loop', icon: '🔄', tags: ['iterate'], description: 'Repeat until', cluster: 'CTL' },
  'CTL-HLT': { label: 'Halt', icon: '🛑', tags: ['terminal'], description: 'Stop execution', cluster: 'CTL' },
  'CTL-ABD': { label: 'AbductionEngine', icon: '🧬', tags: ['generator'], description: 'Auto-create hypotheses', cluster: 'CTL' },
  'CTL-HSL': { label: 'HeuristicSelector', icon: '🧭', tags: ['search'], description: 'Pick best rule', cluster: 'CTL' },
  'CTL-CRS': { label: 'ConflictResolver', icon: '🤝', tags: ['merge'], description: 'Resolve contradictions', cluster: 'CTL' },
  'CTL-PDX': { label: 'ParadoxDetector', icon: '🌀', tags: ['selfref'], description: 'Flag liar/loop', cluster: 'CTL' },

  // Error/Exception ERR-*
  'ERR-CON': { label: 'Contradiction', icon: '⚠️', tags: ['⊥'], description: 'p ∧ ¬p', cluster: 'ERR' },
  'ERR-FAL': { label: 'Fallacy', icon: '❌', tags: ['invalid'], description: 'Faulty reasoning type', cluster: 'ERR' },
  'ERR-EXC': { label: 'Exception', icon: '💥', tags: ['runtime'], description: 'Engine failure', cluster: 'ERR' },

  // Discourse Meta DSC-*
  'DSC-ANN': { label: 'Annotation', icon: '📝', tags: ['meta'], description: 'Side note', cluster: 'DSC' },
  'DSC-REV': { label: 'Revision', icon: '✏️', tags: ['edit'], description: 'Modify prior', cluster: 'DSC' },
  'DSC-SUM': { label: 'Summarization', icon: '📄', tags: ['abbrev'], description: 'Condense content', cluster: 'DSC' },
  'DSC-CIT': { label: 'Citation', icon: '📚', tags: ['source'], description: 'External ref', cluster: 'DSC' },
  'DSC-CAV': { label: 'Caveat', icon: '⚠️', tags: ['limitation'], description: 'Scope warning', cluster: 'DSC' },

  // Creative Operations CRT-*
  'CRT-INS': { label: 'Insight', icon: '💡', tags: ['aha'], description: 'Sudden re-framing', cluster: 'CRT' },
  'CRT-DIV': { label: 'DivergentThought', icon: '🎨', tags: ['brainstorm'], description: 'Idea expansion', cluster: 'CRT' },
  'CRT-COM': { label: 'ConceptCombination', icon: '🔗', tags: ['blend'], description: 'Merge disparate concepts', cluster: 'CRT' },

  // Mathematical Reasoning MTH-*
  'MTH-PRF': { label: 'ProofStrategy', icon: '📐', tags: ['meta-proof'], description: 'Method to derive theorem', cluster: 'MTH' },
  'MTH-CON': { label: 'Conjecture', icon: '🤔', tags: ['open'], description: 'Unproven proposition', cluster: 'MTH' },
  'MTH-UND': { label: 'UndecidableTag', icon: '❓', tags: ['Gödel'], description: 'Truth value unresolvable', cluster: 'MTH' },

  // Cognitive Mechanics COG-*
  'COG-CHN': { label: 'Chunk', icon: '🧩', tags: ['memory'], description: 'Unitised info', cluster: 'COG' },
  'COG-SCH': { label: 'Schema', icon: '🗂️', tags: ['frame'], description: 'Organised prior knowledge', cluster: 'COG' },
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
  DYN: '#65A30D'   // Dark Lime - Dynamic Semantics
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
