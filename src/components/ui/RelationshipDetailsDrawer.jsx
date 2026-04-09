import { useState, useEffect, useCallback } from 'react';
import { useEditorStore } from '../../store.js';
import { useShallow } from 'zustand/react/shallow';
import { RelationshipCard, useSchemaPropertySuggestions } from './RelationshipEditor.jsx';

// Streamline X icon (Lucide Line)
const XIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6 6 18" strokeWidth="2"></path>
    <path d="m6 6 12 12" strokeWidth="2"></path>
  </svg>
);

const MIN_WIDTH = 280;
const MAX_WIDTH_PERCENT = 0.8;
const RELATIONSHIP_TYPE_OPTIONS = ['foreignKey'];

/**
 * RelationshipDetailsDrawer — focused editor for a single relationship that
 * owns a diagram edge. Opened by clicking an edge in the diagram. Edits and
 * delete are written directly to the source property's `relationships` array
 * via the editor store. Lives alongside (not inside) PropertyDetailsDrawer.
 *
 * @param {Object} props
 * @param {boolean} props.open
 * @param {Function} props.onClose
 * @param {string} props.sourcePropertyPath - path of the source property, e.g. "schema[0].properties[2]"
 * @param {number} props.relationshipIndex - index within source.relationships
 */
const RelationshipDetailsDrawer = ({ open, onClose, sourcePropertyPath, relationshipIndex }) => {
  const getValue = useEditorStore(useShallow((state) => state.getValue));
  const setValue = useEditorStore(useShallow((state) => state.setValue));

  const relationshipsPath = sourcePropertyPath ? `${sourcePropertyPath}.relationships` : null;
  const relationships = useEditorStore(
    useShallow((state) => (relationshipsPath ? state.getValue(relationshipsPath) : null))
  );
  const sourceProperty = useEditorStore(
    useShallow((state) => (sourcePropertyPath ? state.getValue(sourcePropertyPath) : null))
  );

  const schemaPropertySuggestions = useSchemaPropertySuggestions();
  const validPaths = schemaPropertySuggestions.map(s => s.name);

  const relationship = Array.isArray(relationships) && relationshipIndex != null
    ? relationships[relationshipIndex]
    : null;

  // Update one or more fields on the current relationship. Matches the
  // signature RelationshipCard expects: (index, fieldName|object, value?)
  const handleUpdate = useCallback((_index, fieldName, fieldValue) => {
    const current = getValue(relationshipsPath);
    if (!Array.isArray(current)) return;
    const next = [...current];
    if (typeof fieldName === 'object') {
      next[relationshipIndex] = { ...next[relationshipIndex], ...fieldName };
    } else {
      next[relationshipIndex] = { ...next[relationshipIndex], [fieldName]: fieldValue };
    }
    setValue(relationshipsPath, next);
  }, [getValue, setValue, relationshipsPath, relationshipIndex]);

  // Remove this relationship from the array and close the drawer.
  const handleRemove = useCallback(() => {
    const current = getValue(relationshipsPath);
    if (!Array.isArray(current)) return;
    const next = current.filter((_, i) => i !== relationshipIndex);
    setValue(relationshipsPath, next.length > 0 ? next : undefined);
    onClose?.();
  }, [getValue, setValue, relationshipsPath, relationshipIndex, onClose]);

  // Resize handling (same pattern as PropertyDetailsDrawer).
  const [width, setWidth] = useState(null);
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isResizing) return;
    const newWidth = window.innerWidth - e.clientX;
    const maxWidth = window.innerWidth * MAX_WIDTH_PERCENT;
    const clampedWidth = Math.min(Math.max(newWidth, MIN_WIDTH), maxWidth);
    setWidth(clampedWidth);
  }, [isResizing]);

  const handleMouseUp = useCallback(() => setIsResizing(false), []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  if (!relationship) {
    return <div className="hidden" />;
  }

  const sourceLabel = sourceProperty?.name || 'property';

  return (
    <div
      data-drawer-panel="relationship"
      style={width ? { width: `${width}px` } : undefined}
      className={`fixed inset-y-0 right-0 z-40 ${
        width ? '' : 'w-screen max-w-[calc(100vw-3rem)] sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg'
      } transform transition-transform ${isResizing ? '' : 'duration-300'} ease-in-out ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-indigo-500/50 active:bg-indigo-500 transition-colors z-10"
        title="Drag to resize"
      />

      <div className="flex h-full flex-col overflow-y-auto bg-white shadow-xl">
        {/* Header */}
        <div className="bg-gray-50 px-3 py-3 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <h2 className="text-sm font-semibold text-gray-900 truncate">
              Edit Relationship on <span className="font-mono">{sourceLabel}</span>
            </h2>
            <div className="ml-2 flex h-6 items-center">
              <button
                type="button"
                onClick={onClose}
                className="relative rounded-md bg-gray-50 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <span className="absolute -inset-2.5" />
                <span className="sr-only">Close panel</span>
                <XIcon aria-hidden="true" className="size-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative flex-1 px-3 py-3 overflow-y-auto">
          <RelationshipCard
            item={relationship}
            index={relationshipIndex}
            relationshipTypeOptions={RELATIONSHIP_TYPE_OPTIONS}
            schemaPropertySuggestions={schemaPropertySuggestions}
            validPaths={validPaths}
            showFrom={false}
            onUpdate={handleUpdate}
            onRemove={handleRemove}
            defaultExpanded={true}
          />
        </div>
      </div>
    </div>
  );
};

export default RelationshipDetailsDrawer;
