import BaseCard from "./BaseCard";

/**
 * A specialized card component for displaying data information
 *
 * @param {Object} props - Component props
 * @param {Object} props.data - The data object to display
 * @param {Function} props.onClick - Function to call when the card is clicked
 * @param {string} props.image - Optional image URL to display
 * @param {boolean} props.selectable - Whether the data can be selected
 * @param {Function} props.onSelect - Function to call when the data is selected/deselected
 * @param {boolean} props.selected - Whether the data is initially selected
 * @param {Array<string>} props.fields - Array of field names to display dynamically
 * @returns {JSX.Element} - The rendered component
 */
const DataCard = ({
                      data,
                      onClick,
                      image,
                      selectable = false,
                      onSelect = () => {},
                      selected = false,
                      fields = [],
                      gridSize
                  }) => {
    return (
        <BaseCard
            data={data}
            onClick={onClick}
            image={image}
            selectable={selectable}
            onSelect={onSelect}
            selected={selected}
            fields={fields}
            gridSize={gridSize}
        />
    );
};

export default DataCard;