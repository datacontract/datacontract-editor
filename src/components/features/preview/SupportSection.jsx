import { memo } from 'react';
import supportIcons from '../../../assets/support-icons/supportIcons.jsx';

// Memoized Support Channel component
const SupportChannel = memo(({ channel }) => {
	const getSupportIcon = (toolType) => {
		if (!toolType) return null;
		const type = toolType.toLowerCase();
		return supportIcons[type];
	};

	const SupportIconComponent = getSupportIcon(channel.tool);

	return (
		<li className="relative flex items-start gap-x-4 px-4 py-3 sm:px-6">
			{SupportIconComponent && (
				<div
					className="flex-none h-12 w-12 rounded-lg bg-white p-1.5 ring-1 ring-gray-900/10 flex items-center justify-center">
					<SupportIconComponent/>
				</div>
			)}
			<div className="flex-1 flex flex-wrap gap-x-6">
				{channel.tool && (
					<div className="flex items-center gap-x-4">
						<div className="flex flex-col">
							<dt className="text-sm font-medium text-gray-500">Tool</dt>
							<dd className="mt-1 text-sm text-gray-900">{channel.tool}</dd>
						</div>
					</div>
				)}
				<div className="flex items-center gap-x-4">
					<div className="flex flex-col">
						<dt className="text-sm font-medium text-gray-500">Channel</dt>
						<dd className="mt-1 text-sm text-gray-900">
							{channel.url ? (
								<a href={channel.url}
								   className="text-indigo-600 hover:text-indigo-500">{channel.channel}</a>
							) : (
								<span>{channel.channel}</span>
							)}
						</dd>
					</div>
				</div>
				{channel.scope && (
					<div className="flex items-center gap-x-4">
						<div className="flex flex-col">
							<dt className="text-sm font-medium text-gray-500">Scope</dt>
							<dd className="mt-1 text-sm text-gray-900">{channel.scope}</dd>
						</div>
					</div>
				)}
				{channel.description && (
					<div className="flex items-center gap-x-4">
						<div className="flex flex-col">
							<dt className="text-sm font-medium text-gray-500">Description</dt>
							<dd className="mt-1 text-sm text-gray-900">{channel.description}</dd>
						</div>
					</div>
				)}
				{channel.invitationUrl && (
					<div className="flex items-center gap-x-4">
						<div className="flex flex-col">
							<dt className="text-sm font-medium text-gray-500">Invitation URL</dt>
							<dd className="mt-1 text-sm text-gray-900">
								<a href={channel.invitationUrl} target="_blank" rel="noopener noreferrer"
								   className="text-indigo-600 hover:text-indigo-500">
									Invitation
								</a>
							</dd>
						</div>
					</div>
				)}
			</div>
		</li>
	);
}, (prevProps, nextProps) => {
	try {
		return JSON.stringify(prevProps.channel) === JSON.stringify(nextProps.channel);
	} catch {
		return false;
	}
});

SupportChannel.displayName = 'SupportChannel';

// Main SupportSection component
const SupportSection = memo(({ support }) => {
	if (!support || support.length === 0) return null;

	return (
		<section>
			<div className="px-4 sm:px-0">
				<h1 className="text-base font-semibold leading-6 text-gray-900" id="support">Support & Communication
					Channels</h1>
				<p className="text-sm text-gray-500">Support and communication channels help consumers find help
					regarding
					their use of the data contract</p>
			</div>
			<ul role="list"
				className="mt-2 divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-lg">
				{support.map((channel, index) => (
					<SupportChannel key={index} channel={channel} index={index} />
				))}
			</ul>
		</section>
	);
}, (prevProps, nextProps) => {
	try {
		return JSON.stringify(prevProps.support) === JSON.stringify(nextProps.support);
	} catch {
		return false;
	}
});

SupportSection.displayName = 'SupportSection';

export default SupportSection;
