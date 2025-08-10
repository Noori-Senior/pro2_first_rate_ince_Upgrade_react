import { type MRT_ColumnDef } from "mantine-react-table";
import {
  useISector1DDLID,
  useISector2DDLID,
  useISector3DDLID,
} from "../../hooks/useFrpNamesFiltersDDLsApi";
import { useState } from "react";
import { Select } from "@mantine/core";

export type AssetTypesFields = {
  id: string;
  ASSETTYPE: string;
  INDUSMINMAX: string;
  ISECTOR: string;
  SNAME1: string;
  ACCRTYPE: string;
  PRICEDISC: number;
  STMTCATEGORY: string;
  MAJRCATEGORY: string;
  ATNAME: string;
  ATYPE2: string;
  ISECTOR2: string;
  SNAME2: string;
  ISECTOR3: string;
  SNAME3: string;
  RECDTYPE: string;
};

// Column definitions as a separate component
export const useAssetTypesColumns = (
  _data: AssetTypesFields[],
  _setData: (data: AssetTypesFields[]) => void, // Add a setData function to update the parent state
  isEditAble: boolean,
  validationErrors: Record<string, string>, // Add this parameter
  client: any // Assuming you have a client object for API calls
): MRT_ColumnDef<AssetTypesFields>[] => {
  const isector1DDLID = useISector1DDLID(client, "FRPATYPE"); // Fetching the data for HDIRECT1 dropdown
  const isector2DDLID = useISector2DDLID(client, "FRPATYPE"); // Fetching the data for HDIRECT1 dropdown
  const isector3DDLID = useISector3DDLID(client, "FRPATYPE"); // Fetching the data for HDIRECT1 dropdown
  return [
    {
      accessorKey: "ASSETTYPE",
      header: "Asset Type",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        type: "text",
        required: true,
        error: validationErrors["ASSETTYPE"], // Use passed error
        onFocus: () => {}, // Remove local state update
        maxLength: 9,
      },
      enableEditing: isEditAble,
      size: 20,
    },
    {
      accessorKey: "INDUSMINMAX",
      header: "Industry Minimum / Maximum",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        type: "text",
        required: true,
        error: validationErrors["INDUSMINMAX"], // Use passed error
        onFocus: () => {}, // Remove local state update
        maxLength: 20,
      },
      enableEditing: isEditAble,
      size: 200,
    },
    {
      accessorKey: "ISECTOR",
      header: "Sector 1 ID",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },

      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(
          cell.getValue<string>()
        );
        const aTypeSector1 = (isector1DDLID.data ?? []).map(
          (isector1: any) => ({
            value: isector1.ISECTOR,
            label: isector1.SNAME1 + ` ( ${isector1.ISECTOR} )`,
          })
        );
        return (
          <Select
            label="Sector 1 ID"
            data={aTypeSector1}
            value={value}
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.ISECTOR = selectedValue || ""; // Update the original data
              // determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.ISECTOR = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.ISECTOR = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Update the original data with the selected value
              const selectedVal = aTypeSector1.find(
                (option) => option.value === selectedValue
              );
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table.getRowModel().rows.map((r) =>
                  r.id === cell.row.id
                    ? {
                        ...r.original,
                        SNAME1: selectedVal
                          ? selectedVal.label.split("(")[0]
                          : "",
                        ISECTOR: selectedValue ? selectedValue : "",
                      }
                    : r.original
                );
                _setData(updatedRows);
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
      accessorKey: "SNAME1",
      header: "Sector 1 Name",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      enableEditing: false, // Make this column non-editable
    },
    {
      accessorKey: "ACCRTYPE",
      header: "Accrual Type",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        type: "text",
        maxLength: 2,
      },
      size: 20,
    },
    {
      accessorKey: "PRICEDISC",
      header: "Pricing Discipline",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
        align: "right",
      },
      mantineEditTextInputProps: {
        type: "number",
        maxLength: 20,
      },
      mantineTableBodyCellProps: {
        align: "right",
      },
      Cell: ({ cell }) =>
        cell.getValue<number>()?.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      size: 20,
    },

    {
      accessorKey: "STMTCATEGORY",
      header: "Statement Category",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        type: "text",
        maxLength: 4,
      },
      size: 20,
    },
    {
      accessorKey: "MAJRCATEGORY",
      header: "Major Category",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        type: "text",
        maxLength: 4,
      },
      size: 20,
    },
    {
      accessorKey: "ATNAME",
      header: "Asset Name",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        type: "text",
        maxLength: 20,
      },
      size: 20,
    },
    {
      accessorKey: "ATYPE2",
      header: "Asset Type 2",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      mantineEditTextInputProps: {
        type: "text",
        maxLength: 10,
      },
      size: 20,
    },
    {
      accessorKey: "ISECTOR2",
      header: "Sector 2 ID",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },

      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(
          cell.getValue<string>()
        );
        const aTypeSector2 = (isector2DDLID.data ?? []).map(
          (isector2: any) => ({
            value: isector2.ISECTOR2,
            label: isector2.SNAME2 + ` ( ${isector2.ISECTOR2} )`,
          })
        );
        return (
          <Select
            label="Sector 2 ID"
            data={aTypeSector2}
            value={value}
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.ISECTOR2 = selectedValue || ""; // Update the original data
              // determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.ISECTOR2 = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.ISECTOR2 = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Update the original data with the selected value
              const selectedVal = aTypeSector2.find(
                (option) => option.value === selectedValue
              );
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table.getRowModel().rows.map((r) =>
                  r.id === cell.row.id
                    ? {
                        ...r.original,
                        SNAME2: selectedVal
                          ? selectedVal.label.split("(")[0]
                          : "",
                        ISECTOR2: selectedValue ? selectedValue : "",
                      }
                    : r.original
                );
                _setData(updatedRows);
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
      accessorKey: "SNAME2",
      header: "Sector 2 Name",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      enableEditing: false, // Make this column non-editable
    },

    {
      accessorKey: "ISECTOR3",
      header: "Sector 3 ID",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },

      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(
          cell.getValue<string>()
        );
        const aTypeSector3 = (isector3DDLID.data ?? []).map(
          (isector3: any) => ({
            value: isector3.ISECTOR3,
            label: isector3.SNAME3 + ` ( ${isector3.ISECTOR3} )`,
          })
        );
        return (
          <Select
            label="Sector 3 ID"
            data={aTypeSector3}
            value={value}
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.ISECTOR3 = selectedValue || ""; // Update the original data
              // determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.ISECTOR3 = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.ISECTOR3 = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Update the original data with the selected value
              const selectedVal = aTypeSector3.find(
                (option) => option.value === selectedValue
              );
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table.getRowModel().rows.map((r) =>
                  r.id === cell.row.id
                    ? {
                        ...r.original,
                        SNAME3: selectedVal
                          ? selectedVal.label.split("(")[0]
                          : "",
                        ISECTOR3: selectedValue ? selectedValue : "",
                      }
                    : r.original
                );
                _setData(updatedRows);
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
      accessorKey: "SNAME3",
      header: "Sector 3 Name",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      enableEditing: false, // Make this column non-editable
    },
  ];
};
