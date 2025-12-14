/**
 * Physical type mappings for different server types
 * Grouped by category for better UX in the combobox
 */
export const physicalTypeMappings = {
  // PostgreSQL
  postgres: {
    text: ['VARCHAR', 'TEXT', 'CHAR', 'UUID', 'CITEXT'],
    numeric: ['INTEGER', 'BIGINT', 'SMALLINT', 'SERIAL', 'BIGSERIAL', 'NUMERIC', 'DECIMAL', 'REAL', 'DOUBLE PRECISION', 'MONEY'],
    datetime: ['DATE', 'TIME', 'TIMETZ', 'TIMESTAMP', 'TIMESTAMPTZ', 'INTERVAL'],
    other: ['BOOLEAN', 'JSON', 'JSONB', 'BYTEA', 'ARRAY', 'XML', 'INET', 'CIDR', 'MACADDR'],
  },
  postgresql: {
    text: ['VARCHAR', 'TEXT', 'CHAR', 'UUID', 'CITEXT'],
    numeric: ['INTEGER', 'BIGINT', 'SMALLINT', 'SERIAL', 'BIGSERIAL', 'NUMERIC', 'DECIMAL', 'REAL', 'DOUBLE PRECISION', 'MONEY'],
    datetime: ['DATE', 'TIME', 'TIMETZ', 'TIMESTAMP', 'TIMESTAMPTZ', 'INTERVAL'],
    other: ['BOOLEAN', 'JSON', 'JSONB', 'BYTEA', 'ARRAY', 'XML', 'INET', 'CIDR', 'MACADDR'],
  },

  // Snowflake
  snowflake: {
    text: ['VARCHAR', 'CHAR', 'STRING', 'TEXT'],
    numeric: ['NUMBER', 'INT', 'INTEGER', 'BIGINT', 'SMALLINT', 'TINYINT', 'FLOAT', 'FLOAT4', 'FLOAT8', 'DOUBLE', 'DOUBLE PRECISION', 'DECIMAL', 'NUMERIC'],
    datetime: ['DATE', 'TIME', 'TIMESTAMP', 'TIMESTAMP_NTZ', 'TIMESTAMP_LTZ', 'TIMESTAMP_TZ'],
    other: ['BOOLEAN', 'VARIANT', 'OBJECT', 'ARRAY', 'BINARY', 'VARBINARY', 'GEOGRAPHY', 'GEOMETRY'],
  },

  // BigQuery
  bigquery: {
    text: ['STRING', 'BYTES'],
    numeric: ['INT64', 'FLOAT64', 'NUMERIC', 'BIGNUMERIC'],
    datetime: ['DATE', 'TIME', 'DATETIME', 'TIMESTAMP'],
    other: ['BOOL', 'JSON', 'STRUCT', 'ARRAY', 'GEOGRAPHY', 'INTERVAL'],
  },

  // MySQL
  mysql: {
    text: ['VARCHAR', 'CHAR', 'TEXT', 'TINYTEXT', 'MEDIUMTEXT', 'LONGTEXT', 'ENUM', 'SET'],
    numeric: ['INT', 'INTEGER', 'BIGINT', 'SMALLINT', 'TINYINT', 'MEDIUMINT', 'DECIMAL', 'NUMERIC', 'FLOAT', 'DOUBLE', 'BIT'],
    datetime: ['DATE', 'TIME', 'DATETIME', 'TIMESTAMP', 'YEAR'],
    other: ['BOOLEAN', 'BOOL', 'JSON', 'BLOB', 'TINYBLOB', 'MEDIUMBLOB', 'LONGBLOB', 'BINARY', 'VARBINARY'],
  },

  // Oracle
  oracle: {
    text: ['VARCHAR2', 'NVARCHAR2', 'CHAR', 'NCHAR', 'CLOB', 'NCLOB', 'LONG'],
    numeric: ['NUMBER', 'INTEGER', 'FLOAT', 'BINARY_FLOAT', 'BINARY_DOUBLE'],
    datetime: ['DATE', 'TIMESTAMP', 'TIMESTAMP WITH TIME ZONE', 'TIMESTAMP WITH LOCAL TIME ZONE', 'INTERVAL YEAR TO MONTH', 'INTERVAL DAY TO SECOND'],
    other: ['RAW', 'LONG RAW', 'BLOB', 'BFILE', 'XMLTYPE', 'JSON', 'ROWID', 'UROWID'],
  },

  // SQL Server
  sqlserver: {
    text: ['VARCHAR', 'NVARCHAR', 'CHAR', 'NCHAR', 'TEXT', 'NTEXT'],
    numeric: ['INT', 'BIGINT', 'SMALLINT', 'TINYINT', 'DECIMAL', 'NUMERIC', 'FLOAT', 'REAL', 'MONEY', 'SMALLMONEY'],
    datetime: ['DATE', 'TIME', 'DATETIME', 'DATETIME2', 'DATETIMEOFFSET', 'SMALLDATETIME'],
    other: ['BIT', 'UNIQUEIDENTIFIER', 'XML', 'VARBINARY', 'BINARY', 'IMAGE', 'GEOGRAPHY', 'GEOMETRY', 'HIERARCHYID', 'SQL_VARIANT'],
  },

  // Azure Synapse
  synapse: {
    text: ['VARCHAR', 'NVARCHAR', 'CHAR', 'NCHAR'],
    numeric: ['INT', 'BIGINT', 'SMALLINT', 'TINYINT', 'DECIMAL', 'NUMERIC', 'FLOAT', 'REAL', 'MONEY', 'SMALLMONEY'],
    datetime: ['DATE', 'TIME', 'DATETIME', 'DATETIME2', 'DATETIMEOFFSET', 'SMALLDATETIME'],
    other: ['BIT', 'UNIQUEIDENTIFIER', 'VARBINARY', 'BINARY'],
  },

  // Redshift
  redshift: {
    text: ['VARCHAR', 'CHAR', 'BPCHAR', 'TEXT'],
    numeric: ['INTEGER', 'INT', 'INT2', 'INT4', 'INT8', 'BIGINT', 'SMALLINT', 'DECIMAL', 'NUMERIC', 'REAL', 'FLOAT', 'FLOAT4', 'FLOAT8', 'DOUBLE PRECISION'],
    datetime: ['DATE', 'TIME', 'TIMETZ', 'TIMESTAMP', 'TIMESTAMPTZ'],
    other: ['BOOLEAN', 'SUPER', 'GEOMETRY', 'GEOGRAPHY', 'HLLSKETCH', 'VARBYTE'],
  },

  // Databricks
  databricks: {
    text: ['STRING', 'BINARY'],
    numeric: ['TINYINT', 'SMALLINT', 'INT', 'BIGINT', 'FLOAT', 'DOUBLE', 'DECIMAL'],
    datetime: ['DATE', 'TIMESTAMP', 'TIMESTAMP_NTZ', 'INTERVAL'],
    other: ['BOOLEAN', 'ARRAY', 'MAP', 'STRUCT', 'VARIANT'],
  },

  // ClickHouse
  clickhouse: {
    text: ['String', 'FixedString', 'UUID'],
    numeric: ['Int8', 'Int16', 'Int32', 'Int64', 'Int128', 'Int256', 'UInt8', 'UInt16', 'UInt32', 'UInt64', 'UInt128', 'UInt256', 'Float32', 'Float64', 'Decimal', 'Decimal32', 'Decimal64', 'Decimal128'],
    datetime: ['Date', 'Date32', 'DateTime', 'DateTime64'],
    other: ['Bool', 'Enum8', 'Enum16', 'Array', 'Tuple', 'Map', 'Nested', 'JSON', 'IPv4', 'IPv6', 'LowCardinality', 'Nullable'],
  },

  // Hive
  hive: {
    text: ['STRING', 'VARCHAR', 'CHAR'],
    numeric: ['TINYINT', 'SMALLINT', 'INT', 'BIGINT', 'FLOAT', 'DOUBLE', 'DECIMAL'],
    datetime: ['DATE', 'TIMESTAMP', 'INTERVAL'],
    other: ['BOOLEAN', 'BINARY', 'ARRAY', 'MAP', 'STRUCT', 'UNIONTYPE'],
  },

  // Trino / Presto
  trino: {
    text: ['VARCHAR', 'CHAR', 'VARBINARY', 'JSON', 'UUID'],
    numeric: ['TINYINT', 'SMALLINT', 'INTEGER', 'BIGINT', 'REAL', 'DOUBLE', 'DECIMAL'],
    datetime: ['DATE', 'TIME', 'TIME WITH TIME ZONE', 'TIMESTAMP', 'TIMESTAMP WITH TIME ZONE', 'INTERVAL YEAR TO MONTH', 'INTERVAL DAY TO SECOND'],
    other: ['BOOLEAN', 'ARRAY', 'MAP', 'ROW', 'IPADDRESS', 'HYPERLOGLOG', 'P4HYPERLOGLOG', 'QDIGEST', 'TDIGEST'],
  },
  presto: {
    text: ['VARCHAR', 'CHAR', 'VARBINARY', 'JSON', 'UUID'],
    numeric: ['TINYINT', 'SMALLINT', 'INTEGER', 'BIGINT', 'REAL', 'DOUBLE', 'DECIMAL'],
    datetime: ['DATE', 'TIME', 'TIME WITH TIME ZONE', 'TIMESTAMP', 'TIMESTAMP WITH TIME ZONE', 'INTERVAL YEAR TO MONTH', 'INTERVAL DAY TO SECOND'],
    other: ['BOOLEAN', 'ARRAY', 'MAP', 'ROW', 'IPADDRESS', 'HYPERLOGLOG', 'P4HYPERLOGLOG', 'QDIGEST', 'TDIGEST'],
  },

  // DuckDB
  duckdb: {
    text: ['VARCHAR', 'TEXT', 'STRING', 'CHAR', 'BPCHAR', 'UUID', 'BLOB'],
    numeric: ['TINYINT', 'SMALLINT', 'INTEGER', 'BIGINT', 'HUGEINT', 'UTINYINT', 'USMALLINT', 'UINTEGER', 'UBIGINT', 'FLOAT', 'DOUBLE', 'DECIMAL', 'NUMERIC'],
    datetime: ['DATE', 'TIME', 'TIMESTAMP', 'TIMESTAMPTZ', 'INTERVAL'],
    other: ['BOOLEAN', 'LIST', 'STRUCT', 'MAP', 'UNION', 'ENUM', 'JSON'],
  },

  // Kafka / Avro
  kafka: {
    text: ['string', 'bytes', 'fixed'],
    numeric: ['int', 'long', 'float', 'double'],
    datetime: ['date', 'time-millis', 'time-micros', 'timestamp-millis', 'timestamp-micros', 'local-timestamp-millis', 'local-timestamp-micros'],
    other: ['boolean', 'null', 'array', 'map', 'record', 'enum', 'uuid', 'decimal'],
  },
  kinesis: {
    text: ['string', 'bytes'],
    numeric: ['int', 'long', 'float', 'double'],
    datetime: ['timestamp'],
    other: ['boolean', 'array', 'map', 'record'],
  },
  pubsub: {
    text: ['string', 'bytes'],
    numeric: ['int', 'long', 'float', 'double'],
    datetime: ['timestamp'],
    other: ['boolean', 'array', 'map', 'record'],
  },

  // File-based (generic / Parquet / Avro)
  s3: {
    text: ['string', 'binary'],
    numeric: ['int8', 'int16', 'int32', 'int64', 'uint8', 'uint16', 'uint32', 'uint64', 'float', 'double', 'decimal'],
    datetime: ['date', 'time', 'timestamp'],
    other: ['boolean', 'list', 'map', 'struct', 'null'],
  },
  azure: {
    text: ['string', 'binary'],
    numeric: ['int8', 'int16', 'int32', 'int64', 'uint8', 'uint16', 'uint32', 'uint64', 'float', 'double', 'decimal'],
    datetime: ['date', 'time', 'timestamp'],
    other: ['boolean', 'list', 'map', 'struct', 'null'],
  },
  local: {
    text: ['string', 'binary'],
    numeric: ['integer', 'long', 'float', 'double', 'decimal'],
    datetime: ['date', 'time', 'timestamp'],
    other: ['boolean', 'array', 'object'],
  },

  // AWS Glue / Athena
  glue: {
    text: ['string', 'char', 'varchar', 'binary'],
    numeric: ['tinyint', 'smallint', 'int', 'bigint', 'float', 'double', 'decimal'],
    datetime: ['date', 'timestamp'],
    other: ['boolean', 'array', 'map', 'struct'],
  },
  athena: {
    text: ['varchar', 'char', 'string', 'binary', 'varbinary', 'json'],
    numeric: ['tinyint', 'smallint', 'int', 'integer', 'bigint', 'float', 'double', 'real', 'decimal'],
    datetime: ['date', 'time', 'time with time zone', 'timestamp', 'timestamp with time zone', 'interval year to month', 'interval day to second'],
    other: ['boolean', 'array', 'map', 'row', 'ipaddress', 'uuid', 'hyperloglog'],
  },

  // Default fallback
  default: {
    text: ['VARCHAR', 'TEXT', 'STRING', 'CHAR'],
    numeric: ['INTEGER', 'INT', 'BIGINT', 'SMALLINT', 'DECIMAL', 'NUMERIC', 'FLOAT', 'DOUBLE'],
    datetime: ['DATE', 'TIME', 'TIMESTAMP', 'DATETIME'],
    other: ['BOOLEAN', 'JSON', 'ARRAY', 'OBJECT', 'BINARY'],
  },
};

