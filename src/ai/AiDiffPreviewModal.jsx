import { createPortal } from 'react-dom';
import { DiffEditor } from '@monaco-editor/react';
import { useEditorStore } from '../store.js';
import { useEffect, useState, useRef, useCallback } from 'react';

// Icons
const XMarkIcon = ({ className }) => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
		<path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
	</svg>
);

const ExclamationCircleIcon = ({ className }) => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
		<path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
	</svg>
);

const ExclamationTriangleIcon = ({ className }) => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
		<path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
	</svg>
);

const CheckCircleIcon = ({ className }) => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
		<path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
	</svg>
);

export default function AiDiffPreviewModal() {
	const yaml = useEditorStore((state) => state.yaml);
	const pendingAiChange = useEditorStore((state) => state.pendingAiChange);
	const clearPendingAiChange = useEditorStore((state) => state.clearPendingAiChange);
	const setYaml = useEditorStore((state) => state.setYaml);
	const [showErrors, setShowErrors] = useState(false);
	const [editedYaml, setEditedYaml] = useState(null);
	const diffEditorRef = useRef(null);

	// Initialize editedYaml when pendingAiChange changes
	useEffect(() => {
		if (pendingAiChange?.updatedYaml) {
			setEditedYaml(pendingAiChange.updatedYaml);
		}
	}, [pendingAiChange?.updatedYaml]);

	const handleEditorDidMount = (editor) => {
		diffEditorRef.current = editor;
		// Listen for changes in the modified editor
		const modifiedEditor = editor.getModifiedEditor();
		modifiedEditor.onDidChangeModelContent(() => {
			setEditedYaml(modifiedEditor.getValue());
		});
	};

	// Cleanup editor before closing - defined with useCallback so it can be used in effects
	const cleanupAndClose = useCallback((applyChanges = false) => {
		if (applyChanges && editedYaml) {
			// Store original YAML for undo
			useEditorStore.setState({
				lastAppliedAiChange: { originalYaml: yaml, summary: pendingAiChange?.summary }
			});
			setYaml(editedYaml);
		}
		// Dispose editor before unmounting to prevent race condition
		if (diffEditorRef.current) {
			try {
				diffEditorRef.current.dispose();
			} catch {
				// Ignore disposal errors
			}
			diffEditorRef.current = null;
		}
		setEditedYaml(null);
		clearPendingAiChange();
	}, [editedYaml, yaml, pendingAiChange?.summary, setYaml, clearPendingAiChange]);

	// Cleanup editor on unmount
	useEffect(() => {
		return () => {
			if (diffEditorRef.current) {
				try {
					diffEditorRef.current.dispose();
				} catch {
					// Ignore disposal errors
				}
				diffEditorRef.current = null;
			}
		};
	}, []);

	// Handle ESC key to close
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === 'Escape' && pendingAiChange) {
				cleanupAndClose(false);
			}
		};
		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [pendingAiChange, cleanupAndClose]);

	if (!pendingAiChange) return null;

	const { summary, validationErrors = [] } = pendingAiChange;
	const criticalErrors = validationErrors.filter((e) => e.severity === 'error');
	const warnings = validationErrors.filter((e) => e.severity === 'warning');

	const handleApply = () => cleanupAndClose(true);
	const handleCancel = () => cleanupAndClose(false);

	return createPortal(
		<div className="fixed inset-0 z-[9999] overflow-hidden">
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black/50 transition-opacity"
				onClick={handleCancel}
			/>

			{/* Modal */}
			<div className="fixed inset-4 md:inset-8 lg:inset-12 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
				{/* Header */}
				<div className="px-6 py-4 border-b border-gray-200 flex items-start justify-between bg-gray-50">
					<div className="flex-1 min-w-0">
						<h2 className="text-lg font-semibold text-gray-900">
							Review AI Changes
						</h2>
						{summary && (
							<p className="text-sm text-gray-600 mt-1 truncate">{summary}</p>
						)}
					</div>
					<button
						onClick={handleCancel}
						className="ml-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
					>
						<XMarkIcon className="h-5 w-5" />
					</button>
				</div>

				{/* Validation Status Bar */}
				<div className="px-6 py-3 border-b border-gray-200 bg-white">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							{criticalErrors.length > 0 ? (
								<span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-700">
									<ExclamationCircleIcon className="h-4 w-4" />
									{criticalErrors.length} error{criticalErrors.length !== 1 ? 's' : ''}
								</span>
							) : (
								<span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700">
									<CheckCircleIcon className="h-4 w-4" />
									Valid YAML
								</span>
							)}
							{warnings.length > 0 && (
								<span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600">
									<ExclamationTriangleIcon className="h-4 w-4" />
									{warnings.length} warning{warnings.length !== 1 ? 's' : ''}
								</span>
							)}
						</div>
						{validationErrors.length > 0 && (
							<button
								onClick={() => setShowErrors(!showErrors)}
								className="text-xs text-gray-500 hover:text-gray-700 underline"
							>
								{showErrors ? 'Hide details' : 'Show details'}
							</button>
						)}
					</div>

					{/* Expandable Error Details */}
					{showErrors && validationErrors.length > 0 && (
						<div className="mt-3 max-h-32 overflow-y-auto space-y-1">
							{validationErrors.map((err, idx) => (
								<div
									key={idx}
									className={`text-xs px-2 py-1 rounded ${
										err.severity === 'error'
											? 'bg-red-50 text-red-700'
											: 'bg-amber-50 text-amber-700'
									}`}
								>
									<span className="font-medium">{err.path || '/'}</span>: {err.message}
								</div>
							))}
						</div>
					)}
				</div>

				{/* Diff Editor */}
				<div className="flex-1 overflow-hidden">
					<DiffEditor
						original={yaml || ''}
						modified={editedYaml || pendingAiChange?.updatedYaml || ''}
						language="yaml"
						theme="light"
						onMount={handleEditorDidMount}
						options={{
							renderSideBySide: true,
							minimap: { enabled: false },
							readOnly: false,
							originalEditable: false,
							scrollBeyondLastLine: false,
							wordWrap: 'on',
							fontSize: 13,
							lineNumbers: 'on',
						}}
					/>
				</div>

				{/* Footer */}
				<div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
					<p className="text-xs text-gray-500">
						Edit the right side directly to adjust changes
					</p>
					<div className="flex gap-3">
						<button
							onClick={handleCancel}
							className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
						>
							Cancel
						</button>
						<button
							onClick={handleApply}
							className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors bg-indigo-600 hover:bg-indigo-700"
						>
							Apply Changes
						</button>
					</div>
				</div>
			</div>
		</div>,
		document.body
	);
}
