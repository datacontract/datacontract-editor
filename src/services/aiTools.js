/**
 * AI Tools - Built-in and custom tool definitions
 *
 * Tools follow OpenAI function calling format and can be executed client-side.
 * Custom tools can be registered for MCP-like extensibility.
 */

import { registerTool } from './aiService.js';
import { validateYaml } from '../utils/validateYaml.js';

// Cache for ODCS schema
let odcsSchemaCache = null;
const ODCS_SCHEMA_URL = 'https://raw.githubusercontent.com/bitol-io/open-data-contract-standard/refs/heads/main/schema/odcs-json-schema-v3.1.0.json';

/**
 * Built-in tool: Update data contract YAML
 */
export const UPDATE_CONTRACT_TOOL = {
  name: 'updateContract',
  description: 'Updates the data contract YAML. ALWAYS use this when the user asks to add, modify, remove, or change any content in the data contract. Do NOT just describe changes in text - you MUST call this tool with the complete updated YAML.',
  parameters: {
    type: 'object',
    properties: {
      updatedYaml: {
        type: 'string',
        description: 'The complete updated YAML document. Must be valid ODCS v3.x format with all required fields.',
      },
      summary: {
        type: 'string',
        description: 'Brief description of the changes made (1-2 sentences)',
      },
    },
    required: ['updatedYaml', 'summary'],
  },
};

/**
 * Built-in tool: Read current data contract
 */
export const READ_CONTRACT_TOOL = {
  name: 'readContract',
  description: 'Reads and returns the current data contract YAML. Use this to get the latest version of the contract before making changes or answering questions about specific content.',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
};

/**
 * Built-in tool: Validate data contract
 */
export const VALIDATE_CONTRACT_TOOL = {
  name: 'validateContract',
  description: 'Validates the current data contract against the ODCS v3.x JSON schema. Returns validation errors and warnings. Use this before suggesting changes or when asked about contract validity.',
  parameters: {
    type: 'object',
    properties: {
      yaml: {
        type: 'string',
        description: 'Optional YAML to validate. If not provided, validates the current contract.',
      },
    },
    required: [],
  },
};

/**
 * Built-in tool: Read customizations
 */
export const READ_CUSTOMIZATIONS_TOOL = {
  name: 'readCustomizations',
  description: 'Reads the editor customizations configuration. Returns available teams, domains, server types, and other custom settings configured for this editor instance.',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
};

/**
 * Built-in tool: Test data contract
 */
export const TEST_CONTRACT_TOOL = {
  name: 'testContract',
  description: 'Runs tests against the data contract using the configured test server. Returns test results including passed/failed checks. Only available if tests are enabled.',
  parameters: {
    type: 'object',
    properties: {
      server: {
        type: 'string',
        description: 'Optional server name to test against. If not specified, tests all servers.',
      },
    },
    required: [],
  },
};

/**
 * Built-in tool: Get JSON Schema
 */
export const GET_JSON_SCHEMA_TOOL = {
  name: 'getJsonSchema',
  description: 'Retrieves the ODCS v3.x JSON schema used for validation. Useful for understanding the expected structure and constraints of data contracts.',
  parameters: {
    type: 'object',
    properties: {
      section: {
        type: 'string',
        enum: ['full', 'properties', 'definitions', 'required'],
        description: 'Which part of the schema to return. "full" returns everything, others return specific sections.',
      },
    },
    required: [],
  },
};

/**
 * Handler for updateContract tool
 */
async function handleUpdateContract({ updatedYaml, summary }, context) {
  const validation = await validateYaml(updatedYaml);

  return {
    updatedYaml,
    summary: summary || 'AI suggested changes',
    validationErrors: validation.errors,
    isValid: validation.isValid,
  };
}

/**
 * Handler for readContract tool
 */
async function handleReadContract(args, context) {
  return {
    yaml: context.yaml || '',
    message: context.yaml ? 'Current data contract YAML' : 'No contract loaded',
  };
}

/**
 * Handler for validateContract tool
 */
async function handleValidateContract({ yaml }, context) {
  const yamlToValidate = yaml || context.yaml;
  if (!yamlToValidate) {
    return { isValid: false, errors: [{ message: 'No YAML content to validate' }] };
  }

  const validation = await validateYaml(yamlToValidate);
  return {
    isValid: validation.isValid,
    errors: validation.errors,
    errorCount: validation.errors.length,
    message: validation.isValid
      ? 'Contract is valid'
      : `Found ${validation.errors.length} validation error(s)`,
  };
}

/**
 * Handler for readCustomizations tool
 */
async function handleReadCustomizations(args, context) {
  const editorConfig = context.editorConfig || {};

  return {
    teams: editorConfig.teams || null,
    domains: editorConfig.domains || null,
    customizations: editorConfig.customizations || null,
    tests: {
      enabled: editorConfig.tests?.enabled ?? true,
      serverUrl: editorConfig.tests?.dataContractCliApiServerUrl || null,
    },
    ai: {
      enabled: editorConfig.ai?.enabled ?? true,
      model: editorConfig.ai?.model || null,
    },
    mode: editorConfig.mode || 'SERVER',
  };
}

/**
 * Handler for testContract tool
 */
