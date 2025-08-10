import { useState } from "react";
import { type MRT_ColumnDef } from "mantine-react-table";
import { Select } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { IconCalendar } from "@tabler/icons-react";
import { useISODDL } from "../../hooks/useFrpNamesFiltersDDLsApi.js";
import { formatDate } from "../../hooks/FormatDates.tsx";

export type ExchangeRatessFields = {
  id: string;
  XDATE: string;
  ISOF: string;
  ISOT: string;
  TYP: number;
  XRATE: number;
};

// Column definitions as a separate component
export const useExchangeRatesColumns = (
  finalData,
  setData: (data: ExchangeRatessFields[]) => void, // Add a setData function to update the parent state
  isCreateModal: boolean,
  client: any,

  validationErrors: Record<string, string> // Add this parameter
): MRT_ColumnDef<ExchangeRatessFields>[] => {

  // Fetch ISO details
  const { data: processedISO } = useISODDL(client);

  return [
    {
      accessorKey: "XDATE",
      header: "Benchmark Date",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      enableEditing: isCreateModal,

      // Edit mode: Show DatePickerInput
      Edit: ({ row, table, cell }) => {
        const initialXDate = formatDate(row.original.XDATE?.toString()); // Expecting format: YYYY/MM/DD

        // State to track selected date
        const [xDateValue, setIDateValue] = useState<Date | null>(initialXDate || new Date());

        return (
          <DatePickerInput
            icon={<IconCalendar size={24} stroke={2.0} />}
            label="Benchmark Date"
            value={xDateValue}
            disabled={!isCreateModal}
            onChange={(selectedDate) => {
              if (!selectedDate) return;

              // Format selected date as YYYY-MM-DD
              const year = selectedDate.getFullYear();
              const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
              const day = String(selectedDate.getDate()).padStart(2, "0");
              const formattedDate = `${year}-${month}-${day}`;

              setIDateValue(selectedDate); // Update local state
              row.original.XDATE = formattedDate;
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;

              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.XDATE = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.XDATE = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              }

              // Update the selected value in the table state
              const updatedRows = table.getRowModel().rows.map((r) =>
                r.id === cell.row.id
                  ? { ...r.original, XDATE: formattedDate } // Update XDATE
                  : r.original
              );
              setData(updatedRows); // Update table state
            }}
          />
        );
      },

      Cell: ({ cell }) => {
        const dateValue = cell.getValue<string>(); // Ensure it's a string
        if (!dateValue) return ""; // Handle empty values
        // Format the dates as "YYYY-MM-DD"
        const formattedDate = new Date(dateValue).toLocaleDateString("en-CA", {
          year: "numeric",
          month: "2-digit",
        });

        return formattedDate.replace("-", "/").replace("-", "/"); // Convert YYYY-MM to YYYY/MM
      },
    },
    {
      accessorKey: "ISOF",
      enableEditing: isCreateModal,
      header: "ISO From",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditSelectProps: {
        required: true,
      },
      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(cell.getValue<string>());
        const exchRateISO = processedISO.map((iso) => ({ value: iso.ISO, label: `${iso.ISO} - ${iso.ISONAME}` }));
        return (
          <Select
            label="ISO From"
            data={exchRateISO}
            value={value}
            disabled={!isCreateModal}
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.ISOF = selectedValue || "";
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.ISOF = selectedValue;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.ISOF = selectedValue;
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Find the selected value in the options
              const selectedVal = exchRateISO.find((option) => option.value === selectedValue);
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table.getRowModel().rows.map((r) => (r.id === cell.row.id ? { ...r.original, ISOF: selectedValue || "" } : r.original));
                setData(updatedRows);
              }
            }}
            searchable
            filter={(value, item) => item.label?.toLowerCase().includes(value.toLowerCase().trim()) ?? false}
            nothingFound="No options found"
          />
        );
      },
    },
    {
      accessorKey: "ISOT",
      header: "ISO From",
      enableEditing: isCreateModal,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditSelectProps: {
        required: true,
      },
      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(cell.getValue<string>());
        const exchRateISO = processedISO.map((iso) => ({ value: iso.ISO, label: `${iso.ISO} - ${iso.ISONAME}` }));
        return (
          <Select
            label="ISO From"
            data={exchRateISO}
            value={value}
            disabled={!isCreateModal}
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.ISOT = selectedValue || "";
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.ISOT = selectedValue;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.ISOT = selectedValue;
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Find the selected value in the options
              const selectedVal = exchRateISO.find((option) => option.value === selectedValue);
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table.getRowModel().rows.map((r) => (r.id === cell.row.id ? { ...r.original, ISOT: selectedValue || "" } : r.original));
                setData(updatedRows);
              }
            }}
            searchable
            filter={(value, item) => item.label?.toLowerCase().includes(value.toLowerCase().trim()) ?? false}
            nothingFound="No options found"
          />
        );
      },
    },

    {
      accessorKey: "TYP",
      enableEditing: isCreateModal,
      header: "Type",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },

      mantineEditTextInputProps: {
        type: "number",
        error: validationErrors["TYP"], // Display validation error
        onFocus: () => {},
        maxLength: 14,
      },
      size: 14,
    },
    {
      accessorKey: "XRATE",
      header: "Exchange Rate",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
        align: "right",
      },
      mantineTableBodyCellProps: {
        align: "right",
      },
      mantineEditTextInputProps: {
        type: "number",
        error: validationErrors["XRATE"], // Display validation error
        onFocus: () => {},
        maxLength: 14,
      },
      size: 14,
    },
  ];
};
