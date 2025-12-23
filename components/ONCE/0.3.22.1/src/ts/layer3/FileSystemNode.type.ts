/**
 * FileSystemNode.type.ts - Union type for files and folders
 * 
 * ⚠️ Two Related But Distinct Types:
 * 
 * 1. **FileSystemNode** (this file): Compile-time union type
 *    - Used for type-safe tree operations (model access, parentSet)
 *    - Gives access to DefaultFile/DefaultFolder properties
 *    - Used in FolderModel.children, Tree<T>, etc.
 * 
 * 2. **File** (layer3/File.ts): Runtime JsInterface
 *    - Used for RelatedObjects registration
 *    - Exists at runtime for `File.implementations` lookup
 *    - Web4 Principle 35: JsInterface for Runtime Interfaces
 * 
 * Both DefaultFile and DefaultFolder:
 * - ARE FileSystemNode (via union type)
 * - IMPLEMENT File (via JsInterface)
 * 
 * Web4 Principles:
 * - P19: One File One Type
 * - P35: JsInterface for Runtime Interfaces
 * 
 * @ior ior:esm:/ONCE/{version}/FileSystemNode
 * @pdca 2025-12-14-UTC-1800.filesystem-component-architecture.pdca.md
 * @pdca 2025-12-22-UTC-1100.file-folder-inheritance.pdca.md
 */

import type { DefaultFile } from '../layer2/DefaultFile.js';
import type { DefaultFolder } from '../layer2/DefaultFolder.js';

/**
 * FileSystemNode - Union type for tree operations
 * 
 * For runtime polymorphism, use File JsInterface instead.
 */
export type FileSystemNode = DefaultFile | DefaultFolder;

















