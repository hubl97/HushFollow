/**
 * Parse Markdown content and extract blogger list
 * @param {string} markdown - Markdown content
 * @returns {Array} Array of blogger objects {nickname, url}
 */
function parseMarkdown(markdown) {
    if (!markdown || typeof markdown !== 'string') {
        return [];
    }
    
    const bloggers = [];
    const lines = markdown.split('\n');
    
    // Regular expression to match: - [nickname](url)
    // Uses non-greedy match to handle special characters in nickname
    const listItemRegex = /^-\s*\[(.*?)\]\s*\(([^)]+)\)\s*$/;
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Skip empty lines and headers
        if (!trimmedLine || trimmedLine.startsWith('#')) {
            continue;
        }
        
        // Try to match list item pattern
        const match = trimmedLine.match(listItemRegex);
        if (match) {
            bloggers.push({
                nickname: match[1].trim(),
                url: match[2].trim()
            });
        }
    }
    
    return bloggers;
}

/**
 * Generate Markdown content from blogger list
 * @param {Array} bloggers - Array of blogger objects {nickname, url}
 * @returns {string} Markdown content
 */
function generateMarkdown(bloggers) {
    if (!Array.isArray(bloggers)) {
        bloggers = [];
    }
    
    let markdown = '# HushFollow\n\n';
    
    for (const blogger of bloggers) {
        if (blogger.nickname && blogger.url) {
            markdown += `- [${blogger.nickname}](${blogger.url})\n`;
        }
    }
    
    return markdown;
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { parseMarkdown, generateMarkdown };
}
