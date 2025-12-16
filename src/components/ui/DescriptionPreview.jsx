import Tooltip from './Tooltip.jsx';
import { IconResolver } from './IconResolver.jsx';
import QuestionMarkCircleIcon from './icons/QuestionMarkCircleIcon.jsx';
import {useEditorStore} from "../../store.js";
import {useShallow} from "zustand/react/shallow";

const DescriptionPreview = () => {
	const description = useEditorStore(useShallow(state => state.getValue('description')));
  if (!description) return null;

  // Check for custom properties - handle both array and object formats
  const hasCustomProperties = description.customProperties && (
    Array.isArray(description.customProperties) ? description.customProperties.length > 0 :
    typeof description.customProperties === 'object' && Object.keys(description.customProperties).length > 0
  );

  const hasContent = description.purpose || description.usage || description.limitations ||
    (description.authoritativeDefinitions && description.authoritativeDefinitions.length > 0) ||
    hasCustomProperties;

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

            {hasCustomProperties && (() => {
              // Normalize to array format for rendering
              const normalizedCustomProps = Array.isArray(description.customProperties)
                ? description.customProperties
                : Object.entries(description.customProperties).map(([key, value]) => ({
                    property: key,
                    value: value,
                  }));
              return (
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-2">Custom Properties</div>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {normalizedCustomProps.map((customProp, index) => (
                      <div key={index} className="min-w-0">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide inline-flex items-center gap-1">
                          {customProp.property}
                          {customProp.description && (
                            <Tooltip content={customProp.description}>
                              <QuestionMarkCircleIcon />
                            </Tooltip>
                          )}
                        </div>
                        <div className="text-sm text-gray-900">
                          <span className="whitespace-pre-wrap">
                            {typeof customProp.value === 'object' ? JSON.stringify(customProp.value) : String(customProp.value ?? '')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DescriptionPreview;
