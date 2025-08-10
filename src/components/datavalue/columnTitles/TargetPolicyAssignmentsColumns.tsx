import { useState } from "react";
import { type MRT_ColumnDef } from "mantine-react-table";
import { Select } from "@mantine/core";
import { useTargetPolicyAssignmentDDL } from "../../hooks/useFrpNamesFiltersDDLsApi";

export type TargetPolicyAssignmentsFields = {
  id: string;
  ACCT: string;
  NAME: string;
  SECTOR: string;
  SORINAME: string;
  INDX: string;
  INDXNAME: string;
  POLICY: number;
  MINVAR: number;
  MAXVAR: number;
  RECDTYPE: string;
};


// Column definitions as a separate component
export const useTargetPolicyAssignmentsColumns = (
  data: TargetPolicyAssignmentsFields[],
  setData: (data: TargetPolicyAssignmentsFields[]) => void, // Add a setData function to update the parent state
  isEditable: boolean,
  client: any,
): MRT_ColumnDef<TargetPolicyAssignmentsFields>[] => {
    // Fetch the dropdown data for ACCT
  const { data: acbncACCTs } = useTargetPolicyAssignmentDDL(client, "ACCT");
    // Fetch the dropdown data for SECTOR
  const { data: acbncSectors } = useTargetPolicyAssignmentDDL(client, "SECTOR");
    // Fetch the dropdown data for INDX
  const { data: acbncINDXs } = useTargetPolicyAssignmentDDL(client, "INDX");

  return [
    {
      accessorKey: "ACCT",
      header: "Portfolio ID",
      enableEditing: isEditable,
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      
      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(cell.getValue<string>());

        // Remove duplicates from acbncACCTs before mapping
        const uniqueACBNCACCTs = Array.from(
          new Map((acbncACCTs ?? []).map(acct => [acct.ACCT, acct])).values()
        );
      
        const acbncACCTData = Array.from(uniqueACBNCACCTs).map((acct: any) => ({
          value: acct.ACCT,
          label: acct.NAME + ` (${acct.ACCT})`, // Use NAME if available, otherwise show 'Name not Defined'
          key: acct.ACCT + (acct.id || '') // Ensure unique key
        }));

        return (
          <Select
            label="Portfolio ID"
            required
            data={acbncACCTData}
            value={value} 
            disabled={!isEditable} // Disable if not editable
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.ACCT = selectedValue || ''; // Update the original data
              // determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.ACCT = selectedValue || '';
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.ACCT = selectedValue || '';
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Update the original data with the selected value
              const selectedVal = acbncACCTData.find((option) => option.value === selectedValue);
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table.getRowModel().rows.map((r) =>
                  r.id === cell.row.id
                ? { 
                    ...r.original, 
                    NAME: selectedVal ? selectedVal.label.split('(')[0] : '', 
                    ACCT: selectedValue ? selectedValue : '' 
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
      accessorKey: "NAME",
      header: "Portfolio Name",
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      enableEditing: false,
      size: 250,
    },
    {
      accessorKey: 'SECTOR', 
      header: 'Sector',
      enableEditing: isEditable,
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },

      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(cell.getValue<string>());

        // Remove duplicates from acbncSectors before mapping
        const uniqueACBNCSECTORs = Array.from(
          new Map((acbncSectors ?? []).map(sector => [sector.SECTOR, sector])).values()
        );
      
        const acbncSECTORData = Array.from(uniqueACBNCSECTORs).map((sector: any) => ({
          value: sector.SECTOR,
          label: sector.SORINAME + ` (${sector.SECTOR})`,
          key: sector.SECTOR + (sector.id || '') // Ensure unique key
        }));

        return (
          <Select
            label="Sector"
            required
            data={acbncSECTORData}
            value={value} 
            disabled={!isEditable} // Disable if not editable
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.SECTOR = selectedValue || ''; // Update the original data
              // determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.SECTOR = selectedValue || '';
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.SECTOR = selectedValue || '';
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Update the original data with the selected value
              const selectedVal = acbncSECTORData.find((option) => option.value === selectedValue);
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table.getRowModel().rows.map((r) =>
                  r.id === cell.row.id
                ? { 
                    ...r.original, 
                    SORINAME: selectedVal ? selectedVal.label.split('(')[0] : '', 
                    SECTOR: selectedValue ? selectedValue : '' 
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
      accessorKey: "SORINAME",
      header: "Sector Name",
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      enableEditing: false,
      size: 250,
    },
    {
      accessorKey: 'INDX', 
      header: 'Benchmark ID',
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },

      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(cell.getValue<string>());

        // Remove duplicates from acbncINDXs before mapping
        const uniqueACBNCINDXs = Array.from(
          new Map((acbncINDXs ?? []).map(indx => [indx.INDX, indx])).values()
        );
      
        const acbncINDXData = Array.from(uniqueACBNCINDXs).map((indx: any) => ({
          value: indx.INDX,
          label: indx.SORINAME + ` (${indx.INDX})`,
          key: indx.INDX + (indx.id || '') // Ensure unique key
        }));

        return (
          <Select
            label="Benchmark ID"
            data={acbncINDXData}
            value={value} 
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.INDX = selectedValue || ''; // Update the original data
              // determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.INDX = selectedValue || '';
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.INDX = selectedValue || '';
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Update the original data with the selected value
              const selectedVal = acbncINDXData.find((option) => option.value === selectedValue);
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table.getRowModel().rows.map((r) =>
                  r.id === cell.row.id
                ? { 
                    ...r.original, 
                    INDXNAME: selectedVal ? selectedVal.label.split('(')[0] : '',
                    INDX: selectedValue ? selectedValue : ''
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
      accessorKey: "INDXNAME",
      header: "Benchmark Name",
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
      enableEditing: false,
      size: 250,
    },
    {
      accessorKey: "POLICY",
      header: "Policy",
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "number",
        maxLength: 8,
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
      accessorKey: "MINVAR",
      header: "Min Variance",
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "number",
        maxLength: 8,
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
      accessorKey: "MAXVAR",
      header: "Max Variance",
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "number",
        maxLength: 8,
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

  ];
};
