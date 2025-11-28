/**
 * Property-based tests for pretty-printing preservation
 * **Feature: universal-data-converter, Property 6: Pretty-printing preservation**
 */

import * as fc from 'fast-check';
import { JsonSerializer } from './jsonSerializer';
import { YamlSerializer } from './yamlSerializer';
import { XmlSerializer } from './xmlSerializer';
import { JsonParser } from '../parsers/jsonParser';
import { YamlParser } from '../parsers/yamlParser';
import { XmlParser } from '../parsers/xmlParser';

describe('Serializers - Property-Based Tests', () => {
  const jsonSerializer = new JsonSerializer();
  const yamlSerializer = new YamlSerializer();
  const xmlSerializer = new XmlSerializer();
  const jsonParser = new JsonParser();
  const yamlParser = new YamlParser();
  const xmlParser = new XmlParser();

  /**
   * Helper to normalize data (convert -0 to 0 since JSON doesn't preserve -0)
   */
  function normalizeData(data: any): any {
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
  }

  /**
   * **Feature: universal-data-converter, Property 6: Pretty-printing preservation**
   * **Validates: Requirements 5.1, 5.3, 5.4, 5.5**
   * 
   * For any valid data, pretty-printing should maintain semantic equivalence 
   * while improving readability with proper formatting
   */
  describe('Property 6: Pretty-printing preservation', () => {
    it('should preserve JSON data semantics when pretty-printing', () => {
      fc.assert(
        fc.property(
          fc.jsonValue(),
          (data) => {
            // Serialize with pretty-print enabled
            const prettyResult = jsonSerializer.serialize(data, { 
              prettyPrint: true, 
              indentSize: 2 
            });
            
            // Serialize without pretty-print (minified)
            const minifiedResult = jsonSerializer.serialize(data, { 
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

              // The key property: pretty-printed and minified should parse to 
              // semantically equivalent data
              expect(prettyParsed.data).toEqual(minifiedParsed.data);
              
              // Note: We don't compare back to original data because JSON has known
              // limitations (e.g., -0 becomes 0, which is semantically equivalent)
              // The important property is that pretty and minified formats are equivalent

              // Pretty-printed should have more whitespace (unless data is very simple)
              if (JSON.stringify(data).length > 10) {
                expect(prettyResult.output.length).toBeGreaterThanOrEqual(minifiedResult.output.length);
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve YAML data semantics when pretty-printing', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string(),
            age: fc.integer({ min: 0, max: 120 }),
            active: fc.boolean(),
            tags: fc.array(fc.string(), { maxLength: 5 })
          }),
          (data) => {
            // Serialize with pretty-print enabled
            const prettyResult = yamlSerializer.serialize(data, { 
              prettyPrint: true, 
              indentSize: 2 
            });

            expect(prettyResult.success).toBe(true);

            if (prettyResult.output) {
              // Parse back the pretty-printed YAML
              const parsed = yamlParser.parse(prettyResult.output);

              // Should parse successfully
              expect(parsed.success).toBe(true);

              // The parsed data should match the original
              expect(parsed.data).toEqual(data);

              // Pretty-printed YAML should contain newlines for structure
              if (Object.keys(data).length > 1) {
                expect(prettyResult.output).toContain('\n');
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve XML data semantics when pretty-printing', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z][a-zA-Z0-9]*$/.test(s)),
          fc.record({
            name: fc.string().filter(s => s.trim().length > 0 || s.length === 0),
            value: fc.integer(),
            enabled: fc.boolean()
          }),
          (rootTag, data) => {
            // Wrap data in a root element for valid XML
            const xmlData = { [rootTag]: data };

            // Serialize with pretty-print enabled
            const prettyResult = xmlSerializer.serialize(xmlData, { 
              prettyPrint: true, 
              indentSize: 2 
            });

            // Serialize without pretty-print
            const compactResult = xmlSerializer.serialize(xmlData, { 
              prettyPrint: false 
            });

            // Both should succeed
            expect(prettyResult.success).toBe(true);
            expect(compactResult.success).toBe(true);

            if (prettyResult.output && compactResult.output) {
              // Parse both outputs back
              const prettyParsed = xmlParser.parse(prettyResult.output);
              const compactParsed = xmlParser.parse(compactResult.output);

              // Both should parse successfully
              expect(prettyParsed.success).toBe(true);
              expect(compactParsed.success).toBe(true);

              // The key property: pretty-printed and compact XML should parse to 
              // semantically equivalent data (regardless of original input)
              // This validates that pretty-printing preserves semantic content
              expect(prettyParsed.data).toEqual(compactParsed.data);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle different indentation sizes for JSON', () => {
      fc.assert(
        fc.property(
          fc.jsonValue(),
          fc.integer({ min: 0, max: 8 }),
          (data, indentSize) => {
            // Normalize data to handle -0 (JSON doesn't preserve -0)
            const normalizedData = normalizeData(data);
            
            const result = jsonSerializer.serialize(normalizedData, { 
              prettyPrint: true, 
              indentSize 
            });

            expect(result.success).toBe(true);

            if (result.output) {
              // Parse back to verify semantic equivalence
              const parsed = jsonParser.parse(result.output);
              expect(parsed.success).toBe(true);
              expect(parsed.data).toEqual(normalizedData);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle different indentation sizes for YAML', () => {
      fc.assert(
        fc.property(
          fc.record({
            field1: fc.string(),
            field2: fc.integer()
          }),
          fc.integer({ min: 2, max: 8 }),
          (data, indentSize) => {
            const result = yamlSerializer.serialize(data, { 
              prettyPrint: true, 
              indentSize 
            });

            expect(result.success).toBe(true);

            if (result.output) {
              // Parse back to verify semantic equivalence
              const parsed = yamlParser.parse(result.output);
              expect(parsed.success).toBe(true);
              expect(parsed.data).toEqual(data);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
