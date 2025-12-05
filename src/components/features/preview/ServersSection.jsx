import { memo } from 'react';
import serverIcons from '../../../assets/server-icons/serverIcons.jsx';
import Tooltip from '../../ui/Tooltip.jsx';
import PropertyValueRenderer from '../../ui/PropertyValueRenderer.jsx';
import QuestionMarkCircleIcon from '../../ui/icons/QuestionMarkCircleIcon.jsx';
import {useEditorStore} from "../../../store.js";
import {useShallow} from "zustand/react/shallow";

// Memoized Server Item component
const ServerItem = memo(({ server }) => {
	const getServerIcon = (serverType) => {
		if (!serverType) return null;
		const type = serverType.toLowerCase();
		return serverIcons[type];
	};

	const ServerIconComponent = getServerIcon(server.type);

	return (
		<li className="relative flex flex-col gap-x-6 gap-y-2 px-4 py-3 sm:px-6"
			id={`server-${server.server}`}>
			<div className="flex items-start gap-x-4">
				{ServerIconComponent && (
					<div
						className="flex-none h-12 w-12 rounded-lg bg-white p-2.5 ring-1 ring-gray-900/10 flex items-center justify-center">
						<ServerIconComponent/>
					</div>
				)}
				<div className="flex-1">
					<div className="flex flex-wrap items-center gap-x-4 gap-y-2">
						{server.server && (
							<div className="flex flex-col">
								<dt className="text-sm font-medium text-gray-500">Server</dt>
								<dd className="mt-1 text-sm text-gray-900">{server.type}</dd>
							</div>
						)}
						{server.environment && (
							<div className="flex flex-col">
								<dt className="text-sm font-medium text-gray-500">Environment</dt>
								<dd><span className='badge--indigo'>{server.environment}</span></dd>
							</div>
						)}
						{server.type && (
							<div className="flex flex-col">
								<dt className="text-sm font-medium text-gray-500">Type</dt>
								<dd className="mt-1 text-sm text-gray-900">{server.type}</dd>
							</div>
						)}
						{server.project && (
							<div className="flex flex-col">
								<dt className="text-sm font-medium text-gray-500">Project</dt>
								<dd className="mt-1 text-sm text-gray-900">{server.project}</dd>
							</div>
						)}
						{server.dataset && (
							<div className="flex flex-col">
								<dt className="text-sm font-medium text-gray-500">Dataset</dt>
								<dd className="mt-1 text-sm text-gray-900">{server.dataset}</dd>
							</div>
						)}
						{server.endpointUrl && (
							<div className="flex flex-col">
								<dt className="text-sm font-medium text-gray-500">Endpoint</dt>
								<dd className="mt-1 text-sm text-gray-900">{server.endpointUrl}</dd>
							</div>
						)}
						{server.location && (
							<div className="flex flex-col">
								<dt className="text-sm font-medium text-gray-500">Location</dt>
								<dd className="mt-1 text-sm text-gray-900">{server.location}</dd>
							</div>
						)}
						{server.path && (
							<div className="flex flex-col">
								<dt className="text-sm font-medium text-gray-500">Path</dt>
								<dd className="mt-1 text-sm text-gray-900">{server.path}</dd>
							</div>
						)}
						{server.account && (
							<div className="flex flex-col">
								<dt className="text-sm font-medium text-gray-500">Account</dt>
								<dd className="mt-1 text-sm text-gray-900">{server.account}</dd>
							</div>
						)}
						{server.database && (
							<div className="flex flex-col">
								<dt className="text-sm font-medium text-gray-500">Database</dt>
								<dd className="mt-1 text-sm text-gray-900">{server.database}</dd>
							</div>
						)}
						{server.catalog && (
							<div className="flex flex-col">
								<dt className="text-sm font-medium text-gray-500">Catalog</dt>
								<dd className="mt-1 text-sm text-gray-900">{server.catalog}</dd>
							</div>
						)}
						{server.schema && (
							<div className="flex flex-col">
								<dt className="text-sm font-medium text-gray-500">Schema</dt>
								<dd className="mt-1 text-sm text-gray-900">{server.schema}</dd>
							</div>
						)}
						{server.table && (
							<div className="flex flex-col">
								<dt className="text-sm font-medium text-gray-500">Table</dt>
								<dd className="mt-1 text-sm text-gray-900">{server.table}</dd>
							</div>
						)}
						{server.view && (
							<div className="flex flex-col">
								<dt className="text-sm font-medium text-gray-500">View</dt>
								<dd className="mt-1 text-sm text-gray-900">{server.view}</dd>
							</div>
						)}
						{server.host && (
							<div className="flex flex-col">
								<dt className="text-sm font-medium text-gray-500">Host</dt>
								<dd className="mt-1 text-sm text-gray-900">{server.host}</dd>
							</div>
						)}
						{server.port && (
							<div className="flex flex-col">
								<dt className="text-sm font-medium text-gray-500">Port</dt>
								<dd className="mt-1 text-sm text-gray-900">{server.port}</dd>
							</div>
						)}
						{server.topic && (
							<div className="flex flex-col">
								<dt className="text-sm font-medium text-gray-500">Topic</dt>
								<dd className="mt-1 text-sm text-gray-900">{server.topic}</dd>
							</div>
						)}
						{server.format && (
							<div className="flex flex-col">
								<dt className="text-sm font-medium text-gray-500">Format</dt>
								<dd className="mt-1 text-sm text-gray-900">{server.format}</dd>
							</div>
						)}
						{server.delimiter && (
							<div className="flex flex-col">
								<dt className="text-sm font-medium text-gray-500">Delimiter</dt>
								<dd className="mt-1 text-sm text-gray-900">{server.delimiter}</dd>
							</div>
						)}
						{server.description && (
							<div className="flex flex-col">
								<dt className="text-sm font-medium text-gray-500">Description</dt>
								<dd className="mt-1 text-sm text-gray-900">{server.description}</dd>
							</div>
						)}
						{server.customProperties && Array.isArray(server.customProperties) && server.customProperties.map((customProperty, cpIndex) => (
							<div key={cpIndex} className="flex flex-col">
								<dt
									className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
									{customProperty.property}
									{customProperty.description && (
										<Tooltip content={customProperty.description}>
											<QuestionMarkCircleIcon />
										</Tooltip>
									)}
								</dt>
								<dd className="mt-1 text-sm text-gray-900">
									<PropertyValueRenderer value={customProperty.value}/>
								</dd>
							</div>
						))}
						{server.roles && Array.isArray(server.roles) && server.roles.length > 0 && (
							<div>
								<dt className="text-sm font-medium text-gray-500 flex items-center gap-1">
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
										 strokeWidth="1.5"
										 stroke="currentColor" className="w-3.5 h-3.5">
										<path strokeLinecap="round" strokeLinejoin="round"
											  d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/>
									</svg>
									Roles
								</dt>
								<dd className="mt-1 flex flex-wrap gap-1">
									{server.roles.map((role, roleIndex) => {
										const tooltipContent = (
											<div className="space-y-1 text-xs">
												{role.role && <div className="font-medium break-all">{role.role}</div>
												}
												{role.access && <div>Access: {role.access}</div>}
												{role.description && <div className="text-gray-300">{role.description}</div>}
												{role.firstLevelApprovers &&
													<div className="text-gray-300">1st
														Approvers: {role.firstLevelApprovers}</div>}
												{role.secondLevelApprovers &&
													<div className="text-gray-300">2nd
														Approvers: {role.secondLevelApprovers}</div>}
											</div>
										);
										const displayName = role.role || `Role ${roleIndex + 1}`;
										const truncatedName = displayName.length > 30 ? `${displayName.substring(0, 30)}...` : displayName;
										return (
											<Tooltip key={roleIndex} content={tooltipContent}>
												<span
													className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
													{truncatedName}
													{role.access && <span className="text-indigo-500">({role.access})</span>}
												</span>
											</Tooltip>
										);
									})}
								</dd>
							</div>
						)}
					</div>
				</div>
			</div>
		</li>
	);
}, (prevProps, nextProps) => {
	try {
		return JSON.stringify(prevProps.server) === JSON.stringify(nextProps.server);
	} catch {
		return false;
	}
});

ServerItem.displayName = 'ServerItem';

// Main ServersSection component
const ServersSection = () => {
	const servers = useEditorStore(useShallow(state => state.getValue('servers')));
	if (!servers || servers.length === 0) return null;

	return (
		<section>
			<div className="px-4 sm:px-0">
				<h1 className="text-base font-semibold leading-6 text-gray-900" id="servers">Servers</h1>
				<p className="text-sm text-gray-500">This section covers connection details to physical data sets and
					infrastructure</p>
			</div>
			<ul role="list"
				className="mt-2 divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-lg">
				{servers.map((server, index) => (
					<ServerItem key={index} server={server} index={index} />
				))}
			</ul>
		</section>
	);
}

export default ServersSection;
