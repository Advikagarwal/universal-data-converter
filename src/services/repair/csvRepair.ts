/**
 * CSV syntax repair functionality
 * Handles basic CSV delimiter and quote issues
 */

import type { RepairResult, RepairIssue } from '../../types/core';

export function repairCsv(input: string): RepairResult {
  const issuesFound: RepairIssue[] = [];
  const appliedFixes: string[] = [];
  let repairedText = input;

  // Repair unclosed quotes
  const quoteResult = repairUnclosedQuotes(repairedText);
  if (quoteResult.fixed) {
    repairedText = quoteResult.text;
    issuesFound.push(...quoteResult.issues);
    appliedFixes.push(...quoteResult.fixes);
  }

  // Repair inconsistent delimiters
  const delimiterResult = repairInconsistentDelimiters(repairedText);
  if (delimiterResult.fixed) {
    repairedText = delimiterResult.text;
    issuesFound.push(...delimiterResult.issues);
    appliedFixes.push(...delimiterResult.fixes);
  }

  return {
    success: appliedFixes.length > 0,
    repairedText,
    issuesFound,
    appliedFixes,
  };
}

interface RepairStepResult {
  fixed: boolean;
  text: string;
  issues: RepairIssue[];
  fixes: string[];
}

function repairUnclosedQuotes(input: string): RepairStepResult {
  const issues: RepairIssue[] = [];
  const fixes: string[] = [];
  const lines = input.split('\n');
  const repairedLines: string[] = [];
  let fixed = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let quoteCount = 0;

    for (let j = 0; j < line.length; j++) {
      if (line[j] === '"') {
        // Check if it's an escaped quote
        if (j + 1 < line.length && line[j + 1] === '"') {
          j++; // Skip the next quote
          continue;
        }
        quoteCount++;
      }
    }

    // If odd number of quotes, add closing quote at end
    if (quoteCount % 2 !== 0) {
      line = line + '"';
      fixed = true;
      issues.push({
        line: i + 1,
        column: line.length,
        type: 'unclosed_quote',
        description: 'Unclosed quote in CSV field',
      });
      fixes.push('Added closing quote');
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

function repairInconsistentDelimiters(input: string): RepairStepResult {
  const issues: RepairIssue[] = [];
  const fixes: string[] = [];
  const lines = input.split('\n').filter(line => line.trim().length > 0);
  
  if (lines.length === 0) {
    return { fixed: false, text: input, issues, fixes };
  }

  // Detect the most common delimiter
  const delimiters = [',', ';', '\t', '|'];
  const delimiterCounts = new Map<string, number>();

  for (const line of lines) {
    for (const delimiter of delimiters) {
      const count = (line.match(new RegExp(`\\${delimiter}`, 'g')) || []).length;
      delimiterCounts.set(delimiter, (delimiterCounts.get(delimiter) || 0) + count);
    }
  }

  // Find the most common delimiter
  let primaryDelimiter = ',';
  let maxCount = 0;
  
  for (const [delimiter, count] of delimiterCounts.entries()) {
    if (count > maxCount) {
      maxCount = count;
      primaryDelimiter = delimiter;
    }
  }

  // Check if there are inconsistent delimiters
  let fixed = false;
  const repairedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let modified = false;

    for (const delimiter of delimiters) {
      if (delimiter !== primaryDelimiter && line.includes(delimiter)) {
        // Replace with primary delimiter (simple approach)
        const newLine = line.replace(new RegExp(`\\${delimiter}`, 'g'), primaryDelimiter);
        if (newLine !== line) {
          line = newLine;
          modified = true;
          fixed = true;
        }
      }
    }

    if (modified) {
      issues.push({
        line: i + 1,
        column: 1,
        type: 'inconsistent_delimiter',
        description: `Inconsistent delimiter, normalized to '${primaryDelimiter}'`,
      });
      fixes.push(`Normalized delimiter to '${primaryDelimiter}'`);
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
