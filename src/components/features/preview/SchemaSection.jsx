import { Fragment, memo } from 'react';
import Tag from '../../ui/Tag.jsx';
import Tooltip from '../../ui/Tooltip.jsx';
import LockClosedIcon from '../../ui/icons/LockClosedIcon.jsx';
import QuestionMarkCircleIcon from '../../ui/icons/QuestionMarkCircleIcon.jsx';
import { getQualityCheckIcon } from '../../ui/icons/QualityCheckIcons.jsx';
import AuthoritativeDefinitionsPreview from '../../ui/AuthoritativeDefinitionsPreview.jsx';
import CustomPropertiesPreview from '../../ui/CustomPropertiesPreview.jsx';
import {useEditorStore} from "../../../store.js";
import {useShallow} from "zustand/react/shallow";

// Custom comparison for schema property
const propertyAreEqual = (prevProps, nextProps) => {
	if (prevProps.property === nextProps.property &&
		prevProps.propertyName === nextProps.propertyName &&
		prevProps.schemaName === nextProps.schemaName &&
		prevProps.indent === nextProps.indent) {
		return true;
	}

	// Deep comparison for property object
	try {
		return JSON.stringify(prevProps.property) === JSON.stringify(nextProps.property) &&
			prevProps.propertyName === nextProps.propertyName &&
			prevProps.schemaName === nextProps.schemaName &&
			prevProps.indent === nextProps.indent;
	} catch {
		return false;
	}
};

