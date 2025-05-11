class DataService {
    /**
     * Generic method to fetch data from an API endpoint and transform it using a model class
     * @param {string} url - The API endpoint URL
     * @param {Function} modelClass - The class with a fromJSON method to transform the data
     * @returns {Promise<Array>} - A promise that resolves to an array of modeled objects
     * @throws {Error} - If the fetch fails or data mapping fails
     */
    static async fetch(url, modelClass) {
        if (!url) {
            throw new Error("URL is required");
        }

        console.log("Fetching data from:", url);
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const res = await response.json();
        const data = res.data;

        if (!Array.isArray(data)) {
            throw new Error("Expected an array but received: " + typeof data);
        }

        // Map the raw data to model objects
        const transformedData = data
            .map(item => {
                try {
                    return modelClass.fromJSON(item);
                } catch (error) {
                    console.error("Error mapping item:", item, error);
                    return null;
                }
            })
            .filter(item => item !== null);

        return transformedData;
    }
}

export default DataService;