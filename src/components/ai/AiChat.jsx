import { useEffect, useRef, useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { useEditorStore } from '../../store.js';
import { buildSystemPrompt, preloadSchema } from '../../config/aiPrompt.js';
import { chatWithTools } from '../../services/aiService.js';
import { registerBuiltInTools } from '../../services/aiTools.js';
import AiDiffPreviewModal from './AiDiffPreviewModal.jsx';

// Preload schema immediately when module loads
preloadSchema();

// Register built-in tools on module load
registerBuiltInTools();

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
	"Guide me",
	"Create a data contract for this example data: ",
	"Add a property business_timestamp",
	"Generate quality rules",
	"Find and fix issues",
];

// Parse OPTIONS blocks from AI response
function parseOptionsFromContent(content) {
	const optionsRegex = /\[\[OPTIONS]]([\s\S]*?)\[\[\/OPTIONS]]/g;
	const matches = [...content.matchAll(optionsRegex)];

	if (matches.length === 0) {
		return { text: content, options: [] };
	}

	// Extract options from all blocks
	const allOptions = [];
	let cleanedText = content;

	for (const match of matches) {
		const optionsBlock = match[1];
		const options = optionsBlock
			.split('\n')
			.map(line => line.trim())
			.filter(line => line.startsWith('- '))
			.map(line => line.substring(2).trim());
		allOptions.push(...options);
		cleanedText = cleanedText.replace(match[0], '');
	}

	return { text: cleanedText.trim(), options: allOptions };
}

