import React, { useState } from "react";
import { MRT_EditActionButtons, MantineReactTable, type MRT_Row, type MRT_TableOptions, useMantineReactTable } from "mantine-react-table";
import { ActionIcon, Button, Flex, Text, Tooltip, Menu, Modal, Stack, Title } from "@mantine/core";
import { CopyIcon, EXPORT_SVG, AiIcon } from "../../../svgicons/svgicons.js";
import { ModalsProvider, modals } from "@mantine/modals";
import { IconEdit, IconTrash, IconPlus, IconRefresh } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import useClient from "../../hooks/useClient.js";
import { useExchangeRatesColumns, ExchangeRatessFields } from "../columnTitles/ExchangeRatesColumns.tsx";
import { formatToDateYYMMDD, formatFromDateYYMD, formatDateYYMD } from "../../hooks/FormatDates.tsx";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs
import { mkConfig, generateCsv, download } from "export-to-csv"; //or use your library of choice here

import { compareData } from "../../report-components/compareData.js";
import { Import } from "../../report-components/Import.js";
import { Export } from "../../report-components/Export.js";
import { PredictNumColumn } from "../../../aiAgents/PredictNumColumn.js";
import { FetchAPI, FetchUpdateDeleteAPI, FetchUpdateDeleteAPIExcel } from "../../../api.js";

type DateRange = string[];

type OutletContextType = {
  selectedPortfolio: string;
  setSelectedPortfolio: (portfolio: string) => void;
  dateRange: DateRange;
};

