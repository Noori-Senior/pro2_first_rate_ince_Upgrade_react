import React, { useState } from "react";
import { type MRT_ColumnDef } from "mantine-react-table";
import { Select } from "@mantine/core";
import { useMSector1DDLID, useMSector2DDLID, useIndxpkgDDL } from "../../hooks/useFrpNamesFiltersDDLsApi.js";

export type BenchmarkPackagesFields = {
  id: string;
  PKG: string;
  SORINAME: string;
  INDICES: string;
  MSECTOR1: string;
  MSNAME1: string;
  MSECTOR2: string;
  MSNAME2: string;
  GINDEX: string;
  RECDTYPE: string;
};

// Function to generate unique dropdown options dynamically
const getUniqueOptionsSingle = (rows: BenchmarkPackagesFields[], valueKey: string) => {
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
export const useBenchmarkPackagesColumns = (
  data: BenchmarkPackagesFields[],
  _setData: (data: BenchmarkPackagesFields[]) => void, // Add a setData function to update the parent state
  isEditAble: boolean,
  client: any // Assuming you have a client object for API calls
): MRT_ColumnDef<BenchmarkPackagesFields>[] => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string | "">>({});

  const msector1DDLID = useMSector1DDLID(client, "FRPIPKG2"); // Fetching the data for HDIRECT1 dropdown
  const msector2DDLID = useMSector2DDLID(client, "FRPIPKG2"); // Fetching the data for HDIRECT1 dropdown
  // Fetch Country details
  const { data: processIndxpkg } = useIndxpkgDDL(client, "INDXPKG"); // Fetching the data for INDXPkg dropdown

  return [
    {
      accessorKey: "PKG",
      enableEditing: isEditAble,
      header: "Package ID",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
    
      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(cell.getValue<string>());
        const airIndxpkg = (processIndxpkg || []).map((p) => ({ value: p.INDXPKG, label: p.INDXPKG }));
        return (
          <Select
            label="Package ID"
            data={airIndxpkg}
            value={value}
            disabled={!isEditAble}
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.PKG = selectedValue || "";
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.PKG = selectedValue;
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.PKG = selectedValue;
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Find the selected value in the options
              const selectedVal = airIndxpkg.find((option) => option.value === selectedValue);
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table.getRowModel().rows.map((r) => (r.id === cell.row.id ? { ...r.original, PKG: selectedValue || "" } : r.original));
                _setData(updatedRows);
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
      accessorKey: "INDICES",
      header: "Benchmark ID",
      enableEditing: isEditAble,
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "select",
      mantineEditSelectProps: {
        data: getUniqueOptionsSingle(data, "INDICES"),
      },
    },
    {
      accessorKey: "SORINAME",
      header: "Benchmark Name",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      enableEditing: false, // Make this column non-editable
    },
    {
      accessorKey: "MSECTOR1",
      header: "Model Sector 1 ID",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },

      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(cell.getValue<string>());
        const benchmarkModelSector1 = (msector1DDLID.data ?? []).map((msector1: any) => ({
          value: msector1.MSECTOR1,
          label: msector1.MSNAME1 + ` ( ${msector1.MSECTOR1} )`,
        }));
        return (
          <Select
            label="Model Sector 1 ID"
            data={benchmarkModelSector1}
            value={value}
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.MSECTOR1 = selectedValue || ""; // Update the original data
              // determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.MSECTOR1 = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.MSECTOR1 = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Update the original data with the selected value
              const selectedVal = benchmarkModelSector1.find((option) => option.value === selectedValue);
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table.getRowModel().rows.map((r) =>
                  r.id === cell.row.id
                    ? {
                        ...r.original,
                        MSNAME1: selectedVal ? selectedVal.label.split("(")[0] : "",
                        MSECTOR1: selectedValue ? selectedValue : "",
                      }
                    : r.original
                );
                _setData(updatedRows);
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
      accessorKey: "MSNAME1",
      header: "Model Sector 1 Name",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      enableEditing: false, // Make this column non-editable
    },
    {
      accessorKey: "MSECTOR2",
      header: "Model Sector 2 ID",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },

      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(cell.getValue<string>());
        const benchmarkModelSector2 = (msector2DDLID.data ?? []).map((msector2: any) => ({
          value: msector2.MSECTOR2,
          label: msector2.MSNAME2 + ` ( ${msector2.MSECTOR2} )`,
        }));
        return (
          <Select
            label="Model Sector 2 ID"
            data={benchmarkModelSector2}
            value={value}
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.MSECTOR2 = selectedValue || ""; // Update the original data
              // determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.MSECTOR2 = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.MSECTOR2 = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Update the original data with the selected value
              const selectedVal = benchmarkModelSector2.find((option) => option.value === selectedValue);
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table.getRowModel().rows.map((r) =>
                  r.id === cell.row.id
                    ? {
                        ...r.original,
                        MSNAME2: selectedVal ? selectedVal.label.split("(")[0] : "",
                        MSECTOR2: selectedValue ? selectedValue : "",
                      }
                    : r.original
                );
                _setData(updatedRows);
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
      accessorKey: "MSNAME2",
      header: "Model Sector 2 Name",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      enableEditing: false, // Make this column non-editable
    },
    {
      accessorKey: "GINDEX",
      header: "Graph ID",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        type: "text",
        maxLength: 10,
      },
    },
  ];
};
