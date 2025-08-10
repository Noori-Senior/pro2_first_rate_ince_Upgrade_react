import React, { useState } from "react";
import { MRT_EditActionButtons, MantineReactTable, type MRT_Row, type MRT_TableOptions, useMantineReactTable, createRow } from "mantine-react-table";
import { ActionIcon, Button, Flex, Text, Tooltip, Divider, Menu, Modal, Stack, Title } from "@mantine/core";
import { CopyIcon, EXPORT_SVG, AiIcon } from "../../../svgicons/svgicons.js";
import { ModalsProvider, modals } from "@mantine/modals";
import { IconEdit, IconTrash, IconPlus, IconRefresh } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import { FetchAPI, FetchUpdateDeleteAPI, FetchUpdateDeleteAPIExcel } from "../../../api.js";
import useClient from "../../hooks/useClient.js";
import { IndexFields, useIndexColumns } from "../columnTitles/IndexColumns.tsx";
import { formatFromDateYYMD, formatDateYYM, formatToDateYYMMDD, formatFromDateYYM, formatToDateYYM, formatDateYYMD } from "../../hooks/FormatDates.tsx";
import { v4 as uuidv4 } from "uuid";
import { mkConfig, generateCsv, download } from "export-to-csv";

import { compareData } from "../../report-components/compareData.js";
import { Import } from "../../report-components/Import.js";
import { Export } from "../../report-components/Export.js";
import { PredictNumColumn } from "../../../aiAgents/PredictNumColumn.js";
import { useBenchmarkName } from "../../hooks/useFrpNamesFiltersDDLsApi.js";

type DateRange = string[];

type OutletContextType = {
  selectedPortfolio: string;
  setSelectedPortfolio: (portfolio: string) => void;
  dateRange: DateRange;
};

type IndexTableProps = {
  isDaily: boolean;
};

