import Ajv2019 from 'ajv/dist/2019.js';
import addFormats from 'ajv-formats';
import odcs302 from './odcs-json-schema-v3.0.2.json';
import odcs310 from './odcs-json-schema-v3.1.0.json';
import odcs320 from './odcs-json-schema-v3.2.0.json';

const validators = {};
for (const [version, schema] of Object.entries({ 'v3.0.2': odcs302, 'v3.1.0': odcs310, 'v3.2.0': odcs320 })) {
  const ajv = new Ajv2019({ allErrors: true, strict: false });
  addFormats(ajv);
  validators[version] = ajv.compile(schema);
}

/** The errors of a contract with [parts] against the schema of [apiVersion], for tests. */
export function odcsErrors(apiVersion, parts) {
  const validate = validators[apiVersion];
  // Through JSON, as undefined fields do not reach the YAML either.
  validate(JSON.parse(JSON.stringify({
    apiVersion, kind: 'DataContract', id: 'x', version: '1.0.0', status: 'draft', ...parts,
  })));
  return (validate.errors || []).map((error) => `${error.instancePath} ${error.message}`);
}

export const propertyErrors = (apiVersion, property) =>
  odcsErrors(apiVersion, { schema: [{ name: 'orders', properties: [property] }] });

export const serverErrors = (apiVersion, server) =>
  odcsErrors(apiVersion, { servers: [{ server: 'production', ...server }] });
