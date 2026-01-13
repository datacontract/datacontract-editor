import { useState, useCallback, useEffect } from 'react';
import { useEditorStore } from '../store.js';
import AiChat from './AiChat.jsx';

const DEFAULT_WIDTH = 400;
const MIN_WIDTH = 300;
const MAX_WIDTH = 800;

// X icon for close button
const XIcon = ({ className }) => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<path d="M18 6 6 18" strokeWidth="2"></path>
		<path d="m6 6 12 12" strokeWidth="2"></path>
	</svg>
);

// Plus icon for new conversation
const PlusIcon = ({ className }) => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
		<path d="M12 5v14M5 12h14" />
	</svg>
);

// Sparkles icon for AI header
const SparklesIcon = ({ className }) => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
		<path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.48.48 0 01.458.333l.5 1.5a.48.48 0 00.309.309l1.5.5a.48.48 0 010 .916l-1.5.5a.48.48 0 00-.309.309l-.5 1.5a.48.48 0 01-.916 0l-.5-1.5a.48.48 0 00-.309-.309l-1.5-.5a.48.48 0 010-.916l1.5-.5a.48.48 0 00.309-.309l.5-1.5A.48.48 0 0118 1.5zM16.5 15a.48.48 0 01.458.333l.5 1.5a.48.48 0 00.309.309l1.5.5a.48.48 0 010 .916l-1.5.5a.48.48 0 00-.309.309l-.5 1.5a.48.48 0 01-.916 0l-.5-1.5a.48.48 0 00-.309-.309l-1.5-.5a.48.48 0 010-.916l1.5-.5a.48.48 0 00.309-.309l.5-1.5A.48.48 0 0116.5 15z" clipRule="evenodd" />
	</svg>
);

/**
 * AiSidebar - Full-height resizable AI sidebar at the app level
 * Renders on the far right of the entire app, next to the header buttons
 * Includes the panel header and chat content (merged from AiPanel)
 */
export default function AiSidebar() {
	const isAiPanelOpen = useEditorStore((state) => state.isAiPanelOpen);
	const closeAiPanel = useEditorStore((state) => state.closeAiPanel);
	const resetAiChat = useEditorStore((state) => state.resetAiChat);
	const aiChatHasMessages = useEditorStore((state) => state.aiChatHasMessages);
	const editorConfig = useEditorStore((state) => state.editorConfig);

	const [width, setWidth] = useState(DEFAULT_WIDTH);
	const [isResizing, setIsResizing] = useState(false);

	// Check if AI is enabled
	const aiEnabled = editorConfig?.ai?.enabled !== false;

	const handleMouseDown = useCallback((e) => {
		e.preventDefault();
		setIsResizing(true);
	}, []);

	const handleMouseMove = useCallback((e) => {
		if (!isResizing) return;
		const newWidth = window.innerWidth - e.clientX;
		const clampedWidth = Math.min(Math.max(newWidth, MIN_WIDTH), MAX_WIDTH);
		setWidth(clampedWidth);
	}, [isResizing]);

	const handleMouseUp = useCallback(() => {
		setIsResizing(false);
	}, []);

	useEffect(() => {
		if (isResizing) {
			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);
			document.body.style.cursor = 'ew-resize';
			document.body.style.userSelect = 'none';
		}

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
			document.body.style.cursor = '';
			document.body.style.userSelect = '';
		};
	}, [isResizing, handleMouseMove, handleMouseUp]);

	if (!aiEnabled || !isAiPanelOpen) {
		return null;
	}

	return (
		<div className="hidden md:flex h-full flex-shrink-0">
			{/* Resize handle - minimal style matching other dividers */}
			<div
				onMouseDown={handleMouseDown}
				className="relative flex-shrink-0 cursor-col-resize w-px h-full bg-gray-300 hover:bg-blue-400 transition-colors"
				title="Drag to resize"
			>
				{/* Invisible wider hit area */}
				<div className="absolute inset-y-0 -left-1 -right-1" />
			</div>
			<div style={{ width: `${width}px` }} className="h-full flex flex-col bg-white">
				{/* Header */}
				<div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<SparklesIcon className="h-5 w-5 text-white" />
							<h2 className="text-sm font-semibold text-white">
								Data Contract Assistant
							</h2>
						</div>
						<div className="flex items-center gap-1">
							{aiChatHasMessages && (
								<button
									type="button"
									onClick={resetAiChat}
									className="rounded-md text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-white p-1"
									title="New conversation"
								>
									<span className="sr-only">New conversation</span>
									<PlusIcon className="h-5 w-5" />
								</button>
							)}
							<button
								type="button"
								onClick={closeAiPanel}
								className="rounded-md text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-white p-1"
								title="Close panel"
							>
								<span className="sr-only">Close panel</span>
								<XIcon className="h-5 w-5" />
							</button>
						</div>
					</div>
				</div>

				{/* Chat content */}
				<div className="flex-1 overflow-hidden min-h-0">
					<AiChat />
				</div>
			</div>
		</div>
	);
}
