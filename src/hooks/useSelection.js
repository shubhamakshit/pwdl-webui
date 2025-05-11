import { useState, useCallback, useMemo } from 'react';

/**
 * Custom hook for managing selections in a list
 *
 * @param {Array} items - The list of items that can be selected
 * @param {string} idField - The field to use as the unique identifier for each item (default: 'id')
 * @returns {Object} Selection state and handlers
 */
const useSelection = (items = [], idField = 'id') => {
    const [selectedItems, setSelectedItems] = useState([]);

    // Get the unique identifier for an item
    const getItemId = useCallback((item) => {
        return item[idField] || item.slug || item.name || JSON.stringify(item);
    }, [idField]);

    // Check if an item is selected
    const isSelected = useCallback((item) => {
        const itemId = getItemId(item);
        return selectedItems.some(selectedId => selectedId === itemId);
    }, [selectedItems, getItemId]);

    // Handle selection/deselection of an item
    const handleSelect = useCallback((item, isSelected) => {
        const itemId = getItemId(item);

        setSelectedItems(prev => {
            if (isSelected) {
                return [...prev, itemId];
            } else {
                return prev.filter(id => id !== itemId);
            }
        });
    }, [getItemId]);

    // Clear all selections
    const clearSelection = useCallback(() => {
        setSelectedItems([]);
    }, []);

    // Select all items
    const selectAll = useCallback(() => {
        setSelectedItems(items.map(item => getItemId(item)));
    }, [items, getItemId]);

    // Get the selected items objects (not just IDs)
    const selectedItemsData = useMemo(() => {
        const selectedIds = new Set(selectedItems);
        return items.filter(item => selectedIds.has(getItemId(item)));
    }, [items, selectedItems, getItemId]);

    return {
        selectedItems,
        selectedItemsData,
        isSelected,
        handleSelect,
        clearSelection,
        selectAll
    };
};

export default useSelection;