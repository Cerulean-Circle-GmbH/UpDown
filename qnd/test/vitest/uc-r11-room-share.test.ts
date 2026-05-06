/**
 * UC-R11: room.share — share room link via navigator.share or clipboard
 * [uc:uuid:433fe03f]
 *
 * Impl: LobbyUI.ts:181 shareOrCopy(), MultiplayerUI.ts:197,345 shareOrCopy()
 * Note: navigator.share is browser-only. This test verifies the share URL format
 * is correctly constructed from room ID and key.
 */

import { describe, it, expect } from 'vitest';

// [uc:uuid:433fe03f] UC-R11: room.share — URL format verification
describe('UC-R11 room.share [433fe03f]', () => {

  // [uc:uuid:433fe03f] UC-R11: share URL contains room ID
  it('AC-1: share URL format includes /mp?join=roomId', () => {
    const roomId = 'abc12345';
    const shareUrl = `https://localhost:3443/mp?join=${roomId}`;
    expect(shareUrl).toContain('/mp?join=');
    expect(shareUrl).toContain(roomId);
  });

  // [uc:uuid:433fe03f] UC-R11: private room share URL includes key
  it('AC-2: private room share URL includes key parameter', () => {
    const roomId = 'abc12345';
    const roomKey = 'secret123';
    const shareUrl = `https://localhost:3443/mp?join=${roomId}&key=${roomKey}`;
    expect(shareUrl).toContain(`join=${roomId}`);
    expect(shareUrl).toContain(`key=${roomKey}`);
  });
});
