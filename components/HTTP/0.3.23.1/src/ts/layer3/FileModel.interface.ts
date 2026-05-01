import type { Model } from './Model.interface.js';
export interface FileModel extends Model {
  path: string;
  size: number;
  mimetype: string;
  contentHash?: string;
  filename?: string;
  relativePath?: string;
  extension?: string;
  createdAt?: any;
  updatedAt?: string;
  [key: string]: any;
}
