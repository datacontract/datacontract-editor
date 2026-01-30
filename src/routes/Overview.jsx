import { useMemo, useCallback } from 'react';
import { useEditorStore } from '../store.js';
import { ValidatedCombobox } from '../components/ui/index.js';
import AuthoritativeDefinitionsEditor from '../components/ui/AuthoritativeDefinitionsEditor.jsx';
import ValidatedInput from '../components/ui/ValidatedInput.jsx';
import Tooltip from '../components/ui/Tooltip.jsx';
import Tags from '../components/ui/Tags.jsx';
import QuestionMarkCircleIcon from '../components/ui/icons/QuestionMarkCircleIcon.jsx';
import { useShallow } from "zustand/react/shallow";
import { useCustomization, useStandardPropertyOverride, useIsPropertyHidden, convertEnumToOptions } from '../hooks/useCustomization.js';
import { CustomSections, UngroupedCustomProperties } from '../components/ui/CustomSection.jsx';

const Overview = () => {
	const id = useEditorStore(useShallow((state) => state.getValue('id')));
	const name = useEditorStore(useShallow((state) => state.getValue('name')));
	const version = useEditorStore(useShallow((state) => state.getValue('version')));
	const dataProduct = useEditorStore(useShallow((state) => state.getValue('dataProduct')));
	const status = useEditorStore(useShallow((state) => state.getValue('status')));
	const domain = useEditorStore(useShallow((state) => state.getValue('domain')));
	const tenant = useEditorStore(useShallow((state) => state.getValue('tenant')));
	const tags = useEditorStore(useShallow((state) => state.getValue('tags')));
	const authoritativeDefinitions = useEditorStore(useShallow((state) => state.getValue('authoritativeDefinitions')));
	const customProperties = useEditorStore(useShallow((state) => state.getValue('customProperties'))) || [];
	const yamlParts = useEditorStore((state) => state.yamlParts);

	const setValue = useEditorStore((state) => state.setValue);
	const setId = (newValue) => setValue('id', newValue);
	const setName = (newValue) => setValue('name', newValue);
	const setVersion = (newValue) => setValue('version', newValue);
	const setDataProduct = (newValue) => setValue('dataProduct', newValue);
	const setStatus = (newValue) => setValue('status', newValue);
	const setDomain = (newValue) => setValue('domain', newValue);
	const setTenant = (newValue) => setValue('tenant', newValue);
	const setTags = (key, newValue) => setValue(key, newValue);
	const setAuthoritativeDefinitions = (newValue) => setValue('authoritativeDefinitions', newValue);

	const editorConfig = useEditorStore((state) => state.editorConfig);

	// Get customization config for root level
	const { customProperties: customPropertyConfigs, customSections } = useCustomization('root');

	// Check hidden status for each standard property
	const isNameHidden = useIsPropertyHidden('root', 'name');
	const isVersionHidden = useIsPropertyHidden('root', 'version');
	const isDataProductHidden = useIsPropertyHidden('root', 'dataProduct');
	const isIdHidden = useIsPropertyHidden('root', 'id');
	const isStatusHidden = useIsPropertyHidden('root', 'status');
	const isDomainHidden = useIsPropertyHidden('root', 'domain');
	const isTenantHidden = useIsPropertyHidden('root', 'tenant');
	const isTagsHidden = useIsPropertyHidden('root', 'tags');

	// Get overrides for standard properties
	const nameOverride = useStandardPropertyOverride('root', 'name');
	const versionOverride = useStandardPropertyOverride('root', 'version');
	const dataProductOverride = useStandardPropertyOverride('root', 'dataProduct');
	const idOverride = useStandardPropertyOverride('root', 'id');
	const statusOverride = useStandardPropertyOverride('root', 'status');
	const domainOverride = useStandardPropertyOverride('root', 'domain');
	const tenantOverride = useStandardPropertyOverride('root', 'tenant');
	const tagsOverride = useStandardPropertyOverride('root', 'tags');

	// Default status options (can be overridden by customization)
	const defaultStatusOptions = [
		{ id: 'draft', name: 'draft' },
		{ id: 'proposed', name: 'proposed' },
		{ id: 'in development', name: 'in development' },
		{ id: 'active', name: 'active' },
		{ id: 'deprecated', name: 'deprecated' },
		{ id: 'retired', name: 'retired' }
	];

	// Apply status override
	const statusOptions = useMemo(() => {
		if (statusOverride?.enum) {
			return convertEnumToOptions(statusOverride.enum);
		}
		return defaultStatusOptions;
	}, [statusOverride]);

	// Apply domain override
	const domainOptions = useMemo(() => {
		if (domainOverride?.enum) {
			return convertEnumToOptions(domainOverride.enum);
		}
		if (editorConfig?.domains && editorConfig.domains.length > 0) {
			return editorConfig.domains;
		}
		return null;
	}, [domainOverride, editorConfig?.domains]);

	// Apply tenant override
	const tenantOptions = useMemo(() => {
		if (tenantOverride?.enum) {
			return convertEnumToOptions(tenantOverride.enum);
		}
		return null;
	}, [tenantOverride]);

	// Convert array format to object lookup for UI components
	const customPropertiesLookup = useMemo(() => {
		if (!Array.isArray(customProperties)) return customProperties || {};
		return customProperties.reduce((acc, item) => {
			if (item?.property !== undefined) {
				acc[item.property] = item.value;
			}
			return acc;
		}, {});
	}, [customProperties]);

	// Handle custom property changes - stores as array format per ODCS standard
	const updateCustomProperty = useCallback((property, value) => {
		// Convert object format to array format if needed
		let currentArray;
		if (Array.isArray(customProperties)) {
			currentArray = customProperties;
		} else if (customProperties && typeof customProperties === 'object') {
			// Convert object {key: value} to array [{property, value}]
			currentArray = Object.entries(customProperties).map(([k, v]) => ({ property: k, value: v }));
		} else {
			currentArray = [];
		}

		if (value === undefined) {
			// Remove property
			const updated = currentArray.filter(item => item.property !== property);
			setValue('customProperties', updated.length > 0 ? updated : undefined);
		} else {
			// Update or add property
			const existingIndex = currentArray.findIndex(item => item.property === property);
			if (existingIndex >= 0) {
				const updated = [...currentArray];
				updated[existingIndex] = { property, value };
				setValue('customProperties', updated);
			} else {
				setValue('customProperties', [...currentArray, { property, value }]);
			}
		}
	}, [customProperties, setValue]);

	// Build context for condition evaluation
	const rootContext = useMemo(() => ({
		id, name, version, dataProduct, status, domain, tenant, tags,
		...customPropertiesLookup,
	}), [id, name, version, dataProduct, status, domain, tenant, tags, customPropertiesLookup]);

	return (
		<div className="h-full flex flex-col bg-white">
			<div className="flex-1 overflow-y-auto p-4">
				<div className="space-y-4">

					{/* Fundamentals Section */}
					<div>
						<h3 className="text-base font-semibold leading-6 text-gray-900 mb-3">Fundamentals</h3>

						<div className="space-y-4">
							<div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
								{/* Name Field */}
								{!isNameHidden && (
									<ValidatedInput
										name="name"
										label={nameOverride?.title || "Name"}
										value={name}
										onChange={(e) => setName(e.target.value)}
										required={nameOverride?.required ?? true}
										tooltip={nameOverride?.description || "The name of the data contract"}
										placeholder={nameOverride?.placeholder || "Enter document name"}
										externalErrors={[]}
										data-1p-ignore
									/>
								)}

								{/* Version Field */}
								{!isVersionHidden && (
									<ValidatedInput
										name="version"
										label={versionOverride?.title || "Version"}
										value={version}
										onChange={(e) => setVersion(e.target.value)}
										required={versionOverride?.required ?? true}
										tooltip={versionOverride?.description || "Version number using semantic versioning"}
										placeholder={versionOverride?.placeholder || "1.0.0"}
										externalErrors={[]}
									/>
								)}

								{/* ID Field */}
								{!isIdHidden && (
									<ValidatedInput
										name="id"
										label={idOverride?.title || "ID"}
										value={id}
										onChange={(e) => setId(e.target.value)}
										required={idOverride?.required ?? true}
										tooltip={idOverride?.description || "Unique identifier for this data contract"}
										placeholder={idOverride?.placeholder || "unique-identifier"}
										externalErrors={[]}
									/>
								)}

								{/* Status Field */}
								{!isStatusHidden && (
									<ValidatedCombobox
										name="status"
										label={statusOverride?.title || "Status"}
										options={statusOptions}
										value={status}
										onChange={(selectedValue) => setStatus(selectedValue || '')}
										placeholder={statusOverride?.placeholder || "Select a status..."}
										acceptAnyInput={!statusOverride?.enum}
										required={statusOverride?.required ?? true}
										tooltip={statusOverride?.description || "Current status of the data contract"}
										externalErrors={[]}
									/>
								)}

								{/* Tenant Field */}
								{!isTenantHidden && (
									<ValidatedCombobox
										name="tenant"
										label={tenantOverride?.title || "Tenant"}
										options={tenantOptions || []}
										value={tenant}
										onChange={(selectedValue) => setTenant(selectedValue || undefined)}
										placeholder={tenantOverride?.placeholder || "company-A"}
										acceptAnyInput={!tenantOverride?.enum}
										required={tenantOverride?.required ?? false}
										tooltip={tenantOverride?.description || "Tenant or organization this contract belongs to"}
										externalErrors={[]}
									/>
								)}

								{/* Domain Field */}
								{!isDomainHidden && (
									<ValidatedCombobox
										name="domain"
										label={domainOverride?.title || "Domain"}
										options={domainOptions || []}
										value={domain}
										onChange={(selectedValue) => setDomain(selectedValue || undefined)}
										placeholder={domainOverride?.placeholder || "Select a domain..."}
										acceptAnyInput={!domainOverride?.enum}
										required={domainOverride?.required ?? false}
										tooltip={domainOverride?.description || "Business domain or category of this data contract"}
										externalErrors={[]}
									/>
								)}

								{/* Data Product Field */}
								{!isDataProductHidden && (
									<ValidatedInput
										name="dataProduct"
										label={dataProductOverride?.title || "Data Product"}
										value={dataProduct}
										onChange={(e) => setDataProduct(e.target.value)}
										required={dataProductOverride?.required ?? false}
										tooltip={dataProductOverride?.description || "Data product identifier or name"}
										placeholder={dataProductOverride?.placeholder || "Enter data product"}
										externalErrors={[]}
									/>
								)}

								{/* Tags Field */}
								{!isTagsHidden && (
									<div className="sm:col-span-2">
										<Tags
											label={tagsOverride?.title || "Tags"}
											value={tags}
											onChange={(value) => setTags('tags', value)}
											tooltip={tagsOverride?.description || "Categorize your data contract with tags"}
											placeholder={tagsOverride?.placeholder || "Add a tag..."}
										/>
									</div>
								)}

								{/* Top-level Authoritative Definitions */}
								<div className="sm:col-span-2">
									<AuthoritativeDefinitionsEditor
										value={authoritativeDefinitions}
										onChange={(value) => setAuthoritativeDefinitions(value)}
									/>
								</div>
							</div>
						</div>
					</div>

					{/* Custom Sections */}
					{customSections.length > 0 && (
						<div className="space-y-1.5">
							<CustomSections
								customSections={customSections}
								customProperties={customPropertyConfigs}
								values={customPropertiesLookup}
								onPropertyChange={updateCustomProperty}
								context={rootContext}
								yamlParts={yamlParts}
							/>
						</div>
					)}

					{/* Ungrouped Custom Properties */}
					<UngroupedCustomProperties
						customProperties={customPropertyConfigs}
						customSections={customSections}
						values={customPropertiesLookup}
						onPropertyChange={updateCustomProperty}
						context={rootContext}
						yamlParts={yamlParts}
					/>

				</div>
			</div>
		</div>
	);
};

export default Overview;
