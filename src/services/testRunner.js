/**
 * Runs data contract tests against the Data Contract CLI API (POST /test).
 *
 * A test can hang when the data source does not answer, so every run can be cancelled
 * and gives up after a timeout. Both the standalone and the embedded store use this.
 */

export const DEFAULT_TEST_TIMEOUT_SECONDS = 300;

export class TestCancelledError extends Error {
	constructor() {
		super('Test was cancelled.');
		this.name = 'TestCancelledError';
	}
}

export class TestTimeoutError extends Error {
	constructor(seconds) {
		super(`Test did not finish within ${seconds} seconds. Check that the data source is reachable, or increase the test timeout.`);
		this.name = 'TestTimeoutError';
	}
}

function determineSuccess(result) {
	if (result.result) {
		return result.result === 'passed' || result.result === 'pass';
	}
	if (Array.isArray(result.checks)) {
		return !result.checks.some(check =>
			check.result === 'failed' || check.result === 'fail' || check.result === false
		);
	}
	return false;
}

async function readErrorMessage(response) {
	const fallback = `Server returned error: ${response.status} ${response.statusText}`;
	let text;
	try {
		text = await response.text();
	} catch {
		return fallback;
	}
	try {
		const errorData = JSON.parse(text);
		return errorData.message || errorData.error || fallback;
	} catch {
		return text || fallback;
	}
}

/**
 * Creates the runTest and cancelTest store actions.
 *
 * @param set zustand set
 * @param get zustand get
 * @param getBaseUrl (editorConfig) => base URL of the Data Contract CLI API
 */
export function createTestActions(set, get, getBaseUrl) {
	let current = null;

	const runTest = async (server) => {
		current?.cancel();

		const {yaml, editorConfig, testResults: previousResults} = get();
		const baseUrl = getBaseUrl(editorConfig);
		const timeoutSeconds = Number(editorConfig?.tests?.timeoutSeconds) || DEFAULT_TEST_TIMEOUT_SECONDS;

		const controller = new AbortController();
		const run = {
			cancel: () => controller.abort(new TestCancelledError()),
		};
		current = run;
		const timer = setTimeout(() => controller.abort(new TestTimeoutError(timeoutSeconds)), timeoutSeconds * 1000);
		set({isTestRunning: true});

		// a newer run, or a cancel, takes over the panel; this run then leaves the state alone
		const isCurrent = () => current === run;

		try {
			const testEndpoint = `${baseUrl}/test`;
			const url = server ? `${testEndpoint}?server=${encodeURIComponent(server)}` : testEndpoint;
			const headers = {
				'Content-Type': 'text/plain',
			};
			if (editorConfig?.tests?.apiKey) {
				headers['X-API-KEY'] = editorConfig.tests.apiKey;
			}

			const response = await fetch(url, {
				method: 'POST',
				headers,
				body: yaml,
				signal: controller.signal,
			});
			if (!response.ok) {
				throw new Error(await readErrorMessage(response));
			}
			const result = await response.json();

			const newResult = {
				timestamp: new Date().toISOString(),
				success: determineSuccess(result),
				data: result,
			};
			if (isCurrent()) {
				set({testResults: [newResult], isTestRunning: false});
			}
			return newResult;
		} catch (caught) {
			// fetch rejects with the abort reason, but older browsers reject with a plain AbortError
			const error = controller.signal.aborted && controller.signal.reason instanceof Error
				? controller.signal.reason
				: caught;

			if (error instanceof TestCancelledError) {
				// keep the results of the previous run
				if (isCurrent()) {
					set({testResults: previousResults, isTestRunning: false});
				}
				throw error;
			}

			let errorMessage = error.message;
			let isConnectionError = false;
			if (error.name === 'TypeError' && error.message.includes('fetch')) {
				errorMessage = `Cannot connect to Data Contract CLI at ${baseUrl || 'the test server'}.`;
				isConnectionError = true;
			} else if (error.message === 'Unexpected end of JSON input' || error.message.includes('JSON')) {
				errorMessage = 'Test server returned an invalid response. The server may be misconfigured or not responding correctly.';
			}

			if (isCurrent()) {
				set({
					testResults: [{
						timestamp: new Date().toISOString(),
						success: false,
						error: errorMessage,
						isConnectionError,
					}],
					isTestRunning: false,
				});
			}
			throw error;
		} finally {
			clearTimeout(timer);
			if (isCurrent()) {
				current = null;
			}
		}
	};

	const cancelTest = () => {
		if (current) {
			current.cancel();
		} else {
			// nothing in flight, e.g. a stale flag; just unblock the panel
			set({isTestRunning: false});
		}
	};

	return {runTest, cancelTest};
}
