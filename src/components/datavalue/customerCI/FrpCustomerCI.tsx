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
import { useCustomerCIColumns, CustomerCIFields } from "../columnTitles/CustomerCIColumns.tsx";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs
import { mkConfig, generateCsv, download } from "export-to-csv"; //or use your library of choice here

import { compareData } from "../../report-components/compareData.js";
import { Import } from "../../report-components/Import.js";
import { Export } from "../../report-components/Export.js";
import { useAccountName } from "../../hooks/useFrpNamesFiltersDDLsApi.js";
import { formatDateYYMD } from "../../hooks/FormatDates.tsx";

type DateRange = string[];

type OutletContextType = {
  selectedPortfolio: string;
  setSelectedPortfolio: (portfolio: string) => void;
  dateRange: DateRange;
};

const CustomerCIMTable = () => {
  const [finalData, setFinalData] = useState<CustomerCIFields[]>([]);
  const [excelData, setExcelData] = useState<CustomerCIFields[]>([]);
  const [isUsingExcelData, setIsUsingExcelData] = useState(false);
  const [isEditAble, setIsEditable] = useState<boolean>(false);

  const client = useClient();
  const delim = process.env.REACT_APP_DELIMITER;

  const { selectedPortfolio, setSelectedPortfolio } =  useOutletContext<OutletContextType>();
  const { dateRange } = useOutletContext<OutletContextType>();
  
  const { data: accountNameData } = useAccountName(selectedPortfolio, client); // Fetch account name data
  
  const lcustomerCIUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPCSTMR&filters=ACCT(${selectedPortfolio})`;

  // Unified data fetch using React Query
  const {
      data: fetchedCustomerCI = [],
      isError: isLoadingCustomerCIError,
      isFetching: isFetchingCustomerCI,
      isLoading: isLoadingCustomerCI,
  } = useQuery<CustomerCIFields[]>({
      queryKey: ["customerCI", selectedPortfolio, dateRange, client, accountNameData], // Add assetNameData to queryKey
      queryFn: async () => {
          const data = await FetchAPI(lcustomerCIUri);
          
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
  // const data = isUsingExcelData ? excelData : fetchedCustomerCI;
  // Update finalData based on excelData or data
  const keyFields = ["ACCT", "SEQNUM"];
  const alphaFields = [ "NAME1", "NAME2", "NAME3", "NAME4", "NAME5", "ADDR1", "ADDR2", "ADDR3", "CITY", "STATE", "ZIP", "SHRTNAME", "BANKNAME",  "OFFNAME", "OFFPHONE", "ADMNAME","ADMPHONE",
    "TAXID","STMTICP"
  ];
  const numericFields = []; // Define numeric fields

  React.useEffect(() => {
    if (isUsingExcelData && excelData.length > 0) {
      setFinalData(
        compareData(
          excelData,
          fetchedCustomerCI,
          keyFields,
          alphaFields,
          numericFields
        )
      );
      setIsUsingExcelData(false); // Switch back to using fetched data
      setSelectedPortfolio(excelData[0]?.ACCT);
    } else if (fetchedCustomerCI && fetchedCustomerCI.length > 0) {
      setFinalData(fetchedCustomerCI);
    } else if (finalData.length !== 0) {
      // Prevent unnecessary updates
      setFinalData([]);
    }
  }, [excelData, fetchedCustomerCI]);

  const portfolioName = finalData[0]?.NAME + ` (${finalData[0]?.ACCT})`; // used for PDF output

  const columns = useCustomerCIColumns(finalData, setFinalData, isEditAble); // Get Column information

  const queryClient = useQueryClient();
  // Mutations
  const { mutateAsync: createCustomerCI, isPending: isCreatingCustomerCI } =
    useMutation({
      mutationFn: async (createdCustomerCI: CustomerCIFields) => {
        // send the updated data to API function
        const editDataInCSV = `A${delim}${createdCustomerCI.ACCT}${delim}${createdCustomerCI.SEQNUM}
        ${delim}${createdCustomerCI.NAME1}${delim}${createdCustomerCI.NAME2}${delim}${createdCustomerCI.NAME3}${delim}${createdCustomerCI.NAME4}${delim}${createdCustomerCI.NAME5}
        ${delim}${createdCustomerCI.ZIP}${delim}${createdCustomerCI.SHRTNAME}${delim}${createdCustomerCI.BANKNAME}${delim}${createdCustomerCI.OFFNAME}
        ${delim}${createdCustomerCI.OFFPHONE}${delim}${createdCustomerCI.ADMNAME}${delim}${createdCustomerCI.ADMPHONE}${delim}${createdCustomerCI.TAXID}
        ${delim}${createdCustomerCI.STMTICP?.toString().replace(/\//g, "").replace(/-/g, "")}
      `;
        await FetchUpdateDeleteAPI(
          editDataInCSV.replace(/[\r\n]+/g, "").replace(/\s*\|\s*/g, "|").replace(/\|null\|/g, "||"),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPCSTMR`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return createCustomerCI;
      },
      onMutate: async (newCustomerCI: CustomerCIFields) => {
        await queryClient.cancelQueries({
          queryKey: ["customerCI", selectedPortfolio, dateRange, client, accountNameData],
        });

        const previousCustomerCI = queryClient.getQueryData<CustomerCIFields[]>(["customerCI", selectedPortfolio, dateRange, client, accountNameData]) || [];

        queryClient.setQueryData(
          ["customerCI", selectedPortfolio, dateRange, client, accountNameData], // Use the exact query key
          (old: CustomerCIFields[] | undefined) => [
            ...(old ?? []),
            { ...newCustomerCI, id: uuidv4(), NAME: accountNameData?.find(account => account.ACCT === newCustomerCI.ACCT)?.NAME || "Name Not Defined" },
          ]
        );

        return { previousCustomerCI };
      },
    });

  const { mutateAsync: updateCustomerCI, isPending: isUpdatingCustomerCI } =
    useMutation({
      mutationFn: async (updatedCustomerCI: CustomerCIFields) => {
        // send the updated data to API function
        const editDataInCSV = `C${delim}${updatedCustomerCI.ACCT}${delim}${updatedCustomerCI.SEQNUM}
          ${delim}${updatedCustomerCI.NAME1}${delim}${updatedCustomerCI.NAME2}${delim}${updatedCustomerCI.NAME3}${delim}${updatedCustomerCI.NAME4}${delim}${updatedCustomerCI.NAME5}
          ${delim}${updatedCustomerCI.ZIP}${delim}${updatedCustomerCI.SHRTNAME}${delim}${updatedCustomerCI.BANKNAME}${delim}${updatedCustomerCI.OFFNAME}
          ${delim}${updatedCustomerCI.OFFPHONE}${delim}${updatedCustomerCI.ADMNAME}${delim}${updatedCustomerCI.ADMPHONE}${delim}${updatedCustomerCI.TAXID}
          ${delim}${updatedCustomerCI.STMTICP?.toString().replace(/\//g, "").replace(/-/g, "")}
      `;
        await FetchUpdateDeleteAPI(
          editDataInCSV.replace(/[\r\n]+/g, "").replace(/\s*\|\s*/g, "|").replace(/\|null\|/g, "||"),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPCSTMR`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return updatedCustomerCI;
      },
      onMutate: async (updatedCustomerCI: CustomerCIFields) => {
        await queryClient.cancelQueries({ queryKey: ["customerCI"] });
        const previousCustomerCI = queryClient.getQueryData<CustomerCIFields[]>(["customerCI"]);
        queryClient.setQueryData(["customerCI"], (old: CustomerCIFields[] = []) =>
          old.map((h) => (h.id === updatedCustomerCI.id ? updatedCustomerCI : h))
        );
        return { previousCustomerCI };
      },
    });

  const { mutateAsync: deleteCustomerCI, isPending: isDeletingCustomerCI } =
    useMutation({
      mutationFn: async ({ customerCIId, ACCT, SEQNUM}: {
        customerCIId: string;
        ACCT: string;
        SEQNUM: string;
      }) => {
        // send the updated data to API function
        const editDataInCSV = `D${delim}${ACCT}${delim}${SEQNUM}`;
        await FetchUpdateDeleteAPI(
          editDataInCSV.replace(/[\r\n]+/g, "").replace(/\s*\|\s*/g, "|").replace(/\|null\|/g, "||"),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPCSTMR`
        ); // delete the customerCI
        await new Promise((resolve) => setTimeout(resolve, 100)); // Simulated API delay
        return Promise.resolve(customerCIId);
      },
      onMutate: async ({ customerCIId }) => {
        await queryClient.cancelQueries({
          queryKey: ["customerCI", selectedPortfolio, dateRange, client, accountNameData],
        });

        const previousCustomerCI = queryClient.getQueryData<CustomerCIFields[]>(["customerCI", selectedPortfolio, dateRange, client, accountNameData]);

        // Optimistically update the cache by removing the deleted row
        queryClient.setQueryData(
          ["customerCI", selectedPortfolio, dateRange, client, accountNameData],
          (old: CustomerCIFields[] = []) => {
            const newData = old.filter(
              (h: CustomerCIFields) => h.id !== customerCIId
            );
            return newData;
          }
        );

        return { previousCustomerCI };
      },
    });

  // CRUD Handlers
  const handleCreateCustomerCI: MRT_TableOptions<CustomerCIFields>["onCreatingRowSave"] =
    async ({ values, exitCreatingMode }) => {

      const formattedValues = {
        ...values,
        STMTICP: values.STMTICP === "" || null ? "19001201" : formatDateYYMD(values.STMTICP),
      };

      // Validate the updated values
      const errors = validateCustomerCI(formattedValues);
      if (Object.values(errors).some(Boolean)) {
        return; // If there are validation errors, stop the save operation
      }

      // Save the created values instead of row.original
      await createCustomerCI(values); // Use values instead of row.original
      exitCreatingMode();
      table.setCreatingRow(null); // Reset editing state
    };

  const handleSaveCustomerCI: MRT_TableOptions<CustomerCIFields>["onEditingRowSave"] =
    async ({ table, values }) => {

      const formattedValues = {
        ...values,
        STMTICP: values.STMTICP === "" || null ? "19001201" : formatDateYYMD(values.STMTICP),
      };
      // Validate the updated values
      const errors = validateCustomerCI(formattedValues);
      if (Object.values(errors).some(Boolean)) {
        return; // If there are validation errors, stop the save operation
      }

      // Save the updated values instead of row.original
      await updateCustomerCI(values); // Use values instead of row.original

      // Reset the editing state
      table.setEditingRow(null);
    };

  const openDeleteConfirmModal = (row: MRT_Row<CustomerCIFields>) => {
    modals.openConfirmModal({
      key: `delete-modal-${row.id}`,
      title: "Delete Customer Contact Info?",
      children: (
        <Text>
          Delete {row.original.NAME} ({row.original.ACCT}) and Sequence # ({row.original.SEQNUM})?
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        deleteCustomerCI({
          customerCIId: row.original.id,
          ACCT: row.original.ACCT,
          SEQNUM: row.original.SEQNUM
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

  const handleExportRows = (rows: MRT_Row<CustomerCIFields>[]) => {
    const rowData = rows.map(({ original }) => {
      const { id, ...rest } = original; // Exclude 'id' field
      return {
        ...rest,
        STMTICP: rest.STMTICP.toString(), // Convert ADATE to string
      };
    });

    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  interface ExcelDataUpdate {
    (newData: CustomerCIFields[]): void;
  }

  const handleExcelDataUpdate: ExcelDataUpdate = (newData) => {
    setExcelData(newData); // Update excelData with the uploaded file data
    setIsUsingExcelData(true); // Switch to using Excel data
  };

  // create only records that is requires to update the Table
  const FRPCSTMRExcel = finalData?.map(
    ({ id, NAME, ...rest }) => ({
      ...rest,
    })
  );

  //  Custom headers for the PDF file
  const PDFheaders = [
    { label: "Seq #", key: "SEQNUM" },
    { label: "Name 1", key: "NAME1" },
    { label: "City", key: "CITY" },
    { label: "State", key: "STATE" },
    { label: "Zip code", key: "ZIP" },
    { label: "Bank", key: "BANKNAME"},
    { label: "Officer", key: "OFFNAME" },
    { label: "Admin", key: "ADMNAME" },
    { label: "STIM Date", key: "STMTICP" },
  ];

  // Load data from excel to table
  const fieldnames = ["RECDTYPE", "ACCT", "SEQNUM", "NAME1", "NAME2", "NAME3", "NAME4", "NAME5", 
    // "ADDR1", "ADDR2", "ADDR3", 
    "CITY", "STATE", "ZIP", "SHRTNAME", "BANKNAME", "OFFNAME", "OFFPHONE", "ADMNAME", "ADMPHONE",
    "TAXID", "STMTICP"
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

  const { mutateAsync: updateCustomerCIExcel, isPending: isUpdatingCustomerCIExcel } =
    useMutation({
      mutationFn: async () => {
        // send the updated data to API function
        await FetchUpdateDeleteAPIExcel(
          convertToCSV(finalData),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPCSTMR`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return Promise.resolve();
      },
      onMutate: async () => {},
    });

  const handleMRELoad = async () => {
    await updateCustomerCIExcel();
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
    mantineToolbarAlertBannerProps: isLoadingCustomerCIError
      ? { color: "red", children: "Failed to load data. Update your selection criteria." }
      : undefined,
    // onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateCustomerCI,
    // onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveCustomerCI,
    enableRowActions: true,

    mantineTableBodyCellProps: { 
      className: "rpt-body",
    },

    renderCreateRowModalContent: ({ table, row, internalEditComponents }) => {
      setIsEditable(true);

      return (
        <Stack>
          <Flex className="mrt-model-title">
            <Title order={4}>Create New Customer</Title>
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
              <Grid.Col key={index} span={3}>
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
        <Stack>
          <Flex className="mrt-model-title">
            <Title order={4}>Edit Customer Contact Info</Title>
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
              <Grid.Col key={index} span={3}>
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
                ACCT: selectedPortfolio,
                NAME: "",
                SEQNUM: "",
                NAME1: "",
                NAME2: "",
                NAME3: "",
                NAME4: "",
                NAME5: "",
                ADDR1: "",
                ADDR2: "",
                ADDR3: "",
                CITY: "",
                STATE: "",
                ZIP: "",
                SHRTNAME: "",
                BANKNAME: "",
                OFFNAME: "",
                OFFPHONE: "",
                ADMNAME: "",
                ADMPHONE: "",
                TAXID: "",
                STMTICP: formatDateYYMD(new Date().toISOString()),
                RECDTYPE: "A",
              })
            );
          }}
          disabled={finalData?.length > 0 ? false : true}
          className="rpt-action-button"
        >
          Create New Customer
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
          excelData={FRPCSTMRExcel}
          reportName="Customer Contact Info"
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
      isLoading: isLoadingCustomerCI,
      isSaving:
        isCreatingCustomerCI ||
        isUpdatingCustomerCI ||
        isDeletingCustomerCI ||
        isUpdatingCustomerCIExcel,
      showAlertBanner: isLoadingCustomerCIError,
      showProgressBars: isFetchingCustomerCI,
    },
  });


  // Your Modal, rendered outside of the menu
  return (
    <MantineReactTable table={table} />
  );
};

const FrpCustomerCI = () => (
  <ModalsProvider>
    <CustomerCIMTable />
  </ModalsProvider>
);

export default FrpCustomerCI;

const validateRequired = (value: string) => !!value.length;

function validateCustomerCI(customerCI: CustomerCIFields) {
  return {
    ACCT: !validateRequired(customerCI.ACCT?.toString())
      ? "Field is Required"
      : "",
  };
}
