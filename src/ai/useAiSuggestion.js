import { useState, useCallback } from 'react';
import { useEditorStore } from '../store.js';
import { streamChatCompletion } from './aiService.js';

/**
 * FIELD_SUGGESTION prompt configuration
 * For SparkleButton inline completions
 */
const FIELD_SUGGESTION_SYSTEM = `You are an assistant helping write ODCS data contract specifcation.

Rules:
- Be concise but informative
- Use professional technical language
- Keep suggestions to 1-3 sentences

IMPORTANT: Always respond with valid JSON in one of these formats:

Success: {"suggestion": "Your suggested text here"}
Cannot suggest: {"error": "Brief reason why"}

Examples:
{"suggestion": "Provides daily aggregated sales metrics for revenue reporting and forecasting."}
{"error": "Need contract name or domain context"}`;

function buildUserPrompt({ fieldName, placeholder, currentValue, contractContext }) {
	let prompt = `Generate a ${fieldName} for this data contract:\n\n${contractContext}\n\n`;
	if (currentValue) prompt += `Current value (improve): "${currentValue}"\n\n`;
	if (placeholder) prompt += `Example: "${placeholder}"\n\n`;
	return prompt + `Write the ${fieldName}:`;
}

function buildContractContext(yamlParts) {
	if (!yamlParts) return 'No contract data available';

	const parts = [];

	if (yamlParts.name) parts.push(`Contract Name: ${yamlParts.name}`);
	if (yamlParts.id) parts.push(`ID: ${yamlParts.id}`);
	if (yamlParts.domain) parts.push(`Domain: ${yamlParts.domain}`);
	if (yamlParts.dataProduct) parts.push(`Data Product: ${yamlParts.dataProduct}`);

	// Add schema info if available
	if (yamlParts.schema?.length > 0) {
		const schemaNames = yamlParts.schema.map((s) => s.name).filter(Boolean).join(', ');
		if (schemaNames) parts.push(`Schemas: ${schemaNames}`);

		// List some properties for context
		const allProps = yamlParts.schema.flatMap((s) => s.properties || []);
		const propNames = allProps
			.slice(0, 10)
			.map((p) => p.name)
			.filter(Boolean)
			.join(', ');
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
 * Hook for generating AI suggestions for form fields
 *
 * @param {object} options
 * @param {string} options.fieldName - Human-readable field name (e.g., "Purpose", "Description")
 * @param {string} options.fieldPath - YAML path for context (e.g., "description.purpose")
 * @param {string} options.placeholder - Example of what the field should contain
 * @returns {object} { suggest, isLoading, error }
 */
export function useAiSuggestion({ fieldName, fieldPath, placeholder }) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);

	const editorConfig = useEditorStore((state) => state.editorConfig);
	const yamlParts = useEditorStore((state) => state.yamlParts);

	const suggest = useCallback(
		async (currentValue = '') => {
			const aiConfig = editorConfig?.ai;

			if (!aiConfig?.enabled) {
				setError('AI is disabled in settings');
				return null;
			}

			if (!aiConfig?.endpoint) {
				setError('AI endpoint not configured');
				return null;
			}

			if (!aiConfig?.apiKey) {
				setError('AI API key not configured');
				return null;
			}

			setIsLoading(true);
			setError(null);

			try {
				const contractContext = buildContractContext(yamlParts);
				const userPrompt = buildUserPrompt({
					fieldName,
					fieldPath,
					placeholder,
					currentValue,
					contractContext,
				});

				let suggestion = '';

				await streamChatCompletion({
					config: { ...aiConfig, useTools: false },
					messages: [
						{ role: 'system', content: FIELD_SUGGESTION_SYSTEM },
						{ role: 'user', content: userPrompt },
					],
					callbacks: {
						onContent: (chunk, full) => {
							suggestion = full;
						},
					},
				});

				// Clean up and parse JSON response
				const rawResponse = suggestion.trim();

				if (!rawResponse) {
					setError('No response from AI');
					setIsLoading(false);
					return null;
				}

				// Parse JSON response
				let parsed;
				try {
					// Handle markdown code blocks if present
					let jsonStr = rawResponse;
					if (jsonStr.startsWith('```')) {
						jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
					}
					parsed = JSON.parse(jsonStr);
				} catch {
					// Fallback: treat as plain text suggestion if not valid JSON
					setIsLoading(false);
					return rawResponse;
				}

				// Handle structured response
				if (parsed.error) {
					setError(parsed.error);
					setIsLoading(false);
					return null;
				}

				if (parsed.suggestion) {
					setIsLoading(false);
					return parsed.suggestion;
				}

				// Unexpected format
				setError('Unexpected AI response format');
				setIsLoading(false);
				return null;
			} catch (err) {
				console.error('[AI Field Suggestion] Error:', err);
				// Make error messages more user-friendly
				let message = err.message;
				if (message.includes('401') || message.includes('Unauthorized')) {
					message = 'Invalid API key';
				} else if (message.includes('429') || message.includes('rate limit') || message.includes('quota')) {
					message = 'Rate limit exceeded. Try again later.';
				} else if (message.includes('500') || message.includes('502') || message.includes('503')) {
					message = 'AI service unavailable. Try again later.';
				} else if (message.includes('fetch') || message.includes('network') || message.includes('CORS')) {
					message = 'Cannot connect to AI service';
				}
				setError(message);
				setIsLoading(false);
				return null;
			}
		},
		[editorConfig, yamlParts, fieldName, fieldPath, placeholder]
	);

	return { suggest, isLoading, error };
}

// Legacy alias for backward compatibility
export const useAiFieldSuggestion = useAiSuggestion;

export default useAiSuggestion;
