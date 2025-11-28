/**
 * Conversion controller interface definitions
 */

import type { 
  SupportedFormat, 
  ConversionResult, 
  FormatDetectionResult, 
  RepairResult, 
  SchemaResult 
} from './core';

export interface ConversionController {
  convert(input: string, fromFormat: SupportedFormat, toFormat: SupportedFormat): ConversionResult;
  autoDetectFormat(input: string): FormatDetectionResult;
  repairSyntax(input: string, format: SupportedFormat): RepairResult;
  generateSchema(jsonData: unknown, schemaType: 'typescript' | 'json-schema'): SchemaResult;
}