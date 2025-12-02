import { memo } from 'react';
import CustomPropertiesPreview from '../../ui/CustomPropertiesPreview.jsx';

// Memoized Role Item component
const RoleItem = memo(({ role }) => {
	return (
		<li className="relative flex flex-col gap-y-2 px-4 py-3 sm:px-6">
			<div className="flex flex-wrap gap-x-6 gap-y-2">
				{role.role && (
					<div className="flex items-center gap-x-4">
						<div className="hidden sm:flex sm:flex-col">
							<dt className="text-sm font-medium text-gray-500">Role</dt>
							<dd className="mt-1 text-sm text-gray-900">{role.role}</dd>
						</div>
					</div>
				)}
				{role.access && (
					<div className="flex items-center gap-x-4">
						<div className="sm:flex sm:flex-col">
							<dt className="text-sm font-medium text-gray-500">Access</dt>
							<dd className="mt-1 text-sm text-gray-900">{role.access}</dd>
						</div>
					</div>
				)}
				{role.firstLevelApprovers && (
					<div className="flex items-center gap-x-4">
						<div className="sm:flex sm:flex-col">
							<dt className="text-sm font-medium text-gray-500">First Level Approvers</dt>
							<dd className="mt-1 text-sm text-gray-900">{role.firstLevelApprovers}</dd>
						</div>
					</div>
				)}
				{role.secondLevelApprovers && (
					<div className="flex items-center gap-x-4">
						<div className="sm:flex sm:flex-col">
							<dt className="text-sm font-medium text-gray-500">Second Level Approvers</dt>
							<dd className="mt-1 text-sm text-gray-900">{role.secondLevelApprovers}</dd>
						</div>
					</div>
				)}
				<div className="flex items-center gap-x-4">
					<div className="sm:flex sm:flex-col">
						<dt className="text-sm font-medium text-gray-500">Custom Properties</dt>
						<dd className="flex flex-wrap gap-x-4 gap-y-1">
							<CustomPropertiesPreview properties={role.customProperties}/>
						</dd>
					</div>
				</div>
			</div>
		</li>
	);
});

RoleItem.displayName = 'RoleItem';

// Main RolesSection component
const RolesSection = memo(({ roles }) => {
	if (!roles || roles.length === 0) return null;

	return (
		<section>
			<div className="px-4 sm:px-0">
				<h1 className="text-base font-semibold leading-6 text-gray-900" id="roles">Roles</h1>
				<p className="text-sm text-gray-500">Support and communication channels help consumers find help
					regarding
					their use of the data contract</p>
			</div>
			<ul role="list"
				className="mt-2 divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-lg">
				{roles.map((role, index) => (
					<RoleItem key={index} role={role} index={index} />
				))}
			</ul>
		</section>
	);
});

RolesSection.displayName = 'RolesSection';

export default RolesSection;
