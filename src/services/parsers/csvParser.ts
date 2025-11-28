/**
 * CSV Parser with papaparse integration
 * Requirements: 1.6, 6.1, 6.2, 6.3, 6.4, 6.5
 */

import * as Papa from 'papaparse';
import type { FormatParser } from '../../types/parser';
import type { ParseResult, ParseError, SupportedFormat, CsvOptions } from '../../types/core';

export class CsvParser implements FormatParser {
  private options: CsvOptions;

  constructor(options: CsvOptions = {}) {
    this.options = {
      hasHeaders: options.hasHeaders ?? true,
      delimiter: options.delimiter ?? ',',
      enableTypeDetection: options.enableTypeDetection ?? false,
      treatFirstRowAsHeaders: options.treatFirstRowAsHeaders ?? true
    };
  }

  getFormatName(): SupportedFormat {
    return 'csv';
  }

  canParse(input: string): boolean {
    if (!input || input.trim().length === 0) {
      return false;
    }

    const trimmed = input.trim();
    
    // Exclude JSON, XML, YAML patterns
    if (trimmed.startsWith('{') || trimmed.startsWith('[') || trimmed.startsWith('<')) {
      return false;
    }

    // Check for CSV patterns: comma-separated values
    const lines = trimmed.split('\n');
    if (lines.length === 0) return false;

    // Check if first line has delimiters
    const delimiter = this.options.delimiter || ',';
    return lines[0].includes(delimiter);
  }

  parse(input: string, options?: CsvOptions): ParseResult {
    // Merge provided options with instance options
    const parseOptions = { ...this.options, ...options };

    if (!input || input.trim().length === 0) {
      return {
        success: false,
        errors: [{
          line: 1,
          column: 1,
          message: 'Input is empty',
          severity: 'error'
        }]
      };
    }

    try {
      const result = Papa.parse(input, {
        header: parseOptions.treatFirstRowAsHeaders,
        delimiter: parseOptions.delimiter,
        skipEmptyLines: true,
        dynamicTyping: false, // We'll handle type detection manually for consistency
        transformHeader: (header: string) => header.trim()
      });

      if (result.errors && result.errors.length > 0) {
        const errors: ParseError[] = result.errors.map(err => ({
          line: err.row !== undefined ? err.row + 1 : 1,
          column: 1,
          message: err.message,
          severity: 'error'
        }));

        return {
          success: false,
          errors
        };
      }

      let data = result.data;

      // Apply type detection if enabled
      if (parseOptions.enableTypeDetection) {
        data = this.applyTypeDetection(data, parseOptions.treatFirstRowAsHeaders || false);
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        errors: [{
          line: 1,
          column: 1,
          message: (error as Error).message,
          severity: 'error'
        }]
      };
    }
  }

  /**
   * Apply type detection to CSV data
   * Requirements: 6.1, 6.2, 6.3, 6.5
   */
  private applyTypeDetection(data: any[], hasHeaders: boolean): any[] {
    if (!Array.isArray(data) || data.length === 0) {
      return data;
    }

    if (hasHeaders) {
      // Data is array of objects
      return data.map(row => this.convertRowTypes(row));
    } else {
      // Data is array of arrays
      return data.map(row => {
        if (Array.isArray(row)) {
          return row.map(value => this.convertValue(value));
        }
        return row;
      });
    }
  }

  /**
   * Convert types for a row object
   */
  private convertRowTypes(row: any): any {
    if (typeof row !== 'object' || row === null) {
      return row;
    }

    const converted: any = {};
    for (const [key, value] of Object.entries(row)) {
      converted[key] = this.convertValue(value);
    }
    return converted;
  }

  /**
   * Convert a single value based on type detection
   * Requirements: 6.1 (numeric), 6.2 (boolean), 6.3 (null)
   */
  private convertValue(value: any): any {
    if (typeof value !== 'string') {
      return value;
    }

    const trimmed = value.trim();

    // Check for null (Requirement 6.3)
    if (trimmed === 'null' || trimmed === 'NULL' || trimmed === '') {
      return null;
    }

    // Check for boolean (Requirement 6.2)
    if (trimmed === 'true' || trimmed === 'TRUE') {
      return true;
    }
    if (trimmed === 'false' || trimmed === 'FALSE') {
      return false;
    }

    // Check for numeric (Requirement 6.1)
    if (this.isNumeric(trimmed)) {
      const num = Number(trimmed);
      if (!isNaN(num) && isFinite(num)) {
        return num;
      }
    }

    // Return original string if no conversion applies
    return value;
  }

  /**
   * Check if a string represents a numeric value
   */
  private isNumeric(value: string): boolean {
    // Match integers and decimals (including negative and scientific notation)
    return /^-?\d+\.?\d*([eE][+-]?\d+)?$/.test(value);
  }

  /**
   * Update parser options
   */
  setOptions(options: CsvOptions): void {
    this.options = { ...this.options, ...options };
  }
}
