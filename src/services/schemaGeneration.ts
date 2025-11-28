/**
 * Schema Generation Service
 * Main interface for generating TypeScript interfaces and JSON schemas
 */

import type { SchemaResult } from '../types/core';
import { generateTypeScriptInterface } from './schema/typescriptGenerator';
import { generateJsonSchema } from './schema/jsonSchemaGenerator';

export type SchemaType = 'typescript' | 'json-schema';

/**
 * Generates a schema from JSON data
 * @param jsonData - The JSON data to generate schema from
 * @param schemaType - The type of schema to generate ('typescript' or 'json-schema')
 * @param interfaceName - Optional name for TypeScript interface (default: 'Root')
 * @returns SchemaResult with generated schema or errors
 */
export function generateSchema(
  jsonData: unknown,
  schemaType: SchemaType,
  interfaceName: string = 'Root'
): SchemaResult {
  try {
    if (schemaType === 'typescript') {
      return generateTypeScriptInterface(jsonData, interfaceName);
    } else if (schemaType === 'json-schema') {
      return generateJsonSchema(jsonData);
    } else {
      return {
        success: false,
        errors: [`Unsupported schema type: ${schemaType}`]
      };
    }
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error occurred']
    };
  }
}

// Re-export individual generators for direct use
export { generateTypeScriptInterface } from './schema/typescriptGenerator';
export { generateJsonSchema } from './schema/jsonSchemaGenerator';
