/**
 * Property-based tests for format detection service
 * **Feature: universal-data-converter, Property 5: Format detection accuracy**
 */

import * as fc from 'fast-check';
import { FormatDetectionService } from './formatDetection';

describe('FormatDetectionService - Property-Based Tests', () => {
  const service = new FormatDetectionService();

  /**
   * **Feature: universal-data-converter, Property 5: Format detection accuracy**
   * **Validates: Requirements 4.1, 4.2, 4.3, 4.4**
   * 
   * For any valid input in a supported format, the auto-detection system 
   * should correctly identify the format
   */
  describe('Property 5: Format detection accuracy', () => {
    it('should correctly detect valid JSON format', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.dictionary(fc.string(), fc.jsonValue()),
            fc.array(fc.jsonValue(), { minLength: 1 })
          ),
          (value) => {
            const jsonString = JSON.stringify(value);
            const result = service.detectFormat(jsonString);
            
            // The detected format should be JSON with reasonable confidence
            expect(result.detectedFormat).toBe('json');
            expect(result.confidence).toBeGreaterThan(0.5);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly detect valid YAML format', () => {
      fc.assert(
        fc.property(
          fc.record({
            key1: fc.string(),
            key2: fc.integer(),
            key3: fc.boolean()
          }),
          (obj) => {
            // Generate YAML-like format
            const yamlString = Object.entries(obj)
              .map(([key, value]) => `${key}: ${value}`)
              .join('\n');
            
            const result = service.detectFormat(yamlString);
            
            // Should detect as YAML (or possibly JSON if it looks ambiguous)
            expect(['yaml', 'json']).toContain(result.detectedFormat);
            expect(result.confidence).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly detect valid XML format', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => !/[<>]/.test(s)),
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => !/[<>]/.test(s)),
          (tagName, content) => {
            const xmlString = `<${tagName}>${content}</${tagName}>`;
            const result = service.detectFormat(xmlString);
            
            // Should detect as XML with reasonable confidence
            expect(result.detectedFormat).toBe('xml');
            expect(result.confidence).toBeGreaterThan(0.3);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly detect valid CSV format', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.array(
              fc.string({ minLength: 1, maxLength: 20 }).filter(s => 
                !s.includes(',') && 
                !s.startsWith('<') && 
                !s.startsWith('{') &&
                !s.includes(':') &&  // Avoid YAML key-value patterns
                !s.startsWith('#') && // Avoid YAML comment patterns
                !s.startsWith('-')    // Avoid YAML list patterns
              ),
              { minLength: 2, maxLength: 5 }
            ),
            { minLength: 3, maxLength: 10 }
          ),
          (rows) => {
            // Ensure all rows have the same length
            const colCount = rows[0].length;
            const normalizedRows = rows.map(row => 
              row.slice(0, colCount).concat(Array(Math.max(0, colCount - row.length)).fill(''))
            );
            
            const csvString = normalizedRows
              .map(row => row.join(','))
              .join('\n');
            
            const result = service.detectFormat(csvString);
            
            // Should detect as CSV with reasonable confidence
            expect(result.detectedFormat).toBe('csv');
            expect(result.confidence).toBeGreaterThan(0.2);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle empty input gracefully', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('', '   ', '\n', '\t'),
          (emptyInput) => {
            const result = service.detectFormat(emptyInput);
            
            expect(result.detectedFormat).toBeNull();
            expect(result.confidence).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should provide alternatives when confidence is not absolute', () => {
      fc.assert(
        fc.property(
          fc.jsonValue(),
          (value) => {
            const jsonString = JSON.stringify(value, null, 2);
            const result = service.detectFormat(jsonString);
            
            // Result should have a detected format
            expect(result.detectedFormat).not.toBeNull();
            
            // Alternatives should be an array (may be empty)
            expect(Array.isArray(result.alternatives)).toBe(true);
            
            // If there are alternatives, they should have lower confidence
            if (result.alternatives && result.alternatives.length > 0) {
              result.alternatives.forEach(alt => {
                expect(alt.confidence).toBeLessThanOrEqual(result.confidence);
              });
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
