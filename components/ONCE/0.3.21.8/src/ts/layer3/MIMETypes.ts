/**
 * MIMETypes.ts
 * 
 * Preconfigured MIME types for static file serving
 * 
 * @layer3
 * @pattern Web4 Principle 1 - Configuration as scenario-like object
 * @pdca session/2025-12-03-UTC-0900.fix-path-authority-dry-violation.pdca.md
 */

/**
 * Preconfigured MIME types for static files
 * Web4 Pattern: Configuration objects over hardcoded strings
 */
export const MIME_TYPES: Record<string, string> = {
    // JavaScript (ESM)
    '.js': 'application/javascript',
    '.mjs': 'application/javascript',
    
    // TypeScript (for development/source maps)
    '.ts': 'application/typescript',
    '.mts': 'application/typescript',
    
    // CSS
    '.css': 'text/css',
    
    // HTML
    '.html': 'text/html',
    '.htm': 'text/html',
    
    // JSON
    '.json': 'application/json',
    
    // Images
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp',
    
    // Fonts
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    
    // Other
    '.txt': 'text/plain',
    '.xml': 'application/xml',
    '.pdf': 'application/pdf',
    '.zip': 'application/zip',
    '.map': 'application/json',  // Source maps
};

/**
 * File extensions that StaticFileRoute handles
 * Used for matching - if path ends with one of these, it's a static file
 */
export const STATIC_FILE_EXTENSIONS = Object.keys(MIME_TYPES);




