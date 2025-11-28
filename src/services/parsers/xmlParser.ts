/**
 * XML Parser with fast-xml-parser integration
 * Requirements: 1.5, 7.1
 */

import { XMLParser, XMLValidator } from 'fast-xml-parser';
import type { FormatParser } from '../../types/parser';
import type { ParseResult, ParseError, SupportedFormat } from '../../types/core';

export class XmlParser implements FormatParser {
  private parser: XMLParser;

  constructor() {
    // Configure parser for consistent JSON conversion
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      parseAttributeValue: true,
      parseTagValue: true,
      trimValues: true,
      ignoreDeclaration: false,
      allowBooleanAttributes: true
    });
  }

  getFormatName(): SupportedFormat {
    return 'xml';
  }

  canParse(input: string): boolean {
    if (!input || input.trim().length === 0) {
      return false;
    }

    const trimmed = input.trim();
    // XML typically starts with < (either <?xml or <tag)
    return trimmed.startsWith('<');
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

    // First validate the XML
    const validationResult = XMLValidator.validate(input, {
      allowBooleanAttributes: true
    });

    if (validationResult !== true) {
      const parseError = this.extractErrorInfo(validationResult);
      return {
        success: false,
        errors: [parseError]
      };
    }

    try {
      const data = this.parser.parse(input);
      return {
        success: true,
        data
      };
    } catch (error) {
      // Fallback error handling if validation passed but parsing failed
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
   * Extract line and column information from XML validation errors
   */
  private extractErrorInfo(validationError: any): ParseError {
    const error = validationError.err;
    
    // fast-xml-parser provides line and column in error object
    const line = error.line || 1;
    const column = error.col || 1;
    
    return {
      line,
      column,
      message: this.formatErrorMessage(error.msg || error.message || 'XML parsing error'),
      severity: 'error'
    };
  }

  /**
   * Format error message to be more user-friendly
   */
  private formatErrorMessage(message: string): string {
    // Clean up XML error messages
    if (message.includes('Closing tag')) {
      return message.replace('Closing tag', 'Missing or mismatched closing tag');
    }
    if (message.includes('InvalidChar')) {
      return 'Invalid character in XML';
    }
    if (message.includes('Unexpected')) {
      return message;
    }
    
    return message;
  }
}
