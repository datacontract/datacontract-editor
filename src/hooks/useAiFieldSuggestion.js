import { useState, useCallback } from 'react';
import { useEditorStore } from '../store.js';
import { streamChatCompletion } from '../services/aiService.js';

/**
 * Hook for generating AI suggestions for form fields
 *
 * @param {object} options
 * @param {string} options.fieldName - Human-readable field name (e.g., "Purpose", "Description")
 * @param {string} options.fieldPath - YAML path for context (e.g., "description.purpose")
 * @param {string} options.placeholder - Example of what the field should contain
 * @returns {object} { suggest, isLoading, error }
 */
export function useAiFieldSuggestion({ fieldName, fieldPath, placeholder }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const editorConfig = useEditorStore((state) => state.editorConfig);
  const yaml = useEditorStore((state) => state.yaml);
  const yamlParts = useEditorStore((state) => state.yamlParts);

  const suggest = useCallback(async (currentValue = '') => {
    const aiConfig = editorConfig?.ai;

    if (!aiConfig?.enabled) {
      setError('AI is not enabled');
      return null;
    }

    if (!aiConfig?.endpoint || !aiConfig?.apiKey) {
      setError('AI endpoint or API key not configured');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Build context from the current contract
      const contractContext = buildContractContext(yamlParts);

      const systemPrompt = `You are an assistant helping write data contract documentation. Generate clear, professional content for data contract fields.

Rules:
- Be concise but informative
- Use professional technical language
- Match the tone and style of existing content
- Return ONLY the suggested text, no explanations or formatting
- Do not include quotes around the text
- Keep it to 1-3 sentences unless more detail is needed`;

      const userPrompt = buildFieldPrompt({
        fieldName,
        fieldPath,
        placeholder,
        currentValue,
        contractContext,
      });

      let suggestion = '';

      await streamChatCompletion({
        config: aiConfig,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        callbacks: {
          onContent: (chunk, full) => {
            suggestion = full;
          },
        },
      });

      // Clean up the suggestion
      suggestion = suggestion.trim();
      // Remove surrounding quotes if present
      if ((suggestion.startsWith('"') && suggestion.endsWith('"')) ||
          (suggestion.startsWith("'") && suggestion.endsWith("'"))) {
        suggestion = suggestion.slice(1, -1);
      }

      setIsLoading(false);
      return suggestion;
    } catch (err) {
      console.error('[AI Field Suggestion] Error:', err);
      setError(err.message);
      setIsLoading(false);
      return null;
    }
  }, [editorConfig, yamlParts, fieldName, fieldPath, placeholder]);

  return { suggest, isLoading, error };
}

/**
 * Build context string from contract parts
 */
function buildContractContext(yamlParts) {
  if (!yamlParts) return 'No contract data available';

  const parts = [];

  if (yamlParts.name) parts.push(`Contract Name: ${yamlParts.name}`);
  if (yamlParts.id) parts.push(`ID: ${yamlParts.id}`);
  if (yamlParts.domain) parts.push(`Domain: ${yamlParts.domain}`);
  if (yamlParts.dataProduct) parts.push(`Data Product: ${yamlParts.dataProduct}`);

  // Add schema info if available
  if (yamlParts.schema?.length > 0) {
    const schemaNames = yamlParts.schema.map(s => s.name).filter(Boolean).join(', ');
    if (schemaNames) parts.push(`Schemas: ${schemaNames}`);

    // List some properties for context
    const allProps = yamlParts.schema.flatMap(s => s.properties || []);
    const propNames = allProps.slice(0, 10).map(p => p.name).filter(Boolean).join(', ');
    if (propNames) parts.push(`Sample Properties: ${propNames}`);
  }

  // Add existing description fields for context
  if (yamlParts.description) {
    if (yamlParts.description.purpose) parts.push(`Existing Purpose: ${yamlParts.description.purpose}`);
    if (yamlParts.description.usage) parts.push(`Existing Usage: ${yamlParts.description.usage}`);
  }

  return parts.join('\n') || 'New data contract';
}

/**
 * Build the prompt for a specific field
 */
function buildFieldPrompt({ fieldName, fieldPath, placeholder, currentValue, contractContext }) {
  let prompt = `Generate a ${fieldName} for this data contract:\n\n${contractContext}\n\n`;

  if (currentValue) {
    prompt += `Current value (improve or expand): "${currentValue}"\n\n`;
  }

  if (placeholder) {
    prompt += `Example format: "${placeholder}"\n\n`;
  }

  prompt += `Write the ${fieldName}:`;

  return prompt;
}

export default useAiFieldSuggestion;
