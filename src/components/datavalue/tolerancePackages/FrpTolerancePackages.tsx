import React, { useState } from "react";
import {
  MRT_EditActionButtons,
  MantineReactTable,
  type MRT_Row,
  type MRT_TableOptions,
  useMantineReactTable,
} from "mantine-react-table";
import {
  ActionIcon,
  Button,
  Flex,
  Text,
  Tooltip,
  Menu,
  Modal,
  Stack,
  Title,
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
import useClient from "../../hooks/useClient.js";
import {
  useTolerancePackagesColumns,
  TolerancePackagesFields,
} from "../columnTitles/TolerancePackagesColumns.tsx";
import {
  formatToDateYYMMDD,
  formatDateYYMD,
  formatFromDateYYMD,
} from "../../hooks/FormatDates.tsx";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs
import { mkConfig, generateCsv, download } from "export-to-csv"; //or use your library of choice here

import { compareData } from "../../report-components/compareData.js";
import { Import } from "../../report-components/Import.js";
import { Export } from "../../report-components/Export.js";
import { PredictNumColumn } from "../../../aiAgents/PredictNumColumn.js";
import {
  FetchAPI,
  FetchUpdateDeleteAPI,
  FetchUpdateDeleteAPIExcel,
} from "../../../api.js";
import { useSectorName } from "../../hooks/useFrpNamesFiltersDDLsApi.js";

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
  const [finalData, setFinalData] = useState<TolerancePackagesFields[]>([]);
  const [excelData, setExcelData] = useState<TolerancePackagesFields[]>([]);
  const [isUsingExcelData, setIsUsingExcelData] = useState(false);
  const [isEditable, setIsEditable] = useState(false);

  const client = useClient();
  const delim = process.env.REACT_APP_DELIMITER;
  const { dateRange } = useOutletContext<OutletContextType>();
  const { data: sectorNameData } = useSectorName(client); // Fetch sector name data
  // The main API URL for fetching tolerancePackages
  const priceUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPTOLRP`;

  // Unified data fetch using React Query
  const {
    data: fetchedPrices = [],
    isError: isLoadingPricesError,
    isFetching: isFetchingPrices,
    isLoading: isLoadingPrices,
  } = useQuery<TolerancePackagesFields[]>({
    queryKey: ["tolerancePackages", dateRange, client],
    queryFn: async () => {
      const data = await FetchAPI(priceUri);

      return data.map((row) => {
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
          SNAME: matchedSectorName, // add SNAME1 field conditionally
        };
      });
    },
    enabled: !!dateRange && !!client && !!sectorNameData,
    refetchOnWindowFocus: false,
  });

  const [processedPrices, setProcessedPrices] = React.useState<
    TolerancePackagesFields[]
  >([]);

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

  const keyFields = ["PKG", "COUNTRY", "SECTOR"];
  const nonKeyFields = ["INDX"];
  const numericFields = ["LOW", "HIGH"]; // Define numeric fields

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

  const columns = useTolerancePackagesColumns(client, isEditable, validationErrors); // Get Column information

  const queryClient = useQueryClient();
  // Mutations
  const { mutateAsync: createTolerancePackage, isPending: isCreatingPrice } =
    useMutation({
      mutationFn: async (createTolerancePackage: TolerancePackagesFields) => {
        // send the updated data to API function
        const editDataInCSV = `A${delim}${createTolerancePackage.COUNTRY}${delim}${createTolerancePackage.PKG}
        ${delim}${createTolerancePackage.SECTOR}${delim}${createTolerancePackage.LOW}${delim}${createTolerancePackage.HIGH}${delim}${createTolerancePackage.INDX}
      `;
        await FetchUpdateDeleteAPI(
          editDataInCSV.replace(/\s+/g, ""),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPTOLRP`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return createTolerancePackage;
      },
      onMutate: async (newPrices: TolerancePackagesFields) => {
        await queryClient.cancelQueries({
          queryKey: ["tolerancePackages", dateRange, client],
        });

        const previousPrices =
          queryClient.getQueryData<TolerancePackagesFields[]>([
            "tolerancePackages",
            dateRange,
            client,
          ]) || [];

        queryClient.setQueryData(
          ["tolerancePackages", dateRange, client],
          (old: TolerancePackagesFields[] | undefined) => [
            ...(old ?? []),
            {
              ...newPrices,
              id: uuidv4(),
            },
          ]
        );
        return { previousPrices };
      },
    });

  const { mutateAsync: updateTolerancePackage, isPending: isUpdatingPrice } =
    useMutation({
      mutationFn: async (updateTolerancePackage: TolerancePackagesFields) => {
        // send the updated data to API function
        const editDataInCSV = `C${delim}${updateTolerancePackage.COUNTRY}${delim}${updateTolerancePackage.PKG}
        ${delim}${updateTolerancePackage.SECTOR}${delim}${updateTolerancePackage.LOW}${delim}${updateTolerancePackage.HIGH}${delim}${updateTolerancePackage.INDX}
      `;
        await FetchUpdateDeleteAPI(
          editDataInCSV
            .replace(/[\r\n]+/g, "")
            .replace(/\s*\|\s*/g, "|")
            .replace(/\|null\|/g, "||"),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPTOLRP`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return updateTolerancePackage;
      },
      onMutate: async (updateTolerancePackage: TolerancePackagesFields) => {
        await queryClient.cancelQueries({ queryKey: ["tolerancePackages"] });
        const previousPrices = queryClient.getQueryData<
          TolerancePackagesFields[]
        >(["tolerancePackages"]);
        queryClient.setQueryData(
          ["tolerancePackages"],
          (old: TolerancePackagesFields[] = []) =>
            old.map((h) =>
              h.id === updateTolerancePackage.id ? updateTolerancePackage : h
            )
        );
        return { previousPrices };
      },
    });

  const { mutateAsync: deleteTolerancePackage, isPending: isDeletingPrice } =
    useMutation({
      mutationFn: async ({
        tolrpId,
        PKG,
        COUNTRY,
        SECTOR,
      }: {
        tolrpId: string;
        PKG: string;
        COUNTRY: string;
        SECTOR: string;
      }) => {
        // send the updated data to API function
        const editDataInCSV = `D${delim}${PKG}${delim}${COUNTRY}${delim}${SECTOR})}`;
        await FetchUpdateDeleteAPI(
          editDataInCSV
            .replace(/[\r\n]+/g, "")
            .replace(/\s*\|\s*/g, "|")
            .replace(/\|null\|/g, "||"),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPTOLRP`
        ); // delete the TOLRP
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated API delay
        return tolrpId;
      },
      onMutate: async ({ tolrpId }: { tolrpId: string }) => {
        await queryClient.cancelQueries({
          queryKey: ["tolerancePackages", dateRange, client],
        });

        const previousPrices = queryClient.getQueryData<
          TolerancePackagesFields[]
        >(["tolerancePackages", dateRange, client]);

        queryClient.setQueryData(
          ["tolerancePackages", dateRange, client],
          (old: TolerancePackagesFields[] = []) => {
            const newData = old.filter(
              (h: TolerancePackagesFields) => h.id !== tolrpId
            );
            console.log("New Data After Deletion:", newData); // Debugging
            return newData;
          }
        );

        return { previousPrices };
      },
      onError: (err, tolrpId, context) => {
        if (context?.previousPrices) {
          queryClient.setQueryData(
            ["tolerancePackages", dateRange, client],
            context.previousPrices
          );
        }
      },
    });

  const handleCreateTolerancePackage: MRT_TableOptions<TolerancePackagesFields>["onCreatingRowSave"] =
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
        await createTolerancePackage(formattedValues); // Save the new tolerancePackage
        exitCreatingMode(); // Exit create mode
        table.setCreatingRow(null); // Reset the editing state
        setValidationErrors({}); // Clear validation errors
      } catch (error) {
        console.error("Error creating tolerancePackage:", error);
      }
    };

  const handleSaveTolerancePackage: MRT_TableOptions<TolerancePackagesFields>["onEditingRowSave"] =
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
        await updateTolerancePackage(formattedValues); // Save the updated tolerancePackage
        table.setEditingRow(null); // Reset the editing state
        setValidationErrors({}); // Clear validation errors
      } catch (error) {
        console.error("Error updating tolerancePackage:", error);
      }
    };

  const openDeleteConfirmModal = (row: MRT_Row<TolerancePackagesFields>) => {
    modals.openConfirmModal({
      key: `delete-modal-${row.id}`,
      title: "Delete Tolerance Package",
      children: (
        <Text>
          Delete {row.original.PKG} ({row.original.COUNTRY})?
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () =>
        deleteTolerancePackage({
          tolrpId: row.original.id,
          PKG: row.original.PKG,
          COUNTRY: row.original.COUNTRY,
          SECTOR: row.original.SECTOR,
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

  const handleExportRows = (rows: MRT_Row<TolerancePackagesFields>[]) => {
    const rowData = rows.map((row) => ({
      ...row.original,
    }));
    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  const handleExcelDataUpdate = (newData: TolerancePackagesFields[]) => {
    setExcelData(newData); // Update excelData with the uploaded file data
    setIsUsingExcelData(true); // Switch to using Excel data
  };

  // Prepare data for Excel export
  const FRPTOLRPExcel = finalData?.map(({ id, SNAME, ...rest }) => ({
    ...rest,
  }));

  const PDFheaders = [
    { label: "Benchmark Package ID", key: "PKG" },
    { label: "Country ID", key: "COUNTRY" },
    { label: "Sector ID", key: "SECTOR" },
    { label: "Sector Name", key: "SNAME" },
    { label: "Lowest Return Allowed", key: "LOW" },
    { label: "Highest Return Allowed", key: "HIGH" },
    { label: "Benchmark", key: "INDX" },
  ];

  // Load data from excel to table
  const fieldnames = [
    "RECDTYPE",
    "PKG",
    "COUNTRY",
    "SECTOR",
    "LOW",
    "HIGH",
    "INDX",
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
    mutateAsync: updateTolerancePackageExcel,
    isPending: isUpdatingTransactionExcel,
  } = useMutation({
    mutationFn: async () => {
      // send the updated data to API function
      await FetchUpdateDeleteAPIExcel(
        convertToCSV(finalData),
        `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPTOLRP`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return Promise.resolve();
    },
    onMutate: async () => {},
  });

  const handleMRELoad = async () => {
    await updateTolerancePackageExcel();
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
      ? {
          color: "red",
          children: "Failed to load data. Update your selection criteria.",
        }
      : undefined,
    onCreatingRowSave: handleCreateTolerancePackage,
    onEditingRowSave: handleSaveTolerancePackage,
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
          Create New Tolerance Package
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
          excelData={FRPTOLRPExcel}
          reportName="FRPTOLRP"
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
              Create New Tolerance Package
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
              Edit Tolerance Package
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

const validatePrice = (tolerancePackage: TolerancePackagesFields) => {
  const errors: Record<string, string> = {};

  if (!tolerancePackage.PKG) {
    errors.ID = "Package ID is required";
  }

  if (!tolerancePackage.COUNTRY) {
    errors.COUNTRY = "Country is required";
  }
  // Modified PRINFACT validation
  if (!tolerancePackage.SECTOR) {
    errors.SECTOR = "Sector is required";
  }

  return errors;
};