const ExchangeRatesMTable = () => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [finalData, setFinalData] = useState<ExchangeRatessFields[]>([]);
  const [excelData, setExcelData] = useState<ExchangeRatessFields[]>([]);
  const [isUsingExcelData, setIsUsingExcelData] = useState(false);
  const [isEditable, setIsEditable] = useState(false);

  const client = useClient();
  const delim = process.env.REACT_APP_DELIMITER;
  const { dateRange } = useOutletContext<OutletContextType>();
  const fromDate = formatFromDateYYMD(dateRange as [string, string]);
  const toDate = formatToDateYYMMDD(dateRange as [string, string]);
  // The main API URL for fetching exchangeRates
  const exchangeRateUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPEXCH&filters=XDATE(GT:${fromDate}:AND:XDATE:LE:${toDate})`;

  // Unified data fetch using React Query
  const {
    data: fetchedExchangeRates = [],
    isError: isLoadingExchangeRatesError,
    isFetching: isFetchingExchangeRates,
    isLoading: isLoadingExchangeRates,
  } = useQuery<ExchangeRatessFields[]>({
    queryKey: ["exchangeRates", dateRange, client],
    queryFn: async () => {
      const data = await FetchAPI(exchangeRateUri);
      return data.map((row) => {
        return {
          ...row,
          id: row.id || uuidv4(),
        };
      });
    },
    enabled: !!dateRange && !!client,
    refetchOnWindowFocus: false,
  });

  const [processedExchangeRates, setProcessedExchangeRates] = React.useState<ExchangeRatessFields[]>([]);

  React.useEffect(() => {
    console.log("Fetched ExchangeRates:", fetchedExchangeRates);
    if (Array.isArray(fetchedExchangeRates) && fetchedExchangeRates.length > 0) {
      setProcessedExchangeRates(
        fetchedExchangeRates?.map((row) => ({
          ...row,
          id: row.id || uuidv4(), // Assign UUID only if the row doesn't already have one
        }))
      );
    } else {
      console.error("fetched ExchangeRates is not an array:", fetchedExchangeRates);
    }
  }, [fetchedExchangeRates]);

  const keyFields = ["XDATE", "ISOF", "ISOT", "TYP"]; // Define key fields for comparison
  const nonKeyFields = ["XRATE"];
  const numericFields = ["XRATE"]; // Define numeric fields

  React.useEffect(() => {
    if (isUsingExcelData && excelData.length > 0) {
      setFinalData(compareData(excelData, processedExchangeRates, keyFields, nonKeyFields, numericFields));
      setIsUsingExcelData(false); // Switch back to using fetched data
    } else if (processedExchangeRates && processedExchangeRates.length > 0) {
      setFinalData(processedExchangeRates);
    } else if (finalData.length !== 0) {
      setFinalData([]);
    }
  }, [excelData, processedExchangeRates]);

  const columns = useExchangeRatesColumns(finalData, setFinalData, isEditable, client, validationErrors); // Get Column information

  const queryClient = useQueryClient();
  // Mutations
  const { mutateAsync: createdExchangeRate, isPending: isCreatingExchangeRate } = useMutation({
    mutationFn: async (createdExchangeRate: ExchangeRatessFields) => {
      // send the updated data to API function
      const editDataInCSV = `A${delim}${createdExchangeRate.XDATE?.toString().replace(/\//g, "")}
        ${delim}${createdExchangeRate.ISOF}${delim}${createdExchangeRate.ISOT}
        ${delim}${createdExchangeRate.TYP}${delim}${createdExchangeRate.XRATE}`;
      await FetchUpdateDeleteAPI(
        editDataInCSV
          .replace(/[\r\n]+/g, "")
          .replace(/\s*\|\s*/g, "|")
          .replace(/\|null\|/g, "||"),
        `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPEXCH`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return createdExchangeRate;
    },
    onMutate: async (newExchangeRates: ExchangeRatessFields) => {
      await queryClient.cancelQueries({
        queryKey: ["exchangeRates", dateRange, client],
      });

      const previousExchangeRates = queryClient.getQueryData<ExchangeRatessFields[]>(["exchangeRates", dateRange, client]) || [];

      queryClient.setQueryData(["exchangeRates", dateRange, client], (old: ExchangeRatessFields[] | undefined) => [
        ...(old ?? []),
        {
          ...newExchangeRates,
          id: uuidv4(),
        },
      ]);
      return { previousExchangeRates };
    },
  });

  const { mutateAsync: updateExchangeRate, isPending: isUpdatingExchangeRate } = useMutation({
    mutationFn: async (updatedExchangeRate: ExchangeRatessFields) => {
      // send the updated data to API function
      const editDataInCSV = `C${delim}${updatedExchangeRate.XDATE?.toString().replace(/\//g, "")}
        ${delim}${updatedExchangeRate.ISOF}${delim}${updatedExchangeRate.ISOT}
        ${delim}${updatedExchangeRate.TYP}${delim}${updatedExchangeRate.XRATE}
      `;
      await FetchUpdateDeleteAPI(
        editDataInCSV
          .replace(/[\r\n]+/g, "")
          .replace(/\s*\|\s*/g, "|")
          .replace(/\|null\|/g, "||"),
        `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPEXCH`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return updatedExchangeRate;
    },
    onMutate: async (updatedExchangeRate: ExchangeRatessFields) => {
      await queryClient.cancelQueries({ queryKey: ["exchangeRates"] });
      const previousExchangeRates = queryClient.getQueryData<ExchangeRatessFields[]>(["exchangeRates"]);
      queryClient.setQueryData(["exchangeRates"], (old: ExchangeRatessFields[] = []) => old.map((h) => (h.id === updatedExchangeRate.id ? updatedExchangeRate : h)));
      return { previousExchangeRates };
    },
  });

  const { mutateAsync: deleteExchangeRate, isPending: isDeletingExchangeRate } = useMutation({
    mutationFn: async ({ exchangeRateId, XDATE, ISOF, ISOT, TYP }: { exchangeRateId: string; XDATE: string; ISOF: string; ISOT: string; TYP: number }) => {
      // send the updated data to API function
      const editDataInCSV = `D${delim}${XDATE?.toString().replace(/\//g, "")}${delim}${ISOF}${delim}${ISOT}${delim}${TYP}`;
      await FetchUpdateDeleteAPI(
        editDataInCSV
          .replace(/[\r\n]+/g, "")
          .replace(/\s*\|\s*/g, "|")
          .replace(/\|null\|/g, "||"),
        `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPEXCH`
      ); // delete the PRICE
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated API delay
      return exchangeRateId;
    },
    onMutate: async ({ exchangeRateId }: { exchangeRateId: string }) => {
      await queryClient.cancelQueries({
        queryKey: ["exchangeRates", dateRange, client],
      });

      const previousExchangeRates = queryClient.getQueryData<ExchangeRatessFields[]>(["exchangeRates", dateRange, client]);

      queryClient.setQueryData(["exchangeRates", dateRange, client], (old: ExchangeRatessFields[] = []) => {
        const newData = old.filter((h: ExchangeRatessFields) => h.id !== exchangeRateId);
        console.log("New Data After Deletion:", newData); // Debugging
        return newData;
      });

      return { previousExchangeRates };
    },
    onError: (err, exchangeRateId, context) => {
      if (context?.previousExchangeRates) {
        queryClient.setQueryData(["exchangeRates", dateRange, client], context.previousExchangeRates);
      }
    },
  });

  const handleCreateExchangeRate: MRT_TableOptions<ExchangeRatessFields>["onCreatingRowSave"] = async ({ values, exitCreatingMode }) => {
    // Validate the values
    const errors = validateExchangeRate(values);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors); // Set validation errors
      return; // Stop the save operation if there are errors
    }

    // Format DATES as expected date before saving
    const formattedValues = {
      ...values,
      XDATE: values.XDATE === "" || null ? "19001201" : formatDateYYMD(values.XDATE),
    };

    try {
      await createdExchangeRate(formattedValues); // Save the new exchange rates
      exitCreatingMode(); // Exit create mode
      table.setCreatingRow(null); // Reset the editing state
      setValidationErrors({}); // Clear validation errors
    } catch (error) {
      console.error("Error creating exchange rates:", error);
    }
  };

  const handleSaveExchangeRate: MRT_TableOptions<ExchangeRatessFields>["onEditingRowSave"] = async ({ values, table }) => {
    // Validate the values
    const errors = validateExchangeRate(values);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors); // Set validation errors
      return; // Stop the save operation if there are errors
    }

    // Format DATES as expected date before saving
    const formattedValues = {
      ...values,
      XRATE: Number(values.XRATE), // Ensure XRATE is a number
    };

    try {
      await updateExchangeRate(formattedValues); // Save the updated exchange rates
      table.setEditingRow(null); // Reset the editing state
      setValidationErrors({}); // Clear validation errors
    } catch (error) {
      console.error("Error updating exchange rates:", error);
    }
  };

  const openDeleteConfirmModal = (row: MRT_Row<ExchangeRatessFields>) => {
    modals.openConfirmModal({
      key: `delete-modal-${row.id}`,
      title: "Delete exchange Rate?",
      children: <Text>Delete this exchange rate?</Text>,
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () =>
        deleteExchangeRate({
          exchangeRateId: row.original.id,
          XDATE: row.original.XDATE?.toString().replace(/\//g, ""),
          ISOF: row.original.ISOF,
          ISOT: row.original.ISOT,
          TYP: row.original.TYP,
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

  const handleExportRows = (rows: MRT_Row<ExchangeRatessFields>[]) => {
    const rowData = rows.map((row) => ({
      ...row.original,
      ICPDATED: row.original.XDATE?.toString(), // Convert ICPDATED to string
    }));
    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  const handleExcelDataUpdate = (newData: ExchangeRatessFields[]) => {
    setExcelData(newData); // Update excelData with the uploaded file data
    setIsUsingExcelData(true); // Switch to using Excel data
  };

  // Prepare data for Excel export
  const FRPEXCHExcel = finalData?.map(({ id, ...rest }) => ({
    ...rest,
  }));

  const PDFheaders = [
    { label: "Exchange Date", key: "XDATE" },
    { label: "ISO From", key: "ISOF" },
    { label: "ISO To", key: "ISOT" },
    { label: "Type", key: "TYP" },
    { label: "Exchange Rate", key: "XRATE", align: "right" },
  ];

  // Load data from excel to table
  const fieldnames = ["RECDTYPE", "XDATE", "ISOF", "ISOT", "TYP", "XRATE"];

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

  const { mutateAsync: updateExchangeRatesExcel, isPending: isUpdatingTransactionExcel } = useMutation({
    mutationFn: async () => {
      // send the updated data to API function
      await FetchUpdateDeleteAPIExcel(convertToCSV(finalData), `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPEXCH`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return Promise.resolve();
    },
    onMutate: async () => {},
  });

  const handleMRELoad = async () => {
    await updateExchangeRatesExcel();
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
    mantineToolbarAlertBannerProps: isLoadingExchangeRatesError ? { color: "red", children: "Failed to load data. Update your selection criteria." } : undefined,
    onCreatingRowSave: handleCreateExchangeRate,
    onEditingRowSave: handleSaveExchangeRate,
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
          Create New Exchange Rate
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
        <Export data={finalData} excelData={FRPEXCHExcel} reportName="FRPEXCH" PDFheaders={PDFheaders} portfolioName="" dateRange={dateRange} />
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
      return (
        <>
          {internalColumnMenuItems}
          <Menu.Item
            style={{
              display: (column.columnDef.mantineTableHeadCellProps as any)?.align === "right" ? "block" : "none",
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
              Create New Exchange Rate
            </Title>
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
              Edit Exchange Rate
            </Title>
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
    mantineEditRowModalProps: {
      transitionProps: {
        transition: "fade",
        duration: 600,
        timingFunction: "linear",
      },
    },

    state: {
      isLoading: isLoadingExchangeRates,
      isSaving: isCreatingExchangeRate || isUpdatingExchangeRate || isDeletingExchangeRate || isUpdatingTransactionExcel,
      showAlertBanner: isLoadingExchangeRatesError,
      showProgressBars: isFetchingExchangeRates,
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

const FrpExchangeRates = () => (
  <ModalsProvider>
    <ExchangeRatesMTable />
  </ModalsProvider>
);

export default FrpExchangeRates;

const validateExchangeRate = (exchangeRate: ExchangeRatessFields) => {
  const errors: Record<string, string> = {};

  /*   if (!exchangeRate.ISOF) {
    errors.ISOF = "ISO From is required";
  }

  if (!exchangeRate.TYP) {
    errors.TYP = "Type is required";
  } */
  // Modified PRINFACT validation
  if (!exchangeRate.XRATE || exchangeRate.XRATE < 0) {
    errors.XRATE = "Please select a valid exhange rate";
  }

  return errors;
};
