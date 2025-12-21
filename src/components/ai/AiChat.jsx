import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useEditorStore } from '../../store.js';
import { validateYaml } from '../../utils/validateYaml.js';
import { buildSystemPrompt, preloadSchema } from '../../config/aiPrompt.js';
import AiDiffPreviewModal from './AiDiffPreviewModal.jsx';

// Preload schema immediately when module loads
preloadSchema();

// Sparkles icon for AI
const SparklesIcon = ({ className }) => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
		<path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.48.48 0 01.458.333l.5 1.5a.48.48 0 00.309.309l1.5.5a.48.48 0 010 .916l-1.5.5a.48.48 0 00-.309.309l-.5 1.5a.48.48 0 01-.916 0l-.5-1.5a.48.48 0 00-.309-.309l-1.5-.5a.48.48 0 010-.916l1.5-.5a.48.48 0 00.309-.309l.5-1.5A.48.48 0 0118 1.5zM16.5 15a.48.48 0 01.458.333l.5 1.5a.48.48 0 00.309.309l1.5.5a.48.48 0 010 .916l-1.5.5a.48.48 0 00-.309.309l-.5 1.5a.48.48 0 01-.916 0l-.5-1.5a.48.48 0 00-.309-.309l-1.5-.5a.48.48 0 010-.916l1.5-.5a.48.48 0 00.309-.309l.5-1.5A.48.48 0 0116.5 15z" clipRule="evenodd" />
	</svg>
);

// Send icon
const SendIcon = ({ className }) => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
		<path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
	</svg>
);

// Loading spinner
const LoadingSpinner = ({ className }) => (
	<svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
		<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
		<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
	</svg>
);

const SUGGESTED_PROMPTS = [
	"Explain this data contract",
	"Add a quality check for null values",
	"Suggest improvements",
	"Add a description for all fields",
];

// Document icon for tool calls
const DocumentIcon = ({ className }) => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
		<path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z" clipRule="evenodd" />
		<path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
	</svg>
);

