import React, { useState } from "react";
import {
  MRT_EditActionButtons,
  MantineReactTable,
  type MRT_Row,
  type MRT_TableOptions,
  useMantineReactTable,
} from "mantine-react-table";
import { ActionIcon, Button, Flex, Text, Tooltip, Menu, Modal, Stack, Title, Grid} from "@mantine/core";
import { CopyIcon, EXPORT_SVG, AiIcon } from "../../../svgicons/svgicons.js";
import { ModalsProvider, modals } from "@mantine/modals";
import { IconEdit, IconTrash, IconPlus, IconRefresh} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import useClient from "../../hooks/useClient.js";
import { useSectorsColumns, SectorsFields} from "../columnTitles/SectorsColumns.tsx";
import { formatToDateYYM, formatFromDateYYM, formatDateYYMD } from "../../hooks/FormatDates.tsx";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs
import { mkConfig, generateCsv, download } from "export-to-csv"; //or use your library of choice here

import { compareData } from "../../report-components/compareData.js";
import { Import } from "../../report-components/Import.js";
import { Export } from "../../report-components/Export.js";
import { PredictNumColumn } from "../../../aiAgents/PredictNumColumn.js";
import { FetchAPI, FetchUpdateDeleteAPI, FetchUpdateDeleteAPIExcel } from "../../../api.js";
import { useAccountName, useSectorName } from "../../hooks/useFrpNamesFiltersDDLsApi.js";

type DateRange = string[];

type OutletContextType = {
  selectedPortfolio: string;
  setSelectedPortfolio: (portfolio: string) => void;
  dateRange: DateRange;
};

