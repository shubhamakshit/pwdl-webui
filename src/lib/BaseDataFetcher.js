// BaseDataFetcher.js
export default class BaseDataFetcher {
    constructor(apiEndpoint, modelMapper) {
        this.apiEndpoint = apiEndpoint;
        this.modelMapper = modelMapper;
    }

    async fetchData() {
        try {
            const response = await fetch(this.apiEndpoint);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            const data = result.data;

            if (!Array.isArray(data)) {
                throw new Error("Expected an array but received: " + typeof data);
            }

            return data.map(this.modelMapper);
        } catch (error) {
            console.error("Failed to fetch data:", error);
            return [];
        }
    }
}