import { useState } from "react";
import { type MRT_ColumnDef } from "mantine-react-table";
import { IconCalendar } from "@tabler/icons-react";
import { DatePickerInput } from "@mantine/dates";
import { formatDate } from "../../hooks/FormatDates.tsx";
import { SecurityFields, secTAXABLEI, secFACTOR, secDAYFACTOR, secSKIPLOG } from "./SecurityDDL.tsx";
import { Select, Switch } from "@mantine/core";
import { useCountryDDL, useISODDL } from "../../hooks/useFrpNamesFiltersDDLsApi.js";

export type countryFields = {
  COUNTRY: string;
  CNAME: string;
};

export type isoFields = {
    ISO: string,
    ISONAME: string
};

// Column definitions as a separate component
export const useSecurityColumns = (
  data: SecurityFields[],
  setData: (data: SecurityFields[]) => void, // Add a setData function to update the parent state
  isEditAble: boolean,
  client: string,
): MRT_ColumnDef<SecurityFields>[] => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | "">
  >({});

  // Fetch Country details
  const { data: processedCountry } = useCountryDDL(client);

  // Fetch ISO details
  const { data: processedISO } = useISODDL(client);


  return [
    
    {
      accessorKey: "ID",
      header: "Asset Id",
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      enableEditing: isEditAble,
      editVariant: 'text',

      mantineEditTextInputProps: {
        type: 'text',
        error: validationErrors['ID'],
        onFocus: () => setValidationErrors({...validationErrors, ID: ''}),
        maxLength: 12,
        required: true,
      },
      size: 100,
    },
    {
      accessorKey: 'TICKER', 
      header: 'Ticker',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'text',
        error: validationErrors['TICKER'],
        onFocus: () => setValidationErrors({...validationErrors, TICKER: ''}),
        maxLength: 10,
      },
      size: 90,
    },
    {
      accessorKey: 'NAMETKR', 
      header: 'Asset Name',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'text',
        error: validationErrors['NAMETKR'],
        onFocus: () => setValidationErrors({...validationErrors, NAMETKR: ''}),
        maxLength: 50,
      },
    },
    {
      accessorKey: 'NAMEDESC', 
      header: 'Asset Description',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'text',
        error: validationErrors['NAMEDESC'],
        onFocus: () => setValidationErrors({...validationErrors, NAMEDESC: ''}),
        maxLength: 50,
      },
    },
    {
      accessorKey: 'TAXABLEI', 
      header: 'Taxable',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      size: 100,
      // Edit mode: Dropdown with correct selected value
      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(cell.getValue<string>() || '-');
        return (
          <Select
            label="Taxable"
            data={secTAXABLEI}
            value={value} 
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.TAXABLEI = selectedValue ?? '';
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;

              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.TAXABLEI = selectedValue ?? '';
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.TAXABLEI = selectedValue ?? '';
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              const selectedVal = secTAXABLEI.find((option) => option.value === selectedValue);
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table.getRowModel().rows.map((r) =>
                  r.id === cell.row.id
                ? { ...r.original, TAXABLEI: selectedValue || '' } : r.original
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
      accessorKey: 'SSECTOR', 
      header: 'Sector 1',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'text',
        error: validationErrors['SSECTOR'],
        onFocus: () => setValidationErrors({...validationErrors, SSECTOR: ''}),
        maxLength: 4,
      },
    },
    {
      accessorKey: 'SSECTOR2', 
      header: 'Sector 2',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'text',
        error: validationErrors['SSECTOR2'],
        onFocus: () => setValidationErrors({...validationErrors, SSECTOR2: ''}),
        maxLength: 4,
      },
    },
    {
      accessorKey: 'SSECTOR3', 
      header: 'Sector 3',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'text',
        error: validationErrors['SSECTOR3'],
        onFocus: () => setValidationErrors({...validationErrors, SSECTOR3: ''}),
        maxLength: 4,
      },
    },
    {
      accessorKey: 'ASSETTYPE', 
      header: 'Asset Type',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'text',
        error: validationErrors['ASSETTYPE'],
        onFocus: () => setValidationErrors({...validationErrors, ASSETTYPE: ''}),
        maxLength: 9,
      },
    },
    {
      accessorKey: 'SINDUSTRY', 
      header: 'Industry Code',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'text',
        error: validationErrors['SINDUSTRY'],
        onFocus: () => setValidationErrors({...validationErrors, SINDUSTRY: ''}),
        maxLength: 4,
      },
    },
    {
      accessorKey: 'FACTOR', 
      header: 'Pricing Factor',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      size: 100,
      // Edit mode: Dropdown with correct selected value
      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(cell.getValue<string>() || '0');
        return (
          <Select
            label="Pricing Factor"
            data={secFACTOR}
            value={value} 
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.FACTOR = selectedValue ? Number(selectedValue) : 0;
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.FACTOR = selectedValue ? Number(selectedValue) : 0;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.FACTOR = selectedValue ? Number(selectedValue) : 0;
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Find the selected value in the options
              const selectedVal = secFACTOR.find((option) => option.value === selectedValue);
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table.getRowModel().rows.map((r) =>
                  r.id === cell.row.id
                ? { ...r.original, FACTOR: selectedValue ? Number(selectedValue) : 0 } : r.original
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
      accessorKey: 'DAYFACTOR', 
      header: 'Daily Factor',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      size: 100,
      // Edit mode: Dropdown with correct selected value
      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(cell.getValue<string>() || '!');
        return (
          <Select
            label="Daily Factor"
            data={secDAYFACTOR}
            value={value} 
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.DAYFACTOR = selectedValue ? Number(selectedValue) : 0;
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.DAYFACTOR = selectedValue ? Number(selectedValue) : 0;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.DAYFACTOR = selectedValue ? Number(selectedValue) : 0;
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Find the selected value in the options
              const selectedVal = secDAYFACTOR.find((option) => option.value === selectedValue);
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table.getRowModel().rows.map((r) =>
                  r.id === cell.row.id
                ? { ...r.original, DAYFACTOR: selectedValue ? Number(selectedValue) : 0 } : r.original
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
      accessorKey: 'SKIPLOG', 
      header: 'Skip Daily Log',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      size: 100,
      // Edit mode: Dropdown with correct selected value
      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(cell.getValue<string>() || '.');
        return (
          <Select
            label="Skip Daily Log"
            className="rpt-header-3"
            data={secSKIPLOG}
            value={value} 
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.SKIPLOG = selectedValue || '';
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.SKIPLOG = selectedValue;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.SKIPLOG = selectedValue;
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Find the selected value in the options
              const selectedVal = secSKIPLOG.find((option) => option.value === selectedValue);
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table.getRowModel().rows.map((r) =>
                  r.id === cell.row.id
                ? { ...r.original, SKIPLOG: selectedValue || '.' } : r.original
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
      accessorKey: 'COUNTRY',
      header: 'Country of Issue',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      mantineEditSelectProps: {
        required: true,
      },
      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(cell.getValue<string>());
        const airCntry = processedCountry.map(country => ({ value: country.COUNTRY, label: country.CNAME + ' (' + country.COUNTRY + ')' }));
        return (
          <Select
            label="Country of Issue"
            data={airCntry}
            value={value} 
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.COUNTRY = selectedValue || '';
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.COUNTRY = selectedValue;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.COUNTRY = selectedValue;
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Find the selected value in the options
              const selectedVal = airCntry.find((option) => option.value === selectedValue);
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table.getRowModel().rows.map((r) =>
                  r.id === cell.row.id
                ? { ...r.original, COUNTRY: selectedValue || '' } : r.original
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
      accessorKey: 'ISSCNTRY',
      header: "Issuer's Country",
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      mantineEditSelectProps: {
        required: true,
      },
      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(cell.getValue<string>());
        const airCntry = processedCountry.map(country => ({ value: country.COUNTRY, label: country.CNAME + ' (' + country.COUNTRY + ')' }));
        return (
          <Select
            label="Issuer's Country"
            data={airCntry}
            value={value} 
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.ISSCNTRY = selectedValue || '';
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.ISSCNTRY = selectedValue;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.ISSCNTRY = selectedValue;
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Find the selected value in the options
              const selectedVal = airCntry.find((option) => option.value === selectedValue);
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table.getRowModel().rows.map((r) =>
                  r.id === cell.row.id
                ? { ...r.original, ISSCNTRY: selectedValue || '' } : r.original
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
      accessorKey: 'PAYCURR',
      header: "Payment Currency",
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      mantineEditSelectProps: {
        required: true,
      },
      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(cell.getValue<string>());
        const airCntry = processedISO.map(iso => ({ value: iso.ISO, label: iso.ISONAME + ' (' + iso.ISO + ')' }));
        return (
          <Select
            label="Payment Currency"
            data={airCntry}
            value={value} 
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.PAYCURR = selectedValue || '';
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.PAYCURR = selectedValue;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.PAYCURR = selectedValue;
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Find the selected value in the options
              const selectedVal = airCntry.find((option) => option.value === selectedValue);
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table.getRowModel().rows.map((r) =>
                  r.id === cell.row.id
                ? { ...r.original, PAYCURR: selectedValue || '' } : r.original
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
      accessorKey: 'ISIN', 
      header: 'Global Security Number (ISIN)',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'text',
        error: validationErrors['ISIN'],
        onFocus: () => setValidationErrors({...validationErrors, ISIN: ''}),
        maxLength: 12,
      },
    },
    {
      accessorKey: 'ACCRTYPE', 
      header: 'Accrual Type',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'text',
        error: validationErrors['ACCRTYPE'],
        onFocus: () => setValidationErrors({...validationErrors, ACCRTYPE: ''}),
        maxLength: 2,
      },
    },
    {
      accessorKey: 'PAFREQ', 
      header: 'Pay Frequency',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'text',
        error: validationErrors['PAFREQ'],
        onFocus: () => setValidationErrors({...validationErrors, PAFREQ: ''}),
        maxLength: 2,
      },
    },
    {
      accessorKey: 'ANNDIV', 
      header: 'Annual Dividend Rate',
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'number',
        error: validationErrors['ANNDIV'],
        onFocus: () => setValidationErrors({...validationErrors, ANNDIV: ''}),
        maxLength: 25,
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
      accessorKey: 'COUPON', 
      header: 'Annual Coupon Rate',
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'number',
        error: validationErrors['COUPON'],
        onFocus: () => setValidationErrors({...validationErrors, COUPON: ''}),
        maxLength: 25,
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
      accessorKey: 'CALLPRICE', 
      header: 'Call Price',
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'number',
        error: validationErrors['CALLPRICE'],
        onFocus: () => setValidationErrors({...validationErrors, CALLPRICE: ''}),
        maxLength: 25,
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
      accessorKey: 'PUTPRICE', 
      header: '	Put Price',
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'number',
        error: validationErrors['PUTPRICE'],
        onFocus: () => setValidationErrors({...validationErrors, PUTPRICE: ''}),
        maxLength: 25,
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
      accessorKey: 'NEXTDATE',
      header: 'Next Payment',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
    
      // Edit mode: Show DatePickerInput
      Edit: ({ row, table, cell }) => {
        const initialNDate = formatDate(row.original.NEXTDATE?.toString()); // Expecting format: YYYY/MM/DD
    
        // State to track selected date
        const [nDateValue, setNDateValue] = useState<Date | null>(initialNDate || new Date());
    
        return (
          <DatePickerInput
            icon={<IconCalendar size={24} stroke={2.0} />}
            label="Next Payment"
            value={nDateValue}
            onChange={(selectedDate) => {
              if (!selectedDate) return;
    
              // Format selected date as YYYY-MM-DD
              const year = selectedDate.getFullYear();
              const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
              const day = String(selectedDate.getDate()).padStart(2, '0');
              const formattedDate = `${year}-${month}-${day}`;
    
              setNDateValue(selectedDate); // Update local state
              row.original.NEXTDATE = formattedDate;
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;

              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.NEXTDATE = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.NEXTDATE = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              }
    
              // Update the selected value in the table state
              const updatedRows = table.getRowModel().rows.map((r) =>
                r.id === cell.row.id
                  ? { ...r.original, NEXTDATE: formattedDate } // Update record
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
      accessorKey: 'PADATE',
      header: 'Pay Date',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
    
      // Edit mode: Show DatePickerInput
      Edit: ({ row, table, cell }) => {
        const initialPDate = formatDate(row.original.PADATE?.toString()); // Expecting format: YYYY/MM/DD
    
        // State to track selected date
        const [pDateValue, setPDateValue] = useState<Date | null>(initialPDate || new Date());
    
        return (
          <DatePickerInput
            icon={<IconCalendar size={24} stroke={2.0} />}
            label="Pay Date"
            value={pDateValue}
            onChange={(selectedDate) => {
              if (!selectedDate) return;
    
              // Format selected date as YYYY-MM-DD
              const year = selectedDate.getFullYear();
              const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
              const day = String(selectedDate.getDate()).padStart(2, '0');
              const formattedDate = `${year}-${month}-${day}`;
    
              setPDateValue(selectedDate); // Update local state
              row.original.PADATE = formattedDate;
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;

              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.PADATE = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.PADATE = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              }
    
              // Update the selected value in the table state
              const updatedRows = table.getRowModel().rows.map((r) =>
                r.id === cell.row.id
                  ? { ...r.original, PADATE: formattedDate } // Update record
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
      accessorKey: 'CALLDATE',
      header: 'Option Call',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
    
      // Edit mode: Show DatePickerInput
      Edit: ({ row, table, cell }) => {
        const initialCDate = formatDate(row.original.CALLDATE?.toString()); // Expecting format: YYYY/MM/DD
    
        // State to track selected date
        const [cDateValue, setCDateValue] = useState<Date | null>(initialCDate || new Date());
    
        return (
          <DatePickerInput
            icon={<IconCalendar size={24} stroke={2.0} />}
            label="Option Call"
            value={cDateValue}
            onChange={(selectedDate) => {
              if (!selectedDate) return;
    
              // Format selected date as YYYY-MM-DD
              const year = selectedDate.getFullYear();
              const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
              const day = String(selectedDate.getDate()).padStart(2, '0');
              const formattedDate = `${year}-${month}-${day}`;
    
              setCDateValue(selectedDate); // Update local state
              row.original.CALLDATE = formattedDate;
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;

              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.CALLDATE = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.CALLDATE = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              }
    
              // Update the selected value in the table state
              const updatedRows = table.getRowModel().rows.map((r) =>
                r.id === cell.row.id
                  ? { ...r.original, CALLDATE: formattedDate } // Update record
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
      accessorKey: 'LASTDATE',
      header: 'Last Payment',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
    
      // Edit mode: Show DatePickerInput
      Edit: ({ row, table, cell }) => {
        const initialLDate = formatDate(row.original.LASTDATE?.toString()); // Expecting format: YYYY/MM/DD
    
        // State to track selected date
        const [lDateValue, setLDateValue] = useState<Date | null>(initialLDate || new Date());
    
        return (
          <DatePickerInput
            icon={<IconCalendar size={24} stroke={2.0} />}
            label="Last Payment"
            value={lDateValue}
            onChange={(selectedDate) => {
              if (!selectedDate) return;
    
              // Format selected date as YYYY-MM-DD
              const year = selectedDate.getFullYear();
              const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
              const day = String(selectedDate.getDate()).padStart(2, '0');
              const formattedDate = `${year}-${month}-${day}`;
    
              setLDateValue(selectedDate); // Update local state
              row.original.LASTDATE = formattedDate;
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;

              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.LASTDATE = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.LASTDATE = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              }
    
              // Update the selected value in the table state
              const updatedRows = table.getRowModel().rows.map((r) =>
                r.id === cell.row.id
                  ? { ...r.original, LASTDATE: formattedDate } // Update record
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
      accessorKey: 'FCPNDATE',
      header: 'First Coupon',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
    
      // Edit mode: Show DatePickerInput
      Edit: ({ row, table, cell }) => {
        const initialFDate = formatDate(row.original.FCPNDATE?.toString()); // Expecting format: YYYY/MM/DD
    
        // State to track selected date
        const [fDateValue, setFDateValue] = useState<Date | null>(initialFDate || new Date());
    
        return (
          <DatePickerInput
            icon={<IconCalendar size={24} stroke={2.0} />}
            label="First Coupon"
            value={fDateValue}
            onChange={(selectedDate) => {
              if (!selectedDate) return;
    
              // Format selected date as YYYY-MM-DD
              const year = selectedDate.getFullYear();
              const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
              const day = String(selectedDate.getDate()).padStart(2, '0');
              const formattedDate = `${year}-${month}-${day}`;
    
              setFDateValue(selectedDate); // Update local state
              row.original.FCPNDATE = formattedDate;
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;

              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.FCPNDATE = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.FCPNDATE = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              }
    
              // Update the selected value in the table state
              const updatedRows = table.getRowModel().rows.map((r) =>
                r.id === cell.row.id
                  ? { ...r.original, FCPNDATE: formattedDate } // Update record
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
      accessorKey: 'PUTDATE',
      header: 'Option Put',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
    
      // Edit mode: Show DatePickerInput
      Edit: ({ row, table, cell }) => {
        const initialPutDate = formatDate(row.original.PUTDATE?.toString()); // Expecting format: YYYY/MM/DD
    
        // State to track selected date
        const [ptDateValue, setPTDateValue] = useState<Date | null>(initialPutDate || new Date());
    
        return (
          <DatePickerInput
            icon={<IconCalendar size={24} stroke={2.0} />}
            label="Option Put"
            value={ptDateValue}
            onChange={(selectedDate) => {
              if (!selectedDate) return;
    
              // Format selected date as YYYY-MM-DD
              const year = selectedDate.getFullYear();
              const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
              const day = String(selectedDate.getDate()).padStart(2, '0');
              const formattedDate = `${year}-${month}-${day}`;
    
              setPTDateValue(selectedDate); // Update local state
              row.original.PUTDATE = formattedDate;
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;

              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.PUTDATE = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.PUTDATE = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              }
    
              // Update the selected value in the table state
              const updatedRows = table.getRowModel().rows.map((r) =>
                r.id === cell.row.id
                  ? { ...r.original, PUTDATE: formattedDate } // Update record
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
      accessorKey: 'IDATE',
      header: 'Original Issue',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
    
      // Edit mode: Show DatePickerInput
      Edit: ({ row, table, cell }) => {
        const initialIDate = formatDate(row.original.IDATE?.toString()); // Expecting format: YYYY/MM/DD
    
        // State to track selected date
        const [iDateValue, setIDateValue] = useState<Date | null>(initialIDate || new Date());
    
        return (
          <DatePickerInput
            icon={<IconCalendar size={24} stroke={2.0} />}
            label="Original Issue"
            value={iDateValue}
            onChange={(selectedDate) => {
              if (!selectedDate) return;
    
              // Format selected date as YYYY-MM-DD
              const year = selectedDate.getFullYear();
              const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
              const day = String(selectedDate.getDate()).padStart(2, '0');
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
                  ? { ...r.original, IDATE: formattedDate } // Update record
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
      accessorKey: 'XDIVDATE',
      header: 'X Dividend',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
    
      // Edit mode: Show DatePickerInput
      Edit: ({ row, table, cell }) => {
        const initialIDate = formatDate(row.original.XDIVDATE?.toString()); // Expecting format: YYYY/MM/DD
    
        // State to track selected date
        const [xDateValue, setXDateValue] = useState<Date | null>(initialIDate || new Date());
    
        return (
          <DatePickerInput
            icon={<IconCalendar size={24} stroke={2.0} />}
            label="X Dividend"
            value={xDateValue}
            onChange={(selectedDate) => {
              if (!selectedDate) return;
    
              // Format selected date as YYYY-MM-DD
              const year = selectedDate.getFullYear();
              const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
              const day = String(selectedDate.getDate()).padStart(2, '0');
              const formattedDate = `${year}-${month}-${day}`;
    
              setXDateValue(selectedDate); // Update local state
              row.original.XDIVDATE = formattedDate;
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;

              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.XDIVDATE = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.XDIVDATE = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              }
    
              // Update the selected value in the table state
              const updatedRows = table.getRowModel().rows.map((r) =>
                r.id === cell.row.id
                  ? { ...r.original, XDIVDATE: formattedDate } // Update record
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
      accessorKey: 'MATURITY',
      header: 'Maturity',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
    
      // Edit mode: Show DatePickerInput
      Edit: ({ row, table, cell }) => {
        const initialMDate = formatDate(row.original.MATURITY?.toString()); // Expecting format: YYYY/MM/DD
    
        // State to track selected date
        const [mDateValue, setMDateValue] = useState<Date | null>(initialMDate || new Date());
    
        return (
          <DatePickerInput
            icon={<IconCalendar size={24} stroke={2.0} />}
            label="Maturity"
            value={mDateValue}
            onChange={(selectedDate) => {
              if (!selectedDate) return;
    
              // Format selected date as YYYY-MM-DD
              const year = selectedDate.getFullYear();
              const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
              const day = String(selectedDate.getDate()).padStart(2, '0');
              const formattedDate = `${year}-${month}-${day}`;
    
              setMDateValue(selectedDate); // Update local state
              row.original.MATURITY = formattedDate;
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;

              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.MATURITY = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.MATURITY = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              }
    
              // Update the selected value in the table state
              const updatedRows = table.getRowModel().rows.map((r) =>
                r.id === cell.row.id
                  ? { ...r.original, MATURITY: formattedDate } // Update record
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
      accessorKey: 'CURPRICE', 
      header: '	Current Price',
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'number',
        error: validationErrors['CURPRICE'],
        onFocus: () => setValidationErrors({...validationErrors, CURPRICE: ''}),
        maxLength: 25,
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
      accessorKey: 'MTDPRICE', 
      header: '	Month to Date Price',
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'number',
        error: validationErrors['MTDPRICE'],
        onFocus: () => setValidationErrors({...validationErrors, MTDPRICE: ''}),
        maxLength: 25,
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
      accessorKey: 'FRIPRICE', 
      header: '	Friday Price',
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'number',
        error: validationErrors['FRIPRICE'],
        onFocus: () => setValidationErrors({...validationErrors, FRIPRICE: ''}),
        maxLength: 25,
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
      accessorKey: 'YIELD', 
      header: '	Yield on Asset',
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'number',
        error: validationErrors['YIELD'],
        onFocus: () => setValidationErrors({...validationErrors, YIELD: ''}),
        maxLength: 25,
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
          minimumFractionDigits: 4,
          maximumFractionDigits: 4,
        }),
    },
    {
      accessorKey: 'SPAYDATE', 
      header: '	Start Payment',
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'number',
        error: validationErrors['SPAYDATE'],
        onFocus: () => setValidationErrors({...validationErrors, SPAYDATE: ''}),
        maxLength: 4,
      },
      mantineTableHeadCellProps: {
        align: "right",
        className: 'rpt-header-3',
      },
      mantineTableBodyCellProps: {
        align: "right",
      },
    },
    {
      accessorKey: 'FPAYDATE', 
      header: '		Final Payment',
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'number',
        error: validationErrors['FPAYDATE'],
        onFocus: () => setValidationErrors({...validationErrors, FPAYDATE: ''}),
        maxLength: 4,
      },
      mantineTableHeadCellProps: {
        align: "right",
        className: 'rpt-header-3',
      },
      mantineTableBodyCellProps: {
        align: "right",
      },
    },
    {
      accessorKey: 'BETA', 
      header: '	Accrual Override',
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'number',
        error: validationErrors['BETA'],
        onFocus: () => setValidationErrors({...validationErrors, BETA: ''}),
        maxLength: 6,
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
          minimumFractionDigits: 3,
          maximumFractionDigits: 3,
        }),
    },
    {
      accessorKey: 'SCATEGORY',
      header: "Category 1",
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      mantineEditSelectProps: {
        required: true,
      },
      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(cell.getValue<string>());
        const airCntry = processedISO.map(iso => ({ value: iso.ISO, label: iso.ISONAME + ' (' + iso.ISO + ')' }));
        return (
          <Select
            label="Category 1"
            data={airCntry}
            value={value} 
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.SCATEGORY = selectedValue || '';
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.SCATEGORY = selectedValue;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.SCATEGORY = selectedValue;
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Update the selected value in the table state
              const selectedVal = airCntry.find((option) => option.value === selectedValue);
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table.getRowModel().rows.map((r) =>
                  r.id === cell.row.id
                ? { ...r.original, SCATEGORY: selectedValue || '' } : r.original
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
      accessorKey: 'HCATEGORY',
      header: "Category 2",
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      mantineEditSelectProps: {
        required: true,
      },
      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(cell.getValue<string>());
        const airCntry = processedISO.map(iso => ({ value: iso.ISO, label: iso.ISONAME + ' (' + iso.ISO + ')' }));
        return (
          <Select
            label="Category 2"
            data={airCntry}
            value={value} 
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.HCATEGORY = selectedValue || '';
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.HCATEGORY = selectedValue;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.HCATEGORY = selectedValue;
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Update the selected value in the table state
              const selectedVal = airCntry.find((option) => option.value === selectedValue);
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table.getRowModel().rows.map((r) =>
                  r.id === cell.row.id
                ? { ...r.original, HCATEGORY: selectedValue || '' } : r.original
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
      accessorKey: 'CUSIP', 
      header: 'Cusip',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'text',
        error: validationErrors['CUSIP'],
        onFocus: () => setValidationErrors({...validationErrors, CUSIP: ''}),
        maxLength: 9,
      },
    },
    {
      accessorKey: 'SSTATE', 
      header: 'State Id',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'text',
        error: validationErrors['SSTATE'],
        onFocus: () => setValidationErrors({...validationErrors, SSTATE: ''}),
        maxLength: 2,
      },
    },
    {
      accessorKey: 'QUALITY', 
      header: 'Bond Quality',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'text',
        error: validationErrors['QUALITY'],
        onFocus: () => setValidationErrors({...validationErrors, QUALITY: ''}),
        maxLength: 6,
      },
    },
    {
      accessorKey: 'QUALITY2', 
      header: 'Bond Quality 2',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'text',
        error: validationErrors['QUALITY2'],
        onFocus: () => setValidationErrors({...validationErrors, QUALITY2: ''}),
        maxLength: 6,
      },
    },
    {
      accessorKey: 'SKIPUOOB', 
      header: 'Skip Units Out of Balance',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      // Edit mode: Dropdown with correct selected value
      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(cell.getValue<string>() || '.');
        return (
          <Select
            label="Skip Units Out of Balance"
            data={secSKIPLOG}
            value={value} 
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.SKIPUOOB = selectedValue || '.';
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.SKIPUOOB = selectedValue;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.SKIPUOOB = selectedValue;
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Update the selected value in the table state
              const selectedVal = secSKIPLOG.find((option) => option.value === selectedValue);
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table.getRowModel().rows.map((r) =>
                  r.id === cell.row.id
                ? { ...r.original, SKIPUOOB: selectedValue || '.' } : r.original
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
      accessorKey: 'BMRK_ID', 
      header: 'Benchmark ID',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'text',
        error: validationErrors['BMRK_ID'],
        onFocus: () => setValidationErrors({...validationErrors, BMRK_ID: ''}),
        maxLength: 4,
      },
    },
    {
      accessorKey: 'MWRR_FLAG', 
      header: 'Include in MWRR Reporting?',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      
      // Display Yes/No text in normal (view) mode
      Cell: ({ cell }) => {
        return cell.getValue() === 'Y' ? 'Yes' : 'No';
      },
      
      // Edit mode: Show switch for better UX
      Edit: ({ cell, row }) => {
        const [value, setValue] = useState(cell.getValue() === 'Y' ? true : false);
    
        const handleChange = (checked: boolean) => {
          setValue(checked);
          // Update the row's data with the new value
          row._valuesCache[cell.column.id] = checked ? 'Y' : 'N';
        };
    
        return (
          <Switch
            label="Include in MWRR Reporting?"
            checked={value}
            onChange={(event) => handleChange(event.currentTarget.checked)}
            aria-label="Include in MWRR Reporting?"
          />
        );
      },
    },
    {
      accessorKey: 'USERAN1',
      header: 'User Answer 1', 
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'text',
        error: validationErrors['USERAN1'],
        onFocus: () => setValidationErrors({...validationErrors, USERAN1: ''}),
        maxLength: 50,
      },
    },
    {
      accessorKey: 'USERAN2',
      header: 'User Answer 2', 
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'text',
        error: validationErrors['USERAN2'],
        onFocus: () => setValidationErrors({...validationErrors, USERAN2: ''}),
        maxLength: 50,
      },
    },
    {
      accessorKey: 'USERAN3',
      header: 'User Answer 3', 
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'text',
        error: validationErrors['USERAN3'],
        onFocus: () => setValidationErrors({...validationErrors, USERAN3: ''}),
        maxLength: 50,
      },
    },
    {
      accessorKey: 'USERAN4',
      header: 'User Answer 4', 
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'text',
        error: validationErrors['USERAN4'],
        onFocus: () => setValidationErrors({...validationErrors, USERAN4: ''}),
        maxLength: 50,
      },
    },
    {
      accessorKey: 'USERAN5',
      header: 'User Answer 5', 
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'text',
        error: validationErrors['USERAN5'],
        onFocus: () => setValidationErrors({...validationErrors, USERAN5: ''}),
        maxLength: 50,
      },
    },
    {
      accessorKey: 'USERAN6',
      header: 'User Answer 6',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      }, 
      editVariant: 'text',
      mantineEditTextInputProps: {
        type: 'text',
        error: validationErrors['USERAN6'],
        onFocus: () => setValidationErrors({...validationErrors, USERAN6: ''}),
        maxLength: 10,
      },
    },
  ];
};
