import { useState } from "react";
import { type MRT_ColumnDef } from "mantine-react-table";
import { IconCalendar } from "@tabler/icons-react";
import { DatePickerInput } from "@mantine/dates";
import { useHdirect1DDLID, useHdirect2DDLID, useHdirect3DDLID } from "../../hooks/useFrpNamesFiltersDDLsApi.js";
import { Select } from "@mantine/core";

export type DirectedAssetsFields = {
  id: string;
  AACCT: string;
  NAME: string;
  HID: string;
  NAMETKR: string;
  SNAME1: string;
  SNAME2: string;
  SNAME3: string;
  HDIRECT1: string;
  HDIRECT2: string;
  HDIRECT3: string;
  USEDEF: string;
  DATETIME_STAMP: string;
  RECDTYPE: string;
};

// Function to generate unique dropdown options dynamically
const getUniqueOptionsSingle = (rows: DirectedAssetsFields[], valueKey: string) => {
  const uniqueValues = new Set(); // Use a Set to track unique values
  return rows
    .filter((row) => {
      // Check if the value is already in the Set
      if (!uniqueValues.has(row[valueKey])) {
        uniqueValues.add(row[valueKey]); // Add the value to the Set
        return true; // Include this row in the result
      }
      return false; // Skip this row (duplicate value)
    })
    .map((row) => ({
      label: `${row[valueKey]}`, // Show label and value together
      value: row[valueKey], // Use HID as the value for selection
    }));
};

