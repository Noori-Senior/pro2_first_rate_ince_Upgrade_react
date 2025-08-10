import React, { useState } from "react";
import {
  MRT_EditActionButtons,
  MantineReactTable,
  type MRT_Row,
  type MRT_TableOptions,
  useMantineReactTable,
  createRow,
} from "mantine-react-table";
import { ActionIcon, Button, Flex, Text, Tooltip, Divider, Menu, Modal, Stack, Title, Grid} from "@mantine/core";
import { CopyIcon, EXPORT_SVG, AiIcon } from "../../../svgicons/svgicons.js";
import { ModalsProvider, modals } from "@mantine/modals";
import { IconEdit, IconTrash, IconPlus, IconRefresh} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import { FetchAPI, FetchUpdateDeleteAPI, FetchUpdateDeleteAPIExcel} from "../../../api.js";
import useClient from "../../hooks/useClient.js";
import { useHoldingsColumns, HoldingsFields } from "../columnTitles/HoldingsColumns.tsx";
import { formatToDateYYM, formatFromDateYYM, formatDateYYM, formatDateYYMD } from "../../hooks/FormatDates.tsx";
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

const HoldingsMTable = () => {
  const [finalData, setFinalData] = useState<HoldingsFields[]>([]);
  const [excelData, setExcelData] = useState<HoldingsFields[]>([]);
  const [isUsingExcelData, setIsUsingExcelData] = useState(false);
  const [isEditAble, setIsEditable] = useState<boolean>(false);

  const client = useClient();
  const delim = process.env.REACT_APP_DELIMITER;

  const { selectedPortfolio, setSelectedPortfolio } =  useOutletContext<OutletContextType>();
  const { dateRange } = useOutletContext<OutletContextType>();
  const fromDate = formatFromDateYYM(dateRange as [string, string]) ;
  const toDate = formatToDateYYM(dateRange as [string, string]) ;
  
  const { data: accountNameData } = useAccountName(selectedPortfolio, client); // Fetch account name data
  const { data: assetNameData } = useAssetName(client); // Fetch asset name data
  const { data: sectorNameData } = useSectorName(client); // Fetch sector name data
  
  const lholdingUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPHOLD&filters=AACCT(${selectedPortfolio});ADATE(GT:${fromDate}:AND:ADATE:LE:${toDate})`;

  // Unified data fetch using React Query
  const {
      data: fetchedHoldings = [],
      isError: isLoadingHoldingsError,
      isFetching: isFetchingHoldings,
      isLoading: isLoadingHoldings,
  } = useQuery<HoldingsFields[]>({
      queryKey: ["holdings", selectedPortfolio, dateRange, client, accountNameData, assetNameData, sectorNameData], // Add assetNameData to queryKey
      queryFn: async () => {
          const data = await FetchAPI(lholdingUri);
          
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
      enabled: !!selectedPortfolio && !!dateRange && !!client && !!accountNameData && !!assetNameData && !!sectorNameData, // Add assetNameData to enabled condition
  });

  // Determine which data to display
  // const data = isUsingExcelData ? excelData : fetchedHoldings;
  // Update finalData based on excelData or data
  const keyFields = ["AACCT", "ADATE", "HID"];
  const nonKeyFields = [ "HDIRECT1", "HDIRECT2", "HDIRECT3", "HDATE", "HUNITS", "HPRINCIPAL", "HACCRUAL", "HCARRY", "HUNITST", "HPRINCIPALT", "HACCRUALT", "HCARRYL", "USERDEF1",  "USERCHR1"];
  const numericFields = [ "HUNITS", "HPRINCIPAL", "HACCRUAL", "HCARRY", "HUNITST", "HPRINCIPALT", "HACCRUALT", "HCARRYL", "USERDEF1"]; // Define numeric fields

  React.useEffect(() => {
    if (isUsingExcelData && excelData.length > 0) {
      setFinalData(
        compareData(
          excelData,
          fetchedHoldings,
          keyFields,
          nonKeyFields,
          numericFields
        )
      );
      setIsUsingExcelData(false); // Switch back to using fetched data
      setSelectedPortfolio(excelData[0]?.AACCT);
    } else if (fetchedHoldings && fetchedHoldings.length > 0) {
      setFinalData(fetchedHoldings);
    } else if (finalData.length !== 0) {
      // Prevent unnecessary updates
      setFinalData([]);
    }
  }, [excelData, fetchedHoldings]);

  const portfolioName = finalData[0]?.NAME + ` (${finalData[0]?.AACCT})`; // used for PDF output

  const columns = useHoldingsColumns(finalData, setFinalData, isEditAble, client, selectedPortfolio, fromDate, toDate); // Get Column information

  const queryClient = useQueryClient();
  // Mutations
  const { mutateAsync: createHolding, isPending: isCreatingHolding } =
    useMutation({
      mutationFn: async (createdHolding: HoldingsFields) => {
        // send the updated data to API function
        const editDataInCSV = `A${delim}${createdHolding.AACCT}${delim}${createdHolding.ADATE?.toString().replace(/\//g, "")}${delim}${createdHolding.HID}
        ${delim}${createdHolding.HUNITS}${delim}${createdHolding.HDIRECT1}${delim}${createdHolding.HDIRECT2}${delim}${createdHolding.HDIRECT3}${delim}${createdHolding.HPRINCIPAL}
        ${delim}${createdHolding.HACCRUAL}${delim}${createdHolding.HCARRY}${delim}${createdHolding.HDATE?.toString().replace(/\//g, "")}${delim}${createdHolding.HUNITST}
        ${delim}${createdHolding.HPRINCIPALT}${delim}${createdHolding.HACCRUALT}${delim}${createdHolding.HCARRYL}${delim}${createdHolding.USERDEF1}${delim}${createdHolding.USERCHR1}
      `;
        await FetchUpdateDeleteAPI(
          editDataInCSV.replace(/[\r\n]+/g, "").replace(/\s*\|\s*/g, "|").replace(/\|null\|/g, "||"),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPHOLD`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return createHolding;
      },
      onMutate: async (newHolding: HoldingsFields) => {
        await queryClient.cancelQueries({
          queryKey: ["holdings", selectedPortfolio, dateRange, client, accountNameData, assetNameData, sectorNameData],
        });

        const previousHoldings = queryClient.getQueryData<HoldingsFields[]>(["holdings", selectedPortfolio, dateRange, client, accountNameData, assetNameData, sectorNameData]) || [];

        queryClient.setQueryData(
          ["holdings", selectedPortfolio, dateRange, client, accountNameData, assetNameData, sectorNameData], // Use the exact query key
          (old: HoldingsFields[] | undefined) => [
            ...(old ?? []),
            { 
              ...newHolding, 
              id: uuidv4(),
              NAME: accountNameData?.find(account => account.ACCT === newHolding.AACCT)?.NAME || "Name Not Defined",
              NAMETKR: assetNameData?.find(asset => asset.ID === newHolding.HID)?.NAMETKR || "Name Not Defined",
              SNAME1: sectorNameData?.find(sector => sector.SORI === newHolding.HDIRECT1)?.SORINAME || "Name Not Defined",
              SNAME2: sectorNameData?.find(sector => sector.SORI === newHolding.HDIRECT2)?.SORINAME || "Name Not Defined",
              SNAME3: sectorNameData?.find(sector => sector.SORI === newHolding.HDIRECT3)?.SORINAME || "Name Not Defined",
            },
          ]
        );

        return { previousHoldings };
      },
    });

  const { mutateAsync: updateHolding, isPending: isUpdatingHolding } =
    useMutation({
      mutationFn: async (updatedHolding: HoldingsFields) => {
        // send the updated data to API function
        const editDataInCSV = `C${delim}${updatedHolding.AACCT}${delim}${updatedHolding.ADATE?.toString().replace(/\//g, "")}${delim}${updatedHolding.HID}
        ${delim}${updatedHolding.HUNITS}${delim}${updatedHolding.HDIRECT1}${delim}${updatedHolding.HDIRECT2}${delim}${updatedHolding.HDIRECT3}${delim}${updatedHolding.HPRINCIPAL}
        ${delim}${updatedHolding.HACCRUAL}${delim}${updatedHolding.HCARRY}${delim}${updatedHolding.HDATE?.toString().replace(/\//g, "")}${delim}${updatedHolding.HUNITST}
        ${delim}${updatedHolding.HPRINCIPALT}${delim}${updatedHolding.HACCRUALT}${delim}${updatedHolding.HCARRYL}${delim}${updatedHolding.USERDEF1}${delim}${updatedHolding.USERCHR1}
      `;
        await FetchUpdateDeleteAPI(
          editDataInCSV.replace(/[\r\n]+/g, "").replace(/\s*\|\s*/g, "|").replace(/\|null\|/g, "||"),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPHOLD`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return updatedHolding;
      },
      onMutate: async (updatedHolding: HoldingsFields) => {
        await queryClient.cancelQueries({ queryKey: ["holdings"] });
        const previousHoldings = queryClient.getQueryData<HoldingsFields[]>(["holdings"]);
        queryClient.setQueryData(["holdings"], (old: HoldingsFields[] = []) =>
          old.map((h) => (h.id === updatedHolding.id ? updatedHolding : h))
        );
        return { previousHoldings };
      },
    });

  const { mutateAsync: deleteHolding, isPending: isDeletingHolding } =
    useMutation({
      mutationFn: async ({ holdingId, AACCT, ADATE, HID}: {
        holdingId: string;
        AACCT: string;
        ADATE: string;
        HID: string;
      }) => {
        // send the updated data to API function
        const editDataInCSV = `D${delim}${AACCT}${delim}${ADATE?.toString().replace(
          /\//g,
          ""
        )}${delim}${HID}`;
        await FetchUpdateDeleteAPI(
          editDataInCSV.replace(/[\r\n]+/g, "").replace(/\s*\|\s*/g, "|").replace(/\|null\|/g, "||"),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPHOLD`
        ); // delete the holding
        await new Promise((resolve) => setTimeout(resolve, 100)); // Simulated API delay
        return Promise.resolve(holdingId);
      },
      onMutate: async ({ holdingId }) => {
        await queryClient.cancelQueries({
          queryKey: ["holdings", selectedPortfolio, dateRange, client, accountNameData, assetNameData, sectorNameData],
        });

        const previousHoldings = queryClient.getQueryData<HoldingsFields[]>(["holdings", selectedPortfolio, dateRange, client, accountNameData, assetNameData, sectorNameData]);

        // Optimistically update the cache by removing the deleted row
        queryClient.setQueryData(
          ["holdings", selectedPortfolio, dateRange, client, accountNameData, assetNameData, sectorNameData],
          (old: HoldingsFields[] = []) => {
            const newData = old.filter(
              (h: HoldingsFields) => h.id !== holdingId
            );
            return newData;
          }
        );

        return { previousHoldings };
      },
    });

  // CRUD Handlers
  const handleCreateHolding: MRT_TableOptions<HoldingsFields>["onCreatingRowSave"] =
    async ({ values, exitCreatingMode }) => {
      // Format DATES as expected date before saving
      const formattedValues = {
        ...values,
        ADATE: values.ADATE === "" || null ? "190012" : formatDateYYM(values.ADATE),
        HDATE: values.HDATE === "" || null ? "19001231" : formatDateYYMD(values.HDATE),
      };

      // Validate the updated values
      const errors = validateHolding(values);
      if (Object.values(errors).some(Boolean)) {
        return; // If there are validation errors, stop the save operation
      }

      // Save the created values instead of row.original
      await createHolding(formattedValues); // Use values instead of row.original
      exitCreatingMode();
      table.setCreatingRow(null); // Reset editing state
    };

  const handleSaveHolding: MRT_TableOptions<HoldingsFields>["onEditingRowSave"] =
    async ({ table, values }) => {
      // Format DATES as expected date before saving
      const formattedValues = {
        ...values,
        ADATE: formatDateYYM(values.ADATE),
        HDATE: formatDateYYMD(values.HDATE),
      };

      // Validate the updated values
      const errors = validateHolding(values);
      if (Object.values(errors).some(Boolean)) {
        return; // If there are validation errors, stop the save operation
      }

      // Save the updated values instead of row.original
      await updateHolding(formattedValues); // Use values instead of row.original

      // Reset the editing state
      table.setEditingRow(null);
    };

  const openDeleteConfirmModal = (row: MRT_Row<HoldingsFields>) => {
    modals.openConfirmModal({
      key: `delete-modal-${row.id}`,
      title: "Delete Holding?",
      children: (
        <Text>
          Delete {row.original.NAME} ({row.original.AACCT}), As Of Date (
          {row.original.ADATE.toString()}) and HID ({row.original.HID})?
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        deleteHolding({
          holdingId: row.original.id,
          AACCT: row.original.AACCT,
          ADATE: row.original.ADATE.toString(),
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

  const handleExportRows = (rows: MRT_Row<HoldingsFields>[]) => {
    const rowData = rows.map(({ original }) => {
      const { id, ...rest } = original; // Exclude 'id' field
      return {
        ...rest,
        ADATE: rest.ADATE.toString(), // Convert ADATE to string
        HDATE: rest.HDATE.toString(), // Convert HDATE to string
      };
    });

    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  interface ExcelDataUpdate {
    (newData: HoldingsFields[]): void;
  }

  const handleExcelDataUpdate: ExcelDataUpdate = (newData) => {
    setExcelData(newData); // Update excelData with the uploaded file data
    setIsUsingExcelData(true); // Switch to using Excel data
  };

  // create only records that is requires to update the Table
  const FRPHOLDExcel = finalData?.map(
    ({ id, NAME, NAMETKR, SNAME1, SNAME2, SNAME3, ...rest }) => ({
      ...rest,
    })
  );

  //  Custom headers for the PDF file
  const PDFheaders = [
    { label: "Asset Name", key: "NAMETKR" },
    { label: "Asset ID", key: "HID" },
    { label: "Sector 1 ID", key: "HDIRECT1" },
    { label: "Sector1 Name", key: "SNAME1" },
    { label: "As Of Date", key: "ADATE" },
    { label: "Units", key: "HUNITS", align: "right" },
    { label: "Principal", key: "HPRINCIPAL", align: "right" },
    { label: "Accrual", key: "HACCRUAL", align: "right" },
    { label: "Carry", key: "HCARRY", align: "right" },
  ];

  // Load data from excel to table
  const fieldnames = ["RECDTYPE", "AACCT", "ADATE", "HID", "HUNITS", "HDIRECT1", "HDIRECT2", "HDIRECT3", "HPRINCIPAL", "HACCRUAL",
    "HCARRY", "HDATE", "HUNITST", "HPRINCIPALT", "HACCRUALT", "HCARRYL", "USERDEF1", "USERCHR1",
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

  const { mutateAsync: updateHoldingExcel, isPending: isUpdatingHoldingExcel } =
    useMutation({
      mutationFn: async () => {
        // send the updated data to API function
        await FetchUpdateDeleteAPIExcel(
          convertToCSV(finalData),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPHOLD`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return Promise.resolve();
      },
      onMutate: async () => {},
    });

  const handleMRELoad = async () => {
    await updateHoldingExcel();
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
    mantineToolbarAlertBannerProps: isLoadingHoldingsError
      ? { color: "red", children: "Failed to load data. Update your selection criteria." }
      : undefined,
    // onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateHolding,
    // onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveHolding,
    enableRowActions: true,

    mantineTableBodyCellProps: { 
      className: "rpt-body",
    },

    renderCreateRowModalContent: ({ table, row, internalEditComponents }) => {
      setIsEditable(true);

      return (
        <Stack>
          <Flex className="mrt-model-title">
            <Title order={4}>Create New Holdings</Title>
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
              <React.Fragment key={index}>
                {index === 0 && (
                  <Grid.Col span={12}>
                    <Divider
                      mt="md"
                      label="General Information"
                      labelPosition="center"
                    />
                  </Grid.Col>
                )}
                {index === 11 && (
                  <Grid.Col span={12}>
                    <Divider
                      mt="md"
                      label="Primary Financials"
                      labelPosition="center"
                    />
                  </Grid.Col>
                )}
                {index === 15 && ( // Add a divider before the 20th component
                  <Grid.Col span={12}>
                    <Divider
                      mt="md"
                      label="Additional Holdings"
                      labelPosition="center"
                    />
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
            <Title order={4}>Edit Holdings</Title>
            <ActionIcon
              onClick={() => table.setEditingRow(null)}
              variant="light"
              size="lg"
              color="red"
            >
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
                    <Divider
                      mt="md"
                      label="General Information"
                      labelPosition="center"
                    />
                  </Grid.Col>
                )}
                {index === 11 && (
                  <Grid.Col span={12}>
                    <Divider
                      mt="md"
                      label="Primary Financials"
                      labelPosition="center"
                    />
                  </Grid.Col>
                )}
                {index === 15 && ( // Add a divider before the 20th component
                  <Grid.Col span={12}>
                    <Divider
                      mt="md"
                      label="Additional Holdings"
                      labelPosition="center"
                    />
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
                ADATE: new Date().toISOString(),
                HID: "",
                HDIRECT1: "",
                HDIRECT2: "",
                HDIRECT3: "",
                HUNITS: 0,
                HDATE: new Date().toISOString(),
                HPRINCIPAL: 0,
                HACCRUAL: 0,
                HCARRY: 0,
                HUNITST: 0,
                HPRINCIPALT: 0,
                HACCRUALT: 0,
                HCARRYL: 0,
                USERDEF1: 0,
                USERCHR1: "-",
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
          Create New Holding
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
          excelData={FRPHOLDExcel}
          reportName="Holdings"
          PDFheaders={PDFheaders}
          portfolioName={portfolioName}
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
      isLoading: isLoadingHoldings,
      isSaving:
        isCreatingHolding ||
        isUpdatingHolding ||
        isDeletingHolding ||
        isUpdatingHoldingExcel,
      showAlertBanner: isLoadingHoldingsError,
      showProgressBars: isFetchingHoldings,
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

const FrpHoldings = () => (
  <ModalsProvider>
    <HoldingsMTable />
  </ModalsProvider>
);

export default FrpHoldings;

const validateRequired = (value: string) => !!value.length;

function validateHolding(holding: HoldingsFields) {
  return {
    ADATE: !validateRequired(holding.ADATE?.toString())
      ? "Date is Required"
      : "",
  };
}
