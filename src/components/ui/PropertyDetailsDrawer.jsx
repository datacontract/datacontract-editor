import { forwardRef } from 'react';
import PropertyDetailsPanel from '../diagram/PropertyDetailsPanel.jsx';

// Streamline X icon (Lucide Line)
const XIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6 6 18" strokeWidth="2"></path>
    <path d="m6 6 12 12" strokeWidth="2"></path>
  </svg>
);

/**
 * PropertyDetailsDrawer - A non-modal slide-out drawer for editing property details
 * Does not block interaction with the main content when open.
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether the drawer is open
 * @param {Function} props.onClose - Callback when the drawer should close
 * @param {Object} props.property - The property object to edit
 * @param {Function} props.onUpdate - Callback when the property is updated
 * @param {Function} props.onDelete - Callback when the property should be deleted
 * @param {React.Ref} ref - Forwarded ref for click outside detection
 */
const PropertyDetailsDrawer = forwardRef(function PropertyDetailsDrawer({ open, onClose, property, onUpdate, onDelete }, ref) {
  // Always render the container for the ref, but hide it when no property
  if (!property) {
    return <div ref={ref} className="hidden" />;
  }

  return (
    <div
      ref={ref}
      className={`fixed inset-y-0 right-0 z-40 w-screen max-w-[calc(100vw-3rem)] sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg transform transition-transform duration-300 ease-in-out ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
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
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        </div>
      </div>
    </div>
  );
});

export default PropertyDetailsDrawer;
