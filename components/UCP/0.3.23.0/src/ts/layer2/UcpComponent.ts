/**
 * UcpComponent.ts - Abstract Base for All Web4 Components
 *
 * All generated Web4 components extend this base class.
 * Provides lifecycle management and view delegation via UcpController.
 * Uses UcpModel for reactive model updates with change tracking.
 *
 * @web4x/ucp foundation version:
 * - No ONCE kernel dependency (kernel-agnostic)
 * - No Unit/Artefact integration (belongs to @web4x/unit)
 * - No ISR/IOR resolution (belongs to @web4x/once)
 * - Pure component lifecycle + MVC + scenario serialization
 *
 * Web4 Principles:
 * - P4: Radical OOP
 * - P5: Reference<T> for nullable
 * - P6: Empty constructor
 * - P7: Async in Layer 4 only
 * - P16: TypeScript accessors
 *
 * @ior ior:esm:/UCP/{version}/UcpComponent
 */

import { UcpController } from './UcpController.js';
import { TypeDescriptor } from '../layer3/TypeDescriptor.js';
import { UcpModel } from '../layer3/UcpModel.js';
import { Component } from '../layer3/Component.js';
import { LifecycleState } from '../layer3/LifecycleState.enum.js';
import { View } from '../layer3/View.interface.js';
import { Reference } from '../layer3/Reference.interface.js';
import type { Model } from '../layer3/Model.interface.js';
import type { Scenario } from '../layer3/Scenario.interface.js';
import type { Storage } from '../layer3/Storage.interface.js';
import type { IDProvider } from '../layer3/IDProvider.interface.js';
import type { ContentIDProvider } from '../layer3/ContentIDProvider.interface.js';
import type { AbstractConstructor } from '../layer3/InterfaceConstructor.type.js';
import type { MethodSignature } from '../layer3/MethodSignature.interface.js';
import { PersistenceManager } from '../layer3/PersistenceManager.interface.js';
import { UUIDProvider } from './UUIDProvider.js';
import { SHA256Provider } from './SHA256Provider.js';
import { JsInterface } from '../layer3/JsInterface.js';

/**
 * UcpComponent - Abstract base class for all Web4 components
 *
 * Hierarchy: JsInterface → Component → UcpComponent → DefaultXxx implementations
 *
 * Features:
 * - Lifecycle management (init, start, stop, hibernate)
 * - View delegation via UcpController
 * - Scenario serialization
 * - ID generation (UUID, SHA-256)
 */
export abstract class UcpComponent<TModel extends Model> extends Component<TModel> {

  // ═══════════════════════════════════════════════════════════════
  // Static Type Descriptor - MDA MOF Runtime Metadata
  // ═══════════════════════════════════════════════════════════════

  /**
   * Static type descriptor - runtime metadata about this class
   * Set by TypeRegistry or static start() when class is loaded
   */
  static type: TypeDescriptor;

  /**
   * Declare which JsInterface classes this component implements.
   * Override in subclasses to register with runtime interfaces.
   */
  static implements(): AbstractConstructor<JsInterface>[] {
    return [Component];  // Default: no JsInterfaces
  }

