import React, { useState } from "react";
import {
  MRT_EditActionButtons,
  MantineReactTable,
  type MRT_Row,
  type MRT_TableOptions,
  useMantineReactTable,
  createRow,
} from "mantine-react-table";
import { ActionIcon, Button, Flex, Text, Tooltip, Stack, Title, Divider, Menu, Modal} from "@mantine/core";
import { CopyIcon, EXPORT_SVG, AiIcon } from "../../svgicons/svgicons.js";
import { ModalsProvider, modals } from "@mantine/modals";
import { IconEdit, IconTrash, IconPlus, IconRefresh} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import { FetchAPI, FetchUpdateDeleteAPI, FetchUpdateDeleteAPIExcel} from "../../api.js";
import useClient from "../hooks/useClient.js";
import { useTargetPolicyAssignmentsColumns, TargetPolicyAssignmentsFields } from "./columnTitles/TargetPolicyAssignmentsColumns.tsx";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs
import { mkConfig, generateCsv, download } from "export-to-csv"; //or use your library of choice here

import { compareData } from "../report-components/compareData.js";
import { Import } from "../report-components/Import.js";
import { Export } from "../report-components/Export.js";
import { PredictNumColumn } from "../../aiAgents/PredictNumColumn.js";
import { useAccountName, useBenchmarkName, useSectorName } from "../hooks/useFrpNamesFiltersDDLsApi.js";

type DateRange = string[];

type OutletContextType = {
  selectedPortfolio: string;
  setSelectedPortfolio: (portfolio: string) => void;
  dateRange: DateRange;
};

