import { useEditorStore } from '../../store.js';
import AiChat from './AiChat.jsx';

// X icon for close button
const XIcon = ({ className }) => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<path d="M18 6 6 18" strokeWidth="2"></path>
		<path d="m6 6 12 12" strokeWidth="2"></path>
	</svg>
);

// Sparkles icon for AI header
const SparklesIcon = ({ className }) => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
		<path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.48.48 0 01.458.333l.5 1.5a.48.48 0 00.309.309l1.5.5a.48.48 0 010 .916l-1.5.5a.48.48 0 00-.309.309l-.5 1.5a.48.48 0 01-.916 0l-.5-1.5a.48.48 0 00-.309-.309l-1.5-.5a.48.48 0 010-.916l1.5-.5a.48.48 0 00.309-.309l.5-1.5A.48.48 0 0118 1.5zM16.5 15a.48.48 0 01.458.333l.5 1.5a.48.48 0 00.309.309l1.5.5a.48.48 0 010 .916l-1.5.5a.48.48 0 00-.309.309l-.5 1.5a.48.48 0 01-.916 0l-.5-1.5a.48.48 0 00-.309-.309l-1.5-.5a.48.48 0 010-.916l1.5-.5a.48.48 0 00.309-.309l.5-1.5A.48.48 0 0116.5 15z" clipRule="evenodd" />
	</svg>
);

/**
 * AiPanel - An integrated side panel for the AI assistant
 * Rendered in the right pane alongside Preview/Warnings/Tests
 */
export default function AiPanel() {
	const closeAiPanel = useEditorStore((state) => state.closeAiPanel);
	const editorConfig = useEditorStore((state) => state.editorConfig);

	// Check if AI is enabled
	const aiEnabled = editorConfig?.ai?.enabled !== false;

	if (!aiEnabled) {
		return null;
	}

	return (
		<div className="flex h-full w-full flex-col bg-white">
			{/* Header */}
			<div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<SparklesIcon className="h-5 w-5 text-white" />
						<h2 className="text-sm font-semibold text-white">
							Data Contract Assistant
						</h2>
					</div>
					<button
						type="button"
						onClick={closeAiPanel}
						className="rounded-md text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
					>
						<span className="sr-only">Close panel</span>
						<XIcon className="h-5 w-5" />
					</button>
				</div>
			</div>

			{/* Chat content */}
			<div className="flex-1 overflow-hidden min-h-0">
				<AiChat />
			</div>
		</div>
	);
}