async function handleTestContract({ server }, context) {
  const editorConfig = context.editorConfig || {};

  // Check if tests are enabled
  if (!editorConfig.tests?.enabled) {
    return {
      success: false,
      error: 'Tests are not enabled for this editor instance',
      enabled: false,
    };
  }

  // Use the runTest function from context if available
  if (context.runTest) {
    try {
      const result = await context.runTest(server);
      return {
        success: result.success,
        data: result.data,
        timestamp: result.timestamp,
        server: server || 'all',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        server: server || 'all',
      };
    }
  }

  // Fallback: make direct API call
  const yaml = context.yaml;
  if (!yaml) {
    return { success: false, error: 'No contract loaded to test' };
  }

  const baseUrl = editorConfig.tests?.dataContractCliApiServerUrl || 'https://api.datacontract.com';
  const testEndpoint = `${baseUrl}/test`;
  const url = server ? `${testEndpoint}?server=${encodeURIComponent(server)}` : testEndpoint;

  try {
    const headers = { 'Content-Type': 'text/plain' };
    if (editorConfig.tests?.apiKey) {
      headers['X-API-KEY'] = editorConfig.tests.apiKey;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: yaml,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `Server error: ${response.status} - ${errorText}` };
    }

    const result = await response.json();
    const passed = result.result === 'passed' || result.result === 'pass';

    return {
      success: passed,
      data: result,
      timestamp: new Date().toISOString(),
      server: server || 'all',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      server: server || 'all',
    };
  }
}

/**
 * Handler for getJsonSchema tool
 */
async function handleGetJsonSchema({ section = 'full' }) {
  // Fetch and cache schema
  if (!odcsSchemaCache) {
    try {
      const response = await fetch(ODCS_SCHEMA_URL);
      if (!response.ok) {
        return { error: `Failed to fetch schema: ${response.status}` };
      }
      odcsSchemaCache = await response.json();
    } catch (error) {
      return { error: `Failed to fetch schema: ${error.message}` };
    }
  }

  switch (section) {
    case 'properties':
      return { section: 'properties', data: odcsSchemaCache.properties || {} };
    case 'definitions':
      return { section: 'definitions', data: odcsSchemaCache.$defs || odcsSchemaCache.definitions || {} };
    case 'required':
      return { section: 'required', data: odcsSchemaCache.required || [] };
    case 'full':
    default:
      return { section: 'full', data: odcsSchemaCache };
  }
}

/**
 * Register built-in tools
 */
export function registerBuiltInTools() {
  registerTool('updateContract', UPDATE_CONTRACT_TOOL, handleUpdateContract);
  registerTool('readContract', READ_CONTRACT_TOOL, handleReadContract);
  registerTool('validateContract', VALIDATE_CONTRACT_TOOL, handleValidateContract);
  registerTool('readCustomizations', READ_CUSTOMIZATIONS_TOOL, handleReadCustomizations);
  registerTool('testContract', TEST_CONTRACT_TOOL, handleTestContract);
  registerTool('getJsonSchema', GET_JSON_SCHEMA_TOOL, handleGetJsonSchema);
}

/**
 * Create a tool definition helper
 *
 * @param {object} options - Tool options
 * @returns {object} Tool definition and handler
 */
export function createTool({ name, description, parameters, handler }) {
  const definition = { name, description, parameters };
  return {
    definition,
    handler,
    register: () => registerTool(name, definition, handler),
  };
}

/**
 * Built-in tool templates for common operations
 */
export const toolTemplates = {
  /**
   * Create a lookup tool (e.g., for business definitions)
   */
  createLookupTool: ({ name, description, lookupFn }) => {
    return createTool({
      name,
      description,
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query or term to look up',
          },
        },
        required: ['query'],
      },
      handler: async ({ query }) => {
        const results = await lookupFn(query);
        return { query, results };
      },
    });
  },

  /**
   * Create a validation tool
   */
  createValidationTool: ({ name, description, validateFn }) => {
    return createTool({
      name,
      description,
      parameters: {
        type: 'object',
        properties: {
          content: {
            type: 'string',
            description: 'Content to validate',
          },
        },
        required: ['content'],
      },
      handler: async ({ content }, context) => {
        const result = await validateFn(content, context);
        return result;
      },
    });
  },

  /**
   * Create a test execution tool
   */
  createTestTool: ({ name, description, testFn }) => {
    return createTool({
      name,
      description,
      parameters: {
        type: 'object',
        properties: {
          testName: {
            type: 'string',
            description: 'Name of test to run (optional, runs all if not specified)',
          },
        },
        required: [],
      },
      handler: async ({ testName }, context) => {
        const result = await testFn(testName, context);
        return result;
      },
    });
  },

  /**
   * Create a fetch/API tool
   */
  createFetchTool: ({ name, description, baseUrl, transformRequest, transformResponse }) => {
    return createTool({
      name,
      description,
      parameters: {
        type: 'object',
        properties: {
          endpoint: {
            type: 'string',
            description: 'API endpoint path',
          },
          method: {
            type: 'string',
            enum: ['GET', 'POST', 'PUT', 'DELETE'],
            description: 'HTTP method',
          },
          body: {
            type: 'object',
            description: 'Request body (for POST/PUT)',
          },
        },
        required: ['endpoint'],
      },
      handler: async ({ endpoint, method = 'GET', body }) => {
        const url = `${baseUrl}${endpoint}`;
        const options = {
          method,
          headers: { 'Content-Type': 'application/json' },
        };

        if (transformRequest) {
          Object.assign(options, transformRequest({ endpoint, method, body }));
        }

        if (body && ['POST', 'PUT'].includes(method)) {
          options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        const data = await response.json();

        if (transformResponse) {
          return transformResponse(data);
        }
        return data;
      },
    });
  },
};

export default {
  UPDATE_CONTRACT_TOOL,
  registerBuiltInTools,
  createTool,
  toolTemplates,
};
