import React, { useState } from "react";
import { type MRT_ColumnDef } from "mantine-react-table";
import { Group } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { IconCalendar } from "@tabler/icons-react";

export type CompositesFields = {
  id: string;
  ACCT: string;
  NAME: string;
  AGG: string;
  AGGNAME: string;
  DTOVER01: string;
  DTOVER02: string;
  DTOVER03: string;
  DTOVER04: string;
  DTOVER05: string;
  DTOVER06: string;
  DTOVER07: string;
  DTOVER08: string;
  DTOVER09: string;
  DTOVER10: string;
  DTOVER11: string;
  DTOVER12: string;
  DTOVER13: string;
  DTOVER14: string;
  DTOVER15: string;
  DTOVER16: string;
  DTOVER17: string;
  DTOVER18: string;
  DTOVER19: string;
  DTOVER20: string;
  DTOVER21: string;
  DTOVER22: string;
  DTOVER23: string;
  DTOVER24: string;
  DTOVER25: string;
  ENTRRSN01: string;
  EXITRSN01: string;
  ENTRRSN02: string;
  EXITRSN02: string;
  ENTRRSN03: string;
  EXITRSN03: string;
  ENTRRSN04: string;
  EXITRSN04: string;
  ENTRRSN05: string;
  EXITRSN05: string;
  ENTRRSN06: string;
  EXITRSN06: string;
  ENTRRSN07: string;
  EXITRSN07: string;
  ENTRRSN08: string;
  EXITRSN08: string;
  ENTRRSN09: string;
  EXITRSN09: string;
  ENTRRSN10: string;
  EXITRSN10: string;
  ENTRRSN11: string;
  EXITRSN11: string;
  ENTRRSN12: string;
  EXITRSN12: string;
  ENTRRSN13: string;
  EXITRSN13: string;
  ENTRRSN14: string;
  EXITRSN14: string;
  ENTRRSN15: string;
  EXITRSN15: string;
  ENTRRSN16: string;
  EXITRSN16: string;
  ENTRRSN17: string;
  EXITRSN17: string;
  ENTRRSN18: string;
  EXITRSN18: string;
  ENTRRSN19: string;
  EXITRSN19: string;
  ENTRRSN20: string;
  EXITRSN20: string;
  ENTRRSN21: string;
  EXITRSN21: string;
  ENTRRSN22: string;
  EXITRSN22: string;
  ENTRRSN23: string;
  EXITRSN23: string;
  ENTRRSN24: string;
  EXITRSN24: string;
  ENTRRSN25: string;
  EXITRSN25: string;
  RECDTYPE: string;
};

