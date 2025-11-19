import { useMemo } from 'react';
import * as YAML from 'yaml';
import serverIcons from '../../assets/server-icons/serverIcons.jsx';
import supportIcons from '../../assets/support-icons/supportIcons.jsx';
import LinkIcon from '../ui/icons/LinkIcon.jsx';
import { getQualityCheckIcon } from '../ui/icons/QualityCheckIcons.jsx';
import Tooltip from '../ui/Tooltip.jsx';
import DescriptionPreview from '../ui/DescriptionPreview.jsx';

const DataContractPreview = ({ yamlContent }) => {
  const parsedData = useMemo(() => {
    if (!yamlContent?.trim()) {
      return null;
    }

    try {
      return YAML.parse(yamlContent);
    } catch (error) {
      return { error: error.message };
    }
  }, [yamlContent]);

  if (!parsedData) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <p className="text-sm font-medium">No docs to preview</p>
          <p className="text-xs">Start editing the YAML to see a preview</p>
        </div>
      </div>
    );
  }

  if (parsedData.error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-800 font-medium text-sm">YAML Parse Error</h3>
        <p className="text-red-700 text-xs mt-1">{parsedData.error}</p>
      </div>
    );
  }

  const docs = parsedData.docs || parsedData.dataContract || parsedData;

  // Handle different YAML structures
  const info = docs.info || {
    title: docs.name || docs.businessName,
    version: docs.version,
    description: docs.description?.purpose || docs.description,
    tags: docs.tags || [],
    contact: docs.support?.[0] ? {
      name: Array.isArray(docs.team) && docs.team[0]?.username,
      email: docs.support[0].url
    } : undefined
  };

  const terms = docs.terms || {
    usage: docs.description?.usage,
    limitations: docs.description?.limitations,
    billing: docs.price ? `${docs.price.priceAmount} ${docs.price.priceCurrency} ${docs.price.priceUnit}` : undefined
  };

  // Convert schema array to models object
  const models = docs.models || {};

  // Recursive function to convert property structure
  const convertProperty = (prop) => {
    if (!prop) return null;

    const converted = {
      businessName: prop.businessName,
      description: prop.description,
      logicalType: prop.logicalType,
      physicalType: prop.physicalType,
      type: prop.type || prop.logicalType || prop.physicalType,
      required: prop.required,
      unique: prop.unique,
      primaryKey: prop.primaryKey,
      primaryKeyPosition: prop.primaryKeyPosition,
      partitioned: prop.partitioned,
      partitionKeyPosition: prop.partitionKeyPosition,
      classification: prop.classification,
      transformLogic: prop.transformLogic,
      transformDescription: prop.transformDescription,
      examples: prop.examples,
      customProperties: prop.customProperties,
      tags: prop.tags,
      quality: prop.quality
    };

    // Handle nested properties recursively
    if (prop.properties) {
      if (Array.isArray(prop.properties)) {
        converted.properties = {};
        prop.properties.filter(p => p != null).forEach(p => {
          converted.properties[p.name] = convertProperty(p);
        });
      } else if (typeof prop.properties === 'object') {
        converted.properties = {};
        Object.entries(prop.properties).forEach(([name, p]) => {
          converted.properties[name] = convertProperty(p);
        });
      }
    }

    return converted;
  };

  if (docs.schema && Array.isArray(docs.schema)) {
    // Filter out null/undefined schemas
    docs.schema.filter(schemaItem => schemaItem != null).forEach(schemaItem => {
      models[schemaItem.name] = {
        title: schemaItem.businessName,
        description: schemaItem.description,
        type: schemaItem.physicalType,
        physicalName: schemaItem.physicalName,
        customProperties: schemaItem.customProperties,
        quality: schemaItem.quality,
        fields: {}
      };

      if (schemaItem.properties && Array.isArray(schemaItem.properties)) {
        // Filter out null/undefined properties and convert them
        schemaItem.properties.filter(prop => prop != null).forEach(prop => {
          models[schemaItem.name].fields[prop.name] = convertProperty(prop);
        });
      }
    });
  }

  const examples = docs.examples || [];

  // Extract data for all sections
  const description = docs.description || {};
  const links = docs.links || [];
  const support = docs.support || [];
  const price = docs.price || null;
  // Team is now an object with name, description, members, tags, customProperties, authoritativeDefinitions
  const team = docs.team || {};
  const teamMembers = team.members || [];
  const roles = docs.roles || [];
  const slaProperties = docs.slaProperties || [];
  const servers = docs.servers || [];
  const customProperties = docs.customProperties || [];
  const authoritativeDefinitions = docs.authoritativeDefinitions || [];
  const domain = docs.domain;
  const contractCreatedTs = docs.contractCreatedTs;

  // Get server icon component based on server type
  const getServerIcon = (serverType) => {
    if (!serverType) return null;
    const type = serverType.toLowerCase();
    return serverIcons[type];
  };

  // Get icon for links - returns appropriate icon based on icon name
  const getLinkIcon = (iconName) => {
    // For now, return LinkIcon for all links
    // TODO: Implement icon mapping when icon components are available
    return LinkIcon;
  };

  // Get support icon component based on tool type
  const getSupportIcon = (toolType) => {
    if (!toolType) return null;
    const type = toolType.toLowerCase();
    return supportIcons[type];
  };

  return (
    <div className="space-y-6 mt-6" id="docs-content">
      {/* Header Section */}
      <div className="min-w-0">
        <div className="flex gap-2">
          <i className="flex-none size-8 rounded-full p-1.5 flex items-center text-xs bg-white text-gray-500 object-cover ring-1 ring-gray-900/10">
            <img src="/odcs.svg" alt="" />
          </i>

          <div className="min-w-0">
            <h1 className="text-lg font-bold leading-5 text-gray-900 text-ellipsis tracking-tight">
              {info.title || 'Untitled Contract'}
            </h1>

            <div className="mt-0.5 text-gray-500 text-xs">
              <span>{parsedData.id || 'no-id'}</span>
              {info.version && (
                <span className="inline-flex items-center rounded-full bg-indigo-50 px-1.5 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10 ml-1">
                  {info.version}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-1.5 flex flex-row flex-wrap gap-x-3 gap-y-1 min-w-0 text-xs text-gray-500">
          <div className="flex-none flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="mr-1 h-3 w-3 shrink-0 text-gray-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            <span>{parsedData.tenant || 'No Team'}</span>
          </div>

          <div className="flex-none flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="mr-1 h-3 w-3 shrink-0 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
            </svg>
            <span>{parsedData.status || 'draft'}</span>
          </div>

          <a href={`https://bitol-io.github.io/open-data-contract-standard/${parsedData.apiVersion || 'latest'}/`} className="flex-none flex items-center" target="_blank" rel="noopener noreferrer">
            <span className="inline-flex items-center rounded-md bg-indigo-50 px-1.5 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
              ODCS {parsedData.apiVersion || 'latest'}
            </span>
          </a>
        </div>
      </div>

      {/* Main Column */}
      <div className="space-y-6" id="datacontract-content">

          {/* 1. Fundamentals Section */}
          <section>
            <div className="px-4 sm:px-0">
              <h1 className="text-base font-semibold leading-6 text-gray-900" id="fundamentals">Fundamentals</h1>
              <p className="text-sm text-gray-500">Information about the data contract</p>
            </div>
            <div className="mt-2 overflow-hidden shadow sm:rounded-lg bg-white">
              <div className="px-4 py-4 sm:px-6">

                {/* Links Section */}
                {links && links.length > 0 && (
                  <div className="flex flex-wrap gap-3 print:hidden mb-6">
                    {links.map((link, index) => {
                      if (!link.href) return null;
                      const IconComponent = getLinkIcon(link.icon);
                      return (
                        <a
                          key={index}
                          href={link.href}
                          className="flex flex-col text-center rounded-md bg-white px-2 py-2 text-sm font-medium text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ minWidth: '100px' }}
                        >
                          <div className="mx-auto w-8 h-8 my-2">
                            <IconComponent className="w-full h-full" />
                          </div>
                          {link.displayName && <div>{link.displayName}</div>}
                          {link.displayName2 && <div>{link.displayName2}</div>}
                        </a>
                      );
                    })}
                  </div>
                )}

                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  {parsedData.dataProduct && (
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Data Product</dt>
                      <dd className="mt-1 text-sm text-gray-900">{parsedData.dataProduct}</dd>
                    </div>
                  )}

                  {parsedData.tenant && (
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Tenant</dt>
                      <dd className="mt-1 text-sm text-gray-900">{parsedData.tenant}</dd>
                    </div>
                  )}

                  {domain && (
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Domain</dt>
                      <dd className="mt-1 text-sm text-gray-900">{domain}</dd>
                    </div>
                  )}

                  {contractCreatedTs && (
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Contract Created</dt>
                      <dd className="mt-1 text-sm text-gray-900">{new Date(contractCreatedTs).toLocaleString()}</dd>
                    </div>
                  )}

                  {parsedData.tags && Array.isArray(parsedData.tags) && parsedData.tags.length > 0 && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Tags</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <div className="flex gap-y-1 items-center text-xs text-gray-500 flex-wrap">
                          {parsedData.tags.map((tag, index) => (
                            <span key={index} className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mb-1">
                              <svg className="size-1.5 fill-gray-500 mr-1" viewBox="0 0 6 6" aria-hidden="true">
                                <circle cx="3" cy="3" r="3"></circle>
                              </svg>
                              <span>{tag}</span>
                            </span>
                          ))}
                        </div>
                      </dd>
                    </div>
                  )}

                  {authoritativeDefinitions && authoritativeDefinitions.length > 0 && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500 mb-2">Authoritative Definitions</dt>
                    </div>
                  )}
                  {authoritativeDefinitions && authoritativeDefinitions.map((def, index) => (
                    <div key={index} className="sm:col-span-1">
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide inline-flex items-center gap-1">
                        {def.type}
                        {def.description && (
                          <Tooltip content={def.description}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-400 cursor-help">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                          </Tooltip>
                        )}
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <a
                          href={def.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-500 inline-flex items-center gap-x-1"
                        >
                          {def.url}
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                          </svg>
                        </a>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </section>

          {/* 2. Description Section */}
          <DescriptionPreview description={description} />

          {/* 3. Data Model Section */}
          {Object.keys(models).length > 0 && (
            <section id="schema">
              <div className="flex justify-between">
                <div className="px-4 sm:px-0">
                  <h1 className="text-base font-semibold leading-6 text-gray-900">Schema</h1>
                  <p className="text-sm text-gray-500">Schema supports both a business representation and physical implementation</p>
                </div>
              </div>

              {Object.entries(models).map(([modelName, model]) => {
                // Recursive component to render properties with nesting
                const renderProperty = (property, propertyName, indent = 0) => {
                  const indentSpaces = '    '.repeat(Math.max(0, indent - 1));
                  const hasChildren = property.properties && Object.keys(property.properties).length > 0;

                  return (
                    <>
                      <tr key={propertyName} className="print:break-inside-avoid-page">
                        <td className="py-2 pl-4 pr-2 text-sm font-medium text-gray-900 sm:pl-6 w-fit flex">
                          <span>
                            {indent > 0 && indentSpaces}
                            {indent > 0 && <span className="mr-1">↳</span>}
                          </span>
                          <div>
                            {property.businessName && (
                              <>
                                <span>{property.businessName}</span>
                                <br />
                              </>
                            )}
                            <span className="font-mono">{propertyName}</span>
                          </div>
                        </td>
                        <td className="px-1 py-2 text-sm text-gray-500 w-fit">
                          {property.logicalType && (
                            <div className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 ring-1 ring-inset ring-blue-500/10">
                              <span>{property.logicalType}</span>
                            </div>
                          )}
                          {property.physicalType && (
                            <div className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                              <span>{property.physicalType}</span>
                            </div>
                          )}
                          {!property.logicalType && !property.physicalType && property.type && (
                            <div className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
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

                          <div>
                            {property.primaryKey && (
                              <span className="inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1">
                                primaryKey{property.primaryKeyPosition && ` (${property.primaryKeyPosition})`}
                              </span>
                            )}
                            {property.required && (
                              <span className="inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1">required</span>
                            )}
                            {property.unique && (
                              <span className="inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1">unique</span>
                            )}
                            {property.partitioned && (
                              <span className="inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1">
                                partitioned{property.partitionKeyPosition && ` (${property.partitionKeyPosition})`}
                              </span>
                            )}
                            {property.classification && (
                              <span className="inline-flex items-center rounded-md bg-blue-50 px-1 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 mr-1 mt-1">
                                {property.classification}
                              </span>
                            )}
                            {property.transformLogic && (
                              <span className="inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1" title={property.transformLogic}>
                                transform logic
                              </span>
                            )}
                            {property.transformDescription && (
                              <span className="inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1" title={property.transformDescription}>
                                transform description
                              </span>
                            )}
                            {property.customProperties && Array.isArray(property.customProperties) && property.customProperties.map((customProp, idx) => (
                              <span key={idx} className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20 mr-1 mt-1">
                                {customProp.property}:{customProp.value}
                              </span>
                            ))}
                            {property.tags && Array.isArray(property.tags) && property.tags.map((tag, idx) => (
                              <span key={idx} className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1">
                                <svg className="size-1.5 fill-gray-500 mr-1" viewBox="0 0 6 6" aria-hidden="true">
                                  <circle cx="3" cy="3" r="3"></circle>
                                </svg>
                                <span>{tag}</span>
                              </span>
                            ))}
                            {property.quality && Array.isArray(property.quality) && property.quality.map((qualityCheck, qIdx) => {
                              const QualityIcon = getQualityCheckIcon(qualityCheck.type);
                              const tooltipContent = (
                                <div className="space-y-1">
                                  {qualityCheck.description && <div>{qualityCheck.description}</div>}
                                  {qualityCheck.type && <div className="text-gray-300">Type: {qualityCheck.type}</div>}
                                  {qualityCheck.dimension && <div className="text-gray-300">Dimension: {qualityCheck.dimension}</div>}
                                  {qualityCheck.metric && <div className="text-gray-300">Metric: {qualityCheck.metric}</div>}
                                  {qualityCheck.mustBeGreaterThan !== undefined && <div className="text-gray-300">Must be &gt; {qualityCheck.mustBeGreaterThan}</div>}
                                  {qualityCheck.mustBeLessThan !== undefined && <div className="text-gray-300">Must be &lt; {qualityCheck.mustBeLessThan}</div>}
                                  {qualityCheck.mustBe !== undefined && <div className="text-gray-300">Must be {qualityCheck.mustBe}</div>}
                                </div>
                              );

                              return (
                                <Tooltip key={qIdx} content={tooltipContent}>
                                  <span className="inline-flex items-center gap-1 rounded-md bg-fuchsia-50 px-2 py-1 text-xs font-medium text-fuchsia-700 ring-1 ring-inset ring-fuchsia-600/20 mr-1 mt-1">
                                    <QualityIcon className="w-3 h-3" />
                                    {qualityCheck.name || 'Quality Check'}
                                  </span>
                                </Tooltip>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                      {hasChildren && Object.entries(property.properties).map(([childName, childProp]) =>
                        renderProperty(childProp, childName, indent + 1)
                      )}
                    </>
                  );
                };

                return (
                  <div key={modelName} className="mt-3 print:block">
                    <div className="overflow-x-auto shadow ring-1 ring-black/5 sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300 print:relative print:break-inside-auto">
                        <thead className="bg-gray-50 print:table-header-group">
                          <tr className="print:break-inside-avoid-page">
                            <th scope="colgroup" colSpan="3" className="py-2 pl-4 pr-3 text-left font-semibold text-gray-900 sm:pl-6">
                              <span>{model.title || modelName}</span>
                              {' '}
                              <span className="font-mono font-medium">{modelName}</span>
                              {' '}
                              {model.type && (
                                <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                  {model.type}
                                </span>
                              )}
                              {model.description ? (
                                <div className="text-sm font-medium text-gray-500">{model.description}</div>
                              ) : (
                                <div className="text-sm font-medium text-gray-400">No description</div>
                              )}
                              {model.customProperties && Array.isArray(model.customProperties) && model.customProperties.length > 0 && (
                                <div>
                                  {model.customProperties.map((customProp, idx) => (
                                    <span key={idx} className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20 mr-1 mt-1">
                                      {customProp.property}:{customProp.value}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {docs.schema && docs.schema.find(s => s.name === modelName)?.tags && Array.isArray(docs.schema.find(s => s.name === modelName).tags) && docs.schema.find(s => s.name === modelName).tags.length > 0 && (
                                <div className="mt-1">
                                  {docs.schema.find(s => s.name === modelName).tags.map((tag, idx) => (
                                    <span key={idx} className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1">
                                      <svg className="size-1.5 fill-gray-500 mr-1" viewBox="0 0 6 6" aria-hidden="true">
                                        <circle cx="3" cy="3" r="3"></circle>
                                      </svg>
                                      <span>{tag}</span>
                                    </span>
                                  ))}
                                </div>
                              )}
                              {docs.schema && docs.schema.find(s => s.name === modelName)?.quality && Array.isArray(docs.schema.find(s => s.name === modelName).quality) && docs.schema.find(s => s.name === modelName).quality.length > 0 && (
                                <div className="mt-2">
                                  {docs.schema.find(s => s.name === modelName).quality.map((qualityCheck, idx) => {
                                    const QualityIcon = getQualityCheckIcon(qualityCheck.type);
                                    const tooltipContent = (
                                      <div className="space-y-1">
                                        {qualityCheck.description && <div>{qualityCheck.description}</div>}
                                        {qualityCheck.type && <div className="text-gray-300">Type: {qualityCheck.type}</div>}
                                        {qualityCheck.dimension && <div className="text-gray-300">Dimension: {qualityCheck.dimension}</div>}
                                        {qualityCheck.metric && <div className="text-gray-300">Metric: {qualityCheck.metric}</div>}
                                      </div>
                                    );

                                    return (
                                      <Tooltip key={idx} content={tooltipContent}>
                                        <span className="inline-flex items-center gap-1 rounded-md bg-fuchsia-50 px-2 py-1 text-xs font-medium text-fuchsia-700 ring-1 ring-inset ring-fuchsia-600/20 mr-1 mt-1">
                                          <QualityIcon className="w-3 h-3" />
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
                          {model.fields && Object.entries(model.fields).map(([fieldName, field]) =>
                            renderProperty(field, fieldName, 0)
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </section>
          )}

          {/* 4. Servers Section */}
          {servers && servers.length > 0 && (
            <section>
              <div className="px-4 sm:px-0">
                <h1 className="text-base font-semibold leading-6 text-gray-900" id="servers">Servers</h1>
                <p className="text-sm text-gray-500">This section covers connection details to physical data sets and infrastructure</p>
              </div>
              <ul role="list" className="mt-2 divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-lg">
                {servers.map((server, index) => {
                  const ServerIconComponent = getServerIcon(server.type);
                  return (
                    <li key={index} className="relative flex flex-col gap-x-6 gap-y-2 px-4 py-3 sm:px-6" id={`server-${server.server}`}>
                      <div className="flex items-start gap-x-4">
                        {ServerIconComponent && (
                          <div className="flex-none h-12 w-12 rounded-lg bg-white p-2.5 ring-1 ring-gray-900/10 flex items-center justify-center">
                            <ServerIconComponent />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                            {server.type && (
                              <div className="flex flex-col">
                                <dt className="text-sm font-medium text-gray-500">Type</dt>
                                <dd className="mt-1 text-sm text-gray-900">{server.type}</dd>
                              </div>
                            )}
                            {server.project && (
                              <div className="flex flex-col">
                                <dt className="text-sm font-medium text-gray-500">Project</dt>
                                <dd className="mt-1 text-sm text-gray-900">{server.project}</dd>
                              </div>
                            )}
                            {server.dataset && (
                              <div className="flex flex-col">
                                <dt className="text-sm font-medium text-gray-500">Dataset</dt>
                                <dd className="mt-1 text-sm text-gray-900">{server.dataset}</dd>
                              </div>
                            )}
                            {server.endpointUrl && (
                              <div className="flex flex-col">
                                <dt className="text-sm font-medium text-gray-500">Endpoint</dt>
                                <dd className="mt-1 text-sm text-gray-900">{server.endpointUrl}</dd>
                              </div>
                            )}
                            {server.location && (
                              <div className="flex flex-col">
                                <dt className="text-sm font-medium text-gray-500">Location</dt>
                                <dd className="mt-1 text-sm text-gray-900">{server.location}</dd>
                              </div>
                            )}
                            {server.path && (
                              <div className="flex flex-col">
                                <dt className="text-sm font-medium text-gray-500">Path</dt>
                                <dd className="mt-1 text-sm text-gray-900">{server.path}</dd>
                              </div>
                            )}
                            {server.account && (
                              <div className="flex flex-col">
                                <dt className="text-sm font-medium text-gray-500">Account</dt>
                                <dd className="mt-1 text-sm text-gray-900">{server.account}</dd>
                              </div>
                            )}
                            {server.database && (
                              <div className="flex flex-col">
                                <dt className="text-sm font-medium text-gray-500">Database</dt>
                                <dd className="mt-1 text-sm text-gray-900">{server.database}</dd>
                              </div>
                            )}
                            {server.schema && (
                              <div className="flex flex-col">
                                <dt className="text-sm font-medium text-gray-500">Schema</dt>
                                <dd className="mt-1 text-sm text-gray-900">{server.schema}</dd>
                              </div>
                            )}
                            {server.table && (
                              <div className="flex flex-col">
                                <dt className="text-sm font-medium text-gray-500">Table</dt>
                                <dd className="mt-1 text-sm text-gray-900">{server.table}</dd>
                              </div>
                            )}
                            {server.view && (
                              <div className="flex flex-col">
                                <dt className="text-sm font-medium text-gray-500">View</dt>
                                <dd className="mt-1 text-sm text-gray-900">{server.view}</dd>
                              </div>
                            )}
                            {server.host && (
                              <div className="flex flex-col">
                                <dt className="text-sm font-medium text-gray-500">Host</dt>
                                <dd className="mt-1 text-sm text-gray-900">{server.host}</dd>
                              </div>
                            )}
                            {server.port && (
                              <div className="flex flex-col">
                                <dt className="text-sm font-medium text-gray-500">Port</dt>
                                <dd className="mt-1 text-sm text-gray-900">{server.port}</dd>
                              </div>
                            )}
                            {server.topic && (
                              <div className="flex flex-col">
                                <dt className="text-sm font-medium text-gray-500">Topic</dt>
                                <dd className="mt-1 text-sm text-gray-900">{server.topic}</dd>
                              </div>
                            )}
                            {server.format && (
                              <div className="flex flex-col">
                                <dt className="text-sm font-medium text-gray-500">Format</dt>
                                <dd className="mt-1 text-sm text-gray-900">{server.format}</dd>
                              </div>
                            )}
                            {server.delimiter && (
                              <div className="flex flex-col">
                                <dt className="text-sm font-medium text-gray-500">Delimiter</dt>
                                <dd className="mt-1 text-sm text-gray-900">{server.delimiter}</dd>
                              </div>
                            )}
                            {server.customProperties && Array.isArray(server.customProperties) && server.customProperties.map((customProperty, cpIndex) => (
                              <div key={cpIndex} className="flex flex-col">
                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{customProperty.property}</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                  <span className="whitespace-pre-wrap inline-flex items-center gap-1">
                                    {customProperty.value}
                                    {customProperty.description && (
                                      <Tooltip content={customProperty.description}>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-400 cursor-help">
                                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                        </svg>
                                      </Tooltip>
                                    )}
                                  </span>
                                </dd>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* 5. Team Section */}
          {(team.name || team.description || teamMembers.length > 0 || (team.tags && team.tags.length > 0)) && (
            <section>
              <div className="px-4 sm:px-0">
                <h1 className="text-base font-semibold leading-6 text-gray-900" id="team">Team</h1>
                <p className="text-sm text-gray-500">This section lists team information and members</p>
              </div>

              {/* Team Info */}
              <div className="mt-2 overflow-hidden shadow sm:rounded-lg bg-white">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex flex-col gap-3">
                    {team.name && (
                      <div>
                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Team Name</dt>
                        <dd className="mt-1 text-sm text-gray-900">{team.name}</dd>
                      </div>
                    )}

                    {team.description && (
                      <div>
                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Description</dt>
                        <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{team.description}</dd>
                      </div>
                    )}

                    {team.tags && Array.isArray(team.tags) && team.tags.length > 0 && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 mb-2">Tags</dt>
                        <dd className="flex gap-1 items-center text-xs text-gray-500 flex-wrap">
                          {team.tags.map((tag, index) => (
                            <span key={index} className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                              <svg className="size-1.5 fill-gray-500 mr-1" viewBox="0 0 6 6" aria-hidden="true">
                                <circle cx="3" cy="3" r="3"></circle>
                              </svg>
                              <span>{tag}</span>
                            </span>
                          ))}
                        </dd>
                      </div>
                    )}

                    {team.customProperties && Array.isArray(team.customProperties) && team.customProperties.length > 0 && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 mb-2">Custom Properties</dt>
                        <dd className="flex flex-wrap gap-x-4 gap-y-2">
                          {team.customProperties.map((customProp, index) => (
                            <div key={index} className="min-w-0">
                              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide inline-flex items-center gap-1">
                                {customProp.property}
                                {customProp.description && (
                                  <Tooltip content={customProp.description}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-400 cursor-help">
                                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                    </svg>
                                  </Tooltip>
                                )}
                              </dt>
                              <dd className="text-sm text-gray-900">
                                <span className="whitespace-pre-wrap">{customProp.value}</span>
                              </dd>
                            </div>
                          ))}
                        </dd>
                      </div>
                    )}

                    {team.authoritativeDefinitions && Array.isArray(team.authoritativeDefinitions) && team.authoritativeDefinitions.length > 0 && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 mb-2">Authoritative Definitions</dt>
                        <dd className="flex flex-wrap gap-x-4 gap-y-2">
                          {team.authoritativeDefinitions.map((def, index) => (
                            <div key={index} className="min-w-0">
                              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide inline-flex items-center gap-1">
                                {def.type}
                                {def.description && (
                                  <Tooltip content={def.description}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-400 cursor-help">
                                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                    </svg>
                                  </Tooltip>
                                )}
                              </dt>
                              <dd className="text-sm text-gray-900">
                                <a
                                  href={def.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:text-indigo-500 inline-flex items-center gap-x-1"
                                >
                                  {def.url}
                                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                  </svg>
                                </a>
                              </dd>
                            </div>
                          ))}
                        </dd>
                      </div>
                    )}

                    {/* Team members */}
                    {teamMembers.length > 0 && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 mb-2">Members</dt>
                        <dd>
                          <div className="space-y-3">
                            {teamMembers.map((teamMember, index) => (
                              <div key={index} className="border-l-2 border-gray-200 pl-3 py-1">
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                                  {teamMember.username && (
                                    <span className="text-gray-900 font-medium">{teamMember.username}</span>
                                  )}
                                  {teamMember.name && (
                                    <span className="text-gray-600">{teamMember.name}</span>
                                  )}
                                  {teamMember.role && (
                                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                      {teamMember.role}
                                    </span>
                                  )}
                                </div>
                                {teamMember.description && (
                                  <p className="text-sm text-gray-500 mt-1">{teamMember.description}</p>
                                )}
                                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                                  {teamMember.dateIn && (
                                    <span>In: {teamMember.dateIn}</span>
                                  )}
                                  {teamMember.dateOut && (
                                    <span>Out: {teamMember.dateOut}</span>
                                  )}
                                  {teamMember.replacedByUsername && (
                                    <span>Replaced by: {teamMember.replacedByUsername}</span>
                                  )}
                                </div>
                                {teamMember.tags && Array.isArray(teamMember.tags) && teamMember.tags.length > 0 && (
                                  <div className="flex gap-1 flex-wrap mt-1">
                                    {teamMember.tags.map((tag, idx) => (
                                      <span key={idx} className="inline-flex items-center rounded-md bg-gray-50 px-1.5 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </dd>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 6. Support & Communication Section */}
          {support && support.length > 0 && (
            <section>
              <div className="px-4 sm:px-0">
                <h1 className="text-base font-semibold leading-6 text-gray-900" id="support">Support & Communication Channels</h1>
                <p className="text-sm text-gray-500">Support and communication channels help consumers find help regarding their use of the data contract</p>
              </div>
              <ul role="list" className="mt-2 divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-lg">
                {support.map((channel, index) => {
                  const SupportIconComponent = getSupportIcon(channel.tool);
                  return (
                    <li key={index} className="relative flex items-start gap-x-4 px-4 py-3 sm:px-6">
                      {SupportIconComponent && (
                        <div className="flex-none h-12 w-12 rounded-lg bg-white p-1.5 ring-1 ring-gray-900/10 flex items-center justify-center">
                          <SupportIconComponent />
                        </div>
                      )}
                      <div className="flex-1 flex flex-wrap gap-x-6">
                        {channel.tool && (
                          <div className="flex items-center gap-x-4">
                            <div className="flex flex-col">
                              <dt className="text-sm font-medium text-gray-500">Tool</dt>
                              <dd className="mt-1 text-sm text-gray-900">{channel.tool}</dd>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-x-4">
                          <div className="flex flex-col">
                            <dt className="text-sm font-medium text-gray-500">Channel</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              {channel.url ? (
                                <a href={channel.url} className="text-indigo-600 hover:text-indigo-500">{channel.channel}</a>
                              ) : (
                                <span>{channel.channel}</span>
                              )}
                            </dd>
                          </div>
                        </div>
                        {channel.scope && (
                          <div className="flex items-center gap-x-4">
                            <div className="flex flex-col">
                              <dt className="text-sm font-medium text-gray-500">Scope</dt>
                              <dd className="mt-1 text-sm text-gray-900">{channel.scope}</dd>
                            </div>
                          </div>
                        )}
                        {channel.description && (
                          <div className="flex items-center gap-x-4">
                            <div className="flex flex-col">
                              <dt className="text-sm font-medium text-gray-500">Description</dt>
                              <dd className="mt-1 text-sm text-gray-900">{channel.description}</dd>
                            </div>
                          </div>
                        )}
                        {channel.invitationUrl && (
                          <div className="flex items-center gap-x-4">
                            <div className="flex flex-col">
                              <dt className="text-sm font-medium text-gray-500">Invitation URL</dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                <a href={channel.invitationUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500">
                                  Invitation
                                </a>
                              </dd>
                            </div>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* 7. Roles Section */}
          {roles && roles.length > 0 && (
            <section>
              <div className="px-4 sm:px-0">
                <h1 className="text-base font-semibold leading-6 text-gray-900" id="roles">Roles</h1>
                <p className="text-sm text-gray-500">Support and communication channels help consumers find help regarding their use of the data contract</p>
              </div>
              <ul role="list" className="mt-2 divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-lg">
                {roles.map((role, index) => (
                  <li key={index} className="relative flex gap-x-6 px-4 py-3 sm:px-6">
                    {role.role && (
                      <div className="flex items-center gap-x-4">
                        <div className="hidden sm:flex sm:flex-col">
                          <dt className="text-sm font-medium text-gray-500">Role</dt>
                          <dd className="mt-1 text-sm text-gray-900">{role.role}</dd>
                        </div>
                      </div>
                    )}
                    {role.access && (
                      <div className="flex items-center gap-x-4">
                        <div className="hidden sm:flex sm:flex-col">
                          <dt className="text-sm font-medium text-gray-500">Access</dt>
                          <dd className="mt-1 text-sm text-gray-900">{role.access}</dd>
                        </div>
                      </div>
                    )}
                    {role.firstLevelApprovers && (
                      <div className="flex items-center gap-x-4">
                        <div className="hidden sm:flex sm:flex-col">
                          <dt className="text-sm font-medium text-gray-500">First Level Approvers</dt>
                          <dd className="mt-1 text-sm text-gray-900">{role.firstLevelApprovers}</dd>
                        </div>
                      </div>
                    )}
                    {role.secondLevelApprovers && (
                      <div className="flex items-center gap-x-4">
                        <div className="hidden sm:flex sm:flex-col">
                          <dt className="text-sm font-medium text-gray-500">Second Level Approvers</dt>
                          <dd className="mt-1 text-sm text-gray-900">{role.secondLevelApprovers}</dd>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 8. Pricing Section */}
          {price && (
            <section>
              <div className="px-4 sm:px-0">
                <h1 className="text-base font-semibold leading-6 text-gray-900" id="price">Price</h1>
                <p className="text-sm text-gray-500">This section covers pricing when you bill your customer for using this data product.</p>
              </div>
              <div className="mt-2 overflow-hidden shadow sm:rounded-lg bg-white">
                <div className="px-4 py-4 sm:px-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-3">
                    {price.priceAmount && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Price Amount</dt>
                        <dd className="mt-1 text-sm text-gray-900">{price.priceAmount}</dd>
                      </div>
                    )}

                    {price.priceCurrency && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Price Currency</dt>
                        <dd className="mt-1 text-sm text-gray-900">{price.priceCurrency}</dd>
                      </div>
                    )}

                    {price.priceUnit && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Price Unit</dt>
                        <dd className="mt-1 text-sm text-gray-900">{price.priceUnit}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </section>
          )}

          {/* 9. SLA Section */}
          {slaProperties && slaProperties.length > 0 && (
            <section>
              <div className="px-4 sm:px-0">
                <h1 className="text-base font-semibold leading-6 text-gray-900" id="sla">Service-Level Agreement (SLA)</h1>
                <p className="text-sm text-gray-500">This section describes the service-level agreements (SLA).</p>
              </div>
              <ul role="list" className="mt-2 divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-lg">
                {slaProperties.map((sla, index) => (
                  <li key={index} className="relative flex gap-x-6 px-4 py-3 sm:px-6">
                    {sla.property && (
                      <div className="flex items-center gap-x-4">
                        <div className="hidden sm:flex sm:flex-col">
                          <dt className="text-sm font-medium text-gray-500">Property</dt>
                          <dd className="mt-1 text-sm text-gray-900 overflow-hidden text-ellipsis w-64">{sla.property}</dd>
                        </div>
                      </div>
                    )}
                    {sla.value && (
                      <div className="flex items-center gap-x-4">
                        <div className="hidden sm:flex sm:flex-col">
                          <dt className="text-sm font-medium text-gray-500">Value</dt>
                          <dd className="mt-1 text-sm text-gray-900">{sla.value}</dd>
                        </div>
                      </div>
                    )}
                    {sla.valueExt && (
                      <div className="flex items-center gap-x-4">
                        <div className="hidden sm:flex sm:flex-col">
                          <dt className="text-sm font-medium text-gray-500">Extended value</dt>
                          <dd className="mt-1 text-sm text-gray-900">{sla.valueExt}</dd>
                        </div>
                      </div>
                    )}
                    {sla.unit && (
                      <div className="flex items-center gap-x-4">
                        <div className="hidden sm:flex sm:flex-col">
                          <dt className="text-sm font-medium text-gray-500">Unit</dt>
                          <dd className="mt-1 text-sm text-gray-900">{sla.unit}</dd>
                        </div>
                      </div>
                    )}
                    {sla.element && (
                      <div className="flex items-center gap-x-4">
                        <div className="hidden sm:flex sm:flex-col">
                          <dt className="text-sm font-medium text-gray-500">Element(s)</dt>
                          <dd className="mt-1 text-sm text-gray-900">{sla.element}</dd>
                        </div>
                      </div>
                    )}
                    {sla.driver && (
                      <div className="flex items-center gap-x-4">
                        <div className="hidden sm:flex sm:flex-col">
                          <dt className="text-sm font-medium text-gray-500">Driver</dt>
                          <dd className="mt-1 text-sm text-gray-900">{sla.driver}</dd>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 10. Custom Properties Section */}
          {customProperties && customProperties.length > 0 && (
            <section className="print:break-before-page">
              <div className="px-4 sm:px-0">
                <h1 className="text-base font-semibold leading-6 text-gray-900" id="customProperties">Custom Properties</h1>
                <p className="text-sm text-gray-500">This section covers other properties you may find in a data contract.</p>
              </div>
              <div className="mt-2 overflow-hidden print:overflow-auto bg-white shadow sm:rounded-lg">
                <div className="border-t border-gray-100">
                  <dl className="divide-y divide-gray-100 text-sm break-all print:break-inside-avoid">
                    {customProperties.map((property, index) => (
                      <div key={index} className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-900">{property.property}</dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                          <span className="whitespace-pre-wrap inline-flex items-center gap-1">
                            {property.value}
                            {property.description && (
                              <Tooltip content={property.description}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-400 cursor-help">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                </svg>
                              </Tooltip>
                            )}
                          </span>
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </section>
          )}

      </div>
    </div>
  );
};

export default DataContractPreview;
