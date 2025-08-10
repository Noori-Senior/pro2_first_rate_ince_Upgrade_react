import React, { useState } from "react";
import { type MRT_ColumnDef } from "mantine-react-table";
import { IconCalendar } from "@tabler/icons-react";
import { DatePickerInput } from "@mantine/dates";
import { formatDate } from "../../hooks/FormatDates.tsx";

export type IndexFields = {
  id: string;
  INDX: string;
  IDATE: string;
  IPRICE: number;
  IINC: number;
  IRET: number;
  SORINAME: string;
  RECDTYPE: string;
};

// Function to generate unique dropdown options dynamically
const getUniqueOptionsSingle = (rows: IndexFields[], valueKey: string) => {
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
export const useIndexColumns = (
  data: IndexFields[],
  setData: (data: IndexFields[]) => void,
  isEditAble: boolean,
  isDaily: boolean = false // Add a flag to distinguish between daily and monthly
): MRT_ColumnDef<IndexFields>[] => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string | "">>({});

  return [
    {
      accessorKey: "INDX",
      header: "Benchmark ID",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      enableEditing: isEditAble,
      editVariant: "select",
      mantineEditSelectProps: {
        data: getUniqueOptionsSingle(data, "INDX"),
      },
    },
    {
      accessorKey: "SORINAME",
      header: "Benchmark Name",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      enableEditing: false, // Make this column non-editable
    },
    {
      accessorKey: "IDATE",
      header: "Benchmark Date",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      enableEditing: isEditAble,

      // Edit mode: Show DatePickerInput
      Edit: ({ row, table, cell }) => {
        const initialIDate = formatDate(row.original.IDATE?.toString()); // Expecting format: YYYY/MM/DD

        // State to track selected date
        const [iDateValue, setIDateValue] = useState<Date | null>(initialIDate || new Date());

        return (
          <DatePickerInput
            icon={<IconCalendar size={24} stroke={2.0} />}
            label="Benchmark Date"
            value={iDateValue}
            disabled={!isEditAble}
            onChange={(selectedDate) => {
              if (!selectedDate) return;

              // Format selected date as YYYY-MM-DD
              const year = selectedDate.getFullYear();
              const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
              const day = String(selectedDate.getDate()).padStart(2, "0");
              const formattedDate = `${year}-${month}-${day}`;

              setIDateValue(selectedDate); // Update local state
              row.original.IDATE = formattedDate;
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;

              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.IDATE = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.IDATE = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              }

              // Update the selected value in the table state
              const updatedRows = table.getRowModel().rows.map((r) =>
                r.id === cell.row.id
                  ? { ...r.original, IDATE: formattedDate } // Update IDATE
                  : r.original
              );
              setData(updatedRows); // Update table state
            }}
          />
        );
      },

      // Display mode: Show formatted date (different for daily vs monthly)
      Cell: ({ cell }) => {
        const dateValue = cell.getValue<string>(); // Ensure it's a string
        if (!dateValue) return ""; // Handle empty values

        if (isDaily) {
          // Daily format: YYYY/MM/DD
          const formattedDate = new Date(dateValue).toLocaleDateString("en-CA", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });
          return formattedDate.replace("-", "/").replace("-", "/");
        } else {
          // Monthly format: YYYY/MM
          const formattedDate = new Date(dateValue).toLocaleDateString("en-CA", {
            year: "numeric",
            month: "2-digit",
          });
          return formattedDate.replace("-", "/").replace("-", "/");
        }
      },
    },
    {
      accessorKey: "IPRICE",
      header: "Index Price",
      mantineEditTextInputProps: {
        type: "number",
        error: validationErrors["IPRICE"],
        onFocus: () => setValidationErrors({ ...validationErrors, IPRICE: "" }),
        maxLength: 20,
      },
      mantineTableHeadCellProps: {
        align: "right",
        className: "rpt-header-3",
      },
      mantineTableBodyCellProps: {
        align: "right",
      },
      Cell: ({ cell }) =>
        cell.getValue<number>()?.toLocaleString("en-US", {
          minimumFractionDigits: 6,
          maximumFractionDigits: 6,
        }),
    },
    {
      accessorKey: "IINC",
      header: "Index Income",
      mantineEditTextInputProps: {
        type: "number",
        error: validationErrors["IINC"],
        onFocus: () => setValidationErrors({ ...validationErrors, IINC: "" }),
        maxLength: 20,
      },
      mantineTableHeadCellProps: {
        align: "right",
        className: "rpt-header-3",
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
      accessorKey: "IRET",
      header: "Index Return",
      mantineEditTextInputProps: {
        type: "number",
        error: validationErrors["IRET"],
        onFocus: () => setValidationErrors({ ...validationErrors, IRET: "" }),
        maxLength: 20,
      },
      mantineTableHeadCellProps: {
        align: "right",
        className: "rpt-header-3",
      },
      mantineTableBodyCellProps: {
        align: "right",
      },
      Cell: ({ cell }) =>
        cell.getValue<number>()?.toLocaleString("en-US", {
          minimumFractionDigits: 6,
          maximumFractionDigits: 6,
        }),
    },
  ];
};
