import { memo } from 'react';
import Tag from '../../ui/Tag.jsx';
import Tooltip from '../../ui/Tooltip.jsx';
import PropertyValueRenderer from '../../ui/PropertyValueRenderer.jsx';
import { IconResolver } from '../../ui/IconResolver.jsx';
import AuthoritativeDefinitionsPreview from '../../ui/AuthoritativeDefinitionsPreview.jsx';
import CustomPropertiesPreview from '../../ui/CustomPropertiesPreview.jsx';
import QuestionMarkCircleIcon from '../../ui/icons/QuestionMarkCircleIcon.jsx';
import {useEditorStore} from "../../../store.js";
import {useShallow} from "zustand/react/shallow";

// Memoized Team Member component
const TeamMember = memo(({ teamMember }) => {
	const hasTeamMemberData = (member) => {
		return member.username ||
			member.name ||
			member.role ||
			member.description ||
			member.dateIn ||
			member.dateOut ||
			member.replacedByUsername ||
			(member.tags && Array.isArray(member.tags) && member.tags.length > 0) ||
			(member.authoritativeDefinitions && Array.isArray(member.authoritativeDefinitions) && member.authoritativeDefinitions.length > 0) ||
			(member.customProperties && Array.isArray(member.customProperties) && member.customProperties.length > 0);
	};

	const hasMemberData = hasTeamMemberData(teamMember);

	return (
		<div
			className={hasMemberData ? "border-l-2 border-gray-200 pl-3 py-1" : "pl-0 py-1"}>
			<div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
				{teamMember.username && (
					<span className="text-gray-900 font-medium">{teamMember.username}</span>
				)}
				{teamMember.name && (
					<span className="text-gray-600">{teamMember.name}</span>
				)}
				{teamMember.role && (
					<span
						className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
						{teamMember.role}
					</span>
				)}
			</div>
			{teamMember.description && (
				<p className="text-sm text-gray-500 mt-1">{teamMember.description}</p>
			)}
			<div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
				{teamMember.dateIn && (
					<span>In: {teamMember.dateIn}</span>
				)}
				{teamMember.dateOut && (
					<span>Out: {teamMember.dateOut}</span>
				)}
				{teamMember.replacedByUsername && (
					<span>Replaced by: {teamMember.replacedByUsername}</span>
				)}
			</div>
			{teamMember.tags && Array.isArray(teamMember.tags) && teamMember.tags.length > 0 && (
				<div className="flex gap-1 flex-wrap mt-1">
					{teamMember.tags.map((tag, idx) => (
						<Tag key={idx} className="px-1.5 py-0.5">
							{tag}
						</Tag>
					))}
				</div>
			)}
			{((teamMember.authoritativeDefinitions && teamMember.authoritativeDefinitions.length > 0) || (teamMember.customProperties && teamMember.customProperties.length > 0)) && (
				<div className="flex flex-wrap gap-2 mt-2">
					{teamMember.authoritativeDefinitions && teamMember.authoritativeDefinitions.length > 0 && (
						<AuthoritativeDefinitionsPreview
							definitions={teamMember.authoritativeDefinitions}/>
					)}
					{teamMember.customProperties && teamMember.customProperties.length > 0 && (
						<CustomPropertiesPreview properties={teamMember.customProperties}/>
					)}
				</div>
			)}
		</div>
	);
}, (prevProps, nextProps) => {
	try {
		return JSON.stringify(prevProps.teamMember) === JSON.stringify(nextProps.teamMember);
	} catch {
		return false;
	}
});

TeamMember.displayName = 'TeamMember';

// Main TeamSection component
const TeamSection = () => {
	const team = useEditorStore(useShallow(state => state.getValue('team')));
	const teamMembers = team.members || [];
	const hasData = team.name || team.description || teamMembers.length > 0 || (team.tags && team.tags.length > 0);

	if (!hasData) return null;

	return (
		<section>
			<div className="px-4 sm:px-0">
				<h1 className="text-base font-semibold leading-6 text-gray-900" id="team">Team</h1>
				<p className="text-sm text-gray-500">This section lists team information and members</p>
			</div>

			{/* Team Info */}
			<div className="mt-2 overflow-hidden shadow sm:rounded-lg bg-white">
				<div className="px-4 py-4 sm:px-6">
					{/* Authoritative Definitions Section */}
					{team.authoritativeDefinitions && Array.isArray(team.authoritativeDefinitions) && team.authoritativeDefinitions.length > 0 && (
						<div className="flex flex-wrap gap-2 mb-6">
							{team.authoritativeDefinitions.map((def, index) => (
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

					<div className="flex flex-col gap-3">
						{team.name && (
							<div>
								<dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Team Name</dt>
								<dd className="mt-1 text-sm text-gray-900">{team.name}</dd>
							</div>
						)}

						{team.description && (
							<div>
								<dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Description</dt>
								<dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{team.description}</dd>
							</div>
						)}

						{team.tags && Array.isArray(team.tags) && team.tags.length > 0 && (
							<div>
								<dt className="text-sm font-medium text-gray-500 mb-2">Tags</dt>
								<dd className="flex gap-1 items-center text-xs text-gray-500 flex-wrap">
									{team.tags.map((tag, index) => (
										<Tag key={index}>
											{tag}
										</Tag>
									))}
								</dd>
							</div>
						)}

						{team.customProperties && Array.isArray(team.customProperties) && team.customProperties.length > 0 && (
							<div>
								<dt className="text-sm font-medium text-gray-500 mb-2">Custom Properties</dt>
								<dd className="flex flex-wrap gap-x-4 gap-y-2">
									{team.customProperties.map((customProp, index) => (
										<div key={index} className="min-w-0">
											<dt
												className="text-xs font-medium text-gray-500 uppercase tracking-wide inline-flex items-center gap-1">
												{customProp.property}
												{customProp.description && (
													<Tooltip content={customProp.description}>
														<QuestionMarkCircleIcon />
													</Tooltip>
												)}
											</dt>
											<dd className="text-sm text-gray-900">
												<PropertyValueRenderer value={customProp.value}/>
											</dd>
										</div>
									))}
								</dd>
							</div>
						)}

						{/* Team members */}
						{teamMembers?.length > 0 && (
							<div>
								<dt className="text-sm font-medium text-gray-500 mb-2">Members</dt>
								<dd>
									<div className="space-y-3">
										{teamMembers?.map((teamMember, index) => (
											<TeamMember key={index} teamMember={teamMember} index={index} />
										))}
									</div>
								</dd>
							</div>
						)}
					</div>
				</div>
			</div>
		</section>
	);
};

TeamSection.displayName = 'TeamSection';

export default TeamSection;
