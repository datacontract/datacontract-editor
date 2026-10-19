import { describe, it, expect } from 'vitest';
import { viewSwitch } from './viewSwitch.js';

const panes = { isPreviewVisible: false, isWarningsVisible: false, isTestResultsVisible: false };

// Applies a sequence of view switches the way the store does.
function switchThrough(state, ...views) {
  return views.reduce((current, view) => ({ ...current, ...viewSwitch(current, view) }), state);
}

describe('viewSwitch', () => {
  it('hides the preview when entering the diagram', () => {
    const state = switchThrough({ ...panes, currentView: 'form', isPreviewVisible: true }, 'diagram');
    expect(state).toMatchObject({ ...panes, currentView: 'diagram' });
  });

  it('restores the preview when switching back to the form', () => {
    const state = switchThrough({ ...panes, currentView: 'form', isPreviewVisible: true }, 'diagram', 'form');
    expect(state).toMatchObject({ ...panes, currentView: 'form', isPreviewVisible: true });
  });

  it('restores the validation when switching back to yaml', () => {
    const state = switchThrough({ ...panes, currentView: 'yaml', isWarningsVisible: true }, 'diagram', 'yaml');
    expect(state).toMatchObject({ ...panes, currentView: 'yaml', isWarningsVisible: true });
  });

  it('restores nothing when no pane was open before the diagram', () => {
    const state = switchThrough({ ...panes, currentView: 'form' }, 'diagram', 'form');
    expect(state).toMatchObject({ ...panes, currentView: 'form' });
  });

  it('keeps a pane opened in the diagram instead of the remembered one', () => {
    let state = switchThrough({ ...panes, currentView: 'form', isPreviewVisible: true }, 'diagram');
    state = { ...state, isWarningsVisible: true };
    state = switchThrough(state, 'form');
    expect(state).toMatchObject({ ...panes, currentView: 'form', isWarningsVisible: true });
  });

  it('leaves the panes alone when switching between form and yaml', () => {
    const state = switchThrough({ ...panes, currentView: 'form', isWarningsVisible: true }, 'yaml');
    expect(state).toMatchObject({ ...panes, currentView: 'yaml', isWarningsVisible: true });
  });
});
