import { memo } from 'react';
import Tooltip from '../../ui/Tooltip.jsx';
import PropertyValueRenderer from '../../ui/PropertyValueRenderer.jsx';
import QuestionMarkCircleIcon from '../../ui/icons/QuestionMarkCircleIcon.jsx';

const CustomPropertiesSection = memo(({ customProperties }) => {
	if (!customProperties || customProperties.length === 0) return null;

	return (
		<section className="print:break-before-page">
			<div className="px-4 sm:px-0">
				<h1 className="text-base font-semibold leading-6 text-gray-900" id="customProperties">Custom
					Properties</h1>
				<p className="text-sm text-gray-500">This section covers other properties you may find in a data
					contract.</p>
			</div>
			<div className="mt-2 overflow-hidden print:overflow-auto bg-white shadow sm:rounded-lg">
				<div className="border-t border-gray-100">
					<dl className="divide-y divide-gray-100 text-sm break-all print:break-inside-avoid">
						{customProperties.map((property, index) => (
							<div key={index} className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
								<dt className="text-sm font-medium text-gray-900 flex items-center gap-1">
									{property.property}
									{property.description && (
										<Tooltip content={property.description}>
											<QuestionMarkCircleIcon />
										</Tooltip>
									)}
								</dt>
								<dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
									<PropertyValueRenderer value={property.value}/>
								</dd>
							</div>
						))}
					</dl>
				</div>
			</div>
		</section>
	);
});

CustomPropertiesSection.displayName = 'CustomPropertiesSection';

export default CustomPropertiesSection;
