import {Fragment, memo} from 'react';
import {useTranslation} from 'react-i18next';
import Tags from '../../ui/Tags.jsx';
import Tooltip from '../../ui/Tooltip.jsx';
import LockClosedIcon from '../../ui/icons/LockClosedIcon.jsx';
import CodeBracketIcon from '../../ui/icons/CodeBracketIcon.jsx';
import {getQualityCheckIcon} from '../../ui/icons/QualityCheckIcons.jsx';
import AuthoritativeDefinitionsPreview from '../../ui/AuthoritativeDefinitionsPreview.jsx';
import CustomPropertiesPreview from '../../ui/CustomPropertiesPreview.jsx';
import {useEditorStore} from "../../../store.js";
import {useShallow} from "zustand/react/shallow";
import {useCustomization, useHiddenCustomPropertyNames} from "../../../hooks/useCustomization.js";
import {useInheritedDefinition} from "../../../hooks/useInheritedDefinition.js";

// Memoized property row component
const SchemaProperty = ({ property, propertyName, schemaName, indent = 0 }) => {
	const { t } = useTranslation();
	const hiddenNames = useHiddenCustomPropertyNames('schema.properties');
	const { customProperties: customPropertyConfigs } = useCustomization('schema.properties');
	const { definitionData: propDefinition } = useInheritedDefinition(property?.authoritativeDefinitions);
	const hasChildren = property.properties && Array.isArray(property.properties) && property.properties.length > 0;

	return (
		<Fragment key={`${schemaName}-${propertyName}`}>
			<tr className="print:break-inside-avoid-page">
				<td className="py-2 pl-4 pr-2 text-sm font-medium text-gray-900 sm:pl-6 w-fit flex">
					<span style={{ paddingLeft: `${Math.max(0, indent - 1) * 1.25}rem` }}>
						{indent > 0 && <span className="mr-1">↳</span>}
					</span>
					<div>
						{property.businessName && (
							<>
								<span>{property.businessName}</span>
								<br/>
							</>
						)}
						<span className="font-mono">{propertyName}
							{property.physicalName && (
								<Tooltip content={property.physicalName}>
									<CodeBracketIcon className="size-3 ml-1 text-gray-400 hover:text-gray-500 cursor-help" />
								</Tooltip>
							)}
						</span>
					</div>
				</td>
				<td className="px-1 py-2 text-sm text-gray-500 w-fit">
					{(() => {
						const effectiveLogicalType = property.logicalType || propDefinition?.logicalType;
						const isLogicalTypeInherited = !property.logicalType && !!propDefinition?.logicalType;
						return (
							<>
								{effectiveLogicalType && (
									<div
										className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 ring-1 ring-inset ring-blue-500/10 mr-1 mb-1"
										{...(isLogicalTypeInherited ? { title: t('preview.schema.inheritedFromSemantic') } : {})}>
										<span>{effectiveLogicalType}</span>
									</div>
								)}
								{property.physicalType && (
									<div
										className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mb-1">
										<span>{property.physicalType}</span>
									</div>
								)}
								{!effectiveLogicalType && !property.physicalType && property.type && (
									<div
										className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
										<span>{property.type}</span>
									</div>
								)}
							</>
						);
					})()}
				</td>
				<td className="px-3 py-2 text-sm text-gray-500">
					{property.description ? (
						<div>{property.description}</div>
					) : propDefinition?.description ? (
						<div className="text-blue-400" title={t('preview.schema.inheritedFromSemantic')}>{propDefinition.description}</div>
					) : (
						<div className="text-gray-400">{t('preview.schema.noDescription')}</div>
					)}

					{(() => {
						const hasOwnExamples = property.examples && property.examples.length > 0;
						const examples = hasOwnExamples ? property.examples : propDefinition?.examples;
						const isExamplesInherited = !hasOwnExamples && examples && examples.length > 0;
						if (!examples || examples.length === 0) return null;
						return (
							<div
								className={`mt-1 italic${isExamplesInherited ? ' text-blue-400' : ''}`}
								{...(isExamplesInherited ? { title: t('preview.schema.inheritedFromSemantic') } : {})}>
								{examples.length === 1 ? (
									<>{t('preview.schema.example')} <span>{examples[0]}</span></>
								) : (
									<>{t('preview.schema.examples')} <span>{examples.join(', ')}</span></>
								)}
							</div>
						);
					})()}

					<div className="mt-1 flex gap-x-1 items-center flex-wrap">
						{property.primaryKey && (
							<span
								className="inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
								{t('preview.schema.primaryKey')}{property.primaryKeyPosition && ` (${property.primaryKeyPosition})`}
							</span>
						)}
						{property.required && (
							<span
								className="inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">{t('preview.schema.required')}</span>
						)}
						{property.unique && (
							<span
								className="inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">{t('preview.schema.unique')}</span>
						)}
						{property.partitioned && (
							<span
								className="inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
								{t('preview.schema.partitioned')}{property.partitionKeyPosition && ` (${property.partitionKeyPosition})`}
							</span>
						)}
						{property.authoritativeDefinitions && property.authoritativeDefinitions.length > 0 && (
							<AuthoritativeDefinitionsPreview definitions={property.authoritativeDefinitions} className='size-4' buttonRadius="rounded-md" />
						)}
						{property.classification && (
							<span
								className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-1 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
								{property.classification.toLowerCase() !== 'public' && <LockClosedIcon className="w-3 h-3"/>}
								{property.classification}
							</span>
						)}
						{property.criticalDataElement && (
							<span
								className="inline-flex items-center rounded-md bg-red-50 px-1 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-700/10">
								{t('preview.schema.criticalDataElement')}
							</span>
						)}
						{property.encryptedName && (
							<span
								className="inline-flex items-center rounded-md bg-purple-50 px-1 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
								{property.encryptedName}
							</span>
						)}
						{(property.transformLogic || property.transformDescription) && (
							<Tooltip content={
								<div className="space-y-1">
									{property.transformLogic && (
										<div>
											<div className="text-gray-300 font-medium">{t('preview.schema.transformLogic')}</div>
											<div>{property.transformLogic}</div>
										</div>
									)}
									{property.transformDescription && (
										<div>
											<div className="text-gray-300 font-medium">{t('preview.schema.transformDescription')}</div>
											<div>{property.transformDescription}</div>
										</div>
									)}
								</div>
							}>
								<span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 mr-1 mt-1">
									{t('preview.schema.transformation')}
								</span>
							</Tooltip>
						)}
						<CustomPropertiesPreview properties={property.customProperties} pillClassName="mr-1 mt-1" hiddenPropertyNames={hiddenNames} customPropertyConfigs={customPropertyConfigs}/>
            {property.tags && Array.isArray(property.tags) && <Tags tags={property.tags}/>}
						{property.logicalTypeOptions?.format && (
							<Tooltip content={
								<div className="space-y-1">
									<div className="text-gray-300">{t('preview.schema.format', { value: property.logicalTypeOptions.format })}</div>
									{property.logicalTypeOptions.minLength !== undefined && (
										<div className="text-gray-300">{t('preview.schema.minLength', { value: property.logicalTypeOptions.minLength })}</div>
									)}
									{property.logicalTypeOptions.maxLength !== undefined && (
										<div className="text-gray-300">{t('preview.schema.maxLength', { value: property.logicalTypeOptions.maxLength })}</div>
									)}
									{property.logicalTypeOptions.pattern && (
										<div className="text-gray-300">{t('preview.schema.pattern', { value: property.logicalTypeOptions.pattern })}</div>
									)}
									{property.logicalTypeOptions.minimum !== undefined && (
										<div className="text-gray-300">{t('preview.schema.minimum', { value: property.logicalTypeOptions.minimum })}</div>
									)}
									{property.logicalTypeOptions.maximum !== undefined && (
										<div className="text-gray-300">{t('preview.schema.maximum', { value: property.logicalTypeOptions.maximum })}</div>
									)}
									{property.logicalTypeOptions.exclusiveMinimum !== undefined && (
										<div className="text-gray-300">{t('preview.schema.exclusiveMinimum', { value: property.logicalTypeOptions.exclusiveMinimum })}</div>
									)}
									{property.logicalTypeOptions.exclusiveMaximum !== undefined && (
										<div className="text-gray-300">{t('preview.schema.exclusiveMaximum', { value: property.logicalTypeOptions.exclusiveMaximum })}</div>
									)}
									{property.logicalTypeOptions.multipleOf !== undefined && (
										<div className="text-gray-300">{t('preview.schema.multipleOf', { value: property.logicalTypeOptions.multipleOf })}</div>
									)}
									{property.logicalTypeOptions.minItems !== undefined && (
										<div className="text-gray-300">{t('preview.schema.minItems', { value: property.logicalTypeOptions.minItems })}</div>
									)}
									{property.logicalTypeOptions.maxItems !== undefined && (
										<div className="text-gray-300">{t('preview.schema.maxItems', { value: property.logicalTypeOptions.maxItems })}</div>
									)}
									{property.logicalTypeOptions.uniqueItems !== undefined && (
										<div className="text-gray-300">{t('preview.schema.uniqueItems', { value: property.logicalTypeOptions.uniqueItems ? t('preview.schema.yes') : t('preview.schema.no') })}</div>
									)}
									{property.logicalTypeOptions.minProperties !== undefined && (
										<div className="text-gray-300">{t('preview.schema.minProperties', { value: property.logicalTypeOptions.minProperties })}</div>
									)}
									{property.logicalTypeOptions.maxProperties !== undefined && (
										<div className="text-gray-300">{t('preview.schema.maxProperties', { value: property.logicalTypeOptions.maxProperties })}</div>
									)}
									{property.logicalTypeOptions.required && Array.isArray(property.logicalTypeOptions.required) && (
										<div className="text-gray-300">{t('preview.schema.requiredList', { value: property.logicalTypeOptions.required.join(', ') })}</div>
									)}
									{property.logicalTypeOptions.timezone !== undefined && (
										<div className="text-gray-300">{t('preview.schema.timezone', { value: property.logicalTypeOptions.timezone ? t('preview.schema.yes') : t('preview.schema.no') })}</div>
									)}
									{property.logicalTypeOptions.defaultTimezone && (
										<div className="text-gray-300">{t('preview.schema.defaultTimezone', { value: property.logicalTypeOptions.defaultTimezone })}</div>
									)}
								</div>
							}>
								<span className="inline-flex items-center rounded-md bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700 ring-1 ring-inset ring-sky-600/20 mr-1 mt-1">
									{property.logicalTypeOptions.format}
								</span>
							</Tooltip>
						)}
						{property.quality && Array.isArray(property.quality) && property.quality.map((qualityCheck, qIdx) => {
							const QualityIcon = getQualityCheckIcon(qualityCheck.type);
							const tooltipContent = (
								<div className="space-y-1">
									{qualityCheck.description && <div>{qualityCheck.description}</div>}
									{qualityCheck.type && <div className="text-gray-300">{t('preview.schema.qualityType', { value: qualityCheck.type })}</div>}
									{qualityCheck.dimension &&
										<div className="text-gray-300">{t('preview.schema.qualityDimension', { value: qualityCheck.dimension })}</div>}
									{qualityCheck.metric &&
										<div className="text-gray-300">{t('preview.schema.qualityMetric', { value: qualityCheck.metric })}</div>}
									{qualityCheck.mustBeGreaterThan !== undefined &&
										<div className="text-gray-300">{t('preview.schema.mustBeGreaterThan', { value: qualityCheck.mustBeGreaterThan })}</div>}
									{qualityCheck.mustBeLessThan !== undefined &&
										<div className="text-gray-300">{t('preview.schema.mustBeLessThan', { value: qualityCheck.mustBeLessThan })}</div>}
									{qualityCheck.mustBe !== undefined &&
										<div className="text-gray-300">{t('preview.schema.mustBe', { value: qualityCheck.mustBe })}</div>}
								</div>
							);

							return (
								<Tooltip key={qIdx} content={tooltipContent}>
									<span
										className="inline-flex items-center gap-1 rounded-md bg-fuchsia-50 px-2 py-1 text-xs font-medium text-fuchsia-700 ring-1 ring-inset ring-fuchsia-600/20 mr-1 mt-1">
										<QualityIcon className="w-3 h-3"/>
										{qualityCheck.name || t('preview.schema.qualityCheck')}
									</span>
								</Tooltip>
							);
						})}
					</div>
				</td>
			</tr>
			{hasChildren && property.properties.map((childProp, index) =>
				<SchemaProperty
					key={`${schemaName}-${propertyName}-${childProp?.name || index}`}
					property={childProp}
					propertyName={childProp?.name}
					schemaName={schemaName}
					indent={indent + 1}
				/>
			)}
		</Fragment>
	);
};

