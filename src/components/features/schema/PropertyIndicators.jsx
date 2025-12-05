import {Tooltip} from '../../ui/index.js';
import KeyIcon from "../../ui/icons/KeyIcon.jsx";
import AsteriskIcon from "../../ui/icons/AsteriskIcon.jsx";
import LockClosedIcon from "../../ui/icons/LockClosedIcon.jsx";
import CheckCircleIcon from "../../ui/icons/CheckCircleIcon.jsx";
import LinkIcon from "../../ui/icons/LinkIcon.jsx";

/**
 * Visual indicator badges component showing property metadata
 * Displays icons for primary key, required, classification, quality rules, and relationships
 */
const PropertyIndicators = ({property}) => {
    const indicators = [];

    if (property.primaryKey) {
        indicators.push(
            <Tooltip key="pk" content="Primary Key">
                <KeyIcon className="h-3.5 w-3.5 text-gray-400"/>
            </Tooltip>
        );
    }

    if (property.required) {
        indicators.push(
            <Tooltip key="req" content="Required">
                <AsteriskIcon className="h-3.5 w-3.5 text-gray-400"/>
            </Tooltip>
        );
    }

    if (property.classification) {
        indicators.push(
            <Tooltip key="class" content={`Classification: ${property.classification}`}>
                <LockClosedIcon className="h-3.5 w-3.5 text-gray-400"/>
            </Tooltip>
        );
    }

    if (property.quality && property.quality.length > 0) {
        indicators.push(
            <Tooltip key="qual" content={`${property.quality.length} quality rule(s)`}>
                <CheckCircleIcon className="h-3.5 w-3.5 text-gray-400"/>
            </Tooltip>
        );
    }

    if (property.relationships && property.relationships.length > 0) {
        indicators.push(
            <Tooltip key="rel" content={`${property.relationships.length} relationship(s)`}>
                <LinkIcon className="h-3.5 w-3.5 text-gray-400"/>
            </Tooltip>
        );
    }

    return (
        <div className="flex items-center gap-1 min-w-14">
            {indicators}
        </div>
    );
};

export default PropertyIndicators;
