import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useEditorStore } from '../store.js';

// Sparkles icon for AI button with individual animated sparkles
const SparklesIcon = ({ className, animate }) => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
		{/* Main large sparkle */}
		<path
			className={animate ? "animate-sparkle" : ""}
			fillRule="evenodd"
			d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5z"
			clipRule="evenodd"
		/>
		{/* Top-right small sparkle */}
		<path
			className={animate ? "animate-sparkle-delayed-1" : ""}
			d="M18 1.5a.48.48 0 01.458.333l.5 1.5a.48.48 0 00.309.309l1.5.5a.48.48 0 010 .916l-1.5.5a.48.48 0 00-.309.309l-.5 1.5a.48.48 0 01-.916 0l-.5-1.5a.48.48 0 00-.309-.309l-1.5-.5a.48.48 0 010-.916l1.5-.5a.48.48 0 00.309-.309l.5-1.5A.48.48 0 0118 1.5z"
		/>
		{/* Bottom-right small sparkle */}
		<path
			className={animate ? "animate-sparkle-delayed-2" : ""}
			d="M16.5 15a.48.48 0 01.458.333l.5 1.5a.48.48 0 00.309.309l1.5.5a.48.48 0 010 .916l-1.5.5a.48.48 0 00-.309.309l-.5 1.5a.48.48 0 01-.916 0l-.5-1.5a.48.48 0 00-.309-.309l-1.5-.5a.48.48 0 010-.916l1.5-.5a.48.48 0 00.309-.309l.5-1.5A.48.48 0 0116.5 15z"
		/>
	</svg>
);

/**
 * AiFloatingActionButton - Floating button to open the AI assistant panel
 * The panel itself is rendered in MainContent as an integrated side panel.
 */
export default function AiFloatingActionButton() {
	const isOpen = useEditorStore((state) => state.isAiPanelOpen);
	const editorConfig = useEditorStore((state) => state.editorConfig);
	const openAiPanel = useEditorStore((state) => state.openAiPanel);
	const [isHovered, setIsHovered] = useState(false);

	// Reset hover state when panel opens/closes
	useEffect(() => {
		setIsHovered(false);
	}, [isOpen]);

	// Check if AI is enabled
	const aiEnabled = editorConfig?.ai?.enabled !== false;

	if (!aiEnabled) {
		return null;
	}

	// Only show button when panel is closed
	if (isOpen) {
		return null;
	}

	return createPortal(
		<button
			type="button"
			onClick={openAiPanel}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
			title="AI Assistant"
		>
			<SparklesIcon className="h-6 w-6" animate={isHovered} />
		</button>,
		document.body
	);
}
