// The right pane (preview, validation or test results) shown next to the form and YAML views.
// The diagram needs the whole width, so entering it hides the pane and leaving it brings back
// the one that was open before.
const RIGHT_PANES = {
  preview: 'isPreviewVisible',
  warnings: 'isWarningsVisible',
  testResults: 'isTestResultsVisible',
};

const openRightPane = (state) =>
  Object.keys(RIGHT_PANES).find((pane) => state[RIGHT_PANES[pane]]) || null;

/**
 * The state change for switching from the current view to `view`.
 * @param {Object} state - The current store state
 * @param {string} view - 'form', 'yaml' or 'diagram'
 * @returns {Object} A partial state to merge into the store
 */
export function viewSwitch(state, view) {
  const leavingDiagram = state.currentView === 'diagram' && view !== 'diagram';
  const enteringDiagram = state.currentView !== 'diagram' && view === 'diagram';

  if (enteringDiagram) {
    return {
      currentView: view,
      rightPaneBeforeDiagram: openRightPane(state),
      isPreviewVisible: false,
      isWarningsVisible: false,
      isTestResultsVisible: false,
    };
  }

  if (leavingDiagram) {
    const restored = state.rightPaneBeforeDiagram;
    // A pane opened while in the diagram wins over the one remembered from before it.
    const restore = restored && RIGHT_PANES[restored] && !openRightPane(state);
    return {
      currentView: view,
      rightPaneBeforeDiagram: null,
      ...(restore ? { [RIGHT_PANES[restored]]: true } : {}),
    };
  }

  return { currentView: view };
}
