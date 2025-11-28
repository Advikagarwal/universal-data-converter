/**
 * Main syntax repair engine
 * Coordinates repair operations for all supported formats
 */

import type { SyntaxRepairEngine } from '../../types/repair';
import type { RepairResult } from '../../types/core';
import { repairJson } from './jsonRepair';
import { repairYaml } from './yamlRepair';
import { repairXml } from './xmlRepair';
import { repairCsv } from './csvRepair';

export class SyntaxRepairEngineImpl implements SyntaxRepairEngine {
  repairJson(input: string): RepairResult {
    return repairJson(input);
  }

  repairYaml(input: string): RepairResult {
    return repairYaml(input);
  }

  repairXml(input: string): RepairResult {
    return repairXml(input);
  }

  repairCsv(input: string): RepairResult {
    return repairCsv(input);
  }
}

// Export singleton instance
export const syntaxRepairEngine = new SyntaxRepairEngineImpl();
