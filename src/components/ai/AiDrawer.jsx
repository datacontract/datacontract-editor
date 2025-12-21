import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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

const MIN_WIDTH = 320;
const MAX_WIDTH_PERCENT = 0.6;

/**
 * AiDrawer - A slide-out drawer for the AI assistant
 * Resizable by dragging the left edge.
 */
export default function AiDrawer() {
	const isOpen = useEditorStore((state) => state.isAiPanelOpen);
	const closeAiPanel = useEditorStore((state) => state.closeAiPanel);
	const editorConfig = useEditorStore((state) => state.editorConfig);

	const [width, setWidth] = useState(400);
	const [isResizing, setIsResizing] = useState(false);

	// Check if AI is enabled
	const aiEnabled = editorConfig?.ai?.enabled !== false; // Default to true if not explicitly disabled

	const handleMouseDown = useCallback((e) => {
		e.preventDefault();
		setIsResizing(true);
	}, []);

	const handleMouseMove = useCallback((e) => {
		if (!isResizing) return;

		const newWidth = window.innerWidth - e.clientX;
		const maxWidth = window.innerWidth * MAX_WIDTH_PERCENT;
		const clampedWidth = Math.min(Math.max(newWidth, MIN_WIDTH), maxWidth);
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

	// Close on Escape key
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === 'Escape' && isOpen) {
				closeAiPanel();
			}
		};
		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [isOpen, closeAiPanel]);

	if (!aiEnabled) {
		return null;
	}

	const toggleAiPanel = useEditorStore.getState().toggleAiPanel;

	return (
		<>
			{/* Floating AI button - shown when drawer is closed */}
			{!isOpen && createPortal(
				<button
					type="button"
					onClick={toggleAiPanel}
					className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
					title="AI Assistant"
				>
					<SparklesIcon className="h-6 w-6" />
				</button>,
				document.body
			)}

			{/* Backdrop for mobile */}
			{isOpen && (
				<div
					className="fixed inset-0 bg-black/20 z-30 md:hidden"
					onClick={closeAiPanel}
				/>
			)}

			{/* Drawer */}
			<div
				style={{ width: `${width}px` }}
				className={`fixed inset-y-0 right-0 z-40 transform transition-transform ${
					isResizing ? '' : 'duration-300'
				} ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
			>
				{/* Resize handle */}
				<div
					onMouseDown={handleMouseDown}
					className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-indigo-500/50 active:bg-indigo-500 transition-colors z-10"
					title="Drag to resize"
				/>

				<div className="flex h-full flex-col bg-white shadow-xl border-l border-gray-200">
					{/* Header */}
					<div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<SparklesIcon className="h-5 w-5 text-white" />
								<h2 className="text-sm font-semibold text-white">
									AI Assistant
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
					<div className="flex-1 overflow-hidden">
						<AiChat />
					</div>
				</div>
			</div>
		</>
	);
}
