/**
 * Serializer interface definitions
 */

import type { SupportedFormat, SerializationOptions, SerializationResult } from './core';

export interface FormatSerializer {
  serialize(data: unknown, options?: SerializationOptions): SerializationResult;
  getFormatName(): SupportedFormat;
  getDefaultOptions(): SerializationOptions;
}