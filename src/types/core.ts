/**
 * Core type definitions for the Universal Data Format Converter
 */

export type SupportedFormat = 'json' | 'yaml' | 'xml' | 'csv';

export interface ParseError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning';
}

export interface ParseResult {
  success: boolean;
  data?: unknown;
  errors?: ParseError[];
  warnings?: string[];
}

export interface SerializationOptions {
  prettyPrint?: boolean;
  indentSize?: number;
  csvOptions?: CsvOptions;
}

export interface CsvOptions {
  hasHeaders?: boolean;
  delimiter?: string;
  enableTypeDetection?: boolean;
  treatFirstRowAsHeaders?: boolean;
}

export interface SerializationResult {
  success: boolean;
  output?: string;
  errors?: string[];
  warnings?: string[];
}

export interface ConversionRequest {
  input: string;
  fromFormat: SupportedFormat;
  toFormat: SupportedFormat;
  options?: ConversionOptions;
}

export interface ConversionOptions {
  prettyPrint?: boolean;
  indentSize?: number;
  csvOptions?: CsvOptions;
  repairSyntax?: boolean;
}

export interface ConversionMetadata {
  inputFormat: SupportedFormat;
  outputFormat: SupportedFormat;
  processingTime: number;
  dataSize: number;
  repairApplied: boolean;
}

export interface ConversionResult {
  success: boolean;
  output?: string;
  errors?: ParseError[];
  warnings?: string[];
  metadata?: ConversionMetadata;
}

export interface RepairIssue {
  line: number;
  column: number;
  type: string;
  description: string;
}

export interface RepairResult {
  success: boolean;
  repairedText?: string;
  issuesFound: RepairIssue[];
  appliedFixes: string[];
}

export interface FormatDetectionResult {
  detectedFormat: SupportedFormat | null;
  confidence: number;
  alternatives?: Array<{
    format: SupportedFormat;
    confidence: number;
  }>;
}

export interface SchemaResult {
  success: boolean;
  schema?: string;
  errors?: string[];
}