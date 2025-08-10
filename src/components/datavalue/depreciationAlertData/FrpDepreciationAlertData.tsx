import React, { useState } from "react";
import {
  MRT_EditActionButtons,
  MantineReactTable,
  type MRT_Row,
  type MRT_TableOptions,
  useMantineReactTable,
  createRow,
} from "mantine-react-table";
import {
  ActionIcon,
  Button,
  Flex,
  Text,
  Tooltip,
  Divider,
  Menu,
  Modal,
  Stack,
  Title,
  Grid,
} from "@mantine/core";
import { CopyIcon, EXPORT_SVG, AiIcon } from "../../../svgicons/svgicons.js";
import { ModalsProvider, modals } from "@mantine/modals";
import {
  IconEdit,
  IconTrash,
  IconPlus,
  IconRefresh,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import {
  FetchAPI,
  FetchUpdateDeleteAPI,
  FetchUpdateDeleteAPIExcel,
} from "../../../api.js";
import useClient from "../../hooks/useClient.js";
import {
  useDepreciationAlertData,
  DepreciationAlertDataFields,
} from "../columnTitles/DepreciationAlertDataColumns.tsx";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs
import { mkConfig, generateCsv, download } from "export-to-csv"; //or use your library of choice here

import { compareData } from "../../report-components/compareData.js";
import { Import } from "../../report-components/Import.js";
import { Export } from "../../report-components/Export.js";
import { PredictNumColumn } from "../../../aiAgents/PredictNumColumn.js";
import {
  formatDateYYMD,
  formatFromDateYYMD,
  formatToDateYYMMDD,
} from "../../hooks/FormatDates.tsx";
import {
  useAccountName,
  useSectorName,
} from "../../hooks/useFrpNamesFiltersDDLsApi.js";

type DateRange = string[];

type OutletContextType = {
  selectedPortfolio: string;
  setSelectedPortfolio: (portfolio: string) => void;
  dateRange: DateRange;
};

const DepreciationAlertDataMTable = () => {
  const [finalData, setFinalData] = useState<DepreciationAlertDataFields[]>([]);
  const [excelData, setExcelData] = useState<DepreciationAlertDataFields[]>([]);
  const [isUsingExcelData, setIsUsingExcelData] = useState(false);
  const [isEditAble, setIsEditable] = useState<boolean>(false);

  const client = useClient();
  const delim = process.env.REACT_APP_DELIMITER;

  const { selectedPortfolio, setSelectedPortfolio } =
    useOutletContext<OutletContextType>();
  const { dateRange } = useOutletContext<OutletContextType>();
  const fromDate = formatFromDateYYMD(dateRange as [string, string]);
  const toDate = formatToDateYYMMDD(dateRange as [string, string]);

  const { data: accountNameData } = useAccountName(selectedPortfolio, client); // Fetch account name data
  const { data: sectorNameData } = useSectorName(client); // Fetch sector name data

  const depreciationAlertDataUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPMIFID&filters=ACCT(${selectedPortfolio});ALERT_DATE(GT:${fromDate}:AND:ALERT_DATE:LE:${toDate})`;

  // Unified data fetch using React Query
  const {
    data: fetchDepreciationAlertData = [],
    isError: isLoadingDepreciationAlertDataError,
    isFetching: isFetchingDepreciationAlertData,
    isLoading: isLoadingDepreciationAlertData,
  } = useQuery<DepreciationAlertDataFields[]>({
    queryKey: [
      "depreciationAlertData",
      selectedPortfolio,
      dateRange,
      client,
      accountNameData,
      sectorNameData,
    ],
    queryFn: async () => {
      const data = await FetchAPI(depreciationAlertDataUri);

      return data.map((row) => {
        // Account name matching
        const matchedAccount = accountNameData?.find(
          (account) => account.ACCT === row.ACCT
        );
        const matchedAccountName =
          matchedAccount?.NAME === undefined
            ? "Name Not Defined"
            : matchedAccount?.NAME;

        // Sector name matching - assuming sectorNameData is an array
        const matchedSector = sectorNameData?.find(
          (sector) => sector.SORI === row.SECTOR
        );
        const matchedSectorName =
          matchedSector?.SORINAME === undefined
            ? "Name Not Defined"
            : matchedSector?.SORINAME;

        return {
          ...row,
          id: row.id || uuidv4(),
          NAME: matchedAccountName, // add NAME field conditionally
          SNAME: matchedSectorName, // add SNAME1 field conditionally
        };
      });
    },
    enabled: !!selectedPortfolio && !!client,
    refetchOnWindowFocus: false,
  });

  // Determine which data to display
  // const data = isUsingExcelData ? excelData : fetchDepreciationAlertData;
  // Update finalData based on excelData or data
  const keyFields = ["ACCT", "ALERT_DATE", "SECTOR"];
  const nonKeyFields = ["SECTOR", "FREQUENCY"];
  const numericFields = ["ALERT_UVR"]; // Define numeric fields

  React.useEffect(() => {
    if (isUsingExcelData && excelData.length > 0) {
      setFinalData(
        compareData(
          excelData,
          fetchDepreciationAlertData,
          keyFields,
          nonKeyFields,
          numericFields
        )
      );
      setIsUsingExcelData(false); // Switch back to using fetched data
      setSelectedPortfolio(excelData[0]?.ACCT);
    } else if (
      fetchDepreciationAlertData &&
      fetchDepreciationAlertData.length > 0
    ) {
      setFinalData(fetchDepreciationAlertData);
    } else if (finalData.length !== 0) {
      // Prevent unnecessary updates
      setFinalData([]);
    }
  }, [excelData, fetchDepreciationAlertData]);

  const portfolioName = finalData[0]?.NAME + ` (${finalData[0]?.ACCT})`; // used for PDF output

  const columns = useDepreciationAlertData(finalData, setFinalData, isEditAble); // Get Column information

  const queryClient = useQueryClient();
  // Mutations
  const {
    mutateAsync: DepreciationAlertData,
    isPending: isCreatingDepAlertData,
  } = useMutation({
    mutationFn: async (createdDepAlertData: DepreciationAlertDataFields) => {
      // send the updated data to API function
      const editDataInCSV = `A${delim}${
        createdDepAlertData.ACCT
      }${delim}${createdDepAlertData.ALERT_DATE?.toString().replace(
        /\//g,
        ""
      )}${delim}${createdDepAlertData.PCTG_BRK}
        ${delim}${createdDepAlertData.ALERT_UVR}${delim}${
        createdDepAlertData.SECTOR
      }${createdDepAlertData.FREQUENCY}
      `;
      await FetchUpdateDeleteAPI(
        editDataInCSV
          .replace(/[\r\n]+/g, "")
          .replace(/\s*\|\s*/g, "|")
          .replace(/\|null\|/g, "||"),
        `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPMIFID`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return createdDepAlertData;
    },
    onMutate: async (newDepreciationAlertData: DepreciationAlertDataFields) => {
      await queryClient.cancelQueries({
        queryKey: [
          "depreciationAlertData",
          selectedPortfolio,
          dateRange,
          client,
          accountNameData,
          sectorNameData,
        ],
      });

      const previousDepAlertData =
        queryClient.getQueryData<DepreciationAlertDataFields[]>([
          "depreciationAlertData",
          selectedPortfolio,
          dateRange,
          client,
          accountNameData,
          sectorNameData,
        ]) || [];

      queryClient.setQueryData(
        [
          "depreciationAlertData",
          selectedPortfolio,
          dateRange,
          client,
          accountNameData,
          sectorNameData,
        ], // Use the exact query key
        (old: DepreciationAlertDataFields[] | undefined) => [
          ...(old ?? []),
          {
            ...newDepreciationAlertData,
            id: uuidv4(),
            NAME:
              accountNameData?.find(
                (account: { ACCT: string }) =>
                  account.ACCT === newDepreciationAlertData.ACCT
              )?.NAME || "Name Not Defined",
            SNAME:
              sectorNameData?.find(
                (sector: { SORI: string }) =>
                  sector.SORI === newDepreciationAlertData.SECTOR
              )?.SORINAME || "Name Not Defined",
          },
        ]
      );

      return { previousDepAlertData };
    },
  });

  const {
    mutateAsync: updateDepreciationAlertData,
    isPending: isUpdatingDepAlertData,
  } = useMutation({
    mutationFn: async (updatedDepAlertData: DepreciationAlertDataFields) => {
      // send the updated data to API function
      const editDataInCSV = `C${delim}${
        updatedDepAlertData.ACCT
      }${delim}${updatedDepAlertData.ALERT_DATE?.toString()
        .replace(/\//g, "")
        .replace(/-/g, "")}${delim}${updatedDepAlertData.PCTG_BRK}
        ${delim}${updatedDepAlertData.ALERT_UVR}${delim}${
        updatedDepAlertData.SECTOR
      }${delim}${updatedDepAlertData.FREQUENCY}
      `;
      await FetchUpdateDeleteAPI(
        editDataInCSV
          .replace(/[\r\n]+/g, "")
          .replace(/\s*\|\s*/g, "|")
          .replace(/\|null\|/g, "||"),
        `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPMIFID`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return updatedDepAlertData;
    },
    onMutate: async (updatedDepAlertData: DepreciationAlertDataFields) => {
      await queryClient.cancelQueries({ queryKey: ["depreciationAlertData"] });
      const previousDepAlertData = queryClient.getQueryData<
        DepreciationAlertDataFields[]
      >(["depreciationAlertData"]);
      queryClient.setQueryData(
        ["depreciationAlertData"],
        (old: DepreciationAlertDataFields[] = []) =>
          old.map((h) =>
            h.id === updatedDepAlertData.id ? updatedDepAlertData : h
          )
      );
      return { previousDepAlertData };
    },
  });

  const {
    mutateAsync: deleteDepreciationAlertData,
    isPending: isDeletingDepreciationAlertData,
  } = useMutation({
    mutationFn: async ({
      id,
      ACCT,
      ALERT_DATE,
      PCTG_BRK,
    }: {
      id: string;
      ACCT: string;
      ALERT_DATE: string;
      PCTG_BRK: string;
    }) => {
      // send the updated data to API function
      const editDataInCSV = `D${delim}${ACCT}${delim}${ALERT_DATE?.toString()
        .replace(/\//g, "")
        .replace(/-/g, "")}${delim}${PCTG_BRK}`;
      await FetchUpdateDeleteAPI(
        editDataInCSV
          .replace(/[\r\n]+/g, "")
          .replace(/\s*\|\s*/g, "|")
          .replace(/\|null\|/g, "||"),
        `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPMIFID`
      ); // delete the Depreciation Alert Data
      await new Promise((resolve) => setTimeout(resolve, 100)); // Simulated API delay
      return Promise.resolve(id);
    },
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({
        queryKey: [
          "depreciationAlertData",
          selectedPortfolio,
          dateRange,
          client,
          accountNameData,
          sectorNameData,
        ],
      });

      const previousDepAlertData = queryClient.getQueryData<
        DepreciationAlertDataFields[]
      >([
        "depreciationAlertData",
        selectedPortfolio,
        dateRange,
        client,
        accountNameData,
        sectorNameData,
      ]);

      // Optimistically update the cache by removing the deleted row
      queryClient.setQueryData(
        [
          "depreciationAlertData",
          selectedPortfolio,
          dateRange,
          client,
          accountNameData,
          sectorNameData,
        ],
        (old: DepreciationAlertDataFields[] = []) => {
          const newData = old.filter(
            (h: DepreciationAlertDataFields) => h.id !== id
          );
          return newData;
        }
      );

      return { previousDepAlertData };
    },
  });

  // CRUD Handlers
  const handleCreateDepreciationAlertData: MRT_TableOptions<DepreciationAlertDataFields>["onCreatingRowSave"] =
    async ({ values, exitCreatingMode }) => {
      // Format DATES as expected date before saving
      const formattedValues = {
        ...values,
        ALERT_DATE:
          values.ALERT_DATE === "" || null
            ? "19001201"
            : formatDateYYMD(values.ALERT_DATE),
      };
      // Validate the updated values
      const errors = validDepreciationAlertData(values);
      if (Object.values(errors).some(Boolean)) {
        return; // If there are validation errors, stop the save operation
      }

      // Save the created values instead of row.original
      await DepreciationAlertData(formattedValues); // Use values instead of row.original
      exitCreatingMode();
      table.setCreatingRow(null); // Reset editing state
    };

  const handleSaveDepreciationAlertData: MRT_TableOptions<DepreciationAlertDataFields>["onEditingRowSave"] =
    async ({ table, values }) => {
      console.log("values", values);
      // Format DATES as expected date before saving
      const formattedValues = {
        ...values,
        ALERT_DATE:
          values.ASOFDATE === "" || null
            ? "19001201"
            : formatDateYYMD(values.ALERT_DATE),
      };

      // Validate the updated values
      const errors = validDepreciationAlertData(values);
      if (Object.values(errors).some(Boolean)) {
        return; // If there are validation errors, stop the save operation
      }

      // Save the updated values instead of row.original
      await updateDepreciationAlertData(values); // Use values instead of row.original

      // Reset the editing state
      table.setEditingRow(null);
    };

  const openDeleteConfirmModal = (
    row: MRT_Row<DepreciationAlertDataFields>
  ) => {
    modals.openConfirmModal({
      key: `delete-modal-${row.id}`,
      title: "Delete Depreciation Alert Data?",
      children: (
        <Text>
          Delete {row.original.NAME} ({row.original.ACCT}), ALERT_DATE (
          {row.original.ALERT_DATE}), PCTG_BRK ({row.original.PCTG_BRK}), and
          SECTOR ({row.original.SECTOR})?
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        deleteDepreciationAlertData({
          id: row.original.id,
          ACCT: row.original.ACCT,
          ALERT_DATE: row.original.ALERT_DATE,
          PCTG_BRK: row.original.PCTG_BRK,
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

  const handleExportRows = (rows: MRT_Row<DepreciationAlertDataFields>[]) => {
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
    (newData: DepreciationAlertDataFields[]): void;
  }

  const handleExcelDataUpdate: ExcelDataUpdate = (newData) => {
    setExcelData(newData); // Update excelData with the uploaded file data
    setIsUsingExcelData(true); // Switch to using Excel data
  };

  // create only records that is requires to update the Table
  const FRPMIFIDExcel = finalData?.map(({ id, NAME, SNAME, ...rest }) => ({
    ...rest,
  }));

  //  Custom headers for the PDF file
  const PDFheaders = [
    { label: "Portfolio Id", key: "ACCT" },
    { label: "Portfolio Name", key: "NAME" },
    { label: "Alert Date", key: "ALERT_DATE" },
    { label: "Percentage Break", key: "PCTG_BRK", align: "right" },
    { label: "Alert UVR", key: "ALERT_UVR", align: "right" },
    { label: "Sector", key: "SECTOR" },
    { label: "Sector Name", key: "SNAME" },
    { label: "Frequency", key: "FREQUENCY" },
  ];

  // Load data from excel to table
  const fieldnames = [
    "RECDTYPE",
    "ACCT",
    "ALERT_DATE",
    "PCTG_BRK",
    "ALERT_UVR",
    "SECTOR",
    "FREQUENCY",
  ];

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

  const {
    mutateAsync: updateDepreciationAlertDataExcel,
    isPending: isUpdatingDepAlertDataExcel,
  } = useMutation({
    mutationFn: async () => {
      // send the updated data to API function
      await FetchUpdateDeleteAPIExcel(
        convertToCSV(finalData),
        `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPMIFID`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return Promise.resolve();
    },
    onMutate: async () => {},
  });

  const handleMRELoad = async () => {
    await updateDepreciationAlertDataExcel();
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
    mantineToolbarAlertBannerProps: isLoadingDepreciationAlertDataError
      ? {
          color: "red",
          children: "Failed to load data. Update your selection criteria.",
        }
      : undefined,
    // onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateDepreciationAlertData,
    // onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveDepreciationAlertData,
    enableRowActions: true,

    mantineTableBodyCellProps: {
      className: "rpt-body",
    },

    renderCreateRowModalContent: ({ table, row, internalEditComponents }) => {
      setIsEditable(true);

      return (
        <Stack>
          <Flex className="mrt-model-title">
            <Title order={4}>Create New Depreciation Alert Data</Title>
            <ActionIcon
              onClick={() => table.setCreatingRow(null)}
              variant="light"
              size="lg"
              color="red"
            >
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

    mantineCreateRowModalProps: {
      size: "30%",
      yOffset: "2vh",
      xOffset: 10,
      transitionProps: {
        transition: "fade",
        duration: 600,
        timingFunction: "linear",
      },
    },
    renderEditRowModalContent: ({ table, row, internalEditComponents }) => {
      setIsEditable(false);

      return (
        <Stack>
          <Flex className="mrt-model-title">
            <Title order={4}>Edit Depreciation Alert Data</Title>
            <ActionIcon
              onClick={() => table.setEditingRow(null)}
              variant="light"
              size="lg"
              color="red"
            >
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
    mantineEditRowModalProps: {
      size: "30%",
      yOffset: "2vh",
      xOffset: 10,
      transitionProps: {
        transition: "fade",
        duration: 600,
        timingFunction: "linear",
      },
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
                ACCT: selectedPortfolio,
                ALERT_DATE: new Date().toISOString(),
                PCTG_BRK: "",
                ALERT_UVR: 0,
                SECTOR: "",
                SNAME: "",
                FREQUENCY: "",
                RECDTYPE: "A",
                NAME: "",
              })
            );
          }}
          disabled={finalData?.length > 0 ? false : true}
          className="rpt-action-button"
        >
          Create New Depreciation Alert Data
        </Button>
        <Button
          variant="subtle"
          disabled={
            !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
          }
          //only export selected rows
          onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
          leftIcon={<EXPORT_SVG />}
          className={
            !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
              ? ""
              : "rpt-action-button"
          }
        >
          Export Selected Rows
        </Button>
        <Import onDataUpdate={handleExcelDataUpdate} />
        <Export
          data={finalData}
          excelData={FRPMIFIDExcel}
          reportName="Depreciation Alert Data"
          PDFheaders={PDFheaders}
          portfolioName={portfolioName}
          dateRange=""
        />
        <Button
          variant="subtle"
          leftIcon={<IconRefresh size={20} />}
          onClick={handleMRELoad}
          className={
            excelData?.length > 0 && finalData.length > 0
              ? "rpt-action-button"
              : ""
          }
          disabled={
            excelData?.length > 0 && finalData.length > 0 ? false : true
          }
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
          {internalColumnMenuItems}{" "}
          {/* optionally include the default menu items */}
          <Divider
            style={{
              display:
                (column.columnDef.mantineTableHeadCellProps as any)?.align ===
                "right"
                  ? "block"
                  : "none",
            }}
          />
          <Menu.Item
            style={{
              alignItems: "center",
              display:
                (column.columnDef.mantineTableHeadCellProps as any)?.align ===
                "right"
                  ? "inline-flex"
                  : "none",
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
      isLoading: isLoadingDepreciationAlertData,
      isSaving:
        isCreatingDepAlertData ||
        isUpdatingDepAlertData ||
        isDeletingDepreciationAlertData ||
        isUpdatingDepAlertDataExcel,
      showAlertBanner: isLoadingDepreciationAlertDataError,
      showProgressBars: isFetchingDepreciationAlertData,
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
      <Modal
        centered
        opened={modalData.opened}
        onClose={closeModal}
        title={`Predicted Data for Column: ${modalData.currentColumnHeader}`}
        size="xl"
        closeOnClickOutside={false}
      >
        {/* Modal contents; pass modalData.columnKey or other props as needed */}
        <PredictNumColumn
          rows={finalData}
          columnKey={modalData.columnKey}
          currentColumnHeader={modalData.currentColumnHeader}
        />
      </Modal>
    </>
  );
};

const FrpDepreciationAlertData = () => (
  <ModalsProvider>
    <DepreciationAlertDataMTable />
  </ModalsProvider>
);

export default FrpDepreciationAlertData;

const validateRequired = (value: string) => !!value.length;

function validDepreciationAlertData(
  depreciationAlertData: DepreciationAlertDataFields
) {
  return {
    AACCT: validateRequired(depreciationAlertData.ACCT)
      ? ""
      : "Portfolio ID is required",
  };
}
