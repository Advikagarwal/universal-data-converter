/**
 * JSON syntax repair functionality
 * Handles common JSON syntax errors including:
 * - Missing commas
 * - Trailing commas
 * - Unclosed quotes
 * - Mismatched brackets/braces
 */

import type { RepairResult, RepairIssue } from '../../types/core';

export function repairJson(input: string): RepairResult {
  const issuesFound: RepairIssue[] = [];
  const appliedFixes: string[] = [];
  let repairedText = input;

  try {
    // Try parsing first - if it works, no repair needed
    JSON.parse(input);
    return {
      success: true,
      repairedText: input,
      issuesFound: [],
      appliedFixes: [],
    };
  } catch {
    // Continue with repair attempts
  }

  // Repair trailing commas
  const trailingCommaResult = repairTrailingCommas(repairedText);
  if (trailingCommaResult.fixed) {
    repairedText = trailingCommaResult.text;
    issuesFound.push(...trailingCommaResult.issues);
    appliedFixes.push(...trailingCommaResult.fixes);
  }

  // Repair missing commas
  const missingCommaResult = repairMissingCommas(repairedText);
  if (missingCommaResult.fixed) {
    repairedText = missingCommaResult.text;
    issuesFound.push(...missingCommaResult.issues);
    appliedFixes.push(...missingCommaResult.fixes);
  }

  // Repair unclosed quotes
  const unclosedQuoteResult = repairUnclosedQuotes(repairedText);
  if (unclosedQuoteResult.fixed) {
    repairedText = unclosedQuoteResult.text;
    issuesFound.push(...unclosedQuoteResult.issues);
    appliedFixes.push(...unclosedQuoteResult.fixes);
  }

  // Repair mismatched brackets/braces
  const bracketResult = repairMismatchedBrackets(repairedText);
  if (bracketResult.fixed) {
    repairedText = bracketResult.text;
    issuesFound.push(...bracketResult.issues);
    appliedFixes.push(...bracketResult.fixes);
  }

  // Try parsing the repaired text
  try {
    JSON.parse(repairedText);
    return {
      success: true,
      repairedText,
      issuesFound,
      appliedFixes,
    };
  } catch {
    return {
      success: false,
      repairedText,
      issuesFound,
      appliedFixes,
    };
  }
}

interface RepairStepResult {
  fixed: boolean;
  text: string;
  issues: RepairIssue[];
  fixes: string[];
}

function repairTrailingCommas(input: string): RepairStepResult {
  const issues: RepairIssue[] = [];
  const fixes: string[] = [];
  
  // Remove trailing commas before closing brackets/braces
  const trailingCommaPattern = /,(\s*[}\]])/g;
  let fixed = false;
  
  const text = input.replace(trailingCommaPattern, (_match, closing, offset) => {
    fixed = true;
    const position = getLineAndColumn(input, offset);
    issues.push({
      line: position.line,
      column: position.column,
      type: 'trailing_comma',
      description: 'Trailing comma before closing bracket',
    });
    fixes.push('Removed trailing comma');
    return closing;
  });

  return { fixed, text, issues, fixes };
}

function repairMissingCommas(input: string): RepairStepResult {
  const issues: RepairIssue[] = [];
  const fixes: string[] = [];
  let text = input;
  let fixed = false;

  // Multiple passes to catch different missing comma patterns
  let previousText = '';
  let iterations = 0;
  const maxIterations = 5;
  
  while (text !== previousText && iterations < maxIterations) {
    previousText = text;
    iterations++;
    
    // Pattern 1: String/number/boolean/null followed by quote
    text = text.replace(/("[^"]*"|\d+|true|false|null)(\s+)(")/g, (_match, value, whitespace, next, offset) => {
      fixed = true;
      const position = getLineAndColumn(input, offset + value.length);
      issues.push({
        line: position.line,
        column: position.column,
        type: 'missing_comma',
        description: 'Missing comma between values',
      });
      fixes.push('Added missing comma');
      return `${value},${whitespace}${next}`;
    });
    
    // Pattern 2: Closing brace/bracket followed by opening quote
    text = text.replace(/([}\]])(\s+)(")/g, (_match, value, whitespace, next, offset) => {
      fixed = true;
      const position = getLineAndColumn(input, offset + value.length);
      issues.push({
        line: position.line,
        column: position.column,
        type: 'missing_comma',
        description: 'Missing comma between values',
      });
      fixes.push('Added missing comma');
      return `${value},${whitespace}${next}`;
    });
    
    // Pattern 3: Closing brace/bracket followed by opening brace/bracket
    text = text.replace(/([}\]])(\s+)([{[])/g, (_match, value, whitespace, next, offset) => {
      fixed = true;
      const position = getLineAndColumn(input, offset + value.length);
      issues.push({
        line: position.line,
        column: position.column,
        type: 'missing_comma',
        description: 'Missing comma between values',
      });
      fixes.push('Added missing comma');
      return `${value},${whitespace}${next}`;
    });
  }

  return { fixed, text, issues, fixes };
}

