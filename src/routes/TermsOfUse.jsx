import { useEditorStore } from '../store.js';
import { Tooltip } from '../components/ui/index.js';
import AuthoritativeDefinitionsEditor from '../components/ui/AuthoritativeDefinitionsEditor.jsx';
import CustomPropertiesEditor from '../components/ui/CustomPropertiesEditor.jsx';
import QuestionMarkCircleIcon from '../components/ui/icons/QuestionMarkCircleIcon.jsx';
import { SparkleButton } from '../ai/index.js';
import {useShallow} from "zustand/react/shallow";

const TermsOfUse = () => {
	const description = useEditorStore(useShallow((state) => state.getValue('description'))) || {};
	const setYamlValue = useEditorStore(useShallow((state) => state.setValue));

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">

          {/* Terms of Use Section */}
          <div>
            <h3 className="text-base font-semibold leading-6 text-gray-900 mb-3">Terms of Use</h3>
            <p className="text-sm text-gray-500 mb-4">High level description of the dataset including purpose, usage guidelines, and limitations.</p>
            <div className="space-y-3">
              {/* Purpose Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <label htmlFor="description-purpose" className="block text-xs font-medium leading-4 text-gray-900">
                      Purpose
                    </label>
                    <Tooltip content="Intended purpose for the provided data">
                      <QuestionMarkCircleIcon />
                    </Tooltip>
                  </div>
                  <SparkleButton
                    fieldName="Purpose"
                    fieldPath="description.purpose"
                    currentValue={description?.purpose}
                    onSuggestion={(value) => setYamlValue('description.purpose', value)}
                    placeholder="Intended purpose for the provided data"
                  />
                </div>
                <textarea
                  id="description-purpose"
                  name="description-purpose"
                  rows={3}
                  value={description?.purpose}
                  onChange={(e) => setYamlValue('description.purpose', e.target.value)}
                  className="mt-1 block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 text-xs leading-4"
                  placeholder="Describe the purpose of this data contract..."
                />
              </div>

              {/* Usage Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <label htmlFor="description-usage" className="block text-xs font-medium leading-4 text-gray-900">
                      Usage
                    </label>
                    <Tooltip content="How this data should be used">
                      <QuestionMarkCircleIcon />
                    </Tooltip>
                  </div>
                  <SparkleButton
                    fieldName="Usage"
                    fieldPath="description.usage"
                    currentValue={description?.usage}
                    onSuggestion={(value) => setYamlValue('description.usage', value)}
                    placeholder="How this data should be used"
                  />
                </div>
                <textarea
                  id="description-usage"
                  name="description-usage"
                  rows={3}
                  value={description?.usage}
                  onChange={(e) => setYamlValue('description.usage', e.target.value)}
                  className="mt-1 block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 text-xs leading-4"
                  placeholder="Describe how to use this data..."
                />
              </div>

              {/* Limitations Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <label htmlFor="description-limitations" className="block text-xs font-medium leading-4 text-gray-900">
                      Limitations
                    </label>
                    <Tooltip content="Technical, compliance, and legal limitations for data use">
                      <QuestionMarkCircleIcon />
                    </Tooltip>
                  </div>
                  <SparkleButton
                    fieldName="Limitations"
                    fieldPath="description.limitations"
                    currentValue={description?.limitations}
                    onSuggestion={(value) => setYamlValue('description.limitations', value)}
                    placeholder="Technical, compliance, and legal limitations for data use"
                  />
                </div>
                <textarea
                  id="description-limitations"
                  name="description-limitations"
                  rows={3}
                  value={description?.limitations}
                  onChange={(e) => setYamlValue('description.limitations', e.target.value)}
                  className="mt-1 block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 text-xs leading-4"
                  placeholder="Describe any limitations or constraints..."
                />
              </div>

              {/* Authoritative Definitions Field */}
              <div>
                <AuthoritativeDefinitionsEditor
                  value={description?.authoritativeDefinitions}
                  onChange={(value) => setYamlValue('description.authoritativeDefinitions', value)}
                />
              </div>

              {/* Custom Properties Field */}
              <div>
                <CustomPropertiesEditor
                  value={description?.customProperties}
                  onChange={(value) => setYamlValue('description.customProperties', value)}
                  showDescription={true}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
