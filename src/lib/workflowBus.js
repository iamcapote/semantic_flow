// Lightweight window event bus for workflow sync across pages/components
// Usage:
//   emitWorkflowUpdate('IDE', workflow)
//   const unsubscribe = subscribeWorkflowUpdates((source, wf) => { ... })

export function emitWorkflowUpdate(source, workflow) {
  try {
    window.dispatchEvent(
      new CustomEvent('workflow:updated', { detail: { source, workflow } })
    );
  } catch {
    // no-op in non-browser contexts
  }
}

export function subscribeWorkflowUpdates(handler) {
  const fn = (e) => {
    try {
      const { source, workflow } = e.detail || {};
      if (!workflow) return;
      handler(source, workflow);
    } catch {
      /* no-op */
    }
  };
  window.addEventListener('workflow:updated', fn);
  return () => window.removeEventListener('workflow:updated', fn);
}

// Node selection bus to sync selection across Builder/IDE/etc
// Usage:
//   emitNodeSelected('Builder', nodeId)
//   const unsub = subscribeNodeSelection((source, nodeId) => { ... })
export function emitNodeSelected(source, nodeId) {
  try {
    window.dispatchEvent(
      new CustomEvent('workflow:nodeSelected', { detail: { source, nodeId } })
    );
  } catch {
    // no-op in non-browser contexts
  }
}

export function subscribeNodeSelection(handler) {
  const fn = (e) => {
    try {
      const { source, nodeId } = e.detail || {};
      // nodeId may be null if selection cleared
      handler(source, nodeId);
    } catch {
      /* no-op */
    }
  };
  window.addEventListener('workflow:nodeSelected', fn);
  return () => window.removeEventListener('workflow:nodeSelected', fn);
}
