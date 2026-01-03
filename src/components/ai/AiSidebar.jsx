import { useState, useCallback, useEffect } from 'react';
import { useEditorStore } from '../../store.js';
import AiPanel from './AiPanel.jsx';

const DEFAULT_WIDTH = 400;
const MIN_WIDTH = 300;
const MAX_WIDTH = 800;

/**
 * AiSidebar - Full-height resizable AI sidebar at the app level
 * Renders on the far right of the entire app, next to the header buttons
 */
export default function AiSidebar() {
	const isAiPanelOpen = useEditorStore((state) => state.isAiPanelOpen);
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
			<div style={{ width: `${width}px` }} className="h-full">
				<AiPanel />
			</div>
		</div>
	);
}
