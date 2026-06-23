import { memo } from 'react';
import {useTranslation} from 'react-i18next';
import Tags from '../../ui/Tags.jsx';
import Tooltip from '../../ui/Tooltip.jsx';
import PropertyValueRenderer from '../../ui/PropertyValueRenderer.jsx';
import { IconResolver } from '../../ui/IconResolver.jsx';
import AuthoritativeDefinitionsPreview from '../../ui/AuthoritativeDefinitionsPreview.jsx';
import CustomPropertiesPreview from '../../ui/CustomPropertiesPreview.jsx';
import QuestionMarkCircleIcon from '../../ui/icons/QuestionMarkCircleIcon.jsx';
import {useEditorStore} from "../../../store.js";
import {useShallow} from "zustand/react/shallow";
import {useCustomization, useHiddenCustomPropertyNames} from "../../../hooks/useCustomization.js";

// Memoized Team Member component
const TeamMember = memo(({ teamMember }) => {
	const { t } = useTranslation();
	const hiddenNames = useHiddenCustomPropertyNames('team.members');
	const { customProperties: customPropertyConfigs } = useCustomization('team.members');
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
			(member.customProperties && (
				Array.isArray(member.customProperties) ? member.customProperties.length > 0 :
				typeof member.customProperties === 'object' && Object.keys(member.customProperties).length > 0
			));
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
					<span>{t('preview.team.dateIn', { date: teamMember.dateIn })}</span>
				)}
				{teamMember.dateOut && (
					<span>{t('preview.team.dateOut', { date: teamMember.dateOut })}</span>
				)}
				{teamMember.replacedByUsername && (
					<span>{t('preview.team.replacedBy', { username: teamMember.replacedByUsername })}</span>
				)}
			</div>
			{teamMember.tags && Array.isArray(teamMember.tags) && teamMember.tags.length > 0 && <Tags tags={teamMember.tags}/> }
			{(() => {
				const hasAuthDefs = teamMember.authoritativeDefinitions && teamMember.authoritativeDefinitions.length > 0;
				const hasCustomProps = teamMember.customProperties && (
					Array.isArray(teamMember.customProperties) ? teamMember.customProperties.length > 0 :
					typeof teamMember.customProperties === 'object' && Object.keys(teamMember.customProperties).length > 0
				);
				if (!hasAuthDefs && !hasCustomProps) return null;
				return (
					<div className="flex flex-wrap gap-2 mt-2">
						{hasAuthDefs && (
							<AuthoritativeDefinitionsPreview
								definitions={teamMember.authoritativeDefinitions}/>
						)}
						{hasCustomProps && (
							<CustomPropertiesPreview properties={teamMember.customProperties} hiddenPropertyNames={hiddenNames} customPropertyConfigs={customPropertyConfigs}/>
						)}
					</div>
				);
			})()}
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
	const { t } = useTranslation();
	const team = useEditorStore(useShallow(state => state.getValue('team')));
	const teamMembers = team?.members || [];
	const teamHiddenNames = useHiddenCustomPropertyNames('team');
	const { customProperties: teamCustomPropertyConfigs } = useCustomization('team');
	const teamConfigsByName = new Map((teamCustomPropertyConfigs || []).map((c) => [c.property, c]));
	const hasData = team?.name || team?.description || teamMembers?.length > 0 || (team?.tags && team?.tags?.length > 0);

	if (!hasData) return null;

	return (
		<section>
			<div className="px-4 sm:px-0">
				<h1 className="text-base font-semibold leading-6 text-gray-900" id="team">{t('preview.team.heading')}</h1>
				<p className="text-sm text-gray-500">{t('preview.team.description')}</p>
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
								<dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('preview.team.teamName')}</dt>
								<dd className="mt-1 text-sm text-gray-900">{team.name}</dd>
							</div>
						)}

						{team.description && (
							<div>
								<dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('preview.team.descriptionLabel')}</dt>
								<dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{team.description}</dd>
							</div>
						)}

						{team.tags && Array.isArray(team.tags) && team.tags.length > 0 && (
							<div>
								<dt className="text-sm font-medium text-gray-500 mb-2">{t('preview.team.tags')}</dt>
								<dd><Tags tags={team.tags}/></dd>
							</div>
						)}

						{team.customProperties && (
							Array.isArray(team.customProperties) ? team.customProperties.length > 0 :
							typeof team.customProperties === 'object' && Object.keys(team.customProperties).length > 0
						) && (() => {
							const rawProps = Array.isArray(team.customProperties)
								? team.customProperties
								: Object.entries(team.customProperties).map(([key, value]) => ({
									property: key,
									value: value,
								}));
							const normalizedProps = rawProps.filter((p) => !teamHiddenNames.has(p.property));
							if (normalizedProps.length === 0) return null;
							return (
								<div>
									<dt className="text-sm font-medium text-gray-500 mb-2">{t('preview.team.customProperties')}</dt>
									<dd className="flex flex-wrap gap-x-4 gap-y-2">
										{normalizedProps.map((customProp, index) => {
											const cfg = teamConfigsByName.get(customProp.property);
											const label = cfg?.title || customProp.property;
											const showTechnicalName = !!cfg?.title && cfg.title !== customProp.property;
											const description = cfg?.description || customProp.description;
											return (
												<div key={index} className="min-w-0">
													<dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
														<div className="inline-flex items-center gap-1">
															{label}
															{description && (
																<Tooltip content={description}>
																	<QuestionMarkCircleIcon />
																</Tooltip>
															)}
														</div>
														{showTechnicalName && (
															<div className="mt-0.5 font-mono text-[10px] normal-case tracking-normal text-gray-400">{customProp.property}</div>
														)}
													</dt>
													<dd className="text-sm text-gray-900">
														<PropertyValueRenderer value={customProp.value}/>
													</dd>
												</div>
											);
										})}
									</dd>
								</div>
							);
						})()}

						{/* Team members */}
						{teamMembers?.length > 0 && (
							<div>
								<dt className="text-sm font-medium text-gray-500 mb-2">{t('preview.team.members')}</dt>
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
