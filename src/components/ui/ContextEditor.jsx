import { useTranslation } from 'react-i18next';

const inputClasses =
  'block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4';

const RemoveButton = ({ onClick, title }) => (
  <button
    type="button"
    onClick={onClick}
    className="p-1.5 text-gray-400 cursor-pointer border border-gray-300 rounded hover:text-red-400 hover:border-red-400 transition-colors flex-shrink-0"
    title={title}
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  </button>
);

/**
 * Editor for an ODCS `context` block (ODCS 3.2.0+): instructions for AI agents and consumers,
 * verified statements (question, optionally an answer), and constraints.
 *
 * ODCS allows `context` to be a plain string as a shorthand for `instructions`; a string value is
 * kept as a string for as long as only the instructions are filled, and becomes the object form
 * the moment a statement or constraint is added.
 */
const ContextEditor = ({ value, onChange }) => {
  const { t } = useTranslation();

  const isShorthand = typeof value === 'string';
  const context = isShorthand ? { instructions: value } : (value && typeof value === 'object' ? value : {});
  const statements = Array.isArray(context.verifiedStatements) ? context.verifiedStatements : [];
  const constraints = Array.isArray(context.constraints) ? context.constraints : [];

  const commit = (next) => {
    const cleaned = { ...next };
    if (!cleaned.instructions) delete cleaned.instructions;
    if (!cleaned.verifiedStatements?.length) delete cleaned.verifiedStatements;
    if (!cleaned.constraints?.length) delete cleaned.constraints;

    if (Object.keys(cleaned).length === 0) {
      onChange(undefined);
    } else if (isShorthand && Object.keys(cleaned).length === 1 && typeof cleaned.instructions === 'string') {
      onChange(cleaned.instructions);
    } else {
      onChange(cleaned);
    }
  };

  const updateStatement = (index, field, fieldValue) => {
    const updated = [...statements];
    updated[index] = { ...updated[index], [field]: fieldValue || undefined };
    commit({ ...context, verifiedStatements: updated });
  };

  const updateConstraint = (index, fieldValue) => {
    const updated = [...constraints];
    updated[index] = { ...updated[index], constraint: fieldValue || undefined };
    commit({ ...context, constraints: updated });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
          {t('contextEditor.instructions.label')}
        </label>
        <textarea
          rows={4}
          value={context.instructions || ''}
          onChange={(e) => commit({ ...context, instructions: e.target.value })}
          className={inputClasses}
          placeholder={t('contextEditor.instructions.placeholder')}
        />
      </div>

      <div>
        <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
          {t('contextEditor.statements.label')}
        </label>
        <p className="text-xs text-gray-500 mb-2">{t('contextEditor.statements.help')}</p>
        <div className="space-y-2">
          {statements.map((statement, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-1 space-y-1">
                <input
                  type="text"
                  value={statement?.question || ''}
                  onChange={(e) => updateStatement(index, 'question', e.target.value)}
                  className={inputClasses}
                  placeholder={t('contextEditor.statements.question.placeholder')}
                />
                <input
                  type="text"
                  value={statement?.answer || ''}
                  onChange={(e) => updateStatement(index, 'answer', e.target.value)}
                  className={inputClasses}
                  placeholder={t('contextEditor.statements.answer.placeholder')}
                />
              </div>
              <RemoveButton
                title={t('contextEditor.statements.remove')}
                onClick={() => commit({ ...context, verifiedStatements: statements.filter((_, i) => i !== index) })}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => commit({ ...context, verifiedStatements: [...statements, { question: '' }] })}
            className="w-full px-2 py-1 border-2 border-dashed border-gray-300 rounded text-xs text-gray-600 hover:border-indigo-400 hover:text-indigo-600"
          >
            {t('contextEditor.statements.add')}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
          {t('contextEditor.constraints.label')}
        </label>
        <p className="text-xs text-gray-500 mb-2">{t('contextEditor.constraints.help')}</p>
        <div className="space-y-2">
          {constraints.map((entry, index) => (
            <div key={index} className="flex gap-2 items-start">
              <input
                type="text"
                value={entry?.constraint || ''}
                onChange={(e) => updateConstraint(index, e.target.value)}
                className={inputClasses}
                placeholder={t('contextEditor.constraints.placeholder')}
              />
              <RemoveButton
                title={t('contextEditor.constraints.remove')}
                onClick={() => commit({ ...context, constraints: constraints.filter((_, i) => i !== index) })}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => commit({ ...context, constraints: [...constraints, { constraint: '' }] })}
            className="w-full px-2 py-1 border-2 border-dashed border-gray-300 rounded text-xs text-gray-600 hover:border-indigo-400 hover:text-indigo-600"
          >
            {t('contextEditor.constraints.add')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContextEditor;
