import {useState} from 'react';
import LinkIcon from './icons/LinkIcon.jsx';
import ChevronRightIcon from './icons/ChevronRightIcon.jsx';

/**
 * AuthoritativeDefinitionsEditor component for editing authoritative definitions
 * Provides a consistent interface across the application with expandable cards
 *
 * @param {Array} value - Array of authoritative definition objects
 * @param {Function} onChange - Callback when array changes
 */
const AuthoritativeDefinitionsEditor = ({value = [], onChange}) => {
	const handleAdd = () => {
		const updatedArray = [...value, {type: '', url: '', description: ''}];
		onChange(updatedArray);
	};

	const handleRemove = (index) => {
		const updatedArray = value.filter((_, i) => i !== index);
		onChange(updatedArray.length > 0 ? updatedArray : undefined);
	};

	const handleUpdate = (index, fieldName, fieldValue) => {
		const updatedArray = [...value];
		updatedArray[index] = {...updatedArray[index], [fieldName]: fieldValue};
		onChange(updatedArray);
	};

	return (
		<div className="space-y-2">

			{/* Existing definitions */}
			{value.map((item, index) => (
				<AuthoritativeDefinitionCard
					key={index}
					item={item}
					index={index}
					onUpdate={handleUpdate}
					onRemove={handleRemove}
				/>
			))}
			{/* Footer with label and add button */}
			<div className="flex items-center justify-end">
				<button
					type="button"
					onClick={handleAdd}
					className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
				>
					+ Add Authoritative Definition
				</button>
			</div>
		</div>
	)
	;
};

const AuthoritativeDefinitionCard = ({item, index, onUpdate, onRemove}) => {
	const [isExpanded, setIsExpanded] = useState(!item.type && !item.url);

	const inputClasses = "w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs";

	// Generate a summary of the definition
	const getSummary = () => {
		if (!item.type && !item.url) return 'New definition';
		return item.type || '';
	};

	// Get truncated URL for display
	const getTruncatedUrl = () => {
		if (!item.url) return null;
		return item.url.length > 50 ? item.url.substring(0, 50) + '...' : item.url;
	};

	return (
		<div className="border border-gray-200 rounded-md bg-white">
			{/* Header - Always visible */}
			<div
				className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50 rounded-md"
				onClick={() => setIsExpanded(!isExpanded)}
			>
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2">
						<LinkIcon className="size-3 text-indigo-600 shrink-0"/>
						<span className="text-xs font-medium text-gray-900">Authoritative Definition</span>
						{getSummary() && getSummary() !== 'New definition' && (
							<span className="text-xs text-gray-500">• {getSummary()}</span>
						)}
					</div>
					<div className="text-xs text-gray-600 mt-0.5 truncate">
						{getTruncatedUrl() ? (
							<a
								href={item.url}
								target="_blank"
								rel="noopener noreferrer"
								onClick={(e) => e.stopPropagation()}
								className="text-indigo-600 hover:text-indigo-800 hover:underline"
							>
								{getTruncatedUrl()}
							</a>
						) : (
							<span className="italic text-gray-400">New definition</span>
						)}
					</div>
				</div>
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						setIsExpanded(!isExpanded);
					}}
					className="p-1 hover:bg-gray-100 rounded"
				>
					<ChevronRightIcon
						className={`h-3 w-3 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
					/>
				</button>
			</div>

			{/* Expandable content */}
			{isExpanded && (
				<div className="border-t border-gray-200 px-3 py-3 space-y-3">
					{/* Type and URL row */}
					<div className="grid grid-cols-12 gap-2 items-end">
						<div className="col-span-4">
							<label className="block text-xs font-medium text-gray-700 mb-0.5">Type</label>
							<input
								type="text"
								value={item.type || ''}
								onChange={(e) => onUpdate(index, 'type', e.target.value)}
								className={inputClasses}
								placeholder="e.g., businessDefinition"
							/>
						</div>
						<div className="col-span-7">
							<label className="block text-xs font-medium text-gray-700 mb-0.5">URL</label>
							<input
								type="text"
								value={item.url || ''}
								onChange={(e) => onUpdate(index, 'url', e.target.value)}
								className={inputClasses}
								placeholder="https://..."
							/>
						</div>
						<button
							type="button"
							onClick={() => onRemove(index)}
							className="p-1 text-gray-400 cursor-pointer border border-gray-300 rounded hover:text-red-400 hover:border-red-400 transition-colors justify-self-end"
							title="Remove"
						>
							<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24"
									 stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
											d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
							</svg>
						</button>
					</div>

					{/* Description field */}
					<div>
						<label className="block text-xs font-medium text-gray-700 mb-0.5">Description</label>
						<textarea
							value={item.description || ''}
							onChange={(e) => onUpdate(index, 'description', e.target.value)}
							className={inputClasses}
							placeholder="Describe the authoritative definition..."
							rows={2}
						/>
					</div>
				</div>
			)}
		</div>
	);
};

export default AuthoritativeDefinitionsEditor;