const TargetPolicyAssignmentsMTable = () => {
  const [finalData, setFinalData] = useState<TargetPolicyAssignmentsFields[]>([]);
  const [excelData, setExcelData] = useState<TargetPolicyAssignmentsFields[]>([]);
  const [isUsingExcelData, setIsUsingExcelData] = useState(false);
  const [isEditAble, setIsEditable] = useState<boolean>(false);

  const client = useClient();
  const delim = process.env.REACT_APP_DELIMITER;

  const { selectedPortfolio, setSelectedPortfolio } =  useOutletContext<OutletContextType>();
  
  const { data: accountNameData } = useAccountName(selectedPortfolio, client); // Fetch account name data
  const { data: indxNameData } = useBenchmarkName(client); // Fetch country name data
  const { data: sectorNameData } = useSectorName(client); // Fetch sector name data
  
  const targetPolicyAUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPACBNC&filters=ACCT(${selectedPortfolio})`;

  // Unified data fetch using React Query
  const {
      data: fetchedTargetPolicyAss = [],
      isError: isLoadingTargetPolicyAssError,
      isFetching: isFetchingTargetPolicyAss,
      isLoading: isLoadingTargetPolicyAss,
  } = useQuery<TargetPolicyAssignmentsFields[]>({
      queryKey: ["targetPolicyAss", selectedPortfolio, client, accountNameData, indxNameData, sectorNameData], // Add assetNameData to queryKey
      queryFn: async () => {
          const data = await FetchAPI(targetPolicyAUri);
          
          return data.map((row) => {
              // Account name matching
              const matchedAccount = accountNameData?.find(account => account.ACCT === row.ACCT);
              const matchedAccountName = matchedAccount?.NAME === undefined ? "Name Not Defined" : matchedAccount?.NAME;

              // Sector name matching
              const matchedSector = sectorNameData?.find(sector => sector.SORI === row.SECTOR);
              const matchedSectorName = matchedSector?.SORINAME === undefined ? "Sector Not Defined" : matchedSector?.SORINAME;

              // Indx name matching
              const matchedIndx = indxNameData?.find(indx => indx.SORI === row.INDX);
              const matchedIndxName = matchedIndx?.SORINAME === undefined ? "Indx Not Defined" : matchedIndx?.SORINAME;
              
              return {
                  ...row,
                  id: row.id || uuidv4(),
                  NAME: matchedAccountName, // add NAME field conditionally
                  INDXNAME: matchedIndxName, // add INDXNAME field conditionally
                  SORINAME: matchedSectorName, // add SORINAME field conditionally
              };
          });
      },
      enabled: !!selectedPortfolio && !!client && !!accountNameData && !!indxNameData && !!sectorNameData, // Add assetNameData to enabled condition
  });

  // Determine which data to display
  // const data = isUsingExcelData ? excelData : fetchedTargetPolicyAss;
  // Update finalData based on excelData or data
  const keyFields = ["ACCT", "SECTOR"];
  const alphaFields = ["INDX"];
  const numericFields = ["POLICY", "MINVAR","MAXVAR"]; // Define numeric fields

  React.useEffect(() => {
    if (isUsingExcelData && excelData.length > 0) {
      setFinalData(
        compareData(
          excelData,
          fetchedTargetPolicyAss,
          keyFields,
          alphaFields,
          numericFields
        )
      );
      setIsUsingExcelData(false); // Switch back to using fetched data
      setSelectedPortfolio(excelData[0]?.ACCT);
    } else if (fetchedTargetPolicyAss && fetchedTargetPolicyAss.length > 0) {
      setFinalData(fetchedTargetPolicyAss);
    } else if (finalData.length !== 0) {
      // Prevent unnecessary updates
      setFinalData([]);
    }
  }, [excelData, fetchedTargetPolicyAss]);

  const portfolioName = finalData[0]?.NAME + ` (${finalData[0]?.ACCT})`; // used for PDF output

  const columns = useTargetPolicyAssignmentsColumns(finalData, setFinalData, isEditAble, client); // Get Column information

  const queryClient = useQueryClient();
  // Mutations
  const { mutateAsync: createTargetPolicyAss, isPending: isCreatingTargetPolicyAss } =
    useMutation({
      mutationFn: async (createdTargetPolicyAss: TargetPolicyAssignmentsFields) => {
        // send the updated data to API function
        const editDataInCSV = `A${delim}${createdTargetPolicyAss.ACCT}${delim}${createdTargetPolicyAss.SECTOR}${delim}${createdTargetPolicyAss.INDX}
        ${delim}${createdTargetPolicyAss.POLICY}${delim}${createdTargetPolicyAss.MINVAR}${delim}${createdTargetPolicyAss.MAXVAR}
      `;
        await FetchUpdateDeleteAPI(
          editDataInCSV.replace(/[\r\n]+/g, "").replace(/\s*\|\s*/g, "|").replace(/\|null\|/g, "||"),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPACBNC`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return createTargetPolicyAss;
      },
      onMutate: async (newTargetPolicyAss: TargetPolicyAssignmentsFields) => {
        await queryClient.cancelQueries({
          queryKey: ["targetPolicyAss", selectedPortfolio, client, accountNameData, indxNameData, sectorNameData],
        });

        const previousTargetPolicyAss = queryClient.getQueryData<TargetPolicyAssignmentsFields[]>(
          ["targetPolicyAss", selectedPortfolio, client, accountNameData, indxNameData, sectorNameData]) || [];

        queryClient.setQueryData(
          ["targetPolicyAss", selectedPortfolio, client, accountNameData, indxNameData, sectorNameData], // Use the exact query key
          (old: TargetPolicyAssignmentsFields[] | undefined) => [
            ...(old ?? []),
            { 
                ...newTargetPolicyAss, 
                id: uuidv4(), 
                NAME: accountNameData?.find(account => account.ACCT === newTargetPolicyAss.ACCT)?.NAME || "Name Not Defined",
                SORINAME: sectorNameData?.find(sector => sector.SORI === newTargetPolicyAss.SECTOR)?.SORINAME || "Sector Not Defined",
                INDXNAME: indxNameData?.find(indx => indx.SORI === newTargetPolicyAss.INDX)?.SORINAME || "Indx Not Defined",
            },
          ]
        );

        return { previousTargetPolicyAss };
      },
    });
  
  const { mutateAsync: updateTargetPolicyAss, isPending: isUpdatingTargetPolicyAss } =
    useMutation({
      mutationFn: async (updatedTargetPolicyAss: TargetPolicyAssignmentsFields) => {
        // send the updated data to API function
        const editDataInCSV = `C${delim}${updatedTargetPolicyAss.ACCT}${delim}${updatedTargetPolicyAss.SECTOR}${delim}${updatedTargetPolicyAss.INDX}
        ${delim}${updatedTargetPolicyAss.POLICY}${delim}${updatedTargetPolicyAss.MINVAR}${delim}${updatedTargetPolicyAss.MAXVAR}
       `;
        await FetchUpdateDeleteAPI(
          editDataInCSV.replace(/\s+/g, ""),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPACBNC`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return updatedTargetPolicyAss;
      },
      onMutate: async (updatedTargetPolicyAss: TargetPolicyAssignmentsFields) => {
        await queryClient.cancelQueries({ queryKey: ["targetPolicyAss"] });
        const previousSectors = queryClient.getQueryData<TargetPolicyAssignmentsFields[]>(["targetPolicyAss"]);
        queryClient.setQueryData(["targetPolicyAss"], (old: TargetPolicyAssignmentsFields[] = []) =>
          old.map((h) => (h.id === updatedTargetPolicyAss.id ? updatedTargetPolicyAss : h))
        );
        return { previousSectors };
      },
    });

  const { mutateAsync: deleteTargetPolicyAss, isPending: isDeletingTargetPolicyAss } =
    useMutation({
      mutationFn: async ({ targetPolicyAssId, ACCT, SECTOR}: {
        targetPolicyAssId: string;
        ACCT: string;
        SECTOR: string;
      }) => {
        // send the updated data to API function
        const editDataInCSV = `D${delim}${ACCT}${delim}${SECTOR}`;
        await FetchUpdateDeleteAPI(
          editDataInCSV.replace(/[\r\n]+/g, "").replace(/\s*\|\s*/g, "|").replace(/\|null\|/g, "||"),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPACBNC`
        ); // delete the sectorInception
        await new Promise((resolve) => setTimeout(resolve, 100)); // Simulated API delay
        return Promise.resolve(targetPolicyAssId);
      },
      onMutate: async ({ targetPolicyAssId }) => {
        await queryClient.cancelQueries({
          queryKey: ["targetPolicyAss", selectedPortfolio, client, accountNameData, indxNameData, sectorNameData],
        });

        const previousTargetPolicyAss = queryClient.getQueryData<TargetPolicyAssignmentsFields[]>(
          ["targetPolicyAss", selectedPortfolio, client, accountNameData, indxNameData, sectorNameData]) || [];

        // Optimistically update the cache by removing the deleted row
        queryClient.setQueryData(
          ["targetPolicyAss", selectedPortfolio, client, accountNameData, indxNameData, sectorNameData],
          (old: TargetPolicyAssignmentsFields[] = []) => {
            const newData = old.filter(
              (h: TargetPolicyAssignmentsFields) => h.id !== targetPolicyAssId
            );
            return newData;
          }
        );

        return { previousTargetPolicyAss };
      },
    });

  // CRUD Handlers
  const handleCreateTargetPolicyAss: MRT_TableOptions<TargetPolicyAssignmentsFields>["onCreatingRowSave"] =
    async ({ values, exitCreatingMode }) => {

      // Validate the updated values
      const errors = validateSectorInception(values);
      if (Object.values(errors).some(Boolean)) {
        return; // If there are validation errors, stop the save operation
      }

      // Save the created values instead of row.original
      await createTargetPolicyAss(values); // Use values instead of row.original
      exitCreatingMode();
      table.setCreatingRow(null); // Reset editing state
    };

  const handleSaveSectorInception: MRT_TableOptions<TargetPolicyAssignmentsFields>["onEditingRowSave"] =
    async ({ table, values}) => {

      // Validate the updated values
      const errors = validateSectorInception(values);
      if (Object.values(errors).some(Boolean)) {
        return; // If there are validation errors, stop the save operation
      }

      // Save the updated values instead of row.original
      await updateTargetPolicyAss(values); // Use values instead of row.original

      // Reset the editing state
      table.setEditingRow(null);
    };

  const openDeleteConfirmModal = (row: MRT_Row<TargetPolicyAssignmentsFields>) => {
    modals.openConfirmModal({
      key: `delete-modal-${row.id}`,
      title: "Delete Target Policy Assignment?",
      children: (
        <Text>
          Delete {row.original.NAME} ({row.original.ACCT}) and Sector {row.original.SORINAME} ({row.original.SECTOR})?
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        deleteTargetPolicyAss({
          targetPolicyAssId: row.original.id,
          ACCT: row.original.ACCT,
          SECTOR: row.original.SECTOR
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

  const handleExportRows = (rows: MRT_Row<TargetPolicyAssignmentsFields>[]) => {
    const rowData = rows.map(({ original }) => {
      const { id, ...rest } = original; // Exclude 'id' field
      return { ...rest };
    });

    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  interface ExcelDataUpdate {
    (newData: TargetPolicyAssignmentsFields[]): void;
  }

  const handleExcelDataUpdate: ExcelDataUpdate = (newData) => {
    setExcelData(newData); // Update excelData with the uploaded file data
    setIsUsingExcelData(true); // Switch to using Excel data
  };

  // create only records that is requires to update the Table
  const FRPACBNCExcel = finalData?.map(
    ({ id, NAME, INDXNAME, SORINAME, ...rest }) => ({
      ...rest,
    })
  );

  //  Custom headers for the PDF file
  const PDFheaders = [
    { label: "Sector", key: "SECTOR" },
    { label: "Sector Name", key: "SORINAME" },
    { label: "Benchmark ID", key: "INDX" },
    { label: "Benchmark Name", key: "INDXNAME" },
    { label: "Policy", key: "POLICY", align: "right" },
    { label: "Min Variance", key: "MINVAR", align: "right" },
    { label: "Max Variance", key: "MAXVAR", align: "right" },
  ];

  // Load data from excel to table
  const fieldnames = ["RECDTYPE", "ACCT", "SECTOR", "INDX", "POLICY", "MINVAR", "MAXVAR"];

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

  const { mutateAsync: updateTargetPolicyAssExcel, isPending: isUpdatingTargetPolicyAssExcel } =
    useMutation({
      mutationFn: async () => {
        // send the updated data to API function
        await FetchUpdateDeleteAPIExcel(
          convertToCSV(finalData),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPACBNC`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return Promise.resolve();
      },
      onMutate: async () => {},
    });

  const handleMRELoad = async () => {
    await updateTargetPolicyAssExcel();
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
    mantineToolbarAlertBannerProps: isLoadingTargetPolicyAssError
      ? { color: "red", children: "Failed to load data. Update your selection criteria." }
      : undefined,
    // onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateTargetPolicyAss,
    // onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveSectorInception,
    enableRowActions: true,

    mantineTableBodyCellProps: { 
      className: "rpt-body",
    },

    renderCreateRowModalContent: ({ table, row, internalEditComponents }) => {
      setIsEditable(true);

      return (
        <Stack>
          <Flex className="mrt-model-title">
            <Title order={4}>Create New Target Policy Assignments</Title>
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
            <Title order={4}>Edit Target Policy Assginments</Title>
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
                ACCT: selectedPortfolio,
                NAME: "",
                INDX: "",
                INDXNAME: "",
                SECTOR: "",
                SORINAME: "",
                POLICY: 0,
                MINVAR: 0,
                MAXVAR: 0,
                RECDTYPE: "A",
              })
            );
          }}
          disabled={finalData?.length > 0 ? false : true}
          className="rpt-action-button"
        >
          Create New Target Policy Assignment
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
          excelData={FRPACBNCExcel}
          reportName="Target Policy Assignments"
          PDFheaders={PDFheaders}
          portfolioName={portfolioName}
          dateRange=" "
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
      isLoading: isLoadingTargetPolicyAss,
      isSaving:
        isCreatingTargetPolicyAss ||
        isUpdatingTargetPolicyAss ||
        isDeletingTargetPolicyAss ||
        isUpdatingTargetPolicyAssExcel,
      showAlertBanner: isLoadingTargetPolicyAssError,
      showProgressBars: isFetchingTargetPolicyAss,
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

const FrpTargetPolicyAssignment = () => (
  <ModalsProvider>
    <TargetPolicyAssignmentsMTable />
  </ModalsProvider>
);

export default FrpTargetPolicyAssignment;

const validateRequired = (value: string) => !!value.length;

function validateSectorInception(sectorInception: TargetPolicyAssignmentsFields) {
  return {
    ACCT: !validateRequired(sectorInception.ACCT?.toString())
      ? "Field is Required"
      : "",
  };
}
