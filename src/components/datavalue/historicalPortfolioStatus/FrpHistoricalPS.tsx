import React, { useState } from "react";
import {
  MRT_EditActionButtons,
  MantineReactTable,
  type MRT_Row,
  type MRT_TableOptions,
  useMantineReactTable,
  createRow,
} from "mantine-react-table";
import { ActionIcon, Button, Flex, Text, Tooltip, Stack, Title, Grid} from "@mantine/core";
import { CopyIcon, EXPORT_SVG } from "../../../svgicons/svgicons.js";
import { ModalsProvider, modals } from "@mantine/modals";
import { IconEdit, IconTrash, IconPlus, IconRefresh} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import { FetchAPI, FetchUpdateDeleteAPI, FetchUpdateDeleteAPIExcel} from "../../../api.js";
import useClient from "../../hooks/useClient.js";
import { useHistoricalPSColumns, HistoricalPSFields } from "../columnTitles/HistoricalPSColumns.tsx";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs
import { mkConfig, generateCsv, download } from "export-to-csv"; //or use your library of choice here

import { compareData } from "../../report-components/compareData.js";
import { Import } from "../../report-components/Import.js";
import { Export } from "../../report-components/Export.js";
import { useAccountName } from "../../hooks/useFrpNamesFiltersDDLsApi.js";
import { formatDateYYMD, formatFromDateYYMD, formatToDateYYMMDD } from "../../hooks/FormatDates.tsx";

type DateRange = string[];

type OutletContextType = {
  selectedPortfolio: string;
  setSelectedPortfolio: (portfolio: string) => void;
  dateRange: DateRange;
};

