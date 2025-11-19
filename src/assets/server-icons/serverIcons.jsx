// Server icons - imports SVG files for all server types with fallback to database.svg

// Import SVG files as URLs
import ApiIcon from './api.svg';
import AthenaIcon from './athena.svg';
import AzureIcon from './azure.svg';
import BigQueryIcon from './bigquery.svg';
import ClickHouseIcon from './clickhouse.svg';
import CloudSQLIcon from './cloudsql.svg';
import CustomIcon from './custom.svg';
import DatabaseIcon from './database.svg';
import DatabricksIcon from './databricks.svg';
import DB2Icon from './db2.svg';
import DenodoIcon from './denodo.svg';
import DremioIcon from './dremio.svg';
import DuckDBIcon from './duckdb.svg';
import GlueIcon from './glue.svg';
import HiveIcon from './hive.svg';
import InformixIcon from './informix.svg';
import KafkaIcon from './kafka.svg';
import KinesisIcon from './kinesis.svg';
import LocalIcon from './local.svg';
import MySQLIcon from './mysql.svg';
import OracleIcon from './oracle.svg';
import PostgreSQLIcon from './postgresql.svg';
import PostgresIcon from './postgres.svg';
import PrestoIcon from './presto.svg';
import PubSubIcon from './pubsub.svg';
import RedshiftIcon from './redshift.svg';
import S3Icon from './s3.svg';
import SFTPIcon from './sftp.svg';
import SnowflakeIcon from './snowflake.svg';
import SQLServerIcon from './sqlserver.svg';
import SynapseIcon from './synapse.svg';
import TrinoIcon from './trino.svg';
import VerticaIcon from './vertica.svg';

// Wrapper component to render SVG as img tag with consistent styling
const IconWrapper = ({ src }) => <img src={src} className="w-5 h-5" alt="" />;

// Map server types to their icon components with database.svg as fallback
const serverIcons = {
  api: () => <IconWrapper src={ApiIcon} />,
  athena: () => <IconWrapper src={AthenaIcon} />,
  azure: () => <IconWrapper src={AzureIcon} />,
  bigquery: () => <IconWrapper src={BigQueryIcon} />,
  clickhouse: () => <IconWrapper src={ClickHouseIcon} />,
  cloudsql: () => <IconWrapper src={CloudSQLIcon} />,
  custom: () => <IconWrapper src={CustomIcon} />,
  databricks: () => <IconWrapper src={DatabricksIcon} />,
  db2: () => <IconWrapper src={DB2Icon} />,
  denodo: () => <IconWrapper src={DenodoIcon} />,
  dremio: () => <IconWrapper src={DremioIcon} />,
  duckdb: () => <IconWrapper src={DuckDBIcon} />,
  glue: () => <IconWrapper src={GlueIcon} />,
  hive: () => <IconWrapper src={HiveIcon} />,
  informix: () => <IconWrapper src={InformixIcon} />,
  kafka: () => <IconWrapper src={KafkaIcon} />,
  kinesis: () => <IconWrapper src={KinesisIcon} />,
  local: () => <IconWrapper src={LocalIcon} />,
  mysql: () => <IconWrapper src={MySQLIcon} />,
  oracle: () => <IconWrapper src={OracleIcon} />,
  postgresql: () => <IconWrapper src={PostgreSQLIcon} />,
  postgres: () => <IconWrapper src={PostgresIcon} />,
  presto: () => <IconWrapper src={PrestoIcon} />,
  pubsub: () => <IconWrapper src={PubSubIcon} />,
  redshift: () => <IconWrapper src={RedshiftIcon} />,
  s3: () => <IconWrapper src={S3Icon} />,
  sftp: () => <IconWrapper src={SFTPIcon} />,
  snowflake: () => <IconWrapper src={SnowflakeIcon} />,
  sqlserver: () => <IconWrapper src={SQLServerIcon} />,
  synapse: () => <IconWrapper src={SynapseIcon} />,
  trino: () => <IconWrapper src={TrinoIcon} />,
  vertica: () => <IconWrapper src={VerticaIcon} />,

  // Fallback for unknown server types
  database: () => <IconWrapper src={DatabaseIcon} />,
};

// Export function that returns icon component with fallback to database.svg
export default new Proxy(serverIcons, {
  get(target, prop) {
    // If the requested icon exists, return it
    if (prop in target) {
      return target[prop];
    }
    // Otherwise, return the database fallback icon
    return target.database;
  }
});