const SectorsMTable = () => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [finalData, setFinalData] = useState<SectorsFields[]>([]);
  const [excelData, setExcelData] = useState<SectorsFields[]>([]);
  const [isUsingExcelData, setIsUsingExcelData] = useState(false);
  const [isEditable, setIsEditable] = useState(false);

  const client = useClient();
  const delim = process.env.REACT_APP_DELIMITER;
  const { selectedPortfolio, setSelectedPortfolio } =  useOutletContext<OutletContextType>();
  const { dateRange } = useOutletContext<OutletContextType>();
  const fromDate = formatFromDateYYM(dateRange as [string, string]) ;
  const toDate = formatToDateYYM(dateRange as [string, string]);
  const { data: accountNameData } = useAccountName(selectedPortfolio, client); // Fetch account name data
  const { data: sectorNameData } = useSectorName(client); // Fetch sector name data
  

  const sectorUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPSECTR&filters=ACCT(${selectedPortfolio});ADATE(GT:${fromDate}:AND:ADATE:LE:${toDate})`;

  // Unified data fetch using React Query
  const {
    data: fetchedSectors = [],
    isError: isLoadingSectorsError,
    isFetching: isFetchingSectors,
    isLoading: isLoadingSectors,
  } = useQuery<SectorsFields[]>({
    queryKey: ["sectors", selectedPortfolio, dateRange, client],
    queryFn: async () => {
      const data = await FetchAPI(sectorUri);
          return data.map((row) => {
                // Account name matching
                const matchedAccount = accountNameData?.find(account => account.ACCT === row.ACCT);
            const matchedAccountName = matchedAccount?.NAME === null || undefined ? "Name Not Defined" : matchedAccount?.NAME;
            
            // Sector name matching - assuming sectorNameData is an array
          const matchedSector = sectorNameData?.find(sector => sector.SORI === row.SECTOR);
          const matchedSectorName = matchedSector?.SORINAME === undefined ? "Name Not Defined" : matchedSector?.SORINAME;
                
                return {
                    ...row,
                    id: row.id || uuidv4(),
                    NAME: matchedAccountName, // add NAME field conditionally
                    SNAME: matchedSectorName  // add sector name field
                };
            });
    },
    enabled: !!selectedPortfolio && !!dateRange && !!client && !!accountNameData && !!sectorNameData,
    refetchOnWindowFocus: false,
  });

  const [processedSectors, setProcessedSectors] = React.useState<
    SectorsFields[]
  >([]);

  React.useEffect(() => {
    console.log("Fetched Sectors:", fetchedSectors);
    if (Array.isArray(fetchedSectors) && fetchedSectors.length > 0) {
      setProcessedSectors(
        fetchedSectors?.map((row) => ({
          ...row,
          id: row.id || uuidv4(), // Assign UUID only if the row doesn't already have one
        }))
      );
    } else {
      console.error("fetchedSectors is not an array:", fetchedSectors);
    }
  }, [fetchedSectors]);

  const keyFields = ["ACCT", "COUNTRY", "SECTOR", "ADATE"];
  const nonKeyFields = ["STATUS", "SRCFREQ", "DATESTMP"];
  const numericFields = [ "SRCTOL", "UVR", "MKT", "INC", "ACC", "POL", "POS", "NEG", "PF", "NF", "UVRL", "LINKUVR", "LINKCK", "PMKT", "PACC", "DFLOWS"]; // Define numeric fields

  React.useEffect(() => {
    if (isUsingExcelData && excelData.length > 0) {
      setFinalData(
        compareData(
          excelData,
          processedSectors,
          keyFields,
          nonKeyFields,
          numericFields
        )
      );
      setIsUsingExcelData(false); // Switch back to using fetched data
      setSelectedPortfolio(excelData[0]?.ACCT);
    } else if (processedSectors && processedSectors.length > 0) {
      setFinalData(processedSectors);
    } else if (finalData.length !== 0) {
      setFinalData([]);
    }
  }, [excelData, processedSectors]);

  const columns = useSectorsColumns(
    setFinalData,
    client,
    isEditable,
    validationErrors
  ); // Get Column information

  const queryClient = useQueryClient();
  // Mutations
  const { mutateAsync: createSector, isPending: isCreatingSector } =
    useMutation({
      mutationFn: async (createSector: SectorsFields) => {
        // send the updated data to API function
        const editDataInCSV = `A${delim}${createSector.ACCT}${delim}${
          createSector.COUNTRY
        }${delim}${createSector.SECTOR}
        ${delim}${createSector.ADATE?.toString().replace(/\//g, "")}${delim}${
          createSector.UVR
        }${createSector.MKT}${createSector.INC}${createSector.ACC}${
          createSector.POL
        }${createSector.POS}${createSector.NEG}
        ${createSector.PF}${createSector.NF}${createSector.STATUS}${
          createSector.SRCFREQ
        }${createSector.SRCTOL}${createSector.UVRL}${createSector.LINKUVR}${
          createSector.LINKCK
        }${delim}
        ${createSector.DATESTMP?.toString().replace(/\//g, "")}${delim}${
          createSector.PMKT
        }${delim}${createSector.PACC}${delim}${createSector.DFLOWS}`;
        await FetchUpdateDeleteAPI(
          editDataInCSV.replace(/\s+/g, ""),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPSECTR`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return createSector;
      },
      onMutate: async (newSectors: SectorsFields) => {
        await queryClient.cancelQueries({
          queryKey: ["sectors", selectedPortfolio, dateRange, client],
        });

        const previousSectors =
          queryClient.getQueryData<SectorsFields[]>([
            "sectors",
            selectedPortfolio,
            dateRange,
            client,
          ]) || [];

        queryClient.setQueryData(
          ["sectors", selectedPortfolio, dateRange, client],
          (old: SectorsFields[] | undefined) => [
            ...(old ?? []),
            {
              ...newSectors,
              id: uuidv4(),
            },
          ]
        );
        return { previousSectors };
      },
    });

  const { mutateAsync: updateSector, isPending: isUpdatingSector } =
    useMutation({
      mutationFn: async (updatedSector: SectorsFields) => {
        console.log("Updated Sector:", updatedSector); // Log the updated sector
        // send the updated data to API function
        const editDataInCSV = `C${delim}${updatedSector.ACCT}${delim}${updatedSector.COUNTRY}${delim}${updatedSector.SECTOR}
       ${delim}${updatedSector.ADATE}${delim}${updatedSector.UVR}${updatedSector.MKT}${updatedSector.INC}${updatedSector.ACC}${updatedSector.POL}${updatedSector.POS}${updatedSector.NEG}
       ${updatedSector.PF}${updatedSector.NF}${updatedSector.STATUS}${updatedSector.SRCFREQ}${updatedSector.SRCTOL}${updatedSector.UVRL}${updatedSector.LINKUVR}${updatedSector.LINKCK}${delim}
       ${updatedSector.DATESTMP}${delim}${updatedSector.PMKT}${delim}${updatedSector.PACC}${delim}${updatedSector.DFLOWS}`;
        await FetchUpdateDeleteAPI(
          editDataInCSV.replace(/\s+/g, ""),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPSECTR`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return updatedSector;
      },
      onMutate: async (updatedSector: SectorsFields) => {
        await queryClient.cancelQueries({ queryKey: ["sectors"] });
        const previousSectors = queryClient.getQueryData<SectorsFields[]>([
          "sectors",
        ]);
        queryClient.setQueryData(["sectors"], (old: SectorsFields[] = []) =>
          old.map((h) => (h.id === updatedSector.id ? updatedSector : h))
        );
        return { previousSectors };
      },
    });

  const { mutateAsync: deleteSector, isPending: isDeletingSector } =
    useMutation({
      mutationFn: async ({
        sectorId,
        ACCT,
        COUNTRY,
        SECTOR,
        ADATE,
      }: {
        sectorId: string;
        ACCT: string;
        COUNTRY: string;
        SECTOR: string;
        ADATE: string;
      }) => {
        // send the updated data to API function
        // const editDataInCSV = `D${delim}${ACCT}`;
        const editDataInCSV = `D${delim}${ACCT}${delim}${COUNTRY}${delim}${SECTOR}${delim}${ADATE}`;
        const lsectorsDeleteUri = `IBIF_ex=frapipro_TableUpdate&CLIENT=${client}&theTable=FRPSECTR`;

        await FetchUpdateDeleteAPI(
          editDataInCSV
            .replace(/[\r\n]+/g, "")
            .replace(/\s*\|\s*/g, "|")
            .replace(/\|null\|/g, "||"),
          lsectorsDeleteUri
        ); // delete the sectors
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated API delay
        return sectorId;
      },

      onMutate: async ({ sectorId }: { sectorId: string }) => {
        await queryClient.cancelQueries({
          queryKey: ["sectors", selectedPortfolio, dateRange, client],
        });

        const previousSectors = queryClient.getQueryData<SectorsFields[]>([
          "sectors",
          selectedPortfolio,
          dateRange,
          client,
        ]);

        // Optimistically update the cache by removing the deleted row
        queryClient.setQueryData(
          ["sectors", selectedPortfolio, dateRange, client],
          (old: SectorsFields[] = []) => {
            const newData = old.filter((h: SectorsFields) => h.id !== sectorId);
            console.log("New Data After Deletion:", newData); // Debugging
            return newData;
          }
        );

        return { previousSectors };
      },
    });

  const handleCreateSector: MRT_TableOptions<SectorsFields>["onCreatingRowSave"] =
    async ({ values, exitCreatingMode }) => {
      // Validate the values
      const errors = validateSector(values, true);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors); // Set validation errors
        console.log("Validation errors:", errors); // Log the errors
        return; // Stop the save operation if there are errors
      }

      // Format DATES as expected date before saving
      const formattedValues = {
        ...values,
        SDATE: formatDateYYMD(values.SDATE),
      };

      console.log('---------------- formatted values: ', formattedValues);

      try {
        await createSector(formattedValues); // Save the new sector
        exitCreatingMode(); // Exit create mode
        table.setCreatingRow(null); // Reset the editing state
        setValidationErrors({}); // Clear validation errors
      } catch (error) {
        console.error("Error creating sector:", error);
      }
    };

  const handleSaveSector: MRT_TableOptions<SectorsFields>["onEditingRowSave"] =
    async ({ values, table }) => {
      console.log("Saving sector:", values); // Log the values being saved
      // Validate the values
      const errors = validateSector(values, false);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors); // Set validation errors
        console.log("Validation errors:", errors); // Log the errors
        return; // Stop the save operation if there are errors
      }

      // Format DATES as expected date before saving
      const formattedValues = {
        ...values,
        SDATE: formatDateYYMD(values.SDATE),
      };

      try {
        await updateSector(formattedValues); // Save the updated sector
        table.setEditingRow(null); // Reset the editing state
        setValidationErrors({}); // Clear validation errors
      } catch (error) {
        console.error("Error updating sector:", error);
      }
    };

  const openDeleteConfirmModal = (row: MRT_Row<SectorsFields>) => {
    modals.openConfirmModal({
      key: `delete-modal-${row.id}`,
      title: "Delete sectors?",
      children: (
        <Text>
          Delete {row.original.ACCT} ({row.original.COUNTRY})?
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: {
        color: "red",
        loading: isDeletingSector,
      },
      onConfirm: () =>
        deleteSector({
          sectorId: row.original.id,
          ACCT: row.original.ACCT,
          COUNTRY: row.original.COUNTRY,
          SECTOR: row.original.SECTOR,
          ADATE: `${row.original.ADATE?.toString().replace(/\//g, "")}`,
        }),
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

  const handleExportRows = (rows: MRT_Row<SectorsFields>[]) => {
    const rowData = rows.map((row) => ({
      ...row.original,
      ICPDATED: row.original.ADATE?.toString(), // Convert ICPDATED to string
    }));
    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  const handleExcelDataUpdate = (newData: SectorsFields[]) => {
    setExcelData(newData); // Update excelData with the uploaded file data
    setIsUsingExcelData(true); // Switch to using Excel data
  };

  const FRPSECTRExcel = finalData?.map((frpsector) => ({
    ACCT: frpsector.ACCT,
    COUNTRY: frpsector.COUNTRY,
    SECTOR: frpsector.SECTOR,
    ADATE: frpsector.ADATE,
    UVR: frpsector.UVR,
    MKT: frpsector.MKT,
    INC: frpsector.INC,
    ACC: frpsector.ACC,
    POL: frpsector.POL,
    POS: frpsector.POS,
    NEG: frpsector.NEG,
    PF: frpsector.PF,
    NF: frpsector.NF,
    STATUS: frpsector.STATUS,
    SRCFREQ: frpsector.SRCFREQ,
    SRCPOL: frpsector.SRCTOL,
    UVRL: frpsector.UVRL,
    LINKUVR: frpsector.LINKUVR,
    LINKCK: frpsector.LINKCK,
    DATESTMP: frpsector.DATESTMP,
    PMKT: frpsector.PMKT,
    PACC: frpsector.PACC,
    DFLOWS: frpsector.DFLOWS,
  }));

  const PDFheaders = [
    { label: "Portfolio ID", key: "ACCT" },
    { label: "Portfolio Name", key: "NAME" },
    { label: "Country", key: "COUNTRY" },
    { label: "Sector", key: "SECTOR" },
    { label: "Sector Name", key: "SNAME" },
    { label: "As of Date", key: "ADATE" },
    { label: "Unit Value Return", key: "UVR" },
    { label: "Market Value", key: "MKT" },
    { label: "Income Received", key: "INC" },
    { label: "Accrual", key: "ACC" },
    { label: "Policy", key: "POL" },
    { label: "Positive Flows", key: "POS" },
    { label: "Negative Flows", key: "NEG" },
  ];

  // Load data from excel to table
  const fieldnames = [ "RECDTYPE", "ACCT", "COUNTRY", "SECTOR", "ADATE", "UVR", "MKT", "INC", "ACC", "POL", "POS", "NEG", "PF",
    "NF", "STATUS", "SRCFREQ", "SRCPOL", "UVRL", "LINKUVR", "LINKCK", "DATESTMP", "PMKT", "PACC", "DFLOWS"
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
    mutateAsync: updateSectorExcel,
    isPending: isUpdatingTransactionExcel,
  } = useMutation({
    mutationFn: async () => {
      // send the updated data to API function
      await FetchUpdateDeleteAPIExcel(
        convertToCSV(finalData),
        `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPSECTR`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return Promise.resolve();
    },
    onMutate: async () => {},
  });

  const handleMRELoad = async () => {
    await updateSectorExcel();
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
    mantineToolbarAlertBannerProps: isLoadingSectorsError
      ? { color: "red", children: "Failed to load data. Update your selection criteria." }
      : undefined,
    onCreatingRowSave: handleCreateSector,
    onEditingRowSave: handleSaveSector,
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
          Create New Sectors
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
          excelData={FRPSECTRExcel}
          reportName="FRPSECTR"
          PDFheaders={PDFheaders}
          portfolioName=""
          dateRange={dateRange}
        />

        <Button
          variant="subtle"
          leftIcon={<IconRefresh size={20} />}
          onClick={handleMRELoad}
          className={ excelData?.length > 0 && finalData.length > 0 ? "rpt-action-button" : ""}
          disabled={ excelData?.length > 0 && finalData.length > 0 ? false : true}
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
    renderCreateRowModalContent: ({ table, row, internalEditComponents }) => {
      setIsEditable(true);
      return (
        <Stack>
          <Flex className="mrt-model-title">
            <Title order={4} color="blue">
              Create New Sector
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
          <Grid>
            {internalEditComponents.map((component, index) => (
              <Grid.Col span={3} key={index}>
                {" "}
                {/* 4 columns layout */}
                {component}
              </Grid.Col>
            ))}
          </Grid>

          <Flex justify="flex-end" mt="xl">
            <MRT_EditActionButtons variant="text" table={table} row={row} />
          </Flex>
        </Stack>
      );
    },
    mantineCreateRowModalProps: {
      size: "50%",
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
        <Stack spacing="md">
          {" "}
          {/* Adjust spacing as needed */}
          <Flex className="mrt-model-title">
            <Title order={4} color="blue">
              Edit Sector
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
          {/* Remove the Grid and Grid.Col, and use Stack for vertical layout */}
          <Grid>
            {internalEditComponents.map((component, index) => (
              <Grid.Col span={3} key={index}>
                {component}
              </Grid.Col>
            ))}
          </Grid>
          <Flex justify="flex-end" mt="xl">
            <MRT_EditActionButtons variant="text" table={table} row={row} />
          </Flex>
        </Stack>
      );
    },
    mantineEditRowModalProps: {
      size: "50%",
      yOffset: "2vh",
      xOffset: 10,
      transitionProps: {
        transition: "fade",
        duration: 600,
        timingFunction: "linear",
      },
    },

    state: {
      isLoading: isLoadingSectors,
      isSaving:
        isCreatingSector ||
        isUpdatingSector ||
        isDeletingSector ||
        isUpdatingTransactionExcel,
      showAlertBanner: isLoadingSectorsError,
      showProgressBars: isFetchingSectors,
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

const FrpSectors = () => (
  <ModalsProvider>
    <SectorsMTable />
  </ModalsProvider>
);

export default FrpSectors;

const validateSector = (sector: SectorsFields, isEditable: boolean) => {
  const errors: Record<string, string> = {};

  // Always validate these fields (required in both create and edit modes)
  if (!sector.ACCT) errors.ACCT = "Portfolio ID is required";
  if (!sector.COUNTRY) errors.COUNTRY = "Country is required";
  if (!sector.SECTOR) errors.SECTOR = "Sector is required";

  // Only validate these fields if in editable mo
  if (!sector.UVR) errors.UVR = "Unit Value Return is required";
  if (!sector.MKT) errors.MKT = "Market Value is required";
  if (!sector.INC) errors.INC = "Income Received is required";
  if (!sector.ACC) errors.ACC = "Accrual is required";
  // Add other fields that should only be validated when editable

  // Fields that should always be validated (even when not editable)
  if (!sector.ADATE) errors.ADATE = "As of Date is required";

  return errors;
};
