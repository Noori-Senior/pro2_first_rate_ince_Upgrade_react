import { useState } from "react";
import { type MRT_ColumnDef } from "mantine-react-table";
import { Select } from "@mantine/core";

export type PortfolioGroupsFields = {
  id: string;
  OBJECT_ID: number;
  OBJECT_DESC: string;
  COMP_ID: number;
  COUNT: number;
  RECDTYPE: string;
};


// Column definitions as a separate component
export const usePortfolioGroupsColumns = (
  setData: (data: PortfolioGroupsFields[]) => void, // 
  onCountClick: (row: PortfolioGroupsFields) => void, // 
): MRT_ColumnDef<PortfolioGroupsFields>[] => {
  const [] = useState<
    Record<string, string | "">
  >({});

  return [
    {
      accessorKey: "OBJECT_DESC",
      header: "Group Name",
      mantineTableHeadCellProps: { 
        className: 'rpt-header-3', 
        style: { width: '25%' } // Adjust width as needed
      },
      enableEditing: true,
    },
    {
     accessorKey: "COMP_ID",
     header: "Group Type",
     mantineTableHeadCellProps: { 
        className: 'rpt-header-3', 
        style: { width: '5%' } // Adjust width as needed
      },
     enableEditing: true,
     
     Edit: ({ cell, table, row }) => {
         // Convert the value to string since your options use string values
         const initialValue = cell.getValue();
         const [value, setValue] = useState<string | null>(
           initialValue !== null && initialValue !== undefined 
             ? String(initialValue) 
             : null
         );
         
         const portGrpType = ([{ label: "Static", value: "60" }, { label: "Dynamic", value: "61" }]);
         
         return (
           <Select
             label="Group Type"
             data={portGrpType}
             value={value} 
             onChange={(selectedValue) => {
               setValue(selectedValue);
               const numericValue = selectedValue ? Number(selectedValue) : 0;
               row.original.COMP_ID = numericValue;
               
               // Update creating/editing row state
               const creatingRow = table.getState().creatingRow;
               const editingRow = table.getState().editingRow;
               
               if (creatingRow && creatingRow._valuesCache) {
                 creatingRow._valuesCache.COMP_ID = numericValue;
                 table.setEditingRow(editingRow);
               } else if (editingRow && editingRow._valuesCache) {
                 editingRow._valuesCache.COMP_ID = numericValue;
                 table.setEditingRow(editingRow);
               }
               
               // Update the table data
               const updatedRows = table.getRowModel().rows.map((r) =>
                 r.id === row.id
                   ? { ...r.original, COMP_ID: numericValue }
                   : r.original
               );
               setData(updatedRows);
             }}
             searchable
             filter={(value, item) =>
               item.label?.toLowerCase().includes(value.toLowerCase().trim()) ?? false
             }
             nothingFound="No options found"
           />
         );
       },
       Cell: ({ cell }) => {
         return cell.getValue() === 60 || cell.getValue() === "60" ? 'Static' : 'Dynamic';
       },
    },
    {
      accessorKey: "COUNT",
      header: "Count",
      enableEditing: false,
      mantineEditTextInputProps: {
        style: { display: 'none' }, // Hide the default text input for editing
      },
      mantineTableHeadCellProps: { className: 'rpt-header-3' },
      Cell: ({ row }) => (
        <button
          onClick={() => onCountClick(row.original)}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            color: "#1c7ed6",
            cursor: "pointer",
            textDecoration: "underline"
          }}
        >
          {row.original.COUNT}
        </button>
      ),
    },
  ];
};

