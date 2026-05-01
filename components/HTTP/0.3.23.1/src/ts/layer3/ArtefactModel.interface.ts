import type { Model } from './Model.interface.js';
export interface ArtefactModel extends Model {
  contentHash: string;
  size: number;
  mimetype: string;
  algorithm?: string;
  encoding?: string;
  unitUuid?: string;
  [key: string]: any;
}
