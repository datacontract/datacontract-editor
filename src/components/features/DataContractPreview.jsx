import { useMemo } from 'react';
import { parseYaml } from '../../utils/yaml.js';
import DescriptionPreview from '../ui/DescriptionPreview.jsx';
import ContractHeader from './preview/ContractHeader.jsx';
import FundamentalsSection from './preview/FundamentalsSection.jsx';
import SchemaSection from './preview/SchemaSection.jsx';
import ServersSection from './preview/ServersSection.jsx';
import TeamSection from './preview/TeamSection.jsx';
import SupportSection from './preview/SupportSection.jsx';
import RolesSection from './preview/RolesSection.jsx';
import PricingSection from './preview/PricingSection.jsx';
import SlaSection from './preview/SlaSection.jsx';
import CustomPropertiesSection from './preview/CustomPropertiesSection.jsx';

const DataContractPreview = ({ yamlContent }) => {
	const parsedData = useMemo(() => {
		if (!yamlContent?.trim()) {
			return null;
		}

		try {
			return parseYaml(yamlContent);
		} catch (error) {
			return { error: error.message };
		}
	}, [yamlContent]);

	if (!parsedData) {
		return (
			<div className="flex items-center justify-center h-full text-gray-400">
				<div className="text-center">
					<p className="text-sm font-medium">No docs to preview</p>
					<p className="text-xs">Start editing the YAML to see a preview</p>
				</div>
			</div>
		);
	}

	if (parsedData.error) {
		return (
			<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
				<h3 className="text-red-800 font-medium text-sm">YAML Parse Error</h3>
				<p className="text-red-700 text-xs mt-1">{parsedData.error}</p>
			</div>
		);
	}

	// Extract data for all sections
	const info = parsedData.info || {};
	const description = parsedData.description || {};
	const links = parsedData.links || [];
	const support = parsedData.support || [];
	const price = parsedData.price || null;
	// Team is now an object with name, description, members, tags, customProperties, authoritativeDefinitions
	const team = parsedData.team || {};
	const teamMembers = team.members || [];
	const roles = parsedData.roles || [];
	const slaProperties = parsedData.slaProperties || [];
	const servers = parsedData.servers || [];
	const customProperties = parsedData.customProperties || [];
	const authoritativeDefinitions = parsedData.authoritativeDefinitions || [];
	const domain = parsedData.domain;
	const schema = parsedData.schema;
	const contractCreatedTs = parsedData.contractCreatedTs;

	// Check if we have any meaningful data to display
	const hasAnyData = parsedData.title ||
		parsedData.id ||
		parsedData.name ||
		parsedData.version ||
		parsedData.status ||
		parsedData.tenant ||
		domain ||
		parsedData.dataProduct ||
		contractCreatedTs ||
		(parsedData.tags && Array.isArray(parsedData.tags) && parsedData.tags.length > 0) ||
		(authoritativeDefinitions && authoritativeDefinitions.length > 0) ||
		(links && links.length > 0) ||
		description?.purpose ||
		description?.usage ||
		description?.limitations ||
		Object.keys(schema).length > 0 ||
		(servers && servers.length > 0) ||
		(team.name || team.description || teamMembers.length > 0 || (team.tags && team.tags.length > 0)) ||
		(support && support.length > 0) ||
		(roles && roles.length > 0) ||
		price ||
		(slaProperties && slaProperties.length > 0) ||
		(customProperties && customProperties.length > 0);

	return (
		<div className="space-y-6" id="docs-content">
			{/* Header Section */}
			{hasAnyData && (
				<ContractHeader info={info} parsedData={parsedData} />
			)}

			{/* Main Column */}
			{hasAnyData && (
				<div className="space-y-6" id="datacontract-content">

					{/* 1. Fundamentals Section */}
					<FundamentalsSection
						parsedData={parsedData}
						authoritativeDefinitions={authoritativeDefinitions}
						links={links}
						domain={domain}
						contractCreatedTs={contractCreatedTs}
					/>

					{/* 2. Description Section */}
					<DescriptionPreview description={description} />

					{/* 3. Data Model Section */}
					<SchemaSection schema={schema} />

					{/* 4. Servers Section */}
					<ServersSection servers={servers} />

					{/* 5. Team Section */}
					<TeamSection team={team} teamMembers={teamMembers} />

					{/* 6. Support & Communication Section */}
					<SupportSection support={support} />

					{/* 7. Roles Section */}
					<RolesSection roles={roles} />

					{/* 8. Pricing Section */}
					<PricingSection price={price} />

					{/* 9. SLA Section */}
					<SlaSection slaProperties={slaProperties} />

					{/* 10. Custom Properties Section */}
					<CustomPropertiesSection customProperties={customProperties} />

				</div>
			)}
		</div>
	);
};

export default DataContractPreview;