// Column definitions as a separate component
export const useDirectedAssetsColumns = (
  data: DirectedAssetsFields[],
  setData: (data: DirectedAssetsFields[]) => void, // Add a setData function to update the parent state
  isEditAble: boolean,
  client: any, // Assuming you have a client object for API calls
): MRT_ColumnDef<DirectedAssetsFields>[] => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | "">
  >({});

  const hdirect1DDLID = useHdirect1DDLID(client, 'FRPDRCTD'); // Fetching the data for HDIRECT1 dropdown 
  const hdirect2DDLID = useHdirect2DDLID(client, 'FRPDRCTD'); // Fetching the data for HDIRECT2 dropdown 
  const hdirect3DDLID = useHdirect3DDLID(client, 'FRPDRCTD'); // Fetching the data for HDIRECT3 dropdown

  return [
    {
      accessorKey: "AACCT",
      header: "Portfolio ID",
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      enableEditing: isEditAble,
      editVariant: "select",
      mantineEditSelectProps: {
        data: getUniqueOptionsSingle(data, "AACCT"),
        required: true,
      },
      size: 120,
    },
    {
      accessorKey: "NAME",
      header: "Portfolio Name",
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      enableEditing: false,
      size: 250,
    },
    {
      accessorKey: "HID",
      header: "Asset ID",
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      editVariant: "select",
      enableEditing: isEditAble,
      mantineEditSelectProps: {
        data: getUniqueOptionsSingle(data, "HID"),
        required: true,
      },
    },
    {
      accessorKey: "NAMETKR",
      header: "Asset Name",
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      enableEditing: false,
    },
    {
      accessorKey: "HDIRECT1",
      header: "Sector 1 ID",
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      
      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(cell.getValue<string>());
        const airHD1 = (hdirect1DDLID.data ?? []).map((hd1: any) => ({ value: hd1.HDIRECT1, label: hd1.SNAME1 + ` ( ${hd1.HDIRECT1} )` }));
        return (
          <Select
            label="Sector 1 ID"
            data={airHD1}
            value={value} 
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.HDIRECT1 = selectedValue || ''; // Update the original data
              // determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.HDIRECT1 = selectedValue || '';
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.HDIRECT1 = selectedValue || '';
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Update the original data with the selected value
              const selectedVal = airHD1.find((option) => option.value === selectedValue);
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table.getRowModel().rows.map((r) =>
                  r.id === cell.row.id
                ? { 
                    ...r.original, 
                    SNAME1: selectedVal ? selectedVal.label.split('(')[0] : '', 
                    HDIRECT1: selectedValue ? selectedValue : '' 
                  } 
                : r.original
                );
                setData(updatedRows);
              }
            }}
            searchable
            filter={(value, item) =>
              item.label?.toLowerCase().includes(value.toLowerCase().trim()) ?? false
            }
            nothingFound="No options found"
          />
        );
      }
    },
    {
      accessorKey: "SNAME1",
      header: "Sector 1 Name",
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      enableEditing: false, // Make this column non-editable
    },
    {
      accessorKey: "HDIRECT2",
      header: "Sector 2 ID",
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },

      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(cell.getValue<string>());
        const airHD2 = (hdirect2DDLID.data ?? []).map((hd2: any) => ({ value: hd2.HDIRECT2, label: hd2.SNAME2 + ` ( ${hd2.HDIRECT2} )` }));
        return (
          <Select
            label="Sector 2 ID"
            data={airHD2}
            value={value} 
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.HDIRECT2 = selectedValue || ''; // Update the original data
              // determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.HDIRECT2 = selectedValue;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.HDIRECT2 = selectedValue;
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Update the original data with the selected value
              const selectedVal = airHD2.find((option) => option.value === selectedValue);
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table.getRowModel().rows.map((r) =>
                  r.id === cell.row.id
                ? { 
                    ...r.original, 
                    SNAME2: selectedVal ? selectedVal.label.split('(')[0] : '', 
                    HDIRECT2: selectedValue ? selectedValue : '' 
                  } 
                : r.original
                );
                setData(updatedRows);
              }
            }}
            searchable
            filter={(value, item) =>
              item.label?.toLowerCase().includes(value.toLowerCase().trim()) ?? false
            }
            nothingFound="No options found"
          />
        );
      }
    },
    {
      accessorKey: "SNAME2",
      header: "Sector 2 Name",
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      enableEditing: false,
    },
    {
      accessorKey: "HDIRECT3",
      header: "Sector 3 ID",
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },

      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(cell.getValue<string>());
        const airHD3 = (hdirect3DDLID.data ?? []).map((hd3: any) => ({ value: hd3.HDIRECT3, label: hd3.SNAME3 + ` ( ${hd3.HDIRECT3} )` }));
        return (
          <Select
            label="Sector 3 ID"
            data={airHD3}
            value={value} 
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.HDIRECT3 = selectedValue || ''; // Update the original data
              // determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.HDIRECT3 = selectedValue;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.HDIRECT3 = selectedValue;
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Update the original data with the selected value
              const selectedVal = airHD3.find((option) => option.value === selectedValue);
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table.getRowModel().rows.map((r) =>
                  r.id === cell.row.id
                ? { 
                    ...r.original, 
                    SNAME3: selectedVal ? selectedVal.label.split('(')[0] : '', 
                    HDIRECT3: selectedValue ? selectedValue : '' 
                  } 
                : r.original
                );
                setData(updatedRows);
              }
            }}
            searchable
            filter={(value, item) =>
              item.label?.toLowerCase().includes(value.toLowerCase().trim()) ?? false
            }
            nothingFound="No options found"
          />
        );
      }
    },
    {
      accessorKey: "SNAME3",
      header: "Sector 3 Name",
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      enableEditing: false,
    },
    {
      accessorKey: "USEDEF",
      header: "Client Alpha",
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["USEDEF"],
        maxLength: 48,
        onFocus: () =>
          setValidationErrors({ ...validationErrors, USEDEF: "" }),
      },
    },
    {
      accessorKey: 'DATETIME_STAMP',
      header: 'Date Time Stamp',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
    
      // Edit mode: Show DatePickerInput
      Edit: ({ row, table, cell }) => {
        const initialADate = row.original.DATETIME_STAMP ? new Date(row.original.DATETIME_STAMP) : new Date();
    
        // State to track selected date
        const [aDateValue, setADateValue] = useState<Date | null>(initialADate);
    
        return (
          <DatePickerInput
            icon={<IconCalendar size={24} stroke={2.0} />}
            label="Date Time Stamp"
            value={aDateValue}
            onChange={(selectedDate) => {
              if (!selectedDate) return;
    
              // Format selected date as YYYY-MM-DD HH:MM:SS.SSS
              const year = selectedDate.getFullYear();
              const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
              const day = String(selectedDate.getDate()).padStart(2, '0');
              const hours = String(selectedDate.getHours()).padStart(2, '0');
              const minutes = String(selectedDate.getMinutes()).padStart(2, '0');
              const seconds = String(selectedDate.getSeconds()).padStart(2, '0');
              const milliseconds = String(selectedDate.getMilliseconds()).padStart(3, '0');
              
              const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
    
              setADateValue(selectedDate); // Update local state
              row.original.DATETIME_STAMP = formattedDate;
              
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
    
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.ADATE = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.ADATE = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              }
    
              // Update the selected value in the table state
              const updatedRows = table.getRowModel().rows.map((r) =>
                r.id === cell.row.id
                  ? { ...r.original, ADATE: formattedDate }
                  : r.original
              );
              setData(updatedRows); // Update table state
            }}
          />
        );
      },
    
      // Display mode: Show formatted date
      Cell: ({ cell }) => {
        const dateValue = cell.getValue<string>();
        if (!dateValue) return ''; // Handle empty values
    
        try {
          const date = new Date(dateValue);
          return date.toLocaleString('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          }).replace(/,/g, ''); // Remove commas from the formatted string
        } catch (e) {
          return dateValue; // Return raw value if parsing fails
        }
      },
    }
  ];
};
