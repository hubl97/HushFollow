/**
 * File Operations - Abstracts browser compatibility for file read/write
 * Supports both modern (File System Access API) and legacy (download) modes
 */
class FileOperations {
    constructor() {
        this.fileHandle = null; // For modern browsers
        this.currentFileName = null;
    }
    
    /**
     * Check if modern File System Access API is supported
     * @returns {boolean}
     */
    isModernSupported() {
        return typeof window !== 'undefined' && 
               'showSaveFilePicker' in window && 
               'showOpenFilePicker' in window;
    }
    
    /**
     * Generate default filename with timestamp
     * @returns {string}
     */
    generateFilename() {
        const date = new Date();
        const timestamp = date.getFullYear() +
            String(date.getMonth() + 1).padStart(2, '0') +
            String(date.getDate()).padStart(2, '0') + '-' +
            String(date.getHours()).padStart(2, '0') +
            String(date.getMinutes()).padStart(2, '0') +
            String(date.getSeconds()).padStart(2, '0');
        return `hushfollow-${timestamp}.md`;
    }
    
    /**
     * Create blob from Markdown content
     * @param {string} content - Markdown content
     * @returns {Blob}
     */
    createBlob(content) {
        return new Blob([content], { type: 'text/markdown' });
    }
    
    /**
     * Parse file content to blogger array
     * @param {string} content - File content
     * @returns {Array}
     */
    parseFileContent(content) {
        if (typeof parseMarkdown === 'function') {
            return parseMarkdown(content);
        }
        // Fallback for Node.js testing
        return [];
    }
    
    /**
     * Generate file content from blogger array
     * @param {Array} bloggers - Blogger array
     * @returns {string}
     */
    generateFileContent(bloggers) {
        if (typeof generateMarkdown === 'function') {
            return generateMarkdown(bloggers);
        }
        // Fallback for Node.js testing
        return '# HushFollow\n\n';
    }
    
    /**
     * Open file picker and read file
     * @returns {Promise<{content: string, handle: FileSystemFileHandle|null, name: string}>}
     */
    async openFile() {
        if (this.isModernSupported()) {
            try {
                const [fileHandle] = await window.showOpenFilePicker({
                    types: [{
                        description: 'Markdown Files',
                        accept: { 'text/markdown': ['.md'] }
                    }],
                    multiple: false
                });
                
                const file = await fileHandle.getFile();
                const content = await file.text();
                
                this.fileHandle = fileHandle;
                this.currentFileName = file.name;
                
                return {
                    content,
                    handle: fileHandle,
                    name: file.name
                };
            } catch (err) {
                if (err.name === 'AbortError') {
                    return null; // User cancelled
                }
                throw err;
            }
        } else {
            // Legacy mode: use file input
            return new Promise((resolve, reject) => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.md';
                
                input.onchange = async (e) => {
                    const file = e.target.files[0];
                    if (!file) {
                        resolve(null);
                        return;
                    }
                    
                    const content = await file.text();
                    this.currentFileName = file.name;
                    
                    resolve({
                        content,
                        handle: null,
                        name: file.name
                    });
                };
                
                input.onerror = () => reject(new Error('File input error'));
                input.click();
            });
        }
    }
    
    /**
     * Save content to file
     * @param {string} content - Content to save
     * @param {FileSystemFileHandle|null} handle - File handle (for modern browsers)
     * @returns {Promise<boolean>}
     */
    async saveFile(content, handle = null) {
        if (this.isModernSupported() && (handle || this.fileHandle)) {
            try {
                const fileHandle = handle || this.fileHandle;
                const writable = await fileHandle.createWritable();
                await writable.write(content);
                await writable.close();
                return true;
            } catch (err) {
                console.error('Save failed:', err);
                return false;
            }
        } else {
            // Fallback to download
            this.downloadFile(content, this.currentFileName || this.generateFilename());
            return true;
        }
    }
    
    /**
     * Download content as file
     * @param {string} content - Content to download
     * @param {string} filename - Filename
     */
    downloadFile(content, filename) {
        const blob = this.createBlob(content);
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }
    
    /**
     * Update UI based on browser capabilities
     */
    updateUIForBrowserMode() {
        const saveBtn = document.getElementById('btn-save');
        const exportBtn = document.getElementById('btn-export');
        
        if (this.isModernSupported()) {
            saveBtn.style.display = 'inline-flex';
            exportBtn.style.display = 'none';
        } else {
            saveBtn.style.display = 'none';
            exportBtn.style.display = 'inline-flex';
        }
    }
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FileOperations };
}
