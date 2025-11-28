import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import PropertyDetailsPanel from '../diagram/PropertyDetailsPanel.jsx';

// Streamline X icon (Lucide Line)
const XIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6 6 18" strokeWidth="2"></path>
    <path d="m6 6 12 12" strokeWidth="2"></path>
  </svg>
);

/**
 * PropertyDetailsDrawer - A slide-out drawer for editing property details
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether the drawer is open
 * @param {Function} props.onClose - Callback when the drawer should close
 * @param {Object} props.property - The property object to edit
 * @param {Function} props.onUpdate - Callback when the property is updated
 * @param {Function} props.onDelete - Callback when the property should be deleted
 */
const PropertyDetailsDrawer = ({ open, onClose, property, onUpdate, onDelete }) => {
  if (!property) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      {/* Backdrop - transparent to keep content visible */}
      <div className="fixed inset-0" aria-hidden="true" />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <DialogPanel
              transition
              className="pointer-events-auto w-screen max-w-xs transform transition duration-300 ease-in-out data-[closed]:translate-x-full"
            >
              <div className="flex h-full flex-col overflow-y-auto bg-white shadow-xl">
                {/* Header */}
                <div className="bg-gray-50 px-3 py-3 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <DialogTitle className="text-base font-semibold text-gray-900 truncate">
                      {property.name ? `Edit Property: ${property.name}` : 'Edit Property'}
                    </DialogTitle>
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
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default PropertyDetailsDrawer;
