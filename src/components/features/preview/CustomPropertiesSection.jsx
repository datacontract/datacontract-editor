import Tooltip from '../../ui/Tooltip.jsx';
import PropertyValueRenderer from '../../ui/PropertyValueRenderer.jsx';
import QuestionMarkCircleIcon from '../../ui/icons/QuestionMarkCircleIcon.jsx';
import {useEditorStore} from "../../../store.js";
import {useShallow} from "zustand/react/shallow";
import {useCustomization, useHiddenCustomPropertyNames} from "../../../hooks/useCustomization.js";
import {useTranslation} from 'react-i18next';

const CustomPropertiesSection = () => {
	const { t } = useTranslation();
	const customProperties = useEditorStore(useShallow(state => state.getValue('customProperties')));
	const hiddenNames = useHiddenCustomPropertyNames('root');
	const { customProperties: customPropertyConfigs } = useCustomization('root');

	// Normalize properties to array format
	// Handle both array format [{property, value, description}] and object format {key: value}
	let normalizedProperties = [];
	if (Array.isArray(customProperties)) {
		normalizedProperties = customProperties;
	} else if (customProperties && typeof customProperties === 'object') {
		normalizedProperties = Object.entries(customProperties).map(([key, value]) => ({
			property: key,
			value: value,
		}));
	}

	normalizedProperties = normalizedProperties.filter((p) => !hiddenNames.has(p.property));

	if (normalizedProperties.length === 0) return null;

	const configsByName = new Map((customPropertyConfigs || []).map((c) => [c.property, c]));

	return (
		<section className="print:break-before-page">
			<div className="px-4 sm:px-0">
				<h1 className="text-base font-semibold leading-6 text-gray-900" id="customProperties">{t('preview.customProperties.heading')}</h1>
				<p className="text-sm text-gray-500">{t('preview.customProperties.description')}</p>
			</div>
			<div className="mt-2 overflow-hidden print:overflow-auto bg-white shadow sm:rounded-lg">
				<div className="border-t border-gray-100">
					<dl className="divide-y divide-gray-100 text-sm break-all print:break-inside-avoid">
						{normalizedProperties.map((property, index) => {
							const cfg = configsByName.get(property.property);
							const label = cfg?.title || property.property;
							const showTechnicalName = !!cfg?.title && cfg.title !== property.property;
							const description = cfg?.description || property.description;
							return (
								<div key={index} className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
									<dt className="text-sm font-medium text-gray-900">
										<div className="flex items-center gap-1">
											{label}
											{description && (
												<Tooltip content={description}>
													<QuestionMarkCircleIcon />
												</Tooltip>
											)}
										</div>
										{showTechnicalName && (
											<div className="mt-0.5 font-mono text-xs font-normal text-gray-500">{property.property}</div>
										)}
									</dt>
									<dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
										<PropertyValueRenderer value={property.value}/>
									</dd>
								</div>
							);
						})}
					</dl>
				</div>
			</div>
		</section>
	);
};

CustomPropertiesSection.displayName = 'CustomPropertiesSection';

export default CustomPropertiesSection;
