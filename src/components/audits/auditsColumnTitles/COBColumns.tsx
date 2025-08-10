import { type MRT_ColumnDef } from "mantine-react-table";

export type COBFields = {
  id: string;
  ACCT: string;
  ICPDATE: string | Date;
  COUNTRY: string;
  BAL: number;
  BEGMKT: number;
  NETFLOW: number;
  ENDMKT: number;
  RECDTYPE: string;
  children?: COBFields[];
};

export type BalanceColumn = "BEGMKT" | "NETFLOW" | "ENDMKT";

export const useCOBColumns = (
  onColumnClick: (row: COBFields, column: BalanceColumn) => void
): MRT_ColumnDef<COBFields>[] => {
  const formatNumber = (val: number) =>
    val?.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const clickableCell = (column: BalanceColumn) => ({
    Cell: ({ cell, row }) => (
      <span
        style={{
          cursor: "pointer",
          textDecoration: "underline",
          color: "blue",
        }}
        onClick={() => onColumnClick(row.original, column)}
      >
        {formatNumber(cell.getValue())}
      </span>
    ),
  });

  return [
    { accessorKey: "ACCT", header: "Portfolio ID" },
    { accessorKey: "ICPDATE", header: "Inception Date" },
    { accessorKey: "COUNTRY", header: "Country" },
    {
      accessorKey: "BAL",
      header: "Over(+) Under(-)",
      mantineTableBodyCellProps: { align: "right" },
      Cell: ({ cell }) => formatNumber(cell.getValue<number>()),
    },
    {
      accessorKey: "BEGMKT",
      header: "Beginning Balance",
      mantineTableBodyCellProps: { align: "right" },
      ...clickableCell("BEGMKT"),
    },
    {
      accessorKey: "NETFLOW",
      header: "Net Flows",
      mantineTableBodyCellProps: { align: "right" },
      ...clickableCell("NETFLOW"),
    },
    {
      accessorKey: "ENDMKT",
      header: "Ending Balance",
      mantineTableBodyCellProps: { align: "right" },
      ...clickableCell("ENDMKT"),
    },
  ];
};
