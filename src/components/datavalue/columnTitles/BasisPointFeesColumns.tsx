import React, { useState } from "react";
import { type MRT_ColumnDef } from "mantine-react-table";
import { IconCalendar } from "@tabler/icons-react";
import { DatePickerInput } from "@mantine/dates";
import { formatDate } from "../../hooks/FormatDates.tsx";
import { Select } from "@mantine/core";
import { airYN } from "./DemographicsDDL.tsx";

export type BasisPointFeesFields = {
  id: string;
  ACCT: string;
  NAME: string;
  GSNAME: string;
  NSNAME: string;
  GROSS_SECTOR: string;
  NET_SECTOR: string;
  BPDATE: string;
  ANN_BP_FEE: number;
  BPACTIVE: string;
  RECDTYPE: string;
};

// Function to generate unique dropdown options dynamically
const getUniqueOptionsSingle = (rows: BasisPointFeesFields[], valueKey: string) => {
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
export const useBasisPointFeesColumns = (
  data: BasisPointFeesFields[],
  setData: (data: BasisPointFeesFields[]) => void, // Add a setData function to update the parent state
  isEditAble: boolean,
): MRT_ColumnDef<BasisPointFeesFields>[] => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | "">
  >({});


  return [
    {
      accessorKey: "ACCT",
      header: "Portfolio ID",
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      enableEditing: isEditAble,
      editVariant: "select",
      mantineEditSelectProps: {
        data: getUniqueOptionsSingle(data, "ACCT"),
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
      accessorKey: "GROSS_SECTOR",
      header: "Gross Sector ID",
      enableEditing: isEditAble,
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      editVariant: "select",
      mantineEditSelectProps: {
        data: getUniqueOptionsSingle(data, "GROSS_SECTOR"),
      },
    },
    {
      accessorKey: "GSNAME",
      header: "Gross Sector Name",
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      enableEditing: false, // Make this column non-editable
    },
    {
      accessorKey: "NET_SECTOR",
      header: "Net Sector ID",
      enableEditing: isEditAble,
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      editVariant: "select",
      mantineEditSelectProps: {
        data: getUniqueOptionsSingle(data, "NET_SECTOR"),
      },
    },
    {
      accessorKey: "NSNAME",
      header: "Net Sector Name",
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      enableEditing: false,
    },
    {
      accessorKey: 'BPDATE',
      header: 'Activation Date',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      enableEditing: isEditAble,
    
      // Edit mode: Show DatePickerInput
      Edit: ({ row, table, cell }) => {
        const initialBPDate = formatDate(row.original.BPDATE?.toString()); // Expecting format: YYYY/MM/DD
    
        // State to track selected date
        const [bpDateValue, setBPDateValue] = useState<Date | null>(initialBPDate || new Date());
    
        return (
          <DatePickerInput
            icon={<IconCalendar size={24} stroke={2.0} />}
            label="Activation Date"
            value={bpDateValue}
            disabled={!isEditAble}
            onChange={(selectedDate) => {
              if (!selectedDate) return;
    
              // Format selected date as YYYY-MM-DD
              const year = selectedDate.getFullYear();
              const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
              const day = String(selectedDate.getDate()).padStart(2, '0');
              const formattedDate = `${year}-${month}-${day}`;
    
              setBPDateValue(selectedDate); // Update local state
              row.original.BPDATE = formattedDate;
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;

              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.BPDATE = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.BPDATE = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              }
    
              // Update the selected value in the table state
              const updatedRows = table.getRowModel().rows.map((r) =>
                r.id === cell.row.id
                  ? { ...r.original, BPDATE: formattedDate } // Update BPDATE
                  : r.original
              );
              setData(updatedRows); // Update table state
            }}
          />
        );
      },
    
      // Display mode: Show formatted date
      Cell: ({ cell }) => {
        const dateValue = cell.getValue<string>(); // Ensure it's a string
        if (!dateValue) return ''; // Handle empty values
    
        const formattedDate = new Date(dateValue).toLocaleDateString('en-CA', {
          year: 'numeric',
          month: '2-digit',
        });
    
        return formattedDate.replace('-', '/').replace('-', '/'); // Convert YYYY-MM to YYYY/MM
      },
    },
    {
      accessorKey: "ANN_BP_FEE",
      header: "Annual Basis Point Fee",
      mantineEditTextInputProps: {
        type: "number",
        error: validationErrors["ANN_BP_FEE"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, ANN_BP_FEE: "" }),
        maxLength: 7,
      },
      mantineTableHeadCellProps: {
        align: "right",
        className: 'rpt-header-3',
      },
      mantineTableBodyCellProps: {
        align: "right",
      },
      Cell: ({ cell }) =>
        cell.getValue<number>()?.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
    {
      accessorKey: 'BPACTIVE', 
      header: 'Active',
      size: 100,
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      // Edit mode: Dropdown with correct selected value
      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(cell.getValue<string>() || '-');
        return (
          <Select
            label="Active"
            data={airYN}
            value={value} 
            onChange={(selectedValue) => {
              setValue(selectedValue);

              row.original.BPACTIVE = selectedValue ?? '';
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;

              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.BPACTIVE = selectedValue;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.BPACTIVE = selectedValue;
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              const selectedVal = airYN.find((option) => option.value === selectedValue);
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table.getRowModel().rows.map((r) =>
                  r.id === cell.row.id
                ? { ...r.original, BPACTIVE: selectedValue || '' } : r.original
                );
                setData(updatedRows);
              }
            }}
          />
        );
      },
      Cell: ({ cell }) => {
        const value = cell.getValue<string>();
        return value === "Y" ? "Yes" : value === "N" ? "No" : "-"; // Display '-' for null or empty values
      }
    },
  ];
};
