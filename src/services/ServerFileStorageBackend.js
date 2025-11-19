import { FileStorageBackend } from './FileStorageBackend.js';

/**
 * Server-based file storage backend that communicates with a REST API
 * Implements the YAML File Management API specification
 */
export class ServerFileStorageBackend extends FileStorageBackend {
  constructor(apiBaseUrl = 'http://localhost:4001', options = {}) {
    super();
    this.apiBaseUrl = apiBaseUrl;
    this.currentFilename = null; // Track the current file being edited
    this.options = {
      mode: 'cors', // Enable CORS
      credentials: 'omit', // Don't send credentials for now
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };
  }

  /**
   * Load a YAML file from the server
   * @param {string} filename - Optional filename to load specific file
   * @returns {Promise<string>} The YAML content as a string
   */
  async loadYamlFile(filename = null) {
    try {
      if (!filename) {
        // If no filename provided, try to load the example file
        return await this.loadExampleFile();
      }

      const response = await fetch(`${this.apiBaseUrl}/files/${encodeURIComponent(filename)}`, {
        method: 'GET',
        mode: 'cors',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`File not found: ${filename}`);
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to load file: ${response.statusText}`);
      }

      // The API returns text/yaml
      const yamlContent = await response.text();
      this.currentFilename = filename;
      return yamlContent;
    } catch (error) {
      throw new Error(`Failed to load file from server: ${error.message}`);
    }
  }

  /**
   * Load the example YAML file from the server
   * @returns {Promise<string>} The example YAML content as a string
   */
  async loadExampleFile() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/example`, {
        method: 'GET',
        mode: 'cors',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to load example file: ${response.statusText}`);
      }

      const yamlContent = await response.text();
      return yamlContent;
    } catch (error) {
      throw new Error(`Failed to load example file: ${error.message}`);
    }
  }

  /**
   * Save YAML content to the server
   * @param {string} yamlContent - The YAML content to save
   * @param {string} suggestedName - Suggested filename (must end with .yaml or .yml)
   * @param {string} filename - Optional filename to update existing file
   * @returns {Promise<{filename: string}>} Saved file info
   */
  async saveYamlFile(yamlContent, suggestedName = 'datacontract.yaml', filename = null) {
    if (!yamlContent.trim()) {
      throw new Error('No content to save');
    }

    // Ensure filename ends with .yaml or .yml
    const targetFilename = filename || this.currentFilename || suggestedName;
    if (!targetFilename.endsWith('.yaml') && !targetFilename.endsWith('.yml')) {
      throw new Error('Filename must end with .yaml or .yml');
    }

    try {
      let response;

      // If we have a filename (from previous save), try to update it first
      if (filename || this.currentFilename) {
        const updateFilename = filename || this.currentFilename;
        response = await fetch(`${this.apiBaseUrl}/files/${encodeURIComponent(updateFilename)}`, {
          method: 'PUT',
          mode: 'cors',
          headers: {
            'Content-Type': 'text/yaml',
          },
          body: yamlContent,
        });

        // If file doesn't exist (404), fall back to creating a new file
        if (response.status === 404) {
          response = await fetch(`${this.apiBaseUrl}/files`, {
            method: 'POST',
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              filename: suggestedName,
              content: yamlContent
            }),
          });
        }
      } else {
        // No previous filename, create new file using POST
        response = await fetch(`${this.apiBaseUrl}/files`, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filename: suggestedName,
            content: yamlContent
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 409) {
          // File already exists - try to update it instead
          const updateFilename = filename || suggestedName;
          response = await fetch(`${this.apiBaseUrl}/files/${encodeURIComponent(updateFilename)}`, {
            method: 'PUT',
            mode: 'cors',
            headers: {
              'Content-Type': 'text/yaml',
            },
            body: yamlContent,
          });

          if (!response.ok) {
            throw new Error(`Failed to update existing file: ${response.statusText}`);
          }
        } else {
          throw new Error(errorData.error || `Failed to save file: ${response.statusText}`);
        }
      }

      const result = await response.json();
      this.currentFilename = result.filename || targetFilename;

      return {
        filename: this.currentFilename
      };
    } catch (error) {
      throw new Error(`Failed to save file to server: ${error.message}`);
    }
  }

  supportsFileDialog() {
    // Use native file dialog
    return false;
  }

  getBackendName() {
    return 'Server Storage';
  }

  /**
   * Check server health
   * @returns {Promise<{status: string}>}
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/health`, {
        method: 'GET',
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  }

  /**
   * Get the current filename being edited
   * @returns {string|null}
   */
  getCurrentFilename() {
    return this.currentFilename;
  }

  /**
   * Set the current filename
   * @param {string} filename
   */
  setCurrentFilename(filename) {
    this.currentFilename = filename;
  }
}
