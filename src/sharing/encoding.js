/* encoded = encodebase64(gzip(yaml)) */
export async function encodeYamlCode(yamlCode) {
	const compressed = await gzip(yamlCode);
	return window.btoa(String.fromCharCode(...new Uint8Array(compressed)));
}

/* decoded = gunzip(decodebase64(queryparameter)) */
export async function decodeQueryParameter(queryParameter) {
	const compressed = Uint8Array.from(window.atob(queryParameter), c => c.charCodeAt(0));
	const decompressed = await gunzip(compressed);
	const decoder = new TextDecoder();
	return decoder.decode(decompressed)
}

async function gzip(input) {
	const encoder = new TextEncoder();
	const data = encoder.encode(input);

	const stream = new CompressionStream('gzip');
	const writer = stream.writable.getWriter();
	writer.write(data);
	writer.close();

	const compressedStream = stream.readable;
	const reader = compressedStream.getReader();

	let chunks = [];
	let done = false;

	while (!done) {
		const { value, done: doneReading } = await reader.read();
		if (value) {
			chunks.push(value);
		}
		done = doneReading;
	}

	let size = 0;
	chunks.forEach(chunk => size += chunk.length);

	let compressed = new Uint8Array(size);
	let offset = 0;
	chunks.forEach(chunk => {
		compressed.set(chunk, offset);
		offset += chunk.length;
	});

	return compressed;
}

async function gunzip(data) {
	const stream = new DecompressionStream('gzip');
	const writer = stream.writable.getWriter();
	writer.write(data);
	writer.close();

	const decompressedStream = stream.readable;
	const reader = decompressedStream.getReader();

	let chunks = [];
	let done = false;

	while (!done) {
		const { value, done: doneReading } = await reader.read();
		if (value) {
			chunks.push(value);
		}
		done = doneReading;
	}

	let size = 0;
	chunks.forEach(chunk => size += chunk.length);

	let decompressed = new Uint8Array(size);
	let offset = 0;
	chunks.forEach(chunk => {
		decompressed.set(chunk, offset);
		offset += chunk.length;
	});

	return decompressed;
}
