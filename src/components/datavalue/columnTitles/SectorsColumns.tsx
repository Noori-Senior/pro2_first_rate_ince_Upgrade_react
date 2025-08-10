import React, { useEffect, useState } from "react";
import { type MRT_ColumnDef } from "mantine-react-table";
import { DatePickerInput } from "@mantine/dates";
import { IconCalendar } from "@tabler/icons-react";
import { Select } from "@mantine/core";
import { useCountryDDL } from "../../hooks/useFrpNamesFiltersDDLsApi.js";
import { useSectorDDL } from "../../hooks/useFrpNamesFiltersDDLsApi.js";
import { formatDate } from "../../hooks/FormatDates.tsx";

export type SectorsFields = {
  id: string;
  ACCT: string;
  NAME: string;
  COUNTRY: string;
  SECTOR: string;
  SNAME: string;
  ADATE: string;
  UVR: string;
  MKT: string;
  INC: string;
  ACC: string;
  POL: string;
  POS: string;
  NEG: string;
  PF: string;
  NF: string;
  STATUS: string;
  SRCFREQ: string;
  SRCTOL: string;
  UVRL: string;
  LINKUVR: string;
  LINKCK: string;
  DATESTMP: string;
  PMKT: string;
  PACC: string;
  DFLOWS: string;
};

