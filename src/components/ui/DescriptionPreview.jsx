import Tooltip from './Tooltip.jsx';
import { IconResolver } from './IconResolver.jsx';

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
          {/* Authoritative Definitions Section */}
          {description.authoritativeDefinitions && Array.isArray(description.authoritativeDefinitions) && description.authoritativeDefinitions.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {description.authoritativeDefinitions.map((def, index) => (
                <a
                  key={index}
                  id={`description-authoritative-definition-${index}`}
                  href={def.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col text-center rounded-md bg-white px-3 py-3 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:ring-indigo-300 transition-colors"
                  style={{ minWidth: '120px' }}
                  title={def.description}
                >
                  <div className="mx-auto w-8 h-8 mb-2 text-gray-500">
                    <IconResolver url={def.url} type={def.type} className="w-full h-full" />
                  </div>
                  <div className="text-xs font-medium">{def.type}</div>
                </a>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3">
            {description.purpose && (
              <div id="description-purpose">
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Purpose</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <span className="whitespace-pre-wrap">{description.purpose}</span>
                </dd>
              </div>
            )}

            {description.usage && (
              <div id="description-usage">
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Usage</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <span className="whitespace-pre-wrap">{description.usage}</span>
                </dd>
              </div>
            )}

            {description.limitations && (
              <div id="description-limitations">
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Limitations</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <span className="whitespace-pre-wrap">{description.limitations}</span>
                </dd>
              </div>
            )}

            {description.customProperties && Array.isArray(description.customProperties) && description.customProperties.length > 0 && (
              <div>
                <dt className="text-sm font-medium text-gray-500 mb-2">Custom Properties</dt>
                <dd className="flex flex-wrap gap-x-4 gap-y-2">
                  {description.customProperties.map((customProp, index) => (
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default DescriptionPreview;