function repairUnclosedQuotes(input: string): RepairStepResult {
  const issues: RepairIssue[] = [];
  const fixes: string[] = [];
  let fixed = false;
  
  const lines = input.split('\n');
  const repairedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let quoteCount = 0;
    let escaped = false;

    for (let j = 0; j < line.length; j++) {
      if (line[j] === '\\' && !escaped) {
        escaped = true;
        continue;
      }
      if (line[j] === '"' && !escaped) {
        quoteCount++;
      }
      escaped = false;
    }

    // If odd number of quotes, add closing quote at end
    if (quoteCount % 2 !== 0) {
      // Find the last quote position
      const lastQuotePos = line.lastIndexOf('"');
      // Check if there's meaningful content after the last quote
      const afterQuote = line.substring(lastQuotePos + 1).trim();
      
      if (afterQuote && !afterQuote.match(/^[,}\]]/)) {
        line = line + '"';
        fixed = true;
        issues.push({
          line: i + 1,
          column: line.length,
          type: 'unclosed_quote',
          description: 'Unclosed string quote',
        });
        fixes.push('Added closing quote');
      }
    }

    repairedLines.push(line);
  }

  return {
    fixed,
    text: repairedLines.join('\n'),
    issues,
    fixes,
  };
}

function repairMismatchedBrackets(input: string): RepairStepResult {
  const issues: RepairIssue[] = [];
  const fixes: string[] = [];
  const stack: Array<{ char: string; line: number; column: number }> = [];
  let fixed = false;
  
  const lines = input.split('\n');
  let inString = false;
  let escaped = false;

  // Track opening brackets
  for (let i = 0; i < lines.length; i++) {
    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];

      if (char === '\\' && !escaped) {
        escaped = true;
        continue;
      }

      if (char === '"' && !escaped) {
        inString = !inString;
      }

      if (!inString && !escaped) {
        if (char === '{' || char === '[') {
          stack.push({ char, line: i + 1, column: j + 1 });
        } else if (char === '}' || char === ']') {
          const expected = char === '}' ? '{' : '[';
          if (stack.length === 0 || stack[stack.length - 1].char !== expected) {
            // Mismatched bracket
            issues.push({
              line: i + 1,
              column: j + 1,
              type: 'mismatched_bracket',
              description: `Unexpected closing bracket '${char}'`,
            });
          } else {
            stack.pop();
          }
        }
      }

      escaped = false;
    }
  }

  // Add missing closing brackets
  let text = input;
  if (stack.length > 0) {
    fixed = true;
    const closingBrackets = stack.reverse().map(item => {
      const closing = item.char === '{' ? '}' : ']';
      issues.push({
        line: item.line,
        column: item.column,
        type: 'unclosed_bracket',
        description: `Unclosed '${item.char}' bracket`,
      });
      fixes.push(`Added closing '${closing}' bracket`);
      return closing;
    }).join('');
    
    text = input + closingBrackets;
  }

  return { fixed, text, issues, fixes };
}

function getLineAndColumn(text: string, offset: number): { line: number; column: number } {
  const lines = text.substring(0, offset).split('\n');
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
}
