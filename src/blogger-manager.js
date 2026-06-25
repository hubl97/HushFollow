/**
 * Generate unique ID from URL using simple hash
 * @param {string} url - Weibo URL
 * @returns {string} Hash ID
 */
function generateId(url) {
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
        const char = url.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return 'blogger_' + Math.abs(hash).toString(36);
}

/**
 * Extract user ID from Weibo URL for auto-generated nickname
 * @param {string} url - Weibo URL
 * @returns {string} User ID or 'unknown'
 */
function extractUserId(url) {
    try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/').filter(p => p);
        if (pathParts.length > 0) {
            return pathParts[pathParts.length - 1];
        }
    } catch (e) {
        // Invalid URL
    }
    return 'unknown';
}

/**
 * Validate Weibo URL
 * @param {string} url - URL to validate
 * @returns {boolean} Is valid Weibo URL
 */
function isValidWeiboUrl(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname === 'weibo.com' || urlObj.hostname === 'www.weibo.com';
    } catch (e) {
        return false;
    }
}

/**
 * Blogger Manager - Handles all blogger data operations
 */
class BloggerManager {
    constructor() {
        this.bloggers = [];
    }
    
    /**
     * Add a new blogger
     * @param {string} url - Weibo URL
     * @param {string} nickname - Optional nickname (auto-generated if not provided)
     * @returns {Object|null} Added blogger or null if invalid/duplicate
     */
    add(url, nickname = null) {
        // Validate URL
        if (!isValidWeiboUrl(url)) {
            return null;
        }
        
        // Check for duplicate URL
        if (this.bloggers.some(b => b.url === url)) {
            return null;
        }
        
        // Auto-generate nickname if not provided
        if (!nickname) {
            const userId = extractUserId(url);
            nickname = `微博用户 ${userId}`;
        }
        
        const blogger = {
            id: generateId(url),
            nickname: nickname.trim(),
            url: url.trim(),
            createdAt: new Date().toISOString()
        };
        
        this.bloggers.push(blogger);
        return blogger;
    }
    
    /**
     * Edit blogger nickname
     * @param {string} id - Blogger ID
     * @param {string} newNickname - New nickname
     * @returns {Object|null} Updated blogger or null if not found
     */
    edit(id, newNickname) {
        const blogger = this.bloggers.find(b => b.id === id);
        if (!blogger) {
            return null;
        }
        
        blogger.nickname = newNickname.trim();
        return blogger;
    }
    
    /**
     * Delete blogger by ID
     * @param {string} id - Blogger ID
     * @returns {boolean} True if deleted, false if not found
     */
    delete(id) {
        const index = this.bloggers.findIndex(b => b.id === id);
        if (index === -1) {
            return false;
        }
        
        this.bloggers.splice(index, 1);
        return true;
    }
    
    /**
     * Get all bloggers
     * @returns {Array} Copy of bloggers array
     */
    getAll() {
        return [...this.bloggers];
    }
    
    /**
     * Search bloggers by nickname
     * @param {string} query - Search query
     * @returns {Array} Matching bloggers
     */
    search(query) {
        const lowerQuery = query.toLowerCase().trim();
        if (!lowerQuery) {
            return this.getAll();
        }
        
        return this.bloggers.filter(b => 
            b.nickname.toLowerCase().includes(lowerQuery)
        );
    }
    
    /**
     * Load bloggers from array (used for import/initialization)
     * @param {Array} bloggers - Array of {nickname, url} objects
     */
    loadFromArray(bloggers) {
        this.bloggers = [];
        for (const b of bloggers) {
            this.add(b.url, b.nickname);
        }
    }
    
    /**
     * Get count of bloggers
     * @returns {number} Count
     */
    getCount() {
        return this.bloggers.length;
    }
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BloggerManager, generateId, extractUserId, isValidWeiboUrl };
}
