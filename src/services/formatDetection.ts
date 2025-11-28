/**
 * Format detection service
 */

import type { SupportedFormat, FormatDetectionResult } from '../types';

export class FormatDetectionService {
  /**
   * Automatically detect the format of input data
   */
  detectFormat(input: string): FormatDetectionResult {
    if (!input.trim()) {
      return {
        detectedFormat: null,
        confidence: 0,
        alternatives: []
      };
    }

    const detectionResults = [
      this.detectJson(input),
      this.detectYaml(input),
      this.detectXml(input),
      this.detectCsv(input)
    ].filter(result => result.confidence > 0)
     .sort((a, b) => b.confidence - a.confidence);

    if (detectionResults.length === 0) {
      return {
        detectedFormat: null,
        confidence: 0,
        alternatives: []
      };
    }

    const [primary, ...alternatives] = detectionResults;
    
    return {
      detectedFormat: primary.format,
      confidence: primary.confidence,
      alternatives: alternatives.map(({ format, confidence }) => ({ format, confidence }))
    };
  }

  private detectJson(input: string): { format: SupportedFormat; confidence: number } {
    const trimmed = input.trim();
    let confidence = 0;

    // Check for JSON structure indicators
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
        (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      confidence += 0.4;
    }

    // Check for JSON-specific patterns
    if (/"[^"]*"\s*:\s*/.test(trimmed)) {
      confidence += 0.3;
    }

    // Try parsing as JSON
    try {
      JSON.parse(trimmed);
      confidence += 0.3;
    } catch {
      confidence = Math.max(0, confidence - 0.2);
    }

    return { format: 'json', confidence };
  }

  private detectYaml(input: string): { format: SupportedFormat; confidence: number } {
    const lines = input.split('\n');
    let confidence = 0;

    // Check for YAML indicators
    const yamlPatterns = [
      /^---\s*$/,  // Document separator
      /^\s*-\s+/,  // List items
      /^\s*\w+:\s*/, // Key-value pairs
      /^\s*#/      // Comments
    ];

    let patternMatches = 0;
    for (const line of lines) {
      for (const pattern of yamlPatterns) {
        if (pattern.test(line)) {
          patternMatches++;
          break;
        }
      }
    }

    if (patternMatches > 0) {
      confidence = Math.min(0.8, patternMatches / lines.length * 2);
    }

    // Reduce confidence if it looks like JSON
    if (input.trim().startsWith('{') || input.trim().startsWith('[')) {
      confidence *= 0.3;
    }

    return { format: 'yaml', confidence };
  }

  private detectXml(input: string): { format: SupportedFormat; confidence: number } {
    const trimmed = input.trim();
    let confidence = 0;

    // Check for XML declaration
    if (/^<\?xml/.test(trimmed)) {
      confidence += 0.4;
    }

    // Check for XML tags
    if (/<[^>]+>/.test(trimmed)) {
      confidence += 0.3;
    }

    // Check for proper XML structure
    if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
      confidence += 0.2;
    }

    // Check for closing tags
    if (/<\/[^>]+>/.test(trimmed)) {
      confidence += 0.1;
    }

    return { format: 'xml', confidence };
  }

  private detectCsv(input: string): { format: SupportedFormat; confidence: number } {
    const lines = input.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      return { format: 'csv', confidence: 0 };
    }

    let confidence = 0;
    const firstLine = lines[0];
    const delimiters = [',', ';', '\t', '|'];
    
    for (const delimiter of delimiters) {
      const firstRowCols = firstLine.split(delimiter).length;
      if (firstRowCols > 1) {
        // Check if other rows have similar column count
        const consistentRows = lines.slice(1, Math.min(5, lines.length))
          .filter(line => Math.abs(line.split(delimiter).length - firstRowCols) <= 1)
          .length;
        
        if (consistentRows > 0) {
          confidence = Math.max(confidence, consistentRows / Math.min(4, lines.length - 1) * 0.8);
        }
      }
    }

    // Reduce confidence if it looks like other formats
    if (firstLine.trim().startsWith('<') || firstLine.trim().startsWith('{')) {
      confidence *= 0.2;
    }

    return { format: 'csv', confidence };
  }
}