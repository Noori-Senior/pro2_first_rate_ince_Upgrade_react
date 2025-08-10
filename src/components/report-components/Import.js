//--------------------------------------------------------------------------------------------------------------
// Programer: AFG Sarwar
// Date: 12/30/2024
// Purpose: 
//--------------------------------------------------------------------------------------------------------------
import React from "react";
import { Button, Box, Menu, ActionIcon } from "@mantine/core";
import { IconFileTypeXls } from "@tabler/icons-react";
import { IMPORT_SVG } from "../../svgicons/svgicons";
import ImportFromExcel from "./ImportFromExcel";

export const Import = ({ onDataUpdate }) => {
    const [isDialogOpen, setIsDialogOpen] = React.useState(false); // State to control dialog visibility

    return (
        <Box display="flex" gap={2} style={{ flexDirection: 'column' }}>
            <Menu position="bottom-end" offset={-4} withArrow arrowPosition="center" closeOnItemClick={false} closeOnClickOutside={!isDialogOpen}>
                <Menu.Target>
                    <Button variant="subtle" className="rpt-action-button" leftIcon={<IMPORT_SVG />}>Import</Button>
                </Menu.Target>

                <Menu.Dropdown>
                    <Menu.Item className="rpt-action-button" component="div"
                      icon={<ActionIcon style={{ height: 30, width: 30, paddingBottom: 4 }}><IconFileTypeXls /></ActionIcon>}
                      onClick={() => setIsDialogOpen(true)}
                    >
                        <ImportFromExcel onDataUpdate = {onDataUpdate} />
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
            
        </Box>
        
    );
};