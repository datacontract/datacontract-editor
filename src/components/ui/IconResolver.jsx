import {
	ApiIcon, BigqueryIcon, CatalogIcon, ChangelogIcon,
	CollibraIcon,
	ConfluentIcon,
	ConfluentSchemaRegistryIcon,
	DatabricksIcon, DatawarehouseIcon, DeletedIcon, DocumentationIcon, FileCodeIcon, GithubIcon, GitlabIcon, KafkaIcon,
	LeanixIcon, MssqlIcon, OnetrustIcon, OpenmetadataIcon, PostgresIcon, PowerbiIcon, PurviewIcon, S3Icon,
	SampleIcon, SapIcon,
	SnowflakeIcon,
	StarburstIcon, TeamsIcon
} from "../../assets/link-icons/index.js";

/**
 * IconResolver component that displays an icon based on the URL domain or type
 * Maps common services to their respective icons
 * @param {string} url - The URL to determine the icon for
 * @param {string} type - The explicit type (e.g., "API", "Snowflake", "documentation")
 * @param {string} className - Additional CSS classes to apply
 */
export function IconResolver({ url, type, className = "h-4 w-4" }) {
  const containsAny = (str, keywords) => {
    return keywords.some(keyword => str.includes(keyword));
  };

  const getIconType = (url, type) => {
    // If type is explicitly provided, use it for mapping
    if (type) {
      const lowerType = type.toLowerCase();

      // Map based on type (following the Kotlin logic)
      if (lowerType.startsWith('api')) return 'api';
      if (lowerType.startsWith('sap')) return 'sap';
      if (lowerType.includes('snowflake')) return 'snowflake';
      if (lowerType.includes('databricks')) return 'databricks';
      if (lowerType.includes('bigquery')) return 'bigquery';
      if (lowerType.includes('starburst')) return 'starburst';
      if (lowerType.includes('trino')) return 'trino';
      if (lowerType.includes('confluent')) return 'confluent';
      if (lowerType.includes('openmetadata')) return 'openmetadata';
      if (lowerType.includes('schemaregistry')) return 'confluent-schema-registry';
      if (containsAny(lowerType, ['kafka', 'mep'])) return 'kafka';
      if (lowerType.includes('mssql')) return 'mssql';
      if (lowerType.includes('postgres')) return 'postgres';
      if (lowerType.includes('s3')) return 's3';
      if (containsAny(lowerType, ['data warehouse', 'datawarehouse', 'data-warehouse', 'dwh'])) return 'datawarehouse';
      if (containsAny(lowerType, ['catalog', 'data catalog'])) return 'catalog';
      if (containsAny(lowerType, ['repository', 'git', 'git repository', 'gitlab'])) return 'repository';
      if (lowerType.includes('documentation')) return 'documentation';
      if (lowerType.includes('powerbi')) return 'powerbi';
      if (lowerType.includes('purview')) return 'purview';
      if (lowerType.includes('sample')) return 'sample';
      if (lowerType.includes('slack')) return 'slack';
      if (lowerType.includes('jira')) return 'jira';
      if (containsAny(lowerType, ['teams', 'msteams', 'teamschannel'])) return 'teams';
      if (containsAny(lowerType, ['changelog', 'changelogurl'])) return 'changelog';
      if (containsAny(lowerType, ['dataproductleanix', 'leanixdataproduct', 'leanix'])) return 'leanix';
      if (lowerType.includes('dataproductspecification')) return 'file-code';
      if (lowerType.includes('collibra')) return 'collibra';
      if (lowerType.includes('onetrust')) return 'onetrust';
      if (lowerType.includes('deleted')) return 'deleted';
    }

    // Fall back to URL-based detection
    if (!url) return null;

    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();

      // Map common services to their icons based on hostname
      if (hostname.includes('jira') || hostname.includes('atlassian')) return 'jira';
      if (hostname.includes('linear')) return 'linear';
      if (hostname.includes('github')) return 'github';
      if (hostname.includes('gitlab')) return 'gitlab';
      if (hostname.includes('notion')) return 'notion';
      if (hostname.includes('confluence')) return 'confluence';
      if (hostname.includes('slack')) return 'slack';
      if (hostname.includes('trello')) return 'trello';
      if (hostname.includes('asana')) return 'asana';
      if (hostname.includes('monday')) return 'monday';
      if (hostname.includes('clickup')) return 'clickup';
      if (hostname.includes('airtable')) return 'airtable';
      if (hostname.includes('snowflake')) return 'snowflake';
      if (hostname.includes('databricks')) return 'databricks';

      return null; // Default fallback
    } catch (error) {
      return null;
    }
  };

  const iconType = getIconType(url, type);

  const NotionIcon = () => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/>
    </svg>
  );

  const JiraIcon = () => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.005-1.005zm5.723-5.756H5.736a5.215 5.215 0 0 0 5.215 5.214h2.129v2.058a5.218 5.218 0 0 0 5.215 5.214V6.758a1.001 1.001 0 0 0-1.001-1.001zM23.013 0H11.455a5.215 5.215 0 0 0 5.215 5.215h2.129v2.057A5.215 5.215 0 0 0 24 12.483V1.005A1.001 1.001 0 0 0 23.013 0Z"/>
    </svg>
  );

  const LinearIcon = () => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.995 12.166a.427.427 0 0 0-.427-.412l-6.654-.414a.427.427 0 0 1-.317-.181.427.427 0 0 1-.063-.36l1.667-6.485a.427.427 0 0 0-.548-.524L2.005 7.989a.427.427 0 0 0-.287.592l7.333 13.334a.427.427 0 0 0 .659.089l12-10.334a.427.427 0 0 0 .121-.171.427.427 0 0 0 .164-.333z"/>
    </svg>
  );

  const ConfluenceIcon = () => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M.87 17.583c-.213.371-.315.566-.413.795a6.76 6.76 0 0 0-.42 1.342.515.515 0 0 0 .33.595l4.656 1.792a.515.515 0 0 0 .657-.268c.075-.154.15-.309.232-.477.284-.582 1.56-2.956 4.128-2.956 1.371 0 3.293.738 5.553 1.63l.002.001c2.38.938 5.096 2.008 8.005 2.008 4.805 0 7.704-3.497 8.835-5.76.214-.372.315-.566.414-.795.216-.502.369-.954.419-1.342a.515.515 0 0 0-.33-.595l-4.655-1.793a.515.515 0 0 0-.658.269c-.074.154-.148.308-.231.477-.284.582-1.56 2.956-4.128 2.956-1.371 0-3.293-.738-5.553-1.63h-.002c-2.38-.938-5.096-2.008-8.005-2.008-4.805 0-7.704 3.497-8.836 5.76zm22.26-11.166c.214-.372.315-.566.414-.795.216-.502.369-.954.419-1.342a.515.515 0 0 0-.33-.595L18.976 2.093a.515.515 0 0 0-.658.268c-.074.154-.148.309-.231.477-.284.582-1.56 2.956-4.128 2.956-1.371 0-3.293-.738-5.553-1.63l-.002-.001C5.967 3.225 3.25 2.155.341 2.155c-4.805 0-7.704 3.497-8.836 5.76-.213.371-.314.566-.413.795a6.76 6.76 0 0 0-.42 1.342.515.515 0 0 0 .33.595l4.656 1.792c.265.102.557-.03.657-.268.075-.154.15-.309.232-.477.284-.582 1.56-2.956 4.128-2.956 1.371 0 3.293.738 5.553 1.63l.002.001c2.38.938 5.096 2.008 8.005 2.008 4.805 0 7.704-3.497 8.835-5.76z"/>
    </svg>
  );

  const SlackIcon = () => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
    </svg>
  );

  const TrelloIcon = () => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 0H3C1.343 0 0 1.343 0 3v18c0 1.656 1.343 3 3 3h18c1.656 0 3-1.344 3-3V3c0-1.657-1.344-3-3-3zM10.44 18.18c0 .795-.645 1.44-1.44 1.44H4.56c-.795 0-1.44-.646-1.44-1.44V4.56c0-.795.645-1.44 1.44-1.44H9c.795 0 1.44.645 1.44 1.44v13.62zm10.44-6c0 .794-.645 1.44-1.44 1.44H15c-.795 0-1.44-.646-1.44-1.44V4.56c0-.795.646-1.44 1.44-1.44h4.44c.795 0 1.44.645 1.44 1.44v7.62z"/>
    </svg>
  );

  const AsanaIcon = () => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.78 12.653c-2.882 0-5.22 2.336-5.22 5.22s2.338 5.22 5.22 5.22 5.22-2.338 5.22-5.22-2.338-5.22-5.22-5.22zm-13.56 0c-2.882 0-5.22 2.336-5.22 5.22s2.338 5.22 5.22 5.22 5.22-2.338 5.22-5.22-2.338-5.22-5.22-5.22zM12 .907c-2.882 0-5.22 2.338-5.22 5.22s2.338 5.22 5.22 5.22 5.22-2.338 5.22-5.22S14.882.907 12 .907z"/>
    </svg>
  );

  const MondayIcon = () => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.4 17.333a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8zm9.6 0a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8zm0-8a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8zm-9.6 0a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8zm0-7.466a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8zm9.6 0a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8zm9.6 7.466a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8zm0 8a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8zm0-15.466a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8z"/>
    </svg>
  );

  const ClickUpIcon = () => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M2 18.439l3.69-2.828c1.961 2.56 4.044 3.739 6.363 3.739 2.307 0 4.33-1.166 6.203-3.704L22 18.405C19.298 22.065 15.941 24 12.053 24 8.178 24 4.788 22.078 2 18.439zM12.04 6.15l-6.568 5.66-3.036-3.52L12.055 0l9.543 8.296-3.05 3.509z"/>
    </svg>
  );

  const AirtableIcon = () => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.875 0L.594 4.686l4.619 1.713 11.25-4.687zM13.125 24l11.281-4.687-4.594-1.688-11.25 4.688zM23.406 5.375l-11.281 4.656v14.594l11.281-4.656zm-12.531 0L0 10.031v11.594l10.875-4.531zm6.938-3.188L6.562 6.875l4.688 1.813 11.25-4.688z"/>
    </svg>
  );

  // Default link icon SVG
  const LinkIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
    </svg>
  );

  // Render the appropriate icon based on the type or URL
  switch (iconType) {
    // Project management & collaboration
    case 'github':
      return <GithubIcon />;
    case 'gitlab':
    case 'repository':
      return <GitlabIcon />;
    case 'notion':
      return <NotionIcon />;
    case 'jira':
      return <JiraIcon />;
    case 'linear':
      return <LinearIcon />;
    case 'confluence':
      return <ConfluenceIcon />;
    case 'slack':
      return <SlackIcon />;
    case 'trello':
      return <TrelloIcon />;
    case 'asana':
      return <AsanaIcon />;
    case 'monday':
      return <MondayIcon />;
    case 'clickup':
      return <ClickUpIcon />;
    case 'airtable':
      return <AirtableIcon />;

    // Data platforms
    case 'snowflake':
      return <SnowflakeIcon className={className} />;
    case 'databricks':
      return <DatabricksIcon className={className} />;
    case 'bigquery':
      return <BigqueryIcon className={className} />;
    case 'starburst':
      return <StarburstIcon className={className} />;
    case 'trino':
      return <StarburstIcon className={className} />;

    // Messaging & streaming
    case 'confluent':
      return <ConfluentIcon className={className} />;
    case 'confluent-schema-registry':
      return <ConfluentSchemaRegistryIcon className={className} />;
    case 'kafka':
      return <KafkaIcon className={className} />;

    // Databases
    case 'mssql':
      return <MssqlIcon className={className} />;
    case 'postgres':
      return <PostgresIcon className={className} />;

    // Storage
    case 's3':
      return <S3Icon className={className} />;

    // Metadata & Governance
    case 'openmetadata':
      return <OpenmetadataIcon className={className} />;
    case 'collibra':
      return <CollibraIcon className={className} />;
    case 'purview':
      return <PurviewIcon className={className} />;
    case 'onetrust':
      return <OnetrustIcon className={className} />;
    case 'leanix':
      return <LeanixIcon className={className} />;

    // BI & Analytics
    case 'powerbi':
      return <PowerbiIcon className={className} />;

    // Microsoft
    case 'teams':
      return <TeamsIcon className={className} />;

    // Generic types
    case 'api':
      return <ApiIcon className={className} />;
    case 'sap':
      return <SapIcon className={className} />;
    case 'datawarehouse':
      return <DatawarehouseIcon className={className} />;
    case 'catalog':
      return <CatalogIcon className={className} />;
    case 'documentation':
      return <DocumentationIcon className={className} />;
    case 'sample':
      return <SampleIcon className={className} />;
    case 'changelog':
      return <ChangelogIcon className={className} />;
    case 'file-code':
      return <FileCodeIcon className={className} />;
    case 'deleted':
      return <DeletedIcon className={className} />;

    default:
      return <LinkIcon />;
  }
}
