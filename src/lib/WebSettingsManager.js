'use client';

class WebSettingsManager {
    static defaultTheme = {
        palette: {
            mode: "dark"
        },
        typography: {
            fontFamily: [
                'Ubuntu',
                'Poppins',
            ].join(','),
            h1: {
                fontFamily: 'Ubuntu Mono',
                fontSize: 40,
                fontWeight: 700
            },
            htmlFontSize: 10,
            fontSize: 10
        },
        shape: {
            borderRadius: 10
        }
    };

    static defaultSettings = {
        api:{
            value : "",
            tooltip: "API URL"

        },
        batch_name: {
            value: ["default-batch-1", "default-batch-2"],
            tooltip: "Batch Name"
        },
        khazana_enabled: {
            value: false,
            tooltip: "Khazana Enabled"
        },
        dark_mode: {
            value: false,
            tooltip: "Dark Mode"
        },
        login_enabled: {
            value: false,
            tooltip: "Login Enabled"
        },
        name: {
            value: '',
            tooltip: "Your Name (not unique)"
        },
        custom_theme: {
            value: WebSettingsManager.defaultTheme,
            tooltip: "Custom Theme"
        }
    };

    // Initialize settingsWithTooltips with the stored values or defaults
    static settingsWithTooltips = (() => {
        if (typeof window !== 'undefined') {
            const storedSettings = localStorage.getItem('settings');
            if (storedSettings) {
                try {
                    const parsedSettings = JSON.parse(storedSettings);
                    // Merge stored values with default tooltips
                    return Object.keys(WebSettingsManager.defaultSettings).reduce((acc, key) => {
                        acc[key] = {
                            value: parsedSettings[key] ?? WebSettingsManager.defaultSettings[key].value,
                            tooltip: WebSettingsManager.defaultSettings[key].tooltip
                        };
                        return acc;
                    }, {});
                } catch (error) {
                    console.error('Error parsing stored settings:', error);
                }
            }
        }
        return {...WebSettingsManager.defaultSettings};
    })();

    static additionalUpdates = {
        name: (newName) => {
            if (typeof window !== 'undefined') {
                localStorage.setItem('client-name', newName);
            }
        },
        login_enabled: async (login_enabled) => {
            if (typeof window !== 'undefined' &&
                localStorage.getItem('settings')) {
                const currentSettings = JSON.parse(localStorage.getItem('settings'));
                if (currentSettings['login_enabled'] !== login_enabled) {
                    try {
                        const response = await fetch('/api/auth/reset-token');
                        const data = await response.json();
                        // Handle token reset response
                    } catch (error) {
                        console.error('Error resetting token:', error);
                    }
                }
            }
        }
    };

    static getSettings() {
        return Object.fromEntries(
            Object.entries(this.settingsWithTooltips).map(([key, {value}]) => [key, value])
        );
    }

    static getTooltips() {
        return Object.fromEntries(
            Object.entries(this.settingsWithTooltips).map(([key, {tooltip}]) => [key, tooltip])
        );
    }

    static changeValue(key, value) {
        if (key in this.settingsWithTooltips) {
            this.settingsWithTooltips[key].value = value;
            this.saveSettingsToLocalStorage(); // Save immediately when a value changes
        }
    }

    static getValue(key) {
        return this.settingsWithTooltips[key]?.value;
    }

    static saveSettingsToLocalStorage() {
        if (typeof window === 'undefined') return;

        const settings = this.getSettings();
        Object.keys(settings).forEach((key) => {
            if (this.additionalUpdates[key]) {
                this.additionalUpdates[key](settings[key]);
            }
        });
        localStorage.setItem('settings', JSON.stringify(settings));
    }

    static loadSettingsFromLocalStorage() {
        if (typeof window === 'undefined') return;

        const settings = localStorage.getItem('settings');
        if (settings) {
            try {
                const parsedSettings = JSON.parse(settings);
                // Only update existing keys, don't overwrite the entire object
                Object.keys(this.settingsWithTooltips).forEach(key => {
                    if (key in parsedSettings) {
                        this.settingsWithTooltips[key].value = parsedSettings[key];
                    }
                });
            } catch (error) {
                console.error('Error loading settings:', error);
            }
        }
    }

    static resetSettings() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('settings');
            // Reset to default values
            this.settingsWithTooltips = {...this.defaultSettings};
            window.location.reload();
        }
    }

    static updateSettings(newSettings) {
        let hasChanges = false;
        Object.keys(newSettings).forEach(key => {
            if (key in this.settingsWithTooltips) {
                const oldValue = this.settingsWithTooltips[key].value;
                const newValue = newSettings[key];

                // Check if the value has actually changed
                if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                    this.settingsWithTooltips[key].value = newValue;
                    hasChanges = true;
                }
            }
        });

        // Only save if there were actual changes
        if (hasChanges) {
            this.saveSettingsToLocalStorage();
        }
    }

    // Initialize settings when the class is loaded
    static initialize() {
        if (typeof window !== 'undefined') {
            this.loadSettingsFromLocalStorage();
        }
    }
}

// Initialize settings when the module is loaded
WebSettingsManager.initialize();

export default WebSettingsManager;