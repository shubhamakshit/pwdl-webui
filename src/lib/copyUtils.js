import copy from 'copy-to-clipboard'; // Required from the old dependencies

export const CopyUtils = {
    /**
     * Copy text to clipboard and return success state
     * @param {string} text - Text to copy
     * @returns {boolean} - Whether the copy was successful
     */
    copyToClipboard: (text) => {
        try {
            return copy(text);
        } catch (err) {
            console.error('Failed to copy text to clipboard:', err);
            return false;
        }
    },

    /**
     * Copy items in different formats (multiline, single line, etc)
     * @param {string[]} items - Array of items to copy
     * @param {object} options - Options for copying
     * @param {boolean} options.multiline - Whether to copy as multiline text
     * @returns {boolean} - Whether the copy was successful
     */
    copyItems: (items, { multiline = true } = {}) => {
        if (!Array.isArray(items)) {
            return CopyUtils.copyToClipboard(String(items));
        }

        const text = multiline ? items.join('\n') : items.join('');
        return CopyUtils.copyToClipboard(text);
    }
};

export default CopyUtils;