/**
 * Test to verify Jest and fast-check setup
 */

import fc from 'fast-check';
import { generators, assertions, testData } from './testUtils';

describe('Testing Framework Setup', () => {
  test('Jest is working correctly', () => {
    expect(true).toBe(true);
  });

  test('fast-check is working correctly', () => {
    fc.assert(
      fc.property(fc.integer(), (n) => {
        return n + 0 === n;
      })
    );
  });

  test('test generators are working', () => {
    const format = fc.sample(generators.supportedFormat(), 1)[0];
    expect(['json', 'yaml', 'xml', 'csv']).toContain(format);
  });

  test('test data is accessible', () => {
    expect(testData.validJson).toBeDefined();
    expect(typeof testData.validJson).toBe('string');
  });

  test('assertion helpers are working', () => {
    const validResult = { success: true, data: { test: true } };
    expect(assertions.isValidParseResult(validResult)).toBe(true);
    
    const invalidResult = { success: false, errors: [{ line: 1, column: 1, message: 'test', severity: 'error' as const }] };
    expect(assertions.isValidParseResult(invalidResult)).toBe(true);
  });
});