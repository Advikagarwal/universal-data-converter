/**
 * YAML Parser with js-yaml integration
 * Requirements: 1.4, 7.1
 */

import * as yaml from 'js-yaml';
import type { FormatParser } from '../../types/parser';
import type { ParseResult, ParseError, SupportedFormat } from '../../types/core';

export class YamlParser implements FormatParser {
  getFormatName(): SupportedFormat {
    return 'yaml';
  }

  canParse(input: string): boolean {
    if (!input || input.trim().length === 0) {
      return false;
    }

    // YAML is more flexible - check for common YAML patterns
    const trimmed = input.trim();
    
    // Exclude JSON-like structures
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      return false;
    }

    // Check for YAML indicators: key-value pairs, lists, document markers
    const yamlPatterns = [
      /^[\w-]+:\s*/, // key: value
      /^-\s+/, // list item
      /^---/, // document start
      /^\.\.\.$/ // document end
    ];

    return yamlPatterns.some(pattern => pattern.test(trimmed));
  }

  parse(input: string): ParseResult {
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
      const data = yaml.load(input);
      return {
        success: true,
        data
      };
    } catch (error) {
      const parseError = this.extractErrorInfo(error as yaml.YAMLException);
      return {
        success: false,
        errors: [parseError]
      };
    }
  }

  /**
   * Extract line and column information from YAML parse errors
   */
  private extractErrorInfo(error: yaml.YAMLException): ParseError {
    // js-yaml provides mark property with line and column info
    const line = error.mark?.line !== undefined ? error.mark.line + 1 : 1;
    const column = error.mark?.column !== undefined ? error.mark.column + 1 : 1;
    
    return {
      line,
      column,
      message: this.formatErrorMessage(error.message),
      severity: 'error'
    };
  }

  /**
   * Format error message to be more user-friendly
   */
  private formatErrorMessage(message: string): string {
    // Clean up YAML error messages
    if (message.includes('can not read a block mapping entry')) {
      return 'Invalid indentation or block mapping structure';
    }
    if (message.includes('unexpected end of the stream')) {
      return 'Unexpected end of input - incomplete YAML structure';
    }
    if (message.includes('bad indentation')) {
      return 'Incorrect indentation - YAML requires consistent spacing';
    }
    
    return message;
  }
}
