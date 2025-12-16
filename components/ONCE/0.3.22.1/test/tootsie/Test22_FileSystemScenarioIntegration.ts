/**
 * Test22_FileSystemScenarioIntegration - FS.6 Integration Test
 * 
 * Tests the complete flow:
 * 1. Drop image file → DefaultImage
 * 2. Unit + Artefact created automatically
 * 3. Unit links to Artefact via artefactUuid
 * 4. Artefact contains content hash
 * 
 * Web4 Principles Verified:
 * - P1: Everything is a Scenario (Unit + Artefact created)
 * - P24: RelatedObjects (Unit/Artefact stored in RelatedObjects)
 * - P29: ContentIDProvider (SHA-256 hash computed)
 * 
 * @pdca 2025-12-15-UTC-1700.fs3-fs4-drop-image-complete.pdca.md
 */

import { ONCETestCase } from './ONCETestCase.js';
import { DefaultImage } from '../../src/ts/layer2/DefaultImage.js';
import { DefaultFile } from '../../src/ts/layer2/DefaultFile.js';
import { DefaultUnit } from '../../src/ts/layer2/DefaultUnit.js';
import { DefaultArtefact } from '../../src/ts/layer2/DefaultArtefact.js';

export class Test22_FileSystemScenarioIntegration extends ONCETestCase {
  
  readonly name = 'Test22_FileSystemScenarioIntegration';
  readonly description = 'FS.6: Drop image → Unit + Artefact created';
  
  /**
   * Create a mock File object for testing
   */
  private createMockImageFile(name: string, size: number): File {
    // Create a minimal PNG-like blob (not a valid image, but enough for testing)
    const pngHeader = new Uint8Array([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE // bit depth etc
    ]);
    
    // Pad to requested size
    const content = new Uint8Array(Math.max(size, pngHeader.length));
    content.set(pngHeader);
    
    const blob = new Blob([content], { type: 'image/png' });
    return new File([blob], name, { type: 'image/png' });
  }
  
  /**
   * Main test method
   */
  async execute(): Promise<void> {
    this.logSection('FS.6 Integration Test: Drop Image → Unit + Artefact');
    
    // Test 1: Create DefaultImage and initialize from file
    await this.testImageCreation();
    
    // Test 2: Verify Unit is created
    await this.testUnitCreated();
    
    // Test 3: Verify Artefact is created with content hash
    await this.testArtefactCreated();
    
    // Test 4: Verify Unit links to Artefact
    await this.testUnitArtefactLink();
    
    // Test 5: Verify File stored in RelatedObjects
    await this.testFileInRelatedObjects();
    
    this.logSuccess('All FS.6 integration tests passed!');
  }
  
  /**
   * Test 1: Create DefaultImage from file
   */
  private async testImageCreation(): Promise<void> {
    this.logStep('Test 1: Create DefaultImage from file');
    
    const file = this.createMockImageFile('test-image.png', 1024);
    const image = new DefaultImage();
    
    await image.initFromFile(file);
    
    // Verify basic model populated
    this.assert(image.model.name === 'test-image.png', 'Image name set');
    this.assert(image.model.mimetype === 'image/png', 'Mimetype set');
    this.assert(image.model.fileUuid !== null, 'fileUuid set');
    
    this.logSuccess('DefaultImage created successfully');
    
    // Store for other tests
    this.testContext.set('image', image);
    this.testContext.set('file', file);
  }
  
  /**
   * Test 2: Verify Unit is created
   */
  private async testUnitCreated(): Promise<void> {
    this.logStep('Test 2: Verify Unit created');
    
    const image = this.testContext.get('image') as DefaultImage;
    
    // Unit should be accessible via .unit property
    const unit = image.unit;
    this.assert(unit !== null, 'Unit created');
    
    // Unit should have correct component type
    this.assert(
      (unit as any).model.componentType === 'DefaultImage',
      'Unit.componentType is DefaultImage'
    );
    
    // Unit should be in RelatedObjects
    const unitFromRelated = image.controller.relatedObjectLookupFirst(DefaultUnit);
    this.assert(unitFromRelated !== null, 'Unit in RelatedObjects');
    
    this.logSuccess('Unit created and accessible');
    
    this.testContext.set('unit', unit);
  }
  
  /**
   * Test 3: Verify Artefact is created with content hash
   */
  private async testArtefactCreated(): Promise<void> {
    this.logStep('Test 3: Verify Artefact created with content hash');
    
    const image = this.testContext.get('image') as DefaultImage;
    
    // Artefact should be in RelatedObjects
    const artefact = image.controller.relatedObjectLookupFirst(DefaultArtefact);
    this.assert(artefact !== null, 'Artefact created');
    
    // Artefact should have content hash
    this.assert(
      artefact.model.contentHash.length === 64,
      'Artefact has 64-char SHA-256 hash'
    );
    
    // Artefact should have correct algorithm
    this.assert(
      artefact.model.algorithm === 'SHA-256',
      'Artefact algorithm is SHA-256'
    );
    
    // Artefact should have mimetype
    this.assert(
      artefact.model.mimetype === 'image/png',
      'Artefact mimetype is image/png'
    );
    
    this.logSuccess(`Artefact created with hash: ${artefact.model.contentHash.substring(0, 16)}...`);
    
    this.testContext.set('artefact', artefact);
  }
  
  /**
   * Test 4: Verify Unit links to Artefact
   */
  private async testUnitArtefactLink(): Promise<void> {
    this.logStep('Test 4: Verify Unit links to Artefact');
    
    const unit = this.testContext.get('unit') as any;
    const artefact = this.testContext.get('artefact') as DefaultArtefact;
    
    // Unit should have artefactUuid set
    this.assert(
      unit.model.artefactUuid === artefact.model.uuid,
      'Unit.artefactUuid matches Artefact.uuid'
    );
    
    // Artefact should have unitUuid set
    this.assert(
      artefact.model.unitUuid === unit.model.uuid,
      'Artefact.unitUuid matches Unit.uuid'
    );
    
    this.logSuccess('Unit and Artefact correctly linked');
  }
  
  /**
   * Test 5: Verify File stored in RelatedObjects
   */
  private async testFileInRelatedObjects(): Promise<void> {
    this.logStep('Test 5: Verify File in RelatedObjects');
    
    const image = this.testContext.get('image') as DefaultImage;
    
    // DefaultFile should be in RelatedObjects
    const fileComponent = image.controller.relatedObjectLookupFirst(DefaultFile);
    this.assert(fileComponent !== null, 'DefaultFile in RelatedObjects');
    
    // File should have content hash
    this.assert(
      fileComponent.model.contentHash !== null,
      'File has contentHash'
    );
    
    this.logSuccess('File correctly stored in RelatedObjects');
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Test Helpers
  // ═══════════════════════════════════════════════════════════════
  
  private testContext = new Map<string, any>();
  
  private assert(condition: boolean, message: string): void {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
    this.log(`  ✓ ${message}`);
  }
  
  private logSection(title: string): void {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  ${title}`);
    console.log(`${'═'.repeat(60)}\n`);
  }
  
  private logStep(step: string): void {
    console.log(`\n📋 ${step}`);
  }
  
  private logSuccess(message: string): void {
    console.log(`✅ ${message}`);
  }
  
  private log(message: string): void {
    console.log(message);
  }
}

// Export test runner
export async function runTest(): Promise<void> {
  const test = new Test22_FileSystemScenarioIntegration();
  await test.execute();
}





