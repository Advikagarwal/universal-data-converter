/**
 * YAML Serializer with js-yaml integration
 * Requirements: 1.2, 5.1, 5.5
 */

import * as yaml from 'js-yaml';
import type { FormatSerializer } from '../../types/serializer';
import type { SerializationOptions, SerializationResult, SupportedFormat } from '../../types/core';

export class YamlSerializer implements FormatSerializer {
  getFormatName(): SupportedFormat {
    return 'yaml';
  }

  getDefaultOptions(): SerializationOptions {
    return {
      prettyPrint: true,
      indentSize: 2
    };
  }

  serialize(data: unknown, options?: SerializationOptions): SerializationResult {
    const opts = { ...this.getDefaultOptions(), ...options };

    try {
      const yamlOptions: yaml.DumpOptions = {
        indent: opts.indentSize ?? 2,
        lineWidth: opts.prettyPrint ? 80 : -1,
        noRefs: true, // Avoid references for cleaner output
        sortKeys: false // Preserve key order
      };

      const output = yaml.dump(data, yamlOptions);

      return {
        success: true,
        output
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown serialization error';
      
      return {
        success: false,
        errors: [this.formatErrorMessage(errorMessage)]
      };
    }
  }

  /**
   * Format error message to be more user-friendly
   */
  private formatErrorMessage(message: string): string {
    if (message.includes('circular')) {
      return 'Cannot serialize data with circular references to YAML';
    }

    if (message.includes('unacceptable kind')) {
      return 'Data contains types that cannot be represented in YAML';
    }

    return `YAML serialization error: ${message}`;
  }
}
