import { memo } from 'react';
import Tag from '../../ui/Tag.jsx';
import LinkIcon from '../../ui/icons/LinkIcon.jsx';
import { IconResolver } from '../../ui/IconResolver.jsx';

const FundamentalsSection = memo(({
	parsedData,
	authoritativeDefinitions,
	links,
	domain,
	contractCreatedTs
}) => {
	// Check if section has any data
	const hasData = parsedData.name ||
		parsedData.version ||
		parsedData.id ||
		parsedData.status ||
		parsedData.tenant ||
		domain ||
		parsedData.dataProduct ||
		contractCreatedTs ||
		(parsedData.tags && Array.isArray(parsedData.tags) && parsedData.tags.length > 0) ||
		(authoritativeDefinitions && authoritativeDefinitions.length > 0) ||
		(links && links.length > 0);

	if (!hasData) return null;

	return (
		<section>
			<div className="px-4 sm:px-0">
				<h1 className="text-base font-semibold leading-6 text-gray-900" id="fundamentals">Fundamentals</h1>
				<p className="text-sm text-gray-500">Information about the data contract</p>
			</div>
			<div className="mt-2 overflow-hidden shadow sm:rounded-lg bg-white">
				<div className="px-4 py-4 sm:px-6">

					{/* Authoritative Definitions Section */}
					{authoritativeDefinitions && authoritativeDefinitions.length > 0 && (
						<div className="flex flex-wrap gap-2 mb-6">
							{authoritativeDefinitions.map((def, index) => (
								<a
									key={index}
									href={def.url}
									target="_blank"
									rel="noopener noreferrer"
									className="flex flex-col text-center rounded-md bg-white px-3 py-3 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:ring-indigo-300 transition-colors"
									style={{minWidth: '120px'}}
									title={def.description}
								>
									<div className="mx-auto w-8 h-8 mb-2 text-gray-500">
										<IconResolver url={def.url} type={def.type} className="w-full h-full"/>
									</div>
									<div className="text-xs font-medium">{def.type}</div>
								</a>
							))}
						</div>
					)}

					{/* Links Section */}
					{links && links.length > 0 && (
						<div className="flex flex-wrap gap-3 print:hidden mb-6">
							{links.map((link, index) => {
								if (!link.href) return null;
								return (
									<a
										key={index}
										href={link.href}
										className="flex flex-col text-center rounded-md bg-white px-2 py-2 text-sm font-medium text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
										target="_blank"
										rel="noopener noreferrer"
										style={{minWidth: '100px'}}
									>
										<div className="mx-auto w-8 h-8 my-2">
											<LinkIcon className="w-full h-full"/>
										</div>
										{link.displayName && <div>{link.displayName}</div>}
										{link.displayName2 && <div>{link.displayName2}</div>}
									</a>
								);
							})}
						</div>
					)}

					<dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
						{parsedData.name && (
							<div className="sm:col-span-1">
								<dt className="text-sm font-medium text-gray-500">Name</dt>
								<dd className="mt-1 text-sm text-gray-900">{parsedData.name}</dd>
							</div>
						)}

						{parsedData.version && (
							<div className="sm:col-span-1">
								<dt className="text-sm font-medium text-gray-500">Version</dt>
								<dd className="mt-1 text-sm text-gray-900">{parsedData.version}</dd>
							</div>
						)}

						{parsedData.id && (
							<div className="sm:col-span-1">
								<dt className="text-sm font-medium text-gray-500">ID</dt>
								<dd className="mt-1 text-sm text-gray-900">{parsedData.id}</dd>
							</div>
						)}

						{parsedData.status && (
							<div className="sm:col-span-1">
								<dt className="text-sm font-medium text-gray-500">Status</dt>
								<dd className="mt-1 text-sm text-gray-900">{parsedData.status}</dd>
							</div>
						)}

						{parsedData.tenant && (
							<div className="sm:col-span-1">
								<dt className="text-sm font-medium text-gray-500">Tenant</dt>
								<dd className="mt-1 text-sm text-gray-900">{parsedData.tenant}</dd>
							</div>
						)}

						{domain && (
							<div className="sm:col-span-1">
								<dt className="text-sm font-medium text-gray-500">Domain</dt>
								<dd className="mt-1 text-sm text-gray-900">{domain}</dd>
							</div>
						)}

						{parsedData.dataProduct && (
							<div className="sm:col-span-1">
								<dt className="text-sm font-medium text-gray-500">Data Product</dt>
								<dd className="mt-1 text-sm text-gray-900">{parsedData.dataProduct}</dd>
							</div>
						)}

						{contractCreatedTs && (
							<div className="sm:col-span-1">
								<dt className="text-sm font-medium text-gray-500">Contract Created</dt>
								<dd className="mt-1 text-sm text-gray-900">{new Date(contractCreatedTs).toLocaleString()}</dd>
							</div>
						)}

						{parsedData.tags && Array.isArray(parsedData.tags) && parsedData.tags.length > 0 && (
							<div className="sm:col-span-2">
								<dt className="text-sm font-medium text-gray-500">Tags</dt>
								<dd className="mt-1 text-sm text-gray-900">
									<div className="flex gap-y-1 items-center text-xs text-gray-500 flex-wrap">
										{parsedData.tags.map((tag, index) => (
											<Tag key={index} className="mr-1 mb-1">
												{tag}
											</Tag>
										))}
									</div>
								</dd>
							</div>
						)}
					</dl>
				</div>
			</div>
		</section>
	);
});

FundamentalsSection.displayName = 'FundamentalsSection';

export default FundamentalsSection;
