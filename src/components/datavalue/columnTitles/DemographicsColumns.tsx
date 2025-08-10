import React, { useState } from "react";
import { type MRT_ColumnDef } from "mantine-react-table";
import { ColorInput, Radio, Group, Select, Switch } from "@mantine/core";
import { IconCalendar } from "@tabler/icons-react";
import { DatePickerInput } from "@mantine/dates";
import {
  airStatus,
  airActive,
  airRCFREQ,
  airFYE,
  airGDFlow,
  airYN,
  airSMARPLEV,
  airMRRPTFRQ,
  airAGGTYP,
  airAGGFEATR,
  airRULEPKG,
  airCMPRPIND,
  airSMACPYFR,
} from "./DemographicsDDL.tsx";
import { formatDate } from "../../hooks/FormatDates.tsx";
import {
  useFilterFLVL,
  usePackageDDL,
  useTolerPackageDDL,
  useCountryDDL,
} from "../../hooks/useFrpNamesFiltersDDLsApi.js";

export type DemographicsFields = {
  id: string;
  ACCT: string;
  FYE: string;
  BNK: string;
  NAME: string;
  FREQX: string;
  SECPKG: string;
  INDXPKG: string;
  REPTPKG: string;
  SECTPKG: string;
  ADM: string;
  OFFN: string;
  OBJ: string;
  PWR: string;
  TYP: string;
  STATUS: string;
  USERDEF: string;
  EQINDX: string;
  FXINDX: string;
  CEINDX: string;
  WTDINDX: string;
  EQPOL: string;
  FXPOL: string;
  MVI_ACC: string;
  ICPDATED: string | Date;
  STATEID: string;
  TXRATE1: number;
  TXRATE2: number;
  TXRATE3: number;
  TXRATE4: number;
  ACTIVE: string;
  USERDEF2: string;
  USERDEF3: string;
  USERDEF4: string;
  RCFREQ: string;
  RCTOL: number;
  IPPICP: string | Date;
  UDA101: string;
  UDA102: string;
  UDA103: string;
  UDA104: string;
  UDA105: string;
  UDA301: string;
  UDA302: string;
  UDA303: string;
  UDA304: string;
  UDA305: string;
  UDN1: number;
  UDN2: number;
  UDN3: number;
  UDN4: number;
  UDN5: number;
  UDDATE1: string | Date;
  UDDATE2: string | Date;
  UDDATE3: string | Date;
  UDDATE4: string | Date;
  UDDATE5: string | Date;
  RPTDATE: string | Date;
  GLOBALFL: string;
  ACCTBASE: string;
  AGGTYP: string;
  AGGOWNER: string;
  TOLERPKG: string;
  PF_TIER: number;
  PCOLOR: string;
  TXRATE5: number;
  TXRATE6: number;
  TXFDONLY: string;
  RULEPKG: string;
  ACECDATE: string | Date;
  AGGFEATR: string;
  CMPRPIND: string;
  MR_IND: string;
  MRRPTFRQ: string;
  MRACTVRN: string;
  MRLRPDT: string | Date;
  MRLPRCDT: string | Date;
  MRLFRPDT: string | Date;
  MRLFRRDT: string | Date;
  RPTINGNAME: string;
  ICPDATED_ALT: string | Date;
  SMARPLEV: string;
  SMASRCE: string;
  SMASORT: string;
  SMACPYFR: string;
  SMACPYTO: string;
  UDA106: string;
  UDA107: string;
  UDA108: string;
  UDA109: string;
  UDA110: string;
  UDA111: string;
  UDA112: string;
  UDA113: string;
  UDA114: string;
  UDA115: string;
  UDA306: string;
  UDA307: string;
  UDA308: string;
  UDA309: string;
  UDA310: string;
  UDA311: string;
  UDA312: string;
  UDA313: string;
  UDA314: string;
  UDA315: string;
  UDN6: number;
  UDN7: number;
  UDN8: number;
  UDN9: number;
  UDN10: number;
  UDN11: number;
  UDN12: number;
  UDN13: number;
  UDN14: number;
  UDN15: number;
  UDDATE6: string | Date;
  UDDATE7: string | Date;
  UDDATE8: string | Date;
  UDDATE9: string | Date;
  UDDATE10: string | Date;
  UDDATE11: string | Date;
  UDDATE12: string | Date;
  UDDATE13: string | Date;
  UDDATE14: string | Date;
  UDDATE15: string | Date;
  APXDATE: string | Date;
  RECDTYPE: string;
};

export type countryFields = {
  COUNTRY: string;
  CNAME: string;
};
export type flvalFields = {
  VALUE: string;
  VAL_DESC: string;
};
export type ipkg = {
  PKG: string;
};

