const MAX_STEPS = 100;

const sameKeys = (a, b, isSame) =>
  [...new Set([...Object.keys(a), ...Object.keys(b)])].every((key) => isSame(a[key], b[key]));

/**
 * Undo history of the diagram, for both the standalone and embedded stores. A step is the
 * `{ yaml, positions, collapse }` before a user action, kept out of the state so it is not persisted.
 */
export function createDiagramHistorySlice(set, get) {
  let past = [];
  let future = [];
  let yamlOnLeaving = null;

  const reset = () => {
    past = [];
    future = [];
  };

  const takeStep = (from, to, current) => {
    while (from.length > 0) {
      const step = from.pop();
      const changedNothing = step.yaml === current.yaml
        && sameKeys(step.positions, current.positions, (a, b) => a?.x === b?.x && a?.y === b?.y)
        && sameKeys(step.collapse, current.collapse, (a, b) => (a || 'full') === (b || 'full'));
      if (changedNothing) continue;
      to.push(current);
      return step;
    }
    return null;
  };

  return {
    recordDiagramStep: (before) => {
      past = [...past, before].slice(-MAX_STEPS);
      future = [];
    },
    undoDiagramStep: (current) => takeStep(past, future, current),
    redoDiagramStep: (current) => takeStep(future, past, current),
    pauseDiagramHistory: () => {
      yamlOnLeaving = get().yaml;
    },
    resumeDiagramHistory: () => {
      if (get().yaml !== yamlOnLeaving) reset();
    },
    resetDiagramHistory: reset,
  };
}
