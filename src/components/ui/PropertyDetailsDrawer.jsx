import { useState, useEffect, useCallback } from 'react';
import PropertyDetailsPanel from '../diagram/PropertyDetailsPanel.jsx';
import {useEditorStore} from "../../store.js";
import {useShallow} from "zustand/react/shallow";

// Streamline X icon (Lucide Line)
const XIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6 6 18" strokeWidth="2"></path>
    <path d="m6 6 12 12" strokeWidth="2"></path>
  </svg>
);

const MIN_WIDTH = 280;
const MAX_WIDTH_PERCENT = 0.8;

/**
 * PropertyDetailsDrawer - A non-modal slide-out drawer for editing property details
 * Does not block interaction with the main content when open.
 * Resizable by dragging the left edge.
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether the drawer is open
 * @param {Function} props.onClose - Callback when the drawer should close
 * @param {Object} props.property - The property object to edit
 * @param {Function} props.onUpdate - Callback when the property is updated
 * @param {Function} props.onDelete - Callback when the property should be deleted
 * @param {React.Ref} ref - Forwarded ref for click outside detection
 */
const PropertyDetailsDrawer = function PropertyDetailsDrawer({ open, onClose, propertyPath, ref }) {
	const property = useEditorStore(useShallow((state) => state.getValue(propertyPath)));
	const getValue = useEditorStore(useShallow((state) => state.getValue));
	const setValue = useEditorStore(useShallow((state) => state.setValue));
	const setProperty = (fieldPath, value) => {
		// fieldPath is relative to property, so we need to prefix with propertyPath
		const fullPath = `${propertyPath}.${fieldPath}`;
		setValue(fullPath, value);
	}

	const removeProperty = (pathToRemove) => {
		// Extract parent array path and index
		// e.g., "schema[0].properties[2]" -> parent: "schema[0].properties", index: 2
		const lastBracketIndex = pathToRemove.lastIndexOf('[');
		if (lastBracketIndex === -1) {
			console.error('Cannot remove property: invalid path format', pathToRemove);
			return;
		}

		const parentPath = pathToRemove.substring(0, lastBracketIndex);
		const indexStr = pathToRemove.substring(lastBracketIndex + 1, pathToRemove.length - 1);
		const index = parseInt(indexStr, 10);

		if (isNaN(index)) {
			console.error('Cannot remove property: invalid index', indexStr);
			return;
		}

		const parentArray = getValue(parentPath);
		if (!Array.isArray(parentArray)) {
			console.error('Cannot remove property: parent is not an array', parentPath);
			return;
		}

		const newArray = parentArray.filter((_, idx) => idx !== index);
		setValue(parentPath, newArray);
	};

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

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

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

  // Always render the container for the ref, but hide it when no property
  if (!property) {
    return <div ref={ref} className="hidden" />;
  }

  return (
    <div
      ref={ref}
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
              {property.name ? `Edit Property: ${property.name}` : 'Edit Property'}
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
          <PropertyDetailsPanel
            property={property}
            onUpdate={setProperty}
            onDelete={() => removeProperty(propertyPath)}
          />
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsDrawer;
