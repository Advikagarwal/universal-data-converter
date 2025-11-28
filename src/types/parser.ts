/**
 * Parser interface definitions
 */

import type { SupportedFormat, ParseResult } from './core';

export interface FormatParser {
  parse(input: string): ParseResult;
  canParse(input: string): boolean;
  getFormatName(): SupportedFormat;
}