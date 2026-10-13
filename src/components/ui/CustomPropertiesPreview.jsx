import { useTranslation } from 'react-i18next';
import Tooltip from './Tooltip.jsx';

/**
 * CustomPropertiesPreview component for displaying custom properties as pills.
 * A compact preview component showing property-value pairs.
 *
 * When a customization config is provided, the pill label uses the configured
 * `title` (falling back to the property name) and the tooltip surfaces the
 * technical name (when it differs from the title) and the configured
 * description.
 *
 * @param {Array|Object} properties - Array of {property, value, description} objects OR an object with key-value pairs
 * @param {string} pillClassName - Additional CSS classes to apply to individual pills (e.g., "mr-1 mt-1")
 * @param {Set<string>} hiddenPropertyNames - Property names to omit
 * @param {Array} customPropertyConfigs - Customization configs for this level (resolves title and description per property)
 */
const CustomPropertiesPreview = ({properties = [], pillClassName = "", hiddenPropertyNames, customPropertyConfigs}) => {
	const { t } = useTranslation();
	if (!properties) {
		return null;
	}

	// Normalize properties to array format
	let normalizedProperties = [];
	if (Array.isArray(properties)) {
		normalizedProperties = properties;
	} else if (typeof properties === 'object') {
		normalizedProperties = Object.entries(properties).map(([key, value]) => ({
			property: key,
			value: value,
		}));
	}

	if (hiddenPropertyNames && hiddenPropertyNames.size > 0) {
		normalizedProperties = normalizedProperties.filter((p) => !hiddenPropertyNames.has(p.property));
	}

	if (normalizedProperties.length === 0) {
		return null;
	}

	// Index configs by property name for O(1) lookup
	const configsByName = new Map();
	if (Array.isArray(customPropertyConfigs)) {
		for (const cfg of customPropertyConfigs) {
			if (cfg?.property) configsByName.set(cfg.property, cfg);
		}
	}

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
				const cfg = configsByName.get(prop.property);
				const label = cfg?.title || prop.property;
				const showTechnicalName = !!cfg?.title && cfg.title !== prop.property;
				const description = cfg?.description || prop.description;
				const hasTooltip = showTechnicalName || !!description || !!prop.vendor;

				const pill = (
					<span
						className={`inline-flex items-center ${roundedClass} bg-yellow-50 ${paddingClass} text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20 ${pillClassName} ${hasTooltip ? 'cursor-help' : ''}`}
					>
						{label}:{formatValue(prop.value)}
					</span>
				);

				if (hasTooltip) {
					return (
						<Tooltip
							key={index}
							content={
								<div className="text-xs space-y-1">
									{showTechnicalName && (
										<div className="font-mono text-gray-300">{prop.property}</div>
									)}
									{description && <div>{description}</div>}
									{prop.vendor && <div className="text-gray-300">{t('preview.customProperties.vendor', { value: prop.vendor })}</div>}
								</div>
							}
						>
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