SchemaProperty.displayName = 'SchemaProperty';

const SchemaTable = memo(({ schemaName, schema }) => {
	const { t } = useTranslation();
	const hiddenNames = useHiddenCustomPropertyNames('schema');
	const { customProperties: customPropertyConfigs } = useCustomization('schema');
	const { definitionData: schemaDefinition } = useInheritedDefinition(schema?.authoritativeDefinitions);
	return (
		<div className="mt-3 print:block">
			<div className="overflow-x-auto shadow ring-1 ring-black/5 sm:rounded-lg">
				<table className="min-w-full divide-y divide-gray-300 print:relative print:break-inside-auto">
					<thead className="bg-gray-50 print:table-header-group">
					<tr className="print:break-inside-avoid-page">
						<th scope="colgroup" colSpan="3"
								className="py-2 pl-4 pr-3 text-left font-semibold text-gray-900 sm:pl-6">
							{schema.businessName && schema.businessName !== schemaName && (
								<>
									<span>{schema.businessName}</span>
									{' '}
								</>
							)}
							<span className="font-mono font-medium">{schemaName}
								{schema.physicalName && (
									<Tooltip content={schema.physicalName}>
										<CodeBracketIcon className="size-3 ml-1 text-gray-400 hover:text-gray-500 cursor-help" />
									</Tooltip>
								)}
							</span>
							{' '}
							{schema.type && (
								<span
									className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
										{schema.type}
									</span>
							)}
							{schema.description ? (
								<div className="text-sm font-normal text-gray-500">{schema.description}</div>
							) : schemaDefinition?.description ? (
								<div className="text-sm font-normal text-blue-400" title={t('preview.schema.inheritedFromSemantic')}>{schemaDefinition.description}</div>
							) : (
								<div className="text-sm font-normal text-gray-400">{t('preview.schema.noDescription')}</div>
							)}
							<CustomPropertiesPreview properties={schema.customProperties} pillClassName="mr-1 mt-1" hiddenPropertyNames={hiddenNames} customPropertyConfigs={customPropertyConfigs}/>
              {schema && schema.tags && schema.tags.length > 0 && <Tags tags={schema.tags}/>}
							{schema && schema.quality && schema.quality.length > 0 && (
								<div className="mt-2">
									{schema.quality.map((qualityCheck, idx) => {
										const QualityIcon = getQualityCheckIcon(qualityCheck.type);
										const tooltipContent = (
											<div className="space-y-1">
												{qualityCheck.description && <div>{qualityCheck.description}</div>}
												{qualityCheck.type &&
													<div className="text-gray-300">{t('preview.schema.qualityType', { value: qualityCheck.type })}</div>}
												{qualityCheck.dimension &&
													<div className="text-gray-300">{t('preview.schema.qualityDimension', { value: qualityCheck.dimension })}</div>}
												{qualityCheck.metric &&
													<div className="text-gray-300">{t('preview.schema.qualityMetric', { value: qualityCheck.metric })}</div>}
											</div>
										);

										return (
											<Tooltip key={idx} content={tooltipContent}>
													<span
														className="inline-flex items-center gap-1 rounded-md bg-fuchsia-50 px-2 py-1 text-xs font-medium text-fuchsia-700 ring-1 ring-inset ring-fuchsia-600/20 mr-1 mt-1">
														<QualityIcon className="w-3 h-3"/>
														{qualityCheck.name || t('preview.schema.qualityCheck')}
													</span>
											</Tooltip>
										);
									})}
								</div>
							)}
						</th>
					</tr>
					</thead>
					<tbody className="divide-y divide-gray-200 bg-white">
					{schema.properties && Array.isArray(schema.properties) && schema.properties.map((property) =>
						<SchemaProperty
							key={`${schemaName}-${property?.name}`}
							property={property}
							propertyName={property?.name}
							schemaName={schemaName}
							indent={0}
						/>
					)}
					</tbody>
				</table>
			</div>
		</div>
	);
}, (prevProps, nextProps) => (
	JSON.stringify(prevProps.schema) === JSON.stringify(nextProps.schema)
));

SchemaTable.displayName = 'SchemaTable';

// Main SchemaSection component
const SchemaSection = () => {
	const { t } = useTranslation();
	const schema = useEditorStore(useShallow(state => state.getValue('schema')));
	if (!schema || Object.keys(schema).length === 0) return null;

	return (
		<section id="schema">
			<div className="flex justify-between">
				<div className="px-4 sm:px-0">
					<h1 className="text-base font-semibold leading-6 text-gray-900">{t('preview.schema.heading')}</h1>
					<p className="text-sm text-gray-500">{t('preview.schema.description')}</p>
				</div>
			</div>

			{schema.map((schemaData) => (
				<SchemaTable
					key={schemaData?.name}
					schemaName={schemaData?.name}
					schema={schemaData}
				/>
			))}
		</section>
	);
}

SchemaSection.displayName = 'SchemaSection';

export default SchemaSection;
