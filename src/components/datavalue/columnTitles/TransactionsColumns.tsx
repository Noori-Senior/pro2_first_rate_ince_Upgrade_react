import { useState, useEffect } from 'react';
import { type MRT_ColumnDef } from 'mantine-react-table';
import { IconCalendar } from '@tabler/icons-react';
import { DatePickerInput } from '@mantine/dates';
import { Select, Group } from '@mantine/core';
import { formatDate } from '../../hooks/FormatDates.tsx';
import { useAssetDDLID, useTransactionCode, useCountryDDL, useTransactionCodeByTIDENT, useTIDENT } from '../../hooks/useFrpNamesFiltersDDLsApi.js';

export type TransactionsFields = {
  id: string;
  AACCT: string;
  NAME: string;
  ADATE: string | Date;
  HID: string;
  NAMETKR: string;
  TDATE: string | Date;
  TCODE: string;
  TSEQ: number;
  TPEND: string;
  TSTATE: string;
  TSTORY: string;
  TORIGDATE: string | Date;
  TSETTDATE: string | Date;
  TUNITS: number;
  TPRICE: number;
  TPRINCIPAL: number;
  TINCOME: number;
  TNET: number;
  TCARRY: number;
  TCOMM: number;
  TEXPENSE: number;
  TBROKER: string;
  TRPTCODE: string;
  SHRTGAIN: number;
  LONGGAIN: number;
  STATEID: string;
  UNIQSEQ: string;
  TAXIND: string;
  TCARRYL: number;
  TPOST: string | Date;
  TEXCHLOC: number;
  USERDEF1: number;
  USERCHR1: string;
  USERCHR2: string;
  USERCHR3: string;
  USERCHR4: string;
  USERCHR5: string;
  USERCHR6: string;
  TEXCHPAY: number;
  TPAYCNTRY: string;
  USERDT1: string | Date;
  RECDTYPE: string;
};


