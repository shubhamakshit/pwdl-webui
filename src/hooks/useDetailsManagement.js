// src/hooks/useDetailsManagement.js
import { useState, useMemo } from "react";

/**
 * Custom hook to manage details list state and operations
 * @param {Boolean} isDownloading - Current download status
 * @returns {Object} - Details state and operations
 */
const useDetailsManagement = (isDownloading) => {
    const [listOfDetails, setListOfDetails] = useState([
        {
            id: 0,
            state: {
                name: "",
                id: '',
                batch_name: '',
                topic_name: '',
                lecture_url: ''
            }
        }
    ]);

    // Check if all details are valid
    const areAllValid = useMemo(() =>
            (listOfDetails.every(detail =>
                detail.state.id !== "" &&
                detail.state.name !== "" &&
                detail.state.batch_name !== ""
            ) && !isDownloading && listOfDetails.length > 0),
        [listOfDetails, isDownloading]
    );

    // Update a detail item
    const updateElement = (id, newState) => {
        setListOfDetails((old) => {
            const newList = [...old];
            const index = newList.findIndex(item => item.id === id);
            if (index !== -1) {
                newList[index].state = newState;
            }
            return newList;
        });
    };

    // Delete a detail item
    const deleteElement = (id) => {
        setListOfDetails(old => old.filter(item => item.id !== id));
    };

    // Add a new detail item
    const addElement = () => {
        setListOfDetails(old => {
            const newId = old.length > 0 ? Math.max(...old.map(item => item.id)) + 1 : 0;
            return [...old, {
                id: newId,
                state: {
                    name: "",
                    id: '',
                    batch_name: '',
                    topic_name: '',
                    lecture_url: ''
                }
            }];
        });
    };

    // Get all details states for processing
    const getAllDetailsStates = () => {
        return listOfDetails.map(item => item.state);
    };

    return {
        listOfDetails,
        areAllValid,
        updateElement,
        deleteElement,
        addElement,
        getAllDetailsStates
    };
};

export default useDetailsManagement;