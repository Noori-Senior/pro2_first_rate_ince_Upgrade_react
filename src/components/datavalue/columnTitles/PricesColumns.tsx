import React, { useState } from "react";
import { type MRT_ColumnDef } from "mantine-react-table";
import { Select } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { IconCalendar } from "@tabler/icons-react";
import { IconChevronDown } from "@tabler/icons-react";
import { useAssetPriceDDLID } from "../../hooks/useFrpNamesFiltersDDLsApi";

export type PricesFields = {
  id: string;
  ID: string;
  NAMETKR: string;
  SDATE: string;
  SPRICE: string;
  DATESTMP: string;
  PRINFACT: string;
};

// Column definitions as a separate component
export const usePricesColumns = (
  isCreateModal: boolean,
  client: any,
  validationErrors: Record<string, string>, // Add this parameter
  fromDate: string,
  toDate: string
): MRT_ColumnDef<PricesFields>[] => {
  // Helper function to safely parse date strings
  const formatSDate = (dateString: string) => {
    if (!dateString) return null;

    if (dateString.length === 6) {
      // If format is YYYYMM, convert to YYYY-MM-DD
      return new Date(
        `${dateString.substring(0, 4)}-${dateString.substring(4, 6)}-01`
      );
    }

    if (dateString.length === 10) {
      // If format is YYYY-MM-DD, create a Date object directly
      return new Date(dateString);
    }

    return null; // Invalid date string
  };

  const assetPriceDDLID = useAssetPriceDDLID(client, fromDate, toDate); // Fetching the data for Asset dropdown

  return [
   {
      accessorKey: "ID",
      header: "Asset ID",
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      enableEditing: isCreateModal,
      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(cell.getValue<string>());
        const priceAsset = (assetPriceDDLID.data ?? []).map((hid: any) => ({ value: hid.ID, label: hid.NAMETKR + ` ( ${hid.ID} )` }));
        return (
          <Select
            label="Asset ID"
            data={priceAsset}
            value={value} 
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.ID = selectedValue || '';
              // determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.ID = selectedValue || '';
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.ID = selectedValue || '';
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Find the selected value in the dropdown options
              const selectedVal = priceAsset.find((option) => option.value === selectedValue);
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table.getRowModel().rows.map((r) =>
                  r.id === cell.row.id
                ? { 
                    ...r.original, 
                    NAMETKR: selectedVal ? selectedVal.label.split('(')[0] : '', 
                    ID: selectedValue ? selectedValue : '' 
                  } 
                : r.original
                );
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
      enableEditing: false,
      header: "Asset Name",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["NAMETKR"], // Display validation error
        onFocus: () => {},
        maxLength: 14,
      },
      size: 14,
    },
    {
      accessorKey: "SDATE",
      enableEditing: isCreateModal, // Disable in create modal, enable in edit modal
      header: "Date",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },

      mantineEditTextInputProps: {
        type: "date",
        required: true,
        error: validationErrors["SDATE"], // Display validation error
        onFocus: () => {}, // Remove local state update
      },
      Cell: ({ cell }) => {
        const sdateValue = cell.getValue<string>(); // Get the date range (e.g., "202002 202003")
        if (!sdateValue) return ""; // Handle empty values

        const sDate = formatSDate(sdateValue);

        if (!sDate) return "Invalid Date"; // Handle invalid dates

        // Format the dates as "YYYY-MM-DD"
        const formattedSDate = sDate.toLocaleDateString("en-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

        return `${formattedSDate}`;
      },
      Edit: ({ row, table }) => {
        // Parse SDATE (expected format: YYYY-MM-DD or YYYYMM)
        const initialDate = formatSDate(row.original.SDATE);

        // State to track the local date (initialize with parsed SDATE)
        const [localSDate, setLocalSDate] = useState<Date | null>(
          initialDate || new Date()
        );

        // Check if editing is enabled for this field
        const isEditable = isCreateModal;

        return (
          <DatePickerInput
            label="SDATE"
            icon={<IconCalendar size={24} stroke={2} />}
            value={localSDate} // Pre-populate input with parsed date
            onChange={(newSDate) => {
              if (newSDate && isEditable) {
                // Format the new date as "YYYY-MM-DD" in local time
                const year = newSDate.getFullYear();
                const month = String(newSDate.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
                const day = String(newSDate.getDate()).padStart(2, "0");

                const formattedDate = `${year}-${month}-${day}`;

                // Log the change for debugging
                console.log("New Selected Date (Local):", formattedDate);

                // Update local state
                setLocalSDate(newSDate);

                // Update the row object directly
                row.original.SDATE = formattedDate;

                // Force update in the table's state
                const creatingRow = table.getState().creatingRow;
                const editingRow = table.getState().editingRow;
                if (creatingRow && creatingRow._valuesCache) {
                  creatingRow._valuesCache.SDATE = formattedDate;
                  table.setEditingRow(editingRow); // Ensure state is updated
                } else if (editingRow && editingRow._valuesCache) {
                  editingRow._valuesCache.SDATE = formattedDate;
                  table.setEditingRow(editingRow); // Ensure state is updated
                }

                // Ensure that the API references the latest row data
                console.log("Updated Row for API Submission:", row.original);
              }
            }}
            disabled={!isEditable} // Disable the input if editing is not allowed
            style={{ flex: 1 }}
          />
        );
      },
    },
    {
      accessorKey: "DATESTMP",
      header: "Date Time Stamp",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      enableEditing: isCreateModal,
      mantineEditTextInputProps: {
        type: "text",
        required: true,
        error: validationErrors["SPRICE"], // Display validation error
        onFocus: () => {}, // Remove local state update
        maxLength: 5,
      },
      Cell: ({ cell }) => {
        const sdateValue = cell.getValue<string>(); // Get the date range (e.g., "202002 202003")
        if (!sdateValue) return ""; // Handle empty values

        const sDate = formatSDate(sdateValue);

        if (!sDate) return "Invalid Date"; // Handle invalid dates

        // Format the dates as "YYYY-MM-DD"
        const formattedSDate = sDate.toLocaleDateString("en-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

        return `${formattedSDate}`;
      },
      Edit: ({ row, table }) => {
        // Parse SDATE (expected format: YYYY-MM-DD or YYYYMM)
        const initialDate = formatSDate(row.original.DATESTMP);

        // State to track the local date (initialize with parsed SDATE)
        const [localSDate, setLocalSDate] = useState<Date | null>(
          initialDate || new Date()
        );

        return (
          <DatePickerInput
            label="Date Time Stamp"
            icon={<IconCalendar size={24} stroke={2} />}
            value={localSDate} // Pre-populate input with parsed date
            onChange={(newSDate) => {
              if (newSDate) {
                // Format the new date as "YYYY-MM-DD" in local time
                const year = newSDate.getFullYear();
                const month = String(newSDate.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
                const day = String(newSDate.getDate()).padStart(2, "0");

                const formattedDate = `${year}-${month}-${day}`;

                // Log the change for debugging
                console.log("New Selected Date (Local):", formattedDate);

                // Update local state
                setLocalSDate(newSDate);

                // Update the row object directly
                row.original.DATESTMP = formattedDate;

                // Force update in the table's state
                const creatingRow = table.getState().creatingRow;
                const editingRow = table.getState().editingRow;
                if (creatingRow && creatingRow._valuesCache) {
                  creatingRow._valuesCache.DATESTMP = formattedDate;
                  table.setEditingRow(editingRow); // Ensure state is updated
                } else if (editingRow && editingRow._valuesCache) {
                  editingRow._valuesCache.DATESTMP = formattedDate;
                  table.setEditingRow(editingRow); // Ensure state is updated
                }

                // Ensure that the API references the latest row data
                console.log("Updated Row for API Submission:", row.original);
              }
            }}
            style={{ flex: 1 }}
          />
        );
      },
    },
    {
      accessorKey: "SPRICE",
      header: "Price",
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "number",
        required: true,
        error: validationErrors["SPRICE"], // Display validation error
        onFocus: () => {}, // Remove local state update
        maxLength: 5,
      },
      size: 50,
      mantineTableHeadCellProps: {
        align: "right",
        className: "rpt-header-3",
      },
      mantineTableBodyCellProps: {
        align: "right",
      },
      Cell: ({ cell }) =>
        cell
          .getValue<number>()
          ?.toLocaleString("en-US", {
            minimumFractionDigits: 6,
            maximumFractionDigits: 6,
          }),
    },
    {
      accessorKey: "PRINFACT",
      header: "Pricing Factor",
      editVariant: "select", // Optional, indicating it's a dropdown
      size: 50,
      mantineEditTextInputProps: {
        type: "text",
        required: true,
        error: validationErrors["PRINFACT"], // Display validation error
        onFocus: () => {}, // Remove local state update
        maxLength: 5,
      },

      mantineTableHeadCellProps: {
        align: "right",
        className: "rpt-header-3",
      },
      mantineTableBodyCellProps: {
        align: "right",
      },
      Cell: ({ cell }) =>
        cell
          .getValue<number>()
          ?.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
      Edit: ({ row, table }) => {
        // Dropdown options
        const options = [
          { value: "Not Defined", label: "Not Defined" },
          { value: "0", label: "0" },
          { value: "1", label: "1" },
          { value: ".01", label: ".01" },
          { value: "100", label: "100" },
        ];

        // Convert the API value to a string for comparison
        const initialValue = options.some(
          (option) => option.value === String(row.original.PRINFACT)
        )
          ? String(row.original.PRINFACT) // Convert to string if valid
          : "Not Defined"; // Default to "Not Defined" if invalid

        const [selectedValue, setSelectedValue] = useState(initialValue);

        return (
          <Select
            label="Pricing Factor"
            value={selectedValue} // Pre-populated value as a string
            onChange={(newValue) => {
              const finalValue = newValue ?? "Not Defined";
              setSelectedValue(finalValue); // Update local state
              row.original.PRINFACT = finalValue; // Update the row data

              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;

              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.PRINFACT = finalValue;
                table.setEditingRow(editingRow);
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.PRINFACT = finalValue;
                table.setEditingRow(editingRow);
              }

              console.log("Updated PRICING_FACTOR Value:", row.original);
            }}
            searchable
            filter={(query, option) =>
              option.label
                ?.toLowerCase()
                .includes(query.toLowerCase().trim()) ?? false
            } // Enable search
            data={options}
            placeholder="Select a pricing factor" // Placeholder for dropdown
            required
            error={validationErrors["PRINFACT"]}
            style={{ flex: 1 }}
            rightSection={
              <div style={{ pointerEvents: "none" }}>
                <IconChevronDown color="grey" size={20} />
              </div>
            } // Dropdown icon
            withinPortal // Ensures dropdown renders properly
          />
        );
      },
    },
  ];
};
