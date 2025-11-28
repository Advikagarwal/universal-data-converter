/**
 * JSON Serializer with formatting options
 * Requirements: 1.1, 5.1, 5.2, 5.3
 */

import type { FormatSerializer } from '../../types/serializer';
import type { SerializationOptions, SerializationResult, SupportedFormat } from '../../types/core';

export class JsonSerializer implements FormatSerializer {
  getFormatName(): SupportedFormat {
    return 'json';
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
      let output: string;

      if (opts.prettyPrint) {
        // Pretty-print with configurable indentation
        const indent = opts.indentSize ?? 2;
        output = JSON.stringify(data, null, indent);
      } else {
        // Minified output - no whitespace
        output = JSON.stringify(data);
      }

      return {
        success: true,
        output
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown serialization error';
      
      return {
        success: false,
        errors: [this.formatErrorMessage(errorMessage, data)]
      };
    }
  }

  /**
   * Format error message to be more user-friendly
   */
  private formatErrorMessage(message: string, data: unknown): string {
    // Check for common serialization issues
    if (message.includes('circular structure')) {
      return 'Cannot serialize data with circular references';
    }
    
    if (message.includes('BigInt')) {
      return 'Cannot serialize BigInt values - convert to string or number first';
    }

    // Check if data contains functions or symbols
    if (typeof data === 'object' && data !== null) {
      const hasUnsupportedTypes = this.checkForUnsupportedTypes(data);
      if (hasUnsupportedTypes) {
        return 'Data contains unsupported types (functions, symbols, or undefined values)';
      }
    }

    return `JSON serialization error: ${message}`;
  }

  /**
   * Check if data contains types that cannot be serialized to JSON
   */
  private checkForUnsupportedTypes(obj: unknown): boolean {
    if (typeof obj === 'function' || typeof obj === 'symbol' || obj === undefined) {
      return true;
    }

    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          if (this.checkForUnsupportedTypes((obj as Record<string, unknown>)[key])) {
            return true;
          }
        }
      }
    }

    return false;
  }
}
