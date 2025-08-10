import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Text,  Modal, FileInput, Table } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

const ImportFromExcel = ({ onDataUpdate }) => {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);

  const [opened, { open, close }] = useDisclosure(false);

  const handleFileUpload = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length) {
            // Extract headers from the first row
            const headers = jsonData[0];
            const tableColumns = headers.map((header) => ({
              accessorKey: header,
              header: header,
            }));

          // Use headers as keys for each row
          const tableRows = jsonData.slice(1).map((row) =>
            headers.reduce((acc, header, index) => {
              acc[header] = row[index] || ''; // Handle undefined cells gracefully
              return acc;
            }, {})
          );

          setColumns(tableColumns);
          setRows(tableRows);

          // Notify parent component of updated data
          if (onDataUpdate) {
            onDataUpdate(tableRows);
          }
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div>
      <Text onClick={open} style={{fontSize: '11pt', marginLeft: 0,}}>Upload Excel</Text>
      <Modal opened={opened} onClose={close} title="Upload Excel File" centered>
        <FileInput 
          label="Upload Excel File"
          description="Upload an Excel file to load current Data Grid"
          placeholder="Select a excel file for the current Data Grid"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
        />
        <Table>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} align="center">
                  No data available
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan={columns.length} align="center">
                  File Uploaded Successfully!
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Modal>
    </div>
  );
};

export default ImportFromExcel;
