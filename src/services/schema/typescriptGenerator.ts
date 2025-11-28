/**
 * TypeScript Interface Generator
 * Generates TypeScript interface definitions from JSON objects
 */

import type { SchemaResult } from '../../types/core';

/**
 * Infers TypeScript type from a value
 */
function inferType(value: unknown, key?: string): string {
  if (value === null) {
    return 'null';
  }

  const type = typeof value;

  switch (type) {
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'undefined':
      return 'undefined';
    case 'object':
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return 'any[]';
        }
        // Infer array element type from first element
        const elementType = inferType(value[0]);
        // Check if all elements have the same type
        const allSameType = value.every(item => inferType(item) === elementType);
        if (allSameType) {
          return `${elementType}[]`;
        }
        // Mixed types - use union
        const uniqueTypes = [...new Set(value.map(item => inferType(item)))];
        return `(${uniqueTypes.join(' | ')})[]`;
      }
      // Nested object - will be handled separately
      return key ? toPascalCase(key) : 'object';
    default:
      return 'any';
  }
}

/**
 * Converts a string to PascalCase for interface names
 */
function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
    .replace(/^[a-z]/, char => char.toUpperCase());
}

/**
 * Generates TypeScript interface from an object
 */
function generateInterface(
  obj: Record<string, unknown>,
  interfaceName: string,
  indent: number = 0
): string {
  const indentStr = '  '.repeat(indent);
  const propIndentStr = '  '.repeat(indent + 1);
  
  let result = `${indentStr}interface ${interfaceName} {\n`;

  for (const [key, value] of Object.entries(obj)) {
    // Escape special characters in key for safe property names
    const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) 
      ? key 
      : `"${key.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
    
    if (value === null || value === undefined) {
      result += `${propIndentStr}${safeKey}: null;\n`;
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      // Nested object
      const nestedInterfaceName = toPascalCase(key);
      result += `${propIndentStr}${safeKey}: ${nestedInterfaceName};\n`;
    } else {
      const type = inferType(value, key);
      result += `${propIndentStr}${safeKey}: ${type};\n`;
    }
  }

  result += `${indentStr}}`;
  return result;
}

/**
 * Collects all nested interfaces from an object
 */
function collectNestedInterfaces(
  obj: Record<string, unknown>
): Map<string, Record<string, unknown>> {
  const interfaces = new Map<string, Record<string, unknown>>();

  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      const interfaceName = toPascalCase(key);
      interfaces.set(interfaceName, value as Record<string, unknown>);
      
      // Recursively collect nested interfaces
      const nested = collectNestedInterfaces(value as Record<string, unknown>);
      nested.forEach((nestedObj, nestedName) => {
        interfaces.set(nestedName, nestedObj);
      });
    } else if (Array.isArray(value) && value.length > 0) {
      // Check if array contains objects
      const firstElement = value[0];
      if (firstElement !== null && typeof firstElement === 'object' && !Array.isArray(firstElement)) {
        const interfaceName = toPascalCase(key.replace(/s$/, '')); // Remove trailing 's' for singular
        interfaces.set(interfaceName, firstElement);
        
        // Recursively collect nested interfaces from array element
        const nested = collectNestedInterfaces(firstElement);
        nested.forEach((nestedObj, nestedName) => {
          interfaces.set(nestedName, nestedObj);
        });
      }
    }
  }

  return interfaces;
}

/**
 * Generates TypeScript interface definition from JSON data
 */
export function generateTypeScriptInterface(
  jsonData: unknown,
  rootInterfaceName: string = 'Root'
): SchemaResult {
  try {
    if (typeof jsonData !== 'object' || jsonData === null) {
      return {
        success: false,
        errors: ['Input must be a valid JSON object']
      };
    }

    if (Array.isArray(jsonData)) {
      return {
        success: false,
        errors: ['Root level arrays are not supported. Please provide an object.']
      };
    }

    // Collect all nested interfaces
    const nestedInterfaces = collectNestedInterfaces(jsonData as Record<string, unknown>);
    
    // Generate all nested interfaces first
    const interfaceDefinitions: string[] = [];
    
    nestedInterfaces.forEach((obj, name) => {
      interfaceDefinitions.push(generateInterface(obj, name, 0));
    });

    // Generate root interface
    const rootInterface = generateInterface(jsonData as Record<string, unknown>, rootInterfaceName, 0);
    
    // Combine all interfaces
    const allInterfaces = [...interfaceDefinitions, rootInterface].join('\n\n');

    return {
      success: true,
      schema: allInterfaces
    };
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error occurred']
    };
  }
}
