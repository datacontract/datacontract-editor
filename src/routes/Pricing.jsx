import { useEditorStore } from '../store.js';
import { Tooltip } from '../components/ui/index.js';
import QuestionMarkCircleIcon from '../components/ui/icons/QuestionMarkCircleIcon.jsx';
import {useShallow} from "zustand/react/shallow";

const Pricing = () => {
	const price = useEditorStore(useShallow((state) => state.getValue('price')));
	const setValue = useEditorStore(useShallow((state) => state.setValue));


  // Update YAML when form fields change
  const updateField = (field, value) => {
    try {
			const newPrice = price || {};

      // Update the field
      if (field === 'priceAmount') {
        const numValue = value === '' ? undefined : parseFloat(value);
        if (numValue !== undefined && !isNaN(numValue)) {
          newPrice.priceAmount = numValue;
        } else if (value === '') {
          delete newPrice.priceAmount;
        }
      } else {
        newPrice[field] = value || undefined;
      }

      // Remove price object if empty
			// TODO: Implement removal of complete sections
      if (Object.keys(newPrice).length === 0) {
				setValue('price', null);
      }

      // Convert back to YAML
			setValue('price', newPrice);
    } catch (error) {
      console.error('Error updating YAML:', error);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold leading-6 text-gray-900 mb-3">Pricing</h3>
            <p className="mt-1 text-xs leading-4 text-gray-500 mb-4">
              Define subscription cost structure for data access.
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-3">
                {/* Price Amount Field */}
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <label htmlFor="priceAmount" className="block text-xs font-medium leading-4 text-gray-900">
                      Price Amount
                    </label>
                    <Tooltip content="Subscription price per unit">
                      <QuestionMarkCircleIcon />
                    </Tooltip>
                  </div>
                  <input
                    type="number"
                    name="priceAmount"
                    id="priceAmount"
                    step="0.01"
                    value={price?.priceAmount}
                    onChange={(e) => updateField('priceAmount', e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 text-xs leading-4"
                    placeholder="9.99"
                  />
                </div>

                {/* Price Currency Field */}
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <label htmlFor="priceCurrency" className="block text-xs font-medium leading-4 text-gray-900">
                      Currency
                    </label>
                    <Tooltip content="Currency code (e.g., USD, EUR)">
                      <QuestionMarkCircleIcon />
                    </Tooltip>
                  </div>
                  <input
                    type="text"
                    name="priceCurrency"
                    id="priceCurrency"
                    value={price?.priceCurrency}
                    onChange={(e) => updateField('priceCurrency', e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 text-xs leading-4"
                    placeholder="USD"
                  />
                </div>

                {/* Price Unit Field */}
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <label htmlFor="priceUnit" className="block text-xs font-medium leading-4 text-gray-900">
                      Price Unit
                    </label>
                    <Tooltip content="Unit of measurement (e.g., megabyte, gigabyte)">
                      <QuestionMarkCircleIcon />
                    </Tooltip>
                  </div>
                  <input
                    type="text"
                    name="priceUnit"
                    id="priceUnit"
                    value={price?.priceUnit}
                    onChange={(e) => updateField('priceUnit', e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 text-xs leading-4"
                    placeholder="megabyte"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