// Memoized property row component
const SchemaProperty = memo(({ property, propertyName, schemaName, indent = 0 }) => {
	const indentSpaces = '    '.repeat(Math.max(0, indent - 1));
	const hasChildren = property.properties && Object.keys(property.properties).length > 0;

	return (
		<Fragment key={`${schemaName}-${propertyName}`}>
			<tr className="print:break-inside-avoid-page">
				<td className="py-2 pl-4 pr-2 text-sm font-medium text-gray-900 sm:pl-6 w-fit flex">
					<span>
						{indent > 0 && indentSpaces}
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
							{(property.physicalName && property.physicalName !== propertyName) && (
								<Tooltip content={`physicalName: ${property.physicalName}`}>
									<QuestionMarkCircleIcon className="size-3 ml-1 text-gray-400 hover:text-gray-500 cursor-help" />
								</Tooltip>
							)}
						</span>
					</div>
				</td>
				<td className="px-1 py-2 text-sm text-gray-500 w-fit">
					{property.logicalType && (
						<div
							className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 ring-1 ring-inset ring-blue-500/10 mr-1 mb-1">
							<span>{property.logicalType}</span>
						</div>
					)}
					{property.physicalType && (
						<div
							className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mb-1">
							<span>{property.physicalType}</span>
						</div>
					)}
					{!property.logicalType && !property.physicalType && property.type && (
						<div
							className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
							<span>{property.type}</span>
						</div>
					)}
				</td>
				<td className="px-3 py-2 text-sm text-gray-500">
					{property.description ? (
						<div>{property.description}</div>
					) : (
						<div className="text-gray-400">No description</div>
					)}

					{property.examples && property.examples.length > 0 && (
						<div className="mt-1 italic">
							{property.examples.length === 1 ? (
								<>Example: <span>{property.examples[0]}</span></>
							) : (
								<>Examples: <span>{property.examples.join(', ')}</span></>
							)}
						</div>
					)}

					<div className="mt-1 flex gap-x-1 items-center flex-wrap">
						{property.primaryKey && (
							<span
								className="inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
								primaryKey{property.primaryKeyPosition && ` (${property.primaryKeyPosition})`}
							</span>
						)}
						{property.required && (
							<span
								className="inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">required</span>
						)}
						{property.unique && (
							<span
								className="inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">unique</span>
						)}
						{property.partitioned && (
							<span
								className="inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
								partitioned{property.partitionKeyPosition && ` (${property.partitionKeyPosition})`}
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
								critical data element
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
											<div className="text-gray-300 font-medium">Transform Logic:</div>
											<div>{property.transformLogic}</div>
										</div>
									)}
									{property.transformDescription && (
										<div>
											<div className="text-gray-300 font-medium">Description:</div>
											<div>{property.transformDescription}</div>
										</div>
									)}
								</div>
							}>
								<span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 mr-1 mt-1">
									transformation
								</span>
							</Tooltip>
						)}
						<CustomPropertiesPreview properties={property.customProperties} pillClassName="mr-1 mt-1"/>
						{property.tags && Array.isArray(property.tags) && property.tags.map((tag, idx) => (
							<Tag key={idx} className="mr-1 mt-1">
								{tag}
							</Tag>
						))}
						{property.logicalTypeOptions?.format && (
							<Tooltip content={
								<div className="space-y-1">
									<div className="text-gray-300">Format: {property.logicalTypeOptions.format}</div>
									{property.logicalTypeOptions.minLength !== undefined && (
										<div className="text-gray-300">Min Length: {property.logicalTypeOptions.minLength}</div>
									)}
									{property.logicalTypeOptions.maxLength !== undefined && (
										<div className="text-gray-300">Max Length: {property.logicalTypeOptions.maxLength}</div>
									)}
									{property.logicalTypeOptions.pattern && (
										<div className="text-gray-300">Pattern: {property.logicalTypeOptions.pattern}</div>
									)}
									{property.logicalTypeOptions.minimum !== undefined && (
										<div className="text-gray-300">Minimum: {property.logicalTypeOptions.minimum}</div>
									)}
									{property.logicalTypeOptions.maximum !== undefined && (
										<div className="text-gray-300">Maximum: {property.logicalTypeOptions.maximum}</div>
									)}
									{property.logicalTypeOptions.exclusiveMinimum !== undefined && (
										<div className="text-gray-300">Exclusive Minimum: {property.logicalTypeOptions.exclusiveMinimum}</div>
									)}
									{property.logicalTypeOptions.exclusiveMaximum !== undefined && (
										<div className="text-gray-300">Exclusive Maximum: {property.logicalTypeOptions.exclusiveMaximum}</div>
									)}
									{property.logicalTypeOptions.multipleOf !== undefined && (
										<div className="text-gray-300">Multiple Of: {property.logicalTypeOptions.multipleOf}</div>
									)}
									{property.logicalTypeOptions.minItems !== undefined && (
										<div className="text-gray-300">Min Items: {property.logicalTypeOptions.minItems}</div>
									)}
									{property.logicalTypeOptions.maxItems !== undefined && (
										<div className="text-gray-300">Max Items: {property.logicalTypeOptions.maxItems}</div>
									)}
									{property.logicalTypeOptions.uniqueItems !== undefined && (
										<div className="text-gray-300">Unique Items: {property.logicalTypeOptions.uniqueItems ? 'Yes' : 'No'}</div>
									)}
									{property.logicalTypeOptions.minProperties !== undefined && (
										<div className="text-gray-300">Min Properties: {property.logicalTypeOptions.minProperties}</div>
									)}
									{property.logicalTypeOptions.maxProperties !== undefined && (
										<div className="text-gray-300">Max Properties: {property.logicalTypeOptions.maxProperties}</div>
									)}
									{property.logicalTypeOptions.required && Array.isArray(property.logicalTypeOptions.required) && (
										<div className="text-gray-300">Required: {property.logicalTypeOptions.required.join(', ')}</div>
									)}
									{property.logicalTypeOptions.timezone !== undefined && (
										<div className="text-gray-300">Timezone: {property.logicalTypeOptions.timezone ? 'Yes' : 'No'}</div>
									)}
									{property.logicalTypeOptions.defaultTimezone && (
										<div className="text-gray-300">Default Timezone: {property.logicalTypeOptions.defaultTimezone}</div>
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
									{qualityCheck.type && <div className="text-gray-300">Type: {qualityCheck.type}</div>}
									{qualityCheck.dimension &&
										<div className="text-gray-300">Dimension: {qualityCheck.dimension}</div>}
									{qualityCheck.metric &&
										<div className="text-gray-300">Metric: {qualityCheck.metric}</div>}
									{qualityCheck.mustBeGreaterThan !== undefined &&
										<div className="text-gray-300">Must be &gt; {qualityCheck.mustBeGreaterThan}</div>}
									{qualityCheck.mustBeLessThan !== undefined &&
										<div className="text-gray-300">Must be &lt; {qualityCheck.mustBeLessThan}</div>}
									{qualityCheck.mustBe !== undefined &&
										<div className="text-gray-300">Must be {qualityCheck.mustBe}</div>}
								</div>
							);

							return (
								<Tooltip key={qIdx} content={tooltipContent}>
									<span
										className="inline-flex items-center gap-1 rounded-md bg-fuchsia-50 px-2 py-1 text-xs font-medium text-fuchsia-700 ring-1 ring-inset ring-fuchsia-600/20 mr-1 mt-1">
										<QualityIcon className="w-3 h-3"/>
										{qualityCheck.name || 'Quality Check'}
									</span>
								</Tooltip>
							);
						})}
					</div>
				</td>
			</tr>
			{hasChildren && Object.entries(property.properties).map(([childName, childProp]) =>
				<SchemaProperty
					key={`${schemaName}-${propertyName}-${childName}`}
					property={childProp}
					propertyName={childName}
					schemaName={schemaName}
					indent={indent + 1}
				/>
			)}
		</Fragment>
	);
}, propertyAreEqual);

