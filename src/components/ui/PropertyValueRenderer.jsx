/**
 * PropertyValueRenderer - Recursively renders complex property values
 * Handles primitives, arrays, objects, and nested structures
 */
export default function PropertyValueRenderer({ value, depth = 0 }) {
  // Handle null or undefined
  if (value === null || value === undefined) {
    return <span className="text-gray-400 italic">null</span>;
  }

  // Handle primitives
  if (typeof value === 'string') {
    return <span className="text-gray-900">{value}</span>;
  }

  if (typeof value === 'number') {
    return <span className="text-blue-600 font-mono">{value}</span>;
  }

  if (typeof value === 'boolean') {
    return <span className="text-purple-600 font-mono">{value.toString()}</span>;
  }

  // Handle arrays
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-gray-400 italic">[]</span>;
    }

    // Check if array contains only primitives for compact display
    const allPrimitives = value.every(item =>
      typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean'
    );

    if (allPrimitives && value.length <= 3) {
      return (
        <span className="text-gray-900">
          [{value.map((item, idx) => (
            <span key={idx}>
              <PropertyValueRenderer value={item} depth={depth + 1} />
              {idx < value.length - 1 && ', '}
            </span>
          ))}]
        </span>
      );
    }

    // Display array items as a list
    return (
      <div className="space-y-2">
        {value.map((item, index) => (
          <div key={index} className="flex gap-2">
            <span className="text-gray-500 font-mono text-xs flex-shrink-0">•</span>
            <div className="flex-1">
              <PropertyValueRenderer value={item} depth={depth + 1} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Handle objects
  if (typeof value === 'object') {
    const entries = Object.entries(value);

    if (entries.length === 0) {
      return <span className="text-gray-400 italic">{'{}'}</span>;
    }

    return (
      <div className={`space-y-2 ${depth > 0 ? 'pl-4 border-l-2 border-gray-200' : ''}`}>
        {entries.map(([key, val]) => (
          <div key={key} className="flex flex-col sm:flex-row sm:gap-4">
            <div className="text-sm font-medium text-gray-700 min-w-[120px]">
              {key}:
            </div>
            <div className="text-sm text-gray-900 flex-1">
              <PropertyValueRenderer value={val} depth={depth + 1} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Fallback for unknown types
  return <span className="text-gray-500">{String(value)}</span>;
}
