/**
 * Test utilities and helper functions
 */

import fc from 'fast-check';
import type { SupportedFormat, ParseResult, SerializationResult } from '../types';

/**
 * Property-based test generators
 */
export const generators = {
  // Generate valid JSON objects
  jsonObject: () => fc.jsonValue(),
  
  // Generate supported format types
  supportedFormat: () => fc.constantFrom('json', 'yaml', 'xml', 'csv') as fc.Arbitrary<SupportedFormat>,
  
  // Generate simple strings for testing
  simpleString: () => fc.string({ minLength: 1, maxLength: 100 }),
  
  // Generate numbers for testing
  number: () => fc.integer({ min: -1000, max: 1000 }),
  
  // Generate boolean values
  boolean: () => fc.boolean(),
  
  // Generate arrays of simple values
  simpleArray: () => fc.array(fc.oneof(
    fc.string(),
    fc.integer(),
    fc.boolean(),
    fc.constant(null)
  ), { minLength: 0, maxLength: 10 }),
  
  // Generate simple objects for CSV conversion
  csvCompatibleObject: () => fc.record({
    name: fc.string(),
    age: fc.integer({ min: 0, max: 120 }),
    active: fc.boolean(),
    score: fc.float({ min: 0, max: 100 })
  })
};

/**
 * Test data factories
 */
export const testData = {
  validJson: '{"name": "test", "value": 42}',
  invalidJson: '{"name": "test", "value": 42',
  validYaml: 'name: test\nvalue: 42',
  validXml: '<root><name>test</name><value>42</value></root>',
  validCsv: 'name,value\ntest,42',
  
  // Common error scenarios
  jsonWithTrailingComma: '{"name": "test", "value": 42,}',
  jsonWithMissingComma: '{"name": "test" "value": 42}',
  jsonWithUnclosedQuote: '{"name": "test, "value": 42}',
  jsonWithMismatchedBraces: '{"name": "test", "value": 42'
};

/**
 * Assertion helpers
 */
export const assertions = {
  isValidParseResult: (result: ParseResult): boolean => {
    return typeof result.success === 'boolean' &&
           (result.success ? result.data !== undefined : result.errors !== undefined);
  },
  
  isValidSerializationResult: (result: SerializationResult): boolean => {
    return typeof result.success === 'boolean' &&
           (result.success ? typeof result.output === 'string' : result.errors !== undefined);
  },
  
  hasValidErrorInfo: (errors: any[]): boolean => {
    return errors.every(error => 
      typeof error.line === 'number' &&
      typeof error.column === 'number' &&
      typeof error.message === 'string'
    );
  }
};

/**
 * Mock implementations for testing
 */
export const mocks = {
  createMockParseResult: (success: boolean, data?: any, errors?: any[]): ParseResult => ({
    success,
    data,
    errors,
    warnings: []
  }),
  
  createMockSerializationResult: (success: boolean, output?: string, errors?: string[]): SerializationResult => ({
    success,
    output,
    errors,
    warnings: []
  })
};

/**
 * Performance testing utilities
 */
export const performanceUtils = {
  measureExecutionTime: async <T>(fn: () => Promise<T> | T): Promise<{ result: T; time: number }> => {
    const start = Date.now();
    const result = await fn();
    const time = Date.now() - start;
    return { result, time };
  },
  
  expectFastExecution: (time: number, maxMs: number = 100): void => {
    expect(time).toBeLessThan(maxMs);
  }
};