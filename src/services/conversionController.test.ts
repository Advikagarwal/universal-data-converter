/**
 * Conversion Controller Tests
 * Basic unit tests for conversion controller functionality
 */

import { conversionController } from './conversionController';

describe('ConversionController', () => {
  describe('Basic Conversion', () => {
    it('should convert JSON to YAML', () => {
      const input = '{"name": "test", "value": 42}';
      const result = conversionController.convert(input, 'json', 'yaml');
      
      expect(result.success).toBe(true);
      expect(result.output).toBeDefined();
      expect(result.output).toContain('name: test');
      expect(result.output).toContain('value: 42');
    });

    it('should convert JSON to XML', () => {
      const input = '{"root": {"name": "test", "value": 42}}';
      const result = conversionController.convert(input, 'json', 'xml');
      
      expect(result.success).toBe(true);
      expect(result.output).toBeDefined();
      expect(result.output).toContain('<root>');
      expect(result.output).toContain('<name>test</name>');
    });

    it('should handle conversion errors gracefully', () => {
      const input = '{invalid json}';
      const result = conversionController.convert(input, 'json', 'yaml');
      
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });
  });

  describe('Format Detection', () => {
    it('should detect JSON format', () => {
      const input = '{"key": "value"}';
      const result = conversionController.autoDetectFormat(input);
      
      expect(result.detectedFormat).toBe('json');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should detect YAML format', () => {
      const input = 'key: value\nother: data';
      const result = conversionController.autoDetectFormat(input);
      
      expect(result.detectedFormat).toBe('yaml');
    });

    it('should detect XML format', () => {
      const input = '<root><item>value</item></root>';
      const result = conversionController.autoDetectFormat(input);
      
      expect(result.detectedFormat).toBe('xml');
    });
  });

  describe('Syntax Repair', () => {
    it('should repair JSON with missing commas', () => {
      const input = '{"a": 1 "b": 2}';
      const result = conversionController.repairSyntax(input, 'json');
      
      expect(result.success).toBe(true);
      expect(result.repairedText).toBeDefined();
    });
  });

  describe('Schema Generation', () => {
    it('should generate TypeScript interface', () => {
      const data = { name: 'test', age: 25, active: true };
      const result = conversionController.generateSchema(data, 'typescript');
      
      expect(result.success).toBe(true);
      expect(result.schema).toContain('interface');
      expect(result.schema).toContain('name: string');
      expect(result.schema).toContain('age: number');
    });

    it('should generate JSON schema', () => {
      const data = { name: 'test', age: 25 };
      const result = conversionController.generateSchema(data, 'json-schema');
      
      expect(result.success).toBe(true);
      expect(result.schema).toContain('"type"');
      expect(result.schema).toContain('"properties"');
    });
  });

  describe('Error Handling', () => {
    it('should provide data loss warnings for nested to CSV conversion', () => {
      const input = '{"user": {"name": "test", "address": {"city": "NYC"}}}';
      const result = conversionController.convert(input, 'json', 'csv');
      
      expect(result.warnings).toBeDefined();
      expect(result.warnings!.length).toBeGreaterThan(0);
    });

    it('should highlight problems in input', () => {
      const input = 'line 1\nline 2\nline 3';
      const errors = [{ line: 2, column: 5 }];
      const highlights = conversionController.highlightProblems(input, errors);
      
      expect(highlights.length).toBe(1);
      expect(highlights[0].line).toBe(2);
      expect(highlights[0].lineText).toBe('line 2');
    });

    it('should provide repair preview', () => {
      const input = '{"a": 1 "b": 2}';
      const preview = conversionController.getRepairPreview(input, 'json');
      
      expect(preview.original).toBe(input);
      expect(preview.repaired).toBeDefined();
      expect(preview.issues).toBeDefined();
      expect(preview.fixes).toBeDefined();
    });
  });
});