// Column definitions as a separate component
export const useSectorsColumns = (
  setData: (data: SectorsFields[]) => void, // Add a setData function to update the parent state
  client: any,
  isEditable: boolean,
  validationErrors: Record<string, string> // Add this parameter
): MRT_ColumnDef<SectorsFields>[] => {
  // Fetch Country details
  const { data: processedCountry } = useCountryDDL(client);
  const sectorDDLID = useSectorDDL(client, "FRPSECTR"); // Fetching the data for SECTOR dropdown

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

  return [
    {
      accessorKey: "ACCT",
      header: "Portfolio ID",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      enableEditing: isEditable,
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        required: isEditable,
        error: isEditable ? validationErrors["ACCT"] : null, // Use passed error
        onFocus: () => {}, // Remove local state update
        maxLength: 14,
      },
      size: 14,
    },
    {
      accessorKey: "NAME",
      header: "Portfolio Name",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      enableEditing: false,
      size: 250,
    },
    {
      accessorKey: "COUNTRY",
      enableEditing: isEditable,
      header: "Country",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditSelectProps: {
        required: true,
      },
      Edit: ({ cell, table, row }) => {
        // Get the current value from the row or use the first country as default
        const initialValue =
          cell.getValue<string>() ||
          (processedCountry.length > 0 ? processedCountry[0].COUNTRY : null);

        const [value, setValue] = useState<string | null>(initialValue);

        const sectorCntry = processedCountry.map((country) => ({
          value: country.COUNTRY,
          label: `${country.CNAME} (${country.COUNTRY})`,
        }));

        // Set the initial value in the row data if it's empty
        useEffect(() => {
          if (!row.original.COUNTRY && processedCountry.length > 0) {
            row.original.COUNTRY = processedCountry[0].COUNTRY;
            setValue(processedCountry[0].COUNTRY);

            // Update table state
            const creatingRow = table.getState().creatingRow;
            const editingRow = table.getState().editingRow;

            if (creatingRow && creatingRow._valuesCache) {
              creatingRow._valuesCache.COUNTRY = processedCountry[0].COUNTRY;
            } else if (editingRow && editingRow._valuesCache) {
              editingRow._valuesCache.COUNTRY = processedCountry[0].COUNTRY;
            }
          }
        }, [processedCountry]);

        return (
          <Select
            label="Country"
            data={sectorCntry}
            value={value}
            onChange={(selectedCntry) => {
              setValue(selectedCntry);
              row.original.COUNTRY = selectedCntry ?? "";

              // Update table state
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;

              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.COUNTRY = selectedCntry;
                table.setEditingRow(editingRow);
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.COUNTRY = selectedCntry;
                table.setEditingRow(editingRow);
              }
            }}
            searchable
            filter={(value, item) =>
              item.label?.toLowerCase().includes(value.toLowerCase().trim()) ??
              false
            }
            nothingFound="No options found"
          />
        );
      },
      size: 14,
    },
    {
      accessorKey: "SECTOR",
      enableEditing: isEditable,
      header: "Sector",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      Edit: ({ cell, table, row }) => {
        // Get initial value from cell or use first sector if available
        const initialValue =
          cell.getValue<string>() ||
          (sectorDDLID.data?.length ? sectorDDLID.data[0].SECTOR : null);

        const [value, setValue] = useState<string | null>(initialValue);

        const sectors = (sectorDDLID.data ?? []).map((sector) => ({
          value: sector.SECTOR,
          label: `${sector.SNAME} (${sector.SECTOR})`,
        }));

        // Set initial value in row data if empty
        useEffect(() => {
          if (!row.original.SECTOR && sectorDDLID.data?.length) {
            const firstSector = sectorDDLID.data[0].SECTOR;
            row.original.SECTOR = firstSector;
            setValue(firstSector);

            // Update table state
            const creatingRow = table.getState().creatingRow;
            const editingRow = table.getState().editingRow;

            if (creatingRow && creatingRow._valuesCache) {
              creatingRow._valuesCache.SECTOR = firstSector;
              creatingRow._valuesCache.SNAME = sectorDDLID.data[0].SNAME;
            } else if (editingRow && editingRow._valuesCache) {
              editingRow._valuesCache.SECTOR = firstSector;
              editingRow._valuesCache.SNAME = sectorDDLID.data[0].SNAME;
            }
          }
        }, [sectorDDLID.data]);

        return (
          <Select
            label="Sector"
            data={sectors}
            value={value}
            onChange={(selectedSector) => {
              setValue(selectedSector);
              const selectedSectorData = sectors.find(
                (s) => s.value === selectedSector
              );

              // Update row data
              row.original.SECTOR = selectedSector || "";
              row.original.SNAME =
                selectedSectorData?.label.split("(")[0].trim() || "";

              // Update table state
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;

              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.SECTOR = selectedSector;
                creatingRow._valuesCache.SNAME =
                  selectedSectorData?.label.split("(")[0].trim() || "";
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.SECTOR = selectedSector;
                editingRow._valuesCache.SNAME =
                  selectedSectorData?.label.split("(")[0].trim() || "";
              }

              // Force table update
              table.setEditingRow(editingRow);
            }}
            searchable
            filter={(value, item) =>
              item.label?.toLowerCase().includes(value.toLowerCase().trim()) ??
              false
            }
            nothingFound="No options found"
            placeholder={
              sectors.length ? "Select sector" : "Loading sectors..."
            }
            disabled={!sectors.length}
          />
        );
      },
    },
    {
      accessorKey: "SNAME",
      header: "Sector Name",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      enableEditing: isEditable, // Make this column non-editable
    },
    {
      accessorKey: "ADATE",
      header: "As Of Date",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      enableEditing: isEditable,

      // Edit mode: Show DatePickerInput
      Edit: ({ row, table, cell }) => {
        const initialADate = formatDate(row.original.ADATE?.toString()); // Expecting format: YYYY/MM/DD

        // State to track selected date
        const [aDateValue, setADateValue] = useState<Date | null>(
          initialADate ? new Date(initialADate) : new Date()
        );

        useEffect(() => {
          if (!row.original.ADATE) {
            const defaultDate = new Date();
            const formattedDate = defaultDate.toISOString().split("T")[0]; // Format YYYY-MM-DD

            setADateValue(defaultDate);
            row.original.ADATE = formattedDate;
          }
        }, []);

        return (
          <DatePickerInput
            icon={<IconCalendar size={24} stroke={2.0} />}
            label="As Of Date"
            value={aDateValue}
            disabled={!isEditable}
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
        if (!dateValue) return ""; // Handle empty values

        const formattedDate = new Date(dateValue).toLocaleDateString("en-CA", {
          year: "numeric",
          month: "2-digit",
        });

        return formattedDate.replace("-", "/").replace("-", "/"); // Convert YYYY-MM to YYYY/MM
      },
    },
    {
      accessorKey: "UVR",
      header: "Unit Value Return",
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "number",
        required: true,
        error: validationErrors["UVR"], // Display validation error
        onFocus: () => {},
        maxLength: 14,
      },
      size: 14,
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
      accessorKey: "MKT",
      header: "Market Value",
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "number",
        required: true,
        error: validationErrors["MKT"], // Display validation error
        onFocus: () => {},
        maxLength: 14,
      },
      size: 14,
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
      accessorKey: "INC",
      header: "Income Received",
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "number",
        required: true,
        error: validationErrors["INC"], // Display validation error
        onFocus: () => {},
        maxLength: 14,
      },
      size: 14,
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
      accessorKey: "ACC",
      header: "Accrual",
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "number",
        required: true,
        error: validationErrors["ACC"], // Display validation error
        onFocus: () => {},
        maxLength: 14,
      },
      size: 14,
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
      accessorKey: "POL",
      header: "Policy",
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "number",
        required: true, // Validate only if editable
        error: validationErrors["POL"], // Show error only if editable
        onFocus: () => {},
        maxLength: 14,
      },
      size: 14,
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
      accessorKey: "POS",
      header: "Positive Flows",
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "number",
        required: true,
        error: validationErrors["POS"], // Display validation error
        onFocus: () => {},
        maxLength: 14,
      },
      size: 14,
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
      accessorKey: "NEG",
      header: "Negative Flows",
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "number",
        required: true,
        error: validationErrors["NEG"], // Display validation error
        onFocus: () => {},
        maxLength: 14,
      },
      size: 14,
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
      accessorKey: "PF",
      header: "Positive Flow Factor",
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "number",
        required: isEditable,
        error: isEditable ? validationErrors["PF"] : null, // Display validation error
        onFocus: () => {},
        maxLength: 14,
      },
      size: 14,
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
      accessorKey: "NF",
      header: "Negative Flow Factor",
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "number",
        required: isEditable,
        error: validationErrors["NF"], // Display validation error
        onFocus: () => {},
        maxLength: 14,
      },
      size: 14,
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
      accessorKey: "STATUS",
      header: "STATUS",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        required: isEditable,
        error: isEditable ? validationErrors["STATUS"] : null, // Display validation error
        onFocus: () => {},
        maxLength: 14,
      },
      size: 14,
    },
    {
      accessorKey: "SRCFREQ",
      header: "Sector Return Frequency",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        required: isEditable,
        error: validationErrors["SRCFREQ"], // Display validation error
        onFocus: () => {},
        maxLength: 14,
      },
      size: 14,
    },
    {
      accessorKey: "SRCTOL",
      header: "Sector Return Tolerance",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "number",
        required: isEditable,
        error: validationErrors["SRCTOL"], // Display validation error
        onFocus: () => {},
        maxLength: 14,
      },
      size: 14,
    },
    {
      accessorKey: "UVRL",
      header: "Local UVR",
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "number",
        required: isEditable,
        error: isEditable ? validationErrors["UVRL"] : null, // Display validation error
        onFocus: () => {},
        maxLength: 14,
      },
      size: 14,
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
      accessorKey: "LINKUVR",
      header: "Linked UVR",
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "number",
        required: isEditable,
        error: isEditable ? validationErrors["LINKUVR"] : null, // Display validation error
        onFocus: () => {},
        maxLength: 14,
      },
      size: 14,
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
      accessorKey: "LINKCK",
      header: "LINKCK",
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "number",
        required: isEditable,
        error: isEditable ? validationErrors["LINKCK"] : null, // Display validation error
        onFocus: () => {},
        maxLength: 14,
      },
      size: 14,
    },

    {
      accessorKey: "DATESTMP",
      header: "Last Updated Date",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      enableEditing: isEditable,
      mantineEditTextInputProps: {
        type: "text",
        required: isEditable,
        error: validationErrors["DATESTMP"], // Display validation error
        onFocus: () => {}, // Remove local state update
      },
      Cell: ({ cell }) => {
        const dateValue = cell.getValue<string>();
        if (!dateValue) return "";

        try {
          // Directly parse the ISO string
          const date = new Date(dateValue);

          // Check if date is valid
          if (isNaN(date.getTime())) return "Invalid Date";

          // Format as readable date/time
          return date.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        } catch {
          return "Invalid Date";
        }
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
            label="Last Updated Date"
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
      accessorKey: "PMKT",
      header: "Prior Market Value",
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "number",
        required: isEditable,
        error: validationErrors["PMKT"], // Display validation error
        onFocus: () => {},
        maxLength: 14,
      },
      size: 14,
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
      accessorKey: "PACC",
      header: "Prior Market Accrual",
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "number",
        required: isEditable,
        error: validationErrors["PACC"], // Display validation error
        onFocus: () => {},
        maxLength: 14,
      },
      size: 14,
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
      accessorKey: "DFLOWS",
      header: "Direct Flows Bucket",
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "number",
        required: isEditable,
        error: isEditable ? validationErrors["DFLOWS"] : null, // Display validation error
        onFocus: () => {},
        maxLength: 14,
      },
      size: 14,
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
