/**
 * UnitRepair - Repair utility for scenario storage
 *
 * Fixes flat files in scenarios/index/ that should be in 5-level UUID subdirectories.
 *
 * Web4 Principles:
 * - P4: Radical OOP
 * - P6: Empty constructor
 * - P16: Object-Action naming
 */

import * as fs from 'fs';
import * as path from 'path';

export class UnitRepair {

  /**
   * Scan scenarios/index/ for flat files and move them into correct 5-level UUID folders.
   *
   * Flat files match: {uuid}.scenario.json or {uuid}.type.scenario.json at index/ root.
   * Correct location: index/{a}/{b}/{c}/{d}/{e}/{uuid}.scenario.json
   *
   * @param indexDir Absolute path to scenarios/index/
   * @returns Number of files moved
   */
  static async flatFilesRepair(indexDir: string, limit: number = 0): Promise<number> {
    let moved = 0;

    const entries = await fs.promises.readdir(indexDir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isFile()) continue;
      if (!entry.name.endsWith('.scenario.json')) continue;

      // Extract UUID from filename
      // Patterns: {uuid}.scenario.json or {uuid}.type.scenario.json
      const uuidMatch = entry.name.match(/^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
      if (!uuidMatch) continue;

      const uuid = uuidMatch[1];
      const sourcePath = path.join(indexDir, entry.name);

      // Compute 5-level folder path
      const cleanUuid = uuid.replace(/-/g, '');
      const folderParts = cleanUuid.substring(0, 5).split('');
      const targetDir = path.join(indexDir, ...folderParts);
      const targetFilename = `${uuid}.scenario.json`;
      const targetPath = path.join(targetDir, targetFilename);

      // Skip if target already exists
      if (fs.existsSync(targetPath)) {
        console.log(`[UnitRepair] SKIP (target exists): ${entry.name}`);
        continue;
      }

      // Read and update the JSON
      const content = await fs.promises.readFile(sourcePath, 'utf-8');
      let scenario: any;
      try {
        scenario = JSON.parse(content);
      } catch {
        console.log(`[UnitRepair] SKIP (invalid JSON): ${entry.name}`);
        continue;
      }

      // Update indexPath inside the scenario model
      if (scenario.model && typeof scenario.model === 'object') {
        scenario.model.indexPath = targetPath;
      }
      if (scenario.unit && typeof scenario.unit === 'object') {
        scenario.unit.indexPath = targetPath;
      }

      // Create target directory
      await fs.promises.mkdir(targetDir, { recursive: true });

      // Write corrected file to target
      await fs.promises.writeFile(targetPath, JSON.stringify(scenario, null, 2) + '\n');

      // Remove source flat file
      await fs.promises.unlink(sourcePath);

      console.log(`[UnitRepair] MOVED: ${entry.name} → ${path.join(...folderParts, targetFilename)}`);
      moved++;

      if (limit > 0 && moved >= limit) {
        console.log(`[UnitRepair] Limit reached: ${limit}`);
        break;
      }
    }

    console.log(`[UnitRepair] Repair complete: ${moved} files moved`);
    return moved;
  }
}
