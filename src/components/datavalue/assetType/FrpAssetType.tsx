import React, { useState } from "react";
import { MRT_EditActionButtons, MantineReactTable, type MRT_Row, type MRT_TableOptions, useMantineReactTable, createRow } from "mantine-react-table";
import { ActionIcon, Button, Flex, Text, Tooltip, Divider, Menu, Modal, Stack, Title, Grid } from "@mantine/core";
import { CopyIcon, EXPORT_SVG, AiIcon } from "../../../svgicons/svgicons.js";
import { ModalsProvider, modals } from "@mantine/modals";
import { IconEdit, IconTrash, IconPlus, IconRefresh } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FetchAPI, FetchUpdateDeleteAPI, FetchUpdateDeleteAPIExcel } from "../../../api.js";
import useClient from "../../hooks/useClient.js";
import { useAssetTypesColumns, AssetTypesFields } from "../columnTitles/AssetTypesColumns.tsx";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs
import { mkConfig, generateCsv, download } from "export-to-csv"; //or use your library of choice here

import { compareData } from "../../report-components/compareData.js";
import { Import } from "../../report-components/Import.js";
import { Export } from "../../report-components/Export.js";
import { PredictNumColumn } from "../../../aiAgents/PredictNumColumn.js";
import { useSectorName } from "../../hooks/useFrpNamesFiltersDDLsApi.js";

