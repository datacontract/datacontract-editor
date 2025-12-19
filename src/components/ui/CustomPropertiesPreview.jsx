import Tooltip from './Tooltip.jsx';

/**
 * CustomPropertiesPreview component for displaying custom properties as pills
 * A compact preview component showing property-value pairs
 *
 * @param {Array|Object} properties - Array of {property, value, description} objects OR an object with key-value pairs
 * @param {string} pillClassName - Additional CSS classes to apply to individual pills (e.g., "mr-1 mt-1")
 */
const CustomPropertiesPreview = ({properties = [], pillClassName = ""}) => {
	if (!properties) {
		return null;
	}

	// Normalize properties to array format
	// Handle both array format [{property, value, description}] and object format {key: value}
	let normalizedProperties = [];
	if (Array.isArray(properties)) {
		normalizedProperties = properties;
	} else if (typeof properties === 'object') {
		normalizedProperties = Object.entries(properties).map(([key, value]) => ({
			property: key,
			value: value,
		}));
	}

	if (normalizedProperties.length === 0) {
		return null;
	}

	// Helper to format value for display
	const formatValue = (value) => {
		if (value === null || value === undefined) return '';
		if (typeof value === 'object') {
			try {
				return JSON.stringify(value);
			} catch {
				return String(value);
			}
		}
		return String(value);
	};

	const roundedClass = "rounded-md";
	const paddingClass = "px-2 py-1";

	return (
		<>
			{normalizedProperties.map((prop, index) => {
				const pill = (
					<span
						className={`inline-flex items-center ${roundedClass} bg-yellow-50 ${paddingClass} text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20 ${pillClassName} ${prop.description ? 'cursor-help' : ''}`}
					>
						{prop.property}:{formatValue(prop.value)}
					</span>
				);

				if (prop.description) {
					return (
						<Tooltip key={index} content={<div className="text-xs">{prop.description}</div>}>
							{pill}
						</Tooltip>
					);
				}

				return <span key={index}>{pill}</span>;
			})}
		</>
	);
};

export default CustomPropertiesPreview;
