import Tooltip from './Tooltip.jsx';

/**
 * CustomPropertiesPreview component for displaying custom properties as pills
 * A compact preview component showing property-value pairs
 *
 * @param {Array} properties - Array of custom property objects with {property, value, description}
 * @param {string} pillClassName - Additional CSS classes to apply to individual pills (e.g., "mr-1 mt-1")
 */
const CustomPropertiesPreview = ({properties = [], pillClassName = ""}) => {
	if (!properties || properties.length === 0) {
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
			{properties.map((prop, index) => {
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
