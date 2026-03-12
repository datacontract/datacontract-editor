import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import Tooltip from './Tooltip.jsx';
import { IconResolver } from './IconResolver.jsx';
import QuestionMarkCircleIcon from './icons/QuestionMarkCircleIcon.jsx';
import {useEditorStore} from "../../store.js";
import {useShallow} from "zustand/react/shallow";

const hasHeadline = (text) => /^#{1,6}\s/m.test(text || '');
const LINE_HEIGHT_REM = 1.25;
const MAX_COLLAPSED_LINES = 10;
const MAX_HEIGHT = `${MAX_COLLAPSED_LINES * LINE_HEIGHT_REM}rem`;

const MarkdownField = ({ id, label, text }) => {
  const isDocument = hasHeadline(text);
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      const maxPx = MAX_COLLAPSED_LINES * LINE_HEIGHT_REM * parseFloat(getComputedStyle(document.documentElement).fontSize);
      setIsOverflowing(contentRef.current.scrollHeight > maxPx);
    }
  }, [text]);

  return (
    <div id={id}>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className={"mt-1 text-sm text-gray-700 prose prose-sm max-w-full"}>
        {isDocument ? (
          <>
            <div
              ref={contentRef}
              className="overflow-hidden transition-[max-height] duration-200"
              style={{ maxHeight: expanded || !isOverflowing ? 'none' : MAX_HEIGHT }}
            >
              <ReactMarkdown>{text}</ReactMarkdown>
            </div>
            {isOverflowing && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="mt-0.5 mb-3 text-xs text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                {expanded ? 'Show less' : 'Show more...'}
              </button>
            )}
          </>
        ) : (
          <ReactMarkdown>{text}</ReactMarkdown>
        )}
      </dd>
    </div>
  );
};

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
              <MarkdownField id="description-purpose" label="Purpose" text={description.purpose} />
            )}

            {description.usage && (
              <MarkdownField id="description-usage" label="Usage" text={description.usage} />
            )}

            {description.limitations && (
              <MarkdownField id="description-limitations" label="Limitations" text={description.limitations} />
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
