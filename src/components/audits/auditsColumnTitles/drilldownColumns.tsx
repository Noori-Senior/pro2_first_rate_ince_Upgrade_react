import { type MRT_ColumnDef } from "mantine-react-table";

export const begmktColumns: MRT_ColumnDef<any>[] = [
  { accessorKey: "PNAME", header: "Portfolio" },
  { accessorKey: "SNAME", header: "Security Name" },
  { accessorKey: "COUNTRY", header: "Country" },
  { accessorKey: "HID", header: "HID" },
  { accessorKey: "NAMETKRJ", header: "Name TKRJ" },
  { accessorKey: "HUNITS", header: "Units" },
  { accessorKey: "HPRINCIPAL", header: "Principal" },
  { accessorKey: "HACCRUAL", header: "Accrual" },
  { accessorKey: "AACCT", header: "Account" },
  { accessorKey: "ADATEYMD", header: "Date" },
];

export const netflowColumns: MRT_ColumnDef<any>[] = [
  { accessorKey: "Sector", header: "Sector" },
  { accessorKey: "Asset", header: "Asset" },
  { accessorKey: "AssetName", header: "Asset Name" },
  { accessorKey: "Units", header: "Units" },
  { accessorKey: "MarketValue", header: "Market Value" },
  { accessorKey: "Accrual", header: "Accrual" },
];

export const endmktColumns: MRT_ColumnDef<any>[] = [...begmktColumns];
