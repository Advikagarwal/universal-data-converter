/**
 * Property-based tests for minification preservation
 * **Feature: universal-data-converter, Property 7: Minification preservation**
 */

import * as fc from 'fast-check';
import { JsonSerializer } from './jsonSerializer';
import { JsonParser } from '../parsers/jsonParser';

describe('Serializers - Minification Tests', () => {
  const jsonSerializer = new JsonSerializer();
  const jsonParser = new JsonParser();

  // Helper to normalize data (convert -0 to 0 since JSON doesn't preserve -0)
  const normalizeData = (data: any): any => {
    if (data === null || data === undefined) return data;
    if (typeof data === 'number') return Object.is(data, -0) ? 0 : data;
    if (Array.isArray(data)) return data.map(normalizeData);
    if (typeof data === 'object') {
      const normalized: any = {};
      for (const key in data) {
        normalized[key] = normalizeData(data[key]);
      }
      return normalized;
    }
    return data;
  };

  /**
   * **Feature: universal-data-converter, Property 7: Minification preservation**
   * **Validates: Requirements 5.2**
   * 
   * For any valid formatted data, minification should preserve semantic content 
   * while removing unnecessary whitespace
   */
  describe('Property 7: Minification preservation', () => {
    it('should preserve JSON data semantics when minifying', () => {
      fc.assert(
        fc.property(
          fc.jsonValue(),
          (data) => {
            // Normalize data to handle -0 (JSON doesn't preserve -0)
            const normalizedData = normalizeData(data);
            
            // Serialize with pretty-print enabled (formatted)
            const prettyResult = jsonSerializer.serialize(normalizedData, { 
              prettyPrint: true, 
              indentSize: 2 
            });
            
            // Serialize with minification (no pretty-print)
            const minifiedResult = jsonSerializer.serialize(normalizedData, { 
              prettyPrint: false 
            });

            // Both should succeed
            expect(prettyResult.success).toBe(true);
            expect(minifiedResult.success).toBe(true);

            if (prettyResult.output && minifiedResult.output) {
              // Parse both outputs back
              const prettyParsed = jsonParser.parse(prettyResult.output);
              const minifiedParsed = jsonParser.parse(minifiedResult.output);

              // Both should parse successfully
              expect(prettyParsed.success).toBe(true);
              expect(minifiedParsed.success).toBe(true);

              // The parsed data should be semantically equivalent
              expect(prettyParsed.data).toEqual(minifiedParsed.data);
              expect(minifiedParsed.data).toEqual(normalizedData);

              // Minified should be smaller or equal in size (unless data is trivial)
              const dataStr = JSON.stringify(normalizedData);
              if (dataStr.length > 10) {
                expect(minifiedResult.output.length).toBeLessThanOrEqual(prettyResult.output.length);
              }

              // Minified output should not contain newlines outside of strings
              expect(minifiedResult.output).not.toContain('\n');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should produce compact output without indentation', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string(),
            age: fc.integer({ min: 0, max: 120 }),
            tags: fc.array(fc.string(), { maxLength: 5 }),
            nested: fc.record({
              value: fc.integer(),
              flag: fc.boolean()
            })
          }),
          (data) => {
            const minifiedResult = jsonSerializer.serialize(data, { 
              prettyPrint: false 
            });

            expect(minifiedResult.success).toBe(true);

            if (minifiedResult.output) {
              // Minified output should not contain newlines or indentation
              expect(minifiedResult.output).not.toContain('\n');
              
              // Should still be valid JSON
              const parsed = jsonParser.parse(minifiedResult.output);
              expect(parsed.success).toBe(true);
              expect(parsed.data).toEqual(data);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle edge cases in minification', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(null),
            fc.constant(true),
            fc.constant(false),
            fc.constant(0),
            fc.constant(''),
            fc.constant([]),
            fc.constant({})
          ),
          (data) => {
            const minifiedResult = jsonSerializer.serialize(data, { 
              prettyPrint: false 
            });

            expect(minifiedResult.success).toBe(true);

            if (minifiedResult.output) {
              const parsed = jsonParser.parse(minifiedResult.output);
              expect(parsed.success).toBe(true);
              expect(parsed.data).toEqual(data);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve string content including whitespace within strings', () => {
      fc.assert(
        fc.property(
          fc.record({
            text: fc.string(),
            multiline: fc.constantFrom('line1\nline2', 'text with  spaces', '\t\ttabs'),
            normal: fc.string()
          }),
          (data) => {
            const minifiedResult = jsonSerializer.serialize(data, { 
              prettyPrint: false 
            });

            expect(minifiedResult.success).toBe(true);

            if (minifiedResult.output) {
              const parsed = jsonParser.parse(minifiedResult.output);
              expect(parsed.success).toBe(true);
              
              // String content should be preserved exactly
              expect(parsed.data).toEqual(data);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should produce output that is smaller than pretty-printed version', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.integer(),
              name: fc.string({ minLength: 5 }),
              data: fc.array(fc.integer(), { minLength: 3, maxLength: 10 })
            }),
            { minLength: 3, maxLength: 10 }
          ),
          (data) => {
            const prettyResult = jsonSerializer.serialize(data, { 
              prettyPrint: true, 
              indentSize: 2 
            });
            
            const minifiedResult = jsonSerializer.serialize(data, { 
              prettyPrint: false 
            });

            expect(prettyResult.success).toBe(true);
            expect(minifiedResult.success).toBe(true);

            if (prettyResult.output && minifiedResult.output) {
              // Minified should be significantly smaller for non-trivial data
              expect(minifiedResult.output.length).toBeLessThan(prettyResult.output.length);
              
              // Both should parse to the same data
              const prettyParsed = jsonParser.parse(prettyResult.output);
              const minifiedParsed = jsonParser.parse(minifiedResult.output);
              
              expect(prettyParsed.data).toEqual(minifiedParsed.data);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
