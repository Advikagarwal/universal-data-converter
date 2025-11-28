/**
 * Property-based tests for schema generation
 * **Feature: universal-data-converter, Property 4: Schema generation validity**
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
 */

import * as fc from 'fast-check';
import { generateTypeScriptInterface } from './typescriptGenerator';
import { generateJsonSchema } from './jsonSchemaGenerator';

describe('Schema Generation Property Tests', () => {
  /**
   * **Feature: universal-data-converter, Property 4: Schema generation validity**
   * For any valid JSON object, generated TypeScript interfaces and JSON schemas 
   * should be syntactically valid and accurately represent the input structure
   */
  describe('Property 4: Schema generation validity', () => {
    it('should generate syntactically valid TypeScript interfaces for any JSON object', () => {
      // Generator for JSON-compatible objects with valid keys
      const jsonObjectArb = fc.anything({
        key: fc.string()
          .filter(s => s.length > 0 && s.length < 50)
          .filter(s => /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(s)),
        maxDepth: 3,
        withBigInt: false,
        withDate: false,
        withMap: false,
        withSet: false,
        withObjectString: false,
        withNullPrototype: false,
      }).filter(value => {
        // Ensure we only generate objects (not arrays or primitives at root)
        return value !== null && typeof value === 'object' && !Array.isArray(value);
      });

      fc.assert(
        fc.property(jsonObjectArb, (jsonData) => {
          const result = generateTypeScriptInterface(jsonData, 'TestInterface');
          
          // Should succeed
          expect(result.success).toBe(true);
          expect(result.schema).toBeDefined();
          expect(result.errors).toBeUndefined();
          
          if (result.schema) {
            // Should contain interface keyword
            expect(result.schema).toContain('interface');
            expect(result.schema).toContain('TestInterface');
            
            // Should have proper TypeScript syntax (opening and closing braces)
            const interfaceCount = (result.schema.match(/interface/g) || []).length;
            const openBraceCount = (result.schema.match(/{/g) || []).length;
            const closeBraceCount = (result.schema.match(/}/g) || []).length;
            
            // Each interface should have matching braces
            expect(openBraceCount).toBe(interfaceCount);
            expect(closeBraceCount).toBe(interfaceCount);
            
            // Should contain property declarations with colons
            const hasProperties = typeof jsonData === 'object' && jsonData !== null && Object.keys(jsonData).length > 0;
            if (hasProperties) {
              expect(result.schema).toContain(':');
            }
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should generate valid JSON Schema for any JSON value', () => {
      // Generator for any JSON-compatible value (excluding undefined)
      const jsonValueArb = fc.anything({
        maxDepth: 3,
        withBigInt: false,
        withDate: false,
        withMap: false,
        withSet: false,
        withObjectString: false,
        withNullPrototype: false,
      }).filter(value => value !== undefined);

      fc.assert(
        fc.property(jsonValueArb, (jsonData) => {
          const result = generateJsonSchema(jsonData);
          
          // Should succeed
          expect(result.success).toBe(true);
          expect(result.schema).toBeDefined();
          expect(result.errors).toBeUndefined();
          
          if (result.schema) {
            // Should be valid JSON
            expect(() => JSON.parse(result.schema!)).not.toThrow();
            
            const parsedSchema = JSON.parse(result.schema);
            
            // Should have $schema property
            expect(parsedSchema.$schema).toBe('http://json-schema.org/draft-07/schema#');
            
            // Should have type property
            expect(parsedSchema.type).toBeDefined();
            
            // Type should match the input data type
            if (jsonData === null) {
              expect(parsedSchema.type).toBe('null');
            } else if (Array.isArray(jsonData)) {
              expect(parsedSchema.type).toBe('array');
              expect(parsedSchema.items).toBeDefined();
            } else if (typeof jsonData === 'object') {
              expect(parsedSchema.type).toBe('object');
              expect(parsedSchema.properties).toBeDefined();
            } else if (typeof jsonData === 'string') {
              expect(parsedSchema.type).toBe('string');
            } else if (typeof jsonData === 'number') {
              expect(['number', 'integer']).toContain(parsedSchema.type);
            } else if (typeof jsonData === 'boolean') {
              expect(parsedSchema.type).toBe('boolean');
            }
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve nested structure in TypeScript interfaces', () => {
      // Generator for nested objects
      const nestedObjectArb = fc.record({
        name: fc.string(),
        age: fc.integer(),
        address: fc.record({
          street: fc.string(),
          city: fc.string(),
          zipCode: fc.integer()
        }),
        tags: fc.array(fc.string())
      });

      fc.assert(
        fc.property(nestedObjectArb, (jsonData) => {
          const result = generateTypeScriptInterface(jsonData, 'Person');
          
          expect(result.success).toBe(true);
          expect(result.schema).toBeDefined();
          
          if (result.schema) {
            // Should have main interface
            expect(result.schema).toContain('interface Person');
            
            // Should have nested interface for address
            expect(result.schema).toContain('interface Address');
            
            // Should reference the nested interface
            expect(result.schema).toContain('address: Address');
            
            // Should handle arrays (either typed or any[] for empty arrays)
            expect(result.schema).toMatch(/tags:\s*(string\[\]|any\[\])/);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve nested structure in JSON Schema', () => {
      // Generator for nested objects
      const nestedObjectArb = fc.record({
        id: fc.integer(),
        data: fc.record({
          value: fc.string(),
          count: fc.integer()
        }),
        items: fc.array(fc.integer())
      });

      fc.assert(
        fc.property(nestedObjectArb, (jsonData) => {
          const result = generateJsonSchema(jsonData);
          
          expect(result.success).toBe(true);
          expect(result.schema).toBeDefined();
          
          if (result.schema) {
            const parsedSchema = JSON.parse(result.schema);
            
            // Should be object type
            expect(parsedSchema.type).toBe('object');
            
            // Should have properties for all keys
            expect(parsedSchema.properties).toBeDefined();
            expect(parsedSchema.properties.id).toBeDefined();
            expect(parsedSchema.properties.data).toBeDefined();
            expect(parsedSchema.properties.items).toBeDefined();
            
            // Nested object should have nested schema
            expect(parsedSchema.properties.data.type).toBe('object');
            expect(parsedSchema.properties.data.properties).toBeDefined();
            expect(parsedSchema.properties.data.properties.value).toBeDefined();
            expect(parsedSchema.properties.data.properties.count).toBeDefined();
            
            // Array should have items schema
            expect(parsedSchema.properties.items.type).toBe('array');
            expect(parsedSchema.properties.items.items).toBeDefined();
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should handle arrays with proper type inference in TypeScript', () => {
      // Generator for objects with various array types (non-empty to allow type inference)
      const arrayObjectArb = fc.record({
        numbers: fc.array(fc.integer(), { minLength: 1 }),
        strings: fc.array(fc.string(), { minLength: 1 }),
        booleans: fc.array(fc.boolean(), { minLength: 1 }),
        mixed: fc.array(fc.oneof(fc.integer(), fc.string()), { minLength: 1 })
      });

      fc.assert(
        fc.property(arrayObjectArb, (jsonData) => {
          const result = generateTypeScriptInterface(jsonData, 'ArrayTest');
          
          expect(result.success).toBe(true);
          expect(result.schema).toBeDefined();
          
          if (result.schema) {
            // Should contain array type annotations
            expect(result.schema).toMatch(/numbers:\s*number\[\]/);
            expect(result.schema).toMatch(/strings:\s*string\[\]/);
            expect(result.schema).toMatch(/booleans:\s*boolean\[\]/);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should handle arrays with proper type inference in JSON Schema', () => {
      // Generator for arrays with consistent types
      const arrayArb = fc.oneof(
        fc.array(fc.integer()),
        fc.array(fc.string()),
        fc.array(fc.boolean())
      );

      fc.assert(
        fc.property(arrayArb, (jsonData) => {
          const result = generateJsonSchema(jsonData);
          
          expect(result.success).toBe(true);
          expect(result.schema).toBeDefined();
          
          if (result.schema) {
            const parsedSchema = JSON.parse(result.schema);
            
            expect(parsedSchema.type).toBe('array');
            expect(parsedSchema.items).toBeDefined();
            
            // Items should have a type
            if (parsedSchema.items.type) {
              expect(['string', 'number', 'integer', 'boolean']).toContain(parsedSchema.items.type);
            } else if (parsedSchema.items.anyOf) {
              // Mixed types should use anyOf
              expect(Array.isArray(parsedSchema.items.anyOf)).toBe(true);
            }
          }
        }),
        { numRuns: 100 }
      );
    });
  });
});