// Function to generate unique dropdown options dynamically
const getUniqueOptionsSingle = (rows: TransactionsFields[], valueKey: string) => {
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

export type countryFields = {
  COUNTRY: string;
  CNAME: string;
};

// Column definitions as a separate component
export const useTransactionsColumns = (
  data: TransactionsFields[],
  setData: (data: TransactionsFields[]) => void, // Add a setData function to update the parent state
  client: any,
  selectedPortfolio: string,
  fromDate: string,
  toDate: string,
  isEditAble: boolean,
): MRT_ColumnDef<TransactionsFields>[] => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string | ''>>({});

  const assetDDLID = useAssetDDLID(client, selectedPortfolio, fromDate, toDate); // Fetching the data for Asset dropdown
  const transactionCode = useTransactionCode(client); // Fetching the data for Transaction Code dropdown

  // Fetch Country details
  const { data: processedCountry } = useCountryDDL(client);
  
  return [
    {
        accessorKey: 'AACCT', 
        header: 'Portfolio ID',
        mantineTableHeadCellProps: {
          className: 'rpt-header-3',
        },
        enableEditing: isEditAble,editVariant: 'select',

        mantineEditSelectProps: {
          data: getUniqueOptionsSingle(data, "AACCT"),
          required: true,
        },
      },
      {
        accessorKey: 'NAME', 
        header: 'Portfolio Name',
        mantineTableHeadCellProps: {
          className: 'rpt-header-3',
        },
        enableEditing: false,
      },
      {
        accessorKey: 'ADATE',
        header: 'As of Date',
        mantineTableHeadCellProps: {
          className: 'rpt-header-3',
        },
        enableEditing: isEditAble,
      
        // Edit mode: Show DatePickerInput
        Edit: ({ row, table, cell }) => {
          const initialDate = formatDate(row.original.ADATE?.toString()); // Expecting format: YYYY/MM/DD
      
          // State to track selected date
          const [aDateValue, setAdateValue] = useState<Date | null>(initialDate || new Date());
      
          return (
            <DatePickerInput
              icon={<IconCalendar size={24} stroke={2.0} />}
              label="As of Date"
              value={aDateValue}
              disabled={!isEditAble}
              required
              onChange={(selectedDate) => {
                if (!selectedDate) return;
          
                // Format selected date as YYYY-MM-DD
                const year = selectedDate.getFullYear();
                const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const day = String(selectedDate.getDate()).padStart(2, '0');
                const formattedDate = `${year}-${month}-${day}`;

                setAdateValue(selectedDate); // Update local state

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
                    ? { ...r.original, ADATE: formattedDate } // Update ADATE with a Date object
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
      
          return formattedDate.replace('-', '/'); // Convert YYYY-MM to YYYY/MM
        },
      },
      {
        accessorKey: 'HID',
        header: 'Asset ID',
        mantineTableHeadCellProps: {
          className: 'rpt-header-3',
        },
        
        Edit: ({ cell, table, row }) => {
          const [value, setValue] = useState<string | null>(cell.getValue<string>());
          const airAsset = (assetDDLID.data ?? []).map((hid: any) => ({ value: hid.HID, label: hid.NAMETKR + ` ( ${hid.HID} )` }));
          return (
            <Select
              label="Asset ID"
              data={airAsset}
              value={value} 
              disabled={!isEditAble}
              onChange={(selectedValue) => {
                setValue(selectedValue);
                row.original.HID = selectedValue ?? '';
                const selectedVal = airAsset.find((option) => option.value === selectedValue);

                 // Determine if it's a new row being created or an existing row being edited
                  const creatingRow = table.getState().creatingRow;
                  const editingRow = table.getState().editingRow;
 
                  if (creatingRow && creatingRow._valuesCache) {
                    creatingRow._valuesCache.HID = selectedValue;
                    table.setEditingRow(editingRow); // Ensure state is updated
                  } else if (editingRow && editingRow._valuesCache) {
                    editingRow._valuesCache.HID = selectedValue;
                    table.setEditingRow(editingRow); // Ensure state is updated
                  }

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
        accessorKey: 'NAMETKR',
        header: 'Asset Name',
        mantineTableHeadCellProps: {
          className: 'rpt-header-3',
        },
        enableEditing: false,
      },
      {
        accessorKey: 'TDATE',
        header: 'Transaction Date',
        mantineTableHeadCellProps: {
          className: 'rpt-header-3',
        },
      
        // Edit mode: Show DatePickerInput
        Edit: ({ row, table, cell }) => {
          const initialDate = formatDate(row.original.TDATE?.toString()); // Expecting format: YYYY-MM-DD
      
          // State to track selected date
          const [tDateValue, setTdateValue] = useState<Date | null>(initialDate || new Date());
      
          return (
            <DatePickerInput
              icon={<IconCalendar size={24} stroke={2.0} />}
              label="Transaction Date"
              value={tDateValue}
              onChange={(selectedDate) => {
                if (!selectedDate) return;
      
                // Format selected date as YYYY-MM-DD
                const year = selectedDate.getFullYear();
                const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const day = String(selectedDate.getDate()).padStart(2, '0');
                const formattedDate = `${year}-${month}-${day}`;
      
                setTdateValue(selectedDate); // Update local state

                row.original.TDATE = formattedDate;
                row.original.ADATE = formattedDate;

                // Determine if it's a new row being created or an existing row being edited
                const creatingRow = table.getState().creatingRow;
                const editingRow = table.getState().editingRow;

                if (creatingRow && creatingRow._valuesCache) {
                  creatingRow._valuesCache.TDATE = formattedDate;
                  creatingRow._valuesCache.ADATE = formattedDate;
                  table.setEditingRow(editingRow); // Ensure state is updated
                } else if (editingRow && editingRow._valuesCache) {
                  editingRow._valuesCache.TDATE = formattedDate;
                  editingRow._valuesCache.ADATE = formattedDate;
                  table.setEditingRow(editingRow); // Ensure state is updated
                }
      
                // Update the selected value in the table state
                const updatedRows = table.getRowModel().rows.map((r) =>
                  r.id === cell.row.id
                    ? { ...r.original, TDATE: new Date(formattedDate), ADATE: new Date(formattedDate) } // Update TDATE and ADATE
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
        accessorKey: 'TORIGDATE',
        header: 'Original Date',
        mantineTableHeadCellProps: {
          className: 'rpt-header-3',
        },
      
        // Edit mode: Show DatePickerInput
        Edit: ({ row, table, cell }) => {
          const initialDate = formatDate(row.original.TORIGDATE?.toString()); // Expecting format: YYYY-MM-DD
      
          // State to track selected date
          const [tOrigDateValue, setTOrigdateValue] = useState<Date | null>(initialDate || new Date());
      
          return (
            <DatePickerInput
              icon={<IconCalendar size={24} stroke={2.0} />}
              label="Original Date"
              value={tOrigDateValue}
              onChange={(selectedDate) => {
                if (!selectedDate) return;
      
                // Format selected date as YYYY-MM-DD
                const year = selectedDate.getFullYear();
                const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const day = String(selectedDate.getDate()).padStart(2, '0');
                const formattedDate = `${year}-${month}-${day}`;
      
                setTOrigdateValue(selectedDate); // Update local state

                row.original.TORIGDATE = formattedDate;

                // Determine if it's a new row being created or an existing row being edited
                const creatingRow = table.getState().creatingRow;
                const editingRow = table.getState().editingRow;

                if (creatingRow && creatingRow._valuesCache) {
                  creatingRow._valuesCache.TORIGDATE = formattedDate;
                  table.setEditingRow(editingRow); // Ensure state is updated
                } else if (editingRow && editingRow._valuesCache) {
                  editingRow._valuesCache.TORIGDATE = formattedDate;
                  table.setEditingRow(editingRow); // Ensure state is updated
                }
      
                // Update the selected value in the table state
                const updatedRows = table.getRowModel().rows.map((r) =>
                  r.id === cell.row.id
                    ? { ...r.original, TORIGDATE: new Date(formattedDate) } // Update TORIGDATE
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
        accessorKey: 'TSETTDATE',
        header: 'Settlement Date',
        mantineTableHeadCellProps: {
          className: 'rpt-header-3',
        },
      
        // Edit mode: Show DatePickerInput
        Edit: ({ row, table, cell }) => {
          const initialDate = formatDate(row.original.TSETTDATE?.toString()); // Expecting format: YYYY-MM-DD
      
          // State to track selected date
          const [tSetDateValue, setTSetDateValue] = useState<Date | null>(initialDate || new Date());
      
          return (
            <DatePickerInput
              icon={<IconCalendar size={24} stroke={2.0} />}
              label="Settlement Date"
              value={tSetDateValue}
              onChange={(selectedDate) => {
                if (!selectedDate) return;
      
                // Format selected date as YYYY-MM-DD
                const year = selectedDate.getFullYear();
                const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const day = String(selectedDate.getDate()).padStart(2, '0');
                const formattedDate = `${year}-${month}-${day}`;
      
                setTSetDateValue(selectedDate); // Update local state

                row.original.TSETTDATE = formattedDate;

                // Determine if it's a new row being created or an existing row being edited
                const creatingRow = table.getState().creatingRow;
                const editingRow = table.getState().editingRow;

                if (creatingRow && creatingRow._valuesCache) {
                  creatingRow._valuesCache.TSETTDATE = formattedDate;
                  table.setEditingRow(editingRow); // Ensure state is updated
                } else if (editingRow && editingRow._valuesCache) {
                  editingRow._valuesCache.TSETTDATE = formattedDate;
                  table.setEditingRow(editingRow); // Ensure state is updated
                }
      
                // Update the selected value in the table state
                const updatedRows = table.getRowModel().rows.map((r) =>
                  r.id === cell.row.id
                    ? { ...r.original, TSETTDATE: new Date(formattedDate) } // Update TSETTDATE
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
        accessorKey: 'TPOST',
        header: 'Post Date',
        mantineTableHeadCellProps: {
          className: 'rpt-header-3',
        },
      
        // Edit mode: Show DatePickerInput
        Edit: ({ row, table, cell }) => {
          const initialDate = formatDate(row.original.TPOST?.toString()); // Expecting format: YYYY-MM-DD
      
          // State to track selected date
          const [tPostDateValue, setTPostDateValue] = useState<Date | null>(initialDate || new Date());
      
          return (
            <DatePickerInput
              icon={<IconCalendar size={24} stroke={2.0} />}
              label="Post Date"
              value={tPostDateValue}
              onChange={(selectedDate) => {
                if (!selectedDate) return;
      
                // Format selected date as YYYY-MM-DD
                const year = selectedDate.getFullYear();
                const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const day = String(selectedDate.getDate()).padStart(2, '0');
                const formattedDate = `${year}-${month}-${day}`;
      
                setTPostDateValue(selectedDate); // Update local state

                row.original.TPOST = formattedDate;

                // Determine if it's a new row being created or an existing row being edited
                const creatingRow = table.getState().creatingRow;
                const editingRow = table.getState().editingRow;

                if (creatingRow && creatingRow._valuesCache) {
                  creatingRow._valuesCache.TPOST = formattedDate;
                  table.setEditingRow(editingRow); // Ensure state is updated
                } else if (editingRow && editingRow._valuesCache) {
                  editingRow._valuesCache.TPOST = formattedDate;
                  table.setEditingRow(editingRow); // Ensure state is updated
                }
      
                // Update the selected value in the table state
                const updatedRows = table.getRowModel().rows.map((r) =>
                  r.id === cell.row.id
                    ? { ...r.original, TPOST: new Date(formattedDate) } // Update TPOST
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
        accessorKey: 'TCODE',
        header: 'Transaction Code',
        mantineTableHeadCellProps: {
          className: 'rpt-header-3',
        },
                
        Edit: ({ cell, table, row }) => {
          const { data: tidentID } = useTIDENT(client, cell.getValue<string>());
          const [tcValue, setTcValue] = useState<string | null>(cell.getValue<string>());
          const [tIdent, setTIdent] = useState<string | null>(null);
          // Sync state when tidentID changes
          useEffect(() => {
            if (tidentID?.[0]?.T_IDENT) {
              setTIdent(tidentID[0].T_IDENT);
            }
          }, [tidentID]); // Dependency array - runs when tidentID changes
          
          // First select options
          const tranCode = (transactionCode.data ?? []).map((tcode: any) => ({ 
            value: tcode.T_IDENT, 
            label: tcode.VAL_DESC + ` (${tcode.T_IDENT})` 
          }));
          
          // Second select options - dependent on tIdent
          const { data: transactionCodeTID } = useTransactionCodeByTIDENT(client, tIdent);
          
          const tranCodeTIdent = (transactionCodeTID ?? []).map((tcode: any) => ({
            value: tcode.T_CODE, 
            label: tcode.T_DESC + ` (${tcode.T_CODE})` 
          }));
        
          return (
            <Group spacing="sm" grow>
              <Select
                label="Transaction Identifier"
                data={tranCode}
                value={tIdent}
                onChange={(selectedValue) => {
                  setTIdent(selectedValue); // This triggers the second select's data fetch
                }}
                searchable
                filter={(value, item) =>
                  item.label?.toLowerCase().includes(value.toLowerCase().trim()) ?? false
                }
                nothingFound="No options found"
              />
              
              <Select
                label="Transaction Code"
                data={tranCodeTIdent}
                value={tcValue}
                onChange={(selectedTC) => {
                  setTcValue(selectedTC);
                  row.original.TCODE = selectedTC ?? '';
                  const selectedVal = tranCodeTIdent.find((option) => option.value === selectedTC);

                  // Determine if it's a new row being created or an existing row being edited
                  const creatingRow = table.getState().creatingRow;
                  const editingRow = table.getState().editingRow;

                  if (creatingRow && creatingRow._valuesCache) {
                    creatingRow._valuesCache.TCODE = selectedTC;
                    table.setEditingRow(editingRow); // Ensure state is updated
                  } else if (editingRow && editingRow._valuesCache) {
                    editingRow._valuesCache.TCODE = selectedTC;
                    table.setEditingRow(editingRow); // Ensure state is updated
                  }                

                  // Update the selected value in the table state
                  if (selectedVal) {
                    const updatedRows = table.getRowModel().rows.map((r) =>
                      r.id === cell.row.id
                        ? { ...r.original, TCODE: selectedTC || '' } 
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
            </Group>
          );
        }
      },
      {
        accessorKey: 'TSEQ',
        header: 'Transaction Sequence',
        size: 60,

        mantineEditTextInputProps: {
            type: 'number',
            error: validationErrors['TSEQ'],
            onFocus: () => setValidationErrors({ ...validationErrors, TSEQ: '' }),
            maxLength: 7,
        },
        mantineTableHeadCellProps: {
            align: 'right',
            className: 'rpt-header-3',
        },
        mantineTableBodyCellProps: {
            align: 'right',   
        },
      },
      {
        accessorKey: 'TPEND',
        header: 'Type',
        mantineTableHeadCellProps: {
          className: 'rpt-header-3',
        },
        size: 60,
        mantineEditTextInputProps: {
            error: validationErrors['TPEND'],
            onFocus: () => setValidationErrors({ ...validationErrors, TPEND: '' }),
            maxLength: 1,
        },
      },
      {
        accessorKey: 'TUINITS', 
        header: 'Units',
        size: 100,
        mantineEditTextInputProps: {
            type: 'number',
            error: validationErrors['TUINITS'],
            onFocus: () => setValidationErrors({ ...validationErrors, TUINITS: '' }),
            maxLength: 20,
        },
        mantineTableHeadCellProps: {
            align: 'right',
            className: 'rpt-header-3',
        },
        mantineTableBodyCellProps: {
            align: 'right',   
        },
        Cell: ({ cell }) => cell.getValue<number>()?.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 }),
      },
      {
        accessorKey: 'TPRICE',
        header: 'Price', 
        size: 100,
        mantineEditTextInputProps: {
            type: 'number',
            error: validationErrors['TPRICE'],
            onFocus: () => setValidationErrors({ ...validationErrors, TPRICE: '' }),
            maxLength: 20,
        },
        mantineTableHeadCellProps: {
            align: 'right',
            className: 'rpt-header-3',
        },
        mantineTableBodyCellProps: {
            align: 'right',   
        },
        Cell: ({ cell }) => cell.getValue<number>()?.toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 }),
      },
      {
        accessorKey: 'TPRINCIPAL', 
        header: 'Principal',
        size: 100,
        mantineEditTextInputProps: {
            type: 'number',
            error: validationErrors['TPRINCIPAL'],
            onFocus: () => setValidationErrors({ ...validationErrors, TPRINCIPAL: '' }),
            maxLength: 20,
        },
        mantineTableHeadCellProps: {
            align: 'right',
            className: 'rpt-header-3',
        },
        mantineTableBodyCellProps: {
            align: 'right',   
        },
        Cell: ({ cell }) => cell.getValue<number>()?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      },
      {
        accessorKey: 'TINCOME', 
        header: 'Income',
        size: 100,
        mantineEditTextInputProps: {
            type: 'number',
            error: validationErrors['TINCOME'],
            onFocus: () => setValidationErrors({ ...validationErrors, TINCOME: '' }),
            maxLength: 20,
        },
        mantineTableHeadCellProps: {
            align: 'right',
            className: 'rpt-header-3',
        },
        mantineTableBodyCellProps: {
            align: 'right',   
        },
        Cell: ({ cell }) => cell.getValue<number>()?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      },
      {
        accessorKey: 'TNET', 
        header: 'Net',
        size: 100,
        mantineEditTextInputProps: {
            type: 'number',
            error: validationErrors['TNET'],
            onFocus: () => setValidationErrors({ ...validationErrors, TNET: '' }),
            maxLength: 20,
        },
        mantineTableHeadCellProps: {
            align: 'right',
            className: 'rpt-header-3',
        },
        mantineTableBodyCellProps: {
            align: 'right',   
        },
        Cell: ({ cell }) => cell.getValue<number>()?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      },
      {
        accessorKey: 'TCARRY', 
        header: 'Carry',
        size: 100,
        mantineEditTextInputProps: {
            type: 'number',
            error: validationErrors['TCARRY'],
            onFocus: () => setValidationErrors({ ...validationErrors, TCARRY: '' }),
            maxLength: 20,
        },
        mantineTableHeadCellProps: {
            align: 'right',
            className: 'rpt-header-3',
        },
        mantineTableBodyCellProps: {
            align: 'right',   
        },
        Cell: ({ cell }) => cell.getValue<number>()?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      },
      {
        accessorKey: 'TCOMM',
        header: 'Commission Fee', 
        size: 100,
        mantineEditTextInputProps: {
            type: 'number',
            error: validationErrors['TCOMM'],
            onFocus: () => setValidationErrors({ ...validationErrors, TCOMM: '' }),
            maxLength: 20,
        },
        mantineTableHeadCellProps: {
            align: 'right',
            className: 'rpt-header-3',
        },
        mantineTableBodyCellProps: {
            align: 'right',   
        },
        Cell: ({ cell }) => cell.getValue<number>()?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      },
      {
        accessorKey: 'TEXPENSE',
        header: 'Expense',
        size: 100,
        mantineEditTextInputProps: {
            type: 'number',
            error: validationErrors['TEXPENSE'],
            onFocus: () => setValidationErrors({ ...validationErrors, TEXPENSE: '' }),
            maxLength: 20,
        },
        mantineTableHeadCellProps: {
            align: 'right',
            className: 'rpt-header-3',
        },
        mantineTableBodyCellProps: {
            align: 'right',   
        },
        Cell: ({ cell }) => cell.getValue<number>()?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      },
      {
        accessorKey: 'SHRTGAIN',
        header: 'Short Term Gain', 
        size: 100,
        mantineEditTextInputProps: {
            type: 'number',
            error: validationErrors['SHRTGAIN'],
            onFocus: () => setValidationErrors({ ...validationErrors, SHRTGAIN: '' }),
            maxLength: 20,
        },
        mantineTableHeadCellProps: {
            align: 'right',
            className: 'rpt-header-3',
        },
        mantineTableBodyCellProps: {
            align: 'right',   
        },
        Cell: ({ cell }) => cell.getValue<number>()?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      },
      {
        accessorKey: 'LONGGAIN',
        header: 'Long Term Gain',
        size: 100, 
        mantineEditTextInputProps: {
            type: 'number',
            error: validationErrors['LONGGAIN'],
            onFocus: () => setValidationErrors({ ...validationErrors, LONGGAIN: '' }),
            maxLength: 20,
        },
        mantineTableHeadCellProps: {
            align: 'right',
            className: 'rpt-header-3',
        },
        mantineTableBodyCellProps: {
            align: 'right',   
        },
        Cell: ({ cell }) => cell.getValue<number>()?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      },
      {
        accessorKey: 'TSTORY',
        header: 'Description',
        mantineTableHeadCellProps: {
          className: 'rpt-header-3',
        },
        size: 500,
        mantineEditTextInputProps: {
          error: validationErrors['TSTORY'],
          onFocus: () => setValidationErrors({ ...validationErrors, TSTORY: '' }),
          maxLength: 150,
        },
      },
      {
        accessorKey: 'UNIQSEQ',
        header: 'Unique Sequence',
        mantineTableHeadCellProps: {
          className: 'rpt-header-3',
        },
        size: 100,
        mantineEditTextInputProps: {
            error: validationErrors['UNIQSEQ'],
            onFocus: () => setValidationErrors({ ...validationErrors, UNIQSEQ: '' }),
            maxLength: 18,
        },
      },
      {
        accessorKey: 'STATEID',
        header: 'State ID',
        mantineTableHeadCellProps: {
          className: 'rpt-header-3',
        },
        size: 60,
        mantineEditTextInputProps: {
            error: validationErrors['STATEID'],
            onFocus: () => setValidationErrors({ ...validationErrors, STATEID: '' }),
            maxLength: 3,
        },
      },
      {
        accessorKey: 'TBROKER',
        header: 'Broker Id',
        mantineTableHeadCellProps: {
          className: 'rpt-header-3',
        },
        size: 100,
        mantineEditTextInputProps: {
          error: validationErrors['TBROKER'],
          onFocus: () => setValidationErrors({ ...validationErrors, TBROKER: '' }),
          maxLength: 10,
        },
      },
      {
        accessorKey: 'TAXIND',
        header: 'Tax Indicator',
        mantineTableHeadCellProps: {
          className: 'rpt-header-3',
        },
        size: 60,
        mantineEditTextInputProps: {
            error: validationErrors['TAXIND'],
            onFocus: () => setValidationErrors({ ...validationErrors, TAXIND: '' }),
            maxLength: 2,
        },
      },
      {
        accessorKey: 'TRPTCODE',
        header: 'Report Code',
        mantineTableHeadCellProps: {
          className: 'rpt-header-3',
        },
        size: 100,
        mantineEditTextInputProps: {
          error: validationErrors['TRPTCODE'],
          onFocus: () => setValidationErrors({ ...validationErrors, TRPTCODE: '' }),
          maxLength: 8,
        },
      },
      {
        accessorKey: 'TSTATE',
        header: 'Statement Code',
        mantineTableHeadCellProps: {
          className: 'rpt-header-3',
        },
        size: 60,
        mantineEditTextInputProps: {
          error: validationErrors['TSTATE'],
          onFocus: () => setValidationErrors({ ...validationErrors, TSTATE: '' }),
          maxLength: 5,
        },
      },
      {
        accessorKey: 'TCARRYL',
        header: 'Local Carry Ammount',
        size: 100,
        mantineEditTextInputProps: {
          type: 'number',
          error: validationErrors['TCARRYL'],
          onFocus: () => setValidationErrors({ ...validationErrors, TCARRYL: '' }),
          maxLength: 20,
        },
        mantineTableHeadCellProps: {
            align: 'right',
            className: 'rpt-header-3',
        },
        mantineTableBodyCellProps: {
            align: 'right',   
        },
        Cell: ({ cell }) => cell.getValue<number>()?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      },
      {
        accessorKey: 'TEXCHLOC',
        header: 'Exchange Rate Local to Base',
        size: 100,
        mantineEditTextInputProps: {
          type: 'number',
          error: validationErrors['TEXCHLOC'],
          onFocus: () => setValidationErrors({ ...validationErrors, TEXCHLOC: '' }),
          maxLength: 20,
        },
        mantineTableHeadCellProps: {
            align: 'right',
            className: 'rpt-header-3',
        },
        mantineTableBodyCellProps: {
            align: 'right',   
        },
        Cell: ({ cell }) => cell.getValue<number>()?.toLocaleString('en-US', { minimumFractionDigits: 8, maximumFractionDigits: 8 }),
      },
      {
        accessorKey: 'TEXCHPAY',
        header: 'Exchange Rate Payment to Base',
        size: 100,
        mantineEditTextInputProps: {
          type: 'number',
          error: validationErrors['TEXCHPAY'],
          onFocus: () => setValidationErrors({ ...validationErrors, TEXCHPAY: '' }),
          maxLength: 20,
        },
        mantineTableHeadCellProps: {
            align: 'right',
            className: 'rpt-header-3',
        },
        mantineTableBodyCellProps: {
            align: 'right',   
        },
        Cell: ({ cell }) => cell.getValue<number>()?.toLocaleString('en-US', { minimumFractionDigits: 8, maximumFractionDigits: 8 }),
      },
      {
        accessorKey: 'TPAYCNTRY',
        header: 'Payment Country',
        mantineTableHeadCellProps: {
          className: 'rpt-header-3',
        },

        Edit: ({ cell, table, row }) => {
          const [value, setValue] = useState<string | null>(cell.getValue<string>());
          const airCntry = processedCountry.map(country => ({ value: country.COUNTRY, label: country.CNAME + ' (' + country.COUNTRY + ')' }));
          return (
            <Select
              label="Payment Country"
              data={airCntry}
              value={value} 
              onChange={(selectedValue) => {
                setValue(selectedValue);
                row.original.TPAYCNTRY = selectedValue ?? '';
                // Determine if it's a new row being created or an existing row being edited
                const creatingRow = table.getState().creatingRow;
                const editingRow = table.getState().editingRow;
                
                if (creatingRow && creatingRow._valuesCache) {
                  creatingRow._valuesCache.TPAYCNTRY = selectedValue;
                  table.setEditingRow(editingRow); // Ensure state is updated
                } else if (editingRow && editingRow._valuesCache) {
                  editingRow._valuesCache.TPAYCNTRY = selectedValue;
                  table.setEditingRow(editingRow); // Ensure state is updated
                }
                // Find the selected value in the options
                const selectedVal = airCntry.find((option) => option.value === selectedValue);
                // Update the selected value in the table state
                if (selectedVal) {
                  const updatedRows = table.getRowModel().rows.map((r) =>
                    r.id === cell.row.id
                  ? { ...r.original, TPAYCNTRY: selectedValue || '' } : r.original
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
        accessorKey: 'USERDEF1', 
        header: 'Client Defined Numeric',
        mantineEditTextInputProps: {
            type: 'number',
            error: validationErrors['USERDEF1'],
            onFocus: () => setValidationErrors({ ...validationErrors, USERDEF1: '' }),
            maxLength: 20,
        },
        mantineTableHeadCellProps: {
            align: 'right',
            className: 'rpt-header-3',
        },
        mantineTableBodyCellProps: {
            align: 'right',   
        },
        Cell: ({ cell }) => cell.getValue<number>()?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      },
      {
        accessorKey: 'USERCHR1', 
        header: 'Client Defined Alpha 1',
        mantineTableHeadCellProps: {
          className: 'rpt-header-3',
        },
        mantineEditTextInputProps: {
          type: 'text',
          error: validationErrors['USERCHR1'],
          maxLength: 4,
          onFocus: () => setValidationErrors({ ...validationErrors, USERCHR1: '' }),
        }
      },
      {
        accessorKey: 'USERCHR2', 
        header: 'Client Defined Alpha 2',
        mantineTableHeadCellProps: {
          className: 'rpt-header-3',
        },
        mantineEditTextInputProps: {
          type: 'text',
          error: validationErrors['USERCHR2'],
          maxLength: 10,
          onFocus: () => setValidationErrors({ ...validationErrors, USERCHR2: '' }),
        }
      },
      {
        accessorKey: 'USERCHR3', 
        header: 'Client Defined Alpha 3',
        mantineTableHeadCellProps: {
          className: 'rpt-header-3',
        },
        mantineEditTextInputProps: {
          type: 'text',
          error: validationErrors['USERCHR3'],
          maxLength: 10,
          onFocus: () => setValidationErrors({ ...validationErrors, USERCHR3: '' }),
        }
      },
      {
        accessorKey: 'USERCHR4', 
        header: 'Client Defined Alpha 4',
        mantineTableHeadCellProps: {
          className: 'rpt-header-3',
        },
        mantineEditTextInputProps: {
          type: 'text',
          error: validationErrors['USERCHR4'],
          maxLength: 20,
          onFocus: () => setValidationErrors({ ...validationErrors, USERCHR4: '' }),
        }
      },
      {
        accessorKey: 'USERCHR5', 
        header: 'Client Defined Alpha 5',
        mantineTableHeadCellProps: {
          className: 'rpt-header-3',
        },
        mantineEditTextInputProps: {
          type: 'text',
          error: validationErrors['USERCHR5'],
          maxLength: 20,
          onFocus: () => setValidationErrors({ ...validationErrors, USERCHR5: '' }),
        }
      },
      {
        accessorKey: 'USERCHR6', 
        header: 'Client Defined Alpha 6',
        mantineTableHeadCellProps: {
          className: 'rpt-header-3',
        },
        mantineEditTextInputProps: {
          type: 'text',
          error: validationErrors['USERCHR6'],
          maxLength: 10,
          onFocus: () => setValidationErrors({ ...validationErrors, USERCHR6: '' }),
        }
      },
      {
        accessorKey: 'USERDT1', 
        header: 'Client Defined Date',
        mantineTableHeadCellProps: {
          className: 'rpt-header-3',
        },
        // Edit mode: Show DatePickerInput
        Edit: ({ row, table, cell }) => {
          const initialDate = formatDate(row.original.USERDT1?.toString()); // Expecting format: YYYY-MM-DD
      
          // State to track selected date
          const [USERDT1Value, setUSERDT1DateValue] = useState<Date | null>(initialDate || new Date());
      
          return (
            <DatePickerInput
              icon={<IconCalendar size={24} stroke={2.0} />}
              label="Client Defined Date"
              value={USERDT1Value}
              onChange={(selectedDate) => {
                if (!selectedDate) return;
      
                // Format selected date as YYYY-MM-DD
                const year = selectedDate.getFullYear();
                const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const day = String(selectedDate.getDate()).padStart(2, '0');
                const formattedDate = `${year}-${month}-${day}`;
      
                setUSERDT1DateValue(selectedDate); // Update local state

                row.original.USERDT1 = formattedDate;

                // Determine if it's a new row being created or an existing row being edited
                const creatingRow = table.getState().creatingRow;
                const editingRow = table.getState().editingRow;

                if (creatingRow && creatingRow._valuesCache) {
                  creatingRow._valuesCache.USERDT1 = formattedDate;
                  table.setEditingRow(editingRow); // Ensure state is updated
                } else if (editingRow && editingRow._valuesCache) {
                  editingRow._valuesCache.USERDT1 = formattedDate;
                  table.setEditingRow(editingRow); // Ensure state is updated
                }
      
                // Update the selected value in the table state
                const updatedRows = table.getRowModel().rows.map((r) =>
                  r.id === cell.row.id
                    ? { ...r.original, USERDT1: new Date(formattedDate) } // Update USERDT1
                    : r.original
                );

                setData(updatedRows); // Update table state
              }}
            />
          );
        },
        Cell: ({ cell }) => {
          const dateValue = cell.getValue<string>(); // Ensure it's a string
          if (!dateValue) return ''; // Handle empty values
          
          const formattedDate = new Date(dateValue).toLocaleDateString('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          });
      
          return formattedDate.replace('-', '/').replace('-', '/'); // Convert YYYY-MM-DD to YYYY/MM/DD
        },
      },
  ];
};
