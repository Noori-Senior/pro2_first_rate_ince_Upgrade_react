import React, { useState } from "react";
import {
  MRT_EditActionButtons,
  MantineReactTable,
  type MRT_Row,
  type MRT_TableOptions,
  useMantineReactTable,
  createRow,
} from "mantine-react-table";
import { ActionIcon, Button, Flex, Text, Tooltip, Divider, Menu, Modal, Stack, Title } from "@mantine/core";
import { CopyIcon, EXPORT_SVG, AiIcon } from "../../../svgicons/svgicons.js";
import { ModalsProvider, modals } from "@mantine/modals";
import { IconEdit, IconTrash, IconPlus, IconRefresh} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import { FetchAPI, FetchUpdateDeleteAPI, FetchUpdateDeleteAPIExcel} from "../../../api.js";
import useClient from "../../hooks/useClient.js";
import { useDirectedAssetsColumns, DirectedAssetsFields } from "../columnTitles/DirectedAssetsColumns.tsx";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs
import { mkConfig, generateCsv, download } from "export-to-csv"; //or use your library of choice here

import { compareData } from "../../report-components/compareData.js";
import { Import } from "../../report-components/Import.js";
import { Export } from "../../report-components/Export.js";
import { PredictNumColumn } from "../../../aiAgents/PredictNumColumn.js";
import { useAccountName, useAssetName, useSectorName } from "../../hooks/useFrpNamesFiltersDDLsApi.js";

type DateRange = string[];

type OutletContextType = {
  selectedPortfolio: string;
  setSelectedPortfolio: (portfolio: string) => void;
  dateRange: DateRange;
};

