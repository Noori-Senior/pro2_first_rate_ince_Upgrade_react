import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MantineReactTable, useMantineReactTable, type MRT_ColumnDef } from "mantine-react-table";
import { FetchAPI } from "../../../../api"; // make sure this is correct
import useClient from "../../../hooks/useClient";
import { Box } from "@mantine/core";

type BBRow = {
  SNAME: string;
  HID: string;
  NAMETKRJ: string;
  HUNITS: number;
  HPRINCIPAL: number;
};

const useBBColumns = (): MRT_ColumnDef<BBRow>[] => [
  {
    accessorKey: "SNAME",
    header: "Sector",
  },
  {
    accessorKey: "HID",
    header: "Asset",
  },
  {
    accessorKey: "NAMETKRJ",
    header: "Asset Name",
  },
  {
    accessorKey: "HUNITS",
    header: "Units",
    mantineTableHeadCellProps: { align: "right" },
    mantineTableBodyCellProps: { align: "right" },
  },
  {
    accessorKey: "HPRINCIPAL",
    header: "Market Value",
    mantineTableHeadCellProps: { align: "right" },
    mantineTableBodyCellProps: { align: "right" },
    Cell: ({ cell }) =>
      cell.getValue<number>()?.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
  },
];

const BeginingBalance = () => {
  const { selectedId } = useParams<{ selectedId: string }>();
  const client = useClient();

  const { data = [], isLoading, isError } = useQuery<BBRow[]>({
    queryKey: ["begining-balance", selectedId],
    queryFn: () =>
      FetchAPI(
        `IBIF_ex=frapi_aud_exceptions_mvl=${client}&IN_ID=${selectedId}`
      ),
    enabled: !! selectedId && !!client,
  });

  const columns = useBBColumns();

  const table = useMantineReactTable({
    data,
    columns,
    getRowId: (row) => row.HID,
    state: {
      isLoading,
      showAlertBanner: isError,
      showProgressBars: isLoading,
    },
  });

  return (
    <Box p="md">
      <h1>Beginning Balance for ID: {selectedId}</h1>
      <MantineReactTable table={table} />
    </Box>
  );
};

export default BeginingBalance;
