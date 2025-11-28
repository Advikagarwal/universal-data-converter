/**
 * Conversion Controller
 * Main orchestration service for format conversion
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 7.1, 7.2, 7.3, 7.4, 7.5
 */

import type { ConversionController } from '../types/controller';
import type {
  SupportedFormat,
  ConversionResult,
  FormatDetectionResult,
  RepairResult,
  SchemaResult,
  ConversionOptions
} from '../types/core';
import type { FormatParser } from '../types/parser';
import type { FormatSerializer } from '../types/serializer';

import { FormatDetectionService } from './formatDetection';
import { JsonParser } from './parsers/jsonParser';
import { YamlParser } from './parsers/yamlParser';
import { XmlParser } from './parsers/xmlParser';
import { CsvParser } from './parsers/csvParser';
import { JsonSerializer } from './serializers/jsonSerializer';
import { YamlSerializer } from './serializers/yamlSerializer';
import { XmlSerializer } from './serializers/xmlSerializer';
import { CsvSerializer } from './serializers/csvSerializer';
import { syntaxRepairEngine } from './repair/syntaxRepairEngine';
import { generateTypeScriptInterface } from './schema/typescriptGenerator';
import { generateJsonSchema } from './schema/jsonSchemaGenerator';

export class ConversionControllerImpl implements ConversionController {
  private formatDetection: FormatDetectionService;
  private parsers: Map<SupportedFormat, FormatParser>;
  private serializers: Map<SupportedFormat, FormatSerializer>;

  constructor() {
    this.formatDetection = new FormatDetectionService();
    
    // Initialize parsers
    this.parsers = new Map<SupportedFormat, FormatParser>();
    this.parsers.set('json', new JsonParser());
    this.parsers.set('yaml', new YamlParser());
    this.parsers.set('xml', new XmlParser());
    this.parsers.set('csv', new CsvParser());

    // Initialize serializers
    this.serializers = new Map<SupportedFormat, FormatSerializer>();
    this.serializers.set('json', new JsonSerializer());
    this.serializers.set('yaml', new YamlSerializer());
    this.serializers.set('xml', new XmlSerializer());
    this.serializers.set('csv', new CsvSerializer());
  }

  /**
   * Convert data from one format to another
   * Workflow: detect → parse → convert → serialize
   */
  convert(
    input: string,
    fromFormat: SupportedFormat,
    toFormat: SupportedFormat,
    options?: ConversionOptions
  ): ConversionResult {
    const startTime = performance.now();
    let repairApplied = false;
    let workingInput = input;

    // Step 1: Apply syntax repair if requested
    if (options?.repairSyntax) {
      const repairResult = this.repairSyntax(workingInput, fromFormat);
      if (repairResult.success && repairResult.repairedText) {
        workingInput = repairResult.repairedText;
        repairApplied = true;
      }
    }

    // Step 2: Parse input format
    const parser = this.parsers.get(fromFormat);
    if (!parser) {
      return {
        success: false,
        errors: [{
          line: 1,
          column: 1,
          message: `Unsupported input format: ${fromFormat}`,
          severity: 'error'
        }]
      };
    }

    const parseResult = parser.parse(workingInput);
    if (!parseResult.success) {
      return {
        success: false,
        errors: parseResult.errors,
        warnings: parseResult.warnings
      };
    }

    // Step 3: Check for data loss warnings
    const warnings = this.checkDataLossWarnings(
      parseResult.data,
      fromFormat,
      toFormat
    );

    // Step 4: Serialize to target format
    const serializer = this.serializers.get(toFormat);
    if (!serializer) {
      return {
        success: false,
        errors: [{
          line: 1,
          column: 1,
          message: `Unsupported output format: ${toFormat}`,
          severity: 'error'
        }]
      };
    }

    const serializationResult = serializer.serialize(parseResult.data, options);
    if (!serializationResult.success) {
      return {
        success: false,
        errors: serializationResult.errors?.map((msg: string) => ({
          line: 1,
          column: 1,
          message: msg,
          severity: 'error' as const
        })),
        warnings: [...(warnings || []), ...(serializationResult.warnings || [])]
      };
    }

    const processingTime = performance.now() - startTime;

    return {
      success: true,
      output: serializationResult.output,
      warnings: [...(warnings || []), ...(serializationResult.warnings || [])],
      metadata: {
        inputFormat: fromFormat,
        outputFormat: toFormat,
        processingTime,
        dataSize: input.length,
        repairApplied
      }
    };
  }

  /**
   * Automatically detect the format of input data
   */
  autoDetectFormat(input: string): FormatDetectionResult {
    return this.formatDetection.detectFormat(input);
  }

  /**
   * Repair syntax errors in input data
   */
  repairSyntax(input: string, format: SupportedFormat): RepairResult {
    switch (format) {
      case 'json':
        return syntaxRepairEngine.repairJson(input);
      case 'yaml':
        return syntaxRepairEngine.repairYaml(input);
      case 'xml':
        return syntaxRepairEngine.repairXml(input);
      case 'csv':
        return syntaxRepairEngine.repairCsv(input);
      default:
        return {
          success: false,
          issuesFound: [],
          appliedFixes: []
        };
    }
  }

