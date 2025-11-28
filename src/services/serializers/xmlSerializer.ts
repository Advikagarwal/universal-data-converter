/**
 * XML Serializer with fast-xml-parser integration
 * Requirements: 1.3, 5.1, 5.4
 */

import { XMLBuilder } from 'fast-xml-parser';
import type { FormatSerializer } from '../../types/serializer';
import type { SerializationOptions, SerializationResult, SupportedFormat } from '../../types/core';

export class XmlSerializer implements FormatSerializer {
  getFormatName(): SupportedFormat {
    return 'xml';
  }

  getDefaultOptions(): SerializationOptions {
    return {
      prettyPrint: true,
      indentSize: 2
    };
  }

  serialize(data: unknown, options?: SerializationOptions): SerializationResult {
    const opts = { ...this.getDefaultOptions(), ...options };

    try {
      // Validate that data is suitable for XML conversion
      const validationError = this.validateDataForXml(data);
      if (validationError) {
        return {
          success: false,
          errors: [validationError]
        };
      }

      const builder = new XMLBuilder({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        textNodeName: '#text',
        format: opts.prettyPrint,
        indentBy: ' '.repeat(opts.indentSize ?? 2),
        suppressEmptyNode: false,
        suppressBooleanAttributes: false
      });

      const output = builder.build(data);

      return {
        success: true,
        output
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown serialization error';
      
      return {
        success: false,
        errors: [this.formatErrorMessage(errorMessage)]
      };
    }
  }

  /**
   * Validate that data structure is suitable for XML conversion
   */
  private validateDataForXml(data: unknown): string | null {
    if (data === null || data === undefined) {
      return 'Cannot serialize null or undefined to XML';
    }

    if (typeof data !== 'object') {
      return 'XML requires an object structure - primitive values cannot be serialized directly';
    }

    if (Array.isArray(data)) {
      return 'XML requires a root element - arrays cannot be serialized directly. Wrap in an object with a root key.';
    }

    // Check for multiple root elements
    const keys = Object.keys(data);
    if (keys.length === 0) {
      return 'Cannot serialize empty object to XML';
    }

    if (keys.length > 1) {
      return 'XML data has multiple root elements. Consider wrapping in a single root element.';
    }

    return null;
  }

  /**
   * Format error message to be more user-friendly
   */
  private formatErrorMessage(message: string): string {
    if (message.includes('root')) {
      return 'XML requires exactly one root element';
    }

    if (message.includes('attribute')) {
      return 'Invalid attribute structure in data';
    }

    return `XML serialization error: ${message}`;
  }
}
