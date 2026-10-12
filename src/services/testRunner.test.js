import { describe, it, expect, afterEach, vi } from 'vitest';
import { createTestActions, DEFAULT_TEST_TIMEOUT_SECONDS } from './testRunner.js';

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

// Minimal fake zustand store backed by a plain object.
function makeStore(state = {}) {
  let current = { yaml: 'kind: DataContract', editorConfig: {}, testResults: [], isTestRunning: false, ...state };
  const get = () => current;
  const set = (partial) => {
    current = { ...current, ...partial };
  };
  const actions = createTestActions(set, get, () => 'http://cli.test');
  return { get, ...actions };
}

// A fetch that never answers until its signal aborts, like a CLI waiting on a silent data source.
function hangingFetch() {
  return vi.spyOn(globalThis, 'fetch').mockImplementation((url, { signal }) => new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => reject(signal.reason));
  }));
}

function jsonResponse(body) {
  return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

describe('runTest', () => {
  it('posts the contract and stores the result', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ result: 'passed', checks: [] }));
    const store = makeStore();

    const result = await store.runTest('production');

    expect(fetchMock).toHaveBeenCalledWith('http://cli.test/test?server=production', expect.objectContaining({ method: 'POST', body: 'kind: DataContract' }));
    expect(result.success).toBe(true);
    expect(store.get().testResults).toEqual([result]);
    expect(store.get().isTestRunning).toBe(false);
  });

  it('stores the server error message', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ message: 'boom' }), { status: 500 }));
    const store = makeStore();

    await expect(store.runTest()).rejects.toThrow('boom');

    expect(store.get().testResults[0]).toMatchObject({ success: false, error: 'boom' });
    expect(store.get().isTestRunning).toBe(false);
  });
});

describe('cancelTest', () => {
  it('stops a hanging test and keeps the previous results', async () => {
    hangingFetch();
    const previous = [{ timestamp: 'earlier', success: true, data: { result: 'passed' } }];
    const store = makeStore({ testResults: previous });

    const running = store.runTest();
    expect(store.get().isTestRunning).toBe(true);

    store.cancelTest();

    await expect(running).rejects.toMatchObject({ name: 'TestCancelledError' });
    expect(store.get().isTestRunning).toBe(false);
    expect(store.get().testResults).toBe(previous);
  });

  it('lets a new test run right after a cancel', async () => {
    const fetchMock = hangingFetch();
    const store = makeStore();

    const first = store.runTest();
    store.cancelTest();
    await expect(first).rejects.toMatchObject({ name: 'TestCancelledError' });

    fetchMock.mockResolvedValue(jsonResponse({ result: 'failed', checks: [] }));
    const second = await store.runTest();

    expect(second.success).toBe(false);
    expect(store.get().testResults).toEqual([second]);
    expect(store.get().isTestRunning).toBe(false);
  });

  it('unblocks the panel when no test is in flight', () => {
    const store = makeStore({ isTestRunning: true });

    store.cancelTest();

    expect(store.get().isTestRunning).toBe(false);
  });
});

describe('a new test while one is running', () => {
  it('cancels the old test, and the old test does not overwrite the new result', async () => {
    const fetchMock = hangingFetch();
    const store = makeStore();

    const first = store.runTest();
    fetchMock.mockResolvedValue(jsonResponse({ result: 'passed', checks: [] }));
    const second = store.runTest();

    const result = await second;
    await expect(first).rejects.toMatchObject({ name: 'TestCancelledError' });

    expect(store.get().testResults).toEqual([result]);
    expect(store.get().isTestRunning).toBe(false);
  });
});

describe('timeout', () => {
  it('gives up after the default timeout', async () => {
    vi.useFakeTimers();
    hangingFetch();
    const store = makeStore();

    const running = store.runTest();
    const outcome = expect(running).rejects.toMatchObject({ name: 'TestTimeoutError' });
    await vi.advanceTimersByTimeAsync(DEFAULT_TEST_TIMEOUT_SECONDS * 1000);
    await outcome;

    expect(store.get().isTestRunning).toBe(false);
    expect(store.get().testResults[0].error).toContain(`${DEFAULT_TEST_TIMEOUT_SECONDS} seconds`);
  });

  it('uses the configured timeout', async () => {
    vi.useFakeTimers();
    hangingFetch();
    const store = makeStore({ editorConfig: { tests: { timeoutSeconds: 5 } } });

    const running = store.runTest();
    const outcome = expect(running).rejects.toMatchObject({ name: 'TestTimeoutError' });
    await vi.advanceTimersByTimeAsync(4999);
    expect(store.get().isTestRunning).toBe(true);
    await vi.advanceTimersByTimeAsync(1);
    await outcome;

    expect(store.get().testResults[0]).toMatchObject({ success: false, error: expect.stringContaining('5 seconds') });
  });
});
