/**
 * CSV Serializer with papaparse integration
 * Requirements: 1.6, 5.1
 */

import * as Papa from 'papaparse';
import type { FormatSerializer } from '../../types/serializer';
import type { SerializationOptions, SerializationResult, SupportedFormat } from '../../types/core';

export class CsvSerializer implements FormatSerializer {
  getFormatName(): SupportedFormat {
    return 'csv';
  }

  getDefaultOptions(): SerializationOptions {
    return {
      prettyPrint: false,
      csvOptions: {
        hasHeaders: true,
        delimiter: ',',
        treatFirstRowAsHeaders: true
      }
    };
  }

  serialize(data: unknown, options?: SerializationOptions): SerializationResult {
    const opts = { ...this.getDefaultOptions(), ...options };
    const csvOpts = opts.csvOptions ?? this.getDefaultOptions().csvOptions!;

    try {
      // Validate and prepare data for CSV conversion
      const preparedData = this.prepareDataForCsv(data);
      
      if (typeof preparedData === 'string') {
        // It's an error message
        return {
          success: false,
          errors: [preparedData]
        };
      }

      const warnings: string[] = [];

      // Check for nested structures that will be lost
      if (this.hasNestedStructures(preparedData)) {
        warnings.push('Data contains nested objects or arrays that will be flattened or converted to strings');
      }

      const output = Papa.unparse(preparedData, {
        header: csvOpts.hasHeaders ?? true,
        delimiter: csvOpts.delimiter ?? ',',
        newline: '\n',
        skipEmptyLines: false,
        quotes: true, // Quote fields that need it
        quoteChar: '"',
        escapeChar: '"'
      });

      return {
        success: true,
        output,
        warnings: warnings.length > 0 ? warnings : undefined
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
   * Prepare data for CSV conversion
   * Handles various input formats and flattens nested structures
   */
  private prepareDataForCsv(data: unknown): Record<string, unknown>[] | string {
    if (data === null || data === undefined) {
      return 'Cannot serialize null or undefined to CSV';
    }

    // If it's already an array, use it directly
    if (Array.isArray(data)) {
      if (data.length === 0) {
        return 'Cannot serialize empty array to CSV';
      }
      
      // Flatten each object in the array
      return data.map(item => this.flattenObject(item)) as Record<string, unknown>[];
    }

    // If it's a single object, wrap it in an array
    if (typeof data === 'object') {
      return [this.flattenObject(data) as Record<string, unknown>];
    }

    // Primitive values can't be converted to CSV
    return 'CSV requires an array of objects or a single object - primitive values cannot be serialized';
  }

  /**
   * Flatten nested objects for CSV representation
   */
  private flattenObject(obj: unknown, prefix: string = ''): Record<string, unknown> | unknown {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      // Convert arrays to JSON strings
      return JSON.stringify(obj);
    }

    const flattened: Record<string, unknown> = {};

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (value === null || value === undefined) {
          flattened[newKey] = value;
        } else if (typeof value === 'object' && !Array.isArray(value)) {
          // Recursively flatten nested objects
          const nested = this.flattenObject(value, newKey);
          Object.assign(flattened, nested);
        } else if (Array.isArray(value)) {
          // Convert arrays to JSON strings
          flattened[newKey] = JSON.stringify(value);
        } else {
          flattened[newKey] = value;
        }
      }
    }

    return flattened;
  }

  /**
   * Check if data contains nested structures
   */
  private hasNestedStructures(data: Record<string, unknown>[]): boolean {
    for (const item of data) {
      if (typeof item === 'object' && item !== null) {
        for (const key in item) {
          if (Object.prototype.hasOwnProperty.call(item, key)) {
            const value = item[key];
            if (typeof value === 'object' && value !== null) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  /**
   * Format error message to be more user-friendly
   */
  private formatErrorMessage(message: string): string {
    return `CSV serialization error: ${message}`;
  }
}
