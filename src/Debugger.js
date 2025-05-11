class WebDebugger {
    static STYLES = {
        INFO: 'color: #00BCD4; font-weight: bold',
        SUCCESS: 'color: #4CAF50; font-weight: bold',
        DEBUG: 'color: #FFC107; font-weight: bold',
        WARNING: 'color: #FF4081; font-weight: bold',
        ERROR: 'color: #FF5252; font-weight: bold',
        CRITICAL: 'color: #FF1744; font-weight: bold',
        VAR: 'color: #2196F3; font-weight: bold',
        DIM: 'color: #757575',
    };

    static LEVELS = {
        INFO: 0,
        SUCCESS: 0,
        DEBUG: 1,
        WARNING: 2,
        ERROR: 3,
        CRITICAL: 4,
    };

    constructor(options = {}) {
        this.enabled = options.enabled ?? true;
        this.level = WebDebugger.LEVELS[options.level?.toUpperCase()] ?? 0;
        this.showTime = options.showTime ?? true;
        this.showLocation = options.showLocation ?? true;
    }

    _getTime() {
        return new Date().toISOString().replace('T', ' ').split('.')[0];
    }

    _getLocation() {
        const stack = new Error().stack;
        const caller = stack.split('\n')[3];
        const match = caller.match(/at\s+(.*)\s+\((.*):(\d+):(\d+)\)/);
        if (match) {
            const [, , file, line] = match;
            return `${file.split('/').pop()}:${line}`;
        }
        return 'unknown';
    }

    _formatPrefix(level) {
        const parts = [];
        const styles = [];

        parts.push(`%c[${level}]`);
        styles.push(WebDebugger.STYLES[level]);

        if (this.showTime) {
            parts.push(`%c[${this._getTime()}]`);
            styles.push(WebDebugger.STYLES.DIM);
        }

        if (this.showLocation) {
            parts.push(`%c[${this._getLocation()}]`);
            styles.push(WebDebugger.STYLES.DIM);
        }

        return { parts, styles };
    }

    log(message, level = 'INFO') {
        if (!this.enabled || WebDebugger.LEVELS[level] < this.level) return;

        const { parts, styles } = this._formatPrefix(level);
        parts.push(`%c${message}`);
        styles.push(WebDebugger.STYLES[level]);

        console.log(parts.join(' '), ...styles);
    }

    info(message) { this.log(message, 'INFO'); }
    success(message) { this.log(message, 'SUCCESS'); }
    debug(message) { this.log(message, 'DEBUG'); }
    warning(message) { this.log(message, 'WARNING'); }
    error(message) { this.log(message, 'ERROR'); }
    critical(message) { this.log(message, 'CRITICAL'); }

    async var(variable, name = 'value') {
        const level = 'VAR';
        const { parts, styles } = this._formatPrefix(level);

        if (variable === null) {
            console.log(`${parts.join(' ')} %c${name}: null`, ...styles, WebDebugger.STYLES.VAR);
        } else if (variable === undefined) {
            console.log(`${parts.join(' ')} %c${name}: undefined`, ...styles, WebDebugger.STYLES.VAR);
        } else if (variable instanceof Promise) {
            console.groupCollapsed(`${parts.join(' ')} %c${name}: Promise <pending>`, ...styles, WebDebugger.STYLES.VAR);
            try {
                const result = await variable;
                console.log('%cResolved value:', WebDebugger.STYLES.DIM);
                console.dir(result);
            } catch (error) {
                console.log('%cRejected with error:', WebDebugger.STYLES.DIM);
                console.dir(error);
            }
            console.groupEnd();
        } else if (typeof variable === 'object') {
            console.groupCollapsed(`${parts.join(' ')} %c${name}: ${Array.isArray(variable) ? 'Array' : 'Object'}`, ...styles, WebDebugger.STYLES.VAR);
            console.dir(variable);
            console.groupEnd();
        } else if (typeof variable === 'string') {
            console.log(`${parts.join(' ')} %c${name} (string, length=${variable.length}): "${variable}"`, ...styles, WebDebugger.STYLES.VAR);
        } else {
            console.log(`${parts.join(' ')} %c${name} (${typeof variable}): ${variable}`, ...styles, WebDebugger.STYLES.VAR);
        }
    }
}

// Export for use in Next.js
export const debug = new WebDebugger();
