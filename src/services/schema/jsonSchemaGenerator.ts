/**
 * JSON Schema Generator
 * Generates JSON Schema specification compliant schemas from JSON objects
 */

import type { SchemaResult } from '../../types/core';

interface JsonSchema {
  $schema?: string;
  type?: string;
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  anyOf?: JsonSchema[];
  required?: string[];
  additionalProperties?: boolean;
  [key: string]: unknown;
}

/**
 * Infers JSON Schema type from a value
 */
function inferJsonSchemaType(value: unknown): JsonSchema {
  if (value === null) {
    return { type: 'null' };
  }

  const type = typeof value;

  switch (type) {
    case 'string':
      return { type: 'string' };
    case 'number':
      return Number.isInteger(value) 
        ? { type: 'integer' }
        : { type: 'number' };
    case 'boolean':
      return { type: 'boolean' };
    case 'object':
      if (Array.isArray(value)) {
        return inferArraySchema(value);
      }
      return inferObjectSchema(value as Record<string, unknown>);
    default:
      return { type: 'null' };
  }
}

/**
 * Infers JSON Schema for an array
 */
function inferArraySchema(arr: unknown[]): JsonSchema {
  if (arr.length === 0) {
    return {
      type: 'array',
      items: {}
    };
  }

  // Analyze all elements to determine item schema
  const elementSchemas = arr.map(item => inferJsonSchemaType(item));
  
  // Check if all elements have the same type
  const firstType = elementSchemas[0].type;
  const allSameType = elementSchemas.every(schema => schema.type === firstType);

  if (allSameType) {
    // Use the first element's schema as the item schema
    return {
      type: 'array',
      items: elementSchemas[0]
    };
  }

  // Mixed types - use anyOf
  const uniqueSchemas = new Map<string, JsonSchema>();
  elementSchemas.forEach(schema => {
    const key = JSON.stringify(schema);
    if (!uniqueSchemas.has(key)) {
      uniqueSchemas.set(key, schema);
    }
  });

  return {
    type: 'array',
    items: {
      anyOf: Array.from(uniqueSchemas.values())
    }
  };
}

/**
 * Infers JSON Schema for an object
 */
function inferObjectSchema(obj: Record<string, unknown>): JsonSchema {
  const properties: Record<string, JsonSchema> = {};
  const required: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    properties[key] = inferJsonSchemaType(value);
    // Mark all existing properties as required
    required.push(key);
  }

  return {
    type: 'object',
    properties,
    required: required.length > 0 ? required : undefined,
    additionalProperties: false
  };
}

/**
 * Generates JSON Schema from JSON data
 */
export function generateJsonSchema(
  jsonData: unknown,
  includeSchemaVersion: boolean = true
): SchemaResult {
  try {
    if (jsonData === undefined) {
      return {
        success: false,
        errors: ['Input data is undefined']
      };
    }

    const schema = inferJsonSchemaType(jsonData);

    // Add JSON Schema version if requested
    if (includeSchemaVersion) {
      schema.$schema = 'http://json-schema.org/draft-07/schema#';
    }

    // Format the schema as pretty-printed JSON
    const schemaString = JSON.stringify(schema, null, 2);

    return {
      success: true,
      schema: schemaString
    };
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error occurred']
    };
  }
}
