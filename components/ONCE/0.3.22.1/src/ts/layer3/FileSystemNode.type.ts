/**
 * FileSystemNode.type.ts - Union type for files and folders
 * 
 * Web4 Principles:
 * - P19: One File One Type
 * 
 * @ior ior:esm:/ONCE/{version}/FileSystemNode
 * @pdca 2025-12-14-UTC-1800.filesystem-component-architecture.pdca.md
 */

import type { DefaultFile } from '../layer2/DefaultFile.js';
import type { DefaultFolder } from '../layer2/DefaultFolder.js';

/**
 * FileSystemNode - Union type for files and folders
 * 
 * Used for Tree<T> children where T can be either a file or folder.
 */
export type FileSystemNode = DefaultFile | DefaultFolder;






