import { useState } from "react";
import { type MRT_ColumnDef } from "mantine-react-table";
import { IconCalendar } from "@tabler/icons-react";
import { DatePickerInput } from "@mantine/dates";
import { formatDate } from "../../hooks/FormatDates.tsx";
import { Select } from "@mantine/core";
import { useHdirect1DDLID, useHdirect2DDLID, useHdirect3DDLID, useAssetDDLID } from "../../hooks/useFrpNamesFiltersDDLsApi.js";

export type HoldingsFields = {
  id: string;
  AACCT: string;
  NAME: string;
  ADATE: string;
  HID: string;
  NAMETKR: string;
  SNAME1: string;
  SNAME2: string;
  SNAME3: string;
  HDIRECT1: string;
  HDIRECT2: string;
  HDIRECT3: string;
  HDATE: string;
  HUNITS: number;
  HPRINCIPAL: number;
  HACCRUAL: number;
  HCARRY: number;
  HUNITST: number;
  HPRINCIPALT: number;
  HACCRUALT: number;
  HCARRYL: number;
  USERDEF1: number;
  USERCHR1: string;
  RECDTYPE: string;
};

// Function to generate unique dropdown options dynamically
const getUniqueOptionsSingle = (rows: HoldingsFields[], valueKey: string) => {
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
export const useHoldingsColumns = (
  data: HoldingsFields[],
  setData: (data: HoldingsFields[]) => void, // Add a setData function to update the parent state
  isEditAble: boolean,
  client: any,
  selectedPortfolio: string,
  fromDate: string,
  toDate: string
): MRT_ColumnDef<HoldingsFields>[] => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | "">
  >({});

  const hdirect1DDLID = useHdirect1DDLID(client, 'FRPHOLD'); // Fetching the data for HDIRECT1 dropdown 
  const hdirect2DDLID = useHdirect2DDLID(client, 'FRPHOLD'); // Fetching the data for HDIRECT2 dropdown 
  const hdirect3DDLID = useHdirect3DDLID(client, 'FRPHOLD'); // Fetching the data for HDIRECT3 dropdown  
  const assetDDLID = useAssetDDLID(client, selectedPortfolio, fromDate, toDate); // Fetching the data for Asset dropdown

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
      accessorKey: 'ADATE',
      header: 'As Of Date',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      enableEditing: isEditAble,
    
      // Edit mode: Show DatePickerInput
      Edit: ({ row, table, cell }) => {
        const initialADate = formatDate(row.original.ADATE?.toString()); // Expecting format: YYYY/MM/DD
    
        // State to track selected date
        const [aDateValue, setADateValue] = useState<Date | null>(initialADate || new Date());
    
        return (
          <DatePickerInput
            icon={<IconCalendar size={24} stroke={2.0} />}
            label="As Of Date"
            value={aDateValue}
            disabled={!isEditAble}
            onChange={(selectedDate) => {
              if (!selectedDate) return;
    
              // Format selected date as YYYY-MM-DD
              const year = selectedDate.getFullYear();
              const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
              const day = String(selectedDate.getDate()).padStart(2, '0');
              const formattedDate = `${year}-${month}-${day}`;
    
              setADateValue(selectedDate); // Update local state
              row.original.ADATE = formattedDate;
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
                  ? { ...r.original, ADATE: formattedDate } // Update ADATE
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
      accessorKey: "HID",
      header: "Asset ID",
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      enableEditing: isEditAble,

      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(cell.getValue<string>());
        const airAsset = (assetDDLID.data ?? []).map((hid: any) => ({ value: hid.HID, label: hid.NAMETKR + ` ( ${hid.HID} )` }));
        return (
          <Select
            label="Asset ID"
            data={airAsset}
            value={value} 
            disabled={!isEditAble}
            placeholder="Select Asset ID"
            required
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.HID = selectedValue || '';
              // determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.HID = selectedValue || '';
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.HID = selectedValue || '';
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Find the selected value in the dropdown options
              const selectedVal = airAsset.find((option) => option.value === selectedValue);
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table.getRowModel().rows.map((r) =>
                  r.id === cell.row.id
                ? { 
                    ...r.original, 
                    NAMETKR: selectedVal ? selectedVal.label.split('(')[0] : '', 
                    HID: selectedValue ? selectedValue : '' 
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
              row.original.HDIRECT1 = selectedValue || '';
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
              // Find the selected value in the dropdown options
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
              row.original.HDIRECT2 = selectedValue || '';
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
              // Find the selected value in the dropdown options
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
              row.original.HDIRECT3 = selectedValue || '';
              // determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.HDIRECT3 = selectedValue || '';
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.HDIRECT3 = selectedValue || '';
                table.setEditingRow(editingRow); // Ensure state is updated
              }

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
      accessorKey: "HUNITS",
      header: "Units",
      mantineEditTextInputProps: {
        type: "number",
        error: validationErrors["HUNITS"],
        onFocus: () => setValidationErrors({ ...validationErrors, HUNITS: "" }),
        maxLength: 22,
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
          minimumFractionDigits: 6,
          maximumFractionDigits: 6,
        }),
    },
    {
      accessorKey: "HPRINCIPAL",
      header: "Principal",
      mantineEditTextInputProps: {
        type: "number",
        error: validationErrors["HPRINCIPAL"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, HPRINCIPAL: "" }),
        maxLength: 20,
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
      accessorKey: "HACCRUAL",
      header: "Accrual",
      mantineEditTextInputProps: {
        type: "number",
        error: validationErrors["HACCRUAL"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, HACCRUAL: "" }),
        maxLength: 20,
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
      accessorKey: "HCARRY",
      header: "Carry",
      mantineEditTextInputProps: {
        type: "number",
        error: validationErrors["HCARRY"],
        onFocus: () => setValidationErrors({ ...validationErrors, HCARRY: "" }),
        maxLength: 20,
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
      accessorKey: 'HDATE',
      header: 'Holding Date',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
    
      // Edit mode: Show DatePickerInput
      Edit: ({ row, table, cell }) => {
        const initialHDate = formatDate(row.original.HDATE?.toString()); // Expecting format: YYYY/MM/DD
    
        // State to track selected date
        const [hDateValue, setHDateValue] = useState<Date | null>(initialHDate || new Date());
    
        return (
          <DatePickerInput
            icon={<IconCalendar size={24} stroke={2.0} />}
            label="Holding Date"
            value={hDateValue}
            onChange={(selectedDate) => {
              if (!selectedDate) return;
    
              // Format selected date as YYYY-MM-DD
              const year = selectedDate.getFullYear();
              const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
              const day = String(selectedDate.getDate()).padStart(2, '0');
              const formattedDate = `${year}-${month}-${day}`;
    
              setHDateValue(selectedDate); // Update local state
              row.original.HDATE = formattedDate;
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;

              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.HDATE = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.HDATE = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              }
    
              // Update the selected value in the table state
              const updatedRows = table.getRowModel().rows.map((r) =>
                r.id === cell.row.id
                  ? { ...r.original, HDATE: formattedDate } // Update HDATE
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
    {
      accessorKey: "HPRINCIPALT",
      header: "Client Principal",
      mantineEditTextInputProps: {
        type: "number",
        error: validationErrors["HPRINCIPALT"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, HPRINCIPALT: "" }),
        maxLength: 20,
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
      accessorKey: "HACCRUALT",
      header: "Client Accrual",
      mantineEditTextInputProps: {
        type: "number",
        error: validationErrors["HACCRUALT"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, HACCRUALT: "" }),
        maxLength: 20,
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
      accessorKey: "HCARRYL",
      header: "Client Carry",
      mantineEditTextInputProps: {
        type: "number",
        error: validationErrors["HCARRYL"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, HCARRYL: "" }),
        maxLength: 20,
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
      accessorKey: "HUNITST",
      header: "Client Units",
      mantineEditTextInputProps: {
        type: "number",
        error: validationErrors["HUNITST"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, HUNITST: "" }),
        maxLength: 22,
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
          minimumFractionDigits: 6,
          maximumFractionDigits: 6,
        }),
    },
    {
      accessorKey: "USERDEF1",
      header: "Client Decimal",
      mantineEditTextInputProps: {
        type: "number",
        error: validationErrors["USERDEF1"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, USERDEF1: "" }),
        maxLength: 20,
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
      accessorKey: "USERCHR1",
      header: "Client Alpha",
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["USERCHR1"],
        maxLength: 1,
        onFocus: () =>
          setValidationErrors({ ...validationErrors, USERCHR1: "" }),
      },
    },
  ];
};
