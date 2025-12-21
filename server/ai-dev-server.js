/**
 * Local development server for AI chat - multi-provider proxy
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-ant-... node server/ai-dev-server.js
 *   OPENAI_API_KEY=sk-... node server/ai-dev-server.js
 *   GOOGLE_GENERATIVE_AI_API_KEY=... node server/ai-dev-server.js
 *
 * This starts a local server at http://localhost:3001/api/ai/chat
 * that proxies requests to Claude, OpenAI, or Gemini.
 */

import { createServer } from 'http';
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { streamText, convertToModelMessages } from 'ai';
import { jsonSchema } from '@ai-sdk/provider-utils';

const PORT = 3001;

// Provider configurations with default models
const PROVIDERS = {
	anthropic: {
		name: 'Anthropic',
		envKey: 'ANTHROPIC_API_KEY',
		defaultModel: 'claude-sonnet-4-20250514',
		createModel: (modelId) => anthropic(modelId),
	},
	openai: {
		name: 'OpenAI',
		envKey: 'OPENAI_API_KEY',
		defaultModel: 'gpt-5',
		createModel: (modelId) => openai(modelId),
	},
	google: {
		name: 'Google',
		envKey: 'GOOGLE_GENERATIVE_AI_API_KEY',
		defaultModel: 'gemini-2.5-pro',
		createModel: (modelId) => google(modelId),
	},
};

// Prevent server crashes on unhandled rejections
process.on('unhandledRejection', (err) => {
	console.error('⚠️ Unhandled rejection:', err.message);
});

async function handleRequest(req, res) {
	// CORS headers
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	if (req.method === 'OPTIONS') {
		res.writeHead(204);
		res.end();
		return;
	}

	if (req.method !== 'POST' || req.url !== '/api/ai/chat') {
		res.writeHead(404, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({ error: 'Not found' }));
		return;
	}

	try {
		// Parse request body
		let body = '';
		for await (const chunk of req) {
			body += chunk;
		}
		const { messages, system } = JSON.parse(body);

		// Find first provider with API key set
		const [, providerConfig] = Object.entries(PROVIDERS)
			.find(([, config]) => process.env[config.envKey]) || [];

		if (!providerConfig) {
			res.writeHead(500, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify({ error: 'No AI provider configured. Set ANTHROPIC_API_KEY, OPENAI_API_KEY, or GOOGLE_GENERATIVE_AI_API_KEY.' }));
			return;
		}

		const modelId = providerConfig.defaultModel;

		console.log('\n📥 REQUEST:');
		console.log('Provider:', providerConfig.name);
		console.log('Model:', modelId);
		console.log('Messages:', messages.length);
		console.log('System prompt length:', system?.length || 0, 'chars');

		// Convert messages to UIMessage format if they have old `content` format
		const uiMessages = messages.map(msg => {
			if (msg.parts) {
				return msg; // Already in UIMessage format
			}
			// Convert from old format { content: string } to new format { parts: [...] }
			return {
				id: msg.id,
				role: msg.role,
				parts: [{ type: 'text', text: msg.content || '' }],
			};
		});

		// Convert UI messages to model messages format
		const modelMessages = convertToModelMessages(uiMessages);

		// Stream response with tools
		// Don't pass empty system prompt - some providers reject it
		const streamOptions = {
			model: providerConfig.createModel(modelId),
			messages: modelMessages,
			tools: {
				updateContract: {
					description: 'Update the data contract YAML. Use this when the user asks to add, modify, or remove content from the contract. Provide the complete updated YAML.',
					inputSchema: jsonSchema({
						type: 'object',
						properties: {
							updatedYaml: { type: 'string', description: 'The complete updated YAML content' },
							summary: { type: 'string', description: 'Brief summary of the changes made' },
						},
						required: ['updatedYaml', 'summary'],
						additionalProperties: false,
					}),
					execute: async ({ updatedYaml, summary }) => {
						console.log('\n🔧 TOOL CALL: updateContract');
						console.log('Summary:', summary);
						console.log('YAML length:', updatedYaml?.length || 0);
						return { updatedYaml, summary, success: true };
					},
				},
			},
		};

		// Only add system prompt if non-empty
		if (system && system.trim()) {
			streamOptions.system = system;
		}

		const result = streamText(streamOptions);

		console.log('\n📤 RESPONSE streaming...');

		// Set required header for UI Message Stream Protocol
		res.setHeader('x-vercel-ai-ui-message-stream', 'v1');

		// Use AI SDK's built-in method to pipe the response
		// This properly formats the stream for useChat on the client
		result.pipeUIMessageStreamToResponse(res);

		// Log when complete (don't crash on errors)
		result.text
			.then(text => {
				console.log('\n✅ Response complete, total chars:', text.length);
			})
			.catch(err => {
				console.error('\n❌ Stream error:', err.message);
			});
	} catch (error) {
		console.error('Error:', error);
		if (!res.headersSent) {
			res.writeHead(500, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify({ error: error.message }));
		}
	}
}

const server = createServer(handleRequest);

server.listen(PORT, () => {
	const ready = Object.entries(PROVIDERS)
		.filter(([, config]) => process.env[config.envKey])
		.map(([key]) => key);
	console.log(`\n🤖 AI Dev Server running at http://localhost:${PORT}`);
	console.log(`   Providers: ${ready.length ? ready.join(', ') : '(none - set API keys)'}\n`);
});
