import React, { useState } from "react";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Button,
  Modal,
  Text,
  Group,
  Breadcrumbs,
  Anchor,
  MultiSelect,
} from "@mantine/core";
import { FetchAPI } from "../../../api";
import useClient from "../../hooks/useClient";
import {
  useCOBColumns,
  COBFields,
  BalanceColumn,
} from "../auditsColumnTitles/COBColumns.tsx";
import {
  begmktColumns,
  netflowColumns,
  endmktColumns,
} from "../auditsColumnTitles/drilldownColumns.tsx";
import { MRT_ColumnDef } from "mantine-react-table";

const FrpAuditExceptions = () => {
  const client = useClient();

  // 🔧 NEW: Truncate asofdt to YYYYMM
  const formatDateToYYYYMM = (date: string | Date): string => {
    try {
      const d = new Date(date);
      return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
    } catch (error) {
      console.error("Invalid date for IN_asofdt:", date);
      return "";
    }
  };

  const [drillParams, setDrillParams] = useState<{
    id: string;
    acct: string;
    asofdt: string;
    cntry: string;
    type: BalanceColumn | null;
  }>({ id: "", acct: "", asofdt: "", cntry: "", type: null });

  const [tableType, setTableType] = useState<"main" | "drill">("main");
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

  const cobColumns = useCOBColumns(handleColumnClick);

  const mainQuery = useQuery<COBFields[]>({
    queryKey: ["main-table"],
    queryFn: async () => {
      const data = await FetchAPI(
        `IBIF_ex=frapi_aud_exceptions_cob&CLIENT=${client}`
      );

      return data.map((row: any) => ({
        ...row,
        id: row.ACCT,
        ICPDATE: row.ICPDATED,
      }));
    },
    enabled: !!client && tableType === "main",
  });

  const drillQuery = useQuery<any[]>({
    queryKey: ["drill", drillParams],
    queryFn: () => {
      let ibifex = "";
      switch (drillParams.type) {
        case "BEGMKT":
        case "NETFLOW":
          ibifex = "frapi_aud_exceptions_mvl";
          break;
        case "ENDMKT":
          ibifex = "frapi_aud_exceptions_teop";
          break;
        default:
          return Promise.resolve([]);
      }

      console.log("Drill Fetch Params:", drillParams);
      console.log(
        "Drilldown API URL",
        `IBIF_ex=${ibifex}&CLIENT=${client}&IN_ID=${drillParams.id}&IN_acct=${drillParams.acct}&IN_asofdt=${drillParams.asofdt}&IN_cntry=${drillParams.cntry}`
      );

      return FetchAPI(
        `IBIF_ex=${ibifex}&CLIENT=${client}&IN_ID=${drillParams.id}&IN_acct=${drillParams.acct}&IN_asofdt=${drillParams.asofdt}&IN_cntry=${drillParams.cntry}`
      );
    },
    enabled: !!client && drillParams.id !== "" && tableType === "drill",
  });

  function handleColumnClick(row: COBFields, column: BalanceColumn) {
    console.log("Row clicked:", row);
    setDrillParams({
      id: row.id,
      acct: row.ACCT,
      cntry: row.COUNTRY,
      asofdt: formatDateToYYYYMM(row.ICPDATE), // ✅ updated here
      type: column,
    });
    setTableType("drill");
  }

  const drillType = drillParams.type;

  const baseColumns: MRT_ColumnDef<any>[] =
    drillType === "BEGMKT"
      ? begmktColumns
      : drillType === "NETFLOW"
      ? netflowColumns
      : endmktColumns;

  const columns: MRT_ColumnDef<any>[] =
    tableType === "main"
      ? (cobColumns as MRT_ColumnDef<any>[])
      : baseColumns.filter((col) =>
          visibleColumns.length
            ? visibleColumns.includes(col.accessorKey!)
            : true
        );

  const data =
    tableType === "main" ? mainQuery.data ?? [] : drillQuery.data ?? [];

  const table = useMantineReactTable({
    data,
    columns,
  });

  const drillColumnOptions = baseColumns.map((col) => ({
    value: col.accessorKey!,
    label: col.header as string,
  }));

  return (
    <Box p="md">
      <Breadcrumbs mb="md">
        <Anchor onClick={() => setTableType("main")}>Main Table</Anchor>
        {tableType === "drill" && drillParams.type && (
          <Text c="dimmed">{drillParams.type} Drill</Text>
        )}
      </Breadcrumbs>

      {tableType === "drill" && (
        <MultiSelect
          mb="md"
          label="Visible Columns"
          data={drillColumnOptions}
          value={visibleColumns}
          onChange={setVisibleColumns}
          placeholder="Select columns to display"
          clearable
        />
      )}

      {tableType === "drill" && (
        <Button mb="md" onClick={() => setTableType("main")}>
          ← Back to Main Table
        </Button>
      )}

      <MantineReactTable table={table} />

      <Modal
        opened={!!selectedRow}
        onClose={() => setSelectedRow(null)}
        title="Row Details"
        size="lg"
      >
        {selectedRow &&
          Object.entries(selectedRow).map(([key, value]) => (
            <Group key={key} position="apart">
              <Text fw={500}>{key}:</Text>
              <Text>{String(value)}</Text>
            </Group>
          ))}
      </Modal>
    </Box>
  );
};

export default FrpAuditExceptions;