export default function AiChat() {
	const yaml = useEditorStore((state) => state.yaml);
	const editorConfig = useEditorStore((state) => state.editorConfig);
	const setPendingAiChange = useEditorStore((state) => state.setPendingAiChange);
	const pendingAiChange = useEditorStore((state) => state.pendingAiChange);
	const messagesEndRef = useRef(null);
	const [input, setInput] = useState('');
	const processedToolCalls = useRef(new Set());
	const [systemPrompt, setSystemPrompt] = useState(null); // null = loading
	const systemPromptRef = useRef(null);

	// Determine API endpoint
	const aiEndpoint = editorConfig?.ai?.endpoint || '/api/ai/chat';

	// Build system prompt when yaml changes
	useEffect(() => {
		buildSystemPrompt(yaml).then((prompt) => {
			systemPromptRef.current = prompt;
			setSystemPrompt(prompt);
		});
	}, [yaml]);

	// Create transport that uses ref for latest system prompt
	const transport = useMemo(() => new DefaultChatTransport({
		api: aiEndpoint,
		body: () => ({ system: systemPromptRef.current || '' }),
	}), [aiEndpoint]);

	const isPromptReady = systemPrompt !== null;

	// Handle tool results from AI
	const handleToolResult = useCallback(async (toolName, result) => {
		if (toolName === 'updateContract' && result?.updatedYaml) {
			// Validate the AI-generated YAML syntax
			const validation = await validateYaml(result.updatedYaml);

			// Store pending change (modal will show automatically)
			setPendingAiChange({
				updatedYaml: result.updatedYaml,
				summary: result.summary || 'AI suggested changes',
				validationErrors: validation.errors,
				isValid: validation.isValid,
			});
		}
	}, [setPendingAiChange]);

	const { messages, sendMessage, status, error, stop } = useChat({
		transport,
	});

	// Process tool-result parts when messages change
	useEffect(() => {
		for (const message of messages) {
			if (message.role === 'assistant' && message.parts) {
				for (const part of message.parts) {
					// AI SDK v5: tool parts have type 'tool-{toolName}' with state and output
					if (part.type === 'tool-updateContract' && part.state === 'output-available' && part.output) {
						const toolCallId = `${message.id}-${part.toolCallId}`;
						if (!processedToolCalls.current.has(toolCallId)) {
							processedToolCalls.current.add(toolCallId);
							handleToolResult('updateContract', part.output);
						}
					}
				}
			}
		}
	}, [messages, handleToolResult]);

	const isLoading = status === 'streaming' || status === 'submitted';

	// Auto-scroll to bottom when new messages arrive
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	const handleSuggestedPrompt = (prompt) => {
		setInput(prompt);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!input.trim() || isLoading || !isPromptReady) return;
		const message = input;
		setInput('');
		await sendMessage({ content: message });
	};

	return (
		<div className="flex flex-col h-full">
			{/* Messages area */}
			<div className="flex-1 overflow-y-auto p-4 space-y-4">
				{messages.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-full text-center">
						<SparklesIcon className="h-12 w-12 text-indigo-400 mb-4" />
						<h3 className="text-sm font-medium text-gray-900 mb-2">AI Assistant</h3>
						<p className="text-xs text-gray-500 mb-6 max-w-xs">
							Ask questions about your data contract or request changes.
						</p>
						<div className="space-y-2 w-full max-w-xs">
							{SUGGESTED_PROMPTS.map((prompt, index) => (
								<button
									key={index}
									onClick={() => handleSuggestedPrompt(prompt)}
									className="w-full text-left px-3 py-2 text-xs text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
								>
									{prompt}
								</button>
							))}
						</div>
					</div>
				) : (
					<>
						{messages.map((message) => {
							// Extract text content and tool calls from message
							// AI SDK v5 uses parts array, v4 used content string
							let displayContent = '';
							let hasToolCall = false;
							let toolCallSummary = '';

							if (message.parts && Array.isArray(message.parts)) {
								// AI SDK v5 format: extract text from parts
								displayContent = message.parts
									.filter(part => part.type === 'text')
									.map(part => part.text)
									.join('');

								// Check for tool calls (AI SDK v5 format)
								for (const part of message.parts) {
									if (part.type === 'tool-updateContract') {
										hasToolCall = true;
										if (part.output?.summary) {
											toolCallSummary = part.output.summary;
										}
									}
								}
							} else if (message.content) {
								// Legacy format or fallback
								displayContent = message.content;
							}

							// Check if message content is a JSON error
							let isError = false;
							if (message.role === 'assistant' && displayContent) {
								// Try to parse as JSON (content might be wrapped in quotes)
								let contentToParse = displayContent;
								if (contentToParse.startsWith('"') && contentToParse.endsWith('"')) {
									try {
										contentToParse = JSON.parse(contentToParse);
									} catch {
										// Not valid JSON string, use as-is
									}
								}
								if (typeof contentToParse === 'string' && contentToParse.startsWith('{')) {
									try {
										const parsed = JSON.parse(contentToParse);
										if (parsed.error) {
											displayContent = parsed.error;
											isError = true;
										}
									} catch {
										// Not JSON, display as-is
									}
								}
							}

							return (
								<div
									key={message.id}
									className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
								>
									<div className="max-w-[85%] space-y-2">
										{/* Text content */}
										{displayContent && (
											<div
												className={`rounded-lg px-3 py-2 text-sm ${
													isError
														? 'bg-red-50 text-red-700 border border-red-200'
														: message.role === 'user'
															? 'bg-indigo-600 text-white'
															: 'bg-gray-100 text-gray-900'
												}`}
											>
												<div className="whitespace-pre-wrap break-words">{displayContent}</div>
											</div>
										)}
										{/* Tool call indicator */}
										{hasToolCall && (
											<div className="bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2 text-sm">
												<div className="flex items-center gap-2 text-indigo-700">
													<DocumentIcon className="h-4 w-4" />
													<span className="font-medium">Contract Update</span>
												</div>
												{toolCallSummary && (
													<p className="text-xs text-indigo-600 mt-1">{toolCallSummary}</p>
												)}
												{pendingAiChange && (
													<p className="text-xs text-indigo-500 mt-1">
														Review the changes in the preview dialog
													</p>
												)}
											</div>
										)}
									</div>
								</div>
							);
						})}
						{isLoading && (
							<div className="flex justify-start">
								<div className="bg-gray-100 rounded-lg px-3 py-2">
									<LoadingSpinner className="h-4 w-4 text-gray-500" />
								</div>
							</div>
						)}
						<div ref={messagesEndRef} />
					</>
				)}
			</div>

			{/* Error display */}
			{error && (
				<div className="mx-4 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg">
					<p className="text-xs text-red-700">{error.message}</p>
				</div>
			)}

			{/* Input area */}
			<div className="border-t border-gray-200 p-4">
				<form onSubmit={handleSubmit} className="flex gap-2">
					<input
						type="text"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder={isPromptReady ? "Ask about your data contract..." : "Loading..."}
						className="flex-1 min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
						disabled={isLoading || !isPromptReady}
					/>
					{isLoading ? (
						<button
							type="button"
							onClick={() => stop()}
							className="inline-flex items-center justify-center rounded-lg bg-gray-600 px-3 py-2 text-white hover:bg-gray-700 transition-colors"
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
								<path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
							</svg>
						</button>
					) : (
						<button
							type="submit"
							disabled={!input.trim() || !isPromptReady}
							className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							<SendIcon className="h-4 w-4" />
						</button>
					)}
				</form>
			</div>

			{/* AI Diff Preview Modal */}
			<AiDiffPreviewModal />
		</div>
	);
}
