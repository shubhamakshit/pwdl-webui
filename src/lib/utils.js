class Utils{
     static  generateUUIDv4 () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }



    /**
     * Convert download task JSON to formatted text lines
     * @param {Object} jsonData - The download task JSON data
     * @returns {Array} Array of formatted text lines with appropriate prefixes for color coding
     */
    static formatTaskToText = (jsonData) => {
        if (!jsonData) return ['[ERROR] No data provided'];

        const lines = [];

        // Task identification
        lines.push(`[INFO] Task ID: ${jsonData.task_id || 'Unknown'}`);
        lines.push(`[INFO] Name: ${jsonData.name || 'Unnamed'}`);
        lines.push(`[INFO] Status: ${jsonData.status?.toUpperCase() || 'Unknown'}`);

        // Output location
        lines.push(`[INFO] Output directory: ${jsonData.out_dir || 'Not specified'}`);

        // Progress information
        if (jsonData.progress) {
            // Video progress
            if (jsonData.progress.video) {
                const vp = jsonData.progress.video;
                if (vp.success) {
                    lines.push(`[SUCCESS] Video: ${vp.current}/${vp.total} segments (${vp.percentage}%)`);
                } else if (vp.percentage === 100) {
                    lines.push(`[ERROR] Video: ${vp.current}/${vp.total} segments (${vp.percentage}%) with errors`);
                } else {
                    lines.push(`[WARNING] Video: ${vp.current}/${vp.total} segments (${vp.percentage}%)`);
                }

                // Failed segments
                if (vp.failed_segments && vp.failed_segments.length > 0) {
                    lines.push(`[ERROR] Failed video segments: ${vp.failed_segments.join(', ')}`);
                }
            } else {
                lines.push('[WARNING] No video progress information');
            }

            // Audio progress
            if (jsonData.progress.audio) {
                const ap = jsonData.progress.audio;
                if (ap.success) {
                    lines.push(`[SUCCESS] Audio: ${ap.current}/${ap.total} segments (${ap.percentage}%)`);
                } else if (ap.percentage === 100) {
                    lines.push(`[ERROR] Audio: ${ap.current}/${ap.total} segments (${ap.percentage}%) with errors`);
                } else {
                    lines.push(`[WARNING] Audio: ${ap.current}/${ap.total} segments (${ap.percentage}%)`);
                }

                // Failed segments
                if (ap.failed_segments && ap.failed_segments.length > 0) {
                    lines.push(`[ERROR] Failed audio segments: ${ap.failed_segments.join(', ')}`);
                }
            } else {
                lines.push('[WARNING] No audio progress information');
            }

            // Timestamp
            const timestamp = jsonData.progress.video?.timestamp || jsonData.progress.audio?.timestamp;
            if (timestamp) {
                lines.push(`[INFO] Last updated: ${timestamp}`);
            }
        } else {
            lines.push('[ERROR] No progress information available');
        }

        // Add completion status summary
        if (jsonData.status === 'completed') {
            lines.push('[SUCCESS] Download completed successfully');
        } else if (jsonData.status === 'error') {
            lines.push('[ERROR] Download failed');
        } else if (jsonData.status === 'in_progress') {
            lines.push('[INFO] Download in progress');
        }

        return lines;
    };



    /**
     * Converts an array of URLs into a cross-platform curl command.
     *
     * The generated command will:
     *  - Use double quotes around each URL to handle special characters.
     *  - Chain curl commands using '&&' so they run sequentially.
     *  - Work on both Linux/macOS and Windows command line (CMD, PowerShell).
     *
     * @param {string[]} urls - An array of URL strings.
     * @returns {string} A single curl command string.
     *
     * Example:
     * urlsToCurl([
     *   "http://localhost:5000/get-file/b9ff6c4f-1e7e-43d1-949c-8314d18ff6c0/66d816e5114a9c66583bbbcd",
     *   "http://example.com/file2"
     * ]);
     *
     * Output:
     * curl "http://localhost:5000/get-file/b9ff6c4f-1e7e-43d1-949c-8314d18ff6c0/66d816e5114a9c66583bbbcd" && curl "http://example.com/file2"
     */
    static urlsToCurl(urls) {
        if (!Array.isArray(urls) || urls.length === 0) {
            return 'echo "No URLs provided"';
        }

        // Wrap each URL in double quotes for cross-platform safety
        const curlParts = urls.map(url => `curl -LO "${url}"`);

        // Join commands with '&&' to run sequentially
        const command = curlParts.join(' && ');

        return command;
    };

    static a11yProps(index) {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }

    /**
     * Generates curl commands to download files from a list of URLs with specified filenames.
     *
     * @param {Array<Object>} files - An array of objects, where each object has a 'link' and a 'name' property.
     * @param {string} files[].link - The URL of the file to download.
     * @param {string} files[].name - The desired filename for the downloaded file.
     * @returns {Array<string>} An array of curl commands.
     */
    static curlWithFileName = (files) => {
        if (!Array.isArray(files)) {
            console.error("Input must be an array.");
            return [];
        }

        return files.map(file => {
            if (file && file.link && file.name) {
                // Use the -L flag to follow redirects and -o flag to specify the output filename
                return `curl -L -o "${file.name}" "${file.link}"`;
            } else {
                console.warn("Skipping invalid file object:", file);
                return null; // Or handle the error as appropriate
            }
        }).filter(command => command !== null); // Filter out any null entries from invalid objects
    };


    // /**
    //  * Copies the given text to the clipboard.
    //  *
    //  * @param {string} text - The text to copy.
    //  * @param {function} onSuccess - Callback if copy succeeds.
    //  * @param {function} onError - Callback if copy fails.
    //  */
    static cipman() {
        let copied = false;

        // Check if execCommand is supported (older but more widely supported method)
        const isSupported = document && typeof document.execCommand === 'function';

        async function copy(text) {
            if (!isSupported) {
                throw new Error('Clipboard functionality is not supported');
            }

            try {
                // Create a temporary textarea element
                const textarea = document.createElement('textarea');

                // Set its value to the text we want to copy
                textarea.value = text;

                // Make it non-editable to avoid focus and iOS keyboard opening
                textarea.setAttribute('readonly', '');

                // Hide it from view
                textarea.style.position = 'absolute';
                textarea.style.left = '-9999px';

                // Append to the body
                document.body.appendChild(textarea);

                // Check if we're on iOS
                const isIOS = navigator && /iPad|iPhone|iPod/.test(navigator.userAgent);

                if (isIOS) {
                    // iOS requires a different selection approach
                    textarea.contentEditable = true;
                    textarea.readOnly = false;

                    // Create a range and selection
                    const range = document.createRange();
                    range.selectNodeContents(textarea);

                    const selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(range);
                    textarea.setSelectionRange(0, text.length);
                } else {
                    // Standard approach for other platforms
                    textarea.select();
                }

                // Execute the copy command
                const successful = document.execCommand('copy');

                // Clean up the temporary element
                document.body.removeChild(textarea);

                if (!successful) {
                    throw new Error('Unable to copy text');
                }

                // Set copied flag
                copied = true;

                // Reset the copied flag after 2 seconds
                setTimeout(() => { copied = false }, 2000);

                return true;
            } catch (err) {
                copied = false;
                throw err;
            }
        }

        function wasCopied() {
            return copied;
        }

        return { copy, wasCopied, isSupported };
    };

    static keyToBeautifulName = (key) => {
        return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    };




};

export default Utils;