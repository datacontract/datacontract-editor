/**
 * Small shared UI pieces for the browse panel sources.
 */
import { Tooltip } from '../ui/index.js';

/**
 * Marker on a tree row whose element is already used in the edited contract.
 * The icon differs per source (blue semantic link vs green check); the
 * tooltip names the linking schema/properties.
 */
export function LinkedBadge({ tooltip, children }) {
  return (
    <span data-linked-badge className="flex-shrink-0 flex items-center">
      <Tooltip content={tooltip}>{children}</Tooltip>
    </span>
  );
}

export const LinkIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor">
    <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
    <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
  </svg>
);

export function BrowseSearchInput({ value, onChange, placeholder }) {
  return (
    <div className="flex-shrink-0 border-b border-gray-200 px-3 py-2">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
          <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
          </svg>
        </div>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full rounded-md border-0 py-1 pl-8 pr-3 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
        />
      </div>
    </div>
  );
}

export function PanelHint({ text }) {
  return (
    <div className="flex-shrink-0 border-t border-gray-100 bg-gray-50 px-3 py-1.5 text-xs text-gray-500">
      {text}
    </div>
  );
}

export function TreeChevron({ hasChildren, isExpanded, onToggle }) {
  if (!hasChildren) return <span className="w-4 flex-shrink-0" />;
  return (
    <button type="button" onClick={onToggle} className="w-4 flex-shrink-0 flex items-center justify-center">
      <svg className={`size-3.5 text-gray-400 transition-transform ${isExpanded ? '' : '-rotate-90'}`} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
      </svg>
    </button>
  );
}

export const ExternalLinkIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 0 0 1.06.053L16.5 4.44v2.81a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h2.553l-9.056 8.194a.75.75 0 0 0-.053 1.06Z" clipRule="evenodd" />
  </svg>
);

export function OpenDetailsButton({ url, label }) {
  if (!url) return null;
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); window.open(url, '_blank', 'noopener'); }}
      className="flex-shrink-0 rounded p-0.5 text-gray-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
      title={label}
      data-open-details
    >
      <span className="sr-only">{label}</span>
      <ExternalLinkIcon className="h-3.5 w-3.5" />
    </button>
  );
}

// Same table glyph as the diagram node header.
export const TableIcon = () => (
  <svg className="size-4 text-gray-500 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
    <path d="M1.930848 1.960304C1.164656 2.0890560000000002 0.5672480000000001 2.720784 0.481104 3.493344C0.45718400000000003 3.707872 0.45718400000000003 12.292128000000002 0.481104 12.506656000000001C0.556416 13.182064 1.023328 13.757952 1.67112 13.9744C1.955984 14.069584 1.5522719999999999 14.063872 8 14.063872C14.428111999999999 14.063872 14.025120000000001 14.069504 14.32 13.975567999999999C14.967136 13.769408 15.44312 13.186208 15.518896000000002 12.506656000000001C15.542816 12.292128000000002 15.542816 3.707872 15.518896000000002 3.493344C15.432112 2.714992 14.832336 2.0853919999999997 14.058 1.959808C13.930848000000001 1.939184 13.146432 1.936336 7.984 1.937712C3.166448 1.938992 2.03256 1.9432159999999998 1.930848 1.960304M1.981696 2.981056C1.74744 3.060912 1.557504 3.262384 1.4968320000000002 3.4953600000000002C1.475616 3.576832 1.472 3.742864 1.472 4.6353599999999995L1.472 5.68 8 5.68L14.528 5.68 14.528 4.6353599999999995C14.528 3.742864 14.524384 3.576832 14.503168 3.4953600000000002C14.441392 3.258128 14.239951999999999 3.0488000000000004 14.002992 2.975616C13.901808 2.944368 13.832176 2.944 7.99432 2.9444160000000004L2.088 2.944832 1.981696 2.981056M1.472 8.064L1.472 9.44 3.3120000000000003 9.44L5.152 9.44 5.152 8.064L5.152 6.688 3.3120000000000003 6.688L1.472 6.688 1.472 8.064M6.16 8.064L6.16 9.44 8 9.44L9.84 9.44 9.84 8.064L9.84 6.688 8 6.688L6.16 6.688 6.16 8.064M10.848 8.064L10.848 9.44 12.688 9.44L14.528 9.44 14.528 8.064L14.528 6.688 12.688 6.688L10.848 6.688 10.848 8.064M1.472 11.420639999999999C1.472 12.262528 1.47568 12.423440000000001 1.4968320000000002 12.50464C1.558608 12.741871999999999 1.760048 12.951200000000002 1.9970080000000001 13.024384C2.09592 13.054943999999999 2.1507359999999998 13.056000000000001 3.62568 13.056000000000001L5.152 13.056000000000001 5.152 11.744L5.152 10.432 3.3120000000000003 10.432L1.472 10.432 1.472 11.420639999999999M6.16 11.744L6.16 13.056000000000001 8 13.056000000000001L9.84 13.056000000000001 9.84 11.744L9.84 10.432 8 10.432L6.16 10.432 6.16 11.744M10.848 11.744L10.848 13.056000000000001 12.374319999999999 13.056000000000001C13.849264 13.056000000000001 13.90408 13.054943999999999 14.002992 13.024384C14.239951999999999 12.951200000000002 14.441392 12.741871999999999 14.503168 12.50464C14.52432 12.423440000000001 14.528 12.262528 14.528 11.420639999999999L14.528 10.432 12.688 10.432L10.848 10.432 10.848 11.744" fillRule="evenodd" />
  </svg>
);