const IndexMTable = ({ isDaily }: IndexTableProps) => {
  const [finalData, setFinalData] = useState<IndexFields[]>([]);
  const [excelData, setExcelData] = useState<IndexFields[]>([]);
  const [isUsingExcelData, setIsUsingExcelData] = useState(false);
  const [isEditAble, setIsEditable] = useState<boolean>(false);

  const client = useClient();
  const delim = process.env.REACT_APP_DELIMITER;

  const { dateRange } = useOutletContext<OutletContextType>();

  // Choose appropriate date formatters based on isDaily flag
  const fromDate = isDaily ? formatFromDateYYMD(dateRange as [string, string]) : formatFromDateYYM(dateRange as [string, string]);

  const toDate = isDaily ? formatToDateYYMMDD(dateRange as [string, string]) : formatToDateYYM(dateRange as [string, string]);

  const { data: benchmarkNameData } = useBenchmarkName(client);

  const tableName = isDaily ? "FRPINDXD" : "FRPINDX";
  const indexUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=${tableName}&filters=IDATE(GT:${fromDate}:AND:IDATE:LE:${toDate})`;

  const {
    data: fetchedIndexs = [],
    isError: isLoadingIndexsError,
    isFetching: isFetchingIndexs,
    isLoading: isLoadingIndexs,
  } = useQuery<IndexFields[]>({
    queryKey: [`${isDaily ? "daily" : "monthly"}Index`, dateRange, client, benchmarkNameData],
    queryFn: async () => {
      const data = await FetchAPI(indexUri);

      return data.map((row) => {
        const matchedBenchmark = benchmarkNameData?.find((benchmark) => benchmark.SORI.trim() === row.INDX.trim());
        const matchedBenchmarkName = matchedBenchmark?.SORINAME === undefined ? "Name Not Defined" : matchedBenchmark?.SORINAME;

        return {
          ...row,
          id: row.id || uuidv4(),
          SORINAME: matchedBenchmarkName,
        };
      });
    },
    enabled: !!dateRange && !!client && !!benchmarkNameData,
    refetchOnWindowFocus: false,
  });

  const keyFields = ["INDX", "IDATE"];
  const nonKeyFields = [];
  const numericFields = ["IPRICE", "IINC", "IRET"];

  React.useEffect(() => {
    if (isUsingExcelData && excelData.length > 0) {
      setFinalData(compareData(excelData, fetchedIndexs, keyFields, nonKeyFields, numericFields));
      setIsUsingExcelData(false);
    } else if (fetchedIndexs && fetchedIndexs.length > 0) {
      setFinalData(fetchedIndexs);
    } else if (finalData.length !== 0) {
      setFinalData([]);
    }
  }, [excelData, fetchedIndexs]);

  const portfolioName = "";
  const columns = useIndexColumns(finalData, setFinalData, isEditAble, isDaily);

  const queryClient = useQueryClient();

  const { mutateAsync: createIndex, isPending: isCreatingIndex } = useMutation({
    mutationFn: async (createdIndex: IndexFields) => {
      const editDataInCSV = `A${delim}${createdIndex.INDX}${delim}${createdIndex.IDATE?.toString().replace(/\//g, "")}
      ${delim}${createdIndex.IPRICE}${delim}${createdIndex.IINC}${delim}${createdIndex.IRET}
    `;
      await FetchUpdateDeleteAPI(
        editDataInCSV
          .replace(/[\r\n]+/g, "")
          .replace(/\s*\|\s*/g, "|")
          .replace(/\|null\|/g, "||"),
        `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=${tableName}`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return createdIndex;
    },
    onMutate: async (newIndex: IndexFields) => {
      await queryClient.cancelQueries({
        queryKey: [`${isDaily ? "daily" : "monthly"}Index`, dateRange, client, benchmarkNameData],
      });

      const previousIndexs = queryClient.getQueryData<IndexFields[]>([`${isDaily ? "daily" : "monthly"}Index`, dateRange, client, benchmarkNameData]) || [];

      queryClient.setQueryData([`${isDaily ? "daily" : "monthly"}Index`, dateRange, client, benchmarkNameData], (old: IndexFields[] | undefined) => [
        ...(old ?? []),
        {
          ...newIndex,
          id: uuidv4(),
          SORINAME: benchmarkNameData?.find((benchmark) => benchmark.SORI.trim() === newIndex.INDX.trim())?.SORINAME || "Name Not Defined",
        },
      ]);

      return { previousIndexs };
    },
  });

  const { mutateAsync: updateIndex, isPending: isUpdatingIndex } = useMutation({
    mutationFn: async (updatedIndex: IndexFields) => {
      const editDataInCSV = `C${delim}${updatedIndex.INDX}${delim}${updatedIndex.IDATE?.toString().replace(/\//g, "")}
      ${delim}${updatedIndex.IPRICE}${delim}${updatedIndex.IINC}${delim}${updatedIndex.IRET}
    `;
      await FetchUpdateDeleteAPI(
        editDataInCSV
          .replace(/[\r\n]+/g, "")
          .replace(/\s*\|\s*/g, "|")
          .replace(/\|null\|/g, "||"),
        `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=${tableName}`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return updatedIndex;
    },
    onMutate: async (updatedIndex: IndexFields) => {
      await queryClient.cancelQueries({
        queryKey: [`${isDaily ? "daily" : "monthly"}Index`],
      });
      const previousIndexs = queryClient.getQueryData<IndexFields[]>([`${isDaily ? "daily" : "monthly"}Index`]);
      queryClient.setQueryData([`${isDaily ? "daily" : "monthly"}Index`], (old: IndexFields[] = []) => old.map((h) => (h.id === updatedIndex.id ? updatedIndex : h)));
      return { previousIndexs };
    },
  });

  const { mutateAsync: deleteIndex, isPending: isDeletingIndex } = useMutation({
    mutationFn: async ({ indexId, INDX, IDATE }: { indexId: string; INDX: string; IDATE: string }) => {
      const editDataInCSV = `D${delim}${INDX}${delim}${IDATE?.toString().replace(/\//g, "")}`;
      await FetchUpdateDeleteAPI(
        editDataInCSV
          .replace(/[\r\n]+/g, "")
          .replace(/\s*\|\s*/g, "|")
          .replace(/\|null\|/g, "||"),
        `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=${tableName}`
      );
      await new Promise((resolve) => setTimeout(resolve, 100));
      return Promise.resolve(indexId);
    },
    onMutate: async ({ indexId }) => {
      await queryClient.cancelQueries({
        queryKey: [`${isDaily ? "daily" : "monthly"}Index`, dateRange, client, benchmarkNameData],
      });

      const previousIndexs = queryClient.getQueryData<IndexFields[]>([`${isDaily ? "daily" : "monthly"}Index`, dateRange, client, benchmarkNameData]);

      queryClient.setQueryData([`${isDaily ? "daily" : "monthly"}Index`, dateRange, client, benchmarkNameData], (old: IndexFields[] = []) => {
        const newData = old.filter((h: IndexFields) => h.id !== indexId);
        console.log("New Data After Deletion:", newData);
        return newData;
      });

      return { previousIndexs };
    },
  });

  const handleCreateIndex: MRT_TableOptions<IndexFields>["onCreatingRowSave"] = async ({ values, exitCreatingMode }) => {
    const formattedValues = {
      ...values,
      IDATE: values.IDATE === "" || null ? (isDaily ? "19000101" : "190012") : isDaily ? formatDateYYMD(values.IDATE) : formatDateYYM(values.IDATE),
    };

    const errors = validateIndex(values);
    if (Object.values(errors).some(Boolean)) {
      return;
    }

    await createIndex(formattedValues);
    exitCreatingMode();
    table.setCreatingRow(null);
  };

  const handleSaveIndex: MRT_TableOptions<IndexFields>["onEditingRowSave"] = async ({ table, values }) => {
    const formattedValues = {
      ...values,
      IDATE: isDaily ? formatDateYYMD(values.IDATE) : formatDateYYM(values.IDATE),
    };

    const errors = validateIndex(values);
    if (Object.values(errors).some(Boolean)) {
      return;
    }

    await updateIndex(formattedValues);
    table.setEditingRow(null);
  };

  const openDeleteConfirmModal = (row: MRT_Row<IndexFields>) => {
    modals.openConfirmModal({
      title: "Delete Benchmark?",
      children: (
        <Text>
          Delete {row.original.SORINAME} ({row.original.INDX}), As Of Date ({row.original.IDATE.toString()})?
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        deleteIndex({
          indexId: row.original.id,
          INDX: row.original.INDX,
          IDATE: row.original.IDATE.toString(),
        });
      },
      overlayProps: {
        opacity: 0.12,
      },
      zIndex: 200,
      closeOnConfirm: true,
      onClose: () => modals.closeAll(),
    });
  };

  const csvConfig = mkConfig({
    fieldSeparator: ",",
    decimalSeparator: ".",
    useKeysAsHeaders: true,
  });

  const handleExportRows = (rows: MRT_Row<IndexFields>[]) => {
    const rowData = rows.map(({ original }) => {
      const { id, ...rest } = original;
      return {
        ...rest,
        IDATE: rest.IDATE.toString(),
      };
    });

    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  interface ExcelDataUpdate {
    (newData: IndexFields[]): void;
  }

  const handleExcelDataUpdate: ExcelDataUpdate = (newData) => {
    setExcelData(newData);
    setIsUsingExcelData(true);
  };

  const FRPINDXExcel = finalData?.map(({ id, SORINAME, ...rest }) => ({
    ...rest,
  }));

  const PDFheaders = [
    { label: "Benchmark Name", key: "SORINAME" },
    { label: "Benchmark ID", key: "INDX" },
    { label: "Benchmark Date", key: "IDATE" },
    { label: "Benchmark Price", key: "IPRICE", align: "right" },
    { label: "Benchmark Income", key: "IINC", align: "right" },
    { label: "Benchmark Return", key: "IRET", align: "right" },
  ];

  const fieldnames = ["RECDTYPE", "INDX", "IDATE", "IPRICE", "IINC", "IRET"];

  const convertToCSV = (data) => {
    let csv = "";
    data.forEach((row) => {
      let rowData = fieldnames
        .map((field) => {
          let value = row[field] ?? "";
          if (typeof value === "string" && value.includes("/")) {
            value = value.replace(/\//g, "");
          }
          return value;
        })
        .join(delim);
      csv += rowData + ",END_REC";
    });
    return csv;
  };

  const { mutateAsync: updateIndexExcel, isPending: isUpdatingIndexExcel } = useMutation({
    mutationFn: async () => {
      await FetchUpdateDeleteAPIExcel(convertToCSV(finalData), `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=${tableName}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return Promise.resolve();
    },
    onMutate: async () => {},
  });

  const handleMRELoad = async () => {
    await updateIndexExcel();
  };

  const table = useMantineReactTable({
    columns,
    data: finalData,
    enableColumnResizing: false,
    createDisplayMode: "modal",
    editDisplayMode: "modal",
    enableEditing: true,
    enableClickToCopy: true,
    enableColumnDragging: true,
    enableColumnOrdering: true,
    enableColumnFilterModes: false,
    enablePinning: true,
    enableStickyHeader: true,
    enableTableFooter: true,
    enableFullScreenToggle: false,
    enableRowSelection: true,
    selectDisplayMode: "checkbox",
    paginationDisplayMode: "pages",
    positionToolbarAlertBanner: "bottom",
    getRowId: (row) => row.id,
    mantineToolbarAlertBannerProps: isLoadingIndexsError ? { color: "red", children: "Failed to load data. Update your selection criteria." } : undefined,
    onCreatingRowSave: handleCreateIndex,
    onEditingRowSave: handleSaveIndex,
    enableRowActions: true,

    mantineTableBodyCellProps: {
      className: "rpt-body",
    },

    renderCreateRowModalContent: ({ table, row, internalEditComponents }) => {
      setIsEditable(true);

      return (
        <Stack>
          <Flex className="mrt-model-title">
            <Title order={4}>Create New {isDaily ? "Daily" : "Monthly"} Benchmark</Title>
            <ActionIcon onClick={() => table.setCreatingRow(null)} variant="light" size="lg" color="red">
              ✕
            </ActionIcon>
          </Flex>
          {internalEditComponents.map((component, index) => (
            <div key={index}>{component}</div>
          ))}
          <Flex justify="flex-end" mt="xl">
            <MRT_EditActionButtons variant="text" table={table} row={row} />
          </Flex>
        </Stack>
      );
    },

    renderEditRowModalContent: ({ table, row, internalEditComponents }) => {
      setIsEditable(false);

      return (
        <Stack>
          <Flex className="mrt-model-title">
            <Title order={4}>Edit {isDaily ? "Daily" : "Monthly"} Benchmark</Title>
            <ActionIcon onClick={() => table.setEditingRow(null)} variant="light" size="lg" color="red">
              ✕
            </ActionIcon>
          </Flex>
          {internalEditComponents.map((component, index) => (
            <div key={index}>{component}</div>
          ))}
          <Flex justify="flex-end" mt="xl">
            <MRT_EditActionButtons variant="text" table={table} row={row} />
          </Flex>
        </Stack>
      );
    },

    displayColumnDefOptions: {
      "mrt-row-select": {
        enableColumnOrdering: true,
        enableHiding: false,
        size: 5,
      },
      "mrt-row-actions": {
        size: 120,
        enableColumnOrdering: true,
        enableHiding: false,
        mantineTableHeadCellProps: {
          className: "rpt-header-3",
        },
      },
    },
    initialState: {
      columnOrder: ["mrt-row-select", "mrt-row-actions", ...columns.map((column) => column.accessorKey as string)],
    },

    renderRowActions: ({ row, table }) => (
      <Flex gap={5}>
        <Tooltip label="Edit">
          <ActionIcon
            onClick={() => {
              table.setEditingRow(row);
            }}
          >
            <IconEdit />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Copy">
          <ActionIcon
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(row.original));
              table.setRowSelection({ [row.id]: true });
            }}
          >
            <CopyIcon />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Delete">
          <ActionIcon
            color="red"
            onClick={(event) => {
              event.stopPropagation();
              openDeleteConfirmModal(row);
            }}
          >
            <IconTrash />
          </ActionIcon>
        </Tooltip>
      </Flex>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Flex gap={10}>
        <Button
          variant="subtle"
          leftIcon={<IconPlus />}
          onClick={() => {
            table.setCreatingRow(
              createRow(table, {
                id: uuidv4(),
                INDX: "",
                IDATE: new Date().toISOString(),
                SORINAME: "",
                IPRICE: 0,
                IINC: 0,
                IRET: 0,
                RECDTYPE: "A",
              })
            );
          }}
          disabled={finalData?.length > 0 ? false : true}
          className="rpt-action-button"
        >
          Create New {isDaily ? "Daily" : "Monthly"} Benchmark
        </Button>
        <Button
          variant="subtle"
          disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
          onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
          leftIcon={<EXPORT_SVG />}
          className={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected() ? "" : "rpt-action-button"}
        >
          Export Selected Rows
        </Button>
        <Import onDataUpdate={handleExcelDataUpdate} />
        <Export data={finalData} excelData={FRPINDXExcel} reportName={tableName} PDFheaders={PDFheaders} portfolioName={portfolioName} dateRange={dateRange} />
        <Button
          variant="subtle"
          leftIcon={<IconRefresh size={20} />}
          onClick={handleMRELoad}
          className={excelData?.length > 0 && finalData.length > 0 ? "rpt-action-button" : ""}
          disabled={excelData?.length > 0 && finalData.length > 0 ? false : true}
        >
          Build Excel CSV
        </Button>
      </Flex>
    ),

    renderColumnActionsMenuItems: ({ internalColumnMenuItems, column }) => {
      return (
        <>
          {internalColumnMenuItems}
          <Divider
            style={{
              display: (column.columnDef.mantineTableHeadCellProps as any)?.align === "right" ? "block" : "none",
            }}
          />
          <Menu.Item
            style={{
              alignItems: "center",
              display: (column.columnDef.mantineTableHeadCellProps as any)?.align === "right" ? "inline-flex" : "none",
            }}
            icon={
              <ActionIcon>
                <AiIcon />
              </ActionIcon>
            }
            onClick={() => {
              openModal(column.columnDef.accessorKey, column.columnDef.header);
            }}
          >
            Predict Data (AI)
          </Menu.Item>
        </>
      );
    },
    state: {
      isLoading: isLoadingIndexs,
      isSaving: isCreatingIndex || isUpdatingIndex || isDeletingIndex || isUpdatingIndexExcel,
      showAlertBanner: isLoadingIndexsError,
      showProgressBars: isFetchingIndexs,
    },
  });

  const [modalData, setModalData] = useState({
    opened: false,
    columnKey: null,
    currentColumnHeader: "",
  });

  const openModal = (columnKey, currentColumnHeader) => {
    setModalData({
      opened: true,
      columnKey,
      currentColumnHeader,
    });
  };

  const closeModal = () => {
    setModalData((prev) => ({ ...prev, opened: false }));
  };

  return (
    <>
      <MantineReactTable table={table} />
      <Modal centered opened={modalData.opened} onClose={closeModal} title={`Predicted Data for Column: ${modalData.currentColumnHeader}`} size="xl" closeOnClickOutside={false}>
        <PredictNumColumn rows={finalData} columnKey={modalData.columnKey} currentColumnHeader={modalData.currentColumnHeader} />
      </Modal>
    </>
  );
};

const FrpIndexs = ({ isDaily }: { isDaily: boolean }) => (
  <ModalsProvider>
    <IndexMTable isDaily={isDaily} />
  </ModalsProvider>
);

export default FrpIndexs;

const validateRequired = (value: string) => !!value.length;

function validateIndex(index: IndexFields) {
  return {
    IDATE: !validateRequired(index.IDATE?.toString()) ? "Date is Required" : "",
  };
}
