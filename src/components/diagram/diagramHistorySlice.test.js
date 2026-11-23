import { beforeEach, describe, expect, it } from 'vitest';
import { createDiagramHistorySlice } from './diagramHistorySlice.js';

const state = (yaml, x = 0, collapse = {}) => ({ yaml, positions: { 'schema-0': { x, y: 0 } }, collapse });

describe('diagram history', () => {
  let yaml;
  let history;

  beforeEach(() => {
    yaml = 'a';
    history = createDiagramHistorySlice(() => {}, () => ({ yaml }));
  });

  it('undoes and redoes contract and layout steps in order', () => {
    history.recordDiagramStep(state('a'));
    history.recordDiagramStep(state('b'));
    expect(history.undoDiagramStep(state('b', 50))).toEqual(state('b'));
    expect(history.undoDiagramStep(state('b'))).toEqual(state('a'));
    expect(history.undoDiagramStep(state('a'))).toBeNull();
    expect(history.redoDiagramStep(state('a'))).toEqual(state('b'));
    expect(history.redoDiagramStep(state('b'))).toEqual(state('b', 50));
    expect(history.redoDiagramStep(state('b', 50))).toBeNull();
  });

  it('skips steps that changed nothing', () => {
    history.recordDiagramStep(state('a'));
    history.recordDiagramStep(state('b'));
    expect(history.undoDiagramStep(state('b', 0, { orders: 'full' }))).toEqual(state('a'));
  });

  it('drops the redo steps on a new step', () => {
    history.recordDiagramStep(state('a'));
    history.undoDiagramStep(state('b'));
    history.recordDiagramStep(state('a'));
    expect(history.redoDiagramStep(state('c'))).toBeNull();
  });

  it('keeps the last 100 steps', () => {
    for (let i = 0; i <= 100; i++) history.recordDiagramStep(state(`v${i}`));
    let current = state('now');
    let undone = 0;
    for (let step; (step = history.undoDiagramStep(current)); current = step) undone++;
    expect(undone).toBe(100);
    expect(current).toEqual(state('v1'));
  });

  it('survives leaving the diagram unless the contract changes meanwhile', () => {
    history.recordDiagramStep(state('before'));
    history.pauseDiagramHistory();
    history.resumeDiagramHistory();
    expect(history.undoDiagramStep(state('a'))).toEqual(state('before'));

    history.recordDiagramStep(state('before'));
    history.pauseDiagramHistory();
    yaml = 'edited in the form';
    history.resumeDiagramHistory();
    expect(history.undoDiagramStep(state(yaml))).toBeNull();
  });
});
