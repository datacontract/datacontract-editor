// AI module exports
export { default as AiChat } from './AiChat.jsx';
export { default as AiSidebar } from './AiSidebar.jsx';
export { default as AiFloatingActionButton } from './AiFloatingActionButton.jsx';
export { default as AiDiffPreviewModal } from './AiDiffPreviewModal.jsx';
export { default as SparkleButton } from './SparkleButton.jsx';

// Hooks
export { useAiSuggestion, useAiFieldSuggestion } from './useAiSuggestion.js';

// Service
export {
	registerTool,
	unregisterTool,
	clearTools,
	getRegisteredTools,
	executeTool,
	hasTool,
	streamChatCompletion,
	executeToolCalls,
	chatWithTools,
} from './aiService.js';
