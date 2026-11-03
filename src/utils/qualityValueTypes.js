const INTEGER_PATTERN = /^[+-]?\d+$/;
const NUMBER_PATTERN = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;

const coerceValue = (value, logicalType) => {
  if (typeof value !== 'string') return value;
  const text = value.trim();
  switch (logicalType) {
    case 'integer': {
      if (!INTEGER_PATTERN.test(text)) return value;
      const parsed = Number(text);
      return Number.isSafeInteger(parsed) ? parsed : value;
    }
    case 'number': {
      if (!NUMBER_PATTERN.test(text)) return value;
      const parsed = Number(text);
      return Number.isFinite(parsed) ? parsed : value;
    }
    case 'boolean': {
      const lower = text.toLowerCase();
      if (lower === 'true') return true;
      if (lower === 'false') return false;
      return value;
    }
    default:
      return value;
  }
};

// Values typed into a quality rule (validValues, missingValues) arrive as lines of text. A test engine
// compares them against the column, so an integer, number or boolean property needs typed values, not
// strings. Without a logicalType, or when a line does not parse as that type, the string is kept: guessing
// from the text alone would turn a string column's "0123" into 123.
export const coerceValuesToLogicalType = (values, logicalType) =>
  (values ?? []).map((value) => coerceValue(value, logicalType));
