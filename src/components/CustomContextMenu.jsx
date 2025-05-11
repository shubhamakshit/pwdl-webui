import { Menu, MenuItem } from "@mui/material";

const CustomContextMenu = ({ contextMenu, handleClose, options }) => {
    const handleOptionClick = (key, e) => {
        const option = options[key];

        if (!option) {
            console.error('Invalid option key');
            return;
        }

        if (option.action) {
            option.action(e);
        } else if (option.href) {
            window.open(option.href, '_blank', 'noopener,noreferrer');
        } else {
            console.error('No valid action or href found for this option');
        }

        handleClose(e);
    };

    return (
        <Menu
            open={contextMenu !== null}
            onClose={handleClose}
            anchorReference="anchorPosition"
            anchorPosition={
                contextMenu
                    ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                    : undefined
            }
        >
            {Object.entries(options).map(([key, option]) => (
                <MenuItem
                    key={key}
                    onClick={(e) => handleOptionClick(key, e)}
                    sx={{ color: option.color }}
                >
                    {option.label}
                </MenuItem>
            ))}
        </Menu>
    );
};

export default CustomContextMenu;