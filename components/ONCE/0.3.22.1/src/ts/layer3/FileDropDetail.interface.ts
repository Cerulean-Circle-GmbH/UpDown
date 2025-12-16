/**
 * FileDropDetail.interface.ts - Event detail for file-drop events
 * 
 * Used by UcpView when dispatching file-drop CustomEvents.
 * 
 * Web4 Principles:
 * - P19: One File One Type
 * - P31: Universal Drop Support
 * 
 * @ior ior:esm:/ONCE/{version}/FileDropDetail
 * @pdca 2025-12-14-UTC-1800.filesystem-component-architecture.pdca.md
 */

/**
 * FileDropDetail - Event detail for file-drop events
 * 
 * Dispatched by UcpView when a file is dropped on any view.
 * Parent components listen for this event to handle dropped files.
 */
export interface FileDropDetail {
  /** The dropped file */
  file: File;
  
  /** MIME type of the file */
  mimetype: string;
  
  /** File name */
  filename: string;
  
  /** File size in bytes */
  size: number;
  
  /** 
   * The view that received the drop
   * Note: This is typed as 'any' to avoid circular import with UcpView
   */
  targetView: any;
}