/**
 * Category labels for display
 */
export const categoryLabels = {
  text: 'Text Types',
  numeric: 'Numeric Types',
  datetime: 'Date/Time Types',
  other: 'Other Types',
};

/**
 * Mapping from logical types to physical type categories
 * Used to filter physical type suggestions based on selected logical type
 */
export const logicalToPhysicalCategories = {
  string: ['text'],
  date: ['datetime'],
  timestamp: ['datetime'],
  time: ['datetime'],
  number: ['numeric'],
  integer: ['numeric'],
  object: ['other'],
  array: ['other'],
  boolean: ['other'],
};

/**
 * Get grouped physical types for a server type, optionally filtered by logical type
 * @param {string} serverType - The server type (e.g., 'postgres', 'snowflake')
 * @param {string} logicalType - Optional logical type to filter categories
 * @returns {Array<{category: string, label: string, types: string[]}>} Grouped types
 */
export function getGroupedPhysicalTypes(serverType, logicalType) {
  const mapping = physicalTypeMappings[serverType] || physicalTypeMappings.default;

  // Get allowed categories based on logical type
  const allowedCategories = logicalType
    ? logicalToPhysicalCategories[logicalType]
    : null;

  return Object.entries(mapping)
    .filter(([category]) => !allowedCategories || allowedCategories.includes(category))
    .map(([category, types]) => ({
      category,
      label: categoryLabels[category] || category,
      types,
    }));
}

/**
 * Get flat list of all physical types for a server
 * @param {string} serverType - The server type
 * @returns {string[]} All physical types
 */
export function getAllPhysicalTypes(serverType) {
  const mapping = physicalTypeMappings[serverType] || physicalTypeMappings.default;
  return Object.values(mapping).flat();
}

/**
 * Get physical types for a specific category
 * @param {string} serverType - The server type
 * @param {string} category - The category (text, numeric, datetime, other)
 * @returns {string[]} Physical types for the category
 */
export function getPhysicalTypesByCategory(serverType, category) {
  const mapping = physicalTypeMappings[serverType] || physicalTypeMappings.default;
  return mapping[category] || [];
}
