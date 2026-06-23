import {useTranslation} from 'react-i18next';
import {Tooltip} from '../../ui/index.js';
import KeyIcon from "../../ui/icons/KeyIcon.jsx";
import AsteriskIcon from "../../ui/icons/AsteriskIcon.jsx";
import LockClosedIcon from "../../ui/icons/LockClosedIcon.jsx";
import CheckCircleIcon from "../../ui/icons/CheckCircleIcon.jsx";
import LinkIcon from "../../ui/icons/LinkIcon.jsx";

/**
 * Visual indicator badges component showing property metadata
 * Displays icons for primary key, required, classification, quality rules, relationships, and definitions
 */
const PropertyIndicators = ({property}) => {
    const {t} = useTranslation();
    const indicators = [];


    if (property.primaryKey) {
        indicators.push(
            <Tooltip key="pk" content={t('schema.indicator.primaryKey')}>
                <KeyIcon className="h-3.5 w-3.5 text-gray-400"/>
            </Tooltip>
        );
    }

    if (property.required) {
        indicators.push(
            <Tooltip key="req" content={t('schema.indicator.required')}>
                <AsteriskIcon className="h-3.5 w-3.5 text-gray-400"/>
            </Tooltip>
        );
    }

    if (property.classification) {
        indicators.push(
            <Tooltip key="class" content={t('schema.indicator.classification', {classification: property.classification})}>
                <LockClosedIcon className="h-3.5 w-3.5 text-gray-400"/>
            </Tooltip>
        );
    }

    if (property.quality && property.quality.length > 0) {
        indicators.push(
            <Tooltip key="qual" content={t('schema.indicator.qualityRules', {count: property.quality.length})}>
                <CheckCircleIcon className="h-3.5 w-3.5 text-gray-400"/>
            </Tooltip>
        );
    }

    if (property.relationships && property.relationships.length > 0) {
        indicators.push(
            <Tooltip key="rel" content={t('schema.indicator.relationships', {count: property.relationships.length})}>
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
