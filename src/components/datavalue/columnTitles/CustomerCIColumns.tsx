import { useState } from "react";
import { type MRT_ColumnDef } from "mantine-react-table";
import { IconCalendar } from "@tabler/icons-react";
import { DatePickerInput } from "@mantine/dates";
import { formatDate } from "../../hooks/FormatDates.tsx";

export type CustomerCIFields = {
  id: string;
  ACCT: string;
  SEQNUM: string;
  NAME: string;
  NAME1: string;
  NAME2: string;
  NAME3: string;
  NAME4: string;
  NAME5: string;
  ADDR1: string;
  ADDR2: string;
  ADDR3: string;
  CITY: string;
  STATE: string;
  ZIP: string;
  SHRTNAME: string;
  BANKNAME: string;
  OFFNAME: string;
  OFFPHONE: string;
  ADMNAME: string;
  ADMPHONE: string;
  TAXID: string;
  STMTICP: string | Date;
  RECDTYPE: string;
};

// Function to generate unique dropdown options dynamically
const getUniqueOptionsSingle = (rows: CustomerCIFields[], valueKey: string) => {
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
export const useCustomerCIColumns = (
  data: CustomerCIFields[],
  setData: (data: CustomerCIFields[]) => void, // Add a setData function to update the parent state
  isEditAble: boolean,
): MRT_ColumnDef<CustomerCIFields>[] => {
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
      accessorKey: "SEQNUM",
      header: "Sequence Number",
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      enableEditing: isEditAble,
      editVariant: "text",
      mantineEditTextInputProps: {
        type: 'text',
        error: validationErrors['SEQNUM'],
        onFocus: () => setValidationErrors({...validationErrors, SEQNUM: ''}),
        maxLength: 5,
        required: true,
        autoComplete: 'off',
      },
    },
    {
      accessorKey: 'NAME1', 
      header: 'Name 1',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'text',
        error: validationErrors['NAME1'],
        onFocus: () => setValidationErrors({...validationErrors, NAME1: ''}),
        maxLength: 32,
        autoComplete: 'off',
      },
    },
    {
      accessorKey: 'NAME2', 
      header: 'Name 2',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'text',
        error: validationErrors['NAME2'],
        onFocus: () => setValidationErrors({...validationErrors, NAME2: ''}),
        maxLength: 32,
        autoComplete: 'off',
      },
    },
    {
      accessorKey: 'NAME3', 
      header: 'Name 3',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'text',
        error: validationErrors['NAME3'],
        onFocus: () => setValidationErrors({...validationErrors, NAME3: ''}),
        maxLength: 32,
        autoComplete: 'off',
      },
    },
    {
      accessorKey: 'NAME4', 
      header: 'Name 4',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'text',
        error: validationErrors['NAME4'],
        onFocus: () => setValidationErrors({...validationErrors, NAME4: ''}),
        maxLength: 32,
        autoComplete: 'off',
      },
    },
    {
      accessorKey: 'NAME5', 
      header: 'Name 5',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'text',
        error: validationErrors['NAME5'],
        onFocus: () => setValidationErrors({...validationErrors, NAME5: ''}),
        maxLength: 32,
        autoComplete: 'off',
      },
    },
    // {
    //   accessorKey: 'ADDR1', 
    //   header: 'Address Line 1',
    //   mantineTableHeadCellProps: {
    //     className: 'rpt-header-3',
    //   },
    //   editVariant: 'text',
    //   mantineEditTextInputProps: {
    //     type: 'text',
    //     error: validationErrors['ADDR1'],
    //     onFocus: () => setValidationErrors({...validationErrors, ADDR1: ''}),
    //     maxLength: 100,
    //   },
    // },
    // {
    //   accessorKey: 'ADDR2', 
    //   header: 'Address Line 2',
    //   mantineTableHeadCellProps: {
    //     className: 'rpt-header-3',
    //   },
    //   editVariant: 'text',
    //   mantineEditTextInputProps: {
    //     type: 'text',
    //     error: validationErrors['ADDR2'],
    //     onFocus: () => setValidationErrors({...validationErrors, ADDR2: ''}),
    //     maxLength: 100,
    //   },
    // },
    // {
    //   accessorKey: 'ADDR3', 
    //   header: 'Address Line 3',
    //   mantineTableHeadCellProps: {
    //     className: 'rpt-header-3',
    //   },
    //   editVariant: 'text',
    //   mantineEditTextInputProps: {
    //     type: 'text',
    //     error: validationErrors['ADDR3'],
    //     onFocus: () => setValidationErrors({...validationErrors, ADDR3: ''}),
    //     maxLength: 100,
    //   },
    // },
    // {
    //   accessorKey: 'CITY', 
    //   header: 'City',
    //   mantineTableHeadCellProps: {
    //     className: 'rpt-header-3',
    //   },
    //   editVariant: 'text',
    //   mantineEditTextInputProps: {
    //     type: 'text',
    //     error: validationErrors['CITY'],
    //     onFocus: () => setValidationErrors({...validationErrors, CITY: ''}),
    //     maxLength: 32,
    //   },
    // },
    // {
    //   accessorKey: 'STATE', 
    //   header: 'State',
    //   mantineTableHeadCellProps: {
    //     className: 'rpt-header-3',
    //   },
    //   editVariant: 'text',
    //   mantineEditTextInputProps: {
    //     type: 'text',
    //     error: validationErrors['STATE'],
    //     onFocus: () => setValidationErrors({...validationErrors, STATE: ''}),
    //     maxLength: 32,
    //   },
    // },
    {
      accessorKey: 'ZIP', 
      header: 'Zip Code',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'text',
        error: validationErrors['ZIP'],
        onFocus: () => setValidationErrors({...validationErrors, ZIP: ''}),
        maxLength: 9,
        autoComplete: 'off',
      },
    },
    {
      accessorKey: 'SHRTNAME', 
      header: 'Shart Name',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'text',
        error: validationErrors['SHRTNAME'],
        onFocus: () => setValidationErrors({...validationErrors, SHRTNAME: ''}),
        maxLength: 40,
        autoComplete: 'off',
      },
    },
    {
      accessorKey: 'BANKNAME', 
      header: 'Bank Name',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'text',
        error: validationErrors['BANKNAME'],
        onFocus: () => setValidationErrors({...validationErrors, BANKNAME: ''}),
        maxLength: 40,
        autoComplete: 'off',
      },
    },
    {
      accessorKey: 'OFFNAME', 
      header: 'Officer Name',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'text',
        error: validationErrors['OFFNAME'],
        onFocus: () => setValidationErrors({...validationErrors, OFFNAME: ''}),
        maxLength: 40,
        autoComplete: 'off',
      },
    },
    {
      accessorKey: 'OFFPHONE', 
      header: 'Officer Phone #',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'text',
        error: validationErrors['OFFPHONE'],
        onFocus: () => setValidationErrors({...validationErrors, OFFPHONE: ''}),
        maxLength: 32,
        autoComplete: 'off',
      },
    },
    {
      accessorKey: 'ADMNAME', 
      header: 'Admin Name',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'text',
        error: validationErrors['ADMNAME'],
        onFocus: () => setValidationErrors({...validationErrors, ADMNAME: ''}),
        maxLength: 40,
        autoComplete: 'off',
      },
    },
    {
      accessorKey: 'ADMPHONE', 
      header: 'Admin Phone #',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'text',
        error: validationErrors['ADMPHONE'],
        onFocus: () => setValidationErrors({...validationErrors, ADMPHONE: ''}),
        maxLength: 32,
        autoComplete: 'off',
      },
    },
    {
      accessorKey: 'TAXID', 
      header: 'Tax ID',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'text',
        error: validationErrors['TAXID'],
        onFocus: () => setValidationErrors({...validationErrors, TAXID: ''}),
        maxLength: 32,
        autoComplete: 'off',
      },
    },
    {
      accessorKey: 'STMTICP',
      header: 'Statement Inception Date',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
    
      // Edit mode: Show DatePickerInput
      Edit: ({ row, table, cell }) => {
        const initialDate = formatDate(row.original.STMTICP?.toString()); // Expecting format: YYYY-MM-DD
    
        // State to track selected date
        const [tDateValue, setTdateValue] = useState<Date | null>(initialDate || new Date());
    
        return (
          <DatePickerInput
            icon={<IconCalendar size={24} stroke={2.0} />}
            label="Statement Inception Date"
            value={tDateValue}
            onChange={(selectedDate) => {
              if (!selectedDate) return;
    
              // Format selected date as YYYY-MM-DD
              const year = selectedDate.getFullYear();
              const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
              const day = String(selectedDate.getDate()).padStart(2, '0');
              const formattedDate = `${year}-${month}-${day}`;
    
              setTdateValue(selectedDate); // Update local state
              row.original.STMTICP = formattedDate;
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.STMTICP = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.STMTICP = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              }
    
              // Update the selected value in the table state
              const updatedRows = table.getRowModel().rows.map((r) =>
                r.id === cell.row.id
                  ? { ...r.original, STMTICP: new Date(formattedDate) } // Update STMTICP and ADATE
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
          day: '2-digit',
        });
    
        return formattedDate.replace('-', '/').replace('-', '/'); // Convert YYYY-MM to YYYY/MM
      },
    },
  ];
};