SchemaProperty.displayName = 'SchemaProperty';

// Custom comparison for schema table
const tableAreEqual = (prevProps, nextProps) => {
	if (prevProps.schemaName === nextProps.schemaName &&
		prevProps.schema === nextProps.schema) {
		return true;
	}

	// Deep comparison for schema object
	try {
		return prevProps.schemaName === nextProps.schemaName &&
			JSON.stringify(prevProps.schema) === JSON.stringify(nextProps.schema);
	} catch {
		return false;
	}
};

// Memoized schema table component
const SchemaTable = memo(({ schemaName, schema }) => {
	return (
		<div className="mt-3 print:block">
			<div className="overflow-x-auto shadow ring-1 ring-black/5 sm:rounded-lg">
				<table className="min-w-full divide-y divide-gray-300 print:relative print:break-inside-auto">
					<thead className="bg-gray-50 print:table-header-group">
						<tr className="print:break-inside-avoid-page">
							<th scope="colgroup" colSpan="3"
								className="py-2 pl-4 pr-3 text-left font-semibold text-gray-900 sm:pl-6">
								<span>{schema.title || schemaName}</span>
								{' '}
								<span className="font-mono font-medium">{schemaName}</span>
								{' '}
								{schema.type && (
									<span
										className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
										{schema.type}
									</span>
								)}
								{schema.description ? (
									<div className="text-sm font-normal text-gray-500">{schema.description}</div>
								) : (
									<div className="text-sm font-normal text-gray-400">No description</div>
								)}
								<CustomPropertiesPreview properties={schema.customProperties} pillClassName="mr-1 mt-1"/>
								{schema && schema.tags && schema.tags.length > 0 && (
									<div className="mt-1">
										{schema.tags.map((tag, idx) => (
											<Tag key={idx} className="mr-1 mt-1">
												{tag}
											</Tag>
										))}
									</div>
								)}
								{schema && schema.quality && schema.quality.length > 0 && (
									<div className="mt-2">
										{schema.quality.map((qualityCheck, idx) => {
											const QualityIcon = getQualityCheckIcon(qualityCheck.type);
											const tooltipContent = (
												<div className="space-y-1">
													{qualityCheck.description && <div>{qualityCheck.description}</div>}
													{qualityCheck.type &&
														<div className="text-gray-300">Type: {qualityCheck.type}</div>}
													{qualityCheck.dimension &&
														<div className="text-gray-300">Dimension: {qualityCheck.dimension}</div>}
													{qualityCheck.metric &&
														<div className="text-gray-300">Metric: {qualityCheck.metric}</div>}
												</div>
											);

											return (
												<Tooltip key={idx} content={tooltipContent}>
													<span
														className="inline-flex items-center gap-1 rounded-md bg-fuchsia-50 px-2 py-1 text-xs font-medium text-fuchsia-700 ring-1 ring-inset ring-fuchsia-600/20 mr-1 mt-1">
														<QualityIcon className="w-3 h-3"/>
														{qualityCheck.name || 'Quality Check'}
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
						{schema.properties && Object.values(schema.properties).map((property) =>
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
}, tableAreEqual);

SchemaTable.displayName = 'SchemaTable';

// Main SchemaSection component
const SchemaSection = () => {
	const schema = useEditorStore(useShallow(state => state.getValue('schema')));
	if (!schema || Object.keys(schema).length === 0) return null;

	return (
		<section id="schema">
			<div className="flex justify-between">
				<div className="px-4 sm:px-0">
					<h1 className="text-base font-semibold leading-6 text-gray-900">Schema</h1>
					<p className="text-sm text-gray-500">Schema supports both a business representation and physical
						implementation</p>
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
