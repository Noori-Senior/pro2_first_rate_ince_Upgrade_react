import React, { useState } from "react";
import {
  MRT_EditActionButtons,
  MantineReactTable,
  type MRT_Row,
  type MRT_TableOptions,
  useMantineReactTable,
} from "mantine-react-table";
import { ActionIcon, Button, Flex, Text, Tooltip, Menu, Modal, Stack, Title} from "@mantine/core";
import { CopyIcon, EXPORT_SVG, AiIcon } from "../../../svgicons/svgicons.js";
import { ModalsProvider, modals } from "@mantine/modals";
import { IconEdit, IconTrash, IconPlus, IconRefresh} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import useClient from "../../hooks/useClient.js";
import { usePricesColumns, PricesFields} from "../columnTitles/PricesColumns.tsx";
import { formatToDateYYMMDD, formatDateYYMD, formatFromDateYYMD } from "../../hooks/FormatDates.tsx";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs
import { mkConfig, generateCsv, download } from "export-to-csv"; //or use your library of choice here

import { compareData } from "../../report-components/compareData.js";
import { Import } from "../../report-components/Import.js";
import { Export } from "../../report-components/Export.js";
import { PredictNumColumn } from "../../../aiAgents/PredictNumColumn.js";
import { FetchAPI, FetchUpdateDeleteAPI, FetchUpdateDeleteAPIExcel } from "../../../api.js";
import { useAssetName } from "../../hooks/useFrpNamesFiltersDDLsApi.js";

type DateRange = string[];

type OutletContextType = {
  selectedPortfolio: string;
  setSelectedPortfolio: (portfolio: string) => void;
  dateRange: DateRange;
};

