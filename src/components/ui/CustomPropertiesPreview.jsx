import Tooltip from './Tooltip.jsx';

/**
 * CustomPropertiesPreview component for displaying custom properties as pills
 * A compact preview component showing property-value pairs
 *
 * @param {Array} properties - Array of custom property objects with {property, value, description}
 */
const CustomPropertiesPreview = ({properties = []}) => {
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

	return (
		<div className="flex flex-wrap gap-1">
			{properties.map((prop, index) => {
				const pillContent = (
					<span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20 cursor-help">
						{prop.property}:{formatValue(prop.value)}
					</span>
				);

				const tooltipContent = prop.description ? (
					<div className="text-xs">{prop.description}</div>
				) : null;

				if (tooltipContent) {
					return (
						<Tooltip key={index} content={tooltipContent}>
							{pillContent}
						</Tooltip>
					);
				}

				return <span key={index}>{pillContent}</span>;
			})}
		</div>
	);
};

export default CustomPropertiesPreview;
