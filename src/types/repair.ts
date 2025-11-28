/**
 * Syntax repair engine interface definitions
 */

import type { RepairResult } from './core';

export interface SyntaxRepairEngine {
  repairJson(input: string): RepairResult;
  repairYaml(input: string): RepairResult;
  repairXml(input: string): RepairResult;
  repairCsv(input: string): RepairResult;
}