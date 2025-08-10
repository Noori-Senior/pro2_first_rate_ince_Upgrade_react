//--------------------------------------------------------------------------------------------------------------
// Programer: AFG Sarwar
// Date: 12/30/2024
// Purpose: 
//--------------------------------------------------------------------------------------------------------------
import React from "react";
import { Box, Button, Menu, ActionIcon } from "@mantine/core";
import { IconFileTypeXls, IconFileTypePdf } from "@tabler/icons-react";
import { EXPORT_SVG } from "../../svgicons/svgicons";
import ExportToExcel from "./ExportToExcel";
import ExportTableToPdf from "./ExportTableToPdf";

export const Export = ({ data, excelData, reportName, PDFheaders, portfolioName, dateRange }) => {
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Menu position="bottom-end" offset={-4} withArrow arrowPosition="center" closeOnItemClick={false}>
        <Menu.Target>
          <Button variant="subtle" className="rpt-action-button" leftIcon={<EXPORT_SVG />}>Export</Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item className="rpt-action-button" icon={<ActionIcon style={{ height: 30, width: 30, paddingBottom: 4 }}><IconFileTypeXls /></ActionIcon>} component="div">
            <ExportToExcel data={excelData} reportName={reportName.replace(/[^\d]/g, '').replace(/^/, 'Report To Excel')} />
          </Menu.Item>
          <Menu.Divider></Menu.Divider>
          <Menu.Item className="rpt-action-button" icon={<ActionIcon style={{ height: 30, width: 30, paddingBottom: 4 }}><IconFileTypePdf /></ActionIcon>} component="div">
            <ExportTableToPdf
              data={data}
              PDFheaders={PDFheaders}
              reportName={reportName}
              portfolioName={portfolioName}
              dateRange={dateRange}
            />
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Box>
  );
};