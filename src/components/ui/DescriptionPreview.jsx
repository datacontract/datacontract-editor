import Tooltip from './Tooltip.jsx';

const DescriptionPreview = ({ description }) => {
  if (!description) return null;

  const hasContent = description.purpose || description.usage || description.limitations ||
    (description.authoritativeDefinitions && description.authoritativeDefinitions.length > 0) ||
    (description.customProperties && description.customProperties.length > 0);

  if (!hasContent) return null;

  return (
    <section>
      <div className="px-4 sm:px-0">
        <h1 className="text-base font-semibold leading-6 text-gray-900" id="terms-of-use">Terms of Use</h1>
        <p className="text-sm text-gray-500">High level description of the dataset including purpose, usage guidelines, and limitations</p>
      </div>
      <div className="mt-2 overflow-hidden shadow sm:rounded-lg bg-white">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3">
            {description.purpose && (
              <div id="description-purpose">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Purpose</div>
                <div className="mt-1 text-sm text-gray-900">
                  <span className="whitespace-pre-wrap">{description.purpose}</span>
                </div>
              </div>
            )}

            {description.usage && (
              <div id="description-usage">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Usage</div>
                <div className="mt-1 text-sm text-gray-900">
                  <span className="whitespace-pre-wrap">{description.usage}</span>
                </div>
              </div>
            )}

            {description.limitations && (
              <div id="description-limitations">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Limitations</div>
                <div className="mt-1 text-sm text-gray-900">
                  <span className="whitespace-pre-wrap">{description.limitations}</span>
                </div>
              </div>
            )}

            {description.customProperties && Array.isArray(description.customProperties) && description.customProperties.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-500 mb-2">Custom Properties</div>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {description.customProperties.map((customProp, index) => (
                    <div key={index} className="min-w-0">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide inline-flex items-center gap-1">
                        {customProp.property}
                        {customProp.description && (
                          <Tooltip content={customProp.description}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-400 cursor-help">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                          </Tooltip>
                        )}
                      </div>
                      <div className="text-sm text-gray-900">
                        <span className="whitespace-pre-wrap">{customProp.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {description.authoritativeDefinitions && Array.isArray(description.authoritativeDefinitions) && description.authoritativeDefinitions.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-500 mb-2">Authoritative Definitions</div>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {description.authoritativeDefinitions.map((def, index) => (
                    <div key={index} id={`description-authoritative-definition-${index}`} className="min-w-0">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide inline-flex items-center gap-1">
                        {def.type}
                        {def.description && (
                          <Tooltip content={def.description}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-400 cursor-help">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                          </Tooltip>
                        )}
                      </div>
                      <div className="text-sm text-gray-900">
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
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DescriptionPreview;
