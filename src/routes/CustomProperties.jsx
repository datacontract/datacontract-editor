import { useMemo } from 'react';
import { useEditorStore } from '../store.js';
import CustomPropertiesEditor from '../components/ui/CustomPropertiesEditor.jsx';
import { stringifyYaml, parseYaml } from '../utils/yaml.js';

const CustomProperties = () => {
  const yaml = useEditorStore((state) => state.yaml);
  const setYaml = useEditorStore((state) => state.setYaml);

  // Parse current YAML to extract form values
  const formData = useMemo(() => {
    if (!yaml?.trim()) {
      return { customProperties: [] };
    }

    try {
      const parsed = parseYaml(yaml);
      return {
        customProperties: parsed.customProperties || []
      };
    } catch {
      return { customProperties: [] };
    }
  }, [yaml]);

  // Update YAML when custom properties change
  const handleChange = (value) => {
    try {
      let parsed = {};
      if (yaml?.trim()) {
        try {
          parsed = parseYaml(yaml) || {};
        } catch {
          parsed = {};
        }
      }

      if (value && value.length > 0) {
        parsed.customProperties = value;
      } else {
        delete parsed.customProperties;
      }

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
            <h3 className="text-base font-semibold leading-6 text-gray-900 mb-3">Custom Properties</h3>
            <p className="mt-1 text-xs leading-4 text-gray-500 mb-4">
              A list of key/value pairs for custom properties. Names should be in camel case.
            </p>

            <CustomPropertiesEditor
              value={formData.customProperties}
              onChange={handleChange}
              showDescription={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomProperties;
