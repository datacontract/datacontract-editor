import Tag from '../../ui/Tag.jsx';
import { IconResolver } from '../../ui/IconResolver.jsx';
import {useEditorStore} from "../../../store.js";
import {useShallow} from "zustand/react/shallow";

const FundamentalsSection = () => {
	const id = useEditorStore(useShallow(state => state.getValue('id')));
	const name = useEditorStore(useShallow(state => state.getValue('name')));
	const version = useEditorStore(useShallow(state => state.getValue('version')));
	const status = useEditorStore(useShallow(state => state.getValue('status')));
	const tenant = useEditorStore(useShallow(state => state.getValue('tenant')));
	const dataProduct = useEditorStore(useShallow(state => state.getValue('dataProduct')));
	const authoritativeDefinitions = useEditorStore(useShallow(state => state.getValue('authoritativeDefinitions')));
	const customProperties = useEditorStore(useShallow(state => state.getValue('customProperties')));
	const domain = useEditorStore(useShallow(state => state.getValue('domain')));
	const contractCreatedTs = useEditorStore(useShallow(state => state.getValue('contractCreatedTs')));
	const tags = useEditorStore(useShallow(state => state.getValue('tags')));

	// Check if section has any data
	const hasCustomProperties = customProperties && (
		Array.isArray(customProperties) ? customProperties.length > 0 :
		typeof customProperties === 'object' && Object.keys(customProperties).length > 0
	);
	const hasData =
		id || name || version ||
		(tags && Array.isArray(tags) && tags.length > 0) ||
		(authoritativeDefinitions && authoritativeDefinitions.length > 0) ||
		hasCustomProperties
	;

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

					<dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
						{name && (
							<div className="sm:col-span-1">
								<dt className="text-sm font-medium text-gray-500">Name</dt>
								<dd className="mt-1 text-sm text-gray-900">{name}</dd>
							</div>
						)}

						{version && (
							<div className="sm:col-span-1">
								<dt className="text-sm font-medium text-gray-500">Version</dt>
								<dd className="mt-1 text-sm text-gray-900">{version}</dd>
							</div>
						)}

						{id && (
							<div className="sm:col-span-1">
								<dt className="text-sm font-medium text-gray-500">ID</dt>
								<dd className="mt-1 text-sm text-gray-900">{id}</dd>
							</div>
						)}

						{status && (
							<div className="sm:col-span-1">
								<dt className="text-sm font-medium text-gray-500">Status</dt>
								<dd className="mt-1 text-sm text-gray-900">{status}</dd>
							</div>
						)}

						{tenant && (
							<div className="sm:col-span-1">
								<dt className="text-sm font-medium text-gray-500">Tenant</dt>
								<dd className="mt-1 text-sm text-gray-900">{tenant}</dd>
							</div>
						)}

						{domain && (
							<div className="sm:col-span-1">
								<dt className="text-sm font-medium text-gray-500">Domain</dt>
								<dd className="mt-1 text-sm text-gray-900">{domain}</dd>
							</div>
						)}

						{dataProduct && (
							<div className="sm:col-span-1">
								<dt className="text-sm font-medium text-gray-500">Data Product</dt>
								<dd className="mt-1 text-sm text-gray-900">{dataProduct}</dd>
							</div>
						)}

						{contractCreatedTs && (
							<div className="sm:col-span-1">
								<dt className="text-sm font-medium text-gray-500">Contract Created</dt>
								<dd className="mt-1 text-sm text-gray-900">{new Date(contractCreatedTs).toLocaleString()}</dd>
							</div>
						)}

						{tags && Array.isArray(tags) && tags.length > 0 && (
							<div className="sm:col-span-2">
								<dt className="text-sm font-medium text-gray-500">Tags</dt>
								<dd className="mt-1 text-sm text-gray-900">
									<div className="flex gap-y-1 items-center text-xs text-gray-500 flex-wrap">
										{tags.map((tag, index) => (
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
}

export default FundamentalsSection;
