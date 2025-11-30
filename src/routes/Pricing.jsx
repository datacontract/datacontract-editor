import { useMemo } from 'react';
import { useEditorStore } from '../store.js';
import { Tooltip } from '../components/ui/index.js';
import QuestionMarkCircleIcon from '../components/ui/icons/QuestionMarkCircleIcon.jsx';
import { stringifyYaml, parseYaml } from '../utils/yaml.js';

const Pricing = () => {
  const yaml = useEditorStore((state) => state.yaml);
  const setYaml = useEditorStore((state) => state.setYaml);
  const currentView = useEditorStore((state) => state.currentView);

  // Parse current YAML to extract form values
  const formData = useMemo(() => {
    if (!yaml?.trim()) {
      return {
        priceAmount: '',
        priceCurrency: '',
        priceUnit: ''
      };
    }

    try {
      const parsed = parseYaml(yaml);
      const price = parsed.price || {};
      return {
        priceAmount: price.priceAmount ?? '',
        priceCurrency: price.priceCurrency || '',
        priceUnit: price.priceUnit || ''
      };
    } catch {
      return {
        priceAmount: '',
        priceCurrency: '',
        priceUnit: ''
      };
    }
  }, [yaml]);

  // Update YAML when form fields change
  const updateField = (field, value) => {
    try {
      let parsed = {};
      if (yaml?.trim()) {
        try {
          parsed = parseYaml(yaml) || {};
        } catch {
          parsed = {};
        }
      }

      if (!parsed.price) {
        parsed.price = {};
      }

      // Update the field
      if (field === 'priceAmount') {
        const numValue = value === '' ? undefined : parseFloat(value);
        if (numValue !== undefined && !isNaN(numValue)) {
          parsed.price.priceAmount = numValue;
        } else if (value === '') {
          delete parsed.price.priceAmount;
        }
      } else {
        parsed.price[field] = value || undefined;
      }

      // Remove price object if empty
      if (Object.keys(parsed.price).length === 0) {
        delete parsed.price;
      }

      // Convert back to YAML
      const newYaml = stringifyYaml(parsed);
      setYaml(newYaml);
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
                    value={formData.priceAmount}
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
                    value={formData.priceCurrency}
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
                    value={formData.priceUnit}
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
