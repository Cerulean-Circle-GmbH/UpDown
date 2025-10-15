/**
 * UpDown.CardsModel - UpDown.Cards Component Model Interface
 * Web4 pattern: Component model following auto-discovery patterns
 */

import { Model } from './Model.interface.js';

export interface Card {
  suit: string;
  rank: string;
  value: number;
  id: string;
  displayName: string;
}

export interface UpDown_CardsModel extends Model {
  uuid: string;
  name: string;
  origin: string;
  definition: string;
  createdAt: string;
  updatedAt: string;
  deck?: Card[];
  dealtCards?: Card[];
}
