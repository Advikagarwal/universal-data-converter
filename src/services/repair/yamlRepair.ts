/**
 * YAML syntax repair functionality
 * Handles basic YAML indentation issues
 */

import type { RepairResult, RepairIssue } from '../../types/core';

export function repairYaml(input: string): RepairResult {
  const issuesFound: RepairIssue[] = [];
  const appliedFixes: string[] = [];
  let repairedText = input;

  // Repair indentation issues
  const indentResult = repairIndentation(repairedText);
  if (indentResult.fixed) {
    repairedText = indentResult.text;
    issuesFound.push(...indentResult.issues);
    appliedFixes.push(...indentResult.fixes);
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

function repairIndentation(input: string): RepairStepResult {
  const issues: RepairIssue[] = [];
  const fixes: string[] = [];
  const lines = input.split('\n');
  const repairedLines: string[] = [];
  let fixed = false;

  // Detect common indentation (2 or 4 spaces)
  const indentSizes = new Map<number, number>();
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().length === 0) {
      repairedLines.push(line);
      continue;
    }

    const leadingSpaces = line.match(/^(\s*)/)?.[1].length || 0;
    if (leadingSpaces > 0) {
      indentSizes.set(leadingSpaces, (indentSizes.get(leadingSpaces) || 0) + 1);
    }

    // Check for tab characters and convert to spaces
    if (line.includes('\t')) {
      fixed = true;
      const repairedLine = line.replace(/\t/g, '  ');
      repairedLines.push(repairedLine);
      issues.push({
        line: i + 1,
        column: 1,
        type: 'tab_character',
        description: 'Tab character in indentation',
      });
      fixes.push('Converted tabs to spaces');
    } else {
      repairedLines.push(line);
    }
  }

  return {
    fixed,
    text: repairedLines.join('\n'),
    issues,
    fixes,
  };
}
