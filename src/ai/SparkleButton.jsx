import { useState, useEffect, useRef } from 'react';
import { useEditorStore } from '../store.js';
import { useAiSuggestion } from './useAiSuggestion.js';
import Tooltip from '../components/ui/Tooltip.jsx';

// Sparkles icon
const SparklesIcon = ({ className }) => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
		<path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.48.48 0 01.458.333l.5 1.5a.48.48 0 00.309.309l1.5.5a.48.48 0 010 .916l-1.5.5a.48.48 0 00-.309.309l-.5 1.5a.48.48 0 01-.916 0l-.5-1.5a.48.48 0 00-.309-.309l-1.5-.5a.48.48 0 010-.916l1.5-.5a.48.48 0 00.309-.309l.5-1.5A.48.48 0 0118 1.5zM16.5 15a.48.48 0 01.458.333l.5 1.5a.48.48 0 00.309.309l1.5.5a.48.48 0 010 .916l-1.5.5a.48.48 0 00-.309.309l-.5 1.5a.48.48 0 01-.916 0l-.5-1.5a.48.48 0 00-.309-.309l-1.5-.5a.48.48 0 010-.916l1.5-.5a.48.48 0 00.309-.309l.5-1.5A.48.48 0 0116.5 15z" clipRule="evenodd" />
	</svg>
);

/**
 * SparkleButton - AI suggestion button for form fields
 *
 * @param {object} props
 * @param {string} props.fieldName - Human-readable field name (e.g., "Purpose")
 * @param {string} props.fieldPath - YAML path (e.g., "description.purpose")
 * @param {string} props.currentValue - Current field value
 * @param {function} props.onSuggestion - Callback when suggestion is generated
 * @param {string} props.placeholder - Example placeholder for the field
 * @param {string} props.className - Additional CSS classes
 */
export default function SparkleButton({
	fieldName,
	fieldPath,
	currentValue,
	onSuggestion,
	placeholder,
	className = '',
}) {
	const editorConfig = useEditorStore((state) => state.editorConfig);
	const aiEnabled = editorConfig?.ai?.enabled;
	const [showError, setShowError] = useState(false);
	const [previousValue, setPreviousValue] = useState(null);
	const lastAppliedValue = useRef(null);

	const { suggest, isLoading, error } = useAiSuggestion({
		fieldName,
		fieldPath,
		placeholder,
	});

	// Show error briefly then fade out
	useEffect(() => {
		if (error) {
			setShowError(true);
			const timer = setTimeout(() => setShowError(false), 5000);
			return () => clearTimeout(timer);
		}
	}, [error]);

	// Clear undo when user manually edits field after AI suggestion
	useEffect(() => {
		if (previousValue !== null && currentValue !== lastAppliedValue.current) {
			setPreviousValue(null);
			lastAppliedValue.current = null;
		}
	}, [currentValue, previousValue]);

	const handleClick = async () => {
		setShowError(false);
		const valueBeforeSuggestion = currentValue;
		const suggestion = await suggest(currentValue);
		if (suggestion && onSuggestion) {
			setPreviousValue(valueBeforeSuggestion);
			lastAppliedValue.current = suggestion;
			onSuggestion(suggestion);
		}
	};

	const handleUndo = () => {
		if (previousValue !== null && onSuggestion) {
			onSuggestion(previousValue);
			setPreviousValue(null);
			lastAppliedValue.current = null;
		}
	};

	// Don't render if AI is not enabled
	if (!aiEnabled) {
		return null;
	}

	return (
		<div className={`inline-flex items-center gap-1.5 ${className}`}>
			{/* Status indicator */}
			{isLoading && (
				<span className="text-xs text-indigo-500 animate-pulse whitespace-nowrap">
					Generating...
				</span>
			)}
			{showError && !isLoading && (
				<span className="text-xs text-red-500 truncate max-w-32" title={error}>
					{error}
				</span>
			)}

			{/* Undo button */}
			{previousValue !== null && !isLoading && (
				<Tooltip content="Undo AI suggestion">
					<button
						type="button"
						onClick={handleUndo}
						className="inline-flex items-center justify-center p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
						aria-label="Undo AI suggestion"
					>
						<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
						</svg>
					</button>
				</Tooltip>
			)}

			{/* Generate button */}
			<Tooltip content={error && !showError ? error : `Suggest ${fieldName} with AI`}>
				<button
					type="button"
					onClick={handleClick}
					disabled={isLoading}
					className={`inline-flex items-center justify-center p-1 rounded-md transition-colors
            ${isLoading ? 'text-indigo-400 cursor-wait' : 'text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50'}
            ${error && !isLoading ? 'text-red-400 hover:text-red-600' : ''}`}
					aria-label={`Suggest ${fieldName} with AI`}
				>
					<SparklesIcon className={`h-4 w-4 ${isLoading ? 'animate-pulse' : ''}`} />
				</button>
			</Tooltip>
		</div>
	);
}
