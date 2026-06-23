import { memo } from 'react';
import {useTranslation} from 'react-i18next';
import {useEditorStore} from "../../../store.js";
import {useShallow} from "zustand/react/shallow";

// Memoized SLA Item component
const SlaItem = memo(({ sla }) => {
	const { t } = useTranslation();
	return (
		<li className="relative flex items-start gap-x-4 px-4 py-3 sm:px-6">
			<div className="flex-1 flex flex-wrap gap-x-6 gap-y-2">
				{sla.property && (
					<div className="flex items-center gap-x-4">
						<div className="flex flex-col">
							<dt className="text-sm font-medium text-gray-500">{t('preview.sla.property')}</dt>
							<dd className="mt-1 text-sm font-medium text-gray-900">{sla.property}</dd>
						</div>
					</div>
				)}
				{sla.value !== undefined && sla.value !== null && (
					<div className="flex items-center gap-x-4">
						<div className="flex flex-col">
							<dt className="text-sm font-medium text-gray-500">{t('preview.sla.value')}</dt>
							<dd className="mt-1 text-sm font-medium text-gray-900">{sla.value}</dd>
						</div>
					</div>
				)}
				{sla.unit && (
					<div className="flex items-center gap-x-4">
						<div className="flex flex-col">
							<dt className="text-sm font-medium text-gray-500">{t('preview.sla.unit')}</dt>
							<dd className="mt-1 text-sm text-gray-900">{sla.unit}</dd>
						</div>
					</div>
				)}
				{sla.element && (
					<div className="flex items-center gap-x-4">
						<div className="flex flex-col">
							<dt className="text-sm font-medium text-gray-500">{t('preview.sla.element')}</dt>
							<dd className="mt-1 text-sm text-gray-900">{sla.element}</dd>
						</div>
					</div>
				)}
				{sla.driver && (
					<div className="flex items-center gap-x-4">
						<div className="flex flex-col">
							<dt className="text-sm font-medium text-gray-500">{t('preview.sla.driver')}</dt>
							<dd className="mt-1 text-sm text-gray-900">{sla.driver}</dd>
						</div>
					</div>
				)}
				{sla.scheduler && (
					<div className="flex items-center gap-x-4">
						<div className="flex flex-col">
							<dt className="text-sm font-medium text-gray-500">{t('preview.sla.scheduler')}</dt>
							<dd className="mt-1 text-sm text-gray-900">{sla.scheduler}</dd>
						</div>
					</div>
				)}
				{sla.schedule && (
					<div className="flex items-center gap-x-4">
						<div className="flex flex-col">
							<dt className="text-sm font-medium text-gray-500">{t('preview.sla.schedule')}</dt>
							<dd className="mt-1 text-sm text-gray-900 font-mono">{sla.schedule}</dd>
						</div>
					</div>
				)}
				{sla.description && (
					<div className="flex items-center gap-x-4">
						<div className="flex flex-col">
							<dt className="text-sm font-medium text-gray-500">{t('preview.sla.description')}</dt>
							<dd className="mt-1 text-sm text-gray-900">{sla.description}</dd>
						</div>
					</div>
				)}
			</div>
		</li>
	);
}, (prevProps, nextProps) => {
	try {
		return JSON.stringify(prevProps.sla) === JSON.stringify(nextProps.sla);
	} catch {
		return false;
	}
});

SlaItem.displayName = 'SlaItem';

// Main SlaSection component
const SlaSection = () => {
	const { t } = useTranslation();
	const slaProperties = useEditorStore(useShallow(state => state.getValue('slaProperties')));
	if (!slaProperties || slaProperties.length === 0) return null;

	return (
		<section>
			<div className="px-4 sm:px-0">
				<h1 className="text-base font-semibold leading-6 text-gray-900" id="sla">{t('preview.sla.heading')}</h1>
				<p className="text-sm text-gray-500">{t('preview.sla.sectionDescription')}</p>
			</div>
			<ul role="list"
					className="mt-2 divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-lg">
				{slaProperties.map((sla, index) => (
					<SlaItem key={index} sla={sla} index={index}/>
				))}
			</ul>
		</section>
	);
}

SlaSection.displayName = 'SlaSection';

export default SlaSection;
