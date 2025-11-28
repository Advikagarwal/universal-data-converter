/**
 * JSON Parser with detailed error handling
 * Requirements: 1.1, 7.1
 */

import type { FormatParser } from '../../types/parser';
import type { ParseResult, ParseError, SupportedFormat } from '../../types/core';

export class JsonParser implements FormatParser {
  getFormatName(): SupportedFormat {
    return 'json';
  }

  canParse(input: string): boolean {
    if (!input || input.trim().length === 0) {
      return false;
    }

    const trimmed = input.trim();
    // JSON must start with { or [
    return (trimmed.startsWith('{') || trimmed.startsWith('['));
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
      const data = JSON.parse(input);
      return {
        success: true,
        data
      };
    } catch (error) {
      const parseError = this.extractErrorInfo(error as Error, input);
      return {
        success: false,
        errors: [parseError]
      };
    }
  }

  /**
   * Extract line and column information from JSON parse errors
   */
  private extractErrorInfo(error: Error, input: string): ParseError {
    const message = error.message;
    
    // Try to extract position from error message
    // JSON.parse errors typically include "at position X"
    const positionMatch = message.match(/position (\d+)/);
    
    if (positionMatch) {
      const position = parseInt(positionMatch[1], 10);
      const { line, column } = this.getLineAndColumn(input, position);
      
      return {
        line,
        column,
        message: this.formatErrorMessage(message),
        severity: 'error'
      };
    }

    // If we can't extract position, return a generic error
    return {
      line: 1,
      column: 1,
      message: this.formatErrorMessage(message),
      severity: 'error'
    };
  }

  /**
   * Convert character position to line and column numbers
   */
  private getLineAndColumn(input: string, position: number): { line: number; column: number } {
    const lines = input.substring(0, position).split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;
    
    return { line, column };
  }

  /**
   * Format error message to be more user-friendly
   */
  private formatErrorMessage(message: string): string {
    // Clean up common JSON error messages
    if (message.includes('Unexpected token')) {
      return message.replace('Unexpected token', 'Unexpected character');
    }
    if (message.includes('Unexpected end of JSON input')) {
      return 'Unexpected end of input - missing closing bracket or brace';
    }
    
    return message;
  }
}
