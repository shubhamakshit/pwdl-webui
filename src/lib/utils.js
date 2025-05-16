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

// Helper function to get the first word (alphanumeric, underscore, hyphen)
    // Modified to match characters (letters, underscore, hyphen) from the start
    // until a digit or other non-allowed character is encountered.
    static getFirstWord(str) {
        if (!str) return 'downloaded_data';
        // Match the beginning (^), then one or more characters ([a-zA-Z_-]+)
        // that are letters (a-z, A-Z), underscore (_), or hyphen (-).
        // The match stops at the first character that is NOT one of these,
        // which includes digits (0-9), spaces, and other symbols.
        const match = str.match(/^([a-zA-Z_-]+)/);
        // If a match is found, return the captured group (the sequence of allowed characters).
        // If no match is found (e.g., string starts with a number or space), return the default.
        return match ? match[1] : 'downloaded_data';
    }

    // Helper function to convert an array of objects into CSV format
    static convertToCSV(dataArray) {
        if (!dataArray || dataArray.length === 0) {
            return "";
        }

        // Use keys from the first object as headers. Assumes consistent structure.
        const headers = Object.keys(dataArray[0]);
        const csvRows = [headers.join(',')];

        dataArray.forEach(item => {
            const values = headers.map(header => {
                // Get value, default to empty string for null/undefined
                let value = item[header] === null || item[header] === undefined ? '' : String(item[header]);
                // Escape double quotes by doubling them, and wrap value in quotes if it contains comma, double quote, or newline.
                if (value.includes('"') || value.includes(',') || value.includes('\n')) {
                    value = `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            });
            csvRows.push(values.join(','));
        });
        return csvRows.join('\n');
    }


    /**
     * Generates a bash one-liner command string to create a CSV file and run the PWD L script.
     *
     * @param {Array<Object>} listOfStates - An array of data objects to convert to CSV.
     * Each object is expected to have properties like name, batch_name, id,
     * and potentially topic_name, lecture_url, etc.
     * @param {object} [options={}] - Optional parameters.
     * @param {string} [options.pythonCmd="python"] - The command to use for the Python interpreter (e.g., "python3", "py.exe"). Defaults to "python".
     * @param {string} [options.pwdlScriptPath="$HOME/pwdlv3/pwdl.py"] - The path to the PWD L Python script. Defaults to "$HOME/pwdlv3/pwdl.py".
     * @returns {string} The bash one-liner command string, or an empty string if input is invalid or encoding fails.
     */
    static toPwdlCommand(listOfStates, options = {}) {
        if (!Array.isArray(listOfStates) || listOfStates.length === 0) {
            console.error("toPwdlCommand: Invalid input - listOfStates must be a non-empty array.");
            return "";
        }

        const pythonCmdToUse = options.pythonCmd || "python3"; // Default to "python"
        const pwdlScriptPathToUse = options.pwdlScriptPath || "$HOME/pwdlv3/pwdl.py"; // Default path relative to HOME

        const firstItemName = listOfStates[0].name || '';
        // Sanitize for directory name using the modified getFirstWord logic
        const directoryName = Utils.getFirstWord(firstItemName).replace(/[^a-zA-Z0-9_\.-]/g, '_');
        const csvFileName = "data.csv"; // Standard CSV file name

        // Use the static helper method via the class name
        const csvData = Utils.convertToCSV(listOfStates);
        if (!csvData) {
            console.error("toPwdlCommand: Failed to convert data to CSV.");
            return "";
        }

        // Use standard btoa for Base64 encoding (browser environment)
        // If using Node.js, you might need Buffer.from(str).toString('base64')
        const base64Encode = typeof btoa === 'function' ? btoa : (str) => {
            if (typeof Buffer !== 'undefined') {
                return Buffer.from(str).toString('base64');
            } else {
                console.error("Base64 encoding function (btoa or Buffer) not available.");
                return ""; // Cannot encode without base64 support
            }
        };


        // Escape CSV data for use in bash 'cat <<EOF' here-doc.
        // Escape \, `, $ characters to prevent premature interpretation by the shell reading the here-doc content.
        const escapedCsvData = csvData.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');


        // --- Construct the multi-line bash script content template ---
        // Values from JS options will be substituted into this template.
        // NOTE: Substituting values directly like this can be risky if the values
        // contain characters that have meaning in bash string literals or commands.
        // We assume basic command names and file paths are used which are generally safe.
        const multiLineScriptTemplate = `#!/bin/bash
# This script is generated by the Utils.toPwdlCommand JavaScript function.
# It will be created and executed in the current directory.

# Set strict mode for better error handling
set -euo pipefail
# set -x # Uncomment for debugging (prints commands as they are executed)

# Use the Python interpreter command provided by the generating function
PYTHON_CMD="{{PYTHON_CMD}}"
# Use the PWD L script path provided by the generating function
PYTHON_SCRIPT="{{PYTHON_SCRIPT}}"

# The directory for the CSV data, relative to where this script is run (the current directory)
DIR_NAME="${directoryName}"
CSV_FILE_NAME="${csvFileName}"
# Full path to the CSV file within the subdirectory
CSV_FILE_PATH="\${DIR_NAME}/\${CSV_FILE_NAME}"

# Create the data subdirectory if it doesn't exist
echo "Creating data directory: \${DIR_NAME}..."
mkdir -p "\${DIR_NAME}"

# Create CSV file using a here-doc with a unique marker inside the data subdirectory
echo "Creating CSV file: \${CSV_FILE_PATH}..."
cat << 'EOF_PWD_L_CSV_DATA' > "\${CSV_FILE_PATH}"
${escapedCsvData}
EOF_PWD_L_CSV_DATA

# Check if CSV file was created successfully
if [ -f "\${CSV_FILE_PATH}" ]; then
    echo "CSV file created successfully: \${CSV_FILE_PATH}"
    echo "Running PWD L command..."
    # Check if the Python script exists at the expected path before executing
    if [ ! -f "$PYTHON_SCRIPT" ]; then
        echo "Error: PWD L script not found at expected path: $PYTHON_SCRIPT"
        echo "Please verify the path or manually edit the generated script file."
        exit 1 # Exit the script if pwdl.py is not found
    fi

    # Execute the pwdl script using the specified interpreter and path, passing the data directory using --dir.
    # --- EXECUTE PWD L COMMAND ---
    "$PYTHON_CMD" "$PYTHON_SCRIPT" --dir "\${DIR_NAME}" --csv-file "\${CSV_FILE_PATH}" --verbose
    # ---------------------------

    # Check the exit status of the pwdl command
    if [ $? -eq 0 ]; then
        echo "PWD L completed successfully."
    else
        echo "PWD L failed (exit code $?). Please check the output above."
        exit 1 # Propagate pwdl's failure as script failure
    fi
else
    echo "Error: Failed to create CSV file at \${CSV_FILE_PATH}."
    exit 1 # Exit with error code indicating file creation failed
fi

echo "Script finished."
`;
        // Using a unique EOF marker for the here-doc ('EOF_PWD_L_CSV_DATA') helps prevent conflicts
        // if the CSV data itself contains the string 'EOF'.

        // --- Substitute values into the template ---
        let finalMultiLineScript = multiLineScriptTemplate;
        finalMultiLineScript = finalMultiLineScript.replace('{{PYTHON_CMD}}', pythonCmdToUse);
        finalMultiLineScript = finalMultiLineScript.replace('{{PYTHON_SCRIPT}}', pwdlScriptPathToUse);


        // --- Encode the final multi-line script in Base64 ---
        const base64Script = base64Encode(finalMultiLineScript);

        if (!base64Script) {
            return ""; // Return empty string if encoding failed
        }

        // --- Construct the final bash one-liner command ---
        // This command will:
        // 1. Use mktemp to create a unique temporary script file name in the current directory (./).
        // 2. Decode the base64 string and save it to the temporary file.
        // 3. Make the temporary script file executable using chmod +x.
        // 4. Execute the temporary script using bash.
        // 5. Remove the temporary script file *after* the bash execution finishes (using ;),
        //    regardless of whether the bash script succeeded or failed.
        // Using '&&' ensures steps 1-4 run only if the previous one succeeded.
        const oneLinerCommand = `SCRIPT_FILE=$(mktemp ./run_pwdl_script.XXXXXX.sh) && echo '${base64Script}' | base64 -d > "$SCRIPT_FILE" && chmod +x "$SCRIPT_FILE" && bash "$SCRIPT_FILE" ; rm "$SCRIPT_FILE"`;

        return oneLinerCommand;
    }



};

export default Utils;