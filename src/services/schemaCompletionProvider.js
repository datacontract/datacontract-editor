import { getCompletions, extractYamlContext, getOdcsSchema, getSchemaCompletions } from './schemaCompletionService.js';

/**
 * Map our completion kinds to Monaco CompletionItemKind
 */
function mapKind(monaco, kind) {
  const kindMap = {
    property: monaco.languages.CompletionItemKind.Property,
    enum: monaco.languages.CompletionItemKind.Enum,
    value: monaco.languages.CompletionItemKind.Value,
    snippet: monaco.languages.CompletionItemKind.Snippet,
  };
  return kindMap[kind] || monaco.languages.CompletionItemKind.Text;
}

/**
 * Register the ODCS schema completion provider with Monaco
 * @param {object} monaco - Monaco namespace
 * @returns {IDisposable} Disposable to unregister the provider
 */
export function registerSchemaCompletionProvider(monaco) {
  // Cache schema on registration
  getOdcsSchema();

  return monaco.languages.registerCompletionItemProvider('yaml', {
    triggerCharacters: [':', ' ', '\n', '-'],

    provideCompletionItems: async (model, position, context, token) => {
      // Don't interfere if user is typing in the middle of a word (let monaco-yaml handle it)
      if (context.triggerKind === monaco.languages.CompletionTriggerKind.TriggerCharacter) {
        const triggerChar = context.triggerCharacter;

        // Only provide completions for specific triggers
        if (triggerChar === ':' || triggerChar === '-' || triggerChar === '\n') {
          // Good triggers - continue
        } else if (triggerChar === ' ') {
          // Space after colon or dash is good
          const lineContent = model.getLineContent(position.lineNumber);
          const beforeSpace = lineContent.substring(0, position.column - 2);
          if (!beforeSpace.endsWith(':') && !beforeSpace.trim().endsWith('-')) {
            return { suggestions: [] };
          }
        }
      }

      const yamlText = model.getValue();
      const lineNumber = position.lineNumber;
      const column = position.column;

      try {
        const schema = await getOdcsSchema();
        if (!schema || token.isCancellationRequested) {
          return { suggestions: [] };
        }

        const yamlContext = extractYamlContext(yamlText, lineNumber, column);
        const completions = getSchemaCompletions(schema, yamlContext);

        if (token.isCancellationRequested) {
          return { suggestions: [] };
        }

        // Calculate the range to replace
        const wordInfo = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          startColumn: wordInfo.startColumn,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        };

        // For value completions, start from after the colon
        if (yamlContext.completionType === 'value') {
          const lineContent = model.getLineContent(position.lineNumber);
          const colonIdx = lineContent.lastIndexOf(':', position.column - 1);
          if (colonIdx >= 0) {
            range.startColumn = colonIdx + 2; // After colon and space
          }
        }

        const suggestions = completions.map((completion, index) => ({
          label: completion.label,
          kind: mapKind(monaco, completion.kind),
          detail: completion.detail || '',
          insertText: completion.insertText || completion.label,
          insertTextRules: completion.insertText?.includes('\n')
            ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
            : undefined,
          range,
          sortText: completion.sortText || String(index).padStart(4, '0'),
          // Boost our completions slightly so they appear before monaco-yaml's
          preselect: index === 0,
        }));

        return { suggestions };
      } catch (error) {
        console.warn('Schema completion error:', error);
        return { suggestions: [] };
      }
    },
  });
}

/**
 * Register inline completion provider (ghost text) for AI completions
 * This is a placeholder for Phase 2
 * @param {object} monaco - Monaco namespace
 * @param {object} editor - Monaco editor instance
 * @returns {IDisposable} Disposable to unregister the provider
 */
export function registerInlineCompletionProvider(monaco, editor) {
  // Phase 2 - AI-powered ghost text completions
  // For now, return a no-op disposable
  return { dispose: () => {} };
}
