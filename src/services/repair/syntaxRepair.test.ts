/**
 * Property-based tests for syntax repair engine
 * **Feature: universal-data-converter, Property 2: Syntax repair effectiveness**
 */

import * as fc from 'fast-check';
import { syntaxRepairEngine } from './syntaxRepairEngine';

describe('SyntaxRepairEngine - Property-Based Tests', () => {
  /**
   * **Feature: universal-data-converter, Property 2: Syntax repair effectiveness**
   * **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
   * 
   * For any data with common syntax errors (missing commas, trailing commas, 
   * unclosed quotes, mismatched brackets), the syntax repair engine should 
   * produce valid, parseable output
   */
  describe('Property 2: Syntax repair effectiveness', () => {
    
    it('should repair JSON with missing commas between object properties', () => {
      fc.assert(
        fc.property(
          fc.record({
            key1: fc.string().filter(s => !s.includes(',')),
            key2: fc.integer(),
            key3: fc.boolean()
          }),
          (obj) => {
            // Create valid JSON first
            const validJson = JSON.stringify(obj);
            
            // Find the first comma that's not inside a string
            let inString = false;
            let commaIndex = -1;
            
            for (let i = 0; i < validJson.length; i++) {
              if (validJson[i] === '"' && (i === 0 || validJson[i - 1] !== '\\')) {
                inString = !inString;
              }
              if (!inString && validJson[i] === ',') {
                commaIndex = i;
                break;
              }
            }
            
            // Skip if no comma found outside strings
            if (commaIndex === -1) {
              return true;
            }
            
            // Remove the comma
            const brokenJson = validJson.substring(0, commaIndex) + ' ' + validJson.substring(commaIndex + 1);
            
            const result = syntaxRepairEngine.repairJson(brokenJson);
            
            // The repair should succeed
            expect(result.success).toBe(true);
            expect(result.repairedText).toBeDefined();
            
            // The repaired text should be valid JSON
            expect(() => JSON.parse(result.repairedText!)).not.toThrow();
            
            // Should report the issue
            expect(result.appliedFixes.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should repair JSON with trailing commas', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer(), { minLength: 2, maxLength: 5 }),
          (arr) => {
            // Create JSON with trailing comma
            const brokenJson = `[${arr.join(',')},]`;
            
            const result = syntaxRepairEngine.repairJson(brokenJson);
            
            // The repair should succeed
            expect(result.success).toBe(true);
            expect(result.repairedText).toBeDefined();
            
            // The repaired text should be valid JSON
            expect(() => JSON.parse(result.repairedText!)).not.toThrow();
            
            // Should report the trailing comma fix
            expect(result.appliedFixes).toContain('Removed trailing comma');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should repair JSON with unclosed quotes in strings', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 3, maxLength: 20 }).filter(s => !s.includes('"') && !s.includes('\n')),
          (str) => {
            // Create JSON with unclosed quote
            const brokenJson = `{"key": "${str}`;
            
            const result = syntaxRepairEngine.repairJson(brokenJson);
            
            // The repair should attempt to fix it
            expect(result.repairedText).toBeDefined();
            
            // Should report issues found
            expect(result.issuesFound.length).toBeGreaterThan(0);
            expect(result.appliedFixes.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should repair JSON with mismatched brackets', () => {
      fc.assert(
        fc.property(
          fc.record({
            key: fc.string(),
            value: fc.integer()
          }),
          (obj) => {
            // Create JSON with missing closing brace
            const validJson = JSON.stringify(obj);
            const brokenJson = validJson.slice(0, -1); // Remove last character (closing brace)
            
            const result = syntaxRepairEngine.repairJson(brokenJson);
            
            // The repair should succeed
            expect(result.success).toBe(true);
            expect(result.repairedText).toBeDefined();
            
            // The repaired text should be valid JSON
            expect(() => JSON.parse(result.repairedText!)).not.toThrow();
            
            // Should report the bracket fix
            expect(result.appliedFixes.some(fix => fix.includes('bracket'))).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle already valid JSON without modification', () => {
      fc.assert(
        fc.property(
          fc.jsonValue(),
          (value) => {
            const validJson = JSON.stringify(value);
            
            const result = syntaxRepairEngine.repairJson(validJson);
            
            // Should succeed without any fixes
            expect(result.success).toBe(true);
            expect(result.repairedText).toBe(validJson);
            expect(result.issuesFound.length).toBe(0);
            expect(result.appliedFixes.length).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should repair CSV with unclosed quotes', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.string({ minLength: 1, maxLength: 10 }).filter(s => !s.includes('"') && !s.includes('\n')),
            { minLength: 2, maxLength: 4 }
          ),
          (row) => {
            // Create CSV with unclosed quote
            const brokenCsv = `"${row[0]},${row.slice(1).join(',')}`;
            
            const result = syntaxRepairEngine.repairCsv(brokenCsv);
            
            // Should report the issue
            expect(result.issuesFound.length).toBeGreaterThan(0);
            expect(result.appliedFixes.some(fix => fix.includes('quote'))).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should repair XML with unclosed tags', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 15 }).filter(s => /^[a-zA-Z][a-zA-Z0-9]*$/.test(s)),
          fc.string({ minLength: 1, maxLength: 30 }).filter(s => !s.includes('<') && !s.includes('>')),
          (tagName, content) => {
            // Create XML with unclosed tag
            const brokenXml = `<${tagName}>${content}`;
            
            const result = syntaxRepairEngine.repairXml(brokenXml);
            
            // Should report the unclosed tag
            expect(result.issuesFound.length).toBeGreaterThan(0);
            expect(result.appliedFixes.some(fix => fix.includes('tag'))).toBe(true);
            
            // The repaired text should have the closing tag
            expect(result.repairedText).toContain(`</${tagName}>`);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should repair YAML with tab characters in indentation', () => {
      fc.assert(
        fc.property(
          fc.record({
            key1: fc.string(),
            key2: fc.integer()
          }),
          (obj) => {
            // Create YAML with tabs
            const brokenYaml = Object.entries(obj)
              .map(([key, value]) => `\t${key}: ${value}`)
              .join('\n');
            
            const result = syntaxRepairEngine.repairYaml(brokenYaml);
            
            // Should report tab character issues
            if (result.issuesFound.length > 0) {
              expect(result.appliedFixes.some(fix => fix.includes('tab'))).toBe(true);
              // Repaired text should not contain tabs
              expect(result.repairedText).not.toContain('\t');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should report all issues found during repair', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer(), { minLength: 2, maxLength: 5 }),
          (arr) => {
            // Create JSON with multiple issues: trailing comma and missing closing bracket
            const brokenJson = `[${arr.join(',')},`;
            
            const result = syntaxRepairEngine.repairJson(brokenJson);
            
            // Should report multiple issues
            expect(result.issuesFound.length).toBeGreaterThan(0);
            expect(result.appliedFixes.length).toBeGreaterThan(0);
            
            // Each issue should have proper structure
            result.issuesFound.forEach(issue => {
              expect(issue).toHaveProperty('line');
              expect(issue).toHaveProperty('column');
              expect(issue).toHaveProperty('type');
              expect(issue).toHaveProperty('description');
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle complex nested JSON with multiple error types', () => {
      fc.assert(
        fc.property(
          fc.record({
            nested: fc.record({
              value: fc.integer()
            }),
            array: fc.array(fc.string(), { minLength: 1, maxLength: 3 })
          }),
          (obj) => {
            // Create valid JSON
            const validJson = JSON.stringify(obj);
            
            // Introduce multiple errors
            let brokenJson = validJson.replace(/,/, ' '); // Missing comma
            brokenJson = brokenJson.replace(/\]/, ',]'); // Trailing comma
            
            const result = syntaxRepairEngine.repairJson(brokenJson);
            
            // Should attempt repair
            expect(result.repairedText).toBeDefined();
            expect(result.issuesFound.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: universal-data-converter, Property 3: Repair reporting completeness**
   * **Validates: Requirements 2.5**
   * 
   * For any syntax repair operation, the system should report all issues 
   * found and fixes applied
   */
  describe('Property 3: Repair reporting completeness', () => {
    
    it('should report all issues and fixes for any repair operation', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            // JSON with trailing comma
            fc.array(fc.integer(), { minLength: 2 }).map(arr => `[${arr.join(',')},]`),
            // JSON with missing bracket
            fc.record({ key: fc.string() }).map(obj => JSON.stringify(obj).slice(0, -1)),
            // CSV with unclosed quote
            fc.string({ minLength: 3 }).filter(s => !s.includes('"')).map(s => `"${s}`)
          ),
          (brokenInput) => {
            // Try repair with JSON first
            const result = syntaxRepairEngine.repairJson(brokenInput);
            
            // If any fixes were applied, issues should be reported
            if (result.appliedFixes.length > 0) {
              expect(result.issuesFound.length).toBeGreaterThan(0);
              
              // Each applied fix should correspond to an issue
              expect(result.appliedFixes.length).toBeGreaterThanOrEqual(result.issuesFound.length);
            }
            
            // If issues were found, they should have complete information
            result.issuesFound.forEach(issue => {
              expect(issue.line).toBeGreaterThan(0);
              expect(issue.column).toBeGreaterThan(0);
              expect(issue.type).toBeTruthy();
              expect(issue.description).toBeTruthy();
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should provide descriptive fix messages', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string(), { minLength: 2, maxLength: 4 }),
          (arr) => {
            // Create JSON with trailing comma
            const brokenJson = `[${arr.map(s => `"${s}"`).join(',')},]`;
            
            const result = syntaxRepairEngine.repairJson(brokenJson);
            
            // Applied fixes should be descriptive
            result.appliedFixes.forEach(fix => {
              expect(typeof fix).toBe('string');
              expect(fix.length).toBeGreaterThan(0);
              // Should contain meaningful words
              expect(/\w+/.test(fix)).toBe(true);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
