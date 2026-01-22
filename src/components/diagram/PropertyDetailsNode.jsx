import { memo, useRef, useEffect, useState } from 'react';
import PropertyDetailsPanel from './PropertyDetailsPanel.jsx';

const PropertyDetailsNode = ({ data }) => {
  const { property, onUpdate, onDelete, onClose, openMethod, onPinnedChange, initialPinned } = data;
  const closeTimeoutRef = useRef(null);
  const panelRef = useRef(null);
  const [isPinned, setIsPinned] = useState(initialPinned !== undefined ? initialPinned : (openMethod === 'click'));
  const [isInteracting, setIsInteracting] = useState(false);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is inside a dialog/modal (Headless UI adds data-headlessui-state)
      const isInsideDialog = event.target.closest('[role="dialog"]') ||
                            event.target.closest('[data-headlessui-state]');

      if (panelRef.current && !panelRef.current.contains(event.target) && !isInsideDialog) {
        onClose();
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      // Cleanup event listener
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Sync local pinned state with parent's initialPinned prop when it changes
  useEffect(() => {
    if (initialPinned !== undefined && initialPinned !== isPinned) {
      setIsPinned(initialPinned);
    }
  }, [initialPinned]);

  // Notify parent when pinned state changes (only when user toggles it)
  const prevIsPinnedRef = useRef(isPinned);
  useEffect(() => {
    if (onPinnedChange && prevIsPinnedRef.current !== isPinned) {
      onPinnedChange(isPinned);
      prevIsPinnedRef.current = isPinned;
    }
  }, [isPinned, onPinnedChange]);

  const handleWheel = (e) => {
    e.stopPropagation();
  };

  const handleMouseEnter = () => {
    // Clear any pending close timeout when hovering over the panel
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    // Only auto-close if not pinned and not actively interacting with inputs
    if (!isPinned && !isInteracting) {
      // Set a delay before closing the panel (500ms)
      closeTimeoutRef.current = setTimeout(() => {
        onClose();
      }, 500);
    }
  };

  const handleHeaderClick = (e) => {
    e.stopPropagation();
    setIsPinned(!isPinned);
  };

  return (
    <div
      ref={panelRef}
      className={`bg-white rounded-lg shadow-xl border-1 ${isPinned ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-400 ring-1 ring-gray-400'} w-96 max-h-[80vh] overflow-hidden flex flex-col nodrag nopan`}
      style={{ pointerEvents: 'all' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="property-details-title"
      onWheel={handleWheel}
      onWheelCapture={handleWheel}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={() => setIsInteracting(true)}
      onBlur={() => setIsInteracting(false)}
    >
      {/* Header */}
      <div
        className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={handleHeaderClick}
        title={isPinned ? "Click to unpin" : "Click to pin panel open"}
      >
        <h3 id="property-details-title" className="text-sm font-semibold text-gray-900">
          Edit Property: {property.name || 'unnamed'}
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Close"
          type="button"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <PropertyDetailsPanel
          property={property}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
};

export default memo(PropertyDetailsNode);