  /**
   * Static start method - called when class is loaded
   * Initializes type descriptor and auto-registers with declared JsInterfaces
   */
  static override async start(args?: string[]): Promise<void> {
    // Call Component.start() for lifecycle state management
    super.start(args);

    // Build TypeDescriptor if not already set
    if (!this.type) {
      this.type = new TypeDescriptor().init({ name: this.name });
    }

    // Auto-register with all declared JsInterfaces
    for (const jsInterface of this.implements()) {
      if (typeof (jsInterface as typeof JsInterface).implementationRegister === 'function') {
        (jsInterface as typeof JsInterface).implementationRegister(
          this as unknown as Parameters<typeof JsInterface.implementationRegister>[0]
        );
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Instance Properties
  // ═══════════════════════════════════════════════════════════════

  /** UcpModel wrapper - manages reactive model with change tracking */
  private ucpModel: Reference<UcpModel<TModel>> = null;

  /** Controller for view management */
  protected controller: UcpController<TModel>;

  /** Storage instance for scenario persistence */
  protected storage: Reference<Storage> = null;

  // ═══════════════════════════════════════════════════════════════
  // Scenario Infrastructure (P3: fieldNameField, P5: Reference<T>)
  // ═══════════════════════════════════════════════════════════════

  /** IOR identity for this component instance */
  private iorField: Reference<{ uuid: string; component: string; version: string; iorString?: string }> = null;

  /** Owner UUID (from User service) */
  private ownerField: string = 'system';

  /** Scenario unit tracking info */
  private scenarioUnitField: Reference<import('../layer3/ScenarioUnit.interface.js').ScenarioUnit> = null;

  // ═══════════════════════════════════════════════════════════════
  // Static ID Providers (Shared across all components)
  // ═══════════════════════════════════════════════════════════════

  /** Default UUID provider (singleton) */
  private static uuidProviderInstance: UUIDProvider = new UUIDProvider();

  /** Default SHA-256 content ID provider (singleton) */
  private static sha256ProviderInstance: SHA256Provider = new SHA256Provider();

  /**
   * Empty constructor - Web4 Principle 6
   */
  constructor() {
    super();
    this.controller = new UcpController<TModel>();

    // Register default ID providers in RelatedObjects
    this.idProvidersRegister();
  }

  /**
   * Register default ID providers in RelatedObjects
   * Called from constructor. Override to add custom providers.
   */
  protected idProvidersRegister(): void {
    this.controller.relatedObjectRegister(
      UUIDProvider as unknown as new () => IDProvider,
      UcpComponent.uuidProviderInstance
    );
    this.controller.relatedObjectRegister(
      SHA256Provider as unknown as new () => ContentIDProvider,
      UcpComponent.sha256ProviderInstance
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // Initialization State (P16: TypeScript accessors)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Guard — throws if not initialized
   * Call at start of methods that require initialization
   */
  protected requireInitialized(): void {
    if (!this.isInitialized) {
      throw new Error(`${this.constructor.name} not initialized. Call init() first.`);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Scenario Accessors (P16: TypeScript accessors)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get IOR identity for this component
   * Creates default IOR if not set (lazy initialization)
   */
  get ior(): { uuid: string; component: string; version: string; iorString?: string } {
    if (!this.iorField) {
      this.iorField = {
        uuid: this.model?.uuid ?? this.uuidCreate(),
        component: this.constructor.name,
        version: this.componentVersion ?? '0.0.0.0'
      };
    }
    return this.iorField;
  }

  /**
   * Get owner UUID
   */
  get owner(): string {
    return this.ownerField;
  }

  /**
   * Get scenario unit tracking info
   */
  get scenarioUnit(): import('../layer3/ScenarioUnit.interface.js').ScenarioUnit | undefined {
    return this.scenarioUnitField ?? undefined;
  }

  /**
   * Get component version
   * Override in subclass to provide version
   */
  protected get componentVersion(): string {
    return '0.0.0.0';
  }

  // ═══════════════════════════════════════════════════════════════
  // Scenario Methods
  // ═══════════════════════════════════════════════════════════════

  /**
   * Serialize component identity to IOR object
   */
  toIOR(): { uuid: string; component: string; version: string; iorString?: string } {
    return this.ior;
  }

  /**
   * Serialize current state to full Scenario
   */
  toScenario(): Scenario<TModel> {
    return {
      ior: this.ior,
      owner: this.owner,
      model: this.model,
      unit: this.scenarioUnit
    };
  }

  /**
   * Create default Scenario for this component type
   * Returns base scenario with ior/owner — model is null
   * Child classes call this in init(), then assign scenario.model inline
   */
  scenarioDefault(): Scenario<TModel> {
    return {
      ior: {
        uuid: this.uuidCreate(),
        component: this.constructor.name,
        version: this.componentVersion
      },
      owner: this.owner,
      model: null as unknown as TModel  // Child assigns inline in init()
    };
  }

  /**
   * Initialize component with scenario (Web4 Radical OOP P6)
   *
   * ONE method — no initSync, no initBase, no wrappers
   * Signature: init(scenario?: Scenario<TModel>): this
   * SYNC ONLY — async logic belongs in Layer 4 orchestrators
   *
   * @param scenario Optional full Scenario<TModel> — uses scenarioDefault() if not provided
   * @returns this for chaining
   */
  init(scenario?: Scenario<TModel>): this {
    // Skip if already initialized
    if (this.ucpModel !== null) {
      if (scenario?.model) {
        Object.assign(this.ucpModel.model, scenario.model);
      }
      return this;
    }

    // Use provided scenario or create default
    const s = scenario ?? this.scenarioDefault();

    // Store scenario parts
    this.iorField = s.ior;
    this.ownerField = s.owner;
    this.scenarioUnitField = s.unit ?? null;

    // Create UcpModel wrapper with view update callback
    this.ucpModel = new UcpModel<TModel>().init(
      s.model,
      this.controller.viewsUpdateAll.bind(this.controller)
    );

    // Wire persistence callback
    this.ucpModel.persistenceCallbackSet(this.scenarioPersist.bind(this));

    // Initialize controller with UcpModel
    this.controller.initWithUcpModel(this.ucpModel);

    // Mark as initialized
    this.instanceState = LifecycleState.INITIALIZED;

    return this;
  }

  /**
   * Persist current scenario via PersistenceManager (if available)
   * Called automatically when model changes (via UcpModel proxy)
   */
  protected scenarioPersist(): void {
    const scenario = this.toScenario();
    const uuid = scenario.ior?.uuid;
    if (!uuid) return;

    // Get PersistenceManager from RelatedObjects (if available)
    const pm = this.controller.relatedObjectLookupFirst(PersistenceManager);
    if (pm) {
      pm.scenarioSave(uuid, scenario, []);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // MODEL ACCESSORS (via UcpModel)
  // ═══════════════════════════════════════════════════════════════

  /**
   * PUBLIC: Get proxied model
   * Assignments trigger IMMEDIATE view updates
   */
  get model(): TModel {
    if (this.ucpModel === null) {
      return null as unknown as TModel;
    }
    return this.ucpModel.model;
  }

  /**
   * Check if UcpModel is initialized
   */
  get hasModel(): boolean {
    return this.ucpModel !== null;
  }

  // ═══════════════════════════════════════════════════════════════
  // METHOD DISCOVERY INTERFACE
  // ═══════════════════════════════════════════════════════════════

  hasMethod(name: string): boolean {
    return false;
  }

  getMethodSignature(name: string): MethodSignature | null {
    return null;
  }

  listMethods(): string[] {
    return [];
  }

  /**
   * PROTECTED: Get raw model (bypass view updates)
   * Assignments are TRACKED but do NOT trigger immediate updates
   */
  protected get value(): TModel {
    if (this.ucpModel === null) {
      return null as unknown as TModel;
    }
    return this.ucpModel.value;
  }

  /**
   * Get accumulated changes
   */
  get updateObject(): Partial<TModel> {
    return this.ucpModel?.updateObject ?? {};
  }

  /**
   * Check if model has uncommitted changes
   */
  get isDirty(): boolean {
    return this.ucpModel?.isDirty ?? false;
  }

  /**
   * Commit all tracked changes
   */
  commit(): void {
    this.ucpModel?.commit();
  }

  /**
   * Discard uncommitted changes
   */
  rollback(): void {
    this.ucpModel?.rollback();
  }

  // ═══════════════════════════════════════════════════════════════
  // Storage
  // ═══════════════════════════════════════════════════════════════

  /**
   * Set storage instance for scenario persistence
   */
  storageSet(storage: Storage): void {
    this.storage = storage;
  }

  // ═══════════════════════════════════════════════════════════════
  // ID Generation (via RelatedObjects lookup)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Create a new UUID
   */
  protected uuidCreate(): string {
    const provider = this.controller.relatedObjectLookupFirst(
      UUIDProvider as unknown as new () => IDProvider
    );
    if (provider) {
      return provider.create();
    }
    return UcpComponent.uuidProviderInstance.create();
  }

  /**
   * Create content-based ID (hash)
   */
  protected async contentIdCreate(content: ArrayBuffer | string | Uint8Array): Promise<string> {
    const provider = this.controller.relatedObjectLookupFirst(
      SHA256Provider as unknown as new () => ContentIDProvider
    ) as ContentIDProvider | null;

    if (provider) {
      return provider.contentIdCreate(content);
    }
    return UcpComponent.sha256ProviderInstance.contentIdCreate(content);
  }

  /**
   * Create content-based ID synchronously (if available)
   */
  protected contentIdCreateSync(content: ArrayBuffer | string | Uint8Array): string | null {
    const provider = this.controller.relatedObjectLookupFirst(
      SHA256Provider as unknown as new () => ContentIDProvider
    ) as ContentIDProvider | null;

    if (provider) {
      return provider.contentIdCreateSync(content);
    }
    return UcpComponent.sha256ProviderInstance.contentIdCreateSync(content);
  }

  // ═══════════════════════════════════════════════════════════════
  // View Management - Delegated to UcpController
  // ═══════════════════════════════════════════════════════════════

  viewRegister(view: View<TModel>): void {
    this.controller.viewRegister(view);
  }

  viewUnregister(view: View<TModel>): void {
    this.controller.viewUnregister(view);
  }

  viewsUpdateAll(): void {
    this.controller.viewsUpdateAll();
  }

  scenarioReceive(scenario: { model?: TModel }): void {
    this.controller.scenarioReceive(scenario);
  }

  // ═══════════════════════════════════════════════════════════════
  // Lifecycle & Serialization
  // ═══════════════════════════════════════════════════════════════

  /**
   * Hibernate component to storage
   */
  async hibernate(symlinkPaths: string[] = []): Promise<void> {
    if (!this.storage) {
      console.warn('[UcpComponent] No storage configured, skipping hibernate');
      return;
    }

    const scenario = this.toScenario();
    const uuid = scenario.ior?.uuid;

    if (!uuid) {
      console.error('[UcpComponent] Cannot hibernate: missing UUID in scenario');
      return;
    }

    await this.storage.scenarioSave(uuid, scenario, symlinkPaths);
  }

  /**
   * Restore component from storage
   */
  async restore(uuid: string): Promise<this> {
    if (!this.storage) {
      throw new Error('[UcpComponent] No storage configured');
    }

    const scenario = await this.storage.scenarioLoad<TModel>(uuid);
    return this.init(scenario as Scenario<TModel>);
  }
}
