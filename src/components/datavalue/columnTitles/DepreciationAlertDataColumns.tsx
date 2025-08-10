import { useState } from "react";
import { type MRT_ColumnDef } from "mantine-react-table";
import { IconCalendar } from "@tabler/icons-react";
import { DatePickerInput } from "@mantine/dates";
import { formatDate } from "../../hooks/FormatDates.tsx";

export type DepreciationAlertDataFields = {
  id: string;
  ACCT: string;
  NAME: string;
  ALERT_DATE: string;
  PCTG_BRK: string;
  ALERT_UVR: number;
  SECTOR: string;
  SNAME: string;
  FREQUENCY: string;
  RECDTYPE: string;
};

// Function to generate unique dropdown options dynamically
const getUniqueOptionsSingle = (
  rows: DepreciationAlertDataFields[],
  valueKey: string
) => {
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
export const useDepreciationAlertData = (
  data: DepreciationAlertDataFields[],
  setData: (data: DepreciationAlertDataFields[]) => void, // Add a setData function to update the parent state
  isEditAble: boolean
): MRT_ColumnDef<DepreciationAlertDataFields>[] => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | "">
  >({});

  return [
    {
      accessorKey: "ACCT",
      header: "Portfolio ID",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
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
        className: "rpt-header-3",
      },
      enableEditing: isEditAble,
      size: 250,
    },
    {
      accessorKey: "ALERT_DATE",
      header: "Alert Date",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      enableEditing: false,
      size: 250,
      // Edit mode: Show DatePickerInput
      Edit: ({ row, table, cell }) => {
        const initialDateValue = formatDate(
          row.original.ALERT_DATE?.toString()
        ); // Expecting format: YYYY/MM/DD

        // State to track selected date
        const [alertDateValue, setAlertDateValue] = useState<Date | null>(
          initialDateValue || new Date()
        );

        return (
          <DatePickerInput
            icon={<IconCalendar size={24} stroke={2.0} />}
            label="Alert Date"
            value={alertDateValue}
            disabled={!isEditAble}
            onChange={(selectedDate) => {
              if (!selectedDate) return;

              // Format selected date as YYYY-MM-DD
              const year = selectedDate.getFullYear();
              const month = String(selectedDate.getMonth() + 1).padStart(
                2,
                "0"
              );
              const day = String(selectedDate.getDate()).padStart(2, "0");
              const formattedDate = `${year}-${month}-${day}`;

              setAlertDateValue(selectedDate); // Update local state
              row.original.ALERT_DATE = formattedDate;
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;

              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.alertDate = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.alertDate = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              }

              // Update the selected value in the table state
              const updatedRows = table.getRowModel().rows.map((r) =>
                r.id === cell.row.id
                  ? { ...r.original, alertDate: formattedDate } // Update alertDate
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
        if (!dateValue) return ""; // Handle empty values
        // Format the dates as "YYYY-MM-DD"
        const formattedDate = new Date(dateValue).toLocaleDateString("en-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

        return `${formattedDate}`;
      },
    },
    {
      accessorKey: "PCTG_BRK",
      header: "Percentage Break",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
    },
    {
      accessorKey: "ALERT_UVR",
      header: "Alert UVR",
      size: 50,
      mantineTableHeadCellProps: {
        align: "right",
        className: "rpt-header-3",
      },
      mantineTableBodyCellProps: {
        align: "right",
      },

      Cell: ({ cell }) => {
        const raw = String(cell.getValue());
        return raw.startsWith("0.") ? raw.slice(1) : raw;
      },
    },
    {
      accessorKey: "SECTOR",
      header: "Sector",
      enableEditing: isEditAble,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "select",
      mantineEditSelectProps: {
        data: getUniqueOptionsSingle(data, "SECTOR"),
      },
    },
    {
      accessorKey: "SNAME",
      header: "Sector Name",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      enableEditing: isEditAble,
    },
    {
      accessorKey: "FREQUENCY",
      header: "Frequency",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
    },
  ];
};