const HistoricalPSMTable = () => {
  const [finalData, setFinalData] = useState<HistoricalPSFields[]>([]);
  const [excelData, setExcelData] = useState<HistoricalPSFields[]>([]);
  const [isUsingExcelData, setIsUsingExcelData] = useState(false);
  const [isEditAble, setIsEditable] = useState<boolean>(false);

  const client = useClient();
  const delim = process.env.REACT_APP_DELIMITER;

  const { selectedPortfolio, setSelectedPortfolio } =  useOutletContext<OutletContextType>();
  const { dateRange } = useOutletContext<OutletContextType>();
  const fromDate = formatFromDateYYMD(dateRange as [string, string]) ;
  const toDate = formatToDateYYMMDD(dateRange as [string, string]) ;
  
  const { data: accountNameData } = useAccountName(selectedPortfolio, client); // Fetch account name data
  
  const historicalPSUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPACCT&filters=ACCT(${selectedPortfolio});ASOFDATE(GT:${fromDate}:AND:ASOFDATE:LE:${toDate})`;

  // Unified data fetch using React Query
  const {
      data: fetchedHistoricalPS = [],
      isError: isLoadingHistoricalPSError,
      isFetching: isFetchingHistoricalPS,
      isLoading: isLoadingHistoricalPS,
  } = useQuery<HistoricalPSFields[]>({
      queryKey: ["historicalPS", selectedPortfolio, dateRange, client, accountNameData], // Add assetNameData to queryKey
      queryFn: async () => {
          const data = await FetchAPI(historicalPSUri);
          
          return data.map((row) => {
              // Account name matching
              const matchedAccount = accountNameData?.find(account => account.ACCT === row.ACCT);
              const matchedAccountName = matchedAccount?.NAME === undefined ? "Name Not Defined" : matchedAccount?.NAME;
              
              return {
                  ...row,
                  id: row.id || uuidv4(),
                  NAME: matchedAccountName, // add NAME field conditionally
              };
          });
      },
      enabled: !!selectedPortfolio && !!dateRange && !!client && !!accountNameData, // Add assetNameData to enabled condition
  });

  // Determine which data to display
  // const data = isUsingExcelData ? excelData : fetchedHistoricalPS;
  // Update finalData based on excelData or data
  const keyFields = ["ACCT", "ASOFDATE"];
  const alphaFields = [ "STATUS", "OPEN1", "OPEN2"];
  const numericFields = []; // Define numeric fields

  React.useEffect(() => {
    if (isUsingExcelData && excelData.length > 0) {
      setFinalData(
        compareData(
          excelData,
          fetchedHistoricalPS,
          keyFields,
          alphaFields,
          numericFields
        )
      );
      setIsUsingExcelData(false); // Switch back to using fetched data
      setSelectedPortfolio(excelData[0]?.ACCT);
    } else if (fetchedHistoricalPS && fetchedHistoricalPS.length > 0) {
      setFinalData(fetchedHistoricalPS);
    } else if (finalData.length !== 0) {
      // Prevent unnecessary updates
      setFinalData([]);
    }
  }, [excelData, fetchedHistoricalPS]);

  const portfolioName = finalData[0]?.NAME + ` (${finalData[0]?.ACCT})`; // used for PDF output

  const columns = useHistoricalPSColumns(finalData, setFinalData, isEditAble); // Get Column information

  const queryClient = useQueryClient();
  // Mutations
  const { mutateAsync: createHistoricalPS, isPending: isCreatingHistoricalPS } =
    useMutation({
      mutationFn: async (createdHistoricalPS: HistoricalPSFields) => {
        // send the updated data to API function
        const editDataInCSV = `A${delim}${createdHistoricalPS.ACCT}${delim}${createdHistoricalPS.ASOFDATE?.toString().replace(/\//g, "").replace(/-/g, "")}
        ${delim}${createdHistoricalPS.STATUS}${delim}${createdHistoricalPS.OPEN1}${delim}${createdHistoricalPS.OPEN2}
      `;
        await FetchUpdateDeleteAPI(
          editDataInCSV.replace(/[\r\n]+/g, "").replace(/\s*\|\s*/g, "|").replace(/\|null\|/g, "||"),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPACCT`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return createHistoricalPS;
      },
      onMutate: async (newHistoricalPS: HistoricalPSFields) => {
        await queryClient.cancelQueries({
          queryKey: ["historicalPS", selectedPortfolio, dateRange, client, accountNameData],
        });

        const previousHistoricalPS = queryClient.getQueryData<HistoricalPSFields[]>(["historicalPS", selectedPortfolio, dateRange, client, accountNameData]) || [];

        queryClient.setQueryData(
          ["historicalPS", selectedPortfolio, dateRange, client, accountNameData], // Use the exact query key
          (old: HistoricalPSFields[] | undefined) => [
            ...(old ?? []),
            { ...newHistoricalPS, id: uuidv4(), NAME: accountNameData?.find(account => account.ACCT === newHistoricalPS.ACCT)?.NAME || "Name Not Defined" },
          ]
        );

        return { previousHistoricalPS };
      },
    });

  const { mutateAsync: updateHistoricalPS, isPending: isUpdatingHistoricalPS } =
    useMutation({
      mutationFn: async (updatedHistoricalPS: HistoricalPSFields) => {
        // send the updated data to API function
        const editDataInCSV = `C${delim}${updatedHistoricalPS.ACCT}${delim}${updatedHistoricalPS.ASOFDATE?.toString().replace(/\//g, "").replace(/-/g, "")}
          ${delim}${updatedHistoricalPS.STATUS}${delim}${updatedHistoricalPS.OPEN1}${delim}${updatedHistoricalPS.OPEN2}
      `;
        await FetchUpdateDeleteAPI(
          editDataInCSV.replace(/[\r\n]+/g, "").replace(/\s*\|\s*/g, "|").replace(/\|null\|/g, "||"),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPACCT`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return updatedHistoricalPS;
      },
      onMutate: async (updatedHistoricalPS: HistoricalPSFields) => {
        await queryClient.cancelQueries({ queryKey: ["historicalPS"] });
        const previousHistoricalPS = queryClient.getQueryData<HistoricalPSFields[]>(["historicalPS"]);
        queryClient.setQueryData(["historicalPS"], (old: HistoricalPSFields[] = []) =>
          old.map((h) => (h.id === updatedHistoricalPS.id ? updatedHistoricalPS : h))
        );
        return { previousHistoricalPS };
      },
    });

  const { mutateAsync: deleteHistoricalPS, isPending: isDeletingHistoricalPS } =
    useMutation({
      mutationFn: async ({ historicalPSId, ACCT, ASOFDATE}: {
        historicalPSId: string;
        ACCT: string;
        ASOFDATE: string;
      }) => {
        // send the updated data to API function
        const editDataInCSV = `D${delim}${ACCT}${delim}${ASOFDATE?.toString().replace(/\//g, "").replace(/-/g, "")}`;
        await FetchUpdateDeleteAPI(
          editDataInCSV.replace(/[\r\n]+/g, "").replace(/\s*\|\s*/g, "|").replace(/\|null\|/g, "||"),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPACCT`
        ); // delete the historicalPS
        await new Promise((resolve) => setTimeout(resolve, 100)); // Simulated API delay
        return Promise.resolve(historicalPSId);
      },
      onMutate: async ({ historicalPSId }) => {
        await queryClient.cancelQueries({
          queryKey: ["historicalPS", selectedPortfolio, dateRange, client, accountNameData],
        });

        const previousHistoricalPS = queryClient.getQueryData<HistoricalPSFields[]>(["historicalPS", selectedPortfolio, dateRange, client, accountNameData]);

        // Optimistically update the cache by removing the deleted row
        queryClient.setQueryData(
          ["historicalPS", selectedPortfolio, dateRange, client, accountNameData],
          (old: HistoricalPSFields[] = []) => {
            const newData = old.filter(
              (h: HistoricalPSFields) => h.id !== historicalPSId
            );
            return newData;
          }
        );

        return { previousHistoricalPS };
      },
    });

  // CRUD Handlers
  const handleCreateHistoricalPS: MRT_TableOptions<HistoricalPSFields>["onCreatingRowSave"] =
    async ({ values, exitCreatingMode }) => {

      const formattedValues = {
        ...values,
        ASOFDATE: values.ASOFDATE === "" || null ? "19001201" : formatDateYYMD(values.ASOFDATE),
      };

      // Validate the updated values
      const errors = validateHistoricalPS(formattedValues);
      if (Object.values(errors).some(Boolean)) {
        return; // If there are validation errors, stop the save operation
      }

      // Save the created values instead of row.original
      await createHistoricalPS(values); // Use values instead of row.original
      exitCreatingMode();
      table.setCreatingRow(null); // Reset editing state
    };

  const handleSaveHistoricalPS: MRT_TableOptions<HistoricalPSFields>["onEditingRowSave"] =
    async ({ table, values }) => {

      const formattedValues = {
        ...values,
        ASOFDATE: values.ASOFDATE === "" || null ? "19001201" : formatDateYYMD(values.ASOFDATE),
      };
      // Validate the updated values
      const errors = validateHistoricalPS(formattedValues);
      if (Object.values(errors).some(Boolean)) {
        return; // If there are validation errors, stop the save operation
      }

      // Save the updated values instead of row.original
      await updateHistoricalPS(values); // Use values instead of row.original

      // Reset the editing state
      table.setEditingRow(null);
    };

  const openDeleteConfirmModal = (row: MRT_Row<HistoricalPSFields>) => {
    modals.openConfirmModal({
      key: `delete-modal-${row.id}`,
      title: "Delete Historical Portfolio Status?",
      children: (
        <Text>
          Delete {row.original.NAME} ({row.original.ACCT}) and As Of Date ({row.original.ASOFDATE?.toString()})?
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        deleteHistoricalPS({
          historicalPSId: row.original.id,
          ACCT: row.original.ACCT,
          ASOFDATE: row.original.ASOFDATE.toString()
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

  const handleExportRows = (rows: MRT_Row<HistoricalPSFields>[]) => {
    const rowData = rows.map(({ original }) => {
      const { id, ...rest } = original; // Exclude 'id' field
      return {
        ...rest,
        ASOFDATE: rest.ASOFDATE.toString(), // Convert ADATE to string
      };
    });

    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  interface ExcelDataUpdate {
    (newData: HistoricalPSFields[]): void;
  }

  const handleExcelDataUpdate: ExcelDataUpdate = (newData) => {
    setExcelData(newData); // Update excelData with the uploaded file data
    setIsUsingExcelData(true); // Switch to using Excel data
  };

  // create only records that is requires to update the Table
  const FRPACCTExcel = finalData?.map(
    ({ id, NAME, ...rest }) => ({
      ...rest,
    })
  );

  //  Custom headers for the PDF file
  const PDFheaders = [
    { label: "Status", key: "STATUS" },
    { label: "Open 1", key: "OPEN1" },
    { label: "Open 2", key: "OPEN2" },
  ];

  // Load data from excel to table
  const fieldnames = ["RECDTYPE", "ACCT", "ASOFDATE", "STATUS", "OPEN1", "OPEN2"];

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

  const { mutateAsync: updateHistoricalPSExcel, isPending: isUpdatingHistoricalPSExcel } =
    useMutation({
      mutationFn: async () => {
        // send the updated data to API function
        await FetchUpdateDeleteAPIExcel(
          convertToCSV(finalData),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPACCT`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return Promise.resolve();
      },
      onMutate: async () => {},
    });

  const handleMRELoad = async () => {
    await updateHistoricalPSExcel();
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
    mantineToolbarAlertBannerProps: isLoadingHistoricalPSError
      ? { color: "red", children: "Failed to load data. Update your selection criteria." }
      : undefined,
    // onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateHistoricalPS,
    // onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveHistoricalPS,
    enableRowActions: true,

    mantineTableBodyCellProps: { 
      className: "rpt-body",
    },

    renderCreateRowModalContent: ({ table, row, internalEditComponents }) => {
      setIsEditable(true);

      return (
        <Stack>
          <Flex className="mrt-model-title">
            <Title order={4}>Create New Historical Portfolio Status</Title>
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
            <Title order={4}>Edit Historical Portfolio Status</Title>
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
                ASOFDATE: formatDateYYMD(new Date().toISOString()),
                STATUS: "",
                OPEN1: "",
                OPEN2: "",
                RECDTYPE: "A",
              })
            );
          }}
          disabled={finalData?.length > 0 ? false : true}
          className="rpt-action-button"
        >
          Create New Historical Portfolio Status
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
          excelData={FRPACCTExcel}
          reportName="Historical Portfolio Status"
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

    state: {
      isLoading: isLoadingHistoricalPS,
      isSaving:
        isCreatingHistoricalPS ||
        isUpdatingHistoricalPS ||
        isDeletingHistoricalPS ||
        isUpdatingHistoricalPSExcel,
      showAlertBanner: isLoadingHistoricalPSError,
      showProgressBars: isFetchingHistoricalPS,
    },
  });


  // Your Modal, rendered outside of the menu
  return (
    <MantineReactTable table={table} />
  );
};

const FrpHistoricalPS = () => (
  <ModalsProvider>
    <HistoricalPSMTable />
  </ModalsProvider>
);

export default FrpHistoricalPS;

const validateRequired = (value: string) => !!value.length;

function validateHistoricalPS(historicalPS: HistoricalPSFields) {
  return {
    ACCT: !validateRequired(historicalPS.ACCT?.toString())
      ? "Field is Required"
      : "",
  };
}
