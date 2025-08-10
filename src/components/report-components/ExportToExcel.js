import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Text } from "@mantine/core";

const ExportToExcel = ({ data, reportName }) => {
  // Function to export data to Excel
  const exportToExcel = () => {
    const spreadSheetName = reportName + '.xlsx';

    // Filter out the 'RECDTYPE' field from each object in the data array
    const filteredData = data.map(item => {
      const { RECDTYPE, ...rest } = item; // Destructure to remove RECDTYPE
      return rest; // Return the rest of the fields
    });

    // Create a worksheet
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    // Create a workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, reportName);

    // Write the workbook and save it
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(dataBlob, spreadSheetName);
  };

  return (
      <Text onClick={exportToExcel} > Download as Excel </Text>
  );
};

export default ExportToExcel;
