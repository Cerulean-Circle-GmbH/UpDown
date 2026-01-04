/**
 * FolderOverView.ts - Animated Folder Browser
 * 
 * Mobile-optimized folder navigation with:
 * - Breadcrumb navigation (via Container.pathFromRoot())
 * - Animated panel transitions
 * - Swipe gestures for folder navigation
 * - Portrait screen optimized
 * 
 * Web4 Principles:
 * - P4: Radical OOP - View IS a UcpView component
 * - P27: Web Components ARE Radical OOP
 * - P30: Works with Container interface (Tree with navigation)
 * - P31: Universal Drop Support (via UcpView base)
 * - P33: Separation of Concerns (external CSS)
 * 
 * @ior ior:esm:/ONCE/{version}/FolderOverView
 * @pdca 2025-12-14-UTC-1800.filesystem-component-architecture.pdca.md
 */

import { html, TemplateResult, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { UcpView } from './UcpView.js';
import { FolderModel } from '../../layer3/FolderModel.interface.js';
import { ResolvedChild } from '../../layer3/ResolvedChild.interface.js';
import { Container } from '../../layer3/Container.interface.js';
import { Reference } from '../../layer3/Reference.interface.js';
import { NavigationDirection } from '../../layer3/NavigationDirection.enum.js';
import { LazyReference } from '../../layer3/LazyReference.interface.js';
import type { File } from '../../layer3/File.interface.js';
import { FileOrchestrator } from '../../layer4/FileOrchestrator.js';
import './FileItemView.js';
import './FolderItemView.js';
import './IORLoadingView.js';
import './ViewRegistry.js';  // Registers component → view mappings for ISR

/**
 * FolderOverView - Animated folder browser with breadcrumb
 * 
 * Layout:
 * ┌─────────────────────────────────────────┐
 * │  📁 Home / Documents / Projects         │  ← Breadcrumb
 * ├─────────────────────────────────────────┤
 * │  ┌─────────────────────────────────┐    │
 * │  │ 📁 Folder 1           ›         │    │  ← FolderItemView
 * │  └─────────────────────────────────┘    │
 * │  ┌─────────────────────────────────┐    │
 * │  │ 📄 File.txt                     │    │  ← FileItemView
 * │  └─────────────────────────────────┘    │
 * └─────────────────────────────────────────┘
 * 
 * Gestures:
 * - Swipe left: Navigate into folder (forward)
 * - Swipe right: Navigate to parent (back)
 * - Tap breadcrumb: Jump to ancestor folder
 */
@customElement('folder-over-view')
export class FolderOverView extends UcpView<FolderModel> {
  
  /** CSS path for external styles (P33: Separation of Concerns) */
  static cssPath = 'FolderOverView.css';
  
  /** Container reference (if using Tree/Container pattern) */
  @property({ type: Object })
  container: Reference<Container<unknown>> = null;
  
  /** Root path boundary - cannot navigate above this (e.g., '/EAMD.ucp') */
  @property({ type: String, attribute: 'root-path' })
  rootPath: string = '';
  
  /** Current working directory - initial folder to display */
  @property({ type: String, attribute: 'cwd' })
  cwd: string = '';
  
  /** @deprecated Use rootPath instead */
  @property({ type: String, attribute: 'default-path' })
  defaultPath: string = '';
  
  /** Current folder path being displayed */
  @state()
  private currentPath: string = '';
  
  /** Loading state */
  @state()
  private isLoading = false;
  
  /** Error message if loading fails */
  @state()
  private errorMessage: string = '';
  
  /** Breadcrumb path (computed from Container.pathFromRoot or manual) */
  @state()
  private breadcrumbPath: { name: string; uuid: string }[] = [];
  
  /** Animation direction for panel transitions */
  @state()
  private animationDirection: NavigationDirection = NavigationDirection.None;
  
  /** Is animating? */
  @state()
  private isAnimating = false;
  
  /** Resolved children from IOR strings (P34) */
  @state()
  private resolvedChildren: ResolvedChild[] = [];
  
  /** Touch tracking for swipe gestures */
  private touchStartX = 0;
  private touchStartY = 0;
  
  /** Bound popstate handler for cleanup */
  private boundPopstateHandler: ((e: PopStateEvent) => void) | null = null;
  
  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    this.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    
    // Handle browser back/forward buttons
    this.boundPopstateHandler = this.handlePopstate.bind(this);
    window.addEventListener('popstate', this.boundPopstateHandler);
    
    // Load paths from properties (set by viewProps in UcpRouter.viewCreate)
    // @pdca 2025-12-11-UTC-1400.file-browser-eamd-route.pdca.md R.2
    
    // rootPath and cwd are set as properties via viewProps before connectedCallback
    // Fallback to defaults if not set
    if (!this.rootPath) {
      this.rootPath = this.defaultPath || '/EAMD.ucp';
    }
    
    // Priority for path to load:
    // 1. Current URL pathname (if under rootPath) - for direct navigation
    // 2. cwd property (for initial route, if set)
    // 3. rootPath (fallback to show virtual root)
    // @pdca 2026-01-02-UTC-1200.filebrowser-fix.pdca.md FB.4
    const currentUrl = window.location.pathname;
    let pathToLoad: string;
    
    if (currentUrl.startsWith(this.rootPath)) {
      // Direct navigation under rootPath - use URL path
      // This includes /EAMD.ucp itself (shows root) and any subfolders
      pathToLoad = currentUrl;
    } else if (this.cwd) {
      // Explicit cwd set - use it
      pathToLoad = this.cwd;
    } else {
      // Fallback to rootPath
      pathToLoad = this.rootPath;
    }
    
    console.log('[FolderOverView] rootPath:', this.rootPath, 'cwd:', this.cwd, 'url:', currentUrl, 'pathToLoad:', pathToLoad);
    
    // Always load folder if cwd/rootPath is set
    // Note: UcpRouter sets browserModel on all views, so we ignore that and load our own model
    if (pathToLoad) {
      console.log(`[FolderOverView] Loading folder: ${pathToLoad}`);
      this.folderLoad(pathToLoad);
    }
  }
  
  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    this.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    
    // Clean up popstate listener
    if (this.boundPopstateHandler) {
      window.removeEventListener('popstate', this.boundPopstateHandler);
      this.boundPopstateHandler = null;
    }
  }
  
  /**
   * Handle browser back/forward navigation
   * @pdca 2025-12-11-UTC-1400.file-browser-eamd-route.pdca.md
   */
  private handlePopstate(event: PopStateEvent): void {
    const path = event.state?.path || window.location.pathname;
    
    // Only handle paths within our root
    if (this.navigationAllowed(path)) {
      console.log('[FolderOverView] Popstate navigation to:', path);
      this.animationDirection = NavigationDirection.Back;
      this.folderLoad(path);
    }
  }
  
  updated(changedProperties: PropertyValues): void {
    if (changedProperties.has('model') || changedProperties.has('container')) {
      this.breadcrumbUpdate();
    }
  }
  
  render(): TemplateResult {
    return html`
      <nav class="breadcrumb">
        ${this.renderBreadcrumb()}
      </nav>
      
      <div 
        class="panel-container"
        @contextmenu=${this.onContextMenu}
        @dragover=${this.onDragOver}
        @dragleave=${this.onDragLeave}
        @drop=${this.onDrop}
      >
        <div class="panel ${this.getPanelClass()}">
          ${this.isLoading ? this.renderLoading() : 
            this.errorMessage ? this.renderError() : 
            this.renderChildren()}
        </div>
      </div>
    `;
  }
  
  /**
   * Render loading state
   */
  private renderLoading(): TemplateResult {
    return html`
      <div class="loading-state">
        <span class="loading-spinner">⏳</span>
        <span class="loading-text">Loading folder...</span>
      </div>
    `;
  }
  
  /**
   * Render error state
   */
  private renderError(): TemplateResult {
    return html`
      <div class="error-state">
        <span class="error-icon">❌</span>
        <span class="error-text">${this.errorMessage}</span>
        <button @click=${this.retryLoad}>Retry</button>
      </div>
    `;
  }
  
  /**
   * Retry loading folder - P4a: Method for click handler
   */
  private retryLoad(): void {
    if (this.currentPath) {
      this.folderLoad(this.currentPath);
    } else if (this.cwd) {
      this.folderLoad(this.cwd);
    } else if (this.rootPath) {
      this.folderLoad(this.rootPath);
    }
  }
  
  /**
   * Render breadcrumb navigation - P4a: No arrow functions
   */
  private renderBreadcrumb(): TemplateResult {
    if (this.breadcrumbPath.length === 0) {
      return html`
        <span class="breadcrumb-item current">
          <span class="breadcrumb-icon">📁</span>
          Root
        </span>
      `;
    }
    
    // P4a: Build template parts using for...of instead of map with arrow
    const parts: TemplateResult[] = [];
    for (let index = 0; index < this.breadcrumbPath.length; index++) {
      const item = this.breadcrumbPath[index];
      const isLast = index === this.breadcrumbPath.length - 1;
      parts.push(this.renderBreadcrumbItem(item, index, isLast));
    }
    
    return html`${parts}`;
  }
  
  /**
   * Render a single breadcrumb item - P4a: Separate method for click handler
   */
  private renderBreadcrumbItem(
    item: { name: string; uuid: string }, 
    index: number, 
    isLast: boolean
  ): TemplateResult {
    return html`
      ${index > 0 ? html`<span class="breadcrumb-separator">/</span>` : ''}
      <span 
        class="breadcrumb-item ${isLast ? 'current' : ''}"
        data-uuid="${item.uuid}"
        data-index="${index}"
        @click=${isLast ? undefined : this.handleBreadcrumbClick}
      >
        ${index === 0 ? html`<span class="breadcrumb-icon">📁</span>` : ''}
        ${item.name}
      </span>
    `;
  }
  
  /**
   * Handle breadcrumb click - P4a: Method reference instead of arrow
   */
  private handleBreadcrumbClick(event: Event): void {
    const target = event.currentTarget as HTMLElement;
    const uuid = target.dataset.uuid || '';
    const index = parseInt(target.dataset.index || '0', 10);
    this.breadcrumbNavigate(uuid, index);
  }
  
  /**
   * Render folder children (files and folders) - P4a: No arrow functions
   * 
   * Supports two rendering modes:
   * 1. HTTP-fetched: Uses resolvedChildren (from server JSON)
   * 2. Scenario-loaded: Uses model.children with ISR (polymorphic dispatch)
   * 
   * @pdca 2025-12-30-UTC-1200.lazy-reference-kernel-isr.pdca.md
   */
  private renderChildren(): TemplateResult {
    // Check if we have HTTP-fetched children (resolvedChildren populated)
    if (this.resolvedChildren.length > 0) {
      return this.renderResolvedChildren();
    }
    
    // Check if we have scenario-loaded children (model.children with ISR)
    if (this.model?.children && this.model.children.length > 0) {
      return this.renderLazyChildren();
    }
    
    // No children from either source
    return html`
      <div class="empty-state">
        <span class="empty-icon">📂</span>
        <span class="empty-text">This folder is empty</span>
      </div>
    `;
  }
  
  /**
   * Render HTTP-fetched children (already resolved)
   * Uses resolvedChildren state populated from server JSON
   */
  private renderResolvedChildren(): TemplateResult {
    // P4a: Use function comparator instead of arrow
    function compareChildren(a: ResolvedChild, b: ResolvedChild): number {
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;
      return a.name.localeCompare(b.name);
    }
    
    // Sort: folders first, then files
    const sorted = [...this.resolvedChildren].sort(compareChildren);
    
    // P4a: Build template parts using for...of instead of map with arrow
    const parts: TemplateResult[] = [];
    for (const child of sorted) {
      parts.push(this.renderChildItem(child));
    }
    
    return html`${parts}`;
  }
  
  /**
   * Render scenario-loaded children with polymorphic ISR dispatch
   * 
   * Option C: Uses UcpView.tagFor() for polymorphic view dispatch.
   * Children can be:
   * - IOR string → renders ior-loading-view
   * - IOR object (resolving) → renders ior-loading-view
   * - Resolved File/Folder → renders file-item-view/folder-item-view
   * 
   * @pdca 2025-12-30-UTC-1200.lazy-reference-kernel-isr.pdca.md
   */
  private renderLazyChildren(): TemplateResult {
    const parts: TemplateResult[] = [];
    
    for (const child of this.model.children) {
      parts.push(this.renderLazyChild(child));
    }
    
    return html`${parts}`;
  }
  
  /**
   * Render a single lazy child with polymorphic dispatch
   * 
   * Determines the correct view based on the child's resolution state:
   * - null → skip
   * - string (IOR) → ior-loading-view (UcpModel proxy will convert)
   * - IOR object → ior-loading-view (resolving in background)
   * - Resolved instance → file-item-view or folder-item-view
   * 
   * @pdca 2025-12-30-UTC-1200.lazy-reference-kernel-isr.pdca.md
   */
  private renderLazyChild(child: LazyReference<File>): TemplateResult {
    // Null → skip
    if (child === null) {
      return html``;
    }
    
    // String (IOR not yet accessed via proxy) → loading view
    if (typeof child === 'string') {
      return html`
        <ior-loading-view 
          .model=${{ ior: child, uuid: child }}
          displayName="Loading..."
        ></ior-loading-view>
      `;
    }
    
    // IOR object (has resolve method) → check if resolved
    if (typeof child === 'object' && 'resolve' in child) {
      const ior = child as { isResolving?: boolean; value?: unknown; model?: { ior?: string; uuid?: string } };
      
      // Still resolving → loading view
      if (ior.isResolving || !ior.value) {
        return html`
          <ior-loading-view 
            .model=${ior.model || { ior: '', uuid: '' }}
            displayName="Loading..."
          ></ior-loading-view>
        `;
      }
      
      // Resolved → render the resolved value
      return this.renderResolvedInstance(ior.value);
    }
    
    // Already resolved instance → render directly
    return this.renderResolvedInstance(child);
  }
  
  /**
   * Render a resolved File or Folder instance
   * 
   * Determines if the instance is a folder (has children) or file,
   * and renders the appropriate view.
   */
  private renderResolvedInstance(instance: unknown): TemplateResult {
    // Type guard: check if instance has the expected shape
    if (!instance || typeof instance !== 'object') {
      return html`<default-item-view .model=${{ name: 'Unknown' }}></default-item-view>`;
    }
    
    const obj = instance as { model?: { uuid?: string; name?: string; children?: unknown[] } };
    const model = obj.model || instance as { uuid?: string; name?: string; children?: unknown[] };
    
    // Check if it's a folder (has children property)
    const isFolder = 'children' in model && Array.isArray(model.children);
    
    if (isFolder) {
      // Build ResolvedChild for FolderItemView
      const childRef: ResolvedChild = {
        uuid: model.uuid || '',
        name: model.name || 'Folder',
        isFolder: true,
        hasChildren: (model.children?.length || 0) > 0,
        mimetype: 'inode/directory',
        size: 0
      };
      
      return html`
        <folder-item-view
          .childRef=${childRef}
          @item-select=${this.handleItemSelect}
          @item-navigate=${this.handleItemNavigate}
        ></folder-item-view>
      `;
    }
    
    // It's a file
    return html`
      <file-item-view
        .model=${model}
        @item-select=${this.handleItemSelect}
      ></file-item-view>
    `;
  }
  
  /**
   * Render a single child item (file or folder) - P4a: Separate method
   * P34: Uses ResolvedChild from IOR resolution, not duplicated FolderChildReference
   */
  private renderChildItem(child: ResolvedChild): TemplateResult {
    if (child.isFolder) {
      return html`
        <folder-item-view
          .childRef=${child}
          @item-select=${this.handleItemSelect}
          @item-navigate=${this.handleItemNavigate}
        ></folder-item-view>
      `;
    }
    return html`
      <file-item-view
        .model=${{ 
          uuid: child.uuid,
          name: child.name,
          filename: child.name, 
          mimetype: child.mimetype,
          size: child.size,
          path: '', 
          createdAt: 0, 
          modifiedAt: 0, 
          isLink: false, 
          linkTarget: null, 
          contentHash: null,
          content: null
        }}
        @item-select=${this.handleItemSelect}
      ></file-item-view>
    `;
  }
  
  /**
   * Get CSS class for panel animation
   */
  private getPanelClass(): string {
    if (!this.isAnimating) return 'active';
    
    // During animation, apply the entering class
    return this.animationDirection === NavigationDirection.Forward 
      ? 'entering-forward active'
      : 'entering-back active';
  }
  
  /**
   * Update breadcrumb path
   */
  private breadcrumbUpdate(): void {
    // Try to use Container.pathFromRoot() if available
    if (this.container && 'pathFromRoot' in this.container) {
      const path = (this.container as Container<unknown>).pathFromRoot();
      // P4a: Use for...of instead of map with arrow
      const breadcrumbs: { name: string; uuid: string }[] = [];
      for (const node of path) {
        breadcrumbs.push({
          name: (node as any).displayName || (node as any).model?.name || 'Folder',
          uuid: (node as any).uuid || (node as any).model?.uuid || ''
        });
      }
      this.breadcrumbPath = breadcrumbs;
      return;
    }
    
    // Fallback: just show current folder
    if (this.model) {
      this.breadcrumbPath = [{
        name: this.model.name || this.model.folderName || 'Root',
        uuid: this.model.uuid
      }];
    } else {
      this.breadcrumbPath = [];
    }
  }
  
  /**
   * Load folder contents from a path
   * Fetches directory listing from server and populates model
   * 
   * @pdca 2025-12-16-UTC-1130.e2e-folder-image-drop-test.pdca.md F.1
   */
  async folderLoad(folderPath: string): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    this.currentPath = folderPath;
    
    try {
      // F.3: Delegate fetch to layer4 orchestrator (views NEVER fetch directly)
      const orchestrator = new FileOrchestrator();
      const { contentType, data } = await orchestrator.folderLoadFromServer(folderPath);
      
      if (contentType.includes('application/json')) {
        // FB.2: Handle both string (needs parsing) and object (already parsed by IOR cache)
        // @pdca 2026-01-02-UTC-1200.filebrowser-fix.pdca.md
        const jsonData = typeof data === 'string' ? JSON.parse(data) : data;
        this.folderModelFromListing(jsonData, folderPath);
      } else {
        // Server returned HTML - parse for links (fallback)
        // HTML data is always a string
        this.folderModelFromHtml(data as string, folderPath);
      }
      
      // Update breadcrumb from path
      this.breadcrumbFromPath(folderPath);
      
      // Update browser URL to reflect current path
      // @pdca 2025-12-11-UTC-1400.file-browser-eamd-route.pdca.md
      if (window.history && folderPath !== window.location.pathname) {
        window.history.pushState({ path: folderPath }, '', folderPath);
      }
      
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[FolderOverView] Load error:', error);
    } finally {
      this.isLoading = false;
    }
  }
  
  /**
   * Create folder model from directory listing JSON
   */
  private folderModelFromListing(data: any, folderPath: string): void {
    const folderName = folderPath.split('/').filter(Boolean).pop() || 'Root';
    
    // Handle different listing formats
    let entries: Array<{ name: string; isFile?: boolean; isDirectory?: boolean; type?: string }> = [];
    
    if (Array.isArray(data)) {
      entries = data;
    } else if (data.entries) {
      entries = data.entries;
    } else if (data.files || data.folders) {
      // Combined format - P4a: Use for...of instead of map with arrow
      const folders = data.folders || [];
      const files = data.files || [];
      
      for (const f of folders) {
        const name = typeof f === 'string' ? f : f.name;
        entries.push({ name, isDirectory: true });
      }
      
      for (const f of files) {
        const name = typeof f === 'string' ? f : f.name;
        entries.push({ name, isFile: true });
      }
    }
    
    // P34: Build resolvedChildren for rendering (from HTTP response, not scenarios)
    // FolderModel.children are IOR strings, but for browser-fetched folders we 
    // populate resolvedChildren directly since no backend scenarios exist yet.
    const resolved: ResolvedChild[] = [];
    for (const entry of entries) {
      const name = typeof entry === 'string' ? entry : entry.name;
      const isFolder = entry.isDirectory === true || entry.type === 'directory' || name.endsWith('/');
      
      resolved.push({
        uuid: `${folderPath}/${name.replace(/\/$/, '')}`,
        name: name.replace(/\/$/, ''),
        isFolder,
        hasChildren: isFolder, // Assume folders have children
        mimetype: isFolder ? 'inode/directory' : this.mimetypeGuess(name),
        size: 0
      });
    }
    
    // Set resolved children for rendering
    this.resolvedChildren = resolved;
    
    // Set model with empty children (IOR strings would go here if from scenarios)
    this.model = {
      uuid: folderPath,
      name: folderName,
      folderName: folderName,
      path: folderPath,
      children: [], // P34: IOR strings (empty for HTTP-loaded folders)
      createdAt: 0,
      modifiedAt: 0,
      parent: null,
      isLink: false,
      linkTarget: null
    };
  }
  
  /**
   * Create folder model from HTML directory listing (fallback)
   * P34: Populates resolvedChildren for rendering (no backend scenarios)
   */
  private folderModelFromHtml(htmlContent: string, folderPath: string): void {
    const folderName = folderPath.split('/').filter(Boolean).pop() || 'Root';
    const resolved: ResolvedChild[] = [];
    
    // Parse links from HTML
    const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi;
    let match;
    
    while ((match = linkRegex.exec(htmlContent)) !== null) {
      const href = match[1];
      const name = match[2].trim();
      
      // Skip parent directory links
      if (href === '..' || href === '../' || name === 'Parent Directory') {
        continue;
      }
      
      const isFolder = href.endsWith('/');
      resolved.push({
        uuid: `${folderPath}/${href.replace(/\/$/, '')}`,
        name: name.replace(/\/$/, ''),
        isFolder,
        hasChildren: isFolder,
        mimetype: isFolder ? 'inode/directory' : this.mimetypeGuess(name),
        size: 0
      });
    }
    
    // Set resolved children for rendering
    this.resolvedChildren = resolved;
    
    // Set model with empty children (IOR strings)
    this.model = {
      uuid: folderPath,
      name: folderName,
      folderName: folderName,
      path: folderPath,
      children: [], // P34: IOR strings
      createdAt: 0,
      modifiedAt: 0,
      parent: null,
      isLink: false,
      linkTarget: null
    };
  }
  
  /**
   * Build breadcrumb from path string
   * Only shows path from rootPath to current folder
   * @pdca 2025-12-11-UTC-1400.file-browser-eamd-route.pdca.md R.3
   */
  private breadcrumbFromPath(folderPath: string): void {
    // Normalize paths
    const normalizedRoot = this.rootPath.replace(/\/$/, '');
    const normalizedPath = folderPath.replace(/\/$/, '');
    
    // Get relative path from root
    let relativePath = normalizedPath;
    if (normalizedPath.startsWith(normalizedRoot)) {
      relativePath = normalizedPath.slice(normalizedRoot.length);
    }
    
    const parts = relativePath.split('/').filter(Boolean);
    const breadcrumbs: { name: string; uuid: string }[] = [];
    
    // Always start with root
    const rootName = normalizedRoot.split('/').pop() || 'Root';
    breadcrumbs.push({
      name: rootName,
      uuid: normalizedRoot
    });
    
    // Add remaining path parts
    let currentPath = normalizedRoot;
    for (const part of parts) {
      currentPath += '/' + part;
      breadcrumbs.push({
        name: part,
        uuid: currentPath
      });
    }
    
    this.breadcrumbPath = breadcrumbs;
  }
  
  /**
   * Check if navigation to path is allowed (within rootPath boundary)
   * @pdca 2025-12-11-UTC-1400.file-browser-eamd-route.pdca.md R.4
   */
  private navigationAllowed(targetPath: string): boolean {
    const normalizedRoot = this.rootPath.replace(/\/$/, '');
    const normalizedTarget = targetPath.replace(/\/$/, '');
    
    // Target must start with root (or be root)
    return normalizedTarget === normalizedRoot || 
           normalizedTarget.startsWith(normalizedRoot + '/');
  }
  
  /**
   * Check if at root boundary
   */
  private isAtRoot(): boolean {
    const normalizedRoot = this.rootPath.replace(/\/$/, '');
    const normalizedCurrent = this.currentPath.replace(/\/$/, '');
    return normalizedCurrent === normalizedRoot;
  }
  
  /**
   * Guess mimetype from filename extension
   */
  private mimetypeGuess(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const mimetypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'pdf': 'application/pdf',
      'txt': 'text/plain',
      'html': 'text/html',
      'css': 'text/css',
      'js': 'application/javascript',
      'ts': 'text/typescript',
      'json': 'application/json'
    };
    return mimetypes[ext] || 'application/octet-stream';
  }
  
  /**
   * Navigate via breadcrumb click
   * @pdca 2025-12-11-UTC-1400.file-browser-eamd-route.pdca.md R.3
   */
  private breadcrumbNavigate(uuid: string, index: number): void {
    // Check if navigation is allowed within rootPath boundary
    if (!this.navigationAllowed(uuid)) {
      console.log(`[FolderOverView] Navigation blocked: ${uuid} outside root ${this.rootPath}`);
      return;
    }
    
    // Navigate back to ancestor
    this.animationDirection = NavigationDirection.Back;
    this.isAnimating = true;
    
    // Dispatch event for external handlers
    this.dispatchEvent(new CustomEvent('folder-navigate', {
      detail: { uuid, index, direction: NavigationDirection.Back },
      bubbles: true,
      composed: true
    }));
    
    // Load the folder contents
    this.folderLoad(uuid);
    
    // Reset animation after transition - P4a: Use bound method
    setTimeout(this.animationReset.bind(this), 300);
  }
  
  /**
   * Reset animation state - P4a: Method for setTimeout callback
   */
  private animationReset(): void {
    this.isAnimating = false;
  }
  
  /**
   * Handle item select (from FileItemView or FolderItemView)
   */
  private handleItemSelect(event: CustomEvent): void {
    this.dispatchEvent(new CustomEvent('item-select', {
      detail: event.detail,
      bubbles: true,
      composed: true
    }));
  }
  
  /**
   * Handle item navigate (open folder)
   * @pdca 2025-12-11-UTC-1400.file-browser-eamd-route.pdca.md R.3
   * @pdca 2026-01-02-UTC-1500.filebrowser-navigation-fix.pdca.md FN.3
   */
  private handleItemNavigate(event: CustomEvent): void {
    // The event contains folder name (uuid) not full path
    // We need to construct full path from current path + folder name
    const folderName = event.detail?.childRef?.name || event.detail?.model?.name || event.detail?.uuid;
    
    if (!folderName) {
      console.warn('[FolderOverView] No folder name in navigate event');
      return;
    }
    
    // FN.3: Construct full path by appending folder name to current path
    // This ensures URL updates correctly during navigation
    const basePath = this.currentPath || this.cwd || this.rootPath || '/EAMD.ucp';
    const fullPath = basePath.endsWith('/') 
      ? `${basePath}${folderName}` 
      : `${basePath}/${folderName}`;
    
    console.log(`[FolderOverView] Navigate: ${basePath} → ${fullPath}`);
    
    this.animationDirection = NavigationDirection.Forward;
    this.isAnimating = true;
    
    // Dispatch event for external handlers
    this.dispatchEvent(new CustomEvent('folder-navigate', {
      detail: { ...event.detail, path: fullPath, direction: NavigationDirection.Forward },
      bubbles: true,
      composed: true
    }));
    
    // Load the folder contents with FULL path
    this.folderLoad(fullPath);
    
    // Reset animation after transition - P4a: Use bound method
    setTimeout(this.animationReset.bind(this), 300);
  }
  
  /**
   * Handle touch start for swipe detection
   */
  private handleTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
  }
  
  /**
   * Handle touch end for swipe detection
   */
  private handleTouchEnd(event: TouchEvent): void {
    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;
    
    const deltaX = touchEndX - this.touchStartX;
    const deltaY = touchEndY - this.touchStartY;
    
    // Minimum swipe distance (50px) and mostly horizontal
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 2) {
      if (deltaX > 0) {
        // Swipe right → go back
        this.swipeBack();
      } else {
        // Swipe left → go forward (if item selected)
        // Forward requires an item to be selected first
      }
    }
  }
  
  /**
   * Handle swipe back gesture (navigate to parent)
   * Respects rootPath boundary - won't navigate above it
   * @pdca 2025-12-11-UTC-1400.file-browser-eamd-route.pdca.md R.4
   */
  private swipeBack(): void {
    // Don't navigate if at root boundary
    if (this.isAtRoot()) {
      console.log('[FolderOverView] At root boundary, cannot navigate back');
      return;
    }
    
    if (this.breadcrumbPath.length > 1) {
      const parentIndex = this.breadcrumbPath.length - 2;
      const parent = this.breadcrumbPath[parentIndex];
      
      // Double-check navigation is allowed
      if (this.navigationAllowed(parent.uuid)) {
        this.breadcrumbNavigate(parent.uuid, parentIndex);
      }
    }
  }
  
  /**
   * Public: Navigate to a specific folder
   */
  navigateTo(folderModel: FolderModel, direction: NavigationDirection = NavigationDirection.Forward): void {
    this.animationDirection = direction;
    this.isAnimating = true;
    this.model = folderModel;
    
    // P4a: Use bound method instead of arrow
    setTimeout(this.animationReset.bind(this), 300);
  }
  
  // ═══════════════════════════════════════════════════════════════
  // FS.4: Context Menu and Drop Handlers
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * FileOrchestrator for async CRUD operations
   */
  private orchestrator = new FileOrchestrator();
  
  /**
   * Handle context menu (right-click) on items
   * 
   * Shows context menu with options: Rename, Delete, Move, Copy
   * P7: SYNC handler - delegates to orchestrator for async operations
   */
  onContextMenu(event: MouseEvent): void {
    event.preventDefault();
    
    const target = event.target as HTMLElement;
    const itemElement = target.closest('[data-uuid]') as HTMLElement;
    
    if (!itemElement) return;
    
    const uuid = itemElement.dataset.uuid;
    const itemType = itemElement.dataset.type || 'file';
    
    // Dispatch context menu event for external handling
    this.dispatchEvent(new CustomEvent('item-context-menu', {
      detail: { 
        uuid, 
        itemType,
        x: event.clientX, 
        y: event.clientY,
        actions: ['rename', 'delete', 'move', 'copy']
      },
      bubbles: true,
      composed: true
    }));
  }
  
  /**
   * Handle drag over (for drop target highlighting)
   * 
   * P7: SYNC handler
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
    
    // Add visual feedback
    this.classList.add('drop-target-active');
  }
  
  /**
   * Handle drag leave (remove highlighting)
   * 
   * P7: SYNC handler
   */
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.classList.remove('drop-target-active');
  }
  
  /**
   * Handle drop (file upload or move)
   * 
   * P7: SYNC handler - delegates to orchestrator for async operations
   * Supports both native file drops and internal item moves
   */
  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.classList.remove('drop-target-active');
    
    if (!event.dataTransfer) return;
    
    // Check for internal move (dragging items within the file browser)
    const internalData = event.dataTransfer.getData('application/x-file-item');
    if (internalData) {
      this.handleInternalMove(JSON.parse(internalData));
      return;
    }
    
    // Handle native file drops
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      this.handleFileDrop(files);
    }
  }
  
  /**
   * Handle internal item move (drag within file browser)
   * 
   * P7: SYNC handler - dispatches event for orchestrator
   */
  private handleInternalMove(itemData: { uuid: string; type: string; sourcePath: string }): void {
    // Dispatch move event for external handling by orchestrator
    this.dispatchEvent(new CustomEvent('item-move', {
      detail: {
        uuid: itemData.uuid,
        type: itemData.type,
        sourcePath: itemData.sourcePath,
        targetPath: this.currentPath
      },
      bubbles: true,
      composed: true
    }));
  }
  
  /**
   * Handle native file drop (upload files)
   * 
   * P7: SYNC handler - dispatches event for orchestrator
   */
  private handleFileDrop(files: FileList): void {
    const fileList: { name: string; type: string; size: number }[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      fileList.push({
        name: file.name,
        type: file.type,
        size: file.size
      });
    }
    
    // Dispatch upload event for external handling by orchestrator
    this.dispatchEvent(new CustomEvent('files-upload', {
      detail: {
        files: files,
        fileList: fileList,
        targetPath: this.currentPath
      },
      bubbles: true,
      composed: true
    }));
  }
  
  // ═══════════════════════════════════════════════════════════════
  // FS.4: CRUD Action Methods (triggered by context menu)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Rename an item
   * 
   * P7: SYNC trigger - orchestrator handles async
   */
  itemRename(uuid: string, newName: string): void {
    // Dispatch rename event for orchestrator
    this.dispatchEvent(new CustomEvent('item-rename', {
      detail: { uuid, newName, path: this.currentPath },
      bubbles: true,
      composed: true
    }));
  }
  
  /**
   * Delete an item
   * 
   * P7: SYNC trigger - orchestrator handles async
   */
  itemDelete(uuid: string): void {
    // Dispatch delete event for orchestrator
    this.dispatchEvent(new CustomEvent('item-delete', {
      detail: { uuid, path: this.currentPath },
      bubbles: true,
      composed: true
    }));
  }
  
  /**
   * Create a new folder
   * 
   * P7: SYNC trigger - orchestrator handles async
   */
  folderCreate(name: string): void {
    // Dispatch create event for orchestrator
    this.dispatchEvent(new CustomEvent('folder-create', {
      detail: { name, parentPath: this.currentPath },
      bubbles: true,
      composed: true
    }));
  }
  
  /**
   * Set folder after async load (ISR Pattern - P7 compliant)
   * Called by FileOrchestrator.folderLoadForView()
   * 
   * @pdca 2025-12-30-UTC-1200.lazy-reference-kernel-isr.pdca.md
   */
  folderSet(folder: { model: FolderModel }): void {
    this.model = folder.model;
    this.isLoading = false;
    this.errorMessage = '';
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'folder-over-view': FolderOverView;
  }
}



















