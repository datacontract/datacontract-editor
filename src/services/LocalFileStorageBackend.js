import { FileStorageBackend } from './FileStorageBackend.js';
import yaml from 'js-yaml';

/**
 * Local file storage backend that uses browser File APIs
 * Supports both File System Access API (modern browsers) and fallback methods
 */
export class LocalFileStorageBackend extends FileStorageBackend {
  constructor() {
    super();
    this.supportsFileSystemAccess = 'showOpenFilePicker' in window && 'showSaveFilePicker' in window;
  }

  /**
   * Load a YAML file using browser file picker
   * @returns {Promise<string>} The YAML content as a string
   */
  async loadYamlFile() {
    if (this.supportsFileSystemAccess) {
      return this._loadWithFileSystemAccess();
    } else {
      return this._loadWithFileInput();
    }
  }

  /**
   * Save YAML content to a file using browser save dialog or download
   * @param {string} yamlContent - The YAML content to save
   * @param {string} suggestedName - Suggested filename
   * @param {string} existingFilename - Optional existing filename (not used by local backend)
   * @returns {Promise<{filename: string}>} Saved file info
   */
  async saveYamlFile(yamlContent, suggestedName = 'datacontract.yaml', existingFilename = null) {
    if (!yamlContent.trim()) {
      throw new Error('No content to save');
    }

    // Parse YAML to extract id and version for filename
    let filename = suggestedName;
    try {
      const dataContract = yaml.load(yamlContent);
      const id = dataContract.id ? `${dataContract.id}` : "data-contract";
      const version = dataContract.version ? `version-${dataContract.version}` : "version_00";
      filename = `${id}-${version}.yaml`;
    } catch (e) {
      // If parsing fails, use suggestedName
      console.warn('Could not parse YAML for filename, using default:', e);
    }

    if (this.supportsFileSystemAccess) {
      return this._saveWithFileSystemAccess(yamlContent, filename);
    } else {
      return this._saveWithDownload(yamlContent, filename);
    }
  }

  supportsFileDialog() {
    return this.supportsFileSystemAccess;
  }

  getBackendName() {
    return 'Local File System';
  }

  /**
   * Load file using File System Access API
   * @private
   */
  async _loadWithFileSystemAccess() {
    const [fileHandle] = await window.showOpenFilePicker({
      types: [
        {
          description: 'YAML files',
          accept: {
            'application/x-yaml': ['.yaml', '.yml'],
          },
        },
      ],
    });

    const file = await fileHandle.getFile();
    return await file.text();
  }

  /**
   * Save file using File System Access API
   * @private
   * @returns {Promise<{filename: string}>} Saved file info
   */
  async _saveWithFileSystemAccess(yamlContent, suggestedName) {
    const fileHandle = await window.showSaveFilePicker({
      suggestedName: suggestedName,
      types: [
        {
          description: 'YAML files',
          accept: {
            'application/x-yaml': ['.yaml', '.yml'],
          },
        },
      ],
    });

    const writable = await fileHandle.createWritable();
    await writable.write(yamlContent);
    await writable.close();

    return {
      filename: fileHandle.name
    };
  }

  /**
   * Load file using traditional file input (fallback)
   * @private
   */
  async _loadWithFileInput() {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.yaml,.yml';
      
      input.onchange = (event) => {
        const file = event.target.files[0];
        if (!file) {
          reject(new Error('No file selected'));
          return;
        }

        if (!this._isYamlFile(file)) {
          reject(new Error('Please select a YAML file (.yaml or .yml)'));
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      };

      input.oncancel = () => reject(new Error('File selection cancelled'));
      input.click();
    });
  }

  /**
   * Save file using download (fallback)
   * @private
   * @returns {Promise<{filename: string}>} Saved file info
   */
  async _saveWithDownload(yamlContent, suggestedName) {
    const blob = new Blob([yamlContent], { type: 'application/x-yaml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = suggestedName;
    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return {
      filename: suggestedName
    };
  }

  /**
   * Check if a file is a YAML file
   * @private
   */
  _isYamlFile(file) {
    return (
      file.type === 'application/x-yaml' ||
      file.name.endsWith('.yaml') ||
      file.name.endsWith('.yml')
    );
  }
}
