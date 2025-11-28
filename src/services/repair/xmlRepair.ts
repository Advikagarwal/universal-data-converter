/**
 * XML syntax repair functionality
 * Handles basic XML tag closing issues
 */

import type { RepairResult, RepairIssue } from '../../types/core';

export function repairXml(input: string): RepairResult {
  const issuesFound: RepairIssue[] = [];
  const appliedFixes: string[] = [];
  let repairedText = input;

  // Repair unclosed tags
  const tagResult = repairUnclosedTags(repairedText);
  if (tagResult.fixed) {
    repairedText = tagResult.text;
    issuesFound.push(...tagResult.issues);
    appliedFixes.push(...tagResult.fixes);
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

function repairUnclosedTags(input: string): RepairStepResult {
  const issues: RepairIssue[] = [];
  const fixes: string[] = [];
  const stack: Array<{ tag: string; line: number; column: number }> = [];
  let fixed = false;
  let repairedText = input;

  // Simple tag matching (doesn't handle all XML edge cases)
  const tagPattern = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
  const lines = input.split('\n');
  let match;
  let lineNum = 1;
  let lineStart = 0;

  while ((match = tagPattern.exec(input)) !== null) {
    const fullTag = match[0];
    const tagName = match[1];
    const position = match.index;

    // Update line number
    while (lineStart + lines[lineNum - 1].length < position && lineNum < lines.length) {
      lineStart += lines[lineNum - 1].length + 1; // +1 for newline
      lineNum++;
    }

    const column = position - lineStart + 1;

    // Self-closing tag
    if (fullTag.endsWith('/>')) {
      continue;
    }

    // Closing tag
    if (fullTag.startsWith('</')) {
      if (stack.length === 0 || stack[stack.length - 1].tag !== tagName) {
        issues.push({
          line: lineNum,
          column,
          type: 'mismatched_tag',
          description: `Unexpected closing tag '</${tagName}>'`,
        });
      } else {
        stack.pop();
      }
    } else {
      // Opening tag
      stack.push({ tag: tagName, line: lineNum, column });
    }
  }

  // Add missing closing tags
  if (stack.length > 0) {
    fixed = true;
    const closingTags = stack.reverse().map(item => {
      issues.push({
        line: item.line,
        column: item.column,
        type: 'unclosed_tag',
        description: `Unclosed tag '<${item.tag}>'`,
      });
      fixes.push(`Added closing tag '</${item.tag}>'`);
      return `</${item.tag}>`;
    }).join('');
    
    repairedText = input + closingTags;
  }

  return { fixed, text: repairedText, issues, fixes };
}
