import { type MRT_ColumnDef } from "mantine-react-table";



export type MVLFields = {
  id: string;
  SNAME: string;
  HID: string;
  NAMETKRJ: string;
  HUNITS: number;
  HPRINCIPAL: number;
};

export const useMVLColumns = (): MRT_ColumnDef<MVLFields>[] => [
  { accessorKey: 'SNAME', header: 'Sector' },
  { accessorKey: 'HID', header: 'Asset' },
  { accessorKey: 'NAMETKRJ', header: 'Asset Name' },
  { accessorKey: 'HUNITS', header: 'Units' },
  { accessorKey: 'HPRINCIPAL', header: 'Market Value' },
];