// Column definitions as a separate component
export const useDemographicsColumns = (
  setData: (data: DemographicsFields[]) => void, // Add a setData function to update the parent state
  client: any,
  isEditAble: boolean
): MRT_ColumnDef<DemographicsFields>[] => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | "">
  >({});

  // Fetch Country details
  const { data: processedCountry } = useCountryDDL(client);

  // Fetch another dataset (e.g., Bank)
  const { data: processedBNK } = useFilterFLVL(client, "BNK");

  // Fetch another dataset (e.g., ADM)
  const { data: processedADM } = useFilterFLVL(client, "ADM");

  // Fetch another dataset (e.g., OFFN)
  const { data: processedOFFN } = useFilterFLVL(client, "OFFN");

  // Fetch another dataset (e.g., OBJ)
  const { data: processedOBJ } = useFilterFLVL(client, "OBJ");

  // Fetch another dataset (e.g., PWR)
  const { data: processedPWR } = useFilterFLVL(client, "PWR");

  // Fetch another dataset (e.g., TYP)
  const { data: processedTYP } = useFilterFLVL(client, "TYP");

  // Fetch another dataset (e.g., INDXPKG)
  const { data: processedIpkg1 } = usePackageDDL(client);

  // Fetch another dataset (e.g., TOLERPKG)
  const { data: processedTOLERPKG } = useTolerPackageDDL(client);

  return [
    {
      accessorKey: "ACCT",
      header: "ID",
      enableEditing: isEditAble,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
    },
    {
      accessorKey: "NAME",
      header: "Name",
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["NAME"],
        onFocus: () => setValidationErrors({ ...validationErrors, NAME: "" }),
        maxLength: 48,
      },
      size: 250,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
    },
    {
      accessorKey: "RPTINGNAME",
      header: "Reporting Name",
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["RPTINGNAME"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, RPTINGNAME: "" }),
        maxLength: 100,
      },
      size: 250,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
    },
    {
      accessorKey: "ACTIVE",
      header: "Active Status",
      size: 100,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },

      // Edit mode: Dropdown with correct selected value
      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(
          cell.getValue<string>() || "-"
        );
        return (
          <Select
            label="Active Status"
            data={airActive}
            value={value}
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.ACTIVE = selectedValue || "";
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.ACTIVE = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.ACTIVE = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Update the selected value in the table state
              const selectedVal = airActive.find(
                (option) => option.value === selectedValue
              );
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table
                  .getRowModel()
                  .rows.map((r) =>
                    r.id === cell.row.id
                      ? { ...r.original, ACTIVE: selectedValue || "" }
                      : r.original
                  );

                setData(updatedRows);
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
    },
    {
      accessorKey: "STATUS",
      header: "Reporting Status",
      size: 100,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },

      // Edit mode: Dropdown with correct selected value
      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(
          cell.getValue<string>() || "-"
        );
        return (
          <Select
            label="Reporting Status"
            data={airStatus}
            value={value}
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.STATUS = selectedValue || "";
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.STATUS = selectedValue;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.STATUS = selectedValue;
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Update the selected value in the table state
              const selectedVal = airStatus.find(
                (option) => option.value === selectedValue
              );
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table
                  .getRowModel()
                  .rows.map((r) =>
                    r.id === cell.row.id
                      ? { ...r.original, STATUS: selectedValue || "" }
                      : r.original
                  );

                setData(updatedRows);
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
    },
    {
      accessorKey: "ICPDATED",
      header: "Inception Date",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      // Edit mode: Show DatePickerInput
      Edit: ({ row, table, cell }) => {
        const initialDate = formatDate(row.original.ICPDATED?.toString()); // Expecting format: YYYY-MM-DD

        // State to track selected date
        const [icpDateValue, setIcpDateValue] = useState<Date | null>(
          initialDate || new Date()
        );

        return (
          <DatePickerInput
            icon={<IconCalendar size={24} stroke={2.0} />}
            label="Inception Date"
            value={icpDateValue}
            required
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

              setIcpDateValue(selectedDate); // Update local state

              row.original.ICPDATED = formattedDate;

              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;

              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.ICPDATED = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.ICPDATED = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              }

              // Update the selected value in the table state
              const updatedRows = table.getRowModel().rows.map((r) =>
                r.id === cell.row.id
                  ? { ...r.original, ICPDATED: new Date(formattedDate) } // Update ICPDATED
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

        const formattedDate = new Date(dateValue).toLocaleDateString("en-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

        return formattedDate.replace("-", "/").replace("-", "/"); // Convert YYYY-MM-DD to YYYY/MM/DD
      },
    },
    {
      accessorKey: "ICPDATED_ALT",
      header: "Alternate Inception Date",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      // Edit mode: Show DatePickerInput
      Edit: ({ row, table, cell }) => {
        const initialDate = formatDate(row.original.ICPDATED_ALT?.toString()); // Expecting format: YYYY-MM-DD

        // State to track selected date
        const [icpADateValue, setIcpADateValue] = useState<Date | null>(
          initialDate || new Date()
        );

        return (
          <DatePickerInput
            icon={<IconCalendar size={24} stroke={2.0} />}
            label="Alternate Inception Date"
            value={icpADateValue}
            required
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

              setIcpADateValue(selectedDate); // Update local state

              row.original.ICPDATED_ALT = formattedDate;

              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;

              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.ICPDATED_ALT = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.ICPDATED_ALT = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              }

              // Update the selected value in the table state
              const updatedRows = table.getRowModel().rows.map((r) =>
                r.id === cell.row.id
                  ? { ...r.original, ICPDATED_ALT: new Date(formattedDate) } // Update ICPDATED_ALT
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

        const formattedDate = new Date(dateValue).toLocaleDateString("en-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

        return formattedDate.replace("-", "/").replace("-", "/"); // Convert YYYY-MM-DD to YYYY/MM/DD
      },
    },
    {
      accessorKey: "RPTDATE",
      header: "Report Date",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      // Edit mode: Show DatePickerInput
      Edit: ({ row, table, cell }) => {
        const initialDate = formatDate(row.original.RPTDATE?.toString()); // Expecting format: YYYY-MM-DD

        // State to track selected date
        const [rptDateValue, setRptDateValue] = useState<Date | null>(
          initialDate || new Date()
        );

        return (
          <DatePickerInput
            icon={<IconCalendar size={24} stroke={2.0} />}
            label="Report Date"
            value={rptDateValue}
            required
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

              setRptDateValue(selectedDate); // Update local state

              row.original.RPTDATE = formattedDate;

              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;

              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.RPTDATE = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.RPTDATE = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              }

              // Update the selected value in the table state
              const updatedRows = table.getRowModel().rows.map((r) =>
                r.id === cell.row.id
                  ? { ...r.original, RPTDATE: new Date(formattedDate) } // Update RPTDATE
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

        const formattedDate = new Date(dateValue).toLocaleDateString("en-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

        return formattedDate.replace("-", "/").replace("-", "/"); // Convert YYYY-MM-DD to YYYY/MM/DD
      },
    },
    {
      accessorKey: "ACECDATE",
      header: "Close Date",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      // Edit mode: Show DatePickerInput
      Edit: ({ row, table, cell }) => {
        const initialDate = formatDate(row.original.ACECDATE?.toString()); // Expecting format: YYYY-MM-DD

        // State to track selected date
        const [aceDateValue, setAceDateValue] = useState<Date | null>(
          initialDate || new Date()
        );

        return (
          <DatePickerInput
            icon={<IconCalendar size={24} stroke={2.0} />}
            label="Close Date"
            value={aceDateValue}
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

              setAceDateValue(selectedDate); // Update local state

              row.original.ACECDATE = formattedDate;

              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;

              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.ACECDATE = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.ACECDATE = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              }

              // Update the selected value in the table state
              const updatedRows = table.getRowModel().rows.map((r) =>
                r.id === cell.row.id
                  ? { ...r.original, ACECDATE: new Date(formattedDate) } // Update ACECDATE
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

        const formattedDate = new Date(dateValue).toLocaleDateString("en-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

        return formattedDate.replace("-", "/").replace("-", "/"); // Convert YYYY-MM-DD to YYYY/MM/DD
      },
    },
    {
      accessorKey: "PF_TIER",
      header: "Reporting Tier",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },

      mantineEditTextInputProps: {
        type: "number",
        error: validationErrors["PF_TIER"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, PF_TIER: "" }),
        maxLength: 5,
      },
    },
    {
      accessorKey: "PCOLOR",
      header: "Graph Color",
      size: 100,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },

      // Display the color in a box
      Cell: ({ cell }) => {
        const colorValue = cell.getValue(); // Example: "255,0,0"
        return (
          <div
            style={{
              backgroundColor: `rgb(${colorValue})`,
              width: "100px",
              height: "20px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        );
      },

      // Edit mode: Show ColorInput with dynamic background
      Edit: ({ cell, row, table }) => {
        const currentColor = (cell.getValue() as string) || "255,255,255";
        const [color, setColor] = useState(currentColor);

        const handleColorChange = (newColor: string) => {
          setColor(newColor); // Update local state for real-time feedback

          // Determine if it's a new row being created or an existing row being edited
          const creatingRow = table.getState().creatingRow;
          const editingRow = table.getState().editingRow;

          if (creatingRow && creatingRow._valuesCache) {
            // Update creatingRow properly
            table.setCreatingRow({
              ...creatingRow,
              _valuesCache: {
                ...creatingRow._valuesCache,
                PCOLOR: newColor, // Store as "R,G,B" string
              },
            });
          } else if (editingRow && editingRow._valuesCache) {
            // Update editingRow properly
            table.setEditingRow({
              ...editingRow,
              _valuesCache: {
                ...editingRow._valuesCache,
                PCOLOR: newColor, // Store as "R,G,B" string
              },
            });
          }

          // Update the table state with the new color
          const updatedRows = table
            .getRowModel()
            .rows.map((r) =>
              r.id === row.id ? { ...r.original, PCOLOR: newColor } : r.original
            );

          // Assuming `setData` is passed in meta to update table state
          setData(updatedRows);
        };

        return (
          <ColorInput
            label="Graph Color"
            format="rgb" // Stores RGB values like "rgb(255,255,255)"
            value={`rgb(${color})`} // Ensure the value is in the correct format
            onChange={(newColor) => {
              // Extract RGB values from the new color string
              const rgbValues = newColor.replace(/[^\d,]/g, ""); // Remove non-numeric characters
              handleColorChange(rgbValues);
            }}
            swatches={[
              "rgb(255, 0, 0)",
              "rgb(0, 255, 0)",
              "rgb(0, 0, 255)",
              "rgb(255, 255, 0)",
              "rgb(255, 0, 255)",
              "rgb(0, 255, 255)",
            ]}
            swatchesPerRow={6}
            withPicker={true}
            // style={{ backgroundColor: `rgb(${color})` }} // Dynamic background for the input box
            aria-label="Select graph color"
          />
        );
      },
    },
    {
      accessorKey: "BNK",
      header: "Bank ID",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(
          cell.getValue<string>()
        );
        const airBNK = (processedBNK || []).map((bnk: { VALUE: any; VAL_DESC: any; }) => ({
          value: bnk.VALUE,
          label: bnk.VAL_DESC,
        }));
        return (
          <Select
            label="Bank ID"
            data={airBNK}
            value={value}
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.BNK = selectedValue || "";
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.BNK = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.BNK = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Update the selected value in the table state
              const selectedVal = airBNK.find(
                (option) => option.value === selectedValue
              );
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table
                  .getRowModel()
                  .rows.map((r) =>
                    r.id === cell.row.id
                      ? { ...r.original, BNK: selectedValue || "" }
                      : r.original
                  );

                setData(updatedRows);
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
    },
    {
      accessorKey: "ADM",
      header: "Administrator",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(
          cell.getValue<string>()
        );
        const airADM = (processedADM || []).map((adm: { VALUE: any; VAL_DESC: any; }) => ({
          value: adm.VALUE,
          label: adm.VAL_DESC,
        }));
        return (
          <Select
            label="Administrator"
            data={airADM}
            value={value}
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.ADM = selectedValue || "";
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.ADM = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.ADM = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Update the selected value in the table state
              const selectedVal = airADM.find(
                (option) => option.value === selectedValue
              );
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table
                  .getRowModel()
                  .rows.map((r) =>
                    r.id === cell.row.id
                      ? { ...r.original, ADM: selectedValue || "" }
                      : r.original
                  );

                setData(updatedRows);
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
    },
    {
      accessorKey: "OFFN",
      header: "Officer",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(
          cell.getValue<string>()
        );
        const airOFFN = (processedOFFN || []).map((offn: { VALUE: any; VAL_DESC: any; }) => ({
          value: offn.VALUE,
          label: offn.VAL_DESC,
        }));
        return (
          <Select
            label="Officer"
            data={airOFFN}
            value={value}
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.OFFN = selectedValue || "";
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.OFFN = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.OFFN = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Update the selected value in the table state
              const selectedVal = airOFFN.find(
                (option) => option.value === selectedValue
              );
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table
                  .getRowModel()
                  .rows.map((r) =>
                    r.id === cell.row.id
                      ? { ...r.original, OFFN: selectedValue || "" }
                      : r.original
                  );

                setData(updatedRows);
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
    },
    {
      accessorKey: "OBJ",
      header: "Objective",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(
          cell.getValue<string>()
        );
        const airOBJ = (processedOBJ || []).map(
          (obj: { VALUE: any; VAL_DESC: any }) => ({
            value: obj.VALUE,
            label: obj.VAL_DESC,
          })
        );
        return (
          <Select
            label="Officer"
            data={airOBJ}
            value={value}
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.OBJ = selectedValue || "";
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.OBJ = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.OBJ = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Update the selected value in the table state
              const selectedVal = airOBJ.find(
                (option) => option.value === selectedValue
              );
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table
                  .getRowModel()
                  .rows.map((r) =>
                    r.id === cell.row.id
                      ? { ...r.original, OBJ: selectedValue || "" }
                      : r.original
                  );

                setData(updatedRows);
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
    },
    {
      accessorKey: "PWR",
      header: "Power",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(
          cell.getValue<string>()
        );
        const airPWR = (processedPWR || []).map((pwr: { VALUE: any; VAL_DESC: any; }) => ({
          value: pwr.VALUE,
          label: pwr.VAL_DESC,
        }));
        return (
          <Select
            label="Power"
            data={airPWR}
            value={value}
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.PWR = selectedValue || "";
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.PWR = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.PWR = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Update the selected value in the table state
              const selectedVal = airPWR.find(
                (option) => option.value === selectedValue
              );
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table
                  .getRowModel()
                  .rows.map((r) =>
                    r.id === cell.row.id
                      ? { ...r.original, PWR: selectedValue || "" }
                      : r.original
                  );

                setData(updatedRows);
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
    },
    {
      accessorKey: "TYP",
      header: "Type",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(
          cell.getValue<string>()
        );
        const airTYP = (processedTYP || []).map((typ: { VALUE: any; VAL_DESC: any; }) => ({
          value: typ.VALUE,
          label: typ.VAL_DESC,
        }));
        return (
          <Select
            label="Type"
            data={airTYP}
            value={value}
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.TYP = selectedValue || "";
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.TYP = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.TYP = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Update the selected value in the table state
              const selectedVal = airTYP.find(
                (option) => option.value === selectedValue
              );
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table
                  .getRowModel()
                  .rows.map((r) =>
                    r.id === cell.row.id
                      ? { ...r.original, TYP: selectedValue || "" }
                      : r.original
                  );

                setData(updatedRows);
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
    },
    {
      accessorKey: "INDXPKG",
      header: "Benchmark Pkg",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },

      // Edit mode: Dropdown with correct selected value
      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(
          cell.getValue<string>() || "-"
        );
        const airINDXPKG = (processedIpkg1 || []).map((pkg: { PKG: any }) => ({
          value: pkg.PKG,
          label: pkg.PKG,
        }));
        return (
          <Select
            label="Benchmark Pkg"
            data={airINDXPKG}
            value={value}
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.INDXPKG = selectedValue || "";
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.INDXPKG = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.INDXPKG = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Update the selected value in the table state
              const selectedVal = airINDXPKG.find(
                (option) => option.value === selectedValue
              );
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table
                  .getRowModel()
                  .rows.map((r) =>
                    r.id === cell.row.id
                      ? { ...r.original, INDXPKG: selectedValue || "" }
                      : r.original
                  );

                setData(updatedRows);
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
    },
    {
      accessorKey: "EQINDX",
      header: "Equity ID",
      editVariant: "text",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["EQINDX"],
        onFocus: () => setValidationErrors({ ...validationErrors, EQINDX: "" }),
        maxLength: 4,
      },
      size: 50,
    },
    {
      accessorKey: "FXINDX",
      header: "Fixed ID",
      editVariant: "text",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["FXINDX"],
        onFocus: () => setValidationErrors({ ...validationErrors, FXINDX: "" }),
        maxLength: 4,
      },
      size: 50,
    },
    {
      accessorKey: "CEINDX",
      header: "Cash Equiv ID",
      editVariant: "text",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["CEINDX"],
        onFocus: () => setValidationErrors({ ...validationErrors, CEINDX: "" }),
        maxLength: 4,
      },
      size: 50,
    },
    {
      accessorKey: "WTDINDX",
      header: "Weighted ID",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["WTDINDX"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, WTDINDX: "" }),
        maxLength: 4,
      },
      size: 50,
    },
    {
      accessorKey: "EQPOL",
      header: "Equity Policy ID",
      editVariant: "text",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["EQPOL"],
        onFocus: () => setValidationErrors({ ...validationErrors, EQPOL: "" }),
        maxLength: 5,
      },
      size: 50,
    },
    {
      accessorKey: "FXPOL",
      header: "Fixed Policy ID",
      editVariant: "text",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["FXPOL"],
        onFocus: () => setValidationErrors({ ...validationErrors, FXPOL: "" }),
        maxLength: 5,
      },
      size: 50,
    },
    {
      accessorKey: "APXDATE",
      header: "APWIX Freeze Date",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },

      // Edit mode: Show DatePickerInput
      Edit: ({ row, table, cell }) => {
        const initialAPXDate = formatDate(row.original.APXDATE?.toString()); // Expecting format: YYYY/MM/DD

        // State to track selected date
        const [apxDateValue, setAPXDateValue] = useState<Date | null>(
          initialAPXDate || new Date()
        );

        return (
          <DatePickerInput
            icon={<IconCalendar size={24} stroke={2.0} />}
            label="APWIX Freeze Date"
            value={apxDateValue}
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

              setAPXDateValue(selectedDate); // Update local state

              row.original.APXDATE = formattedDate;

              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;

              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.APXDATE = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.APXDATE = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              }

              // Update the selected value in the table state
              const updatedRows = table.getRowModel().rows.map((r) =>
                r.id === cell.row.id
                  ? { ...r.original, APXDATE: formattedDate } // Update APXDATE
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
          day: "2-digit",
        });

        return formattedDate.replace("-", "/").replace("-", "/"); // Convert YYYY-MM to YYYY/MM
      },
    },
    {
      accessorKey: "TOLERPKG",
      header: "Return Tolerance Pkg",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },

      // Edit mode: Dropdown with correct selected value
      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(
          cell.getValue<string>() || "-"
        );
        const airTOLERPKG = (processedTOLERPKG || []).map((tpkg: { PKG: any; }) => ({
          value: tpkg.PKG,
          label: tpkg.PKG,
        }));
        return (
          <Select
            label="Return Tolerance Pkg"
            data={airTOLERPKG}
            value={value}
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.TOLERPKG = selectedValue || "";
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.TOLERPKG = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.TOLERPKG = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Update the selected value in the table state
              const selectedVal = airTOLERPKG.find(
                (option) => option.value === selectedValue
              );
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table
                  .getRowModel()
                  .rows.map((r) =>
                    r.id === cell.row.id
                      ? { ...r.original, TOLERPKG: selectedValue || "" }
                      : r.original
                  );

                setData(updatedRows);
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
    },
    {
      accessorKey: "AGGOWNER",
      header: "Composite Owner",
      size: 110,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },

      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["AGGOWNER"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, AGGOWNER: "" }),
        maxLength: 12,
      },

      Cell: ({ cell, row }): React.ReactNode => {
        return row.original.ACCT?.substring(0, 2) === "AGG"
          ? (cell.getValue() as string)
          : "Not Defined";
      },
    },
    {
      accessorKey: "AGGTYP",
      header: "Composite Type",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },

      Cell: ({ cell, row }): React.ReactNode => {
        return row.original.ACCT?.substring(0, 2) === "AGG"
          ? (cell.getValue() as string)
          : "Not Defined";
      },

      Edit: ({ row, cell, table }) => {
        const [value, setValue] = useState<string | null>(
          cell.getValue<string>() || "-"
        );
        return (
          <Select
            label="Composite Type"
            data={airAGGTYP}
            value={value}
            disabled={
              row.original.ACCT?.substring(0, 2) === "AGG" ? true : false
            }
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.AGGTYP = selectedValue || "";
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.AGGTYP = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.AGGTYP = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Update the selected value in the table state
              const selectedVal = airAGGTYP.find(
                (option) => option.value === selectedValue
              );
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table
                  .getRowModel()
                  .rows.map((r) =>
                    r.id === cell.row.id
                      ? { ...r.original, AGGTYP: selectedValue || "" }
                      : r.original
                  );

                setData(updatedRows);
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
    },
    {
      accessorKey: "AGGFEATR",
      header: "Composite Feature",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },

      Cell: ({ cell, row }): React.ReactNode => {
        return row.original.ACCT?.substring(0, 2) === "AGG"
          ? (cell.getValue() as string)
          : "Not Defined";
      },

      Edit: ({ row, cell, table }) => {
        const [value, setValue] = useState<string | null>(
          cell.getValue<string>() || "-"
        );
        return (
          <Select
            label="Composite Feature"
            data={airAGGFEATR}
            value={value}
            disabled={
              row.original.ACCT?.substring(0, 2) === "AGG" ? true : false
            }
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.AGGFEATR = selectedValue || "";
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.AGGFEATR = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.AGGFEATR = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Update the selected value in the table state
              const selectedVal = airAGGFEATR.find(
                (option) => option.value === selectedValue
              );
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table
                  .getRowModel()
                  .rows.map((r) =>
                    r.id === cell.row.id
                      ? { ...r.original, AGGFEATR: selectedValue || "" }
                      : r.original
                  );

                setData(updatedRows);
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
    },
    {
      accessorKey: "RULEPKG",
      header: "ACE Rules Pkg",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },

      Cell: ({ cell, row }): React.ReactNode => {
        return row.original.ACCT?.substring(0, 2) === "AGG"
          ? (cell.getValue() as string)
          : "Not Defined";
      },

      Edit: ({ row, cell, table }) => {
        const [value, setValue] = useState<string | null>(
          cell.getValue<string>() || "-"
        );
        return (
          <Select
            label="ACE Rules Pkg"
            data={airRULEPKG}
            value={value}
            disabled={
              row.original.ACCT?.substring(0, 2) === "AGG" ? true : false
            }
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.RULEPKG = selectedValue || "";
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.RULEPKG = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.RULEPKG = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Update the selected value in the table state
              const selectedVal = airRULEPKG.find(
                (option) => option.value === selectedValue
              );
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table
                  .getRowModel()
                  .rows.map((r) =>
                    r.id === cell.row.id
                      ? { ...r.original, RULEPKG: selectedValue || "" }
                      : r.original
                  );

                setData(updatedRows);
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
    },
    {
      accessorKey: "MVI_ACC",
      header: "MV + Accrual",
      size: 50,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },

      // Display Yes/No text in normal (view) mode
      Cell: ({ cell }) => {
        return cell.getValue() === "Y" ? "Yes" : "No";
      },

      // Edit mode: Show radio buttons
      Edit: ({ cell }) => {
        const [value, setValue] = useState(
          cell.getValue() === null ? "N" : cell.getValue()
        );
        return (
          <Radio.Group
            label="MV + Accrual"
            value={value as string}
            onChange={setValue}
          >
            <Group mt="xs">
              <Radio value="Y" label="Yes" />
              <Radio value="N" label="No" />
            </Group>
          </Radio.Group>
        );
      },
    },
    {
      accessorKey: "RCFREQ",
      header: "Return Calculation Frequency",
      size: 100,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditSelectProps: {
        required: true,
      },

      // Edit mode: Dropdown with correct selected value
      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(
          cell.getValue<string>() || "-"
        );
        return (
          <Select
            label="Return Calculation Frequency"
            data={airRCFREQ}
            value={value}
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.RCFREQ = selectedValue || "";
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.RCFREQ = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.RCFREQ = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Update the selected value in the table state
              const selectedFreq = airRCFREQ.find(
                (option) => option.value === selectedValue
              );
              // Update the selected value in the table state
              if (selectedFreq) {
                const updatedRows = table
                  .getRowModel()
                  .rows.map((r) =>
                    r.id === cell.row.id
                      ? { ...r.original, RCFREQ: selectedValue || "" }
                      : r.original
                  );

                setData(updatedRows);
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
    },
    {
      accessorKey: "RCTOL",
      header: "Flow Tolerance",
      mantineEditTextInputProps: {
        type: "number",
        required: true,
        error: validationErrors["RCTOL"],
        onFocus: () => setValidationErrors({ ...validationErrors, RCTOL: "" }),
      },
      mantineTableHeadCellProps: { align: "right", className: "rpt-header-3" },
      mantineTableBodyCellProps: { align: "right" },
    },
    {
      accessorKey: "IPPICP",
      header: "Daily Inception Date",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      // Edit mode: Show DatePickerInput
      Edit: ({ row, table, cell }) => {
        const initialDate = formatDate(row.original.IPPICP?.toString()); // Expecting format: YYYY-MM-DD

        // State to track selected date
        const [ippDateValue, setIppDateValue] = useState<Date | null>(
          initialDate || new Date()
        );

        return (
          <DatePickerInput
            icon={<IconCalendar size={24} stroke={2.0} />}
            label="Daily Inception Date"
            value={ippDateValue}
            required
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

              setIppDateValue(selectedDate); // Update local state

              row.original.IPPICP = formattedDate;

              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;

              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.IPPICP = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.IPPICP = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              }

              // Update the selected value in the table state
              const updatedRows = table.getRowModel().rows.map((r) =>
                r.id === cell.row.id
                  ? { ...r.original, IPPICP: new Date(formattedDate) } // Update IPPICP
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

        const formattedDate = new Date(dateValue).toLocaleDateString("en-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

        return formattedDate.replace("-", "/").replace("-", "/"); // Convert YYYY-MM-DD to YYYY/MM/DD
      },
    },
    {
      accessorKey: "FYE",
      header: "Fiscal Year End",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>("");
        return (
          <Select
            label="Fiscal Year End"
            data={airFYE}
            value={value}
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.FYE = selectedValue || "";
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.FYE = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.FYE = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Update the selected value in the table state
              const selectedVal = airFYE.find(
                (option) => option.value === selectedValue
              );
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table
                  .getRowModel()
                  .rows.map((r) =>
                    r.id === cell.row.id
                      ? { ...r.original, FYE: selectedValue || "" }
                      : r.original
                  );

                setData(updatedRows);
              }
            }}
          />
        );
      },
    },
    {
      accessorKey: "GLOBALFL",
      header: "Region",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditSelectProps: {
        required: true,
      },

      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(
          cell.getValue<string>()
        );
        return (
          <Select
            label="Region"
            data={airGDFlow}
            value={value}
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.GLOBALFL = selectedValue || "";
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.GLOBALFL = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.GLOBALFL = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Update the selected value in the table state
              const selectedVal = airGDFlow.find(
                (option) => option.value === selectedValue
              );
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table
                  .getRowModel()
                  .rows.map((r) =>
                    r.id === cell.row.id
                      ? { ...r.original, GLOBALFL: selectedValue || "" }
                      : r.original
                  );

                setData(updatedRows);
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
    },
    {
      accessorKey: "ACCTBASE",
      header: "Base Country",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditSelectProps: {
        required: true,
      },

      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(
          cell.getValue<string>()
        );
        const airCntry = (processedCountry || []).map((country: { COUNTRY: string; CNAME: string; }) => ({
          value: country.COUNTRY,
          label: country.CNAME + " (" + country.COUNTRY + ")",
        }));
        return (
          <Select
            label="Base Country"
            data={airCntry}
            value={value}
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.ACCTBASE = selectedValue || "";
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.ACCTBASE = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.ACCTBASE = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Update the selected value in the table state
              const selectedVal = airCntry.find(
                (option) => option.value === selectedValue
              );
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table
                  .getRowModel()
                  .rows.map((r) =>
                    r.id === cell.row.id
                      ? { ...r.original, ACCTBASE: selectedValue || "" }
                      : r.original
                  );

                setData(updatedRows);
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
    },
    {
      accessorKey: "STATEID",
      header: "State Tax Code",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      size: 50,
      mantineEditTextInputProps: {
        error: validationErrors["STATEID"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, STATEID: "" }),
        maxLength: 3,
      },
    },
    {
      accessorKey: "TXFDONLY",
      header: "Tax Federal Only?",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>("");
        return (
          <Select
            label="Tax Federal Only?"
            data={airYN}
            value={value}
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.TXFDONLY = selectedValue || "";
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.TXFDONLY = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.TXFDONLY = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Update the selected value in the table state
              const selectedVal = airYN.find(
                (option) => option.value === selectedValue
              );
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table
                  .getRowModel()
                  .rows.map((r) =>
                    r.id === cell.row.id
                      ? { ...r.original, TXFDONLY: selectedValue || "" }
                      : r.original
                  );

                setData(updatedRows);
              }
            }}
          />
        );
      },
    },
    {
      accessorKey: "TXRATE1",
      header: "Federal Short Term Rate",
      mantineEditTextInputProps: {
        type: "number",
        error: validationErrors["TXRATE1"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, TXRATE1: "" }),
        maxLength: 7,
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
            minimumFractionDigits: 3,
            maximumFractionDigits: 3,
          }),
    },
    {
      accessorKey: "TXRATE2",
      header: "Federal Long Term Rate",
      mantineEditTextInputProps: {
        type: "number",
        error: validationErrors["TXRATE2"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, TXRATE2: "" }),
        maxLength: 7,
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
            minimumFractionDigits: 3,
            maximumFractionDigits: 3,
          }),
    },
    {
      accessorKey: "TXRATE3",
      header: "State Short Term Rate",
      mantineEditTextInputProps: {
        type: "number",
        error: validationErrors["TXRATE3"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, TXRATE3: "" }),
        maxLength: 7,
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
            minimumFractionDigits: 3,
            maximumFractionDigits: 3,
          }),
    },
    {
      accessorKey: "TXRATE4",
      header: "State Long Term Rate",
      mantineEditTextInputProps: {
        type: "number",
        error: validationErrors["TXRATE4"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, TXRATE4: "" }),
        maxLength: 7,
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
            minimumFractionDigits: 3,
            maximumFractionDigits: 3,
          }),
    },
    {
      accessorKey: "TXRATE5",
      header: "Local Short Term Rate",
      mantineEditTextInputProps: {
        type: "number",
        error: validationErrors["TXRATE5"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, TXRATE5: "" }),
        maxLength: 7,
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
            minimumFractionDigits: 3,
            maximumFractionDigits: 3,
          }),
    },
    {
      accessorKey: "TXRATE6",
      header: "Local Long Term Rate",
      mantineEditTextInputProps: {
        type: "number",
        error: validationErrors["TXRATE6"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, TXRATE6: "" }),
        maxLength: 7,
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
            minimumFractionDigits: 3,
            maximumFractionDigits: 3,
          }),
    },
    {
      accessorKey: "CMPRPIND",
      header: "Composite Reporting Level",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },

      Cell: ({ cell, row }): React.ReactNode => {
        return row.original.ACCT?.substring(0, 2) === "AGG"
          ? (cell.getValue() as string)
          : "Not Defined";
      },

      Edit: ({ row, cell, table }) => {
        const [value, setValue] = useState<string | null>(
          cell.getValue<string>() || "-"
        );
        return (
          <Select
            label="Composite Reporting Level"
            data={airCMPRPIND}
            value={value}
            disabled={
              row.original.ACCT?.substring(0, 2) === "AGG" ? true : false
            }
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.CMPRPIND = selectedValue || "";
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.CMPRPIND = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.CMPRPIND = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Update the selected value in the table state
              const selectedVal = airCMPRPIND.find(
                (option) => option.value === selectedValue
              );
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table
                  .getRowModel()
                  .rows.map((r) =>
                    r.id === cell.row.id
                      ? { ...r.original, CMPRPIND: selectedValue || "" }
                      : r.original
                  );

                setData(updatedRows);
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
    },
    {
      accessorKey: "MR_IND",
      header: "Generate Scheduled/Batch Reports?",
      size: 50,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },

      // Display Yes/No text in normal (view) mode
      Cell: ({ cell }) => {
        return cell.getValue() === "Y" ? "Yes" : "No";
      },

      // Edit mode: Show switch for better UX
      Edit: ({ cell, row }) => {
        const [value, setValue] = useState(
          cell.getValue() === "Y" ? true : false
        );

        const handleChange = (checked: boolean) => {
          setValue(checked);
          // Update the row's data with the new value
          row._valuesCache[cell.column.id] = checked ? "Y" : "N";
        };

        return (
          <Switch
            label="Generate Scheduled/Batch Reports?"
            checked={value}
            onChange={(event) => handleChange(event.currentTarget.checked)}
            aria-label="Generate Scheduled/Batch Reports?"
          />
        );
      },
    },
    {
      accessorKey: "MRRPTFRQ",
      header: "Scheduled/Batch Report Frequency",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(
          cell.getValue<string>()
        );
        return (
          <Select
            label="Scheduled/Batch Report Frequency"
            data={airMRRPTFRQ}
            value={value}
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.MRRPTFRQ = selectedValue || "";
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.MRRPTFRQ = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.MRRPTFRQ = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Update the selected value in the table state
              const selectedVal = airMRRPTFRQ.find(
                (option) => option.value === selectedValue
              );
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table
                  .getRowModel()
                  .rows.map((r) =>
                    r.id === cell.row.id
                      ? { ...r.original, MRRPTFR: selectedValue || "" }
                      : r.original
                  );

                setData(updatedRows);
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
    },
    {
      accessorKey: "MRACTVRN",
      header: "Include in the next on-demand statement re-run?",
      size: 50,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },

      // Display Yes/No text in normal (view) mode
      Cell: ({ cell }) => {
        return cell.getValue() === "Y" ? "Yes" : "No";
      },

      // Edit mode: Show switch for better UX
      Edit: ({ cell, row }) => {
        const [value, setValue] = useState(
          cell.getValue() === "Y" ? true : false
        );

        const handleChange = (checked: boolean) => {
          setValue(checked);
          // Update the row's data with the new value
          row._valuesCache[cell.column.id] = checked ? "Y" : "N";
        };

        return (
          <Switch
            label="Include in the next on-demand statement re-run?"
            checked={value}
            onChange={(event) => handleChange(event.currentTarget.checked)}
            aria-label="Include in the next on-demand statement re-run?"
          />
        );
      },
    },
    {
      accessorKey: "SMARPLEV",
      header: "Strategy Reporting",
      size: 200,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditSelectProps: {
        required: true,
      },

      // Edit mode: Dropdown with correct selected value
      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(
          cell.getValue<string>()
        );
        return (
          <Select
            label="Strategy Reporting"
            data={airSMARPLEV}
            value={value}
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.SMARPLEV = selectedValue || "";
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.SMARPLEV = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.SMARPLEV = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Update the selected value in the table state
              const selectedVal = airSMARPLEV.find(
                (option) => option.value === selectedValue
              );
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table
                  .getRowModel()
                  .rows.map((r) =>
                    r.id === cell.row.id
                      ? { ...r.original, SMARPLEV: selectedValue || "" }
                      : r.original
                  );

                setData(updatedRows);
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
    },
    {
      accessorKey: "SMASRCE",
      header: "Strategy Source Sector",
      size: 50,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },

      mantineEditTextInputProps: {
        error: validationErrors["SMASRCE"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, SMASRCE: "" }),
        maxLength: 4,
      },
    },
    {
      accessorKey: "SMASORT",
      header: "Strategy Sort Sector",
      size: 50,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },

      mantineEditTextInputProps: {
        error: validationErrors["SMASORT"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, SMASORT: "" }),
        maxLength: 4,
      },
    },
    {
      accessorKey: "SMACPYFR",
      header: "Strategy Copy From Sector",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      // Edit mode: Dropdown with correct selected value
      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(
          cell.getValue<string>()
        );
        return (
          <Select
            label="Strategy Copy From Sector"
            data={airSMACPYFR}
            value={value}
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.SMACPYFR = selectedValue || "";
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.SMACPYFR = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.SMACPYFR = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Update the selected value in the table state
              const selectedVal = airSMACPYFR.find(
                (option) => option.value === selectedValue
              );
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table
                  .getRowModel()
                  .rows.map((r) =>
                    r.id === cell.row.id
                      ? { ...r.original, SMACPYFR: selectedValue || "" }
                      : r.original
                  );

                setData(updatedRows);
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
    },
    {
      accessorKey: "SMACPYTO",
      header: "Strategy Copy To  Sector",
      size: 50,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        error: validationErrors["SMACPYTO"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, SMACPYTO: "" }),
        maxLength: 4,
      },
    },
    {
      accessorKey: "FREQX",
      header: "Reporting Frequency",
      size: 50,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        error: validationErrors["FREQX"],
        onFocus: () => setValidationErrors({ ...validationErrors, FREQX: "" }),
        maxLength: 1,
      },
    },
    {
      accessorKey: "REPTPKG",
      header: "Report Pkg",
      size: 50,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        error: validationErrors["REPTPKG"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, REPTPKG: "" }),
        maxLength: 3,
      },
    },
    {
      accessorKey: "SECPKG",
      header: "Sector Pkg 1",
      size: 50,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        error: validationErrors["SECPKG"],
        onFocus: () => setValidationErrors({ ...validationErrors, SECPKG: "" }),
        maxLength: 3,
      },
    },
    {
      accessorKey: "SECTPKG",
      header: "Sector Pkg 2",
      size: 50,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        error: validationErrors["SECTPKG"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, SECTPKG: "" }),
        maxLength: 3,
      },
    },
    {
      accessorKey: "USERDEF",
      header: "Client Def Field 1",
      size: 100,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        error: validationErrors["USERDEF"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, USERDEF: "" }),
        maxLength: 10,
      },
    },
    {
      accessorKey: "USERDEF2",
      header: "Client Def Field 2",
      size: 100,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        error: validationErrors["USERDEF2"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, USERDEF2: "" }),
        maxLength: 10,
      },
    },
    {
      accessorKey: "USERDEF3",
      header: "Client Def Field 3",
      size: 100,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        error: validationErrors["USERDEF3"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, USERDEF3: "" }),
        maxLength: 10,
      },
    },
    {
      accessorKey: "USERDEF4",
      header: "Client Def Field 4",
      size: 100,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        error: validationErrors["USERDEF4"],
        onFocus: () =>
          setValidationErrors({ ...validationErrors, USERDEF4: "" }),
        maxLength: 10,
      },
    },
    {
      accessorKey: "UDA101",
      header: "Client Def Field Short 1",
      size: 100,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        error: validationErrors["UDA101"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDA101: "" }),
        maxLength: 10,
      },
    },
    {
      accessorKey: "UDA102",
      header: "Client Def Field Short 2",
      size: 100,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        error: validationErrors["UDA102"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDA102: "" }),
        maxLength: 10,
      },
    },
    {
      accessorKey: "UDA103",
      header: "Client Def Field Short 3",
      size: 100,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        error: validationErrors["UDA103"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDA103: "" }),
        maxLength: 10,
      },
    },
    {
      accessorKey: "UDA104",
      header: "Client Def Field Short 4",
      size: 100,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        error: validationErrors["UDA104"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDA104: "" }),
        maxLength: 10,
      },
    },
    {
      accessorKey: "UDA105",
      header: "Client Def Field Short 5",
      size: 100,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        error: validationErrors["UDA105"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDA105: "" }),
        maxLength: 10,
      },
    },
    {
      accessorKey: "UDA106",
      header: "Client Def Field Short 6",
      size: 100,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        error: validationErrors["UDA106"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDA106: "" }),
        maxLength: 10,
      },
    },
    {
      accessorKey: "UDA107",
      header: "Client Def Field Short 7",
      size: 100,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        error: validationErrors["UDA107"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDA107: "" }),
        maxLength: 10,
      },
    },
    {
      accessorKey: "UDA108",
      header: "Client Def Field Short 8",
      size: 100,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        error: validationErrors["UDA108"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDA108: "" }),
        maxLength: 10,
      },
    },
    {
      accessorKey: "UDA109",
      header: "Client Def Field Short 9",
      size: 100,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        error: validationErrors["UDA109"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDA109: "" }),
        maxLength: 10,
      },
    },
    {
      accessorKey: "UDA110",
      header: "Client Def Field Short 10",
      size: 100,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        error: validationErrors["UDA110"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDA110: "" }),
        maxLength: 10,
      },
    },
    {
      accessorKey: "UDA111",
      header: "Client Def Field Short 11",
      size: 100,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        error: validationErrors["UDA111"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDA111: "" }),
        maxLength: 10,
      },
    },
    {
      accessorKey: "UDA112",
      header: "Client Def Field Short 12",
      size: 100,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        error: validationErrors["UDA112"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDA112: "" }),
        maxLength: 10,
      },
    },
    {
      accessorKey: "UDA113",
      header: "Client Def Field Short 13",
      size: 100,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        error: validationErrors["UDA113"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDA113: "" }),
        maxLength: 10,
      },
    },
    {
      accessorKey: "UDA114",
      header: "Client Def Field Short 14",
      size: 100,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        error: validationErrors["UDA114"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDA114: "" }),
        maxLength: 10,
      },
    },
    {
      accessorKey: "UDA115",
      header: "Client Def Field Short 15",
      size: 100,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        error: validationErrors["UDA115"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDA115: "" }),
        maxLength: 10,
      },
    },
    {
      accessorKey: "UDA301",
      header: "Client Def Field Long 1",
      size: 200,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        error: validationErrors["UDA301"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDA301: "" }),
        maxLength: 30,
      },
    },
    {
      accessorKey: "UDA302",
      header: "Client Def Field Long 2",
      size: 200,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        error: validationErrors["UDA302"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDA302: "" }),
        maxLength: 30,
      },
    },
    {
      accessorKey: "UDA303",
      header: "Client Def Field Long 3",
      size: 200,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        error: validationErrors["UDA303"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDA303: "" }),
        maxLength: 30,
      },
    },
    {
      accessorKey: "UDA304",
      header: "Client Def Field Long 4",
      size: 200,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        error: validationErrors["UDA304"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDA304: "" }),
        maxLength: 30,
      },
    },
    {
      accessorKey: "UDA305",
      header: "Client Def Field Long 5",
      size: 200,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        error: validationErrors["UDA305"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDA305: "" }),
        maxLength: 30,
      },
    },
    {
      accessorKey: "UDA306",
      header: "Client Def Field Long 6",
      size: 200,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        error: validationErrors["UDA306"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDA306: "" }),
        maxLength: 30,
      },
    },
    {
      accessorKey: "UDA307",
      header: "Client Def Field Long 7",
      size: 200,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        error: validationErrors["UDA307"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDA307: "" }),
        maxLength: 30,
      },
    },
    {
      accessorKey: "UDA308",
      header: "Client Def Field Long 8",
      size: 200,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        error: validationErrors["UDA308"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDA308: "" }),
        maxLength: 30,
      },
    },
    {
      accessorKey: "UDA309",
      header: "Client Def Field Long 9",
      size: 200,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        error: validationErrors["UDA309"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDA309: "" }),
        maxLength: 30,
      },
    },
    {
      accessorKey: "UDA310",
      header: "Client Def Field Long 10",
      size: 200,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        error: validationErrors["UDA310"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDA310: "" }),
        maxLength: 30,
      },
    },
    {
      accessorKey: "UDA311",
      header: "Client Def Field Long 11",
      size: 200,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        error: validationErrors["UDA311"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDA311: "" }),
        maxLength: 30,
      },
    },
    {
      accessorKey: "UDA312",
      header: "Client Def Field Long 12",
      size: 200,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        error: validationErrors["UDA312"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDA312: "" }),
        maxLength: 30,
      },
    },
    {
      accessorKey: "UDA313",
      header: "Client Def Field Long 13",
      size: 200,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        error: validationErrors["UDA313"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDA313: "" }),
        maxLength: 30,
      },
    },
    {
      accessorKey: "UDA314",
      header: "Client Def Field Long 14",
      size: 200,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        error: validationErrors["UDA314"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDA314: "" }),
        maxLength: 30,
      },
    },
    {
      accessorKey: "UDA315",
      header: "Client Def Field Long 15",
      size: 200,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        error: validationErrors["UDA315"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDA315: "" }),
        maxLength: 30,
      },
    },
    {
      accessorKey: "UDN1",
      header: "Client Def Field Number 1",
      size: 100,
      mantineEditTextInputProps: {
        error: validationErrors["UDN1"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDN1: "" }),
        maxLength: 17,
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
    },
    {
      accessorKey: "UDN2",
      header: "Client Def Field Number 2",
      size: 100,
      mantineEditTextInputProps: {
        error: validationErrors["UDN2"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDN2: "" }),
        maxLength: 17,
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
    },
    {
      accessorKey: "UDN3",
      header: "Client Def Field Number 3",
      size: 100,
      mantineEditTextInputProps: {
        error: validationErrors["UDN3"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDN3: "" }),
        maxLength: 17,
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
    },
    {
      accessorKey: "UDN4",
      header: "Client Def Field Number 4",
      size: 100,
      mantineEditTextInputProps: {
        error: validationErrors["UDN4"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDN4: "" }),
        maxLength: 17,
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
    },
    {
      accessorKey: "UDN5",
      header: "Client Def Field Number 5",
      size: 100,
      mantineEditTextInputProps: {
        error: validationErrors["UDN5"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDN5: "" }),
        maxLength: 17,
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
    },
    {
      accessorKey: "UDN6",
      header: "Client Def Field Number 6",
      size: 100,
      mantineEditTextInputProps: {
        error: validationErrors["UDN6"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDN6: "" }),
        maxLength: 17,
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
    },
    {
      accessorKey: "UDN7",
      header: "Client Def Field Number 7",
      size: 100,
      mantineEditTextInputProps: {
        error: validationErrors["UDN7"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDN7: "" }),
        maxLength: 17,
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
    },
    {
      accessorKey: "UDN8",
      header: "Client Def Field Number 8",
      size: 100,
      mantineEditTextInputProps: {
        error: validationErrors["UDN8"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDN8: "" }),
        maxLength: 17,
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
    },
    {
      accessorKey: "UDN9",
      header: "Client Def Field Number 9",
      size: 100,
      mantineEditTextInputProps: {
        error: validationErrors["UDN9"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDN9: "" }),
        maxLength: 17,
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
    },
    {
      accessorKey: "UDN10",
      header: "Client Def Field Number 10",
      size: 100,
      mantineEditTextInputProps: {
        error: validationErrors["UDN10"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDN10: "" }),
        maxLength: 17,
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
    },
    {
      accessorKey: "UDN11",
      header: "Client Def Field Number 11",
      size: 100,
      mantineEditTextInputProps: {
        error: validationErrors["UDN11"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDN11: "" }),
        maxLength: 17,
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
    },
    {
      accessorKey: "UDN12",
      header: "Client Def Field Number 12",
      size: 100,
      mantineEditTextInputProps: {
        error: validationErrors["UDN12"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDN12: "" }),
        maxLength: 17,
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
    },
    {
      accessorKey: "UDN13",
      header: "Client Def Field Number 13",
      size: 100,
      mantineEditTextInputProps: {
        error: validationErrors["UDN13"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDN13: "" }),
        maxLength: 17,
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
    },
    {
      accessorKey: "UDN14",
      header: "Client Def Field Number 14",
      size: 100,
      mantineEditTextInputProps: {
        error: validationErrors["UDN14"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDN14: "" }),
        maxLength: 17,
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
    },
    {
      accessorKey: "UDN15",
      header: "Client Def Field Number 15",
      size: 100,
      mantineEditTextInputProps: {
        error: validationErrors["UDN15"],
        onFocus: () => setValidationErrors({ ...validationErrors, UDN15: "" }),
        maxLength: 17,
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
    },
    {
      accessorKey: "UDDATE1",
      header: "Client Def Date 1",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      // Edit mode: Show DatePickerInput
      Edit: ({ row, table, cell }) => {
        const initialDate = formatDate(row.original.UDDATE1?.toString()); // Expecting format: YYYY-MM-DD

        // State to track selected date
        const [ud1DateValue, setUd1DateValue] = useState<Date | null>(
          initialDate || new Date()
        );

        return (
          <DatePickerInput
            icon={<IconCalendar size={24} stroke={2.0} />}
            label="Client Def Date 1"
            value={ud1DateValue}
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

              setUd1DateValue(selectedDate); // Update local state

              row.original.UDDATE1 = formattedDate;

              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;

              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.UDDATE1 = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.UDDATE1 = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              }

              // Update the selected value in the table state
              const updatedRows = table.getRowModel().rows.map((r) =>
                r.id === cell.row.id
                  ? { ...r.original, UDDATE1: new Date(formattedDate) } // Update UDDATE1
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

        const formattedDate = new Date(dateValue).toLocaleDateString("en-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

        return formattedDate.replace("-", "/").replace("-", "/"); // Convert YYYY-MM-DD to YYYY/MM/DD
      },
    },
    {
      accessorKey: "UDDATE2",
      header: "Client Def Date 2",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      // Edit mode: Show DatePickerInput
      Edit: ({ row, table, cell }) => {
        const initialDate = formatDate(row.original.UDDATE2?.toString()); // Expecting format: YYYY-MM-DD

        // State to track selected date
        const [ud2DateValue, setUd2DateValue] = useState<Date | null>(
          initialDate || new Date()
        );

        return (
          <DatePickerInput
            icon={<IconCalendar size={24} stroke={2.0} />}
            label="Client Def Date 2"
            value={ud2DateValue}
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

              setUd2DateValue(selectedDate); // Update local state

              row.original.UDDATE2 = formattedDate;

              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;

              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.UDDATE2 = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.UDDATE2 = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              }

              // Update the selected value in the table state
              const updatedRows = table.getRowModel().rows.map((r) =>
                r.id === cell.row.id
                  ? { ...r.original, UDDATE2: new Date(formattedDate) } // Update UDDATE2
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

        const formattedDate = new Date(dateValue).toLocaleDateString("en-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

        return formattedDate.replace("-", "/").replace("-", "/"); // Convert YYYY-MM-DD to YYYY/MM/DD
      },
    },
    {
      accessorKey: "UDDATE3",
      header: "Client Def Date 3",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      // Edit mode: Show DatePickerInput
      Edit: ({ row, table, cell }) => {
        const initialDate = formatDate(row.original.UDDATE3?.toString()); // Expecting format: YYYY-MM-DD

        // State to track selected date
        const [ud3DateValue, setUd3DateValue] = useState<Date | null>(
          initialDate || new Date()
        );

        return (
          <DatePickerInput
            icon={<IconCalendar size={24} stroke={2.0} />}
            label="Client Def Date 3"
            value={ud3DateValue}
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

              setUd3DateValue(selectedDate); // Update local state

              row.original.UDDATE3 = formattedDate;

              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;

              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.UDDATE3 = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.UDDATE3 = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              }

              // Update the selected value in the table state
              const updatedRows = table.getRowModel().rows.map((r) =>
                r.id === cell.row.id
                  ? { ...r.original, UDDATE3: new Date(formattedDate) } // Update UDDATE3
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

        const formattedDate = new Date(dateValue).toLocaleDateString("en-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

        return formattedDate.replace("-", "/").replace("-", "/"); // Convert YYYY-MM-DD to YYYY/MM/DD
      },
    },
    {
      accessorKey: "UDDATE4",
      header: "Client Def Date 4",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      // Edit mode: Show DatePickerInput
      Edit: ({ row, table, cell }) => {
        const initialDate = formatDate(row.original.UDDATE4?.toString()); // Expecting format: YYYY-MM-DD

        // State to track selected date
        const [ud4DateValue, setUd4DateValue] = useState<Date | null>(
          initialDate || new Date()
        );

        return (
          <DatePickerInput
            icon={<IconCalendar size={24} stroke={2.0} />}
            label="Client Def Date 4"
            value={ud4DateValue}
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

              setUd4DateValue(selectedDate); // Update local state

              row.original.UDDATE4 = formattedDate;

              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;

              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.UDDATE4 = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.UDDATE4 = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              }

              // Update the selected value in the table state
              const updatedRows = table.getRowModel().rows.map((r) =>
                r.id === cell.row.id
                  ? { ...r.original, UDDATE4: new Date(formattedDate) } // Update UDDATE4
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

        const formattedDate = new Date(dateValue).toLocaleDateString("en-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

        return formattedDate.replace("-", "/").replace("-", "/"); // Convert YYYY-MM-DD to YYYY/MM/DD
      },
    },
    {
      accessorKey: "UDDATE5",
      header: "Client Def Date 5",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      // Edit mode: Show DatePickerInput
      Edit: ({ row, table, cell }) => {
        const initialDate = formatDate(row.original.UDDATE5?.toString()); // Expecting format: YYYY-MM-DD

        // State to track selected date
        const [ud5DateValue, setUd5DateValue] = useState<Date | null>(
          initialDate || new Date()
        );

        return (
          <DatePickerInput
            icon={<IconCalendar size={24} stroke={2.0} />}
            label="Client Def Date 5"
            value={ud5DateValue}
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

              setUd5DateValue(selectedDate); // Update local state

              row.original.UDDATE5 = formattedDate;

              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;

              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.UDDATE5 = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.UDDATE5 = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              }

              // Update the selected value in the table state
              const updatedRows = table.getRowModel().rows.map((r) =>
                r.id === cell.row.id
                  ? { ...r.original, UDDATE5: new Date(formattedDate) } // Update UDDATE5
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

        const formattedDate = new Date(dateValue).toLocaleDateString("en-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

        return formattedDate.replace("-", "/").replace("-", "/"); // Convert YYYY-MM-DD to YYYY/MM/DD
      },
    },
    {
      accessorKey: "UDDATE6",
      header: "Client Def Date 6",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      // Edit mode: Show DatePickerInput
      Edit: ({ row, table, cell }) => {
        const initialDate = formatDate(row.original.UDDATE6?.toString()); // Expecting format: YYYY-MM-DD

        // State to track selected date
        const [ud6DateValue, setUd6DateValue] = useState<Date | null>(
          initialDate || new Date()
        );

        return (
          <DatePickerInput
            icon={<IconCalendar size={24} stroke={2.0} />}
            label="Client Def Date 6"
            value={ud6DateValue}
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

              setUd6DateValue(selectedDate); // Update local state

              row.original.UDDATE6 = formattedDate;

              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;

              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.UDDATE6 = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.UDDATE6 = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              }

              // Update the selected value in the table state
              const updatedRows = table.getRowModel().rows.map((r) =>
                r.id === cell.row.id
                  ? { ...r.original, UDDATE6: new Date(formattedDate) } // Update UDDATE6
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

        const formattedDate = new Date(dateValue).toLocaleDateString("en-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

        return formattedDate.replace("-", "/").replace("-", "/"); // Convert YYYY-MM-DD to YYYY/MM/DD
      },
    },
    {
      accessorKey: "UDDATE7",
      header: "Client Def Date 7",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      // Edit mode: Show DatePickerInput
      Edit: ({ row, table, cell }) => {
        const initialDate = formatDate(row.original.UDDATE7?.toString()); // Expecting format: YYYY-MM-DD

        // State to track selected date
        const [ud7DateValue, setUd7DateValue] = useState<Date | null>(
          initialDate || new Date()
        );

        return (
          <DatePickerInput
            icon={<IconCalendar size={24} stroke={2.0} />}
            label="Client Def Date 7"
            value={ud7DateValue}
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

              setUd7DateValue(selectedDate); // Update local state

              row.original.UDDATE7 = formattedDate;

              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;

              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.UDDATE7 = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.UDDATE7 = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              }

              // Update the selected value in the table state
              const updatedRows = table.getRowModel().rows.map((r) =>
                r.id === cell.row.id
                  ? { ...r.original, UDDATE7: new Date(formattedDate) } // Update UDDATE7
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

        const formattedDate = new Date(dateValue).toLocaleDateString("en-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

        return formattedDate.replace("-", "/").replace("-", "/"); // Convert YYYY-MM-DD to YYYY/MM/DD
      },
    },
    {
      accessorKey: "UDDATE8",
      header: "Client Def Date 8",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      // Edit mode: Show DatePickerInput
      Edit: ({ row, table, cell }) => {
        const initialDate = formatDate(row.original.UDDATE8?.toString()); // Expecting format: YYYY-MM-DD

        // State to track selected date
        const [ud8DateValue, setUd8DateValue] = useState<Date | null>(
          initialDate || new Date()
        );

        return (
          <DatePickerInput
            icon={<IconCalendar size={24} stroke={2.0} />}
            label="Client Def Date 8"
            value={ud8DateValue}
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

              setUd8DateValue(selectedDate); // Update local state

              row.original.UDDATE8 = formattedDate;

              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;

              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.UDDATE8 = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.UDDATE8 = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              }

              // Update the selected value in the table state
              const updatedRows = table.getRowModel().rows.map((r) =>
                r.id === cell.row.id
                  ? { ...r.original, UDDATE8: new Date(formattedDate) } // Update UDDATE8
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

        const formattedDate = new Date(dateValue).toLocaleDateString("en-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

        return formattedDate.replace("-", "/").replace("-", "/"); // Convert YYYY-MM-DD to YYYY/MM/DD
      },
    },
    {
      accessorKey: "UDDATE9",
      header: "Client Def Date 9",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      // Edit mode: Show DatePickerInput
      Edit: ({ row, table, cell }) => {
        const initialDate = formatDate(row.original.UDDATE9?.toString()); // Expecting format: YYYY-MM-DD

        // State to track selected date
        const [ud9DateValue, setUd9DateValue] = useState<Date | null>(
          initialDate || new Date()
        );

        return (
          <DatePickerInput
            icon={<IconCalendar size={24} stroke={2.0} />}
            label="Client Def Date 9"
            value={ud9DateValue}
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

              setUd9DateValue(selectedDate); // Update local state

              row.original.UDDATE9 = formattedDate;

              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;

              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.UDDATE9 = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.UDDATE9 = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              }

              // Update the selected value in the table state
              const updatedRows = table.getRowModel().rows.map((r) =>
                r.id === cell.row.id
                  ? { ...r.original, UDDATE9: new Date(formattedDate) } // Update UDDATE9
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

        const formattedDate = new Date(dateValue).toLocaleDateString("en-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

        return formattedDate.replace("-", "/").replace("-", "/"); // Convert YYYY-MM-DD to YYYY/MM/DD
      },
    },
    {
      accessorKey: "UDDATE10",
      header: "Client Def Date 10",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      // Edit mode: Show DatePickerInput
      Edit: ({ row, table, cell }) => {
        const initialDate = formatDate(row.original.UDDATE10?.toString()); // Expecting format: YYYY-MM-DD

        // State to track selected date
        const [ud10DateValue, setUd10DateValue] = useState<Date | null>(
          initialDate || new Date()
        );

        return (
          <DatePickerInput
            icon={<IconCalendar size={24} stroke={2.0} />}
            label="Client Def Date 10"
            value={ud10DateValue}
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

              setUd10DateValue(selectedDate); // Update local state

              row.original.UDDATE10 = formattedDate;

              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;

              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.UDDATE10 = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.UDDATE10 = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              }

              // Update the selected value in the table state
              const updatedRows = table.getRowModel().rows.map((r) =>
                r.id === cell.row.id
                  ? { ...r.original, UDDATE10: new Date(formattedDate) } // Update UDDATE10
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

        const formattedDate = new Date(dateValue).toLocaleDateString("en-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

        return formattedDate.replace("-", "/").replace("-", "/"); // Convert YYYY-MM-DD to YYYY/MM/DD
      },
    },
    {
      accessorKey: "UDDATE11",
      header: "Client Def Date 11",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      // Edit mode: Show DatePickerInput
      Edit: ({ row, table, cell }) => {
        const initialDate = formatDate(row.original.UDDATE11?.toString()); // Expecting format: YYYY-MM-DD

        // State to track selected date
        const [ud11DateValue, setUd11DateValue] = useState<Date | null>(
          initialDate || new Date()
        );

        return (
          <DatePickerInput
            icon={<IconCalendar size={24} stroke={2.0} />}
            label="Client Def Date 11"
            value={ud11DateValue}
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

              setUd11DateValue(selectedDate); // Update local state

              row.original.UDDATE11 = formattedDate;

              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;

              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.UDDATE11 = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.UDDATE11 = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              }

              // Update the selected value in the table state
              const updatedRows = table.getRowModel().rows.map((r) =>
                r.id === cell.row.id
                  ? { ...r.original, UDDATE11: new Date(formattedDate) } // Update UDDATE11
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

        const formattedDate = new Date(dateValue).toLocaleDateString("en-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

        return formattedDate.replace("-", "/").replace("-", "/"); // Convert YYYY-MM-DD to YYYY/MM/DD
      },
    },
    {
      accessorKey: "UDDATE12",
      header: "Client Def Date 12",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      // Edit mode: Show DatePickerInput
      Edit: ({ row, table, cell }) => {
        const initialDate = formatDate(row.original.UDDATE12?.toString()); // Expecting format: YYYY-MM-DD

        // State to track selected date
        const [ud12DateValue, setUd12DateValue] = useState<Date | null>(
          initialDate || new Date()
        );

        return (
          <DatePickerInput
            icon={<IconCalendar size={24} stroke={2.0} />}
            label="Client Def Date 12"
            value={ud12DateValue}
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

              setUd12DateValue(selectedDate); // Update local state

              row.original.UDDATE12 = formattedDate;

              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;

              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.UDDATE12 = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.UDDATE12 = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              }

              // Update the selected value in the table state
              const updatedRows = table.getRowModel().rows.map((r) =>
                r.id === cell.row.id
                  ? { ...r.original, UDDATE12: new Date(formattedDate) } // Update UDDATE12
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

        const formattedDate = new Date(dateValue).toLocaleDateString("en-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

        return formattedDate.replace("-", "/").replace("-", "/"); // Convert YYYY-MM-DD to YYYY/MM/DD
      },
    },
    {
      accessorKey: "UDDATE13",
      header: "Client Def Date 13",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      // Edit mode: Show DatePickerInput
      Edit: ({ row, table, cell }) => {
        const initialDate = formatDate(row.original.UDDATE13?.toString()); // Expecting format: YYYY-MM-DD

        // State to track selected date
        const [ud13DateValue, setUd13DateValue] = useState<Date | null>(
          initialDate || new Date()
        );

        return (
          <DatePickerInput
            icon={<IconCalendar size={24} stroke={2.0} />}
            label="Client Def Date 13"
            value={ud13DateValue}
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

              setUd13DateValue(selectedDate); // Update local state

              row.original.UDDATE13 = formattedDate;

              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;

              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.UDDATE13 = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.UDDATE13 = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              }

              // Update the selected value in the table state
              const updatedRows = table.getRowModel().rows.map((r) =>
                r.id === cell.row.id
                  ? { ...r.original, UDDATE13: new Date(formattedDate) } // Update UDDATE13
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

        const formattedDate = new Date(dateValue).toLocaleDateString("en-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

        return formattedDate.replace("-", "/").replace("-", "/"); // Convert YYYY-MM-DD to YYYY/MM/DD
      },
    },
    {
      accessorKey: "UDDATE14",
      header: "Client Def Date 14",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      // Edit mode: Show DatePickerInput
      Edit: ({ row, table, cell }) => {
        const initialDate = formatDate(row.original.UDDATE14?.toString()); // Expecting format: YYYY-MM-DD

        // State to track selected date
        const [ud14DateValue, setUd14DateValue] = useState<Date | null>(
          initialDate || new Date()
        );

        return (
          <DatePickerInput
            icon={<IconCalendar size={24} stroke={2.0} />}
            label="Client Def Date 14"
            value={ud14DateValue}
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

              setUd14DateValue(selectedDate); // Update local state

              row.original.UDDATE14 = formattedDate;

              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;

              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.UDDATE14 = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.UDDATE14 = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              }

              // Update the selected value in the table state
              const updatedRows = table.getRowModel().rows.map((r) =>
                r.id === cell.row.id
                  ? { ...r.original, UDDATE14: new Date(formattedDate) } // Update UDDATE14
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

        const formattedDate = new Date(dateValue).toLocaleDateString("en-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

        return formattedDate.replace("-", "/").replace("-", "/"); // Convert YYYY-MM-DD to YYYY/MM/DD
      },
    },
    {
      accessorKey: "UDDATE15",
      header: "Client Def Date 15",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      // Edit mode: Show DatePickerInput
      Edit: ({ row, table, cell }) => {
        const initialDate = formatDate(row.original.UDDATE15?.toString()); // Expecting format: YYYY-MM-DD

        // State to track selected date
        const [ud15DateValue, setUd15DateValue] = useState<Date | null>(
          initialDate || new Date()
        );

        return (
          <DatePickerInput
            icon={<IconCalendar size={24} stroke={2.0} />}
            label="Client Def Date 15"
            value={ud15DateValue}
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

              setUd15DateValue(selectedDate); // Update local state

              row.original.UDDATE15 = formattedDate;

              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;

              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.UDDATE15 = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.UDDATE15 = formattedDate;
                table.setEditingRow(editingRow); // Ensure state is updated
              }

              // Update the selected value in the table state
              const updatedRows = table.getRowModel().rows.map((r) =>
                r.id === cell.row.id
                  ? { ...r.original, UDDATE15: new Date(formattedDate) } // Update UDDATE15
                  : r.original
              );

              setData(updatedRows); // Update table state
            }}
          />
        );
      },
      Cell: ({ cell }) => {
        const dateValue = cell.getValue<string>(); // Ensure it's a string
        if (!dateValue) return; // Handle empty values

        const formattedDate = new Date(dateValue).toLocaleDateString("en-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

        return formattedDate.replace("-", "/").replace("-", "/"); // Convert YYYY-MM-DD to YYYY/MM/DD
      },
    },
  ];
};
