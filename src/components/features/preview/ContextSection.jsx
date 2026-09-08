import {useTranslation} from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import Tags from '../../ui/Tags.jsx';
import {useEditorStore} from '../../../store.js';
import {useShallow} from 'zustand/react/shallow';
import {normalizeContext} from '../../../lib/context.js';

const Meta = ({ tags, authoritativeDefinitions }) => {
	const hasTags = Array.isArray(tags) && tags.length > 0;
	const hasDefinitions = Array.isArray(authoritativeDefinitions) && authoritativeDefinitions.length > 0;
	if (!hasTags && !hasDefinitions) return null;
	return (
		<div className="mt-1 flex flex-wrap items-center gap-1">
			{hasTags && <Tags tags={tags} />}
			{hasDefinitions && authoritativeDefinitions.map((definition, index) => (
				<a key={index} href={definition.url} target="_blank" rel="noopener noreferrer"
					 className="text-xs text-indigo-600 hover:text-indigo-800">
					{definition.type || definition.url}
				</a>
			))}
		</div>
	);
};

// The three parts, shared by the section and the schema-header disclosure.
export const ContextBody = ({ context }) => {
	const { t } = useTranslation();
	const normalized = normalizeContext(context);
	if (!normalized) return null;
	const { instructions, verifiedStatements = [], constraints = [] } = normalized;
	return (
		<dl className="space-y-5">
			{instructions && (
				<div>
					<dt className="text-sm font-medium text-gray-500">{t('preview.context.instructions')}</dt>
					<dd className="mt-1 text-sm text-gray-700 prose prose-sm max-w-full">
						<ReactMarkdown>{instructions}</ReactMarkdown>
					</dd>
				</div>
			)}
			{verifiedStatements.length > 0 && (
				<div>
					<dt className="text-sm font-medium text-gray-500">{t('preview.context.verifiedStatements')}</dt>
					<dd className="mt-1">
						<ul className="divide-y divide-gray-100">
							{verifiedStatements.map((statement, index) => (
								<li key={statement.id || index} className="py-2 first:pt-0 last:pb-0 text-sm">
									<p className="font-medium text-gray-900">{statement.question}</p>
									{statement.answer && <p className="mt-0.5 text-gray-700 whitespace-pre-line">{statement.answer}</p>}
									<Meta tags={statement.tags} authoritativeDefinitions={statement.authoritativeDefinitions} />
								</li>
							))}
						</ul>
					</dd>
				</div>
			)}
			{constraints.length > 0 && (
				<div>
					<dt className="text-sm font-medium text-gray-500">{t('preview.context.constraints')}</dt>
					<dd className="mt-1">
						<ul className="list-disc space-y-1 pl-5 text-sm text-gray-900">
							{constraints.map((constraint, index) => (
								<li key={constraint.id || index}>
									<span className="whitespace-pre-line">{constraint.constraint}</span>
									<Meta tags={constraint.tags} authoritativeDefinitions={constraint.authoritativeDefinitions} />
								</li>
							))}
						</ul>
					</dd>
				</div>
			)}
		</dl>
	);
};

// Folded variant for a schema object's header, so the header stays a header.
export const ContextDisclosure = ({ context }) => {
	const { t } = useTranslation();
	if (!normalizeContext(context)) return null;
	return (
		<details className="mt-1 font-normal" data-context-disclosure>
			<summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700 print:hidden">{t('preview.context.heading')}</summary>
			<div className="mt-2 rounded-md bg-gray-50 px-3 py-2">
				<ContextBody context={context} />
			</div>
		</details>
	);
};

// Contract-level context as a section of its own, after the terms of use.
const ContextSection = () => {
	const { t } = useTranslation();
	const context = useEditorStore(useShallow(state => state.getValue('context')));
	if (!normalizeContext(context)) return null;
	return (
		<section id="context" data-context-section>
			<div className="px-4 sm:px-0">
				<h1 className="text-base font-semibold leading-6 text-gray-900">{t('preview.context.heading')}</h1>
				<p className="text-sm text-gray-500">{t('preview.context.description')}</p>
			</div>
			<div className="mt-2 overflow-hidden shadow sm:rounded-lg bg-white">
				<div className="px-4 py-4 sm:px-6">
					<ContextBody context={context} />
				</div>
			</div>
		</section>
	);
};

export default ContextSection;