const DirectedAssetsMTable = () => {
  const [finalData, setFinalData] = useState<DirectedAssetsFields[]>([]);
  const [excelData, setExcelData] = useState<DirectedAssetsFields[]>([]);
  const [isUsingExcelData, setIsUsingExcelData] = useState(false);
  const [isEditAble, setIsEditable] = useState<boolean>(false);

  const client = useClient();
  const delim = process.env.REACT_APP_DELIMITER;
  const { selectedPortfolio, setSelectedPortfolio } =  useOutletContext<OutletContextType>();

  const { data: accountNameData } = useAccountName(selectedPortfolio, client); // Fetch account name data
  const { data: assetNameData } = useAssetName(client); // Fetch asset name data
  const { data: sectorNameData } = useSectorName(client); // Fetch sector name data

  const ldirectedAssetUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPDRCTD&filters=AACCT(${selectedPortfolio})`;

  // Unified data fetch using React Query
  const {
    data: fetchedDirectedAssets = [],
    isError: isLoadingDirectedAssetsError,
    isFetching: isFetchingDirectedAssets,
    isLoading: isLoadingDirectedAssets,
  } = useQuery<DirectedAssetsFields[]>({
    queryKey: ["directedAssets", selectedPortfolio, client, accountNameData, assetNameData, sectorNameData],
    queryFn: async () => {
      const data = await FetchAPI(ldirectedAssetUri);
      
      return data.map((row) => {
          // Account name matching
          const matchedAccount = accountNameData?.find(account => account.ACCT === row.AACCT);
          const matchedAccountName = matchedAccount?.NAME === undefined ? "Name Not Defined" : matchedAccount?.NAME;
          
          // Asset name matching - assuming assetNameData is an array
          const matchedAsset = assetNameData?.find(asset => asset.ID === row.HID);
          const matchedAssetName = matchedAsset?.NAMETKR === undefined ? "Name Not Defined" : matchedAsset?.NAMETKR;
          
          // Sector name matching - assuming sectorNameData is an array
          const matchedSector1 = sectorNameData?.find(sector => sector.SORI === row.HDIRECT1);
          const matchedSectorName1 = matchedSector1?.SORINAME === undefined ? "Name Not Defined" : matchedSector1?.SORINAME;
          
          // Sector name matching - assuming sectorNameData is an array
          const matchedSector2 = sectorNameData?.find(sector2 => sector2.SORI === row.HDIRECT2);
          const matchedSectorName2 = matchedSector2?.SORINAME === undefined ? "Name Not Defined" : matchedSector2?.SORINAME;
          
          // Sector name matching - assuming sectorNameData is an array
          const matchedSector3 = sectorNameData?.find(sector3 => sector3.SORI === row.HDIRECT3);
          const matchedSectorName3 = matchedSector3?.SORINAME === undefined ? "Name Not Defined" : matchedSector3?.SORINAME;
          
          return {
              ...row,
              id: row.id || uuidv4(),
              NAME: matchedAccountName, // add NAME field conditionally
              NAMETKR: matchedAssetName, // add NAMETKR field conditionally
              SNAME1: matchedSectorName1, // add SNAME1 field conditionally
              SNAME2: matchedSectorName2, // add SNAME2 field conditionally
              SNAME3: matchedSectorName3, // add SNAME3 field conditionally
          };
      });
    },
    enabled: !!selectedPortfolio && !!client && !!accountNameData && !!assetNameData && !!sectorNameData,
    refetchOnWindowFocus: false,
  });

  // Determine which data to display
  // const data = isUsingExcelData ? excelData : fetchedDirectedAssets;
  // Update finalData based on excelData or data
  const keyFields = ["AACCT", "HID"];
  const nonKeyFields = [ "HDIRECT1", "HDIRECT2", "HDIRECT3", "USEDEF"];
  const numericFields = []; // Define numeric fields

  React.useEffect(() => {
    if (isUsingExcelData && excelData.length > 0) {
      setFinalData(
        compareData(
          excelData,
          fetchedDirectedAssets,
          keyFields,
          nonKeyFields,
          numericFields
        )
      );
      setIsUsingExcelData(false); // Switch back to using fetched data
      setSelectedPortfolio(excelData[0]?.AACCT);
    } else if (fetchedDirectedAssets && fetchedDirectedAssets.length > 0) {
      setFinalData(fetchedDirectedAssets);
    } else if (finalData.length !== 0) {
      // Prevent unnecessary updates
      setFinalData([]);
    }
  }, [excelData, fetchedDirectedAssets]);

  const portfolioName = finalData[0]?.NAME + ` (${finalData[0]?.AACCT})`; // used for PDF output

  const columns = useDirectedAssetsColumns(finalData, setFinalData, isEditAble, client); // Get Column information

  const queryClient = useQueryClient();
  // Mutations
  const { mutateAsync: createDirectedAssets, isPending: isCreatingDirectedAssets } =
    useMutation({
      mutationFn: async (createdDirectedAssets: DirectedAssetsFields) => {
        // send the updated data to API function
        const editDataInCSV = `A${delim}${createdDirectedAssets.AACCT}${delim}${createdDirectedAssets.HID}${delim}${createdDirectedAssets.HDIRECT1}${delim}${createdDirectedAssets.HDIRECT2}
        ${delim}${createdDirectedAssets.HDIRECT3}${delim}${createdDirectedAssets.USEDEF}${delim}${createdDirectedAssets.DATETIME_STAMP?.toString().replace(/\//g, "")}
      `;
        await FetchUpdateDeleteAPI(
          editDataInCSV.replace(/[\r\n]+/g, "").replace(/\s*\|\s*/g, "|").replace(/\|null\|/g, "||"),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPDRCTD`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return createDirectedAssets;
      },
      onMutate: async (newDirectedAssets: DirectedAssetsFields) => {
        await queryClient.cancelQueries({
          queryKey: ["directedAssets", selectedPortfolio, client, accountNameData, assetNameData, sectorNameData],
        });

        const previousDirectedAssets = queryClient.getQueryData<DirectedAssetsFields[]>(["directedAssets", selectedPortfolio, client, accountNameData, assetNameData, sectorNameData]) || [];

        queryClient.setQueryData(
          ["directedAssets", selectedPortfolio, client, accountNameData, assetNameData, sectorNameData], // Use the exact query key
          (old: DirectedAssetsFields[] | undefined) => [
            ...(old ?? []),
            { 
              ...newDirectedAssets, 
              id: uuidv4(),
              NAME: accountNameData?.find(account => account.ACCT === newDirectedAssets.AACCT)?.NAME || "Name Not Defined",
              NAMETKR: assetNameData?.find(asset => asset.ID === newDirectedAssets.HID)?.NAMETKR || "Name Not Defined",
              SNAME1: sectorNameData?.find(sector => sector.SORI === newDirectedAssets.HDIRECT1)?.SORINAME || "Name Not Defined",
              SNAME2: sectorNameData?.find(sector => sector.SORI === newDirectedAssets.HDIRECT2)?.SORINAME || "Name Not Defined",
              SNAME3: sectorNameData?.find(sector => sector.SORI === newDirectedAssets.HDIRECT3)?.SORINAME || "Name Not Defined",
            },
          ]
        );

        return { previousDirectedAssets };
      },
    });

  const { mutateAsync: updateDirectedAsset, isPending: isUpdatingDirectedAsset } =
    useMutation({
      mutationFn: async (updatedDirectedAssets: DirectedAssetsFields) => {
        // send the updated data to API function
        const editDataInCSV = `C${delim}${updatedDirectedAssets.AACCT}${delim}${updatedDirectedAssets.HID}${delim}${updatedDirectedAssets.HDIRECT1}${delim}${updatedDirectedAssets.HDIRECT2}
        ${delim}${updatedDirectedAssets.HDIRECT3}${delim}${updatedDirectedAssets.USEDEF}${delim}${updatedDirectedAssets.DATETIME_STAMP?.toString().replace(/\//g, "")}
      `;
        await FetchUpdateDeleteAPI(
          editDataInCSV.replace(/[\r\n]+/g, "").replace(/\s*\|\s*/g, "|").replace(/\|null\|/g, "||"),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPDRCTD`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return updatedDirectedAssets;
      },
      onMutate: async (updatedDirectedAsset: DirectedAssetsFields) => {
        await queryClient.cancelQueries({ queryKey: ["directedAssets"] });
        const previousDirectedAssets = queryClient.getQueryData<DirectedAssetsFields[]>(["directedAssets"]);
        queryClient.setQueryData(["directedAssets"], (old: DirectedAssetsFields[] = []) =>
          old.map((h) => (h.id === updatedDirectedAsset.id ? updatedDirectedAsset : h))
        );
        return { previousDirectedAssets };
      },
    });

  const { mutateAsync: deleteDirectedAsset, isPending: isDeletingDirectedAsset } =
    useMutation({
      mutationFn: async ({ directedAssetId, AACCT, HID}: {
        directedAssetId: string;
        AACCT: string;
        HID: string;
      }) => {
        // send the updated data to API function
        const editDataInCSV = `D${delim}${AACCT}${delim}${HID}`;
        await FetchUpdateDeleteAPI(
          editDataInCSV.replace(/[\r\n]+/g, "").replace(/\s*\|\s*/g, "|").replace(/\|null\|/g, "||"),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPDRCTD`
        ); // delete the directed asset
        await new Promise((resolve) => setTimeout(resolve, 100)); // Simulated API delay
        return Promise.resolve(directedAssetId);
      },
      onMutate: async ({ directedAssetId }) => {
        await queryClient.cancelQueries({
          queryKey: ["directedAssets", selectedPortfolio, client, accountNameData, assetNameData, sectorNameData],
        });

        const previousDirectedAssets = queryClient.getQueryData<DirectedAssetsFields[]>(["directedAssets", selectedPortfolio, client, accountNameData, assetNameData, sectorNameData]);

        // Optimistically update the cache by removing the deleted row
        queryClient.setQueryData(
          ["directedAssets", selectedPortfolio, client, accountNameData, assetNameData, sectorNameData],
          (old: DirectedAssetsFields[] = []) => {
            const newData = old.filter(
              (h: DirectedAssetsFields) => h.id !== directedAssetId
            );
            return newData;
          }
        );

        return { previousDirectedAssets };
      },
    });

  // CRUD Handlers
  const handleCreateDirectedAsset: MRT_TableOptions<DirectedAssetsFields>["onCreatingRowSave"] =
    async ({ values, exitCreatingMode }) => {

      // Validate the updated values
      const errors = validateDirectedAsset(values);
      if (Object.values(errors).some(Boolean)) {
        return; // If there are validation errors, stop the save operation
      }

      // Save the created values instead of row.original
      await createDirectedAssets(values); // Use values instead of row.original
      exitCreatingMode();
      table.setCreatingRow(null); // Reset editing state
    };

  const handleSaveDirectedAsset: MRT_TableOptions<DirectedAssetsFields>["onEditingRowSave"] =
    async ({ table, values }) => {

      // Validate the updated values
      const errors = validateDirectedAsset(values);
      if (Object.values(errors).some(Boolean)) {
        return; // If there are validation errors, stop the save operation
      }

      // Save the updated values instead of row.original
      await updateDirectedAsset(values); // Use values instead of row.original

      // Reset the editing state
      table.setEditingRow(null);
    };

  const openDeleteConfirmModal = (row: MRT_Row<DirectedAssetsFields>) => {
    modals.openConfirmModal({
      key: `delete-modal-${row.id}`,
      title: "Delete Directed Assets?",
      children: (
        <Text>
          Delete {row.original.NAME} ({row.original.AACCT}), and HID ({row.original.HID})?
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        deleteDirectedAsset({
          directedAssetId: row.original.id,
          AACCT: row.original.AACCT,
          HID: row.original.HID,
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

  const handleExportRows = (rows: MRT_Row<DirectedAssetsFields>[]) => {
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
    (newData: DirectedAssetsFields[]): void;
  }

  const handleExcelDataUpdate: ExcelDataUpdate = (newData) => {
    setExcelData(newData); // Update excelData with the uploaded file data
    setIsUsingExcelData(true); // Switch to using Excel data
  };

  // create only records that is requires to update the Table
  const FRPDRCTDExcel = finalData?.map(
    ({ id, NAME, NAMETKR, SNAME1, SNAME2, SNAME3, DATETIME_STAMP, ...rest }) => ({
      ...rest,
    })
  );

  //  Custom headers for the PDF file
  const PDFheaders = [
    { label: "Asset Name", key: "NAMETKR" },
    { label: "Asset ID", key: "HID" },
    { label: "Sector 1 ID", key: "HDIRECT1" },
    { label: "Sector 1 Name", key: "SNAME1" },
    { label: "Sector 2 ID", key: "HDIRECT2" },
    { label: "Sector 2 Name", key: "SNAME2" },
    { label: "Sector 3 ID", key: "HDIRECT3" },
    { label: "Sector 3 Name", key: "SNAME3" },
    { label: "User Defined Alpha", key: "USEDEF" },
    { label: "Date Time Stamp", key: "DATETIME_STAMP" },
  ];

  // Load data from excel to table
  const fieldnames = ["RECDTYPE", "AACCT", "HID", "HDIRECT1", "HDIRECT2", "HDIRECT3",  "USEDEF"];

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

  const { mutateAsync: updateDirectedAssetExcel, isPending: isUpdatingDirectedAssetExcel } =
    useMutation({
      mutationFn: async () => {
        // send the updated data to API function
        await FetchUpdateDeleteAPIExcel(
          convertToCSV(finalData),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPDRCTD`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return Promise.resolve();
      },
      onMutate: async () => {},
    });

  const handleMRELoad = async () => {
    await updateDirectedAssetExcel();
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
    mantineToolbarAlertBannerProps: isLoadingDirectedAssetsError
      ? { color: "red", children: "Failed to load data. Update your selection criteria." }
      : undefined,
    // onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateDirectedAsset,
    // onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveDirectedAsset,
    enableRowActions: true,

    mantineTableBodyCellProps: { 
      className: "rpt-body",
    },

    renderCreateRowModalContent: ({ table, row, internalEditComponents }) => {
      setIsEditable(true);

      return (
        <Stack>
          <Flex className="mrt-model-title">
            <Title order={4}>Create New Directed Asset</Title>
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
            <Title order={4}>Edit Directed Assets</Title>
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
          className: 'rpt-header-3',
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
                AACCT: selectedPortfolio,
                HID: "",
                HDIRECT1: "",
                HDIRECT2: "",
                HDIRECT3: "",
                DATETIME_STAMP: new Date().toISOString(),
                USEDEF: " ",
                RECDTYPE: "A",
                SNAME1: "",
                SNAME2: "",
                SNAME3: "",
                NAMETKR: "",
                NAME: "",
              })
            );
          }}
          disabled={finalData?.length > 0 ? false : true}
          className="rpt-action-button"
        >
          Create New Directed Asset
        </Button>
        <Button
          variant="subtle"
          disabled={
            !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
          }
          //only export selected rows
          onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
          leftIcon={<EXPORT_SVG />}
          className={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected() ? "" : "rpt-action-button"}
        >
          Export Selected Rows
        </Button>
        <Import onDataUpdate={handleExcelDataUpdate} />
        <Export
          data={finalData}
          excelData={FRPDRCTDExcel}
          reportName="Directed Assets"
          PDFheaders={PDFheaders}
          portfolioName={portfolioName}
          dateRange=""
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
      isLoading: isLoadingDirectedAssets,
      isSaving:
        isCreatingDirectedAssets ||
        isUpdatingDirectedAsset ||
        isDeletingDirectedAsset ||
        isUpdatingDirectedAssetExcel,
      showAlertBanner: isLoadingDirectedAssetsError,
      showProgressBars: isFetchingDirectedAssets,
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

const FrpDirectedAssets = () => (
  <ModalsProvider>
    <DirectedAssetsMTable />
  </ModalsProvider>
);

export default FrpDirectedAssets;

const validateRequired = (value: string) => !!value.length;

function validateDirectedAsset(directedAsset: DirectedAssetsFields) {
  return {
    AACCT: validateRequired(directedAsset.AACCT) ? "" : "Portfolio ID is required",
  };
}