// Options buttons component
function AiOptionButtons({ options, onSelect, disabled }) {
	if (!options || options.length === 0) return null;

	return (
		<div className="flex flex-wrap gap-2 mt-3">
			{options.map((option, index) => (
				<button
					key={index}
					onClick={() => onSelect(option)}
					disabled={disabled}
					className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{option}
				</button>
			))}
		</div>
	);
}

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
	const runTest = useEditorStore((state) => state.runTest);
	const setPendingAiChange = useEditorStore((state) => state.setPendingAiChange);
	const lastAppliedAiChange = useEditorStore((state) => state.lastAppliedAiChange);
	const unapplyAiChange = useEditorStore((state) => state.unapplyAiChange);
	const messagesEndRef = useRef(null);
	const [input, setInput] = useState('');
	const [messages, setMessages] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const [systemPrompt, setSystemPrompt] = useState(null);
	const abortControllerRef = useRef(null);

	// Get AI configuration
	const aiConfig = editorConfig?.ai || {};
	const isAiConfigured = aiConfig.endpoint && aiConfig.apiKey;

	// Build system prompt when yaml changes
	useEffect(() => {
		buildSystemPrompt(yaml).then(setSystemPrompt);
	}, [yaml]);

	const isPromptReady = systemPrompt !== null;

	// Auto-scroll to bottom when new messages arrive
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	// Send message to AI
	const sendMessage = useCallback(async (userMessage) => {
		if (!userMessage.trim() || isLoading || !isPromptReady) return;

		if (!isAiConfigured) {
			setError(new Error('AI not configured. Please set endpoint and apiKey in the AI configuration.'));
			return;
		}

		setError(null);
		setIsLoading(true);

		// Add user message to conversation
		const userMsg = { id: Date.now(), role: 'user', content: userMessage };
		setMessages(prev => [...prev, userMsg]);

		// Create abort controller for this request
		abortControllerRef.current = new AbortController();

		try {
			// Build messages array for API
			const apiMessages = [
				{ role: 'system', content: systemPrompt },
				...messages.map(m => ({ role: m.role, content: m.content })),
				{ role: 'user', content: userMessage }
			];

			// Add placeholder for assistant message
			const assistantMsgId = Date.now() + 1;
			setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: '', toolCall: null }]);

			// Use chatWithTools for automatic tool execution loop
			const result = await chatWithTools({
				messages: apiMessages,
				tools: [], // aiService adds registered tools automatically
				config: {
					endpoint: aiConfig.endpoint,
					apiKey: aiConfig.apiKey,
					model: aiConfig.model || 'gpt-4o',
					headers: aiConfig.headers || {},
					authHeader: aiConfig.authHeader || 'bearer',
				},
				context: { yaml, editorConfig, runTest },
				signal: abortControllerRef.current.signal,
				callbacks: {
					onContent: (chunk, content) => {
						setMessages(prev => prev.map(m =>
							m.id === assistantMsgId ? { ...m, content } : m
						));
					},
					onToolCallsComplete: (toolCalls, toolResults) => {
						// Process each tool result for special handling
						for (let i = 0; i < toolCalls.length; i++) {
							const toolCall = toolCalls[i];
							const toolResult = toolResults[i];
							const name = toolCall.function?.name;

							if (!name || !toolResult) continue;

							// Parse the result content
							let parsedResult;
							try {
								parsedResult = JSON.parse(toolResult.content);
							} catch {
								parsedResult = { content: toolResult.content };
							}

							// Special handling for updateContract
							if (name === 'updateContract' && parsedResult.updatedYaml) {
								setPendingAiChange({
									updatedYaml: parsedResult.updatedYaml,
									summary: parsedResult.summary || 'AI suggested changes',
									validationErrors: parsedResult.validationErrors,
									isValid: parsedResult.isValid,
								});
								setMessages(prev => prev.map(m =>
									m.id === assistantMsgId ? { ...m, toolCall: { summary: parsedResult.summary, name } } : m
								));
							}
						}
					},
				},
			});

		} catch (e) {
			if (e.name !== 'AbortError') {
				setError(e);
				console.error('AI chat error:', e);
			}
		} finally {
			setIsLoading(false);
			abortControllerRef.current = null;
		}
	}, [messages, systemPrompt, isPromptReady, isLoading, aiConfig, isAiConfigured, yaml, editorConfig, runTest, setPendingAiChange]);

	const handleSuggestedPrompt = (prompt) => {
		setInput(prompt);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!input.trim() || isLoading || !isPromptReady) return;
		const message = input;
		setInput('');
		await sendMessage(message);
	};

	const handleStop = () => {
		abortControllerRef.current?.abort();
	};

	// Show configuration message if not configured
	if (!isAiConfigured) {
		return (
			<div className="flex flex-col h-full">
				<div className="flex-1 flex items-center justify-center p-4">
					<div className="text-center max-w-sm">
						<SparklesIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
						<h3 className="text-sm font-medium text-gray-900 mb-2">AI Assistant Not Configured</h3>
						<p className="text-xs text-gray-500 mb-4">
							Configure an OpenAI-compatible endpoint.
						</p>
						<div className="bg-gray-50 rounded-lg p-3 text-left text-xs font-mono text-gray-600">
							<div><span className="text-gray-400">endpoint:</span> https://api.openai.com/v1/chat/completions</div>
							<div><span className="text-gray-400">apiKey:</span> sk-...</div>
							<div><span className="text-gray-400">model:</span> gpt-4o</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full overflow-hidden">
			{/* Messages area */}
			<div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 min-h-0">
				{messages.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-full text-center">
						<SparklesIcon className="h-12 w-12 text-indigo-400 mb-4" />
						<h3 className="text-sm font-medium text-gray-900 mb-2">Data Contract Assistant</h3>
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
						{messages.map((message) => (
							<div
								key={message.id}
								className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
							>
								<div className="max-w-[85%] min-w-0 space-y-2">
									{/* Tool call indicator - shown FIRST since update happens before next question */}
									{message.toolCall && (
										<div className="bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2 text-sm">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2 text-indigo-700">
													<DocumentIcon className="h-4 w-4" />
													<span className="font-medium">
														{message.toolCall.name === 'updateContract' ? 'Contract Update' : message.toolCall.name}
													</span>
												</div>
												{lastAppliedAiChange && (
													<button
														onClick={unapplyAiChange}
														className="text-xs text-indigo-600 hover:text-indigo-800 underline"
													>
														Undo
													</button>
												)}
											</div>
											{message.toolCall.summary && (
												<p className="text-xs text-indigo-600 mt-1">{message.toolCall.summary}</p>
											)}
										</div>
									)}
									{/* Text content */}
									{message.content && (
										<div
											className={`rounded-lg px-3 py-2 text-sm ${
												message.role === 'user'
													? 'bg-indigo-600 text-white'
													: 'bg-gray-100 text-gray-900'
											}`}
										>
											{message.role === 'user' ? (
												<div className="whitespace-pre-wrap break-words">{message.content}</div>
											) : (
												(() => {
													const { text, options } = parseOptionsFromContent(message.content);
													return (
														<>
															<div className="prose prose-sm max-w-full prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2 prose-headings:text-gray-900 prose-code:bg-gray-200 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-gray-800 prose-code:before:content-none prose-code:after:content-none break-words">
																<ReactMarkdown>{text}</ReactMarkdown>
															</div>
															<AiOptionButtons
																options={options}
																onSelect={(option) => sendMessage(option)}
																disabled={isLoading}
															/>
														</>
													);
												})()
											)}
										</div>
									)}
								</div>
							</div>
						))}
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
							onClick={handleStop}
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
