import { useState } from "react";
import { type MRT_ColumnDef } from "mantine-react-table";
import { IconCalendar } from "@tabler/icons-react";
import { DatePickerInput } from "@mantine/dates";
import { formatDate } from "../../hooks/FormatDates.tsx";

export type SectorInceptionFields = {
  id: string;
  ACCT: string;
  NAME: string;
  COUNTRY: string;
  CNAME: string;
  SECTOR: string;
  SORINAME: string;
  SICP_DATE: string | Date;
  RECDTYPE: string;
};

// Function to generate unique dropdown options dynamically
const getUniqueOptionsSingle = (rows: SectorInceptionFields[], valueKey: string) => {
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
export const useSectorInceptionColumns = (
  data: SectorInceptionFields[],
): MRT_ColumnDef<SectorInceptionFields>[] => {

  return [
    {
      accessorKey: "ACCT",
      header: "Portfolio ID",
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
    //   enableEditing: isEditAble,
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
      accessorKey: 'COUNTRY', 
      header: 'Country',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      editVariant: "select",
      mantineEditSelectProps: {
        data: getUniqueOptionsSingle(data, "COUNTRY"),
        required: true,
      },
    },
    {
      accessorKey: "CNAME",
      header: "Country Name",
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      enableEditing: false,
      size: 250,
    },
    {
      accessorKey: 'SECTOR', 
      header: 'Sector',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      editVariant: "select",
      mantineEditSelectProps: {
        data: getUniqueOptionsSingle(data, "SECTOR"),
        required: true,
      },
    },
    {
      accessorKey: "SORINAME",
      header: "Sector Name",
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      enableEditing: false,
      size: 250,
    },
    {
      accessorKey: 'SICP_DATE',
      header: 'Sector Inception Date',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
    
      // Edit mode: Show DatePickerInput
      Edit: ({ row, table, cell }) => {
        const initialDate = formatDate(row.original.SICP_DATE?.toString()); // Expecting format: YYYY-MM-DD
    
        // State to track selected date
        const [tDateValue, setTdateValue] = useState<Date | null>(initialDate || new Date());
    
        return (
          <DatePickerInput
            icon={<IconCalendar size={24} stroke={2.0} />}
            label="Sector Inception Date"
            value={tDateValue}
            onChange={(selectedDate) => {
              if (!selectedDate) return;
    
              // Format selected date as YYYY-MM-DD
              const year = selectedDate.getFullYear();
              const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
              const day = String(selectedDate.getDate()).padStart(2, '0');
              const formattedDate = `${year}-${month}-${day}`;
    
              setTdateValue(selectedDate); // Update local state
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.SICP_DATE = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.SICP_DATE = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              }
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
          day: '2-digit',
        });
    
        return formattedDate.replace('-', '/').replace('-', '/'); // Convert YYYY-MM to YYYY/MM
      },
    },

  ];
};
