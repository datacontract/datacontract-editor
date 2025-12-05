import StringIcon from "../../ui/icons/StringIcon.jsx";
import NumberIcon from "../../ui/icons/NumberIcon.jsx";
import IntegerIcon from "../../ui/icons/IntegerIcon.jsx";
import DateIcon from "../../ui/icons/DateIcon.jsx";
import TimeIcon from "../../ui/icons/TimeIcon.jsx";
import TimestampIcon from "../../ui/icons/TimestampIcon.jsx";
import ObjectIcon from "../../ui/icons/ObjectIcon.jsx";
import ArrayIcon from "../../ui/icons/ArrayIcon.jsx";
import BooleanIcon from "../../ui/icons/BooleanIcon.jsx";

/**
 * Get icon component for a logical type
 * @param {string} logicalType - The logical type (string, number, date, etc.)
 * @returns {Component|null} Icon component or null if not found
 */
export const getLogicalTypeIcon = (logicalType) => {
    const iconMap = {
        'string': StringIcon,
        'number': NumberIcon,
        'integer': IntegerIcon,
        'date': DateIcon,
        'time': TimeIcon,
        'timestamp': TimestampIcon,
        'object': ObjectIcon,
        'array': ArrayIcon,
        'boolean': BooleanIcon
    };
    return iconMap[logicalType] || null;
};

/**
 * Fallback logical type options (used if schema not loaded)
 */
export const fallbackLogicalTypeOptions = [
    'string',
    'date',
    'timestamp',
    'time',
    'number',
    'integer',
    'object',
    'array',
    'boolean'
];
