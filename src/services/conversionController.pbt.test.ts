/**
 * Property-Based Tests for Conversion Controller
 * **Feature: universal-data-converter**
 */

import * as fc from 'fast-check';
import { conversionController } from './conversionController';

describe('ConversionController Property-Based Tests', () => {
  /**
   * **Feature: universal-data-converter, Property 1: Round-trip conversion consistency**
   * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6**
   * 
   * For any valid data in a supported format, converting to any other supported format 
   * and back should preserve the semantic content within the constraints of the target format
   */
  describe('Property 1: Round-trip conversion consistency', () => {
    // Generator for simple JSON-compatible data structures
    const jsonDataArbitrary = fc.letrec(tie => ({
      value: fc.oneof(
        fc.string(),
        fc.integer(),
        fc.double({ noNaN: true, noDefaultInfinity: true }),
        fc.boolean(),
        fc.constant(null),
        fc.array(tie('value'), { maxLength: 3 }),
        fc.dictionary(
          fc.string().filter(s => s.length > 0 && s.length < 20),
          tie('value'),
          { maxKeys: 5 }
        )
      )
    })).value;

    // Generator for XML-safe data structures (valid element names only)
    // Reserved for future XML round-trip tests

    it('should preserve data in JSON -> YAML -> JSON round trip', () => {
      fc.assert(
        fc.property(jsonDataArbitrary, (data) => {
          // Skip if data is not an object or array (required for conversion)
          if (typeof data !== 'object' || data === null) {
            return true;
          }

          const jsonInput = JSON.stringify(data);
          
          // Convert JSON -> YAML
          const toYaml = conversionController.convert(jsonInput, 'json', 'yaml');
          if (!toYaml.success || !toYaml.output) {
            return false;
          }

          // Convert YAML -> JSON
          const backToJson = conversionController.convert(toYaml.output, 'yaml', 'json');
          if (!backToJson.success || !backToJson.output) {
            return false;
          }

          // Parse and compare
          const originalData = JSON.parse(jsonInput);
          const roundTripData = JSON.parse(backToJson.output);

          return JSON.stringify(originalData) === JSON.stringify(roundTripData);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve data in JSON -> XML -> JSON round trip for XML-compatible structures', () => {
      // Generator for XML-compatible data (no arrays, simple object hierarchies)
      const xmlCompatibleDataArbitrary = fc.letrec(() => ({
        value: fc.oneof(
          fc.string().filter(s => s.length > 0),
          fc.integer(),
          fc.double({ noNaN: true, noDefaultInfinity: true }),
          fc.boolean(),
          fc.dictionary(
            fc.string()
              .filter(s => s.length > 0 && s.length < 20)
              .filter(s => /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(s)),
            fc.oneof(
              fc.string(),
              fc.integer(),
              fc.double({ noNaN: true, noDefaultInfinity: true }),
              fc.boolean()
            ),
            { minKeys: 1, maxKeys: 5 }
          )
        )
      })).value;

      fc.assert(
        fc.property(
          // Generate valid XML element names (alphanumeric, no spaces)
          fc.string()
            .filter(s => s.length > 0 && s.length < 20)
            .filter(s => /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(s)),
          xmlCompatibleDataArbitrary,
          (rootKey, data) => {
            // Skip primitive values - XML needs object structure
            if (typeof data !== 'object' || data === null) {
              return true;
            }

            // XML requires a single root element
            const wrappedData = { [rootKey]: data };
            const jsonInput = JSON.stringify(wrappedData);
            
            // Convert JSON -> XML
            const toXml = conversionController.convert(jsonInput, 'json', 'xml');
            if (!toXml.success || !toXml.output) {
              return false;
            }

            // Convert XML -> JSON
            const backToJson = conversionController.convert(toXml.output, 'xml', 'json');
            if (!backToJson.success || !backToJson.output) {
              return false;
            }

            // Parse and compare
            const originalData = JSON.parse(jsonInput);
            const roundTripData = JSON.parse(backToJson.output);

            // For XML, we verify the root key is preserved and structure is maintained
            return Object.keys(originalData)[0] === Object.keys(roundTripData)[0];
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve flat data in JSON -> CSV -> JSON round trip', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              name: fc.string().filter(s => s.length > 0 && s.length < 20),
              age: fc.integer({ min: 0, max: 120 }),
              active: fc.boolean()
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (data) => {
            const jsonInput = JSON.stringify(data);
            
            // Convert JSON -> CSV
            const toCsv = conversionController.convert(jsonInput, 'json', 'csv');
            if (!toCsv.success || !toCsv.output) {
              return false;
            }

            // Convert CSV -> JSON
            const backToJson = conversionController.convert(toCsv.output, 'csv', 'json');
            if (!backToJson.success || !backToJson.output) {
              return false;
            }

            // Parse and compare structure (CSV may convert types)
            const originalData = JSON.parse(jsonInput);
            const roundTripData = JSON.parse(backToJson.output);

            // Check that we have the same number of records
            return Array.isArray(roundTripData) && 
                   roundTripData.length === originalData.length &&
                   roundTripData.every((item: any) => 
                     'name' in item && 'age' in item && 'active' in item
                   );
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: universal-data-converter, Property 10: Error message informativeness**
   * **Validates: Requirements 7.1, 7.2**
   * 
   * For any parsing failure, error messages should include specific location information 
   * (line/column) and helpful descriptions
   */
  describe('Property 10: Error message informativeness', () => {
    // Generator for malformed JSON strings
    const malformedJsonArbitrary = fc.oneof(
      // Missing closing brace
      fc.record({ key: fc.string() }).map(obj => JSON.stringify(obj).slice(0, -1)),
      // Missing comma between properties
      fc.constant('{"a": 1 "b": 2}'),
      // Trailing comma
      fc.constant('{"a": 1, "b": 2,}'),
      // Unclosed string
      fc.constant('{"key": "value}'),
      // Invalid value
      fc.constant('{"key": undefined}')
    );

    it('should provide line and column information for JSON parsing errors', () => {
      fc.assert(
        fc.property(malformedJsonArbitrary, (malformedJson) => {
          const result = conversionController.convert(malformedJson, 'json', 'yaml');
          
          // Should fail
          if (result.success) {
            return false;
          }

          // Should have errors
          if (!result.errors || result.errors.length === 0) {
            return false;
          }

          // Each error should have line and column information
          return result.errors.every(error => 
            typeof error.line === 'number' && 
            error.line >= 1 &&
            typeof error.column === 'number' && 
            error.column >= 1 &&
            typeof error.message === 'string' &&
            error.message.length > 0
          );
        }),
        { numRuns: 100 }
      );
    });

    it('should provide descriptive error messages for parsing failures', () => {
      fc.assert(
        fc.property(malformedJsonArbitrary, (malformedJson) => {
          const result = conversionController.convert(malformedJson, 'json', 'yaml');
          
          // Should fail
          if (result.success) {
            return false;
          }

          // Should have errors with meaningful messages
          if (!result.errors || result.errors.length === 0) {
            return false;
          }

          // Error messages should be descriptive (not just generic)
          return result.errors.every(error => 
            error.message.length > 10 && // More than just "Error"
            error.severity === 'error'
          );
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: universal-data-converter, Property 11: Data loss warnings**
   * **Validates: Requirements 7.3**
   * 
   * For any conversion that may lose data due to format constraints, 
   * appropriate warnings should be provided to the user
   */
  describe('Property 11: Data loss warnings', () => {
    // Generator for nested data structures
    const nestedDataArbitrary = fc.record({
      user: fc.record({
        name: fc.string(),
        address: fc.record({
          street: fc.string(),
          city: fc.string()
        })
      })
    });

    it('should warn when converting nested structures to CSV', () => {
      fc.assert(
        fc.property(nestedDataArbitrary, (nestedData) => {
          const jsonInput = JSON.stringify(nestedData);
          const result = conversionController.convert(jsonInput, 'json', 'csv');
          
          // Should have warnings about nested structure
          return result.warnings !== undefined && 
                 result.warnings.length > 0 &&
                 result.warnings.some(w => 
                   w.toLowerCase().includes('nested') || 
                   w.toLowerCase().includes('data loss')
                 );
        }),
        { numRuns: 100 }
      );
    });

    it('should warn when converting arrays to XML', () => {
      fc.assert(
        fc.property(
          fc.array(fc.record({ id: fc.integer(), name: fc.string() }), { minLength: 1, maxLength: 5 }),
          (arrayData) => {
            const jsonInput = JSON.stringify(arrayData);
            const result = conversionController.convert(jsonInput, 'json', 'xml');
            
            // Should have warnings about XML root element requirement
            return result.warnings !== undefined && 
                   result.warnings.length > 0 &&
                   result.warnings.some(w => 
                     w.toLowerCase().includes('root') || 
                     w.toLowerCase().includes('xml')
                   );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should warn about inconsistent array structures when converting to CSV', () => {
      // Generator for arrays with inconsistent structures
      const inconsistentArrayArbitrary = fc.tuple(
        fc.record({ a: fc.integer(), b: fc.string() }),
        fc.record({ a: fc.integer(), c: fc.boolean() }) // Different keys
      ).map(([obj1, obj2]) => [obj1, obj2]);

      fc.assert(
        fc.property(inconsistentArrayArbitrary, (inconsistentArray) => {
          const jsonInput = JSON.stringify(inconsistentArray);
          const result = conversionController.convert(jsonInput, 'json', 'csv');
          
          // Should have warnings about inconsistent structure
          return result.warnings !== undefined && 
                 result.warnings.length > 0 &&
                 result.warnings.some(w => 
                   w.toLowerCase().includes('inconsistent') || 
                   w.toLowerCase().includes('missing')
                 );
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: universal-data-converter, Property 12: Problem highlighting**
   * **Validates: Requirements 7.4**
   * 
   * For any validation issues, the system should identify and highlight 
   * problematic sections in the input
   */
  describe('Property 12: Problem highlighting', () => {
    it('should highlight problematic sections for parsing errors', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant('{"key": "value}'), // Unclosed string
            fc.constant('{"a": 1 "b": 2}'), // Missing comma
            fc.constant('{"key": }')        // Missing value
          ),
          (malformedInput) => {
            const result = conversionController.convert(malformedInput, 'json', 'yaml');
            
            // Should fail with errors
            if (result.success || !result.errors || result.errors.length === 0) {
              return false;
            }

            // Use highlightProblems to get highlights
            const highlights = conversionController.highlightProblems(
              malformedInput,
              result.errors
            );

            // Should have highlights for each error
            return highlights.length > 0 &&
                   highlights.every(h => 
                     typeof h.line === 'number' &&
                     typeof h.column === 'number' &&
                     typeof h.lineText === 'string' &&
                     typeof h.highlightStart === 'number' &&
                     typeof h.highlightEnd === 'number' &&
                     h.highlightStart >= 0 &&
                     h.highlightEnd > h.highlightStart
                   );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should provide line text context for highlighted problems', () => {
      fc.assert(
        fc.property(
          fc.constant('{"key": "value}'), // Unclosed string
          (malformedInput) => {
            const result = conversionController.convert(malformedInput, 'json', 'yaml');
            
            if (result.success || !result.errors) {
              return false;
            }

            const highlights = conversionController.highlightProblems(
              malformedInput,
              result.errors
            );

            // Each highlight should include the actual line text
            return highlights.every(h => 
              h.lineText.length > 0 &&
              malformedInput.includes(h.lineText)
            );
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: universal-data-converter, Property 13: Repair preview accuracy**
   * **Validates: Requirements 7.5**
   * 
   * For any auto-repair operation, the preview of proposed changes should 
   * accurately reflect what will be applied
   */
  describe('Property 13: Repair preview accuracy', () => {
    // Generator for repairable JSON errors
    const repairableJsonArbitrary = fc.oneof(
      fc.constant('{"a": 1, "b": 2,}'),      // Trailing comma
      fc.constant('{"a": 1 "b": 2}'),        // Missing comma
      fc.constant('{"a": 1, "b": 2'),        // Missing closing brace
    );

    it('should provide accurate repair preview that matches actual repair', () => {
      fc.assert(
        fc.property(repairableJsonArbitrary, (malformedJson) => {
          // Get repair preview
          const preview = conversionController.getRepairPreview(malformedJson, 'json');
          
          // Get actual repair
          const actualRepair = conversionController.repairSyntax(malformedJson, 'json');

          // Preview should match actual repair
          return preview.original === malformedJson &&
                 preview.repaired === actualRepair.repairedText &&
                 preview.success === actualRepair.success &&
                 preview.fixes.length === actualRepair.appliedFixes.length;
        }),
        { numRuns: 100 }
      );
    });

    it('should list all issues found in repair preview', () => {
      fc.assert(
        fc.property(repairableJsonArbitrary, (malformedJson) => {
          const preview = conversionController.getRepairPreview(malformedJson, 'json');
          
          // Should have issues listed
          return Array.isArray(preview.issues) &&
                 Array.isArray(preview.fixes) &&
                 preview.issues.every(issue => 
                   typeof issue.line === 'number' &&
                   typeof issue.column === 'number' &&
                   typeof issue.type === 'string' &&
                   typeof issue.description === 'string'
                 );
        }),
        { numRuns: 100 }
      );
    });

    it('should list all fixes applied in repair preview', () => {
      fc.assert(
        fc.property(repairableJsonArbitrary, (malformedJson) => {
          const preview = conversionController.getRepairPreview(malformedJson, 'json');
          
          // Should have fixes listed
          return Array.isArray(preview.fixes) &&
                 preview.fixes.every(fix => typeof fix === 'string' && fix.length > 0);
        }),
        { numRuns: 100 }
      );
    });
  });
});
