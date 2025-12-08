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

const DataContractPreview = () => {
	// Extract data for all sections

	return (
		<div className="space-y-6" id="docs-content">
			<ContractHeader />

			{/* Main Column */}
				<div className="space-y-6" id="datacontract-content">
					{/* 1. Fundamentals Section */}
					<FundamentalsSection
					/>

					{/* 2. Description Section */}
					<DescriptionPreview />

					{/* 3. Data Model Section */}
					<SchemaSection />

					{/* 4. Servers Section */}
					<ServersSection />

					{/* 5. Team Section */}
					<TeamSection />

					{/* 6. Support & Communication Section */}
					<SupportSection />

					{/* 7. Roles Section */}
					<RolesSection />

					{/* 8. Pricing Section */}
					<PricingSection />

					{/* 9. SLA Section */}
					<SlaSection />

					{/* 10. Custom Properties Section */}
					<CustomPropertiesSection />

				</div>
		</div>
	);
};

export default DataContractPreview;
