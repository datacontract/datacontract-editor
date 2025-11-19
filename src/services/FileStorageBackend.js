/**
 * Abstract base class for file storage backends
 * Defines the interface that all storage implementations must follow
 */
export class FileStorageBackend {
  /**
   * Load a YAML file from the storage backend
   * @returns {Promise<string>} The YAML content as a string
   * @throws {Error} If the operation is cancelled or fails
   */
  async loadYamlFile() {
    throw new Error('loadYamlFile must be implemented by subclass');
  }

  /**
   * Save YAML content to the storage backend
   * @param {string} yamlContent - The YAML content to save
   * @param {string} [suggestedName] - Optional suggested filename
   * @returns {Promise<void>}
   * @throws {Error} If the operation is cancelled or fails
   */
  async saveYamlFile(yamlContent, suggestedName = 'datacontract.yaml') {
    throw new Error('saveYamlFile must be implemented by subclass');
  }

  /**
   * Check if the backend supports file selection dialog
   * @returns {boolean}
   */
  supportsFileDialog() {
    return false;
  }

  /**
   * Get the name/type of this backend for display purposes
   * @returns {string}
   */
  getBackendName() {
    return 'Unknown Backend';
  }
}
