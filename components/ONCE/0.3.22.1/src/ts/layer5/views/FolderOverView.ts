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
import { FolderModel, FolderChildReference } from '../../layer3/FolderModel.interface.js';
import { Container } from '../../layer3/Container.interface.js';
import { Reference } from '../../layer3/Reference.interface.js';
import { NavigationDirection } from '../../layer3/NavigationDirection.enum.js';
import './FileItemView.js';
import './FolderItemView.js';

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
  
  /** Touch tracking for swipe gestures */
  private touchStartX = 0;
  private touchStartY = 0;
  
  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    this.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    
    // Load paths from route options or properties
    // Route options are passed via (view as any).route = route in UcpRouter.viewCreate()
    const routeOptions = (this as any).route?.model;
    
    // Root path (navigation boundary) - @pdca 2025-12-11-UTC-1400.file-browser-eamd-route.pdca.md R.2
    const rootPathFromRoute = routeOptions?.rootPath;
    const rootPathFromProperty = this.rootPath || this.defaultPath;
    this.rootPath = rootPathFromRoute || rootPathFromProperty || '/EAMD.ucp';
    
    // Current working directory (initial folder)
    const cwdFromRoute = routeOptions?.cwd;
    const cwdFromProperty = this.cwd;
    const pathToLoad = cwdFromRoute || cwdFromProperty || this.rootPath;
    
    if (pathToLoad && !this.model) {
      console.log(`[FolderOverView] Root: ${this.rootPath}, Loading cwd: ${pathToLoad}`);
      this.folderLoad(pathToLoad);
    }
  }
  
  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    this.removeEventListener('touchend', this.handleTouchEnd.bind(this));
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
      
      <div class="panel-container">
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
   */
  private renderChildren(): TemplateResult {
    if (!this.model?.children || this.model.children.length === 0) {
      return html`
        <div class="empty-state">
          <span class="empty-icon">📂</span>
          <span class="empty-text">This folder is empty</span>
        </div>
      `;
    }
    
    // P4a: Use function comparator instead of arrow
    function compareChildren(a: FolderChildReference, b: FolderChildReference): number {
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;
      return a.name.localeCompare(b.name);
    }
    
    // Sort: folders first, then files
    const sorted = [...this.model.children].sort(compareChildren);
    
    // P4a: Build template parts using for...of instead of map with arrow
    const parts: TemplateResult[] = [];
    for (const child of sorted) {
      parts.push(this.renderChildItem(child));
    }
    
    return html`${parts}`;
  }
  
  /**
   * Render a single child item (file or folder) - P4a: Separate method
   */
  private renderChildItem(child: FolderChildReference): TemplateResult {
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
          ...child, 
          filename: child.name, 
          path: '', 
          createdAt: 0, 
          modifiedAt: 0, 
          isLink: false, 
          linkTarget: null, 
          contentHash: null 
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
      // Fetch directory listing from server
      // StaticFileRoute returns JSON for directory requests
      const response = await fetch(folderPath);
      
      if (!response.ok) {
        throw new Error(`Failed to load folder: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        // Server returned JSON directory listing
        const data = await response.json();
        this.folderModelFromListing(data, folderPath);
      } else {
        // Server returned HTML - parse for links (fallback)
        const html = await response.text();
        this.folderModelFromHtml(html, folderPath);
      }
      
      // Update breadcrumb from path
      this.breadcrumbFromPath(folderPath);
      
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
      // Combined format
      entries = [
        ...(data.folders || []).map((f: string | { name: string }) => ({ 
          name: typeof f === 'string' ? f : f.name, 
          isDirectory: true 
        })),
        ...(data.files || []).map((f: string | { name: string }) => ({ 
          name: typeof f === 'string' ? f : f.name, 
          isFile: true 
        }))
      ];
    }
    
    // Build FolderModel with children
    const children: FolderChildReference[] = [];
    for (const entry of entries) {
      const name = typeof entry === 'string' ? entry : entry.name;
      const isFolder = entry.isDirectory === true || entry.type === 'directory' || name.endsWith('/');
      
      children.push({
        uuid: `${folderPath}/${name.replace(/\/$/, '')}`,
        name: name.replace(/\/$/, ''),
        isFolder,
        hasChildren: isFolder, // Assume folders have children
        mimetype: isFolder ? 'inode/directory' : this.mimetypeGuess(name),
        size: 0
      });
    }
    
    this.model = {
      uuid: folderPath,
      name: folderName,
      folderName: folderName,
      path: folderPath,
      children,
      createdAt: 0,
      modifiedAt: 0,
      parentUuid: null,
      isLink: false,
      linkTarget: null
    };
  }
  
  /**
   * Create folder model from HTML directory listing (fallback)
   */
  private folderModelFromHtml(html: string, folderPath: string): void {
    const folderName = folderPath.split('/').filter(Boolean).pop() || 'Root';
    const children: FolderChildReference[] = [];
    
    // Parse links from HTML
    const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi;
    let match;
    
    while ((match = linkRegex.exec(html)) !== null) {
      const href = match[1];
      const name = match[2].trim();
      
      // Skip parent directory links
      if (href === '..' || href === '../' || name === 'Parent Directory') {
        continue;
      }
      
      const isFolder = href.endsWith('/');
      children.push({
        uuid: `${folderPath}/${href.replace(/\/$/, '')}`,
        name: name.replace(/\/$/, ''),
        isFolder,
        hasChildren: isFolder,
        mimetype: isFolder ? 'inode/directory' : this.mimetypeGuess(name),
        size: 0
      });
    }
    
    this.model = {
      uuid: folderPath,
      name: folderName,
      folderName: folderName,
      path: folderPath,
      children,
      createdAt: 0,
      modifiedAt: 0,
      parentUuid: null,
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
   */
  private handleItemNavigate(event: CustomEvent): void {
    const targetPath = event.detail?.uuid || event.detail?.path;
    
    if (!targetPath) {
      console.warn('[FolderOverView] No target path in navigate event');
      return;
    }
    
    this.animationDirection = NavigationDirection.Forward;
    this.isAnimating = true;
    
    // Dispatch event for external handlers
    this.dispatchEvent(new CustomEvent('folder-navigate', {
      detail: { ...event.detail, direction: NavigationDirection.Forward },
      bubbles: true,
      composed: true
    }));
    
    // Load the folder contents
    this.folderLoad(targetPath);
    
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
}

declare global {
  interface HTMLElementTagNameMap {
    'folder-over-view': FolderOverView;
  }
}