  /**
   * Generate schema from JSON data
   */
  generateSchema(
    jsonData: unknown,
    schemaType: 'typescript' | 'json-schema'
  ): SchemaResult {
    if (schemaType === 'typescript') {
      return generateTypeScriptInterface(jsonData);
    } else {
      return generateJsonSchema(jsonData);
    }
  }

  /**
   * Get repair preview with before/after comparison
   * Requirements: 7.5
   */
  getRepairPreview(input: string, format: SupportedFormat): {
    original: string;
    repaired: string | null;
    issues: Array<{
      line: number;
      column: number;
      type: string;
      description: string;
    }>;
    fixes: string[];
    success: boolean;
  } {
    const repairResult = this.repairSyntax(input, format);
    
    return {
      original: input,
      repaired: repairResult.repairedText || null,
      issues: repairResult.issuesFound,
      fixes: repairResult.appliedFixes,
      success: repairResult.success
    };
  }

  /**
   * Highlight problematic sections in input
   * Requirements: 7.4
   */
  highlightProblems(input: string, errors: Array<{ line: number; column: number }>): Array<{
    line: number;
    column: number;
    lineText: string;
    highlightStart: number;
    highlightEnd: number;
  }> {
    const lines = input.split('\n');
    const highlights: Array<{
      line: number;
      column: number;
      lineText: string;
      highlightStart: number;
      highlightEnd: number;
    }> = [];

    for (const error of errors) {
      const lineIndex = error.line - 1;
      if (lineIndex >= 0 && lineIndex < lines.length) {
        const lineText = lines[lineIndex];
        const highlightStart = Math.max(0, error.column - 1);
        // Highlight the character or token at the error position
        const highlightEnd = Math.min(lineText.length, highlightStart + 10);

        highlights.push({
          line: error.line,
          column: error.column,
          lineText,
          highlightStart,
          highlightEnd
        });
      }
    }

    return highlights;
  }

  /**
   * Check for potential data loss when converting between formats
   * Requirements: 7.3
   */
  private checkDataLossWarnings(
    data: unknown,
    fromFormat: SupportedFormat,
    toFormat: SupportedFormat
  ): string[] {
    const warnings: string[] = [];

    // Converting to CSV can lose nested structure
    if (toFormat === 'csv') {
      if (this.hasNestedStructure(data)) {
        warnings.push(
          'Warning: Converting nested data to CSV may result in data loss. ' +
          'Only flat structures are fully supported in CSV format.'
        );
      }
      
      if (Array.isArray(data) && data.length > 0) {
        const hasInconsistentStructure = this.hasInconsistentArrayStructure(data);
        if (hasInconsistentStructure) {
          warnings.push(
            'Warning: Array elements have inconsistent properties. ' +
            'CSV conversion may result in missing values.'
          );
        }
      }
    }

    // Converting from CSV to other formats
    if (fromFormat === 'csv') {
      warnings.push(
        'Note: CSV type information may be inferred. ' +
        'Enable type detection for automatic conversion of numbers and booleans.'
      );
    }

    // XML has specific structural requirements
    if (toFormat === 'xml') {
      if (Array.isArray(data)) {
        warnings.push(
          'Warning: XML requires a root element. ' +
          'Array data should be wrapped in an object with a root key.'
        );
      } else if (typeof data === 'object' && data !== null) {
        const keys = Object.keys(data);
        if (keys.length > 1) {
          warnings.push(
            'Warning: XML data has multiple root elements. ' +
            'Consider wrapping in a single root element for valid XML.'
          );
        }
      }
    }

    return warnings;
  }

  /**
   * Check if data has nested structure (objects within objects or arrays)
   */
  private hasNestedStructure(data: unknown, depth: number = 0): boolean {
    if (depth > 1) {
      return true;
    }

    if (typeof data === 'object' && data !== null) {
      if (Array.isArray(data)) {
        return data.some(item => this.hasNestedStructure(item, depth + 1));
      } else {
        return Object.values(data).some(value => 
          this.hasNestedStructure(value, depth + 1)
        );
      }
    }

    return false;
  }

  /**
   * Check if array elements have inconsistent structure
   */
  private hasInconsistentArrayStructure(arr: unknown[]): boolean {
    if (arr.length === 0) {
      return false;
    }

    const firstElement = arr[0];
    if (typeof firstElement !== 'object' || firstElement === null) {
      return false;
    }

    const firstKeys = new Set(Object.keys(firstElement));
    
    return arr.slice(1).some(element => {
      if (typeof element !== 'object' || element === null) {
        return true;
      }
      
      const elementKeys = new Set(Object.keys(element));
      
      // Check if keys match
      if (elementKeys.size !== firstKeys.size) {
        return true;
      }
      
      for (const key of firstKeys) {
        if (!elementKeys.has(key)) {
          return true;
        }
      }
      
      return false;
    });
  }
}

// Export singleton instance
export const conversionController = new ConversionControllerImpl();