// Column definitions as a separate component
export const useCompositesColumns = (
  data: CompositesFields[],
  setData: (data: CompositesFields[]) => void, // Add a setData function to update the parent state
  isEditable: boolean
): MRT_ColumnDef<CompositesFields>[] => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  return [
    {
      accessorKey: "ACCT",
      header: "Portfolio ID",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        required: true,
        error: validationErrors["ACCT"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, ACCT: undefined }),
        maxLength: 14,
      },
      enableEditing: isEditable,
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
      accessorKey: "AGG",
      header: "Aggregate ID",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        required: true,
        error: validationErrors["AGG"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, AGG: undefined }),
        maxLength: 11,
      },
      enableEditing: isEditable,
      size: 11,
    },
    {
      accessorKey: "DTOVER01",
      header: "DTOVER01",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      Cell: ({ cell }) => {
        const dateRange = cell.getValue<string>(); // Get the date range (e.g., "202002 202003")
        if (!dateRange) return ""; // Handle empty values

        // Split the date range into from and to parts
        const [fromPart, toPart] = dateRange.split(" ");

        // Format as YYYYMM YYYYMM
        const formatDatePart = (part: string) => {
          if (part?.length !== 6) return part;
          return `${part.substring(0, 4)}${part.substring(4, 6)}`;
        };

        return `${formatDatePart(fromPart)} ${formatDatePart(toPart)}`;
      },

      // Custom edit component for "From Date" and "To Date"
      Edit: ({ row, table, cell }) => {
        // Get the current date
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-indexed

        // Format current month as yyyymm
        const currentMonthFormatted = `${currentYear}${String(
          currentMonth + 1
        ).padStart(2, "0")}`;

        // Get the existing date range or use current month for both if empty
        const dateRange =
          row.original.DTOVER01 ||
          `${currentMonthFormatted} ${currentMonthFormatted}`;

        // Parse the date range into "From Date" and "To Date"
        const [fromPart, toPart] = dateRange.split(" ");

        // Convert yyyymm strings to Date objects
        const parseDatePart = (part: string) => {
          if (!part || part.length !== 6)
            return new Date(currentYear, currentMonth, 1);
          const year = parseInt(part.substring(0, 4));
          const month = parseInt(part.substring(4, 6)) - 1; // months are 0-indexed
          return new Date(year, month, 1);
        };

        const [localFromDate, setLocalFromDate] = useState<Date | null>(
          parseDatePart(fromPart)
        );
        const [localToDate, setLocalToDate] = useState<Date | null>(
          parseDatePart(toPart)
        );

        // Convert Date object to yyyymm format
        const formatToYyyymm = (date: Date | null) => {
          if (!date) return "";
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          return `${year}${month}`;
        };

        const handleDateChange = (
          type: "from" | "to",
          selectedDate: Date | null
        ) => {
          if (!selectedDate) return;

          if (type === "from") {
            setLocalFromDate(selectedDate);
          } else {
            setLocalToDate(selectedDate);
          }

          // Format the new date range
          const newFrom =
            type === "from"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localFromDate);
          const newTo =
            type === "to"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localToDate);
          const newDateRange = `${newFrom} ${newTo}`.trim();

          // Update the row data
          row.original.DTOVER01 = newDateRange;

          // Update table state
          const creatingRow = table.getState().creatingRow;
          const editingRow = table.getState().editingRow;

          if (creatingRow && creatingRow._valuesCache) {
            creatingRow._valuesCache.DTOVER01 = newDateRange;
            table.setEditingRow(editingRow);
          } else if (editingRow && editingRow._valuesCache) {
            editingRow._valuesCache.DTOVER01 = newDateRange;
            table.setEditingRow(editingRow);
          }

          // Update the selected value in the table state
          const updatedRows = table
            .getRowModel()
            .rows.map((r) =>
              r.id === cell.row.id
                ? { ...r.original, DTOVER01: newDateRange }
                : r.original
            );
          setData(updatedRows);
        };

        return (
          <div>
            <label style={{ marginBottom: "8px", fontSize: "14px" }}>
              DTOVER01
            </label>
            <Group noWrap>
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="From Date"
                value={localFromDate}
                onChange={(selectedDate) =>
                  handleDateChange("from", selectedDate)
                }
              />
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="To Date"
                value={localToDate}
                onChange={(selectedDate) =>
                  handleDateChange("to", selectedDate)
                }
              />
            </Group>
          </div>
        );
      },
    },
    {
      accessorKey: "DTOVER02",
      header: "DTOVER02",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      Cell: ({ cell }) => {
        const dateRange = cell.getValue<string>(); // Get the date range (e.g., "202002 202003")
        if (!dateRange) return ""; // Handle empty values

        // Split the date range into from and to parts
        const [fromPart, toPart] = dateRange.split(" ");

        // Format as YYYYMM YYYYMM
        const formatDatePart = (part: string) => {
          if (part?.length !== 6) return part;
          return `${part.substring(0, 4)}${part.substring(4, 6)}`;
        };

        return `${formatDatePart(fromPart)} ${formatDatePart(toPart)}`;
      },

      // Custom edit component for "From Date" and "To Date"
      Edit: ({ row, table, cell }) => {
        // Get the current date
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-indexed

        // Format current month as yyyymm
        const currentMonthFormatted = `${currentYear}${String(
          currentMonth + 1
        ).padStart(2, "0")}`;

        // Get the existing date range or use current month for both if empty
        const dateRange =
          row.original.DTOVER02 ||
          `${currentMonthFormatted} ${currentMonthFormatted}`;

        // Parse the date range into "From Date" and "To Date"
        const [fromPart, toPart] = dateRange.split(" ");

        // Convert yyyymm strings to Date objects
        const parseDatePart = (part: string) => {
          if (!part || part.length !== 6)
            return new Date(currentYear, currentMonth, 1);
          const year = parseInt(part.substring(0, 4));
          const month = parseInt(part.substring(4, 6)) - 1; // months are 0-indexed
          return new Date(year, month, 1);
        };

        const [localFromDate, setLocalFromDate] = useState<Date | null>(
          parseDatePart(fromPart)
        );
        const [localToDate, setLocalToDate] = useState<Date | null>(
          parseDatePart(toPart)
        );

        // Convert Date object to yyyymm format
        const formatToYyyymm = (date: Date | null) => {
          if (!date) return "";
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          return `${year}${month}`;
        };

        const handleDateChange = (
          type: "from" | "to",
          selectedDate: Date | null
        ) => {
          if (!selectedDate) return;

          if (type === "from") {
            setLocalFromDate(selectedDate);
          } else {
            setLocalToDate(selectedDate);
          }

          // Format the new date range
          const newFrom =
            type === "from"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localFromDate);
          const newTo =
            type === "to"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localToDate);
          const newDateRange = `${newFrom} ${newTo}`.trim();

          // Update the row data
          row.original.DTOVER02 = newDateRange;

          // Update table state
          const creatingRow = table.getState().creatingRow;
          const editingRow = table.getState().editingRow;

          if (creatingRow && creatingRow._valuesCache) {
            creatingRow._valuesCache.DTOVER02 = newDateRange;
            table.setEditingRow(editingRow);
          } else if (editingRow && editingRow._valuesCache) {
            editingRow._valuesCache.DTOVER02 = newDateRange;
            table.setEditingRow(editingRow);
          }

          // Update the selected value in the table state
          const updatedRows = table
            .getRowModel()
            .rows.map((r) =>
              r.id === cell.row.id
                ? { ...r.original, DTOVER02: newDateRange }
                : r.original
            );
          setData(updatedRows);
        };

        return (
          <div>
            <label style={{ marginBottom: "8px", fontSize: "14px" }}>
              DTOVER02
            </label>
            <Group noWrap>
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="From Date"
                value={localFromDate}
                onChange={(selectedDate) =>
                  handleDateChange("from", selectedDate)
                }
              />
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="To Date"
                value={localToDate}
                onChange={(selectedDate) =>
                  handleDateChange("to", selectedDate)
                }
              />
            </Group>
          </div>
        );
      },
    },
    {
      accessorKey: "DTOVER03",
      header: "DTOVER03",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      Cell: ({ cell }) => {
        const dateRange = cell.getValue<string>(); // Get the date range (e.g., "202002 202003")
        if (!dateRange) return ""; // Handle empty values

        // Split the date range into from and to parts
        const [fromPart, toPart] = dateRange.split(" ");

        // Format as YYYYMM YYYYMM
        const formatDatePart = (part: string) => {
          if (part?.length !== 6) return part;
          return `${part.substring(0, 4)}${part.substring(4, 6)}`;
        };

        return `${formatDatePart(fromPart)} ${formatDatePart(toPart)}`;
      },

      // Custom edit component for "From Date" and "To Date"
      Edit: ({ row, table, cell }) => {
        // Get the current date
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-indexed

        // Format current month as yyyymm
        const currentMonthFormatted = `${currentYear}${String(
          currentMonth + 1
        ).padStart(2, "0")}`;

        // Get the existing date range or use current month for both if empty
        const dateRange =
          row.original.DTOVER03 ||
          `${currentMonthFormatted} ${currentMonthFormatted}`;

        // Parse the date range into "From Date" and "To Date"
        const [fromPart, toPart] = dateRange.split(" ");

        // Convert yyyymm strings to Date objects
        const parseDatePart = (part: string) => {
          if (!part || part.length !== 6)
            return new Date(currentYear, currentMonth, 1);
          const year = parseInt(part.substring(0, 4));
          const month = parseInt(part.substring(4, 6)) - 1; // months are 0-indexed
          return new Date(year, month, 1);
        };

        const [localFromDate, setLocalFromDate] = useState<Date | null>(
          parseDatePart(fromPart)
        );
        const [localToDate, setLocalToDate] = useState<Date | null>(
          parseDatePart(toPart)
        );

        // Convert Date object to yyyymm format
        const formatToYyyymm = (date: Date | null) => {
          if (!date) return "";
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          return `${year}${month}`;
        };

        const handleDateChange = (
          type: "from" | "to",
          selectedDate: Date | null
        ) => {
          if (!selectedDate) return;

          if (type === "from") {
            setLocalFromDate(selectedDate);
          } else {
            setLocalToDate(selectedDate);
          }

          // Format the new date range
          const newFrom =
            type === "from"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localFromDate);
          const newTo =
            type === "to"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localToDate);
          const newDateRange = `${newFrom} ${newTo}`.trim();

          // Update the row data
          row.original.DTOVER03 = newDateRange;

          // Update table state
          const creatingRow = table.getState().creatingRow;
          const editingRow = table.getState().editingRow;

          if (creatingRow && creatingRow._valuesCache) {
            creatingRow._valuesCache.DTOVER03 = newDateRange;
            table.setEditingRow(editingRow);
          } else if (editingRow && editingRow._valuesCache) {
            editingRow._valuesCache.DTOVER03 = newDateRange;
            table.setEditingRow(editingRow);
          }

          // Update the selected value in the table state
          const updatedRows = table
            .getRowModel()
            .rows.map((r) =>
              r.id === cell.row.id
                ? { ...r.original, DTOVER03: newDateRange }
                : r.original
            );
          setData(updatedRows);
        };

        return (
          <div>
            <label style={{ marginBottom: "8px", fontSize: "14px" }}>
              DTOVER03
            </label>
            <Group noWrap>
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="From Date"
                value={localFromDate}
                onChange={(selectedDate) =>
                  handleDateChange("from", selectedDate)
                }
              />
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="To Date"
                value={localToDate}
                onChange={(selectedDate) =>
                  handleDateChange("to", selectedDate)
                }
              />
            </Group>
          </div>
        );
      },
    },
    {
      accessorKey: "DTOVER04",
      header: "DTOVER04",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      Cell: ({ cell }) => {
        const dateRange = cell.getValue<string>(); // Get the date range (e.g., "202002 202003")
        if (!dateRange) return ""; // Handle empty values

        // Split the date range into from and to parts
        const [fromPart, toPart] = dateRange.split(" ");

        // Format as YYYYMM YYYYMM
        const formatDatePart = (part: string) => {
          if (part?.length !== 6) return part;
          return `${part.substring(0, 4)}${part.substring(4, 6)}`;
        };

        return `${formatDatePart(fromPart)} ${formatDatePart(toPart)}`;
      },

      // Custom edit component for "From Date" and "To Date"
      Edit: ({ row, table, cell }) => {
        // Get the current date
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-indexed

        // Format current month as yyyymm
        const currentMonthFormatted = `${currentYear}${String(
          currentMonth + 1
        ).padStart(2, "0")}`;

        // Get the existing date range or use current month for both if empty
        const dateRange =
          row.original.DTOVER04 ||
          `${currentMonthFormatted} ${currentMonthFormatted}`;

        // Parse the date range into "From Date" and "To Date"
        const [fromPart, toPart] = dateRange.split(" ");

        // Convert yyyymm strings to Date objects
        const parseDatePart = (part: string) => {
          if (!part || part.length !== 6)
            return new Date(currentYear, currentMonth, 1);
          const year = parseInt(part.substring(0, 4));
          const month = parseInt(part.substring(4, 6)) - 1; // months are 0-indexed
          return new Date(year, month, 1);
        };

        const [localFromDate, setLocalFromDate] = useState<Date | null>(
          parseDatePart(fromPart)
        );
        const [localToDate, setLocalToDate] = useState<Date | null>(
          parseDatePart(toPart)
        );

        // Convert Date object to yyyymm format
        const formatToYyyymm = (date: Date | null) => {
          if (!date) return "";
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          return `${year}${month}`;
        };

        const handleDateChange = (
          type: "from" | "to",
          selectedDate: Date | null
        ) => {
          if (!selectedDate) return;

          if (type === "from") {
            setLocalFromDate(selectedDate);
          } else {
            setLocalToDate(selectedDate);
          }

          // Format the new date range
          const newFrom =
            type === "from"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localFromDate);
          const newTo =
            type === "to"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localToDate);
          const newDateRange = `${newFrom} ${newTo}`.trim();

          // Update the row data
          row.original.DTOVER04 = newDateRange;

          // Update table state
          const creatingRow = table.getState().creatingRow;
          const editingRow = table.getState().editingRow;

          if (creatingRow && creatingRow._valuesCache) {
            creatingRow._valuesCache.DTOVER04 = newDateRange;
            table.setEditingRow(editingRow);
          } else if (editingRow && editingRow._valuesCache) {
            editingRow._valuesCache.DTOVER04 = newDateRange;
            table.setEditingRow(editingRow);
          }

          // Update the selected value in the table state
          const updatedRows = table
            .getRowModel()
            .rows.map((r) =>
              r.id === cell.row.id
                ? { ...r.original, DTOVER04: newDateRange }
                : r.original
            );
          setData(updatedRows);
        };

        return (
          <div>
            <label style={{ marginBottom: "8px", fontSize: "14px" }}>
              DTOVER04
            </label>
            <Group noWrap>
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="From Date"
                value={localFromDate}
                onChange={(selectedDate) =>
                  handleDateChange("from", selectedDate)
                }
              />
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="To Date"
                value={localToDate}
                onChange={(selectedDate) =>
                  handleDateChange("to", selectedDate)
                }
              />
            </Group>
          </div>
        );
      },
    },
    {
      accessorKey: "DTOVER05",
      header: "DTOVER05",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      Cell: ({ cell }) => {
        const dateRange = cell.getValue<string>(); // Get the date range (e.g., "202002 202003")
        if (!dateRange) return ""; // Handle empty values

        // Split the date range into from and to parts
        const [fromPart, toPart] = dateRange.split(" ");

        // Format as YYYYMM YYYYMM
        const formatDatePart = (part: string) => {
          if (part?.length !== 6) return part;
          return `${part.substring(0, 4)}${part.substring(4, 6)}`;
        };

        return `${formatDatePart(fromPart)} ${formatDatePart(toPart)}`;
      },

      // Custom edit component for "From Date" and "To Date"
      Edit: ({ row, table, cell }) => {
        // Get the current date
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-indexed

        // Format current month as yyyymm
        const currentMonthFormatted = `${currentYear}${String(
          currentMonth + 1
        ).padStart(2, "0")}`;

        // Get the existing date range or use current month for both if empty
        const dateRange =
          row.original.DTOVER05 ||
          `${currentMonthFormatted} ${currentMonthFormatted}`;

        // Parse the date range into "From Date" and "To Date"
        const [fromPart, toPart] = dateRange.split(" ");

        // Convert yyyymm strings to Date objects
        const parseDatePart = (part: string) => {
          if (!part || part.length !== 6)
            return new Date(currentYear, currentMonth, 1);
          const year = parseInt(part.substring(0, 4));
          const month = parseInt(part.substring(4, 6)) - 1; // months are 0-indexed
          return new Date(year, month, 1);
        };

        const [localFromDate, setLocalFromDate] = useState<Date | null>(
          parseDatePart(fromPart)
        );
        const [localToDate, setLocalToDate] = useState<Date | null>(
          parseDatePart(toPart)
        );

        // Convert Date object to yyyymm format
        const formatToYyyymm = (date: Date | null) => {
          if (!date) return "";
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          return `${year}${month}`;
        };

        const handleDateChange = (
          type: "from" | "to",
          selectedDate: Date | null
        ) => {
          if (!selectedDate) return;

          if (type === "from") {
            setLocalFromDate(selectedDate);
          } else {
            setLocalToDate(selectedDate);
          }

          // Format the new date range
          const newFrom =
            type === "from"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localFromDate);
          const newTo =
            type === "to"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localToDate);
          const newDateRange = `${newFrom} ${newTo}`.trim();

          // Update the row data
          row.original.DTOVER05 = newDateRange;

          // Update table state
          const creatingRow = table.getState().creatingRow;
          const editingRow = table.getState().editingRow;

          if (creatingRow && creatingRow._valuesCache) {
            creatingRow._valuesCache.DTOVER05 = newDateRange;
            table.setEditingRow(editingRow);
          } else if (editingRow && editingRow._valuesCache) {
            editingRow._valuesCache.DTOVER05 = newDateRange;
            table.setEditingRow(editingRow);
          }

          // Update the selected value in the table state
          const updatedRows = table
            .getRowModel()
            .rows.map((r) =>
              r.id === cell.row.id
                ? { ...r.original, DTOVER05: newDateRange }
                : r.original
            );
          setData(updatedRows);
        };

        return (
          <div>
            <label style={{ marginBottom: "8px", fontSize: "14px" }}>
              DTOVER05
            </label>
            <Group noWrap>
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="From Date"
                value={localFromDate}
                onChange={(selectedDate) =>
                  handleDateChange("from", selectedDate)
                }
              />
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="To Date"
                value={localToDate}
                onChange={(selectedDate) =>
                  handleDateChange("to", selectedDate)
                }
              />
            </Group>
          </div>
        );
      },
    },
    {
      accessorKey: "DTOVER06",
      header: "DTOVER06",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      Cell: ({ cell }) => {
        const dateRange = cell.getValue<string>(); // Get the date range (e.g., "202002 202003")
        if (!dateRange) return ""; // Handle empty values

        // Split the date range into from and to parts
        const [fromPart, toPart] = dateRange.split(" ");

        // Format as YYYYMM YYYYMM
        const formatDatePart = (part: string) => {
          if (part?.length !== 6) return part;
          return `${part.substring(0, 4)}${part.substring(4, 6)}`;
        };

        return `${formatDatePart(fromPart)} ${formatDatePart(toPart)}`;
      },

      // Custom edit component for "From Date" and "To Date"
      Edit: ({ row, table, cell }) => {
        // Get the current date
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-indexed

        // Format current month as yyyymm
        const currentMonthFormatted = `${currentYear}${String(
          currentMonth + 1
        ).padStart(2, "0")}`;

        // Get the existing date range or use current month for both if empty
        const dateRange =
          row.original.DTOVER06 ||
          `${currentMonthFormatted} ${currentMonthFormatted}`;

        // Parse the date range into "From Date" and "To Date"
        const [fromPart, toPart] = dateRange.split(" ");

        // Convert yyyymm strings to Date objects
        const parseDatePart = (part: string) => {
          if (!part || part.length !== 6)
            return new Date(currentYear, currentMonth, 1);
          const year = parseInt(part.substring(0, 4));
          const month = parseInt(part.substring(4, 6)) - 1; // months are 0-indexed
          return new Date(year, month, 1);
        };

        const [localFromDate, setLocalFromDate] = useState<Date | null>(
          parseDatePart(fromPart)
        );
        const [localToDate, setLocalToDate] = useState<Date | null>(
          parseDatePart(toPart)
        );

        // Convert Date object to yyyymm format
        const formatToYyyymm = (date: Date | null) => {
          if (!date) return "";
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          return `${year}${month}`;
        };

        const handleDateChange = (
          type: "from" | "to",
          selectedDate: Date | null
        ) => {
          if (!selectedDate) return;

          if (type === "from") {
            setLocalFromDate(selectedDate);
          } else {
            setLocalToDate(selectedDate);
          }

          // Format the new date range
          const newFrom =
            type === "from"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localFromDate);
          const newTo =
            type === "to"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localToDate);
          const newDateRange = `${newFrom} ${newTo}`.trim();

          // Update the row data
          row.original.DTOVER06 = newDateRange;

          // Update table state
          const creatingRow = table.getState().creatingRow;
          const editingRow = table.getState().editingRow;

          if (creatingRow && creatingRow._valuesCache) {
            creatingRow._valuesCache.DTOVER06 = newDateRange;
            table.setEditingRow(editingRow);
          } else if (editingRow && editingRow._valuesCache) {
            editingRow._valuesCache.DTOVER06 = newDateRange;
            table.setEditingRow(editingRow);
          }

          // Update the selected value in the table state
          const updatedRows = table
            .getRowModel()
            .rows.map((r) =>
              r.id === cell.row.id
                ? { ...r.original, DTOVER06: newDateRange }
                : r.original
            );
          setData(updatedRows);
        };

        return (
          <div>
            <label style={{ marginBottom: "8px", fontSize: "14px" }}>
              DTOVER06
            </label>
            <Group noWrap>
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="From Date"
                value={localFromDate}
                onChange={(selectedDate) =>
                  handleDateChange("from", selectedDate)
                }
              />
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="To Date"
                value={localToDate}
                onChange={(selectedDate) =>
                  handleDateChange("to", selectedDate)
                }
              />
            </Group>
          </div>
        );
      },
    },
    {
      accessorKey: "DTOVER07",
      header: "DTOVER07",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      Cell: ({ cell }) => {
        const dateRange = cell.getValue<string>(); // Get the date range (e.g., "202002 202003")
        if (!dateRange) return ""; // Handle empty values

        // Split the date range into from and to parts
        const [fromPart, toPart] = dateRange.split(" ");

        // Format as YYYYMM YYYYMM
        const formatDatePart = (part: string) => {
          if (part?.length !== 6) return part;
          return `${part.substring(0, 4)}${part.substring(4, 6)}`;
        };

        return `${formatDatePart(fromPart)} ${formatDatePart(toPart)}`;
      },

      // Custom edit component for "From Date" and "To Date"
      Edit: ({ row, table, cell }) => {
        // Get the current date
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-indexed

        // Format current month as yyyymm
        const currentMonthFormatted = `${currentYear}${String(
          currentMonth + 1
        ).padStart(2, "0")}`;

        // Get the existing date range or use current month for both if empty
        const dateRange =
          row.original.DTOVER07 ||
          `${currentMonthFormatted} ${currentMonthFormatted}`;

        // Parse the date range into "From Date" and "To Date"
        const [fromPart, toPart] = dateRange.split(" ");

        // Convert yyyymm strings to Date objects
        const parseDatePart = (part: string) => {
          if (!part || part.length !== 6)
            return new Date(currentYear, currentMonth, 1);
          const year = parseInt(part.substring(0, 4));
          const month = parseInt(part.substring(4, 6)) - 1; // months are 0-indexed
          return new Date(year, month, 1);
        };

        const [localFromDate, setLocalFromDate] = useState<Date | null>(
          parseDatePart(fromPart)
        );
        const [localToDate, setLocalToDate] = useState<Date | null>(
          parseDatePart(toPart)
        );

        // Convert Date object to yyyymm format
        const formatToYyyymm = (date: Date | null) => {
          if (!date) return "";
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          return `${year}${month}`;
        };

        const handleDateChange = (
          type: "from" | "to",
          selectedDate: Date | null
        ) => {
          if (!selectedDate) return;

          if (type === "from") {
            setLocalFromDate(selectedDate);
          } else {
            setLocalToDate(selectedDate);
          }

          // Format the new date range
          const newFrom =
            type === "from"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localFromDate);
          const newTo =
            type === "to"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localToDate);
          const newDateRange = `${newFrom} ${newTo}`.trim();

          // Update the row data
          row.original.DTOVER07 = newDateRange;

          // Update table state
          const creatingRow = table.getState().creatingRow;
          const editingRow = table.getState().editingRow;

          if (creatingRow && creatingRow._valuesCache) {
            creatingRow._valuesCache.DTOVER07 = newDateRange;
            table.setEditingRow(editingRow);
          } else if (editingRow && editingRow._valuesCache) {
            editingRow._valuesCache.DTOVER07 = newDateRange;
            table.setEditingRow(editingRow);
          }

          // Update the selected value in the table state
          const updatedRows = table
            .getRowModel()
            .rows.map((r) =>
              r.id === cell.row.id
                ? { ...r.original, DTOVER07: newDateRange }
                : r.original
            );
          setData(updatedRows);
        };

        return (
          <div>
            <label style={{ marginBottom: "8px", fontSize: "14px" }}>
              DTOVER07
            </label>
            <Group noWrap>
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="From Date"
                value={localFromDate}
                onChange={(selectedDate) =>
                  handleDateChange("from", selectedDate)
                }
              />
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="To Date"
                value={localToDate}
                onChange={(selectedDate) =>
                  handleDateChange("to", selectedDate)
                }
              />
            </Group>
          </div>
        );
      },
    },
    {
      accessorKey: "DTOVER08",
      header: "DTOVER08",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      Cell: ({ cell }) => {
        const dateRange = cell.getValue<string>(); // Get the date range (e.g., "202002 202003")
        if (!dateRange) return ""; // Handle empty values

        // Split the date range into from and to parts
        const [fromPart, toPart] = dateRange.split(" ");

        // Format as YYYYMM YYYYMM
        const formatDatePart = (part: string) => {
          if (part?.length !== 6) return part;
          return `${part.substring(0, 4)}${part.substring(4, 6)}`;
        };

        return `${formatDatePart(fromPart)} ${formatDatePart(toPart)}`;
      },

      // Custom edit component for "From Date" and "To Date"
      Edit: ({ row, table, cell }) => {
        // Get the current date
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-indexed

        // Format current month as yyyymm
        const currentMonthFormatted = `${currentYear}${String(
          currentMonth + 1
        ).padStart(2, "0")}`;

        // Get the existing date range or use current month for both if empty
        const dateRange =
          row.original.DTOVER08 ||
          `${currentMonthFormatted} ${currentMonthFormatted}`;

        // Parse the date range into "From Date" and "To Date"
        const [fromPart, toPart] = dateRange.split(" ");

        // Convert yyyymm strings to Date objects
        const parseDatePart = (part: string) => {
          if (!part || part.length !== 6)
            return new Date(currentYear, currentMonth, 1);
          const year = parseInt(part.substring(0, 4));
          const month = parseInt(part.substring(4, 6)) - 1; // months are 0-indexed
          return new Date(year, month, 1);
        };

        const [localFromDate, setLocalFromDate] = useState<Date | null>(
          parseDatePart(fromPart)
        );
        const [localToDate, setLocalToDate] = useState<Date | null>(
          parseDatePart(toPart)
        );

        // Convert Date object to yyyymm format
        const formatToYyyymm = (date: Date | null) => {
          if (!date) return "";
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          return `${year}${month}`;
        };

        const handleDateChange = (
          type: "from" | "to",
          selectedDate: Date | null
        ) => {
          if (!selectedDate) return;

          if (type === "from") {
            setLocalFromDate(selectedDate);
          } else {
            setLocalToDate(selectedDate);
          }

          // Format the new date range
          const newFrom =
            type === "from"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localFromDate);
          const newTo =
            type === "to"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localToDate);
          const newDateRange = `${newFrom} ${newTo}`.trim();

          // Update the row data
          row.original.DTOVER08 = newDateRange;

          // Update table state
          const creatingRow = table.getState().creatingRow;
          const editingRow = table.getState().editingRow;

          if (creatingRow && creatingRow._valuesCache) {
            creatingRow._valuesCache.DTOVER08 = newDateRange;
            table.setEditingRow(editingRow);
          } else if (editingRow && editingRow._valuesCache) {
            editingRow._valuesCache.DTOVER08 = newDateRange;
            table.setEditingRow(editingRow);
          }

          // Update the selected value in the table state
          const updatedRows = table
            .getRowModel()
            .rows.map((r) =>
              r.id === cell.row.id
                ? { ...r.original, DTOVER08: newDateRange }
                : r.original
            );
          setData(updatedRows);
        };

        return (
          <div>
            <label style={{ marginBottom: "8px", fontSize: "14px" }}>
              DTOVER08
            </label>
            <Group noWrap>
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="From Date"
                value={localFromDate}
                onChange={(selectedDate) =>
                  handleDateChange("from", selectedDate)
                }
              />
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="To Date"
                value={localToDate}
                onChange={(selectedDate) =>
                  handleDateChange("to", selectedDate)
                }
              />
            </Group>
          </div>
        );
      },
    },
    {
      accessorKey: "DTOVER09",
      header: "DTOVER09",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      Cell: ({ cell }) => {
        const dateRange = cell.getValue<string>(); // Get the date range (e.g., "202002 202003")
        if (!dateRange) return ""; // Handle empty values

        // Split the date range into from and to parts
        const [fromPart, toPart] = dateRange.split(" ");

        // Format as YYYYMM YYYYMM
        const formatDatePart = (part: string) => {
          if (part?.length !== 6) return part;
          return `${part.substring(0, 4)}${part.substring(4, 6)}`;
        };

        return `${formatDatePart(fromPart)} ${formatDatePart(toPart)}`;
      },

      // Custom edit component for "From Date" and "To Date"
      Edit: ({ row, table, cell }) => {
        // Get the current date
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-indexed

        // Format current month as yyyymm
        const currentMonthFormatted = `${currentYear}${String(
          currentMonth + 1
        ).padStart(2, "0")}`;

        // Get the existing date range or use current month for both if empty
        const dateRange =
          row.original.DTOVER09 ||
          `${currentMonthFormatted} ${currentMonthFormatted}`;

        // Parse the date range into "From Date" and "To Date"
        const [fromPart, toPart] = dateRange.split(" ");

        // Convert yyyymm strings to Date objects
        const parseDatePart = (part: string) => {
          if (!part || part.length !== 6)
            return new Date(currentYear, currentMonth, 1);
          const year = parseInt(part.substring(0, 4));
          const month = parseInt(part.substring(4, 6)) - 1; // months are 0-indexed
          return new Date(year, month, 1);
        };

        const [localFromDate, setLocalFromDate] = useState<Date | null>(
          parseDatePart(fromPart)
        );
        const [localToDate, setLocalToDate] = useState<Date | null>(
          parseDatePart(toPart)
        );

        // Convert Date object to yyyymm format
        const formatToYyyymm = (date: Date | null) => {
          if (!date) return "";
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          return `${year}${month}`;
        };

        const handleDateChange = (
          type: "from" | "to",
          selectedDate: Date | null
        ) => {
          if (!selectedDate) return;

          if (type === "from") {
            setLocalFromDate(selectedDate);
          } else {
            setLocalToDate(selectedDate);
          }

          // Format the new date range
          const newFrom =
            type === "from"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localFromDate);
          const newTo =
            type === "to"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localToDate);
          const newDateRange = `${newFrom} ${newTo}`.trim();

          // Update the row data
          row.original.DTOVER09 = newDateRange;

          // Update table state
          const creatingRow = table.getState().creatingRow;
          const editingRow = table.getState().editingRow;

          if (creatingRow && creatingRow._valuesCache) {
            creatingRow._valuesCache.DTOVER09 = newDateRange;
            table.setEditingRow(editingRow);
          } else if (editingRow && editingRow._valuesCache) {
            editingRow._valuesCache.DTOVER09 = newDateRange;
            table.setEditingRow(editingRow);
          }

          // Update the selected value in the table state
          const updatedRows = table
            .getRowModel()
            .rows.map((r) =>
              r.id === cell.row.id
                ? { ...r.original, DTOVER09: newDateRange }
                : r.original
            );
          setData(updatedRows);
        };

        return (
          <div>
            <label style={{ marginBottom: "8px", fontSize: "14px" }}>
              DTOVER09
            </label>
            <Group noWrap>
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="From Date"
                value={localFromDate}
                onChange={(selectedDate) =>
                  handleDateChange("from", selectedDate)
                }
              />
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="To Date"
                value={localToDate}
                onChange={(selectedDate) =>
                  handleDateChange("to", selectedDate)
                }
              />
            </Group>
          </div>
        );
      },
    },
    {
      accessorKey: "DTOVER10",
      header: "DTOVER10",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      Cell: ({ cell }) => {
        const dateRange = cell.getValue<string>(); // Get the date range (e.g., "202002 202003")
        if (!dateRange) return ""; // Handle empty values

        // Split the date range into from and to parts
        const [fromPart, toPart] = dateRange.split(" ");

        // Format as YYYYMM YYYYMM
        const formatDatePart = (part: string) => {
          if (part?.length !== 6) return part;
          return `${part.substring(0, 4)}${part.substring(4, 6)}`;
        };

        return `${formatDatePart(fromPart)} ${formatDatePart(toPart)}`;
      },

      // Custom edit component for "From Date" and "To Date"
      Edit: ({ row, table, cell }) => {
        // Get the current date
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-indexed

        // Format current month as yyyymm
        const currentMonthFormatted = `${currentYear}${String(
          currentMonth + 1
        ).padStart(2, "0")}`;

        // Get the existing date range or use current month for both if empty
        const dateRange =
          row.original.DTOVER10 ||
          `${currentMonthFormatted} ${currentMonthFormatted}`;

        // Parse the date range into "From Date" and "To Date"
        const [fromPart, toPart] = dateRange.split(" ");

        // Convert yyyymm strings to Date objects
        const parseDatePart = (part: string) => {
          if (!part || part.length !== 6)
            return new Date(currentYear, currentMonth, 1);
          const year = parseInt(part.substring(0, 4));
          const month = parseInt(part.substring(4, 6)) - 1; // months are 0-indexed
          return new Date(year, month, 1);
        };

        const [localFromDate, setLocalFromDate] = useState<Date | null>(
          parseDatePart(fromPart)
        );
        const [localToDate, setLocalToDate] = useState<Date | null>(
          parseDatePart(toPart)
        );

        // Convert Date object to yyyymm format
        const formatToYyyymm = (date: Date | null) => {
          if (!date) return "";
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          return `${year}${month}`;
        };

        const handleDateChange = (
          type: "from" | "to",
          selectedDate: Date | null
        ) => {
          if (!selectedDate) return;

          if (type === "from") {
            setLocalFromDate(selectedDate);
          } else {
            setLocalToDate(selectedDate);
          }

          // Format the new date range
          const newFrom =
            type === "from"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localFromDate);
          const newTo =
            type === "to"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localToDate);
          const newDateRange = `${newFrom} ${newTo}`.trim();

          // Update the row data
          row.original.DTOVER10 = newDateRange;

          // Update table state
          const creatingRow = table.getState().creatingRow;
          const editingRow = table.getState().editingRow;

          if (creatingRow && creatingRow._valuesCache) {
            creatingRow._valuesCache.DTOVER10 = newDateRange;
            table.setEditingRow(editingRow);
          } else if (editingRow && editingRow._valuesCache) {
            editingRow._valuesCache.DTOVER10 = newDateRange;
            table.setEditingRow(editingRow);
          }

          // Update the selected value in the table state
          const updatedRows = table
            .getRowModel()
            .rows.map((r) =>
              r.id === cell.row.id
                ? { ...r.original, DTOVER10: newDateRange }
                : r.original
            );
          setData(updatedRows);
        };

        return (
          <div>
            <label style={{ marginBottom: "8px", fontSize: "14px" }}>
              DTOVER10
            </label>
            <Group noWrap>
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="From Date"
                value={localFromDate}
                onChange={(selectedDate) =>
                  handleDateChange("from", selectedDate)
                }
              />
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="To Date"
                value={localToDate}
                onChange={(selectedDate) =>
                  handleDateChange("to", selectedDate)
                }
              />
            </Group>
          </div>
        );
      },
    },
    {
      accessorKey: "DTOVER11",
      header: "DTOVER11",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      Cell: ({ cell }) => {
        const dateRange = cell.getValue<string>(); // Get the date range (e.g., "202002 202003")
        if (!dateRange) return ""; // Handle empty values

        // Split the date range into from and to parts
        const [fromPart, toPart] = dateRange.split(" ");

        // Format as YYYYMM YYYYMM
        const formatDatePart = (part: string) => {
          if (part?.length !== 6) return part;
          return `${part.substring(0, 4)}${part.substring(4, 6)}`;
        };

        return `${formatDatePart(fromPart)} ${formatDatePart(toPart)}`;
      },

      // Custom edit component for "From Date" and "To Date"
      Edit: ({ row, table, cell }) => {
        // Get the current date
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-indexed

        // Format current month as yyyymm
        const currentMonthFormatted = `${currentYear}${String(
          currentMonth + 1
        ).padStart(2, "0")}`;

        // Get the existing date range or use current month for both if empty
        const dateRange =
          row.original.DTOVER11 ||
          `${currentMonthFormatted} ${currentMonthFormatted}`;

        // Parse the date range into "From Date" and "To Date"
        const [fromPart, toPart] = dateRange.split(" ");

        // Convert yyyymm strings to Date objects
        const parseDatePart = (part: string) => {
          if (!part || part.length !== 6)
            return new Date(currentYear, currentMonth, 1);
          const year = parseInt(part.substring(0, 4));
          const month = parseInt(part.substring(4, 6)) - 1; // months are 0-indexed
          return new Date(year, month, 1);
        };

        const [localFromDate, setLocalFromDate] = useState<Date | null>(
          parseDatePart(fromPart)
        );
        const [localToDate, setLocalToDate] = useState<Date | null>(
          parseDatePart(toPart)
        );

        // Convert Date object to yyyymm format
        const formatToYyyymm = (date: Date | null) => {
          if (!date) return "";
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          return `${year}${month}`;
        };

        const handleDateChange = (
          type: "from" | "to",
          selectedDate: Date | null
        ) => {
          if (!selectedDate) return;

          if (type === "from") {
            setLocalFromDate(selectedDate);
          } else {
            setLocalToDate(selectedDate);
          }

          // Format the new date range
          const newFrom =
            type === "from"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localFromDate);
          const newTo =
            type === "to"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localToDate);
          const newDateRange = `${newFrom} ${newTo}`.trim();

          // Update the row data
          row.original.DTOVER11 = newDateRange;

          // Update table state
          const creatingRow = table.getState().creatingRow;
          const editingRow = table.getState().editingRow;

          if (creatingRow && creatingRow._valuesCache) {
            creatingRow._valuesCache.DTOVER11 = newDateRange;
            table.setEditingRow(editingRow);
          } else if (editingRow && editingRow._valuesCache) {
            editingRow._valuesCache.DTOVER11 = newDateRange;
            table.setEditingRow(editingRow);
          }

          // Update the selected value in the table state
          const updatedRows = table
            .getRowModel()
            .rows.map((r) =>
              r.id === cell.row.id
                ? { ...r.original, DTOVER11: newDateRange }
                : r.original
            );
          setData(updatedRows);
        };

        return (
          <div>
            <label style={{ marginBottom: "8px", fontSize: "14px" }}>
              DTOVER11
            </label>
            <Group noWrap>
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="From Date"
                value={localFromDate}
                onChange={(selectedDate) =>
                  handleDateChange("from", selectedDate)
                }
              />
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="To Date"
                value={localToDate}
                onChange={(selectedDate) =>
                  handleDateChange("to", selectedDate)
                }
              />
            </Group>
          </div>
        );
      },
    },
    {
      accessorKey: "DTOVER12",
      header: "DTOVER12",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      Cell: ({ cell }) => {
        const dateRange = cell.getValue<string>(); // Get the date range (e.g., "202002 202003")
        if (!dateRange) return ""; // Handle empty values

        // Split the date range into from and to parts
        const [fromPart, toPart] = dateRange.split(" ");

        // Format as YYYYMM YYYYMM
        const formatDatePart = (part: string) => {
          if (part?.length !== 6) return part;
          return `${part.substring(0, 4)}${part.substring(4, 6)}`;
        };

        return `${formatDatePart(fromPart)} ${formatDatePart(toPart)}`;
      },

      // Custom edit component for "From Date" and "To Date"
      Edit: ({ row, table, cell }) => {
        // Get the current date
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-indexed

        // Format current month as yyyymm
        const currentMonthFormatted = `${currentYear}${String(
          currentMonth + 1
        ).padStart(2, "0")}`;

        // Get the existing date range or use current month for both if empty
        const dateRange =
          row.original.DTOVER12 ||
          `${currentMonthFormatted} ${currentMonthFormatted}`;

        // Parse the date range into "From Date" and "To Date"
        const [fromPart, toPart] = dateRange.split(" ");

        // Convert yyyymm strings to Date objects
        const parseDatePart = (part: string) => {
          if (!part || part.length !== 6)
            return new Date(currentYear, currentMonth, 1);
          const year = parseInt(part.substring(0, 4));
          const month = parseInt(part.substring(4, 6)) - 1; // months are 0-indexed
          return new Date(year, month, 1);
        };

        const [localFromDate, setLocalFromDate] = useState<Date | null>(
          parseDatePart(fromPart)
        );
        const [localToDate, setLocalToDate] = useState<Date | null>(
          parseDatePart(toPart)
        );

        // Convert Date object to yyyymm format
        const formatToYyyymm = (date: Date | null) => {
          if (!date) return "";
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          return `${year}${month}`;
        };

        const handleDateChange = (
          type: "from" | "to",
          selectedDate: Date | null
        ) => {
          if (!selectedDate) return;

          if (type === "from") {
            setLocalFromDate(selectedDate);
          } else {
            setLocalToDate(selectedDate);
          }

          // Format the new date range
          const newFrom =
            type === "from"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localFromDate);
          const newTo =
            type === "to"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localToDate);
          const newDateRange = `${newFrom} ${newTo}`.trim();

          // Update the row data
          row.original.DTOVER12 = newDateRange;

          // Update table state
          const creatingRow = table.getState().creatingRow;
          const editingRow = table.getState().editingRow;

          if (creatingRow && creatingRow._valuesCache) {
            creatingRow._valuesCache.DTOVER12 = newDateRange;
            table.setEditingRow(editingRow);
          } else if (editingRow && editingRow._valuesCache) {
            editingRow._valuesCache.DTOVER12 = newDateRange;
            table.setEditingRow(editingRow);
          }

          // Update the selected value in the table state
          const updatedRows = table
            .getRowModel()
            .rows.map((r) =>
              r.id === cell.row.id
                ? { ...r.original, DTOVER12: newDateRange }
                : r.original
            );
          setData(updatedRows);
        };

        return (
          <div>
            <label style={{ marginBottom: "8px", fontSize: "14px" }}>
              DTOVER12
            </label>
            <Group noWrap>
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="From Date"
                value={localFromDate}
                onChange={(selectedDate) =>
                  handleDateChange("from", selectedDate)
                }
              />
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="To Date"
                value={localToDate}
                onChange={(selectedDate) =>
                  handleDateChange("to", selectedDate)
                }
              />
            </Group>
          </div>
        );
      },
    },
    {
      accessorKey: "DTOVER13",
      header: "DTOVER13",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      Cell: ({ cell }) => {
        const dateRange = cell.getValue<string>(); // Get the date range (e.g., "202002 202003")
        if (!dateRange) return ""; // Handle empty values

        // Split the date range into from and to parts
        const [fromPart, toPart] = dateRange.split(" ");

        // Format as YYYYMM YYYYMM
        const formatDatePart = (part: string) => {
          if (part?.length !== 6) return part;
          return `${part.substring(0, 4)}${part.substring(4, 6)}`;
        };

        return `${formatDatePart(fromPart)} ${formatDatePart(toPart)}`;
      },

      // Custom edit component for "From Date" and "To Date"
      Edit: ({ row, table, cell }) => {
        // Get the current date
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-indexed

        // Format current month as yyyymm
        const currentMonthFormatted = `${currentYear}${String(
          currentMonth + 1
        ).padStart(2, "0")}`;

        // Get the existing date range or use current month for both if empty
        const dateRange =
          row.original.DTOVER13 ||
          `${currentMonthFormatted} ${currentMonthFormatted}`;

        // Parse the date range into "From Date" and "To Date"
        const [fromPart, toPart] = dateRange.split(" ");

        // Convert yyyymm strings to Date objects
        const parseDatePart = (part: string) => {
          if (!part || part.length !== 6)
            return new Date(currentYear, currentMonth, 1);
          const year = parseInt(part.substring(0, 4));
          const month = parseInt(part.substring(4, 6)) - 1; // months are 0-indexed
          return new Date(year, month, 1);
        };

        const [localFromDate, setLocalFromDate] = useState<Date | null>(
          parseDatePart(fromPart)
        );
        const [localToDate, setLocalToDate] = useState<Date | null>(
          parseDatePart(toPart)
        );

        // Convert Date object to yyyymm format
        const formatToYyyymm = (date: Date | null) => {
          if (!date) return "";
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          return `${year}${month}`;
        };

        const handleDateChange = (
          type: "from" | "to",
          selectedDate: Date | null
        ) => {
          if (!selectedDate) return;

          if (type === "from") {
            setLocalFromDate(selectedDate);
          } else {
            setLocalToDate(selectedDate);
          }

          // Format the new date range
          const newFrom =
            type === "from"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localFromDate);
          const newTo =
            type === "to"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localToDate);
          const newDateRange = `${newFrom} ${newTo}`.trim();

          // Update the row data
          row.original.DTOVER13 = newDateRange;

          // Update table state
          const creatingRow = table.getState().creatingRow;
          const editingRow = table.getState().editingRow;

          if (creatingRow && creatingRow._valuesCache) {
            creatingRow._valuesCache.DTOVER13 = newDateRange;
            table.setEditingRow(editingRow);
          } else if (editingRow && editingRow._valuesCache) {
            editingRow._valuesCache.DTOVER13 = newDateRange;
            table.setEditingRow(editingRow);
          }

          // Update the selected value in the table state
          const updatedRows = table
            .getRowModel()
            .rows.map((r) =>
              r.id === cell.row.id
                ? { ...r.original, DTOVER13: newDateRange }
                : r.original
            );
          setData(updatedRows);
        };

        return (
          <div>
            <label style={{ marginBottom: "8px", fontSize: "14px" }}>
              DTOVER13
            </label>
            <Group noWrap>
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="From Date"
                value={localFromDate}
                onChange={(selectedDate) =>
                  handleDateChange("from", selectedDate)
                }
              />
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="To Date"
                value={localToDate}
                onChange={(selectedDate) =>
                  handleDateChange("to", selectedDate)
                }
              />
            </Group>
          </div>
        );
      },
    },
    {
      accessorKey: "DTOVER14",
      header: "DTOVER14",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      Cell: ({ cell }) => {
        const dateRange = cell.getValue<string>(); // Get the date range (e.g., "202002 202003")
        if (!dateRange) return ""; // Handle empty values

        // Split the date range into from and to parts
        const [fromPart, toPart] = dateRange.split(" ");

        // Format as YYYYMM YYYYMM
        const formatDatePart = (part: string) => {
          if (part?.length !== 6) return part;
          return `${part.substring(0, 4)}${part.substring(4, 6)}`;
        };

        return `${formatDatePart(fromPart)} ${formatDatePart(toPart)}`;
      },

      // Custom edit component for "From Date" and "To Date"
      Edit: ({ row, table, cell }) => {
        // Get the current date
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-indexed

        // Format current month as yyyymm
        const currentMonthFormatted = `${currentYear}${String(
          currentMonth + 1
        ).padStart(2, "0")}`;

        // Get the existing date range or use current month for both if empty
        const dateRange =
          row.original.DTOVER14 ||
          `${currentMonthFormatted} ${currentMonthFormatted}`;

        // Parse the date range into "From Date" and "To Date"
        const [fromPart, toPart] = dateRange.split(" ");

        // Convert yyyymm strings to Date objects
        const parseDatePart = (part: string) => {
          if (!part || part.length !== 6)
            return new Date(currentYear, currentMonth, 1);
          const year = parseInt(part.substring(0, 4));
          const month = parseInt(part.substring(4, 6)) - 1; // months are 0-indexed
          return new Date(year, month, 1);
        };

        const [localFromDate, setLocalFromDate] = useState<Date | null>(
          parseDatePart(fromPart)
        );
        const [localToDate, setLocalToDate] = useState<Date | null>(
          parseDatePart(toPart)
        );

        // Convert Date object to yyyymm format
        const formatToYyyymm = (date: Date | null) => {
          if (!date) return "";
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          return `${year}${month}`;
        };

        const handleDateChange = (
          type: "from" | "to",
          selectedDate: Date | null
        ) => {
          if (!selectedDate) return;

          if (type === "from") {
            setLocalFromDate(selectedDate);
          } else {
            setLocalToDate(selectedDate);
          }

          // Format the new date range
          const newFrom =
            type === "from"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localFromDate);
          const newTo =
            type === "to"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localToDate);
          const newDateRange = `${newFrom} ${newTo}`.trim();

          // Update the row data
          row.original.DTOVER14 = newDateRange;

          // Update table state
          const creatingRow = table.getState().creatingRow;
          const editingRow = table.getState().editingRow;

          if (creatingRow && creatingRow._valuesCache) {
            creatingRow._valuesCache.DTOVER14 = newDateRange;
            table.setEditingRow(editingRow);
          } else if (editingRow && editingRow._valuesCache) {
            editingRow._valuesCache.DTOVER14 = newDateRange;
            table.setEditingRow(editingRow);
          }

          // Update the selected value in the table state
          const updatedRows = table
            .getRowModel()
            .rows.map((r) =>
              r.id === cell.row.id
                ? { ...r.original, DTOVER14: newDateRange }
                : r.original
            );
          setData(updatedRows);
        };

        return (
          <div>
            <label style={{ marginBottom: "8px", fontSize: "14px" }}>
              DTOVER14
            </label>
            <Group noWrap>
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="From Date"
                value={localFromDate}
                onChange={(selectedDate) =>
                  handleDateChange("from", selectedDate)
                }
              />
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="To Date"
                value={localToDate}
                onChange={(selectedDate) =>
                  handleDateChange("to", selectedDate)
                }
              />
            </Group>
          </div>
        );
      },
    },
    {
      accessorKey: "DTOVER15",
      header: "DTOVER15",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      Cell: ({ cell }) => {
        const dateRange = cell.getValue<string>(); // Get the date range (e.g., "202002 202003")
        if (!dateRange) return ""; // Handle empty values

        // Split the date range into from and to parts
        const [fromPart, toPart] = dateRange.split(" ");

        // Format as YYYYMM YYYYMM
        const formatDatePart = (part: string) => {
          if (part?.length !== 6) return part;
          return `${part.substring(0, 4)}${part.substring(4, 6)}`;
        };

        return `${formatDatePart(fromPart)} ${formatDatePart(toPart)}`;
      },

      // Custom edit component for "From Date" and "To Date"
      Edit: ({ row, table, cell }) => {
        // Get the current date
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-indexed

        // Format current month as yyyymm
        const currentMonthFormatted = `${currentYear}${String(
          currentMonth + 1
        ).padStart(2, "0")}`;

        // Get the existing date range or use current month for both if empty
        const dateRange =
          row.original.DTOVER15 ||
          `${currentMonthFormatted} ${currentMonthFormatted}`;

        // Parse the date range into "From Date" and "To Date"
        const [fromPart, toPart] = dateRange.split(" ");

        // Convert yyyymm strings to Date objects
        const parseDatePart = (part: string) => {
          if (!part || part.length !== 6)
            return new Date(currentYear, currentMonth, 1);
          const year = parseInt(part.substring(0, 4));
          const month = parseInt(part.substring(4, 6)) - 1; // months are 0-indexed
          return new Date(year, month, 1);
        };

        const [localFromDate, setLocalFromDate] = useState<Date | null>(
          parseDatePart(fromPart)
        );
        const [localToDate, setLocalToDate] = useState<Date | null>(
          parseDatePart(toPart)
        );

        // Convert Date object to yyyymm format
        const formatToYyyymm = (date: Date | null) => {
          if (!date) return "";
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          return `${year}${month}`;
        };

        const handleDateChange = (
          type: "from" | "to",
          selectedDate: Date | null
        ) => {
          if (!selectedDate) return;

          if (type === "from") {
            setLocalFromDate(selectedDate);
          } else {
            setLocalToDate(selectedDate);
          }

          // Format the new date range
          const newFrom =
            type === "from"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localFromDate);
          const newTo =
            type === "to"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localToDate);
          const newDateRange = `${newFrom} ${newTo}`.trim();

          // Update the row data
          row.original.DTOVER15 = newDateRange;

          // Update table state
          const creatingRow = table.getState().creatingRow;
          const editingRow = table.getState().editingRow;

          if (creatingRow && creatingRow._valuesCache) {
            creatingRow._valuesCache.DTOVER15 = newDateRange;
            table.setEditingRow(editingRow);
          } else if (editingRow && editingRow._valuesCache) {
            editingRow._valuesCache.DTOVER15 = newDateRange;
            table.setEditingRow(editingRow);
          }

          // Update the selected value in the table state
          const updatedRows = table
            .getRowModel()
            .rows.map((r) =>
              r.id === cell.row.id
                ? { ...r.original, DTOVER15: newDateRange }
                : r.original
            );
          setData(updatedRows);
        };

        return (
          <div>
            <label style={{ marginBottom: "8px", fontSize: "14px" }}>
              DTOVER15
            </label>
            <Group noWrap>
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="From Date"
                value={localFromDate}
                onChange={(selectedDate) =>
                  handleDateChange("from", selectedDate)
                }
              />
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="To Date"
                value={localToDate}
                onChange={(selectedDate) =>
                  handleDateChange("to", selectedDate)
                }
              />
            </Group>
          </div>
        );
      },
    },
    {
      accessorKey: "DTOVER16",
      header: "DTOVER16",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      Cell: ({ cell }) => {
        const dateRange = cell.getValue<string>(); // Get the date range (e.g., "202002 202003")
        if (!dateRange) return ""; // Handle empty values

        // Split the date range into from and to parts
        const [fromPart, toPart] = dateRange.split(" ");

        // Format as YYYYMM YYYYMM
        const formatDatePart = (part: string) => {
          if (part?.length !== 6) return part;
          return `${part.substring(0, 4)}${part.substring(4, 6)}`;
        };

        return `${formatDatePart(fromPart)} ${formatDatePart(toPart)}`;
      },

      // Custom edit component for "From Date" and "To Date"
      Edit: ({ row, table, cell }) => {
        // Get the current date
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-indexed

        // Format current month as yyyymm
        const currentMonthFormatted = `${currentYear}${String(
          currentMonth + 1
        ).padStart(2, "0")}`;

        // Get the existing date range or use current month for both if empty
        const dateRange =
          row.original.DTOVER16 ||
          `${currentMonthFormatted} ${currentMonthFormatted}`;

        // Parse the date range into "From Date" and "To Date"
        const [fromPart, toPart] = dateRange.split(" ");

        // Convert yyyymm strings to Date objects
        const parseDatePart = (part: string) => {
          if (!part || part.length !== 6)
            return new Date(currentYear, currentMonth, 1);
          const year = parseInt(part.substring(0, 4));
          const month = parseInt(part.substring(4, 6)) - 1; // months are 0-indexed
          return new Date(year, month, 1);
        };

        const [localFromDate, setLocalFromDate] = useState<Date | null>(
          parseDatePart(fromPart)
        );
        const [localToDate, setLocalToDate] = useState<Date | null>(
          parseDatePart(toPart)
        );

        // Convert Date object to yyyymm format
        const formatToYyyymm = (date: Date | null) => {
          if (!date) return "";
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          return `${year}${month}`;
        };

        const handleDateChange = (
          type: "from" | "to",
          selectedDate: Date | null
        ) => {
          if (!selectedDate) return;

          if (type === "from") {
            setLocalFromDate(selectedDate);
          } else {
            setLocalToDate(selectedDate);
          }

          // Format the new date range
          const newFrom =
            type === "from"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localFromDate);
          const newTo =
            type === "to"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localToDate);
          const newDateRange = `${newFrom} ${newTo}`.trim();

          // Update the row data
          row.original.DTOVER16 = newDateRange;

          // Update table state
          const creatingRow = table.getState().creatingRow;
          const editingRow = table.getState().editingRow;

          if (creatingRow && creatingRow._valuesCache) {
            creatingRow._valuesCache.DTOVER16 = newDateRange;
            table.setEditingRow(editingRow);
          } else if (editingRow && editingRow._valuesCache) {
            editingRow._valuesCache.DTOVER16 = newDateRange;
            table.setEditingRow(editingRow);
          }

          // Update the selected value in the table state
          const updatedRows = table
            .getRowModel()
            .rows.map((r) =>
              r.id === cell.row.id
                ? { ...r.original, DTOVER16: newDateRange }
                : r.original
            );
          setData(updatedRows);
        };

        return (
          <div>
            <label style={{ marginBottom: "8px", fontSize: "14px" }}>
              DTOVER16
            </label>
            <Group noWrap>
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="From Date"
                value={localFromDate}
                onChange={(selectedDate) =>
                  handleDateChange("from", selectedDate)
                }
              />
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="To Date"
                value={localToDate}
                onChange={(selectedDate) =>
                  handleDateChange("to", selectedDate)
                }
              />
            </Group>
          </div>
        );
      },
    },
    {
      accessorKey: "DTOVER17",
      header: "DTOVER17",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      Cell: ({ cell }) => {
        const dateRange = cell.getValue<string>(); // Get the date range (e.g., "202002 202003")
        if (!dateRange) return ""; // Handle empty values

        // Split the date range into from and to parts
        const [fromPart, toPart] = dateRange.split(" ");

        // Format as YYYYMM YYYYMM
        const formatDatePart = (part: string) => {
          if (part?.length !== 6) return part;
          return `${part.substring(0, 4)}${part.substring(4, 6)}`;
        };

        return `${formatDatePart(fromPart)} ${formatDatePart(toPart)}`;
      },

      // Custom edit component for "From Date" and "To Date"
      Edit: ({ row, table, cell }) => {
        // Get the current date
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-indexed

        // Format current month as yyyymm
        const currentMonthFormatted = `${currentYear}${String(
          currentMonth + 1
        ).padStart(2, "0")}`;

        // Get the existing date range or use current month for both if empty
        const dateRange =
          row.original.DTOVER17 ||
          `${currentMonthFormatted} ${currentMonthFormatted}`;

        // Parse the date range into "From Date" and "To Date"
        const [fromPart, toPart] = dateRange.split(" ");

        // Convert yyyymm strings to Date objects
        const parseDatePart = (part: string) => {
          if (!part || part.length !== 6)
            return new Date(currentYear, currentMonth, 1);
          const year = parseInt(part.substring(0, 4));
          const month = parseInt(part.substring(4, 6)) - 1; // months are 0-indexed
          return new Date(year, month, 1);
        };

        const [localFromDate, setLocalFromDate] = useState<Date | null>(
          parseDatePart(fromPart)
        );
        const [localToDate, setLocalToDate] = useState<Date | null>(
          parseDatePart(toPart)
        );

        // Convert Date object to yyyymm format
        const formatToYyyymm = (date: Date | null) => {
          if (!date) return "";
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          return `${year}${month}`;
        };

        const handleDateChange = (
          type: "from" | "to",
          selectedDate: Date | null
        ) => {
          if (!selectedDate) return;

          if (type === "from") {
            setLocalFromDate(selectedDate);
          } else {
            setLocalToDate(selectedDate);
          }

          // Format the new date range
          const newFrom =
            type === "from"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localFromDate);
          const newTo =
            type === "to"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localToDate);
          const newDateRange = `${newFrom} ${newTo}`.trim();

          // Update the row data
          row.original.DTOVER17 = newDateRange;

          // Update table state
          const creatingRow = table.getState().creatingRow;
          const editingRow = table.getState().editingRow;

          if (creatingRow && creatingRow._valuesCache) {
            creatingRow._valuesCache.DTOVER17 = newDateRange;
            table.setEditingRow(editingRow);
          } else if (editingRow && editingRow._valuesCache) {
            editingRow._valuesCache.DTOVER17 = newDateRange;
            table.setEditingRow(editingRow);
          }

          // Update the selected value in the table state
          const updatedRows = table
            .getRowModel()
            .rows.map((r) =>
              r.id === cell.row.id
                ? { ...r.original, DTOVER17: newDateRange }
                : r.original
            );
          setData(updatedRows);
        };

        return (
          <div>
            <label style={{ marginBottom: "8px", fontSize: "14px" }}>
              DTOVER17
            </label>
            <Group noWrap>
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="From Date"
                value={localFromDate}
                onChange={(selectedDate) =>
                  handleDateChange("from", selectedDate)
                }
              />
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="To Date"
                value={localToDate}
                onChange={(selectedDate) =>
                  handleDateChange("to", selectedDate)
                }
              />
            </Group>
          </div>
        );
      },
    },
    {
      accessorKey: "DTOVER18",
      header: "DTOVER18",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      Cell: ({ cell }) => {
        const dateRange = cell.getValue<string>(); // Get the date range (e.g., "202002 202003")
        if (!dateRange) return ""; // Handle empty values

        // Split the date range into from and to parts
        const [fromPart, toPart] = dateRange.split(" ");

        // Format as YYYYMM YYYYMM
        const formatDatePart = (part: string) => {
          if (part?.length !== 6) return part;
          return `${part.substring(0, 4)}${part.substring(4, 6)}`;
        };

        return `${formatDatePart(fromPart)} ${formatDatePart(toPart)}`;
      },

      // Custom edit component for "From Date" and "To Date"
      Edit: ({ row, table, cell }) => {
        // Get the current date
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-indexed

        // Format current month as yyyymm
        const currentMonthFormatted = `${currentYear}${String(
          currentMonth + 1
        ).padStart(2, "0")}`;

        // Get the existing date range or use current month for both if empty
        const dateRange =
          row.original.DTOVER18 ||
          `${currentMonthFormatted} ${currentMonthFormatted}`;

        // Parse the date range into "From Date" and "To Date"
        const [fromPart, toPart] = dateRange.split(" ");

        // Convert yyyymm strings to Date objects
        const parseDatePart = (part: string) => {
          if (!part || part.length !== 6)
            return new Date(currentYear, currentMonth, 1);
          const year = parseInt(part.substring(0, 4));
          const month = parseInt(part.substring(4, 6)) - 1; // months are 0-indexed
          return new Date(year, month, 1);
        };

        const [localFromDate, setLocalFromDate] = useState<Date | null>(
          parseDatePart(fromPart)
        );
        const [localToDate, setLocalToDate] = useState<Date | null>(
          parseDatePart(toPart)
        );

        // Convert Date object to yyyymm format
        const formatToYyyymm = (date: Date | null) => {
          if (!date) return "";
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          return `${year}${month}`;
        };

        const handleDateChange = (
          type: "from" | "to",
          selectedDate: Date | null
        ) => {
          if (!selectedDate) return;

          if (type === "from") {
            setLocalFromDate(selectedDate);
          } else {
            setLocalToDate(selectedDate);
          }

          // Format the new date range
          const newFrom =
            type === "from"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localFromDate);
          const newTo =
            type === "to"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localToDate);
          const newDateRange = `${newFrom} ${newTo}`.trim();

          // Update the row data
          row.original.DTOVER18 = newDateRange;

          // Update table state
          const creatingRow = table.getState().creatingRow;
          const editingRow = table.getState().editingRow;

          if (creatingRow && creatingRow._valuesCache) {
            creatingRow._valuesCache.DTOVER18 = newDateRange;
            table.setEditingRow(editingRow);
          } else if (editingRow && editingRow._valuesCache) {
            editingRow._valuesCache.DTOVER18 = newDateRange;
            table.setEditingRow(editingRow);
          }

          // Update the selected value in the table state
          const updatedRows = table
            .getRowModel()
            .rows.map((r) =>
              r.id === cell.row.id
                ? { ...r.original, DTOVER18: newDateRange }
                : r.original
            );
          setData(updatedRows);
        };

        return (
          <div>
            <label style={{ marginBottom: "8px", fontSize: "14px" }}>
              DTOVER18
            </label>
            <Group noWrap>
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="From Date"
                value={localFromDate}
                onChange={(selectedDate) =>
                  handleDateChange("from", selectedDate)
                }
              />
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="To Date"
                value={localToDate}
                onChange={(selectedDate) =>
                  handleDateChange("to", selectedDate)
                }
              />
            </Group>
          </div>
        );
      },
    },
    {
      accessorKey: "DTOVER19",
      header: "DTOVER19",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      Cell: ({ cell }) => {
        const dateRange = cell.getValue<string>(); // Get the date range (e.g., "202002 202003")
        if (!dateRange) return ""; // Handle empty values

        // Split the date range into from and to parts
        const [fromPart, toPart] = dateRange.split(" ");

        // Format as YYYYMM YYYYMM
        const formatDatePart = (part: string) => {
          if (part?.length !== 6) return part;
          return `${part.substring(0, 4)}${part.substring(4, 6)}`;
        };

        return `${formatDatePart(fromPart)} ${formatDatePart(toPart)}`;
      },

      // Custom edit component for "From Date" and "To Date"
      Edit: ({ row, table, cell }) => {
        // Get the current date
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-indexed

        // Format current month as yyyymm
        const currentMonthFormatted = `${currentYear}${String(
          currentMonth + 1
        ).padStart(2, "0")}`;

        // Get the existing date range or use current month for both if empty
        const dateRange =
          row.original.DTOVER19 ||
          `${currentMonthFormatted} ${currentMonthFormatted}`;

        // Parse the date range into "From Date" and "To Date"
        const [fromPart, toPart] = dateRange.split(" ");

        // Convert yyyymm strings to Date objects
        const parseDatePart = (part: string) => {
          if (!part || part.length !== 6)
            return new Date(currentYear, currentMonth, 1);
          const year = parseInt(part.substring(0, 4));
          const month = parseInt(part.substring(4, 6)) - 1; // months are 0-indexed
          return new Date(year, month, 1);
        };

        const [localFromDate, setLocalFromDate] = useState<Date | null>(
          parseDatePart(fromPart)
        );
        const [localToDate, setLocalToDate] = useState<Date | null>(
          parseDatePart(toPart)
        );

        // Convert Date object to yyyymm format
        const formatToYyyymm = (date: Date | null) => {
          if (!date) return "";
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          return `${year}${month}`;
        };

        const handleDateChange = (
          type: "from" | "to",
          selectedDate: Date | null
        ) => {
          if (!selectedDate) return;

          if (type === "from") {
            setLocalFromDate(selectedDate);
          } else {
            setLocalToDate(selectedDate);
          }

          // Format the new date range
          const newFrom =
            type === "from"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localFromDate);
          const newTo =
            type === "to"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localToDate);
          const newDateRange = `${newFrom} ${newTo}`.trim();

          // Update the row data
          row.original.DTOVER19 = newDateRange;

          // Update table state
          const creatingRow = table.getState().creatingRow;
          const editingRow = table.getState().editingRow;

          if (creatingRow && creatingRow._valuesCache) {
            creatingRow._valuesCache.DTOVER19 = newDateRange;
            table.setEditingRow(editingRow);
          } else if (editingRow && editingRow._valuesCache) {
            editingRow._valuesCache.DTOVER19 = newDateRange;
            table.setEditingRow(editingRow);
          }

          // Update the selected value in the table state
          const updatedRows = table
            .getRowModel()
            .rows.map((r) =>
              r.id === cell.row.id
                ? { ...r.original, DTOVER19: newDateRange }
                : r.original
            );
          setData(updatedRows);
        };

        return (
          <div>
            <label style={{ marginBottom: "8px", fontSize: "14px" }}>
              DTOVER19
            </label>
            <Group noWrap>
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="From Date"
                value={localFromDate}
                onChange={(selectedDate) =>
                  handleDateChange("from", selectedDate)
                }
              />
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="To Date"
                value={localToDate}
                onChange={(selectedDate) =>
                  handleDateChange("to", selectedDate)
                }
              />
            </Group>
          </div>
        );
      },
    },
    {
      accessorKey: "DTOVER20",
      header: "DTOVER20",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      Cell: ({ cell }) => {
        const dateRange = cell.getValue<string>(); // Get the date range (e.g., "202002 202003")
        if (!dateRange) return ""; // Handle empty values

        // Split the date range into from and to parts
        const [fromPart, toPart] = dateRange.split(" ");

        // Format as YYYYMM YYYYMM
        const formatDatePart = (part: string) => {
          if (part?.length !== 6) return part;
          return `${part.substring(0, 4)}${part.substring(4, 6)}`;
        };

        return `${formatDatePart(fromPart)} ${formatDatePart(toPart)}`;
      },

      // Custom edit component for "From Date" and "To Date"
      Edit: ({ row, table, cell }) => {
        // Get the current date
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-indexed

        // Format current month as yyyymm
        const currentMonthFormatted = `${currentYear}${String(
          currentMonth + 1
        ).padStart(2, "0")}`;

        // Get the existing date range or use current month for both if empty
        const dateRange =
          row.original.DTOVER20 ||
          `${currentMonthFormatted} ${currentMonthFormatted}`;

        // Parse the date range into "From Date" and "To Date"
        const [fromPart, toPart] = dateRange.split(" ");

        // Convert yyyymm strings to Date objects
        const parseDatePart = (part: string) => {
          if (!part || part.length !== 6)
            return new Date(currentYear, currentMonth, 1);
          const year = parseInt(part.substring(0, 4));
          const month = parseInt(part.substring(4, 6)) - 1; // months are 0-indexed
          return new Date(year, month, 1);
        };

        const [localFromDate, setLocalFromDate] = useState<Date | null>(
          parseDatePart(fromPart)
        );
        const [localToDate, setLocalToDate] = useState<Date | null>(
          parseDatePart(toPart)
        );

        // Convert Date object to yyyymm format
        const formatToYyyymm = (date: Date | null) => {
          if (!date) return "";
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          return `${year}${month}`;
        };

        const handleDateChange = (
          type: "from" | "to",
          selectedDate: Date | null
        ) => {
          if (!selectedDate) return;

          if (type === "from") {
            setLocalFromDate(selectedDate);
          } else {
            setLocalToDate(selectedDate);
          }

          // Format the new date range
          const newFrom =
            type === "from"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localFromDate);
          const newTo =
            type === "to"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localToDate);
          const newDateRange = `${newFrom} ${newTo}`.trim();

          // Update the row data
          row.original.DTOVER20 = newDateRange;

          // Update table state
          const creatingRow = table.getState().creatingRow;
          const editingRow = table.getState().editingRow;

          if (creatingRow && creatingRow._valuesCache) {
            creatingRow._valuesCache.DTOVER20 = newDateRange;
            table.setEditingRow(editingRow);
          } else if (editingRow && editingRow._valuesCache) {
            editingRow._valuesCache.DTOVER20 = newDateRange;
            table.setEditingRow(editingRow);
          }

          // Update the selected value in the table state
          const updatedRows = table
            .getRowModel()
            .rows.map((r) =>
              r.id === cell.row.id
                ? { ...r.original, DTOVER20: newDateRange }
                : r.original
            );
          setData(updatedRows);
        };

        return (
          <div>
            <label style={{ marginBottom: "8px", fontSize: "14px" }}>
              DTOVER20
            </label>
            <Group noWrap>
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="From Date"
                value={localFromDate}
                onChange={(selectedDate) =>
                  handleDateChange("from", selectedDate)
                }
              />
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="To Date"
                value={localToDate}
                onChange={(selectedDate) =>
                  handleDateChange("to", selectedDate)
                }
              />
            </Group>
          </div>
        );
      },
    },
    {
      accessorKey: "DTOVER21",
      header: "DTOVER21",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      Cell: ({ cell }) => {
        const dateRange = cell.getValue<string>(); // Get the date range (e.g., "202002 202003")
        if (!dateRange) return ""; // Handle empty values

        // Split the date range into from and to parts
        const [fromPart, toPart] = dateRange.split(" ");

        // Format as YYYYMM YYYYMM
        const formatDatePart = (part: string) => {
          if (part?.length !== 6) return part;
          return `${part.substring(0, 4)}${part.substring(4, 6)}`;
        };

        return `${formatDatePart(fromPart)} ${formatDatePart(toPart)}`;
      },

      // Custom edit component for "From Date" and "To Date"
      Edit: ({ row, table, cell }) => {
        // Get the current date
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-indexed

        // Format current month as yyyymm
        const currentMonthFormatted = `${currentYear}${String(
          currentMonth + 1
        ).padStart(2, "0")}`;

        // Get the existing date range or use current month for both if empty
        const dateRange =
          row.original.DTOVER21 ||
          `${currentMonthFormatted} ${currentMonthFormatted}`;

        // Parse the date range into "From Date" and "To Date"
        const [fromPart, toPart] = dateRange.split(" ");

        // Convert yyyymm strings to Date objects
        const parseDatePart = (part: string) => {
          if (!part || part.length !== 6)
            return new Date(currentYear, currentMonth, 1);
          const year = parseInt(part.substring(0, 4));
          const month = parseInt(part.substring(4, 6)) - 1; // months are 0-indexed
          return new Date(year, month, 1);
        };

        const [localFromDate, setLocalFromDate] = useState<Date | null>(
          parseDatePart(fromPart)
        );
        const [localToDate, setLocalToDate] = useState<Date | null>(
          parseDatePart(toPart)
        );

        // Convert Date object to yyyymm format
        const formatToYyyymm = (date: Date | null) => {
          if (!date) return "";
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          return `${year}${month}`;
        };

        const handleDateChange = (
          type: "from" | "to",
          selectedDate: Date | null
        ) => {
          if (!selectedDate) return;

          if (type === "from") {
            setLocalFromDate(selectedDate);
          } else {
            setLocalToDate(selectedDate);
          }

          // Format the new date range
          const newFrom =
            type === "from"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localFromDate);
          const newTo =
            type === "to"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localToDate);
          const newDateRange = `${newFrom} ${newTo}`.trim();

          // Update the row data
          row.original.DTOVER21 = newDateRange;

          // Update table state
          const creatingRow = table.getState().creatingRow;
          const editingRow = table.getState().editingRow;

          if (creatingRow && creatingRow._valuesCache) {
            creatingRow._valuesCache.DTOVER21 = newDateRange;
            table.setEditingRow(editingRow);
          } else if (editingRow && editingRow._valuesCache) {
            editingRow._valuesCache.DTOVER21 = newDateRange;
            table.setEditingRow(editingRow);
          }

          // Update the selected value in the table state
          const updatedRows = table
            .getRowModel()
            .rows.map((r) =>
              r.id === cell.row.id
                ? { ...r.original, DTOVER21: newDateRange }
                : r.original
            );
          setData(updatedRows);
        };

        return (
          <div>
            <label style={{ marginBottom: "8px", fontSize: "14px" }}>
              DTOVER21
            </label>
            <Group noWrap>
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="From Date"
                value={localFromDate}
                onChange={(selectedDate) =>
                  handleDateChange("from", selectedDate)
                }
              />
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="To Date"
                value={localToDate}
                onChange={(selectedDate) =>
                  handleDateChange("to", selectedDate)
                }
              />
            </Group>
          </div>
        );
      },
    },
    {
      accessorKey: "DTOVER22",
      header: "DTOVER22",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      Cell: ({ cell }) => {
        const dateRange = cell.getValue<string>(); // Get the date range (e.g., "202002 202003")
        if (!dateRange) return ""; // Handle empty values

        // Split the date range into from and to parts
        const [fromPart, toPart] = dateRange.split(" ");

        // Format as YYYYMM YYYYMM
        const formatDatePart = (part: string) => {
          if (part?.length !== 6) return part;
          return `${part.substring(0, 4)}${part.substring(4, 6)}`;
        };

        return `${formatDatePart(fromPart)} ${formatDatePart(toPart)}`;
      },

      // Custom edit component for "From Date" and "To Date"
      Edit: ({ row, table, cell }) => {
        // Get the current date
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-indexed

        // Format current month as yyyymm
        const currentMonthFormatted = `${currentYear}${String(
          currentMonth + 1
        ).padStart(2, "0")}`;

        // Get the existing date range or use current month for both if empty
        const dateRange =
          row.original.DTOVER22 ||
          `${currentMonthFormatted} ${currentMonthFormatted}`;

        // Parse the date range into "From Date" and "To Date"
        const [fromPart, toPart] = dateRange.split(" ");

        // Convert yyyymm strings to Date objects
        const parseDatePart = (part: string) => {
          if (!part || part.length !== 6)
            return new Date(currentYear, currentMonth, 1);
          const year = parseInt(part.substring(0, 4));
          const month = parseInt(part.substring(4, 6)) - 1; // months are 0-indexed
          return new Date(year, month, 1);
        };

        const [localFromDate, setLocalFromDate] = useState<Date | null>(
          parseDatePart(fromPart)
        );
        const [localToDate, setLocalToDate] = useState<Date | null>(
          parseDatePart(toPart)
        );

        // Convert Date object to yyyymm format
        const formatToYyyymm = (date: Date | null) => {
          if (!date) return "";
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          return `${year}${month}`;
        };

        const handleDateChange = (
          type: "from" | "to",
          selectedDate: Date | null
        ) => {
          if (!selectedDate) return;

          if (type === "from") {
            setLocalFromDate(selectedDate);
          } else {
            setLocalToDate(selectedDate);
          }

          // Format the new date range
          const newFrom =
            type === "from"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localFromDate);
          const newTo =
            type === "to"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localToDate);
          const newDateRange = `${newFrom} ${newTo}`.trim();

          // Update the row data
          row.original.DTOVER22 = newDateRange;

          // Update table state
          const creatingRow = table.getState().creatingRow;
          const editingRow = table.getState().editingRow;

          if (creatingRow && creatingRow._valuesCache) {
            creatingRow._valuesCache.DTOVER22 = newDateRange;
            table.setEditingRow(editingRow);
          } else if (editingRow && editingRow._valuesCache) {
            editingRow._valuesCache.DTOVER22 = newDateRange;
            table.setEditingRow(editingRow);
          }

          // Update the selected value in the table state
          const updatedRows = table
            .getRowModel()
            .rows.map((r) =>
              r.id === cell.row.id
                ? { ...r.original, DTOVER22: newDateRange }
                : r.original
            );
          setData(updatedRows);
        };

        return (
          <div>
            <label style={{ marginBottom: "8px", fontSize: "14px" }}>
              DTOVER22
            </label>
            <Group noWrap>
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="From Date"
                value={localFromDate}
                onChange={(selectedDate) =>
                  handleDateChange("from", selectedDate)
                }
              />
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="To Date"
                value={localToDate}
                onChange={(selectedDate) =>
                  handleDateChange("to", selectedDate)
                }
              />
            </Group>
          </div>
        );
      },
    },
    {
      accessorKey: "DTOVER23",
      header: "DTOVER23",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      Cell: ({ cell }) => {
        const dateRange = cell.getValue<string>(); // Get the date range (e.g., "202002 202003")
        if (!dateRange) return ""; // Handle empty values

        // Split the date range into from and to parts
        const [fromPart, toPart] = dateRange.split(" ");

        // Format as YYYYMM YYYYMM
        const formatDatePart = (part: string) => {
          if (part?.length !== 6) return part;
          return `${part.substring(0, 4)}${part.substring(4, 6)}`;
        };

        return `${formatDatePart(fromPart)} ${formatDatePart(toPart)}`;
      },

      // Custom edit component for "From Date" and "To Date"
      Edit: ({ row, table, cell }) => {
        // Get the current date
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-indexed

        // Format current month as yyyymm
        const currentMonthFormatted = `${currentYear}${String(
          currentMonth + 1
        ).padStart(2, "0")}`;

        // Get the existing date range or use current month for both if empty
        const dateRange =
          row.original.DTOVER23 ||
          `${currentMonthFormatted} ${currentMonthFormatted}`;

        // Parse the date range into "From Date" and "To Date"
        const [fromPart, toPart] = dateRange.split(" ");

        // Convert yyyymm strings to Date objects
        const parseDatePart = (part: string) => {
          if (!part || part.length !== 6)
            return new Date(currentYear, currentMonth, 1);
          const year = parseInt(part.substring(0, 4));
          const month = parseInt(part.substring(4, 6)) - 1; // months are 0-indexed
          return new Date(year, month, 1);
        };

        const [localFromDate, setLocalFromDate] = useState<Date | null>(
          parseDatePart(fromPart)
        );
        const [localToDate, setLocalToDate] = useState<Date | null>(
          parseDatePart(toPart)
        );

        // Convert Date object to yyyymm format
        const formatToYyyymm = (date: Date | null) => {
          if (!date) return "";
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          return `${year}${month}`;
        };

        const handleDateChange = (
          type: "from" | "to",
          selectedDate: Date | null
        ) => {
          if (!selectedDate) return;

          if (type === "from") {
            setLocalFromDate(selectedDate);
          } else {
            setLocalToDate(selectedDate);
          }

          // Format the new date range
          const newFrom =
            type === "from"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localFromDate);
          const newTo =
            type === "to"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localToDate);
          const newDateRange = `${newFrom} ${newTo}`.trim();

          // Update the row data
          row.original.DTOVER23 = newDateRange;

          // Update table state
          const creatingRow = table.getState().creatingRow;
          const editingRow = table.getState().editingRow;

          if (creatingRow && creatingRow._valuesCache) {
            creatingRow._valuesCache.DTOVER23 = newDateRange;
            table.setEditingRow(editingRow);
          } else if (editingRow && editingRow._valuesCache) {
            editingRow._valuesCache.DTOVER23 = newDateRange;
            table.setEditingRow(editingRow);
          }

          // Update the selected value in the table state
          const updatedRows = table
            .getRowModel()
            .rows.map((r) =>
              r.id === cell.row.id
                ? { ...r.original, DTOVER23: newDateRange }
                : r.original
            );
          setData(updatedRows);
        };

        return (
          <div>
            <label style={{ marginBottom: "8px", fontSize: "14px" }}>
              DTOVER23
            </label>
            <Group noWrap>
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="From Date"
                value={localFromDate}
                onChange={(selectedDate) =>
                  handleDateChange("from", selectedDate)
                }
              />
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="To Date"
                value={localToDate}
                onChange={(selectedDate) =>
                  handleDateChange("to", selectedDate)
                }
              />
            </Group>
          </div>
        );
      },
    },
    {
      accessorKey: "DTOVER24",
      header: "DTOVER24",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      Cell: ({ cell }) => {
        const dateRange = cell.getValue<string>(); // Get the date range (e.g., "202002 202003")
        if (!dateRange) return ""; // Handle empty values

        // Split the date range into from and to parts
        const [fromPart, toPart] = dateRange.split(" ");

        // Format as YYYYMM YYYYMM
        const formatDatePart = (part: string) => {
          if (part?.length !== 6) return part;
          return `${part.substring(0, 4)}${part.substring(4, 6)}`;
        };

        return `${formatDatePart(fromPart)} ${formatDatePart(toPart)}`;
      },

      // Custom edit component for "From Date" and "To Date"
      Edit: ({ row, table, cell }) => {
        // Get the current date
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-indexed

        // Format current month as yyyymm
        const currentMonthFormatted = `${currentYear}${String(
          currentMonth + 1
        ).padStart(2, "0")}`;

        // Get the existing date range or use current month for both if empty
        const dateRange =
          row.original.DTOVER24 ||
          `${currentMonthFormatted} ${currentMonthFormatted}`;

        // Parse the date range into "From Date" and "To Date"
        const [fromPart, toPart] = dateRange.split(" ");

        // Convert yyyymm strings to Date objects
        const parseDatePart = (part: string) => {
          if (!part || part.length !== 6)
            return new Date(currentYear, currentMonth, 1);
          const year = parseInt(part.substring(0, 4));
          const month = parseInt(part.substring(4, 6)) - 1; // months are 0-indexed
          return new Date(year, month, 1);
        };

        const [localFromDate, setLocalFromDate] = useState<Date | null>(
          parseDatePart(fromPart)
        );
        const [localToDate, setLocalToDate] = useState<Date | null>(
          parseDatePart(toPart)
        );

        // Convert Date object to yyyymm format
        const formatToYyyymm = (date: Date | null) => {
          if (!date) return "";
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          return `${year}${month}`;
        };

        const handleDateChange = (
          type: "from" | "to",
          selectedDate: Date | null
        ) => {
          if (!selectedDate) return;

          if (type === "from") {
            setLocalFromDate(selectedDate);
          } else {
            setLocalToDate(selectedDate);
          }

          // Format the new date range
          const newFrom =
            type === "from"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localFromDate);
          const newTo =
            type === "to"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localToDate);
          const newDateRange = `${newFrom} ${newTo}`.trim();

          // Update the row data
          row.original.DTOVER24 = newDateRange;

          // Update table state
          const creatingRow = table.getState().creatingRow;
          const editingRow = table.getState().editingRow;

          if (creatingRow && creatingRow._valuesCache) {
            creatingRow._valuesCache.DTOVER24 = newDateRange;
            table.setEditingRow(editingRow);
          } else if (editingRow && editingRow._valuesCache) {
            editingRow._valuesCache.DTOVER24 = newDateRange;
            table.setEditingRow(editingRow);
          }

          // Update the selected value in the table state
          const updatedRows = table
            .getRowModel()
            .rows.map((r) =>
              r.id === cell.row.id
                ? { ...r.original, DTOVER24: newDateRange }
                : r.original
            );
          setData(updatedRows);
        };

        return (
          <div>
            <label style={{ marginBottom: "8px", fontSize: "14px" }}>
              DTOVER24
            </label>
            <Group noWrap>
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="From Date"
                value={localFromDate}
                onChange={(selectedDate) =>
                  handleDateChange("from", selectedDate)
                }
              />
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="To Date"
                value={localToDate}
                onChange={(selectedDate) =>
                  handleDateChange("to", selectedDate)
                }
              />
            </Group>
          </div>
        );
      },
    },
    {
      accessorKey: "DTOVER25",
      header: "DTOVER25",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      Cell: ({ cell }) => {
        const dateRange = cell.getValue<string>(); // Get the date range (e.g., "202002 202003")
        if (!dateRange) return ""; // Handle empty values

        // Split the date range into from and to parts
        const [fromPart, toPart] = dateRange.split(" ");

        // Format as YYYYMM YYYYMM
        const formatDatePart = (part: string) => {
          if (part?.length !== 6) return part;
          return `${part.substring(0, 4)}${part.substring(4, 6)}`;
        };

        return `${formatDatePart(fromPart)} ${formatDatePart(toPart)}`;
      },

      // Custom edit component for "From Date" and "To Date"
      Edit: ({ row, table, cell }) => {
        // Get the current date
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-indexed

        // Format current month as yyyymm
        const currentMonthFormatted = `${currentYear}${String(
          currentMonth + 1
        ).padStart(2, "0")}`;

        // Get the existing date range or use current month for both if empty
        const dateRange =
          row.original.DTOVER25 ||
          `${currentMonthFormatted} ${currentMonthFormatted}`;

        // Parse the date range into "From Date" and "To Date"
        const [fromPart, toPart] = dateRange.split(" ");

        // Convert yyyymm strings to Date objects
        const parseDatePart = (part: string) => {
          if (!part || part.length !== 6)
            return new Date(currentYear, currentMonth, 1);
          const year = parseInt(part.substring(0, 4));
          const month = parseInt(part.substring(4, 6)) - 1; // months are 0-indexed
          return new Date(year, month, 1);
        };

        const [localFromDate, setLocalFromDate] = useState<Date | null>(
          parseDatePart(fromPart)
        );
        const [localToDate, setLocalToDate] = useState<Date | null>(
          parseDatePart(toPart)
        );

        // Convert Date object to yyyymm format
        const formatToYyyymm = (date: Date | null) => {
          if (!date) return "";
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          return `${year}${month}`;
        };

        const handleDateChange = (
          type: "from" | "to",
          selectedDate: Date | null
        ) => {
          if (!selectedDate) return;

          if (type === "from") {
            setLocalFromDate(selectedDate);
          } else {
            setLocalToDate(selectedDate);
          }

          // Format the new date range
          const newFrom =
            type === "from"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localFromDate);
          const newTo =
            type === "to"
              ? formatToYyyymm(selectedDate)
              : formatToYyyymm(localToDate);
          const newDateRange = `${newFrom} ${newTo}`.trim();

          // Update the row data
          row.original.DTOVER25 = newDateRange;

          // Update table state
          const creatingRow = table.getState().creatingRow;
          const editingRow = table.getState().editingRow;

          if (creatingRow && creatingRow._valuesCache) {
            creatingRow._valuesCache.DTOVER25 = newDateRange;
            table.setEditingRow(editingRow);
          } else if (editingRow && editingRow._valuesCache) {
            editingRow._valuesCache.DTOVER25 = newDateRange;
            table.setEditingRow(editingRow);
          }

          // Update the selected value in the table state
          const updatedRows = table
            .getRowModel()
            .rows.map((r) =>
              r.id === cell.row.id
                ? { ...r.original, DTOVER25: newDateRange }
                : r.original
            );
          setData(updatedRows);
        };

        return (
          <div>
            <label style={{ marginBottom: "8px", fontSize: "14px" }}>
              DTOVER25
            </label>
            <Group noWrap>
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="From Date"
                value={localFromDate}
                onChange={(selectedDate) =>
                  handleDateChange("from", selectedDate)
                }
              />
              <DatePickerInput
                style={{ flex: 1 }}
                icon={<IconCalendar size={24} stroke={2.0} />}
                label="To Date"
                value={localToDate}
                onChange={(selectedDate) =>
                  handleDateChange("to", selectedDate)
                }
              />
            </Group>
          </div>
        );
      },
    },
    {
      accessorKey: "ENTRRSN01",
      header: "ENTRRSN01",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["ENTRRSN01"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, ENTRRSN01: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "EXITRSN01",
      header: "EXITRSN01",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["EXITRSN01"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, EXITRSN01: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "ENTRRSN02",
      header: "ENTRRSN02",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["ENTRRSN02"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, ENTRRSN02: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "EXITRSN02",
      header: "EXITRSN02",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["EXITRSN02"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, EXITRSN02: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "ENTRRSN03",
      header: "ENTRRSN03",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["ENTRRSN03"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, ENTRRSN03: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "EXITRSN03",
      header: "EXITRSN03",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["EXITRSN03"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, EXITRSN03: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "ENTRRSN04",
      header: "ENTRRSN04",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["ENTRRSN04"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, ENTRRSN04: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "EXITRSN04",
      header: "EXITRSN04",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["EXITRSN04"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, EXITRSN04: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "ENTRRSN05",
      header: "ENTRRSN05",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["ENTRRSN05"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, ENTRRSN05: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "EXITRSN05",
      header: "EXITRSN05",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["EXITRSN05"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, EXITRSN05: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "ENTRRSN06",
      header: "ENTRRSN06",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["ENTRRSN06"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, ENTRRSN06: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "EXITRSN06",
      header: "EXITRSN06",
      editVariant: "text",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["EXITRSN06"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, EXITRSN06: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "ENTRRSN07",
      header: "ENTRRSN07",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["ENTRRSN07"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, ENTRRSN07: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "EXITRSN07",
      header: "EXITRSN07",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["EXITRSN07"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, EXITRSN07: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "ENTRRSN08",
      header: "ENTRRSN08",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["ENTRRSN08"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, ENTRRSN08: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "EXITRSN08",
      header: "EXITRSN08",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["EXITRSN08"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, EXITRSN08: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "ENTRRSN09",
      header: "ENTRRSN09",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["ENTRRSN09"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, ENTRRSN09: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "EXITRSN09",
      header: "EXITRSN09",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["EXITRSN09"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, EXITRSN09: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "ENTRRSN10",
      header: "ENTRRSN10",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["ENTRRSN10"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, ENTRRSN10: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "EXITRSN10",
      header: "EXITRSN10",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["EXITRSN10"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, EXITRSN10: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "ENTRRSN11",
      header: "ENTRRSN11",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["ENTRRSN11"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, ENTRRSN11: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "EXITRSN11",
      header: "EXITRSN11",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["EXITRSN11"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, EXITRSN11: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "ENTRRSN12",
      header: "ENTRRSN12",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["ENTRRSN12"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, ENTRRSN12: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "EXITRSN12",
      header: "EXITRSN12",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["EXITRSN12"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, EXITRSN12: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "ENTRRSN13",
      header: "ENTRRSN13",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["ENTRRSN13"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, ENTRRSN13: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "EXITRSN13",
      header: "EXITRSN13",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["EXITRSN13"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, EXITRSN13: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "ENTRRSN14",
      header: "ENTRRSN14",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["ENTRRSN14"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, ENTRRSN14: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "EXITRSN14",
      header: "EXITRSN14",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["EXITRSN14"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, EXITRSN14: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "ENTRRSN15",
      header: "ENTRRSN15",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["ENTRRSN15"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, ENTRRSN15: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "EXITRSN15",
      header: "EXITRSN15",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["EXITRSN15"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, EXITRSN15: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "ENTRRSN16",
      header: "ENTRRSN16",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["ENTRRSN16"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, ENTRRSN16: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "EXITRSN16",
      header: "EXITRSN16",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["EXITRSN16"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, EXITRSN16: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "ENTRRSN17",
      header: "ENTRRSN17",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["ENTRRSN17"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, ENTRRSN17: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "EXITRSN17",
      header: "EXITRSN17",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["EXITRSN17"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, EXITRSN17: undefined }),
        maxLength: 5,
      },
      size: 50,
    },
    {
      accessorKey: "ENTRRSN18",
      header: "ENTRRSN18",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["ENTRRSN18"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, ENTRRSN18: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "EXITRSN18",
      header: "EXITRSN18",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["EXITRSN18"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, EXITRSN18: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "ENTRRSN19",
      header: "ENTRRSN19",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["ENTRRSN19"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, ENTRRSN19: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "EXITRSN19",
      header: "EXITRSN19",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["EXITRSN19"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, EXITRSN19: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "ENTRRSN20",
      header: "ENTRRSN20",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["ENTRRSN20"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, ENTRRSN20: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "EXITRSN20",
      header: "EXITRSN20",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["EXITRSN20"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, EXITRSN20: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "ENTRRSN21",
      header: "ENTRRSN21",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["ENTRRSN21"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, ENTRRSN21: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "EXITRSN21",
      header: "EXITRSN21",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",

        error: validationErrors["EXITRSN21"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, EXITRSN21: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "ENTRRSN22",
      header: "ENTRRSN22",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",

        error: validationErrors["ENTRRSN22"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, ENTRRSN22: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "EXITRSN22",
      header: "EXITRSN22",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",

        error: validationErrors["EXITRSN22"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, EXITRSN22: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "ENTRRSN23",
      header: "ENTRRSN23",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",

        error: validationErrors["ENTRRSN23"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, ENTRRSN23: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "EXITRSN23",
      header: "EXITRSN23",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",

        error: validationErrors["EXITRSN23"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, EXITRSN23: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "ENTRRSN24",
      header: "ENTRRSN24",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",

        error: validationErrors["ENTRRSN24"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, ENTRRSN24: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "EXITRSN24",
      header: "EXITRSN24",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",

        error: validationErrors["EXITRSN24"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, EXITRSN24: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "ENTRRSN25",
      header: "ENTRRSN25",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",

        error: validationErrors["ENTRRSN25"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, ENTRRSN25: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
    {
      accessorKey: "EXITRSN25",
      header: "EXITRSN25",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        required: true,
        error: validationErrors["EXITRSN25"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, EXITRSN25: undefined }),
        maxLength: 100,
      },
      size: 100,
    },
  ];
};
