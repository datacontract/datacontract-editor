import {Fragment, useMemo} from 'react';
import * as YAML from 'yaml';
import serverIcons from '../../assets/server-icons/serverIcons.jsx';
import supportIcons from '../../assets/support-icons/supportIcons.jsx';
import LinkIcon from '../ui/icons/LinkIcon.jsx';
import { getQualityCheckIcon } from '../ui/icons/QualityCheckIcons.jsx';
import Tooltip from '../ui/Tooltip.jsx';
import DescriptionPreview from '../ui/DescriptionPreview.jsx';
import { IconResolver } from '../ui/IconResolver.jsx';

const DataContractPreview = ({ yamlContent }) => {
  const parsedData = useMemo(() => {
    if (!yamlContent?.trim()) {
      return null;
    }

    try {
      return YAML.parse(yamlContent);
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

  const docs = parsedData.docs || parsedData.dataContract || parsedData;

  // Handle different YAML structures
  const info = docs.info || {
    title: docs.name || docs.businessName,
    version: docs.version,
    description: docs.description?.purpose || docs.description,
    tags: docs.tags || [],
    contact: docs.support?.[0] ? {
      name: Array.isArray(docs.team) && docs.team[0]?.username,
      email: docs.support[0].url
    } : undefined
  };

  const terms = docs.terms || {
    usage: docs.description?.usage,
    limitations: docs.description?.limitations,
    billing: docs.price ? `${docs.price.priceAmount} ${docs.price.priceCurrency} ${docs.price.priceUnit}` : undefined
  };

  // Convert schema array to models object
  const models = docs.models || {};

  // Recursive function to convert property structure
  const convertProperty = (prop) => {
    if (!prop) return null;

    const converted = {
      businessName: prop.businessName,
      description: prop.description,
      logicalType: prop.logicalType,
      physicalType: prop.physicalType,
      type: prop.type || prop.logicalType || prop.physicalType,
      required: prop.required,
      unique: prop.unique,
      primaryKey: prop.primaryKey,
      primaryKeyPosition: prop.primaryKeyPosition,
      partitioned: prop.partitioned,
      partitionKeyPosition: prop.partitionKeyPosition,
      classification: prop.classification,
      transformLogic: prop.transformLogic,
      transformDescription: prop.transformDescription,
      examples: prop.examples,
      customProperties: prop.customProperties,
      tags: prop.tags,
      quality: prop.quality
    };

    // Handle nested properties recursively
    if (prop.properties) {
      if (Array.isArray(prop.properties)) {
        converted.properties = {};
        prop.properties.filter(p => p != null).forEach(p => {
          converted.properties[p.name] = convertProperty(p);
        });
      } else if (typeof prop.properties === 'object') {
        converted.properties = {};
        Object.entries(prop.properties).forEach(([name, p]) => {
          converted.properties[name] = convertProperty(p);
        });
      }
    }

    return converted;
  };

  if (docs.schema && Array.isArray(docs.schema)) {
    // Filter out null/undefined schemas
    docs.schema.filter(schemaItem => schemaItem != null).forEach(schemaItem => {
      models[schemaItem.name] = {
        title: schemaItem.businessName,
        description: schemaItem.description,
        type: schemaItem.physicalType,
        physicalName: schemaItem.physicalName,
        customProperties: schemaItem.customProperties,
        quality: schemaItem.quality,
        fields: {}
      };

      if (schemaItem.properties && Array.isArray(schemaItem.properties)) {
        // Filter out null/undefined properties and convert them
        schemaItem.properties.filter(prop => prop != null).forEach(prop => {
          models[schemaItem.name].fields[prop.name] = convertProperty(prop);
        });
      }
    });
  }

  const examples = docs.examples || [];

  // Extract data for all sections
  const description = docs.description || {};
  const links = docs.links || [];
  const support = docs.support || [];
  const price = docs.price || null;
  // Team is now an object with name, description, members, tags, customProperties, authoritativeDefinitions
  const team = docs.team || {};
  const teamMembers = team.members || [];
  const roles = docs.roles || [];
  const slaProperties = docs.slaProperties || [];
  const servers = docs.servers || [];
  const customProperties = docs.customProperties || [];
  const authoritativeDefinitions = docs.authoritativeDefinitions || [];
  const domain = docs.domain;
  const contractCreatedTs = docs.contractCreatedTs;

  // Get server icon component based on server type
  const getServerIcon = (serverType) => {
    if (!serverType) return null;
    const type = serverType.toLowerCase();
    return serverIcons[type];
  };

  // Get icon for links - returns appropriate icon based on icon name
  const getLinkIcon = (iconName) => {
    // For now, return LinkIcon for all links
    // TODO: Implement icon mapping when icon components are available
    return LinkIcon;
  };

  // Get support icon component based on tool type
  const getSupportIcon = (toolType) => {
    if (!toolType) return null;
    const type = toolType.toLowerCase();
    return supportIcons[type];
  };

  return (
    <div className="space-y-6 mt-6" id="docs-content">
      {/* Header Section */}
      <div className="min-w-0">
        <div className="flex gap-2">
          <i className="flex-none size-8 rounded-full p-1.5 flex items-center text-xs bg-white text-gray-500 object-cover ring-1 ring-gray-900/10">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 161.0024281 162.3345538">
              <path fill="#2e1354" d="M71.8891697,18.3330481c4.4469416-.1850186,9.2651419-.556369,13.5273091,.1850186,2.779168,.3700474,10.191762,5.0033208,11.4892947,5.1884412-.5563792,.9263859-.9263758,1.8527922-1.6677736,2.7791782-2.2241528,3.3355472-2.9655099,7.0410095-3.3355472,10.9329257-.3700373,4.0770366,1.482755,14.6400472,2.0378109,16.1213669 ,.9263758,2.2241528,1.482755,5.0033208,2.779168,7.0410095,1.8527922,2.9655099,4.0770468,6.1147151,7.5973683,7.412594,3.8919264,1.6677736,8.1537475,2.779168,12.2307943,3.8919264,1.482755,.3700373,2.9655099,.9263758,4.6334057,.9263758,3.3355472-.1850186,6.4859739-.7413978,9.6367264-1.2977363,2.0378109-.3700373,5.9295947-5.5597,6.1147355-7.7824887,.3700373,.5563792,5.7448204,16.3078208,5.1884412,19.0870091-.7413978,5.9295947-7.412594,14.0836883-8.8952471,16.3078208-1.8527922-3.5206676-5.3732359-3.7054623-8.8952268-3.7054623-4.4469416,0-9.0803676-.5563792-13.5273091,.1850186-5.7448204,.7413978-11.1180359,2.779168-14.0836883,8.5239884-1.482755,2.5941493-3.3355472,5.0033208-5.0033208,7.5973683-.3700373,.5563792-3.5206676,8.5239884-3.1505285,9.4502623,2.0378109,5.9295947,4.8182003,11.4892947,8.5239884,16.4926155,1.1113944,1.2977363,.7413978,1.1113944,1.2977363,2.4091714-.5563792,.7413978-9.2651419,7.412594-13.1570683,7.7825091-4.6334057,.5563792-7.5973683,.5563792-12.2307943-.5563792-4.6334057-1.1113944-17.4192355-7.9689528-18.9018683-8.1537475,2.0378109-4.4469416,3.7054623-7.5973683,5.5596796-12.6006891,.5563792-1.6677736,.3700373-3.8919264-.1850186-5.5596796-1.482755-4.2618211-3.7054623-8.3388679-6.6710944-11.4892947-4.6334057-4.8182003-10.191762-8.3388679-17.2341049-8.7087831-.556369,0-2.5941595-.1850186-3.1505285-.3700373-2.9654997-.7413978-4.8182003,1.482755-7.0410095,2.5941493-1.8527922,.9263758-3.5206676,2.2241528-5.5596898,3.5206676-.1850186-1.1113944-4.0770366-8.8952471-4.6334057-12.2307943-.1850186-1.482755-.556369-2.779168-.7413877-4.2618211-.1850186-2.2241528-.1850186-4.6334057-.556369-6.8562148-.556369-5.3732359,2.037821-9.8215211,4.2618313-14.4535831,.556369-1.1113944,.7413877-2.2241528,1.2977261-3.7054623,.7413877,.5563792,1.2977261,1.482755,2.2241426,1.8527922,3.5206676,1.482755,7.0410095,3.3355472,10.748131,3.7054623,4.0770366,.3700373,8.5239884,.1850186,12.6006993-1.6677736,.1850186,0,.3700474-.3700373,.556369-.3700373,6.4859739,.5563792,8.8952471-4.8182003,12.4159147-8.5239884,2.0378109-2.0378109,4.0770468-4.4469416,5.5597-7.0410095,2.9655099-5.3732359,5.9295947-10.748131,3.1505285-17.2341049-1.1113944-2.7791782-2.2241528-5.3732359-3.8919264-7.9689528-1.1113944-1.6677736-2.5941493-2.9654997-4.0770468-4.4469517-.5550763-.5537631,10.1931056-4.8158591,13.1583916-5.0019873l.0000611-.0006922Zm-12.9722736,65.6002108c-1.2977363-.3700373-2.9655099-.7413978-4.8182003-1.1113944-1.6677736-.3700373-3.3355472-.3700373-5.0033208-.5563792-1.6677736-.1850186-14.4535933-.1850186-14.6400472-.9263758-.556369,1.1113944-.9263859,2.0378109-1.482755,3.1505285,2.4091612,.3700373,4.8182003,.3700373,7.2274634,.9263758,3.7054623,.5563792,7.2274634,1.6677736,10.9329257,2.0378109,6.1147355,.5563792,11.8595355,2.5941493,17.047651,5.9295947,2.4091714,1.482755,4.4469416,3.8919264,5.7448204,6.3011792,2.5941493,5.0033208,2.779168,10.9329155,3.5206676,16.4926155,.3700373,2.779168,0,5.5597,0,8.3388679,1.8527922,.3700373,2.9655099-.3700373,2.9655099-2.0378109,.1850186-4.0770468,.1850186-8.3388679,0-12.4159147,0-1.8527922-.5563792-3.7054623-.9263758-5.3732359,1.2977363-1.482755,2.4091714-2.9655099,3.5206676-4.4469416,2.9655099-4.2618211,6.6710944-7.5973683,11.4892947-9.6367264,3.3355472-1.482755,6.8562148-2.5941493,10.3765566-3.1505285,3.5206676-.5563792,7.0410095-.1850186,10.5630004-.5563792,.9263758-.1850186,2.2241528-.9263758,2.5941493-1.8527922,.7413978-1.482755-.5563792-2.5941493-2.0378109-2.779168-2.4091714-.5563792-4.8182003-.5563792-7.2274736-1.2977363-3.7054623-1.1113944-7.7825091,.9263758-11.1180563-1.8527922-2.779168-2.2241528-5.9295947-4.0770468-7.9689528-6.8562148-6.4859739-8.1537475-7.9689528-17.7891303-7.9689528-27.795782,0-2.037821-.3700373-4.0770366-.7413978-6.3011792-2.4091714,.9263859-2.779168,2.9654997-2.9655099,4.4469517-.7413978,4.8182003-.9263758,9.8215211-1.482755,14.6400472-.3700373,3.1505285-1.1113944,6.1147151-1.1113944,9.2651419,0,3.5206676-2.5941493,5.1884412-4.2618211,7.5973683-1.6676718,2.4089271-4.4469416,4.2618211-6.8562148,6.3011792-1.2951304,.9250728-3.1479226,2.0365283-5.3718922,3.5193443l.0002239,.0003461Z"/>
              <path fill="#b6408d" d="M147.1257913,39.4604129c-.9263758,2.9654997-1.8527922,6.1147253-2.9655099,9.0803574-1.482755,3.7054623-2.779168,7.412594-5.9295947,10.0066415-2.779168,2.0378109-5.1884412,4.6334057-7.9689528,6.3011792-1.8527922,1.1113944-4.4469416,1.1113944-6.6710944,1.482755-4.6334057,.7413978-8.5239884-2.0378109-12.7858299-3.1505285-6.1147355-1.482755-9.2651419-6.4859739-12.7858299-11.1180461-2.2241528-2.9654997-1.6677736-5.1884412-.9263758-7.9689528,.9263758-3.7054623,1.8527922-7.5973785,2.5941493-11.4892947,.7413978-3.5206676,2.779168-5.9296049,5.1884412-8.3388679,2.0378109-1.8527922,4.0770468-3.7054623,6.4859739-5.0033208,1.482755-.9263859,3.7054623-.556369,5.5596796-1.1114046,6.8562148-2.4091612,12.0443302,1.8527922,17.7891506,4.2618313,2.5941493,1.1114046,5.0033208,2.9654997,7.412594,4.4469517,.3700373,.1850186,.9263758,.3700474,1.1113944,.7413877,.7413978,3.8905827,2.2241528,7.5973785,3.8919264,11.8595355l-.0001222-.0002239Zm-26.6843774,12.2294507c2.4091714-.556369,5.5596796-.556369,7.412594-3.7054623,.5563792-.9263859,1.1113944-2.037821,1.2977363-3.1505285,.5563792-3.5206676,1.482755-7.2274634-1.8527922-9.8215211-1.6677736-1.2977261-4.0770468-2.7791782-5.5596796-2.4091612-3.3355472,.9263859-6.3011792,3.1505285-9.2651419,5.0033208-.7413978,.3700474-.9263758,1.8527922-1.1113944,2.7791782,0,.9263859,.5563792,1.8527922,.7413978,2.7791782,.5550763,5.7461437,3.5193443,8.155081,8.3375243,8.5253219l-.0002443-.0003257Z"/>
              <path fill="#b6408d" d="M51.6924458,21.2983544c2.5941595,3.3355472,6.1147253,5.9296049,7.7824989,10.0066415,1.2977363,3.3355472,2.4091714,6.6710944,3.1505285,10.0066415,.7413978,2.7791782-1.482755,5.1884412-2.4091714,7.5973785-1.6677736,4.0770468-4.8182003,7.0410095-7.9689528,10.0066415-.3700373,.3700373-9.6367264,5.5597-10.5630106,5.9295947-5.0033208,1.8527922-10.0066415,1.482755-14.4535933-1.2977363-2.9654997-1.6677736-6.1147253-3.7054623-7.9689528-6.4859739-2.2241426-3.1505285-4.6334057-6.4859739-4.8182003-10.748131,0-1.482755,.556369-3.1505285,.9263859-4.6334057,.556369-2.7791782,.7413877-5.5596898,1.2977261-8.1537475,.7413877-2.7791782,1.1114046-6.1147253,2.7791782-8.3388679,2.5941595-3.8919162,4.8182003-8.5239884,10.0066415-9.6367264,3.1505285-.7413877,6.4859739-.9263859,9.8215211-.7413877,1.6677736,0,3.3355472,1.1114046,5.0033208,1.6677736,1.1127075,.3739461,6.3011792,3.3382141,7.4139173,4.8208673l.0001629,.0004377Zm-15.7514517,32.0576031c4.4469517,.1850186,7.4125838-1.8527922,9.0803574-5.9296049,.7413877-1.6677736,1.482755-3.5206676,2.5941595-5.1884412,.9263859-1.6677736,1.1114046-5.9296049-.1850186-7.2274634-.1850186-.3700474-.7413877-.556369-1.1114046-.7413877-2.5941595-.9263859-5.3732359-1.2977261-8.1537475-.556369-4.6334057,1.2977261-7.9689528,3.8919162-9.4502725,8.5239884-.556369,1.6677736-.9263859,3.7054623-.556369,5.5596898,.9263859,2.9654997,5.0019873,5.5596898,7.7824989,5.5596898l-.0002036-.0001018Z"/>
              <path fill="#b6408d" d="M142.3059216,124.5168557c-.1850186,2.2241528-.3700373,5.5597-1.1113944,8.7087831-.3700373,1.482755-1.6677736,2.779168-2.5941493,4.0770468-.7413978,1.1113944-1.6677736,2.4091714-2.5941493,3.3355472-2.4091714,2.779168-11.3045,6.1147151-12.4159147,6.4859739-1.482755,.3700373-2.9655099,.7413978-4.4469416,.7413978-1.2977363,0-8.5239884-2.4091714-9.8215211-3.5206676-2.5941493-2.4091714-5.1884412-4.6334057-7.412594-7.2274532-1.482755-1.6677736-2.779168-3.8919264-3.8919264-5.9295947-1.2977363-2.4091714-2.9655099-4.6334057-3.7054623-7.2274532-.5563792-1.482755,.1850186-3.5206676,.3700373-5.1884412,.1850186-1.1113944,.9263758-2.0378109,1.1113944-3.1505285,.1850186-3.3355472,1.6677736-5.5597,4.2618211-7.5973683,1.482755-1.2977363,2.779168-2.779168,4.6334057-3.5206676,3.7054623-1.2977363,7.412594-3.1505285,11.6744151-2.2241528,2.0378109,.3700373,4.2618211,0,6.3011792,.1850186,7.2274532,.5563792,12.6006891,4.4469416,16.3078208,10.5630207,2.779168,4.6320823,3.3342442,6.8562148,3.3342442,11.4892947l-.0002647,.0002443Zm-18.900545-3.3355472c.1850186-2.9655099-2.5941493-6.1147151-5.3732359-6.8562148-2.5941493-.7413978-3.3355472,1.482755-5.0033208,2.4091714-1.1113944,.7413978-2.5941493,1.6677736-3.3355472,2.779168-2.4091714,3.7054623-1.1113944,8.7087831,2.779168,10.9329155,.9263758,.5563792,5.7448204,1.1113944,6.8562148,1.6677736,.3700373,.1850186,1.2977363-.5563792,1.482755-1.1113944,.3700373-1.1113944,4.2618211-4.6334057,3.7054623-6.1147151-.3700373-1.2977363-.7413978-2.5954523-1.1113944-3.7067856l-.0001018,.0000814Z"/>
              <path fill="#b6408d" d="M52.4329377,135.2639993c-1.2977261,4.8182003-5.5596898,5.7448204-9.0803574,7.412594-5.5596898,2.5941493-11.3045,1.482755-17.047651,.5563792-2.2241426-.3700373-4.6334057-.9263758-6.3011792-2.0378109-1.2977261-.9263758-2.037821-3.1505285-2.5941595-4.8182003-.9263859-2.9655099-1.6677736-5.9295947-2.4091612-8.8952268-.1850186-.9263758-.1850186-2.0378109,0-3.1505285,1.482755-7.2274532,5.1884412-12.7858299,11.6744151-16.3078208,1.2977261-.7413978,3.3355472-.9263758,5.0033208-.7413978,3.3355472,.5563792,6.4859739,1.2977363,9.6367264,2.5941493,5.3732359,2.2241528,10.3765566,5.3732359,13.8985577,10.0066415,.7400949,.9263758-1.6690765,12.0456535-2.7804709,15.3812007l-.0000407,.0000204Zm-31.1326626,4.8168567c.1850186,0,.1850186,.1850186,.3700474,.1850186-.1850186,.0013029-.3700474-.1850186-.3700474-.1850186-.1850186,0-.3700474-.1850186-.556369-.3700373-.1850186,0-.1850186-.1850186-.3700474-.1850186,.1850186,0,.1850186,.1850186,.3700474,.1850186,.3713504,0,.3713504,.1850186,.556369,.3700373Zm6.6710944-19.6420446c-2.037821,2.5941493-1.8527922,8.1537475,.3700474,10.7481412,.556369,.7413978,1.2977261,1.6677736,2.037821,1.6677736,2.2241426,.3700373,4.4469517,.5563792,6.6710944,.7413978,.1850186,0,.3700474-.1850186,.556369-.1850186,.7413877-.7413978,1.2977261-1.6677736,2.2241426-2.2241528,2.9654997-2.2241528,3.7054623-5.5596796,4.0770366-8.8952268,.1850186-1.1113944-1.1114046-2.4091714-2.037821-3.5206676-.7413877-.9263758-1.8527922-2.4091714-2.9654997-2.4091714-2.5941595,0-5.3732359-.7413978-7.5973785,1.482755-.3700474,.3700373-2.7791782,1.8527922-3.3355472,2.5941493l-.0002647,.0000204Z"/>
              <path fill="#b6408d" d="M94.3140672,81.3392113c-5.7448204,4.2618211-11.1180359,7.9689528-14.6400472,13.7121038-1.8527922,0-2.5941493-1.2977363-3.5206676-3.1505285-2.2241528-5.0033208-6.3011792-7.7825091-11.3045-9.4502827-.1850186,0-.3700373-.1850186-.7413978-.5563792,7.412594-2.4091714,11.6744151-8.1537475,16.4926155-14.0836883,3.7067856,5.1897849,7.7838324,10.1931056,13.7134271,13.5286528l.00057,.0001222Z"/>
              <path fill="#2e1354" d="M121.7389263,36.6785576c2.2241528,1.1114046,4.2618211,4.6334057,2.9655099,6.8562148-.9263758,1.6677736-2.779168,3.1505285-4.6334057,3.8919162-1.482755,.556369-3.1505285-.9263859-3.8919264-2.5941595-.3700373-.7413877-.7413978-1.2977261-.9263758-1.8527922-.7413978-2.4091612-.1850186-5.7434665,3.1505285-7.2261197,1.1113944-.556369,2.0378109,1.6665623,3.3355472,.9251644l.0001222-.0002239Z"/>
              <path fill="#2e1354" d="M34.0874282,45.9457251c-.3700474-1.8527922-1.8527922-3.7054623-1.6677736-5.3732359,0-1.1114046,.9263859-2.5941595,1.482755-3.7054623,.556369-1.482755,4.2618313-2.9654997,4.6334057-2.9654997,3.7054623-.556369,6.1147253,1.2977261,5.7448102,5.1884412-.1850186,2.5941595-.1850186,5.3732359-2.5941595,7.2274634-.7426906,.5550661-6.858556,2.9641968-7.598712-.3713504l-.0003257-.0003563Z"/>
              <path fill="#2e1354" d="M117.1058667,117.8457613c1.6677736,2.0378109,3.5206676,.927638,3.5206676,3.8919264,0,1.6677736-.9263758,5.9297983-2.0378109,6.2998356-1.2977363,.1850186-3.1505285-.1850186-4.2618211-1.1113944-2.4091714-1.8527922-1.482755-5.0033208,.7413978-7.2274736,.5550763-.7413978,1.2964334-1.2977363,2.0378109-1.8527922l-.0002443-.0001018Z"/>
              <path fill="#2e1354" d="M27.9700257,126.1846293c.556369-1.2977363,.7413877-5.9297983,1.482755-7.0413352,.556369-1.1113944,4.8182003,1.4815334,6.1147253,2.0379126,1.1114046,.5563792,2.2241426,.7413978,3.3355472,1.482755,2.4091612,1.6677736-.9263859,5.9295947-1.1114046,5.9295947-.9263859,.3700373-2.037821,1.1113944-2.7791782,.7413978-2.2241426-.7413978-4.2618313-1.8540952-7.042343-3.1505285l-.0001018,.0002036Z"/>
            </svg>
          </i>

          <div className="min-w-0">
            <h1 className="text-lg font-bold leading-5 text-gray-900 text-ellipsis tracking-tight">
              {info.title || 'Untitled Contract'}
            </h1>

            <div className="mt-0.5 text-gray-500 text-xs">
              <span>{parsedData.id || 'no-id'}</span>
              {info.version && (
                <span className="inline-flex items-center rounded-full bg-indigo-50 px-1.5 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10 ml-1">
                  {info.version}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-1.5 flex flex-row flex-wrap gap-x-3 gap-y-1 min-w-0 text-xs text-gray-500">
          <div className="flex-none flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="mr-1 h-3 w-3 shrink-0 text-gray-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            <span>{parsedData.tenant || 'No Team'}</span>
          </div>

          <div className="flex-none flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="mr-1 h-3 w-3 shrink-0 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
            </svg>
            <span>{parsedData.status || 'draft'}</span>
          </div>

          <a href={`https://bitol-io.github.io/open-data-contract-standard/${parsedData.apiVersion || 'latest'}/`} className="flex-none flex items-center" target="_blank" rel="noopener noreferrer">
            <span className="inline-flex items-center rounded-md bg-indigo-50 px-1.5 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
              ODCS {parsedData.apiVersion || 'latest'}
            </span>
          </a>
        </div>
      </div>

      {/* Main Column */}
      <div className="space-y-6" id="datacontract-content">

          {/* 1. Fundamentals Section */}
          <section>
            <div className="px-4 sm:px-0">
              <h1 className="text-base font-semibold leading-6 text-gray-900" id="fundamentals">Fundamentals</h1>
              <p className="text-sm text-gray-500">Information about the data contract</p>
            </div>
            <div className="mt-2 overflow-hidden shadow sm:rounded-lg bg-white">
              <div className="px-4 py-4 sm:px-6">

                {/* Authoritative Definitions Section */}
                {authoritativeDefinitions && authoritativeDefinitions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {authoritativeDefinitions.map((def, index) => (
                      <a
                        key={index}
                        href={def.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col text-center rounded-md bg-white px-3 py-3 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:ring-indigo-300 transition-colors"
                        style={{ minWidth: '120px' }}
                        title={def.description}
                      >
                        <div className="mx-auto w-8 h-8 mb-2 text-gray-500">
                          <IconResolver url={def.url} type={def.type} className="w-full h-full" />
                        </div>
                        <div className="text-xs font-medium">{def.type}</div>
                      </a>
                    ))}
                  </div>
                )}

                {/* Links Section */}
                {links && links.length > 0 && (
                  <div className="flex flex-wrap gap-3 print:hidden mb-6">
                    {links.map((link, index) => {
                      if (!link.href) return null;
                      const IconComponent = getLinkIcon(link.icon);
                      return (
                        <a
                          key={index}
                          href={link.href}
                          className="flex flex-col text-center rounded-md bg-white px-2 py-2 text-sm font-medium text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ minWidth: '100px' }}
                        >
                          <div className="mx-auto w-8 h-8 my-2">
                            <IconComponent className="w-full h-full" />
                          </div>
                          {link.displayName && <div>{link.displayName}</div>}
                          {link.displayName2 && <div>{link.displayName2}</div>}
                        </a>
                      );
                    })}
                  </div>
                )}

                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  {parsedData.name && (
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">{parsedData.name}</dd>
                    </div>
                  )}

                  {parsedData.version && (
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Version</dt>
                      <dd className="mt-1 text-sm text-gray-900">{parsedData.version}</dd>
                    </div>
                  )}

                  {parsedData.id && (
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">ID</dt>
                      <dd className="mt-1 text-sm text-gray-900">{parsedData.id}</dd>
                    </div>
                  )}

                  {parsedData.status && (
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="mt-1 text-sm text-gray-900">{parsedData.status}</dd>
                    </div>
                  )}

                  {parsedData.tenant && (
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Tenant</dt>
                      <dd className="mt-1 text-sm text-gray-900">{parsedData.tenant}</dd>
                    </div>
                  )}

                  {domain && (
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Domain</dt>
                      <dd className="mt-1 text-sm text-gray-900">{domain}</dd>
                    </div>
                  )}

                  {parsedData.dataProduct && (
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Data Product</dt>
                      <dd className="mt-1 text-sm text-gray-900">{parsedData.dataProduct}</dd>
                    </div>
                  )}

                  {contractCreatedTs && (
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Contract Created</dt>
                      <dd className="mt-1 text-sm text-gray-900">{new Date(contractCreatedTs).toLocaleString()}</dd>
                    </div>
                  )}

                  {parsedData.tags && Array.isArray(parsedData.tags) && parsedData.tags.length > 0 && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Tags</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <div className="flex gap-y-1 items-center text-xs text-gray-500 flex-wrap">
                          {parsedData.tags.map((tag, index) => (
                            <span key={index} className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mb-1">
                              <svg className="size-1.5 fill-gray-500 mr-1" viewBox="0 0 6 6" aria-hidden="true">
                                <circle cx="3" cy="3" r="3"></circle>
                              </svg>
                              <span>{tag}</span>
                            </span>
                          ))}
                        </div>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </section>

          {/* 2. Description Section */}
          <DescriptionPreview description={description} />

          {/* 3. Data Model Section */}
          {Object.keys(models).length > 0 && (
            <section id="schema">
              <div className="flex justify-between">
                <div className="px-4 sm:px-0">
                  <h1 className="text-base font-semibold leading-6 text-gray-900">Schema</h1>
                  <p className="text-sm text-gray-500">Schema supports both a business representation and physical implementation</p>
                </div>
              </div>

              {Object.entries(models).map(([modelName, model]) => {
                // Recursive component to render properties with nesting
                const renderProperty = (property, propertyName, indent = 0) => {
                  const indentSpaces = '    '.repeat(Math.max(0, indent - 1));
                  const hasChildren = property.properties && Object.keys(property.properties).length > 0;

                  return (
                    <Fragment key={`${modelName}-${propertyName}`}>
                      <tr key={`${modelName}-${propertyName}`} className="print:break-inside-avoid-page">
                        <td className="py-2 pl-4 pr-2 text-sm font-medium text-gray-900 sm:pl-6 w-fit flex">
                          <span>
                            {indent > 0 && indentSpaces}
                            {indent > 0 && <span className="mr-1">↳</span>}
                          </span>
                          <div>
                            {property.businessName && (
                              <>
                                <span>{property.businessName}</span>
                                <br />
                              </>
                            )}
                            <span className="font-mono">{propertyName}</span>
                          </div>
                        </td>
                        <td className="px-1 py-2 text-sm text-gray-500 w-fit">
                          {property.logicalType && (
                            <div className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 ring-1 ring-inset ring-blue-500/10">
                              <span>{property.logicalType}</span>
                            </div>
                          )}
                          {property.physicalType && (
                            <div className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                              <span>{property.physicalType}</span>
                            </div>
                          )}
                          {!property.logicalType && !property.physicalType && property.type && (
                            <div className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                              <span>{property.type}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-500">
                          {property.description ? (
                            <div>{property.description}</div>
                          ) : (
                            <div className="text-gray-400">No description</div>
                          )}

                          {property.examples && property.examples.length > 0 && (
                            <div className="mt-1 italic">
                              {property.examples.length === 1 ? (
                                <>Example: <span>{property.examples[0]}</span></>
                              ) : (
                                <>Examples: <span>{property.examples.join(', ')}</span></>
                              )}
                            </div>
                          )}

                          <div>
                            {property.primaryKey && (
                              <span className="inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1">
                                primaryKey{property.primaryKeyPosition && ` (${property.primaryKeyPosition})`}
                              </span>
                            )}
                            {property.required && (
                              <span className="inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1">required</span>
                            )}
                            {property.unique && (
                              <span className="inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1">unique</span>
                            )}
                            {property.partitioned && (
                              <span className="inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1">
                                partitioned{property.partitionKeyPosition && ` (${property.partitionKeyPosition})`}
                              </span>
                            )}
                            {property.classification && (
                              <span className="inline-flex items-center rounded-md bg-blue-50 px-1 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 mr-1 mt-1">
                                {property.classification}
                              </span>
                            )}
                            {property.transformLogic && (
                              <span className="inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1" title={property.transformLogic}>
                                transform logic
                              </span>
                            )}
                            {property.transformDescription && (
                              <span className="inline-flex items-center rounded-md bg-gray-50 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1" title={property.transformDescription}>
                                transform description
                              </span>
                            )}
                            {property.customProperties && Array.isArray(property.customProperties) && property.customProperties.map((customProp, idx) => (
                              <span key={idx} className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20 mr-1 mt-1">
                                {customProp.property}:{customProp.value}
                              </span>
                            ))}
                            {property.tags && Array.isArray(property.tags) && property.tags.map((tag, idx) => (
                              <span key={idx} className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1">
                                <svg className="size-1.5 fill-gray-500 mr-1" viewBox="0 0 6 6" aria-hidden="true">
                                  <circle cx="3" cy="3" r="3"></circle>
                                </svg>
                                <span>{tag}</span>
                              </span>
                            ))}
                            {property.quality && Array.isArray(property.quality) && property.quality.map((qualityCheck, qIdx) => {
                              const QualityIcon = getQualityCheckIcon(qualityCheck.type);
                              const tooltipContent = (
                                <div className="space-y-1">
                                  {qualityCheck.description && <div>{qualityCheck.description}</div>}
                                  {qualityCheck.type && <div className="text-gray-300">Type: {qualityCheck.type}</div>}
                                  {qualityCheck.dimension && <div className="text-gray-300">Dimension: {qualityCheck.dimension}</div>}
                                  {qualityCheck.metric && <div className="text-gray-300">Metric: {qualityCheck.metric}</div>}
                                  {qualityCheck.mustBeGreaterThan !== undefined && <div className="text-gray-300">Must be &gt; {qualityCheck.mustBeGreaterThan}</div>}
                                  {qualityCheck.mustBeLessThan !== undefined && <div className="text-gray-300">Must be &lt; {qualityCheck.mustBeLessThan}</div>}
                                  {qualityCheck.mustBe !== undefined && <div className="text-gray-300">Must be {qualityCheck.mustBe}</div>}
                                </div>
                              );

                              return (
                                <Tooltip key={qIdx} content={tooltipContent}>
                                  <span className="inline-flex items-center gap-1 rounded-md bg-fuchsia-50 px-2 py-1 text-xs font-medium text-fuchsia-700 ring-1 ring-inset ring-fuchsia-600/20 mr-1 mt-1">
                                    <QualityIcon className="w-3 h-3" />
                                    {qualityCheck.name || 'Quality Check'}
                                  </span>
                                </Tooltip>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                      {hasChildren && Object.entries(property.properties).map(([childName, childProp]) =>
                        renderProperty(childProp, childName, indent + 1)
                      )}
                    </Fragment>
                  );
                };

                return (
                  <div key={modelName} className="mt-3 print:block">
                    <div className="overflow-x-auto shadow ring-1 ring-black/5 sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300 print:relative print:break-inside-auto">
                        <thead className="bg-gray-50 print:table-header-group">
                          <tr className="print:break-inside-avoid-page">
                            <th scope="colgroup" colSpan="3" className="py-2 pl-4 pr-3 text-left font-semibold text-gray-900 sm:pl-6">
                              <span>{model.title || modelName}</span>
                              {' '}
                              <span className="font-mono font-medium">{modelName}</span>
                              {' '}
                              {model.type && (
                                <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                  {model.type}
                                </span>
                              )}
                              {model.description ? (
                                <div className="text-sm font-medium text-gray-500">{model.description}</div>
                              ) : (
                                <div className="text-sm font-medium text-gray-400">No description</div>
                              )}
                              {model.customProperties && Array.isArray(model.customProperties) && model.customProperties.length > 0 && (
                                <div>
                                  {model.customProperties.map((customProp, idx) => (
                                    <span key={idx} className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20 mr-1 mt-1">
                                      {customProp.property}:{customProp.value}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {docs.schema && docs.schema.find(s => s.name === modelName)?.tags && Array.isArray(docs.schema.find(s => s.name === modelName).tags) && docs.schema.find(s => s.name === modelName).tags.length > 0 && (
                                <div className="mt-1">
                                  {docs.schema.find(s => s.name === modelName).tags.map((tag, idx) => (
                                    <span key={idx} className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-1 mt-1">
                                      <svg className="size-1.5 fill-gray-500 mr-1" viewBox="0 0 6 6" aria-hidden="true">
                                        <circle cx="3" cy="3" r="3"></circle>
                                      </svg>
                                      <span>{tag}</span>
                                    </span>
                                  ))}
                                </div>
                              )}
                              {docs.schema && docs.schema.find(s => s.name === modelName)?.quality && Array.isArray(docs.schema.find(s => s.name === modelName).quality) && docs.schema.find(s => s.name === modelName).quality.length > 0 && (
                                <div className="mt-2">
                                  {docs.schema.find(s => s.name === modelName).quality.map((qualityCheck, idx) => {
                                    const QualityIcon = getQualityCheckIcon(qualityCheck.type);
                                    const tooltipContent = (
                                      <div className="space-y-1">
                                        {qualityCheck.description && <div>{qualityCheck.description}</div>}
                                        {qualityCheck.type && <div className="text-gray-300">Type: {qualityCheck.type}</div>}
                                        {qualityCheck.dimension && <div className="text-gray-300">Dimension: {qualityCheck.dimension}</div>}
                                        {qualityCheck.metric && <div className="text-gray-300">Metric: {qualityCheck.metric}</div>}
                                      </div>
                                    );

                                    return (
                                      <Tooltip key={idx} content={tooltipContent}>
                                        <span className="inline-flex items-center gap-1 rounded-md bg-fuchsia-50 px-2 py-1 text-xs font-medium text-fuchsia-700 ring-1 ring-inset ring-fuchsia-600/20 mr-1 mt-1">
                                          <QualityIcon className="w-3 h-3" />
                                          {qualityCheck.name || 'Quality Check'}
                                        </span>
                                      </Tooltip>
                                    );
                                  })}
                                </div>
                              )}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {model.fields && Object.entries(model.fields).map(([fieldName, field]) =>
                            renderProperty(field, fieldName, 0)
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </section>
          )}

          {/* 4. Servers Section */}
          {servers && servers.length > 0 && (
            <section>
              <div className="px-4 sm:px-0">
                <h1 className="text-base font-semibold leading-6 text-gray-900" id="servers">Servers</h1>
                <p className="text-sm text-gray-500">This section covers connection details to physical data sets and infrastructure</p>
              </div>
              <ul role="list" className="mt-2 divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-lg">
                {servers.map((server, index) => {
                  const ServerIconComponent = getServerIcon(server.type);
                  return (
                    <li key={index} className="relative flex flex-col gap-x-6 gap-y-2 px-4 py-3 sm:px-6" id={`server-${server.server}`}>
                      <div className="flex items-start gap-x-4">
                        {ServerIconComponent && (
                          <div className="flex-none h-12 w-12 rounded-lg bg-white p-2.5 ring-1 ring-gray-900/10 flex items-center justify-center">
                            <ServerIconComponent />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                            {server.type && (
                              <div className="flex flex-col">
                                <dt className="text-sm font-medium text-gray-500">Type</dt>
                                <dd className="mt-1 text-sm text-gray-900">{server.type}</dd>
                              </div>
                            )}
                            {server.project && (
                              <div className="flex flex-col">
                                <dt className="text-sm font-medium text-gray-500">Project</dt>
                                <dd className="mt-1 text-sm text-gray-900">{server.project}</dd>
                              </div>
                            )}
                            {server.dataset && (
                              <div className="flex flex-col">
                                <dt className="text-sm font-medium text-gray-500">Dataset</dt>
                                <dd className="mt-1 text-sm text-gray-900">{server.dataset}</dd>
                              </div>
                            )}
                            {server.endpointUrl && (
                              <div className="flex flex-col">
                                <dt className="text-sm font-medium text-gray-500">Endpoint</dt>
                                <dd className="mt-1 text-sm text-gray-900">{server.endpointUrl}</dd>
                              </div>
                            )}
                            {server.location && (
                              <div className="flex flex-col">
                                <dt className="text-sm font-medium text-gray-500">Location</dt>
                                <dd className="mt-1 text-sm text-gray-900">{server.location}</dd>
                              </div>
                            )}
                            {server.path && (
                              <div className="flex flex-col">
                                <dt className="text-sm font-medium text-gray-500">Path</dt>
                                <dd className="mt-1 text-sm text-gray-900">{server.path}</dd>
                              </div>
                            )}
                            {server.account && (
                              <div className="flex flex-col">
                                <dt className="text-sm font-medium text-gray-500">Account</dt>
                                <dd className="mt-1 text-sm text-gray-900">{server.account}</dd>
                              </div>
                            )}
                            {server.database && (
                              <div className="flex flex-col">
                                <dt className="text-sm font-medium text-gray-500">Database</dt>
                                <dd className="mt-1 text-sm text-gray-900">{server.database}</dd>
                              </div>
                            )}
                            {server.schema && (
                              <div className="flex flex-col">
                                <dt className="text-sm font-medium text-gray-500">Schema</dt>
                                <dd className="mt-1 text-sm text-gray-900">{server.schema}</dd>
                              </div>
                            )}
                            {server.table && (
                              <div className="flex flex-col">
                                <dt className="text-sm font-medium text-gray-500">Table</dt>
                                <dd className="mt-1 text-sm text-gray-900">{server.table}</dd>
                              </div>
                            )}
                            {server.view && (
                              <div className="flex flex-col">
                                <dt className="text-sm font-medium text-gray-500">View</dt>
                                <dd className="mt-1 text-sm text-gray-900">{server.view}</dd>
                              </div>
                            )}
                            {server.host && (
                              <div className="flex flex-col">
                                <dt className="text-sm font-medium text-gray-500">Host</dt>
                                <dd className="mt-1 text-sm text-gray-900">{server.host}</dd>
                              </div>
                            )}
                            {server.port && (
                              <div className="flex flex-col">
                                <dt className="text-sm font-medium text-gray-500">Port</dt>
                                <dd className="mt-1 text-sm text-gray-900">{server.port}</dd>
                              </div>
                            )}
                            {server.topic && (
                              <div className="flex flex-col">
                                <dt className="text-sm font-medium text-gray-500">Topic</dt>
                                <dd className="mt-1 text-sm text-gray-900">{server.topic}</dd>
                              </div>
                            )}
                            {server.format && (
                              <div className="flex flex-col">
                                <dt className="text-sm font-medium text-gray-500">Format</dt>
                                <dd className="mt-1 text-sm text-gray-900">{server.format}</dd>
                              </div>
                            )}
                            {server.delimiter && (
                              <div className="flex flex-col">
                                <dt className="text-sm font-medium text-gray-500">Delimiter</dt>
                                <dd className="mt-1 text-sm text-gray-900">{server.delimiter}</dd>
                              </div>
                            )}
                            {server.customProperties && Array.isArray(server.customProperties) && server.customProperties.map((customProperty, cpIndex) => (
                              <div key={cpIndex} className="flex flex-col">
                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{customProperty.property}</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                  <span className="whitespace-pre-wrap inline-flex items-center gap-1">
                                    {customProperty.value}
                                    {customProperty.description && (
                                      <Tooltip content={customProperty.description}>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-400 cursor-help">
                                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                        </svg>
                                      </Tooltip>
                                    )}
                                  </span>
                                </dd>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* 5. Team Section */}
          {(team.name || team.description || teamMembers.length > 0 || (team.tags && team.tags.length > 0)) && (
            <section>
              <div className="px-4 sm:px-0">
                <h1 className="text-base font-semibold leading-6 text-gray-900" id="team">Team</h1>
                <p className="text-sm text-gray-500">This section lists team information and members</p>
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
                          style={{ minWidth: '120px' }}
                          title={def.description}
                        >
                          <div className="mx-auto w-8 h-8 mb-2 text-gray-500">
                            <IconResolver url={def.url} type={def.type} className="w-full h-full" />
                          </div>
                          <div className="text-xs font-medium">{def.type}</div>
                        </a>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    {team.name && (
                      <div>
                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Team Name</dt>
                        <dd className="mt-1 text-sm text-gray-900">{team.name}</dd>
                      </div>
                    )}

                    {team.description && (
                      <div>
                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Description</dt>
                        <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{team.description}</dd>
                      </div>
                    )}

                    {team.tags && Array.isArray(team.tags) && team.tags.length > 0 && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 mb-2">Tags</dt>
                        <dd className="flex gap-1 items-center text-xs text-gray-500 flex-wrap">
                          {team.tags.map((tag, index) => (
                            <span key={index} className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                              <svg className="size-1.5 fill-gray-500 mr-1" viewBox="0 0 6 6" aria-hidden="true">
                                <circle cx="3" cy="3" r="3"></circle>
                              </svg>
                              <span>{tag}</span>
                            </span>
                          ))}
                        </dd>
                      </div>
                    )}

                    {team.customProperties && Array.isArray(team.customProperties) && team.customProperties.length > 0 && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 mb-2">Custom Properties</dt>
                        <dd className="flex flex-wrap gap-x-4 gap-y-2">
                          {team.customProperties.map((customProp, index) => (
                            <div key={index} className="min-w-0">
                              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide inline-flex items-center gap-1">
                                {customProp.property}
                                {customProp.description && (
                                  <Tooltip content={customProp.description}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-400 cursor-help">
                                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                    </svg>
                                  </Tooltip>
                                )}
                              </dt>
                              <dd className="text-sm text-gray-900">
                                <span className="whitespace-pre-wrap">{customProp.value}</span>
                              </dd>
                            </div>
                          ))}
                        </dd>
                      </div>
                    )}

                    {/* Team members */}
                    {teamMembers.length > 0 && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500 mb-2">Members</dt>
                        <dd>
                          <div className="space-y-3">
                            {teamMembers.map((teamMember, index) => (
                              <div key={index} className="border-l-2 border-gray-200 pl-3 py-1">
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                                  {teamMember.username && (
                                    <span className="text-gray-900 font-medium">{teamMember.username}</span>
                                  )}
                                  {teamMember.name && (
                                    <span className="text-gray-600">{teamMember.name}</span>
                                  )}
                                  {teamMember.role && (
                                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                      {teamMember.role}
                                    </span>
                                  )}
                                </div>
                                {teamMember.description && (
                                  <p className="text-sm text-gray-500 mt-1">{teamMember.description}</p>
                                )}
                                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                                  {teamMember.dateIn && (
                                    <span>In: {teamMember.dateIn}</span>
                                  )}
                                  {teamMember.dateOut && (
                                    <span>Out: {teamMember.dateOut}</span>
                                  )}
                                  {teamMember.replacedByUsername && (
                                    <span>Replaced by: {teamMember.replacedByUsername}</span>
                                  )}
                                </div>
                                {teamMember.tags && Array.isArray(teamMember.tags) && teamMember.tags.length > 0 && (
                                  <div className="flex gap-1 flex-wrap mt-1">
                                    {teamMember.tags.map((tag, idx) => (
                                      <span key={idx} className="inline-flex items-center rounded-md bg-gray-50 px-1.5 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </dd>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 6. Support & Communication Section */}
          {support && support.length > 0 && (
            <section>
              <div className="px-4 sm:px-0">
                <h1 className="text-base font-semibold leading-6 text-gray-900" id="support">Support & Communication Channels</h1>
                <p className="text-sm text-gray-500">Support and communication channels help consumers find help regarding their use of the data contract</p>
              </div>
              <ul role="list" className="mt-2 divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-lg">
                {support.map((channel, index) => {
                  const SupportIconComponent = getSupportIcon(channel.tool);
                  return (
                    <li key={index} className="relative flex items-start gap-x-4 px-4 py-3 sm:px-6">
                      {SupportIconComponent && (
                        <div className="flex-none h-12 w-12 rounded-lg bg-white p-1.5 ring-1 ring-gray-900/10 flex items-center justify-center">
                          <SupportIconComponent />
                        </div>
                      )}
                      <div className="flex-1 flex flex-wrap gap-x-6">
                        {channel.tool && (
                          <div className="flex items-center gap-x-4">
                            <div className="flex flex-col">
                              <dt className="text-sm font-medium text-gray-500">Tool</dt>
                              <dd className="mt-1 text-sm text-gray-900">{channel.tool}</dd>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-x-4">
                          <div className="flex flex-col">
                            <dt className="text-sm font-medium text-gray-500">Channel</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              {channel.url ? (
                                <a href={channel.url} className="text-indigo-600 hover:text-indigo-500">{channel.channel}</a>
                              ) : (
                                <span>{channel.channel}</span>
                              )}
                            </dd>
                          </div>
                        </div>
                        {channel.scope && (
                          <div className="flex items-center gap-x-4">
                            <div className="flex flex-col">
                              <dt className="text-sm font-medium text-gray-500">Scope</dt>
                              <dd className="mt-1 text-sm text-gray-900">{channel.scope}</dd>
                            </div>
                          </div>
                        )}
                        {channel.description && (
                          <div className="flex items-center gap-x-4">
                            <div className="flex flex-col">
                              <dt className="text-sm font-medium text-gray-500">Description</dt>
                              <dd className="mt-1 text-sm text-gray-900">{channel.description}</dd>
                            </div>
                          </div>
                        )}
                        {channel.invitationUrl && (
                          <div className="flex items-center gap-x-4">
                            <div className="flex flex-col">
                              <dt className="text-sm font-medium text-gray-500">Invitation URL</dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                <a href={channel.invitationUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500">
                                  Invitation
                                </a>
                              </dd>
                            </div>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* 7. Roles Section */}
          {roles && roles.length > 0 && (
            <section>
              <div className="px-4 sm:px-0">
                <h1 className="text-base font-semibold leading-6 text-gray-900" id="roles">Roles</h1>
                <p className="text-sm text-gray-500">Support and communication channels help consumers find help regarding their use of the data contract</p>
              </div>
              <ul role="list" className="mt-2 divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-lg">
                {roles.map((role, index) => (
                  <li key={index} className="relative flex gap-x-6 px-4 py-3 sm:px-6">
                    {role.role && (
                      <div className="flex items-center gap-x-4">
                        <div className="hidden sm:flex sm:flex-col">
                          <dt className="text-sm font-medium text-gray-500">Role</dt>
                          <dd className="mt-1 text-sm text-gray-900">{role.role}</dd>
                        </div>
                      </div>
                    )}
                    {role.access && (
                      <div className="flex items-center gap-x-4">
                        <div className="hidden sm:flex sm:flex-col">
                          <dt className="text-sm font-medium text-gray-500">Access</dt>
                          <dd className="mt-1 text-sm text-gray-900">{role.access}</dd>
                        </div>
                      </div>
                    )}
                    {role.firstLevelApprovers && (
                      <div className="flex items-center gap-x-4">
                        <div className="hidden sm:flex sm:flex-col">
                          <dt className="text-sm font-medium text-gray-500">First Level Approvers</dt>
                          <dd className="mt-1 text-sm text-gray-900">{role.firstLevelApprovers}</dd>
                        </div>
                      </div>
                    )}
                    {role.secondLevelApprovers && (
                      <div className="flex items-center gap-x-4">
                        <div className="hidden sm:flex sm:flex-col">
                          <dt className="text-sm font-medium text-gray-500">Second Level Approvers</dt>
                          <dd className="mt-1 text-sm text-gray-900">{role.secondLevelApprovers}</dd>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 8. Pricing Section */}
          {price && (
            <section>
              <div className="px-4 sm:px-0">
                <h1 className="text-base font-semibold leading-6 text-gray-900" id="price">Price</h1>
                <p className="text-sm text-gray-500">This section covers pricing when you bill your customer for using this data product.</p>
              </div>
              <div className="mt-2 overflow-hidden shadow sm:rounded-lg bg-white">
                <div className="px-4 py-4 sm:px-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-3">
                    {price.priceAmount && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Price Amount</dt>
                        <dd className="mt-1 text-sm text-gray-900">{price.priceAmount}</dd>
                      </div>
                    )}

                    {price.priceCurrency && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Price Currency</dt>
                        <dd className="mt-1 text-sm text-gray-900">{price.priceCurrency}</dd>
                      </div>
                    )}

                    {price.priceUnit && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Price Unit</dt>
                        <dd className="mt-1 text-sm text-gray-900">{price.priceUnit}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </section>
          )}

          {/* 9. SLA Section */}
          {slaProperties && slaProperties.length > 0 && (
            <section>
              <div className="px-4 sm:px-0">
                <h1 className="text-base font-semibold leading-6 text-gray-900" id="sla">Service-Level Agreement (SLA)</h1>
                <p className="text-sm text-gray-500">This section describes the service-level agreements (SLA).</p>
              </div>
              <ul role="list" className="mt-2 divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-lg">
                {slaProperties.map((sla, index) => (
                  <li key={index} className="relative flex gap-x-6 px-4 py-3 sm:px-6">
                    {sla.property && (
                      <div className="flex items-center gap-x-4">
                        <div className="hidden sm:flex sm:flex-col">
                          <dt className="text-sm font-medium text-gray-500">Property</dt>
                          <dd className="mt-1 text-sm text-gray-900 overflow-hidden text-ellipsis w-64">{sla.property}</dd>
                        </div>
                      </div>
                    )}
                    {sla.value && (
                      <div className="flex items-center gap-x-4">
                        <div className="hidden sm:flex sm:flex-col">
                          <dt className="text-sm font-medium text-gray-500">Value</dt>
                          <dd className="mt-1 text-sm text-gray-900">{sla.value}</dd>
                        </div>
                      </div>
                    )}
                    {sla.valueExt && (
                      <div className="flex items-center gap-x-4">
                        <div className="hidden sm:flex sm:flex-col">
                          <dt className="text-sm font-medium text-gray-500">Extended value</dt>
                          <dd className="mt-1 text-sm text-gray-900">{sla.valueExt}</dd>
                        </div>
                      </div>
                    )}
                    {sla.unit && (
                      <div className="flex items-center gap-x-4">
                        <div className="hidden sm:flex sm:flex-col">
                          <dt className="text-sm font-medium text-gray-500">Unit</dt>
                          <dd className="mt-1 text-sm text-gray-900">{sla.unit}</dd>
                        </div>
                      </div>
                    )}
                    {sla.element && (
                      <div className="flex items-center gap-x-4">
                        <div className="hidden sm:flex sm:flex-col">
                          <dt className="text-sm font-medium text-gray-500">Element(s)</dt>
                          <dd className="mt-1 text-sm text-gray-900">{sla.element}</dd>
                        </div>
                      </div>
                    )}
                    {sla.driver && (
                      <div className="flex items-center gap-x-4">
                        <div className="hidden sm:flex sm:flex-col">
                          <dt className="text-sm font-medium text-gray-500">Driver</dt>
                          <dd className="mt-1 text-sm text-gray-900">{sla.driver}</dd>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 10. Custom Properties Section */}
          {customProperties && customProperties.length > 0 && (
            <section className="print:break-before-page">
              <div className="px-4 sm:px-0">
                <h1 className="text-base font-semibold leading-6 text-gray-900" id="customProperties">Custom Properties</h1>
                <p className="text-sm text-gray-500">This section covers other properties you may find in a data contract.</p>
              </div>
              <div className="mt-2 overflow-hidden print:overflow-auto bg-white shadow sm:rounded-lg">
                <div className="border-t border-gray-100">
                  <dl className="divide-y divide-gray-100 text-sm break-all print:break-inside-avoid">
                    {customProperties.map((property, index) => (
                      <div key={index} className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-900">{property.property}</dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                          <span className="whitespace-pre-wrap inline-flex items-center gap-1">
                            {property.value}
                            {property.description && (
                              <Tooltip content={property.description}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-400 cursor-help">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                </svg>
                              </Tooltip>
                            )}
                          </span>
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </section>
          )}

      </div>
    </div>
  );
};

export default DataContractPreview;