const AssetTypeMTable = () => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [finalData, setFinalData] = useState<AssetTypesFields[]>([]);
  const [excelData, setExcelData] = useState<AssetTypesFields[]>([]);
  const [isUsingExcelData, setIsUsingExcelData] = useState(false);
  const [isEditAble, setIsEditable] = useState<boolean>(false);

  const client = useClient();
  const delim = process.env.REACT_APP_DELIMITER;
  const { data: sectorNameData } = useSectorName(client); // Fetch sector name data

  const lassetTypeUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPATYPE`;

  // Unified data fetch using React Query
  const {
    data: fetchedAssetTypes = [],
    isError: isLoadingAssetTypesError,
    isFetching: isFetchingAssetTypes,
    isLoading: isLoadingAssetTypes,
  } = useQuery<AssetTypesFields[]>({
    queryKey: ["assetTypes", client],
    queryFn: async () => {
      const data = await FetchAPI(lassetTypeUri);
      return data.map((row) => {
        // Sector name matching - assuming sectorNameData is an array
        const matchedSector1 = sectorNameData?.find((sector) => sector.SORI === row.ISECTOR);
        const matchedSectorName1 = matchedSector1?.SORINAME === undefined ? "Name Not Defined" : matchedSector1?.SORINAME;

        // Sector name matching - assuming sectorNameData is an array
        const matchedSector2 = sectorNameData?.find((sector2) => sector2.SORI === row.ISECTOR2);
        const matchedSectorName2 = matchedSector2?.SORINAME === undefined ? "Name Not Defined" : matchedSector2?.SORINAME;

        // Sector name matching - assuming sectorNameData is an array
        const matchedSector3 = sectorNameData?.find((sector3) => sector3.SORI === row.ISECTOR3);
        const matchedSectorName3 = matchedSector3?.SORINAME === undefined ? "Name Not Defined" : matchedSector3?.SORINAME;

        return {
          ...row,
          id: row.id || uuidv4(),
          SNAME1: matchedSectorName1, // add SNAME1 field conditionally
          SNAME2: matchedSectorName2, // add SNAME2 field conditionally
          SNAME3: matchedSectorName3, // add SNAME3 field conditionally
        };
      });
    },
    enabled: !!client && !!sectorNameData,
    refetchOnWindowFocus: false,
  });

  // Determine which data to display
  // const data = isUsingExcelData ? excelData : fetchedAssetTypes;
  // Update finalData based on excelData or data
  const keyFields = ["ASSETTYPE", "INDUSMINMAX"];
  const nonKeyFields = ["ISECTOR", "ACCRTYPE", "STMTCATEGORY", "MAJRCATEGORY", "ATNAME", "ATYPE2", "ISECTOR2", "ISECTOR3"];
  const numericFields = ["PRICEDISC"]; // Define numeric fields

  React.useEffect(() => {
    if (isUsingExcelData && excelData.length > 0) {
      setFinalData(compareData(excelData, fetchedAssetTypes, keyFields, nonKeyFields, numericFields));
      setIsUsingExcelData(false); // Switch back to using fetched data
    } else if (fetchedAssetTypes && fetchedAssetTypes.length > 0) {
      setFinalData(fetchedAssetTypes);
    } else if (finalData.length !== 0) {
      // Prevent unnecessary updates
      setFinalData([]);
    }
  }, [excelData, fetchedAssetTypes]);

  const columns = useAssetTypesColumns(finalData, setFinalData, isEditAble, validationErrors, client); // Get Column information

  const queryClient = useQueryClient();
  // Mutations
  const { mutateAsync: createAssetType, isPending: isCreatingAssetType } = useMutation({
    mutationFn: async (createdAssetType: AssetTypesFields) => {
      // send the updated data to API function
      const editDataInCSV = `A${delim}${createdAssetType.ASSETTYPE}${delim}${createdAssetType.INDUSMINMAX}${delim}${createdAssetType.ISECTOR}${delim}${createdAssetType.ACCRTYPE}${delim}
           ${createdAssetType.PRICEDISC}${delim}${createdAssetType.STMTCATEGORY}${delim}${createdAssetType.MAJRCATEGORY}${delim}${createdAssetType.ATNAME}${delim}${createdAssetType.ATYPE2}${delim}${createdAssetType.ISECTOR2}${delim}
           ${createdAssetType.ISECTOR3}
      `;
      await FetchUpdateDeleteAPI(
        editDataInCSV
          .replace(/[\r\n]+/g, "")
          .replace(/\s*\|\s*/g, "|")
          .replace(/\|null\|/g, "||"),
        `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPATYPE`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return createAssetType;
    },
    onMutate: async (newAssetType: AssetTypesFields) => {
      await queryClient.cancelQueries({
        queryKey: ["assetTypes", client],
      });

      const previousAssetTypes = queryClient.getQueryData<AssetTypesFields[]>(["assetTypes", client]) || [];

      queryClient.setQueryData(
        ["assetTypes", client], // Use the exact query key
        (old: AssetTypesFields[] | undefined) => [...(old ?? []), { ...newAssetType, id: uuidv4() }]
      );

      return { previousAssetTypes };
    },
  });

  const { mutateAsync: updateAssetType, isPending: isUpdatingAssetType } = useMutation({
    mutationFn: async (updatedAssetType: AssetTypesFields) => {
      // send the updated data to API function
      const editDataInCSV = `C${delim}${updatedAssetType.ASSETTYPE}${delim}${updatedAssetType.INDUSMINMAX}${delim}${updatedAssetType.ISECTOR}${delim}${updatedAssetType.ACCRTYPE}${delim}
           ${updatedAssetType.PRICEDISC}${delim}${updatedAssetType.STMTCATEGORY}${delim}${updatedAssetType.MAJRCATEGORY}${delim}${updatedAssetType.ATNAME}${delim}${updatedAssetType.ATYPE2}${delim}${updatedAssetType.ISECTOR2}${delim}
           ${updatedAssetType.ISECTOR3}
      `;
      await FetchUpdateDeleteAPI(
        editDataInCSV
          .replace(/[\r\n]+/g, "")
          .replace(/\s*\|\s*/g, "|")
          .replace(/\|null\|/g, "||"),
        `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPATYPE`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return updatedAssetType;
    },
    onMutate: async (updatedAssetType: AssetTypesFields) => {
      await queryClient.cancelQueries({ queryKey: ["assetTypes"] });
      const previousAssetTypes = queryClient.getQueryData<AssetTypesFields[]>(["assetTypes"]);
      queryClient.setQueryData(["assetTypes"], (old: AssetTypesFields[] = []) => old.map((h) => (h.id === updatedAssetType.id ? updatedAssetType : h)));
      return { previousAssetTypes };
    },
  });

  const { mutateAsync: deleteAssetType, isPending: isDeletingAssetType } = useMutation({
    mutationFn: async ({ assetTypeId, ASSETTYPE, INDUSMINMAX }: { assetTypeId: string; ASSETTYPE: string; INDUSMINMAX: string }) => {
      // send the updated data to API function
      const editDataInCSV = `D${delim}${ASSETTYPE}${delim}${INDUSMINMAX}`;
      await FetchUpdateDeleteAPI(
        editDataInCSV
          .replace(/[\r\n]+/g, "")
          .replace(/\s*\|\s*/g, "|")
          .replace(/\|null\|/g, "||"),
        `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPATYPE`
      ); // delete the assetType
      await new Promise((resolve) => setTimeout(resolve, 100)); // Simulated API delay
      return Promise.resolve(assetTypeId);
    },
    onMutate: async ({ assetTypeId }: { assetTypeId: string }) => {
      await queryClient.cancelQueries({
        queryKey: ["assetTypes", client],
      });

      const previousAssetTypes = queryClient.getQueryData<AssetTypesFields[]>(["assetTypes", client]);

      console.log("Previous assetTypes:", previousAssetTypes); // Debugging
      console.log("Deleting assetType ID:", assetTypeId); // Debugging

      // Optimistically update the cache by removing the deleted row
      queryClient.setQueryData(["assetTypes", client], (old: AssetTypesFields[] = []) => {
        const newData = old.filter((h: AssetTypesFields) => h.id !== assetTypeId);
        console.log("New Data After Deletion:", newData); // Debugging
        return newData;
      });

      return { previousAssetTypes };
    },
  });

  // CRUD Handlers
  const handleCreateAssetType: MRT_TableOptions<AssetTypesFields>["onCreatingRowSave"] = async ({ values, exitCreatingMode }) => {
    // Validate the values
    const errors = validateAssetType(values);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors); // Set validation errors
      return; // Stop the save operation if there are errors
    }

    // Format DATES as expected date before saving
    const formattedValues = {
      ...values,
    };

    try {
      // Save the created values instead of row.original
      await createAssetType(formattedValues); // Use values instead of row.original
      exitCreatingMode();
      table.setCreatingRow(null); // Reset editing state
      setValidationErrors({}); // Clear validation errors
    } catch (error) {
      console.log("Error creating asset type:", error);
    }
  };

  const handleSaveAssetType: MRT_TableOptions<AssetTypesFields>["onEditingRowSave"] = async ({ table, values }) => {
    // Validate the values
    const errors = validateAssetType(values);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors); // Set validation errors
      return; // Stop the save operation if there are errors
    }

    // Format DATES as expected date before saving
    const formattedValues = {
      ...values,
    };

    try {
      // Save the updated values instead of row.original
      await updateAssetType(formattedValues); // Use values instead of row.original
      table.setEditingRow(null); // Reset the editing state
      setValidationErrors({}); // Clear validation errors
    } catch (error) {
      console.log("Error editing asset type:", error);
    }
  };

  const openDeleteConfirmModal = (row: MRT_Row<AssetTypesFields>) => {
    modals.openConfirmModal({
      key: `delete-modal-${row.id}`,
      title: "Delete Asset Type",
      children: <Text>Delete {row.original.ASSETTYPE}?</Text>,
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        deleteAssetType({
          assetTypeId: row.original.id,
          ASSETTYPE: row.original.ASSETTYPE,
          INDUSMINMAX: row.original.INDUSMINMAX.toString(),
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

  const handleExportRows = (rows: MRT_Row<AssetTypesFields>[]) => {
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
    (newData: AssetTypesFields[]): void;
  }

  const handleExcelDataUpdate: ExcelDataUpdate = (newData) => {
    setExcelData(newData); // Update excelData with the uploaded file data
    setIsUsingExcelData(true); // Switch to using Excel data
  };

  // create only records that is requires to update the Table
  const FRPATYPEExcel = finalData?.map(({ id, SNAME1, SNAME2, SNAME3, ...rest }) => ({
    ...rest,
  }));

  //  Custom headers for the PDF file
  const PDFheaders = [
    { label: "Asset Type", key: "ASSETTYPE" },
    { label: "Industry Minimum / Maximum", key: "INDUSMINMAX" },
    { label: "Sector 1 ID", key: "ISECTOR" },
    { label: "Sector 1 Name", key: "SNAME1" },
    { label: "Accual Type", key: "ACCRTYPE" },
    { label: "Pricing Descipline", key: "PRICEDISC", align: "right" },
    { label: "Statement Category", key: "STMTCATEGORY" },
    { label: "Major Category", key: "MAJRCATEGORY" },
    { label: "Asset Name", key: "ATNAME" },
    { label: "Asset Type 2", key: "ATYPE2" },
    { label: "Sector 2 ID ", key: "ISECTOR2" },
    { label: "Sector 2 Name", key: "SNAME2" },
    { label: "Sector 3 ID", key: "ISECTOR3" },
    { label: "Sector 3 Name", key: "SNAME3" },
  ];

  // Load data from excel to table
  const fieldnames = ["RECDTYPE", "ASSETTYPE", "INDUSMINMAX", "ISECTOR", "ACCRTYPE", "PRICEDISC", "STMTCATEGORY", "MAJRCATEGORY", "ATNAME", "ATYPE2", "ISECTOR2", "ISECTOR3"];

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

  const { mutateAsync: updateAssetTypeExcel, isPending: isUpdatingAssetTypeExcel } = useMutation({
    mutationFn: async () => {
      // send the updated data to API function
      await FetchUpdateDeleteAPIExcel(convertToCSV(finalData), `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPATYPE`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return Promise.resolve();
    },
    onMutate: async () => {},
  });

  const handleMRELoad = async () => {
    await updateAssetTypeExcel();
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
    mantineToolbarAlertBannerProps: isLoadingAssetTypesError ? { color: "red", children: "Failed to load data. Update your selection criteria." } : undefined,
    // onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateAssetType,
    // onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveAssetType,
    enableRowActions: true,

    mantineTableBodyCellProps: {
      className: "rpt-body",
    },

    renderCreateRowModalContent: ({ table, row, internalEditComponents }) => {
      setIsEditable(true);

      return (
        <Stack>
          <Flex className="mrt-model-title">
            <Title order={4}>Create New Asset Type</Title>
            <ActionIcon onClick={() => table.setCreatingRow(null)} variant="light" size="lg" color="red">
              ✕ {/* Close Icon */}
            </ActionIcon>
          </Flex>
          <Grid>
            {internalEditComponents.map((component, index) => (
              <React.Fragment key={index}>
                <Grid.Col key={index} span={3}>
                  {" "}
                  {/* 4 columns layout */}
                  {component}
                </Grid.Col>
              </React.Fragment>
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
        <Stack>
          <Flex className="mrt-model-title">
            <Title order={4}>Edit Asset Type</Title>
            <ActionIcon onClick={() => table.setEditingRow(null)} variant="light" size="lg" color="red">
              ✕ {/* Close Icon */}
            </ActionIcon>
          </Flex>
          <Grid>
            {internalEditComponents.map((component, index) => (
              <React.Fragment key={index}>
                {" "}
                {/* Add key here */}
                {index === 0 && (
                  <Grid.Col span={12}>
                    <Divider mt="md" label="General Information" labelPosition="center" />
                  </Grid.Col>
                )}
                {index === 11 && (
                  <Grid.Col span={12}>
                    <Divider mt="md" label="Primary Financials" labelPosition="center" />
                  </Grid.Col>
                )}
                {index === 15 && ( // Add a divider before the 20th component
                  <Grid.Col span={12}>
                    <Divider mt="md" label="Additional assetTypes" labelPosition="center" />
                  </Grid.Col>
                )}
                <Grid.Col key={index} span={3}>
                  {" "}
                  {/* 4 columns layout */}
                  {component}
                </Grid.Col>
              </React.Fragment>
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
                ASSETTYPE: "",
                INDUSMINMAX: "",
                ISECTOR: "",
                SNAME1: "",
                ACCRTYPE: "",
                PRICEDISC: 0,
                STMTCATEGORY: "",
                MAJRCATEGORY: "",
                ATNAME: "",
                ATYPE2: "",
                ISECTOR2: "",
                SNAME2: "",
                ISECTOR3: "",
                SNAME3: "",
                RECDTYPE: "A",
              })
            );
          }}
          disabled={finalData?.length > 0 ? false : true}
          className="rpt-action-button"
        >
          Create New Asset Type
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
        <Export data={finalData} excelData={FRPATYPEExcel} reportName="FRPATYPE" PDFheaders={PDFheaders} portfolioName="" dateRange="" />
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
      isLoading: isLoadingAssetTypes,
      isSaving: isCreatingAssetType || isUpdatingAssetType || isDeletingAssetType || isUpdatingAssetTypeExcel,
      showAlertBanner: isLoadingAssetTypesError,
      showProgressBars: isFetchingAssetTypes,
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

const FrpAssetTypes = () => (
  <ModalsProvider>
    <AssetTypeMTable />
  </ModalsProvider>
);

export default FrpAssetTypes;

const validateAssetType = (assetType: AssetTypesFields) => {
  const errors: Record<string, string> = {};

  if (!assetType.ASSETTYPE) {
    errors.ASSETTYPE = "Asset Type is required";
  }

  if (!assetType.INDUSMINMAX) {
    errors.INDUSMINMAX = "Industry Minimum / Maximum is required";
  }
  if (!assetType.ISECTOR) {
    errors.ISECTOR = "Sector ID is required";
  }

  return errors;
};