const PricesMTable = () => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [finalData, setFinalData] = useState<PricesFields[]>([]);
  const [excelData, setExcelData] = useState<PricesFields[]>([]);
  const [isUsingExcelData, setIsUsingExcelData] = useState(false);
  const [isEditable, setIsEditable] = useState(false);

  const client = useClient();
  const delim = process.env.REACT_APP_DELIMITER;
  const { dateRange } = useOutletContext<OutletContextType>();
  const fromDate = formatFromDateYYMD(dateRange as [string, string]) ;
  const toDate = formatToDateYYMMDD(dateRange as [string, string]);
  const { data: assetNameData } = useAssetName(client); // Fetch asset name data
  // The main API URL for fetching prices
  const priceUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPPRICE&filters=SDATE(GT:${fromDate}:AND:SDATE:LE:${toDate})`;

  // Unified data fetch using React Query
  const {
    data: fetchedPrices = [],
    isError: isLoadingPricesError,
    isFetching: isFetchingPrices,
    isLoading: isLoadingPrices,
  } = useQuery<PricesFields[]>({
    queryKey: ["prices", dateRange, client, assetNameData],
    queryFn: async () => {
      const data = await FetchAPI(priceUri);
        return data.map((row) => {
                
                // Asset name matching - assuming assetNameData is an array
                const matchedAsset = assetNameData?.find(asset => asset.ID === row.ID);
                const matchedAssetName = matchedAsset?.NAMETKR === null || undefined ? "Name Not Defined" : matchedAsset?.NAMETKR;
                
                return {
                    ...row,
                    id: row.id || uuidv4(),
                    NAMETKR: matchedAssetName, // add NAMETKR field conditionally
                };
            });
      /* return response.map((row) => ({
        ...row,
        id: row.id || uuidv4(), // Assign UUID only if the row doesn't already have one
      }));  */// Ensure the response is an array
    },
    enabled: !!dateRange && !!client && !!assetNameData,
    refetchOnWindowFocus: false,
  });

  const [processedPrices, setProcessedPrices] = React.useState<PricesFields[]>(
    []
  );

  React.useEffect(() => {
    console.log("Fetched Prices:", fetchedPrices);
    if (Array.isArray(fetchedPrices) && fetchedPrices.length > 0) {
      setProcessedPrices(
        fetchedPrices?.map((row) => ({
          ...row,
          id: row.id || uuidv4(), // Assign UUID only if the row doesn't already have one
        }))
      );
    } else {
      console.error("fetchedPrices is not an array:", fetchedPrices);
    }
  }, [fetchedPrices]);

  const keyFields = ["ID", "SDATE"];
  const nonKeyFields = ["DATESTMP"];
  const numericFields = ["SPRICE", "PRINFACT"]; // Define numeric fields

  React.useEffect(() => {
    if (isUsingExcelData && excelData.length > 0) {
      setFinalData(
        compareData(
          excelData,
          processedPrices,
          keyFields,
          nonKeyFields,
          numericFields
        )
      );
      setIsUsingExcelData(false); // Switch back to using fetched data
    } else if (processedPrices && processedPrices.length > 0) {
      setFinalData(processedPrices);
    } else if (finalData.length !== 0) {
      setFinalData([]);
    }
  }, [excelData, processedPrices]);

  const columns = usePricesColumns(isEditable, client, validationErrors, fromDate, toDate); // Get Column information

  const queryClient = useQueryClient();
  // Mutations
  const { mutateAsync: createPrice, isPending: isCreatingPrice } = useMutation({
    mutationFn: async (createPrice: PricesFields) => {
      // send the updated data to API function
      const editDataInCSV = `A${delim}${
        createPrice.ID
      }${delim}${createPrice.SDATE?.toString().replace(/\//g, "")}
        ${delim}${createPrice.SPRICE}${delim}${createPrice.PRINFACT}
      `;
      await FetchUpdateDeleteAPI(
        editDataInCSV.replace(/\s+/g, ""),
        `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPPRICE`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return createPrice;
    },
    onMutate: async (newPrices: PricesFields) => {
      await queryClient.cancelQueries({
        queryKey: ["prices", dateRange, client, assetNameData],
      });

      const previousPrices =
        queryClient.getQueryData<PricesFields[]>(["prices", dateRange, client, assetNameData]) || [];

      queryClient.setQueryData(
        ["prices", dateRange, client],
        (old: PricesFields[] | undefined) => [
          ...(old ?? []),
          {
            ...newPrices,
            id: uuidv4(),
            NAMETKR: assetNameData?.find(asset => asset.ID === newPrices.ID)?.NAMETKR || "Name Not Defined",
          },
        ]
      );
      return { previousPrices };
    },
  });

  const { mutateAsync: updatePrice, isPending: isUpdatingPrice } = useMutation({
    mutationFn: async (updatedPrice: PricesFields) => {
      // send the updated data to API function
      const editDataInCSV = `C${delim}${
        updatedPrice.ID
      }${delim}${updatedPrice.SDATE?.toString().replace(/\//g, "")}
        ${delim}${updatedPrice.SPRICE}${delim}${updatedPrice.PRINFACT}}
      `;
      await FetchUpdateDeleteAPI(
        editDataInCSV
          .replace(/[\r\n]+/g, "")
          .replace(/\s*\|\s*/g, "|")
          .replace(/\|null\|/g, "||"),
        `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPPRICE`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return updatedPrice;
    },
    onMutate: async (updatedPrice: PricesFields) => {
      await queryClient.cancelQueries({ queryKey: ["prices"] });
      const previousPrices = queryClient.getQueryData<PricesFields[]>([
        "prices",
      ]);
      queryClient.setQueryData(["prices"], (old: PricesFields[] = []) =>
        old.map((h) => (h.id === updatedPrice.id ? updatedPrice : h))
      );
      return { previousPrices };
    },
  });

  const { mutateAsync: deletePrice, isPending: isDeletingPrice } = useMutation({
    mutationFn: async ({
      priceId,
      ID,
      SDATE,
    }: {
      priceId: string;
      ID: string;
      SDATE: string;
    }) => {
      // send the updated data to API function
      const editDataInCSV = `D${delim}${ID}${delim}${SDATE?.toString().replace(
        /\//g,
        ""
      )}`;
      await FetchUpdateDeleteAPI(
        editDataInCSV
          .replace(/[\r\n]+/g, "")
          .replace(/\s*\|\s*/g, "|")
          .replace(/\|null\|/g, "||"),
        `IBIF_ex=frapipro_TableUpdate&CLIENT=${client}&theTable=FRPPRICE`
      ); // delete the PRICE
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated API delay
      return priceId;
    },
    onMutate: async ({ priceId }: { priceId: string }) => {
      await queryClient.cancelQueries({
        queryKey: ["prices", dateRange, client, assetNameData],
      });

      const previousPrices = queryClient.getQueryData<PricesFields[]>([
        "prices",
        dateRange,
        client,
      ]);

      queryClient.setQueryData(
        ["prices", dateRange, client, assetNameData],
        (old: PricesFields[] = []) => {
          const newData = old.filter((h: PricesFields) => h.id !== priceId);
          console.log("New Data After Deletion:", newData); // Debugging
          return newData;
        }
      );

      return { previousPrices };
    },
    onError: (err, priceId, context) => {
      if (context?.previousPrices) {
        queryClient.setQueryData(
          ["prices", dateRange, client],
          context.previousPrices
        );
      }
    },
  });

  const handleCreatePrice: MRT_TableOptions<PricesFields>["onCreatingRowSave"] =
    async ({ values, exitCreatingMode }) => {
      // Validate the values
      const errors = validatePrice(values);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors); // Set validation errors
        return; // Stop the save operation if there are errors
      }

      // Format DATES as expected date before saving
      const formattedValues = {
        ...values,
        SDATE: formatDateYYMD(values.SDATE),
      };

      try {
        await createPrice(formattedValues); // Save the new price
        exitCreatingMode(); // Exit create mode
        table.setCreatingRow(null); // Reset the editing state
        setValidationErrors({}); // Clear validation errors
      } catch (error) {
        console.error("Error creating price:", error);
      }
    };

  const handleSavePrice: MRT_TableOptions<PricesFields>["onEditingRowSave"] =
    async ({ values, table }) => {
      // Validate the values
      const errors = validatePrice(values);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors); // Set validation errors
        return; // Stop the save operation if there are errors
      }

      // Format DATES as expected date before saving
      const formattedValues = {
        ...values,
        SDATE: formatDateYYMD(values.SDATE),
      };

      try {
        await updatePrice(formattedValues); // Save the updated price
        table.setEditingRow(null); // Reset the editing state
        setValidationErrors({}); // Clear validation errors
      } catch (error) {
        console.error("Error updating price:", error);
      }
    };

  const openDeleteConfirmModal = (row: MRT_Row<PricesFields>) => {
    modals.openConfirmModal({
      key: `delete-modal-${row.id}`,
      title: "Delete prices?",
      children: (
        <Text>
          Delete {row.original.ID} ({row.original.SDATE})?
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () =>
        deletePrice({
          priceId: row.original.id,
          ID: row.original.ID,
          SDATE: row.original.SDATE,
        }),
      overlayProps: {
        opacity: 0.12, // Adjust this value (0-1) for desired darkness
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

  const handleExportRows = (rows: MRT_Row<PricesFields>[]) => {
    const rowData = rows.map((row) => ({
      ...row.original,
      ICPDATED: row.original.SDATE?.toString(), // Convert ICPDATED to string
    }));
    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  const handleExcelDataUpdate = (newData: PricesFields[]) => {
    setExcelData(newData); // Update excelData with the uploaded file data
    setIsUsingExcelData(true); // Switch to using Excel data
  };

  // Prepare data for Excel export
  const FRPPRICEExcel = finalData?.map(({ id, NAMETKR, ...rest }) => ({
    ...rest,
  }));

  const PDFheaders = [
    { label: "Asset ID", key: "ID" },
    { label: "Asset Name", key: "NAMETKR" },
    { label: "Price Date", key: "SDATE" },
    { label: "Price", key: "SPRICE" },
    { label: "Pricing Factor", key: "PRINFACT" },
  ];

  // Load data from excel to table
  const fieldnames = [
    "RECDTYPE",
    "ID",
    "SDATE",
    "SPRICE",
    "HID",
    "DATESTMP",
    "PRINFACT",
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
    mutateAsync: updatePriceExcel,
    isPending: isUpdatingTransactionExcel,
  } = useMutation({
    mutationFn: async () => {
      // send the updated data to API function
      await FetchUpdateDeleteAPIExcel(
        convertToCSV(finalData),
        `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPPRICE`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return Promise.resolve();
    },
    onMutate: async () => {},
  });

  const handleMRELoad = async () => {
    await updatePriceExcel();
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
    mantineToolbarAlertBannerProps: isLoadingPricesError
      ? { color: "red", children: "Failed to load data. Update your selection criteria." }
      : undefined,
    onCreatingRowSave: handleCreatePrice,
    onEditingRowSave: handleSavePrice,
    enableRowActions: true,
    mantineTableBodyCellProps: {
      className: "rpt-body",
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
      columnOrder: [
        "mrt-row-select",
        "mrt-row-actions",
        ...columns.map((column) => column.accessorKey as string),
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
              navigator.clipboard.writeText(JSON.stringify(row.original));
              table.setRowSelection({ [row.id]: true });
            }}
          >
            <CopyIcon />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Delete">
          <ActionIcon color="red" onClick={() => openDeleteConfirmModal(row)}>
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
            table.setCreatingRow(true);
          }}
          disabled={finalData?.length > 0 ? false : true}
          className="rpt-action-button"
        >
          Create New Prices
        </Button>
        <Button
          variant="subtle"
          disabled={
            !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
          }
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
          excelData={FRPPRICEExcel}
          reportName="FRPPRICE"
          PDFheaders={PDFheaders}
          portfolioName=""
          dateRange={dateRange}
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
      return (
        <>
          {internalColumnMenuItems}
          <Menu.Item
            style={{
              display:
                (column.columnDef.mantineTableHeadCellProps as any)?.align ===
                "right"
                  ? "block"
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
    renderCreateRowModalContent: ({ table, row, internalEditComponents }) => {
      setIsEditable(true);
      return (
        <Stack>
          <Flex className="mrt-model-title">
            <Title order={4} color="blue">
              Create New Price
            </Title>
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
      transitionProps: {
        transition: "fade",
        duration: 600,
        timingFunction: "linear",
      },
    },
    renderEditRowModalContent: ({ table, row, internalEditComponents }) => {
      setIsEditable(false);
      return (
        <Stack spacing="md">
          <Flex className="mrt-model-title">
            <Title order={4} color="blue">
              Edit Price
            </Title>
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
      transitionProps: {
        transition: "fade",
        duration: 600,
        timingFunction: "linear",
      },
    },

    state: {
      isLoading: isLoadingPrices,
      isSaving:
        isCreatingPrice ||
        isUpdatingPrice ||
        isDeletingPrice ||
        isUpdatingTransactionExcel,
      showAlertBanner: isLoadingPricesError,
      showProgressBars: isFetchingPrices,
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

const FrpPrices = () => (
  <ModalsProvider>
    <PricesMTable />
  </ModalsProvider>
);

export default FrpPrices;

const validatePrice = (price: PricesFields) => {
  const errors: Record<string, string> = {};

  if (!price.ID) {
    errors.ID = "Asset ID is required";
  }

  if (!price.SPRICE) {
    errors.SPRICE = "Price is required";
  }
  // Modified PRINFACT validation
  if (!price.PRINFACT || price.PRINFACT === "Not Defined") {
    errors.PRINFACT = "Please select a valid pricing factor";
  }

  return errors;
};
