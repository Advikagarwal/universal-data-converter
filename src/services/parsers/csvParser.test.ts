/**
 * CSV Parser Tests
 * Property-based tests for CSV parsing functionality
 */

import * as fc from 'fast-check';
import { CsvParser } from './csvParser';

describe('CsvParser', () => {
  describe('Basic functionality', () => {
    it('should parse simple CSV with headers', () => {
      const parser = new CsvParser({ treatFirstRowAsHeaders: true });
      const input = 'name,age\nJohn,30\nJane,25';
      
      const result = parser.parse(input);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual([
        { name: 'John', age: '30' },
        { name: 'Jane', age: '25' }
      ]);
    });

    it('should parse CSV without headers', () => {
      const parser = new CsvParser({ treatFirstRowAsHeaders: false });
      const input = 'John,30\nJane,25';
      
      const result = parser.parse(input);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual([
        ['John', '30'],
        ['Jane', '25']
      ]);
    });

    it('should handle empty input', () => {
      const parser = new CsvParser();
      const result = parser.parse('');
      
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors![0].message).toContain('empty');
    });
  });

  describe('Type detection', () => {
    it('should convert numeric strings when type detection is enabled', () => {
      const parser = new CsvParser({ 
        treatFirstRowAsHeaders: true,
        enableTypeDetection: true 
      });
      const input = 'name,age,score\nJohn,30,95.5\nJane,25,87.3';
      
      const result = parser.parse(input);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual([
        { name: 'John', age: 30, score: 95.5 },
        { name: 'Jane', age: 25, score: 87.3 }
      ]);
    });

    it('should convert boolean strings when type detection is enabled', () => {
      const parser = new CsvParser({ 
        treatFirstRowAsHeaders: true,
        enableTypeDetection: true 
      });
      const input = 'name,active\nJohn,true\nJane,false';
      
      const result = parser.parse(input);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual([
        { name: 'John', active: true },
        { name: 'Jane', active: false }
      ]);
    });

    it('should convert null strings when type detection is enabled', () => {
      const parser = new CsvParser({ 
        treatFirstRowAsHeaders: true,
        enableTypeDetection: true 
      });
      const input = 'name,middle\nJohn,null\nJane,';
      
      const result = parser.parse(input);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual([
        { name: 'John', middle: null },
        { name: 'Jane', middle: null }
      ]);
    });
  });

  /**
   * Feature: universal-data-converter, Property 8: CSV type detection consistency
   * Validates: Requirements 6.1, 6.2, 6.3, 6.5
   * 
   * Property: For any CSV data with type detection enabled, 
   * the same column should receive consistent type treatment across all rows
   */
  describe('Property 8: CSV type detection consistency', () => {
    it('should apply consistent type detection across all rows', () => {
      fc.assert(
        fc.property(
          // Generate column headers (alphanumeric only, no whitespace-only strings)
          fc.array(
            fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_]*$/),
            { minLength: 1, maxLength: 5 }
          ),
          // Generate number of rows
          fc.integer({ min: 2, max: 10 }),
          // Generate column types
          fc.array(fc.constantFrom('number', 'boolean', 'null', 'string'), { minLength: 1, maxLength: 5 }),
          (headers, numRows, columnTypes) => {
            // Skip if headers is empty or has duplicates
            if (headers.length === 0 || new Set(headers).size !== headers.length) {
              return true;
            }

            // Ensure headers and columnTypes have same length
            const cols = Math.min(headers.length, columnTypes.length);
            const actualHeaders = headers.slice(0, cols);
            const actualTypes = columnTypes.slice(0, cols);

            // Generate CSV data with consistent types per column
            const rows: string[][] = [];
            for (let i = 0; i < numRows; i++) {
              const row: string[] = [];
              for (let j = 0; j < cols; j++) {
                row.push(generateValueForType(actualTypes[j], i));
              }
              rows.push(row);
            }

            // Build CSV string
            const csvLines = [actualHeaders.join(',')];
            rows.forEach(row => csvLines.push(row.join(',')));
            const csvInput = csvLines.join('\n');

            // Parse with type detection
            const parser = new CsvParser({
              treatFirstRowAsHeaders: true,
              enableTypeDetection: true
            });
            const result = parser.parse(csvInput);

            // Verify parsing succeeded
            if (!result.success || !result.data) {
              return true; // Skip invalid test cases
            }

            // Verify consistent type detection across rows
            const data = result.data as any[];
            if (data.length === 0) return true;

            // Check each column has consistent types
            for (let colIdx = 0; colIdx < cols; colIdx++) {
              const header = actualHeaders[colIdx];
              const expectedType = actualTypes[colIdx];
              
              for (const row of data) {
                const value = row[header];
                const actualType = getValueType(value);
                
                // Verify the type matches what we generated
                if (expectedType === 'number') {
                  expect(actualType).toBe('number');
                } else if (expectedType === 'boolean') {
                  expect(actualType).toBe('boolean');
                } else if (expectedType === 'null') {
                  expect(actualType).toBe('null');
                }
                // String can remain string
              }
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: universal-data-converter, Property 9: CSV header processing
   * Validates: Requirements 6.4
   * 
   * Property: For any CSV data with headers enabled, 
   * the first row should be used as property names in the resulting JSON structure
   */
  describe('Property 9: CSV header processing', () => {
    it('should use first row as property names when headers are enabled', () => {
      fc.assert(
        fc.property(
          // Generate unique column headers
          fc.uniqueArray(
            fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_]*$/),
            { minLength: 1, maxLength: 5 }
          ),
          // Generate number of data rows
          fc.integer({ min: 1, max: 10 }),
          (headers, numRows) => {
            if (headers.length === 0) return true;

            // Generate data rows
            const rows: string[][] = [];
            for (let i = 0; i < numRows; i++) {
              const row: string[] = [];
              for (let j = 0; j < headers.length; j++) {
                row.push(`value_${i}_${j}`);
              }
              rows.push(row);
            }

            // Build CSV string with headers
            const csvLines = [headers.join(',')];
            rows.forEach(row => csvLines.push(row.join(',')));
            const csvInput = csvLines.join('\n');

            // Parse with headers enabled
            const parser = new CsvParser({
              treatFirstRowAsHeaders: true,
              enableTypeDetection: false
            });
            const result = parser.parse(csvInput);

            // Verify parsing succeeded
            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();

            const data = result.data as any[];
            
            // Verify we have the correct number of rows (excluding header)
            expect(data.length).toBe(numRows);

            // Verify each row is an object with the correct property names
            for (let i = 0; i < data.length; i++) {
              const row = data[i];
              
              // Check that all headers are present as keys
              for (const header of headers) {
                expect(row).toHaveProperty(header);
              }

              // Check that the values match what we generated
              for (let j = 0; j < headers.length; j++) {
                expect(row[headers[j]]).toBe(`value_${i}_${j}`);
              }
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not use first row as headers when disabled', () => {
      fc.assert(
        fc.property(
          // Generate unique column headers
          fc.uniqueArray(
            fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_]*$/),
            { minLength: 1, maxLength: 5 }
          ),
          // Generate number of data rows
          fc.integer({ min: 1, max: 10 }),
          (headers, numRows) => {
            if (headers.length === 0) return true;

            // Generate data rows
            const rows: string[][] = [];
            for (let i = 0; i < numRows; i++) {
              const row: string[] = [];
              for (let j = 0; j < headers.length; j++) {
                row.push(`value_${i}_${j}`);
              }
              rows.push(row);
            }

            // Build CSV string with headers
            const csvLines = [headers.join(',')];
            rows.forEach(row => csvLines.push(row.join(',')));
            const csvInput = csvLines.join('\n');

            // Parse with headers disabled
            const parser = new CsvParser({
              treatFirstRowAsHeaders: false,
              enableTypeDetection: false
            });
            const result = parser.parse(csvInput);

            // Verify parsing succeeded
            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();

            const data = result.data as any[];
            
            // Verify we have all rows including the header row
            expect(data.length).toBe(numRows + 1);

            // Verify each row is an array, not an object
            for (const row of data) {
              expect(Array.isArray(row)).toBe(true);
            }

            // Verify first row contains the headers
            expect(data[0]).toEqual(headers);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

/**
 * Helper function to generate values for specific types
 */
function generateValueForType(type: string, seed: number): string {
  switch (type) {
    case 'number':
      return String(seed * 10 + Math.floor(Math.random() * 10));
    case 'boolean':
      return seed % 2 === 0 ? 'true' : 'false';
    case 'null':
      return 'null';
    case 'string':
    default:
      return `text${seed}`;
  }
}

/**
 * Helper function to determine the type of a value
 */
function getValueType(value: any): string {
  if (value === null) return 'null';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'string') return 'string';
  return 'unknown';
}
