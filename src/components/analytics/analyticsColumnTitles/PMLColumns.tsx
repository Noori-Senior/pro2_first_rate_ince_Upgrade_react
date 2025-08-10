import { type MRT_ColumnDef } from "mantine-react-table";
import { useState } from "react";

export type PMLFields = {
  id: string;
  ACCT: string;
  NAME: string;
  RECDTYPE: string;
};

// Column definitions as a separate component
export const usePMLColumns = (
): MRT_ColumnDef<PMLFields>[] => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string | ''>>({});
  return [
    {
        accessorKey: 'ACCT', 
        header: 'ID',
        mantineTableHeadCellProps: {
          className: 'rpt-header-3',
        },
      },
      {
        accessorKey: 'NAME', 
        header: 'Name',
        editVariant: 'text',
        mantineEditTextInputProps: {
          type: 'text',
          error: validationErrors['NAME'],
          onFocus: () => setValidationErrors({...validationErrors, NAME: ''}),
          maxLength: 48,
        },
        size: 250,
        mantineTableHeadCellProps: {
          className: 'rpt-header-3',
        },
      },
  ];
};
