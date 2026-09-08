import {useCallback, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {Popover, PopoverButton, PopoverPanel} from '@headlessui/react';
import {useEditorStore} from '../store.js';
import {isSafeKey} from '../utils/safeProperty.js';
import {ValidatedCombobox} from '../components/ui/index.js';
import AuthoritativeDefinitionsEditor from '../components/ui/AuthoritativeDefinitionsEditor.jsx';
import ValidatedInput from '../components/ui/ValidatedInput.jsx';
import TagsInput from '../components/ui/TagsInput.jsx';
import {useShallow} from "zustand/react/shallow";
import {
  convertEnumToOptions,
  useCustomization,
  useIsPropertyHidden,
  useStandardPropertyOverride
} from '../hooks/useCustomization.js';
import {CustomSections, UngroupedCustomProperties} from '../components/ui/CustomSection.jsx';
import {compareApiVersions} from '../lib/apiVersion.js';
import {odcsUpgradeSteps, upgradeOdcsDocument} from '../lib/odcsMigrations.js';
import {useOdcsVersions} from '../hooks/useSchemaCapability.js';

const Overview = () => {
	const { t } = useTranslation();
	const apiVersion = useEditorStore(useShallow((state) => state.getValue('apiVersion')));
	const id = useEditorStore(useShallow((state) => state.getValue('id')));
	const name = useEditorStore(useShallow((state) => state.getValue('name')));
	const version = useEditorStore(useShallow((state) => state.getValue('version')));
	const status = useEditorStore(useShallow((state) => state.getValue('status')));
	const domain = useEditorStore(useShallow((state) => state.getValue('domain')));
	const tenant = useEditorStore(useShallow((state) => state.getValue('tenant')));
	const tags = useEditorStore(useShallow((state) => state.getValue('tags')));
	const authoritativeDefinitions = useEditorStore(useShallow((state) => state.getValue('authoritativeDefinitions')));
	const customProperties = useEditorStore(useShallow((state) => state.getValue('customProperties'))) || [];
	const yamlParts = useEditorStore((state) => state.yamlParts);

	const getValue = useEditorStore((state) => state.getValue);
	const setValue = useEditorStore((state) => state.setValue);
	const setId = (newValue) => setValue('id', newValue);
	const setName = (newValue) => setValue('name', newValue);
	const setVersion = (newValue) => setValue('version', newValue);
	const setStatus = (newValue) => setValue('status', newValue);
	const setDomain = (newValue) => setValue('domain', newValue);
	const setTenant = (newValue) => setValue('tenant', newValue);
	const setTags = (key, newValue) => setValue(key, newValue);
	const setAuthoritativeDefinitions = (newValue) => setValue('authoritativeDefinitions', newValue);

	const editorConfig = useEditorStore((state) => state.editorConfig);

	// Data products that reference this contract via a port lock the ID: renaming it would break the
	// ODPS contractId references and external URLs pointing at this contract.
	const dataProductsUsingContract = editorConfig.dataProductsUsingContract || [];
	const isIdLocked = dataProductsUsingContract.length > 0;

	// Get customization config for root level
	const { customProperties: customPropertyConfigs, customSections } = useCustomization('root');

	// Check hidden status for each standard property
	const isApiVersionHidden = useIsPropertyHidden('root', 'apiVersion');
	const isNameHidden = useIsPropertyHidden('root', 'name');
	const isVersionHidden = useIsPropertyHidden('root', 'version');
	const isIdHidden = useIsPropertyHidden('root', 'id');
	const isStatusHidden = useIsPropertyHidden('root', 'status');
	const isDomainHidden = useIsPropertyHidden('root', 'domain');
	const isTenantHidden = useIsPropertyHidden('root', 'tenant');
	const isTagsHidden = useIsPropertyHidden('root', 'tags');

	// Get overrides for standard properties
	const apiVersionOverride = useStandardPropertyOverride('root', 'apiVersion');
	const nameOverride = useStandardPropertyOverride('root', 'name');

	// The ODCS version is a pick from what the host supports (its odcsVersions list, or what a
	// single schema accepts), never typed: a value outside it fails validation on every save. Only
	// the document's own version and newer ones are offered, since the migrations an upgrade applies
	// (see upgradeOdcsDocument) have no reverse.
	const documentApiVersion = typeof apiVersion === 'string' && apiVersion.trim() ? apiVersion.trim() : '';
	const { versions: supportedApiVersions, defaultVersion: defaultApiVersion } = useOdcsVersions();
	const apiVersionOptions = useMemo(() => {
		const accepted = (apiVersionOverride?.enum
			? convertEnumToOptions(apiVersionOverride.enum).map((o) => o.id)
			: supportedApiVersions
		).filter((v) => !documentApiVersion || compareApiVersions(v, documentApiVersion) >= 0);
		const withCurrent = documentApiVersion && !accepted.includes(documentApiVersion)
			? [documentApiVersion, ...accepted]
			: accepted;
		return withCurrent
			.slice()
			.sort((a, b) => compareApiVersions(b, a))
			.map((v) => ({ id: v, name: v }));
	}, [apiVersionOverride, supportedApiVersions, documentApiVersion]);
	const isApiVersionBehind = Boolean(
		documentApiVersion && defaultApiVersion && compareApiVersions(documentApiVersion, defaultApiVersion) < 0
	);
	const apiVersionUpgradeSteps = isApiVersionBehind ? odcsUpgradeSteps(documentApiVersion, defaultApiVersion) : [];
	const setApiVersion = (chosen) => {
		if (!chosen || chosen === documentApiVersion) return;
		if (!documentApiVersion) {
			setValue('apiVersion', chosen);
			return;
		}
		upgradeOdcsDocument({ getValue, setValue }, documentApiVersion, chosen);
	};
	const versionOverride = useStandardPropertyOverride('root', 'version');
	const idOverride = useStandardPropertyOverride('root', 'id');
	const statusOverride = useStandardPropertyOverride('root', 'status');
	const domainOverride = useStandardPropertyOverride('root', 'domain');
	const tenantOverride = useStandardPropertyOverride('root', 'tenant');
	const tagsOverride = useStandardPropertyOverride('root', 'tags');

	// Default status options (can be overridden by customization)
	const defaultStatusOptions = [
		{ id: 'draft', name: t('overview.status.options.draft') },
		{ id: 'proposed', name: t('overview.status.options.proposed') },
		{ id: 'in development', name: t('overview.status.options.inDevelopment') },
		{ id: 'active', name: t('overview.status.options.active') },
		{ id: 'deprecated', name: t('overview.status.options.deprecated') },
		{ id: 'retired', name: t('overview.status.options.retired') }
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
			if (item?.property !== undefined && isSafeKey(item.property)) {
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
		id, name, version, status, domain, tenant, tags,
		...customPropertiesLookup,
	}), [id, name, version, status, domain, tenant, tags, customPropertiesLookup]);

	return (
		<div className="h-full flex flex-col bg-white">
			<div className="flex-1 overflow-y-auto p-4">
				<div className="space-y-4">

					{/* Fundamentals Section */}
					<div>
						<h3 className="text-base font-semibold leading-6 text-gray-900">{t("overview.section.fundamentals")}</h3>
						<p className="mt-1 text-xs leading-4 text-gray-500 mb-4">{t("overview.section.fundamentalsDescription")}</p>

						<div className="space-y-4">
							<div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
								{/* ODCS version (apiVersion): the standard's version, not the contract's, hence the
								    branded label so it is not mistaken for the Version field. Shown only while the
								    document is behind the configured schema: on the latest version there is nothing
								    to pick and nothing to migrate, so the row would be noise. */}
								{!isApiVersionHidden && isApiVersionBehind && (
									<div className="sm:col-span-2">
										<div className="flex items-end gap-2">
											<div className="min-w-0 flex-1">
												<ValidatedCombobox
													name="apiVersion"
													label={apiVersionOverride?.title || t("overview.apiVersion.label")}
													options={apiVersionOptions}
													value={documentApiVersion}
													onChange={setApiVersion}
													placeholder={apiVersionOverride?.placeholder || t("overview.apiVersion.placeholder")}
													allowCustomValue={false}
													acceptAnyInput={false}
													required={apiVersionOverride?.required ?? true}
													tooltip={apiVersionOverride?.description || t("overview.apiVersion.tooltip")}
													validationKey="root.apiVersion"
													validationSection="Overview"
												/>
											</div>
											{/* Migrating rewrites the document (apiVersion, plus the structural changes a
											    version jump requires), so the button asks first and says what happens. */}
											<Popover className="relative shrink-0">
												<PopoverButton className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors">
													{t("overview.apiVersion.migrate", { target: defaultApiVersion })}
												</PopoverButton>
												<PopoverPanel
													anchor="bottom end"
													className="z-50 mt-1 w-96 rounded-md bg-white p-4 shadow-lg ring-1 ring-gray-200 text-xs text-gray-700"
												>
													{({ close }) => (
														<div className="space-y-2">
															<p className="text-sm font-semibold text-gray-900">
																{t("overview.apiVersion.confirm.title", { target: defaultApiVersion })}
															</p>
															<p>{t("overview.apiVersion.confirm.why", { current: documentApiVersion, target: defaultApiVersion })}</p>
															{apiVersionUpgradeSteps.length === 0 ? (
																<p>{t("overview.apiVersion.confirm.whatOnlyVersion", { target: defaultApiVersion })}</p>
															) : (
																<div>
																	<p>{t("overview.apiVersion.confirm.whatWithSteps", { target: defaultApiVersion })}</p>
																	<ul className="mt-1 list-disc pl-4">
																		{apiVersionUpgradeSteps.map((step) => (
																			<li key={step}>{t(`overview.apiVersion.confirm.steps.${step}`)}</li>
																		))}
																	</ul>
																</div>
															)}
															<p className="text-gray-500">{t("overview.apiVersion.confirm.note")}</p>
															<div className="flex justify-end gap-2 pt-1">
																<button
																	type="button"
																	onClick={() => close()}
																	className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
																>
																	{t("overview.apiVersion.confirm.dismiss")}
																</button>
																<button
																	type="button"
																	onClick={() => {
																		setApiVersion(defaultApiVersion);
																		close();
																	}}
																	className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
																>
																	{t("overview.apiVersion.confirm.migrate", { target: defaultApiVersion })}
																</button>
															</div>
														</div>
													)}
												</PopoverPanel>
											</Popover>
										</div>
										<p className="mt-1 text-xs text-amber-700">
											{t("overview.apiVersion.behind", { target: defaultApiVersion })}
										</p>
									</div>
								)}

								{/* Name Field */}
								{!isNameHidden && (
									<ValidatedInput
										name="name"
										label={nameOverride?.title || t("overview.name.label")}
										value={name}
										onChange={(e) => setName(e.target.value)}
										required={nameOverride?.required ?? true}
										tooltip={nameOverride?.description || t("overview.name.tooltip")}
										placeholder={nameOverride?.placeholder || t("overview.name.placeholder")}
										pattern={nameOverride?.pattern}
										patternMessage={nameOverride?.patternMessage}
										minLength={nameOverride?.minLength}
										maxLength={nameOverride?.maxLength}
										validationKey="root.name"
										validationSection="Overview"
										data-1p-ignore
									/>
								)}

								{/* Version Field */}
								{!isVersionHidden && (
									<ValidatedInput
										name="version"
										label={versionOverride?.title || t("overview.version.label")}
										value={version}
										onChange={(e) => setVersion(e.target.value)}
										required={versionOverride?.required ?? true}
										tooltip={versionOverride?.description || t("overview.version.tooltip")}
										placeholder={versionOverride?.placeholder || "1.0.0"}
										pattern={versionOverride?.pattern}
										patternMessage={versionOverride?.patternMessage}
										minLength={versionOverride?.minLength}
										maxLength={versionOverride?.maxLength}
										validationKey="root.version"
										validationSection="Overview"
									/>
								)}

								{/* ID Field */}
								{!isIdHidden && (
									<div>
										<ValidatedInput
											name="id"
											label={idOverride?.title || t("overview.id.label")}
											value={id}
											onChange={(e) => setId(e.target.value)}
											required={idOverride?.required ?? true}
											tooltip={idOverride?.description || t("overview.id.tooltip")}
											placeholder={idOverride?.placeholder || "unique-identifier"}
											pattern={idOverride?.pattern}
											patternMessage={idOverride?.patternMessage}
											minLength={idOverride?.minLength}
											maxLength={idOverride?.maxLength}
											validationKey="root.id"
											validationSection="Overview"
											disabled={isIdLocked}
											skipInternalValidation={isIdLocked}
										/>
										{isIdLocked && (
											<p className="mt-1 text-xs text-gray-500">
												{t("overview.id.usedByDataProducts", {
													products: dataProductsUsingContract.map((d) => d.name).join(", "),
												})}
											</p>
										)}
									</div>
								)}

								{/* Status Field */}
								{!isStatusHidden && (
									<ValidatedCombobox
										name="status"
										label={statusOverride?.title || t("overview.status.label")}
										options={statusOptions}
										value={status}
										onChange={(selectedValue) => setStatus(selectedValue || '')}
										placeholder={statusOverride?.placeholder || t("overview.status.placeholder")}
										acceptAnyInput={!statusOverride?.enum}
										required={statusOverride?.required ?? true}
										tooltip={statusOverride?.description || t("overview.status.tooltip")}
										pattern={statusOverride?.pattern}
										patternMessage={statusOverride?.patternMessage}
										validationKey="root.status"
										validationSection="Overview"
									/>
								)}

								{/* Tenant Field */}
								{!isTenantHidden && (
									<ValidatedCombobox
										name="tenant"
										label={tenantOverride?.title || t("overview.tenant.label")}
										options={tenantOptions || []}
										value={tenant}
										onChange={(selectedValue) => setTenant(selectedValue || undefined)}
										placeholder={tenantOverride?.placeholder || "company-A"}
										acceptAnyInput={!tenantOverride?.enum}
										required={tenantOverride?.required ?? false}
										tooltip={tenantOverride?.description || t("overview.tenant.tooltip")}
										pattern={tenantOverride?.pattern}
										patternMessage={tenantOverride?.patternMessage}
										validationKey="root.tenant"
										validationSection="Overview"
									/>
								)}

								{/* Domain Field */}
								{!isDomainHidden && (
									<ValidatedCombobox
										name="domain"
										label={domainOverride?.title || t("overview.domain.label")}
										options={domainOptions || []}
										value={domain}
										onChange={(selectedValue) => setDomain(selectedValue || undefined)}
										placeholder={domainOverride?.placeholder || t("overview.domain.placeholder")}
										acceptAnyInput={!domainOverride?.enum}
										required={domainOverride?.required ?? false}
										tooltip={domainOverride?.description || t("overview.domain.tooltip")}
										pattern={domainOverride?.pattern}
										patternMessage={domainOverride?.patternMessage}
										validationKey="root.domain"
										validationSection="Overview"
									/>
								)}

								{/* Tags Field */}
								{!isTagsHidden && (
									<div className="sm:col-span-2">
										<TagsInput
											label={tagsOverride?.title || t("overview.tags.label")}
											value={tags}
											onChange={(value) => setTags('tags', value)}
											tooltip={tagsOverride?.description || t("overview.tags.tooltip")}
											placeholder={tagsOverride?.placeholder || t("overview.tags.placeholder")}
                      managedTags={editorConfig.managedTags}
                      allowUnmanagedTags={editorConfig.allowUnmanagedTags}
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
								validationKeyPrefix="root"
								validationSection="Overview"
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
						validationKeyPrefix="root"
						validationSection="Overview"
					/>

				</div>
			</div>
		</div>
	);
};

export default Overview;
