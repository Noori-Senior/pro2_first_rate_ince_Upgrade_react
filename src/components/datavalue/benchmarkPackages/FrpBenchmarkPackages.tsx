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
import { useBenchmarkPackagesColumns, BenchmarkPackagesFields } from "../columnTitles/BenchmarkPackagesColumns.tsx";
import { formatDateYYM } from "../../hooks/FormatDates.tsx";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs
import { mkConfig, generateCsv, download } from "export-to-csv"; //or use your library of choice here

import { compareData } from "../../report-components/compareData.js";
import { Import } from "../../report-components/Import.js";
import { Export } from "../../report-components/Export.js";
import { PredictNumColumn } from "../../../aiAgents/PredictNumColumn.js";
import { useBenchmarkName, useSectorName } from "../../hooks/useFrpNamesFiltersDDLsApi.js";

type DateRange = string[];

type OutletContextType = {
  selectedPortfolio: string;
  setSelectedPortfolio: (portfolio: string) => void;
  dateRange: DateRange;
};

const BenchmarkPackagessMTable = () => {
  const [finalData, setFinalData] = useState<BenchmarkPackagesFields[]>([]);
  const [excelData, setExcelData] = useState<BenchmarkPackagesFields[]>([]);
  const [isUsingExcelData, setIsUsingExcelData] = useState(false);
  const [isEditAble, setIsEditable] = useState<boolean>(false);

  const client = useClient();
  const delim = process.env.REACT_APP_DELIMITER;

  // const { selectedPortfolio, dateRange } = useOutletContext<OutletContextType>();
  const { dateRange } = useOutletContext<OutletContextType>();

  const { data: benchmarkNameData } = useBenchmarkName(client); // Fetch sector name data
  const { data: sectorNameData } = useSectorName(client); // Fetch sector name data

  const lbenchmarkPkgUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPIPKG2`;

  // Unified data fetch using React Query
  const {
    data: fetchedBenchmarkPackagess = [],
    isError: isLoadingBenchmarkPackagessError,
    isFetching: isFetchingBenchmarkPackagess,
    isLoading: isLoadingBenchmarkPackagess,
  } = useQuery<BenchmarkPackagesFields[]>({
    queryKey: ["BenchmarkPackage", dateRange, client, benchmarkNameData],
    queryFn: async () => {
      const data = await FetchAPI(lbenchmarkPkgUri);

      return data.map((row) => {
        // Benchmark name matching - assuming benchmarkNameData is an array
        const matchedBenchmark = benchmarkNameData?.find((benchmark) => benchmark.SORI.trim() === row.INDICES.trim());
        const matchedBenchmarkName = matchedBenchmark?.SORINAME === undefined ? "Name Not Defined" : matchedBenchmark?.SORINAME;

        // Match FRPIPKG2 MSECTOR1 and MSECTOR2 with sectorNameData
        const matchedMSector1 = sectorNameData?.find((msector1) => msector1.SORI === row.MSECTOR1);
        const matchedMSectorName1 = matchedMSector1?.SORINAME === undefined ? "Name Not Defined" : matchedMSector1?.SORINAME;
        const matchedMSector2 = sectorNameData?.find((msector2) => msector2.SORI === row.MSECTOR2);
        const matchedMSectorName2 = matchedMSector2?.SORINAME === undefined ? "Name Not Defined" : matchedMSector2?.SORINAME;

        return {
          ...row,
          id: row.id || uuidv4(),
          SORINAME: matchedBenchmarkName, // add NAME field conditionally
          MSNAME1: matchedMSectorName1, // add NAME field conditionally
          MSNAME2: matchedMSectorName2, // add NAME field conditionally
        };
      });
    },
    enabled: !!dateRange && !!client && !!benchmarkNameData && !!sectorNameData, // Ensure all dependencies are available
    refetchOnWindowFocus: false,
  });

  // Determine which data to display
  // Update finalData based on excelData or data
  const keyFields = ["PKG", "INDICES"];
  const nonKeyFields = ["MSECTOR1", "MESCTOR2", "GINDEX"];

  React.useEffect(() => {
    if (isUsingExcelData && excelData.length > 0) {
      setFinalData(compareData(excelData, fetchedBenchmarkPackagess, keyFields, nonKeyFields));
      setIsUsingExcelData(false); // Switch back to using fetched data
    } else if (fetchedBenchmarkPackagess && fetchedBenchmarkPackagess.length > 0) {
      setFinalData(fetchedBenchmarkPackagess);
    } else if (finalData.length !== 0) {
      // Prevent unnecessary updates
      setFinalData([]);
    }
  }, [excelData, fetchedBenchmarkPackagess]);

  const portfolioName = ""; // used for PDF output

  const columns = useBenchmarkPackagesColumns(finalData, setFinalData, isEditAble, client); // Get Column information

  const queryClient = useQueryClient();
  // Mutations
  const { mutateAsync: createBenchmarkPackages, isPending: isCreatingBenchmarkPackages } = useMutation({
    mutationFn: async (createdBenchmarkPackage: BenchmarkPackagesFields) => {
      // send the updated data to API function
      const editDataInCSV = `A${delim}${createdBenchmarkPackage.PKG}${delim}${createdBenchmarkPackage.INDICES}
        ${delim}${createdBenchmarkPackage.MSECTOR1}${delim}${createdBenchmarkPackage.MSECTOR2}${delim}${createdBenchmarkPackage.GINDEX}
      `;
      await FetchUpdateDeleteAPI(
        editDataInCSV
          .replace(/[\r\n]+/g, "")
          .replace(/\s*\|\s*/g, "|")
          .replace(/\|null\|/g, "||"),
        `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPIPKG2`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return createBenchmarkPackages;
    },
    onMutate: async (newBenchmarkPackages: BenchmarkPackagesFields) => {
      await queryClient.cancelQueries({
        queryKey: ["BenchmarkPackage", dateRange, client, benchmarkNameData],
      });

      const previousBenchmarkPackages = queryClient.getQueryData<BenchmarkPackagesFields[]>(["BenchmarkPackage", dateRange, client, benchmarkNameData]) || [];

      queryClient.setQueryData(
        ["BenchmarkPackage", dateRange, client, benchmarkNameData], // Use the exact query key
        (old: BenchmarkPackagesFields[] | undefined) => [
          ...(old ?? []),
          {
            ...newBenchmarkPackages,
            id: uuidv4(),
            SORINAME: benchmarkNameData?.find((benchmark) => benchmark.SORI.trim() === newBenchmarkPackages.INDICES.trim())?.SORINAME || "Name Not Defined",
          },
        ]
      );

      return { previousBenchmarkPackages };
    },
  });

  const { mutateAsync: updateBenchmarkPackages, isPending: isUpdatingBenchmarkPackages } = useMutation({
    mutationFn: async (updatedBenchmarkPackage: BenchmarkPackagesFields) => {
      // send the updated data to API function
      const editDataInCSV = `C${delim}${updatedBenchmarkPackage.PKG}${delim}${updatedBenchmarkPackage.INDICES}
        ${delim}${updatedBenchmarkPackage.MSECTOR1}${delim}${updatedBenchmarkPackage.MSECTOR2}${delim}${updatedBenchmarkPackage.GINDEX}
      `;
      await FetchUpdateDeleteAPI(
        editDataInCSV
          .replace(/[\r\n]+/g, "")
          .replace(/\s*\|\s*/g, "|")
          .replace(/\|null\|/g, "||"),
        `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPIPKG2`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return updatedBenchmarkPackage;
    },
    onMutate: async (updatedBenchmarkPackage: BenchmarkPackagesFields) => {
      await queryClient.cancelQueries({ queryKey: ["BenchmarkPackage"] });
      const previousBenchmarkPackages = queryClient.getQueryData<BenchmarkPackagesFields[]>(["BenchmarkPackage"]);
      queryClient.setQueryData(["BenchmarkPackage"], (old: BenchmarkPackagesFields[] = []) => old.map((h) => (h.id === updatedBenchmarkPackage.id ? updatedBenchmarkPackage : h)));
      return { previousBenchmarkPackages };
    },
  });

  const { mutateAsync: deleteBenchmarkPackages, isPending: isDeletingBenchmarkPackages } = useMutation({
    mutationFn: async ({ benchmarkPkgId, PKG, INDICES }: { benchmarkPkgId: string; PKG: string; INDICES: string }) => {
      // send the updated data to API function
      const editDataInCSV = `D${delim}${PKG}${delim}${INDICES}`;
      await FetchUpdateDeleteAPI(
        editDataInCSV
          .replace(/[\r\n]+/g, "")
          .replace(/\s*\|\s*/g, "|")
          .replace(/\|null\|/g, "||"),
        `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPIPKG2`
      ); // delete the record
      await new Promise((resolve) => setTimeout(resolve, 100)); // Simulated API delay
      return Promise.resolve(benchmarkPkgId);
    },
    onMutate: async ({ benchmarkPkgId }) => {
      await queryClient.cancelQueries({
        queryKey: ["BenchmarkPackage", dateRange, client, benchmarkNameData],
      });

      const previousBenchmarkPackages = queryClient.getQueryData<BenchmarkPackagesFields[]>(["BenchmarkPackage", dateRange, client, benchmarkNameData]);

      // Optimistically update the cache by removing the deleted row
      queryClient.setQueryData(["BenchmarkPackage", dateRange, client, benchmarkNameData], (old: BenchmarkPackagesFields[] = []) => {
        const newData = old.filter((h: BenchmarkPackagesFields) => h.id !== benchmarkPkgId);
        console.log("New Data After Deletion:", newData); // Debugging
        return newData;
      });

      return { previousBenchmarkPackages };
    },
  });

  // CRUD Handlers
  const handleCreateBenchmarkPackages: MRT_TableOptions<BenchmarkPackagesFields>["onCreatingRowSave"] = async ({ values, exitCreatingMode }) => {
    // Format DATES as expected date before saving
    const formattedValues = {
      ...values,
      IDATE: values.IDATE === "" || null ? "190012" : formatDateYYM(values.IDATE),
    };

    // Validate the updated values
    const errors = validateBenchmarkPackages(values);
    if (Object.values(errors).some(Boolean)) {
      return; // If there are validation errors, stop the save operation
    }

    // Save the created values instead of row.original
    await createBenchmarkPackages(formattedValues); // Use values instead of row.original
    exitCreatingMode();
    table.setCreatingRow(null); // Reset editing state
  };

  const handleSaveBenchmarkPackages: MRT_TableOptions<BenchmarkPackagesFields>["onEditingRowSave"] = async ({ table, values }) => {
    // Format DATES as expected date before saving
    const formattedValues = { ...values, IDATE: formatDateYYM(values.IDATE) };

    // Validate the updated values
    const errors = validateBenchmarkPackages(values);
    if (Object.values(errors).some(Boolean)) {
      return; // If there are validation errors, stop the save operation
    }

    // Save the updated values instead of row.original
    await updateBenchmarkPackages(formattedValues); // Use values instead of row.original

    // Reset the editing state
    table.setEditingRow(null);
  };

  const openDeleteConfirmModal = (row: MRT_Row<BenchmarkPackagesFields>) => {
    modals.openConfirmModal({
      title: "Delete Benchmark?",
      children: (
        <Text>
          Delete {row.original.SORINAME} ({row.original.PKG}), As Of Date ({row.original.INDICES})?
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        deleteBenchmarkPackages({
          benchmarkPkgId: row.original.id,
          PKG: row.original.PKG,
          INDICES: row.original.INDICES,
        });
      },
      overlayProps: {
        opacity: 0.12, // Adjust this value (0-1) for desired darkness
      },
      zIndex: 200, // Ensure proper z-index
      closeOnConfirm: true,
      onClose: () => modals.closeAll(),
    });
  };

  const csvConfig = mkConfig({
    fieldSeparator: ",",
    decimalSeparator: ".",
    useKeysAsHeaders: true,
  });

  const handleExportRows = (rows: MRT_Row<BenchmarkPackagesFields>[]) => {
    const rowData = rows.map(({ original }) => {
      const { id, ...rest } = original; // Exclude 'id' field
      return {
        ...rest,
      };
    });

    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  interface ExcelDataUpdate {
    (newData: BenchmarkPackagesFields[]): void;
  }

  const handleExcelDataUpdate: ExcelDataUpdate = (newData) => {
    setExcelData(newData); // Update excelData with the uploaded file data
    setIsUsingExcelData(true); // Switch to using Excel data
  };

  // create only records that is requires to update the Table
  const FRPIPKG2Excel = finalData?.map(({ id, SORINAME, MSNAME1, MSNAME2, ...rest }) => ({
    ...rest,
  }));

  //  Custom headers for the PDF file
  const PDFheaders = [
    { label: "Package ID", key: "PKG" },
    { label: "Benchmark ID", key: "INDICES" },
    { label: "Benchmark Name", key: "SORINAME" },
    { label: "Model Sector 1 ID", key: "MSECTOR1" },
    { label: "Model Sector 1 Name", key: "MSNAME1" },
    { label: "Model Sector 2 ID", key: "MSECTOR2" },
    { label: "Model Sector 2 Name", key: "MSNAME2" },
    { label: "Graph ID", key: "GINDEX" },
  ];

  // Load data from excel to table
  const fieldnames = ["RECDTYPE", "PKG", "INDICES", "MSECTOR1", "MSECTOR2", "GINDEX"];

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

  const { mutateAsync: updateBenchmarkPackagesExcel, isPending: isUpdatingBenchmarkPackageExcel } = useMutation({
    mutationFn: async () => {
      // send the updated data to API function
      await FetchUpdateDeleteAPIExcel(convertToCSV(finalData), `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPIPKG2`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return Promise.resolve();
    },
    onMutate: async () => {},
  });

  const handleMRELoad = async () => {
    await updateBenchmarkPackagesExcel();
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
    getRowId: (row) => row.id, // Use the unique ID
    mantineToolbarAlertBannerProps: isLoadingBenchmarkPackagessError
      ? {
          color: "red",
          children: "Failed to load data. Update your selection criteria.",
        }
      : undefined,
    // onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateBenchmarkPackages,
    // onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveBenchmarkPackages,
    enableRowActions: true,

    mantineTableBodyCellProps: {
      className: "rpt-body",
    },

    renderCreateRowModalContent: ({ table, row, internalEditComponents }) => {
      setIsEditable(true);

      return (
        <Stack>
          <Flex className="mrt-model-title">
            <Title order={4}>Create New Benchmark Package</Title>
            <ActionIcon onClick={() => table.setCreatingRow(null)} variant="light" size="lg" color="red">
              ✕ {/* Close Icon */}
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
            <Title order={4}>Edit Benchmark Package</Title>
            <ActionIcon onClick={() => table.setEditingRow(null)} variant="light" size="lg" color="red">
              ✕ {/* Close Icon */}
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
        enableColumnOrdering: true, // Allow column ordering
        enableHiding: false, // Prevent hiding the checkbox column
        size: 5,
      },
      "mrt-row-actions": {
        size: 120,
        enableColumnOrdering: true, // Allow column ordering
        enableHiding: false, // Prevent hiding the actions column
        mantineTableHeadCellProps: {
          className: "rpt-header-3",
        },
      },
    },
    initialState: {
      columnOrder: [
        "mrt-row-select", // Checkbox column (first column)
        "mrt-row-actions", // Actions column (second column)
        ...columns.map((column) => column.accessorKey as string), // Rest of the data columns
      ],
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
              // Copy the row data to the clipboard
              navigator.clipboard.writeText(JSON.stringify(row.original));
              // Check the checkbox for the copied row
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
                PKG: "",
                INDICES: "",
                SORINAME: "",
                MSECTOR1: "",
                MSNAME1: "",
                MSECTOR2: "",
                MSNAME2: "",
                GINDEX: "",
                RECDTYPE: "A", // Add the missing property
              })
            );
          }}
          disabled={finalData?.length > 0 ? false : true}
          className="rpt-action-button"
        >
          Create New Benchmark Package
        </Button>
        <Button
          variant="subtle"
          disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
          //only export selected rows
          onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
          leftIcon={<EXPORT_SVG />}
          className={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected() ? "" : "rpt-action-button"}
        >
          Export Selected Rows
        </Button>
        <Import onDataUpdate={handleExcelDataUpdate} />
        <Export data={finalData} excelData={FRPIPKG2Excel} reportName="FRPIPKG2" PDFheaders={PDFheaders} portfolioName={portfolioName} dateRange={dateRange} />
        <Button
          variant="subtle"
          leftIcon={<IconRefresh size={20} />}
          onClick={handleMRELoad}
          className={excelData?.length > 0 && finalData.length > 0 ? "rpt-action-button" : ""}
          disabled={excelData?.length > 0 && finalData.length > 0 ? false : true}
        >
          {" "}
          Build Excel CSV{" "}
        </Button>
      </Flex>
    ),

    renderColumnActionsMenuItems: ({ internalColumnMenuItems, column }) => {
      // Check if the header cell has a right alignment
      return (
        <>
          {internalColumnMenuItems} {/* optionally include the default menu items */}
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
            // Call a handler that closes the menu and opens the modal
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
      isLoading: isLoadingBenchmarkPackagess,
      isSaving: isCreatingBenchmarkPackages || isUpdatingBenchmarkPackages || isDeletingBenchmarkPackages || isUpdatingBenchmarkPackageExcel,
      showAlertBanner: isLoadingBenchmarkPackagessError,
      showProgressBars: isFetchingBenchmarkPackagess,
    },
  });

  // ------------------------------------------------------------------------------------------------
  //  Prediction of continues number in a numeric column
  // ------------------------------------------------------------------------------------------------
  // State for controlling the Modal
  const [modalData, setModalData] = useState({
    opened: false,
    columnKey: null,
    currentColumnHeader: "",
  });

  // Handler to open the modal with the correct data
  const openModal = (columnKey, currentColumnHeader) => {
    setModalData({
      opened: true,
      columnKey,
      currentColumnHeader,
    });
  };

  // Handler to close the modal
  const closeModal = () => {
    setModalData((prev) => ({ ...prev, opened: false }));
  };

  // Your Modal, rendered outside of the menu
  return (
    <>
      <MantineReactTable table={table} />
      <Modal centered opened={modalData.opened} onClose={closeModal} title={`Predicted Data for Column: ${modalData.currentColumnHeader}`} size="xl" closeOnClickOutside={false}>
        {/* Modal contents; pass modalData.columnKey or other props as needed */}
        <PredictNumColumn rows={finalData} columnKey={modalData.columnKey} currentColumnHeader={modalData.currentColumnHeader} />
      </Modal>
    </>
  );
};

const FrpBenchmarkPackagess = () => (
  <ModalsProvider>
    <BenchmarkPackagessMTable />
  </ModalsProvider>
);

export default FrpBenchmarkPackagess;

const validateRequired = (value: string) => !!value.length;

function validateBenchmarkPackages(BenchmarkPackage: BenchmarkPackagesFields) {
  return {
    PKG: !validateRequired(BenchmarkPackage.PKG) ? "Date is Required" : "",
  };
}
