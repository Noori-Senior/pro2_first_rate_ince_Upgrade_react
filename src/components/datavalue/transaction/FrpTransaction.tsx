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
import { useTransactionsColumns, TransactionsFields} from "../columnTitles/TransactionsColumns.tsx";
import { formatToDateYYM, formatFromDateYYM, formatDateYYM, formatDateYYMD } from "../../hooks/FormatDates.tsx";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs
import { mkConfig, generateCsv, download } from "export-to-csv"; //or use your library of choice here

import { compareData } from "../../report-components/compareData.js";
import { Import } from "../../report-components/Import.js";
import { Export } from "../../report-components/Export.js";
import { PredictNumColumn } from "../../../aiAgents/PredictNumColumn.js";
import { useAccountName, useAssetName } from "../../hooks/useFrpNamesFiltersDDLsApi.js";

type DateRange = string[];

type OutletContextType = {
  selectedPortfolio: string;
  setSelectedPortfolio: (portfolio: string) => void;
  dateRange: DateRange;
};

const TransactionsMTable = () => {
  const [finalData, setFinalData] = useState<TransactionsFields[]>([]);
  const [excelData, setExcelData] = useState<TransactionsFields[]>([]);
  const [isUsingExcelData, setIsUsingExcelData] = useState(false);
  const [isEditAble, setIsEditable] = useState<boolean>(false);

  const client = useClient();
  const delim = process.env.REACT_APP_DELIMITER;

  // const { selectedPortfolio, dateRange } = useOutletContext<OutletContextType>();
  const { selectedPortfolio, setSelectedPortfolio } =  useOutletContext<OutletContextType>();
  const { dateRange } = useOutletContext<OutletContextType>();
  const fromDate = formatFromDateYYM(dateRange as [string, string]) ;
  const toDate = formatToDateYYM(dateRange as [string, string]) ;

  const { data: accountNameData } = useAccountName(selectedPortfolio, client); // Fetch account name data
  const { data: assetNameData } = useAssetName(client); // Fetch asset name data

  const ltransactionUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPTRAN&filters=AACCT(${selectedPortfolio});ADATE(GT:${fromDate}:AND:ADATE:LE:${toDate})`;

  // Unified data fetch using React Query
  const {
    data: fetchedTransactions = [],
    isError: isLoadingTransactionsError,
    isFetching: isFetchingTransactions,
    isLoading: isLoadingTransactions,
  } = useQuery<TransactionsFields[]>({
    queryKey: ["transactions", selectedPortfolio, dateRange, client, accountNameData, assetNameData],
    queryFn: async () => {
      const data = await FetchAPI(ltransactionUri);

      return data.map((row) => {
          // Account name matching
          const matchedAccount = accountNameData?.find(account => account.ACCT === row.AACCT);
          const matchedAccountName = matchedAccount?.NAME === null || undefined ? "Name Not Defined" : matchedAccount?.NAME;
          
          // Asset name matching - assuming assetNameData is an array
          const matchedAsset = assetNameData?.find(asset => asset.ID === row.HID);
          const matchedAssetName = matchedAsset?.NAMETKR === null || undefined ? "Name Not Defined" : matchedAsset?.NAMETKR;
          
          return {
              ...row,
              id: row.id || uuidv4(),
              NAME: matchedAccountName, // add NAME field conditionally
              NAMETKR: matchedAssetName, // add NAMETKR field conditionally
          };
      });
    },
    enabled: !!selectedPortfolio && !!dateRange && !!client && !!accountNameData && !!assetNameData,
    refetchOnWindowFocus: false,
  });

  // Determine which data to display
  // const data = isUsingExcelData ? excelData : fetchedTransactions;
  // Update finalData based on excelData or data
  const keyFields = ["AACCT", "ADATE", "HID", "TDATE", "TCODE", "TSEQ"];
  const nonKeyFields = [ "TPEND", "TSTATE", "TSTORY", "TSETTDATE", "TBROKER", "TRPTCODE", "STATEID", "UNIQSEQ", "TAXIND", "TPOST",
    "USERCHR1", "TPAYCNTRY", "USERCHR1", "USERCHR2", "USERCHR3", "USERCHR4", "USERCHR5", "USERCHR6", "USERDT1",
  ];
  const numericFields = [ "TUNITS", "TPRICE", "TPRINCIPAL", "TINCOME", "TNET", "TCARRY", "TCOMM", "TEXPENSE", "SHRTGAIN", "LONGGAIN", "TCARRYL", "TEXCHLOC", "USERDEF1", "TEXCHPAY"]; // Define numeric fields

  React.useEffect(() => {
    if (isUsingExcelData && excelData.length > 0) {
      setFinalData(
        compareData(
          excelData,
          fetchedTransactions,
          keyFields,
          nonKeyFields,
          numericFields
        )
      );
      setIsUsingExcelData(false); // Switch back to using fetched data
      setSelectedPortfolio(excelData[0]?.AACCT);
    } else if (fetchedTransactions && fetchedTransactions.length > 0) {
      setFinalData(fetchedTransactions);
    } else if (finalData.length !== 0) {
      // Prevent unnecessary updates
      setFinalData([]);
    }
  }, [excelData, fetchedTransactions]); // Removed isUsingExcelData from dependencies

  const portfolioName = finalData[0]?.NAME + ` (${finalData[0]?.AACCT})`; // used for PDF output

  const columns = useTransactionsColumns( finalData, setFinalData, client, selectedPortfolio, fromDate, toDate, isEditAble); // Get Column information

  const queryClient = useQueryClient();
  // Mutations
  const { mutateAsync: createTransaction, isPending: isCreatingTransaction } =
    useMutation({
      mutationFn: async (createdTransaction: TransactionsFields) => {
        // send the updated data to API function
        const editDataInCSV = `A${delim}${
          createdTransaction.AACCT
        }${delim}${createdTransaction.ADATE?.toString().replace(
          /\//g,
          ""
        )}${delim}${createdTransaction.HID}${delim}
        ${createdTransaction.TDATE?.toString().replace(/\//g, "")}${delim}${
          createdTransaction.TCODE
        }${delim}${createdTransaction.TSEQ}${delim}${
          createdTransaction.TPEND
        }${delim}
        ${createdTransaction.TSTATE}${delim}${
          createdTransaction.TSTORY
        }${delim}${createdTransaction.TORIGDATE?.toString().replace(/\//g, "")}
        ${delim}${createdTransaction.TSETTDATE?.toString().replace(
          /\//g,
          ""
        )}${delim}${createdTransaction.TUNITS}${delim}
        ${createdTransaction.TPRICE}${delim}${
          createdTransaction.TPRINCIPAL
        }${delim}${createdTransaction.TINCOME}${delim}${
          createdTransaction.TNET
        }${delim}${createdTransaction.TCARRY}${delim}
        ${createdTransaction.TCOMM}${delim}${
          createdTransaction.TEXPENSE
        }${delim}${createdTransaction.TBROKER}${delim}${
          createdTransaction.TRPTCODE
        }${delim}
        ${createdTransaction.SHRTGAIN}${delim}${
          createdTransaction.LONGGAIN
        }${delim}${createdTransaction.STATEID}${delim}${
          createdTransaction.UNIQSEQ
        }${delim}
        ${createdTransaction.TAXIND}${delim}${
          createdTransaction.TCARRYL
        }${delim}${createdTransaction.TPOST?.toString().replace(
          /\//g,
          ""
        )}${delim}${createdTransaction.TEXCHLOC}${delim}
        ${createdTransaction.USERDEF1}${delim}${
          createdTransaction.USERCHR1
        }${delim}${
          createdTransaction.TEXCHPAY
        }${delim}${createdTransaction.TPAYCNTRY?.replace(/\/null/g, "")}${delim}
        ${createdTransaction.USERCHR2}${delim}${
          createdTransaction.USERCHR3
        }${delim}${createdTransaction.USERCHR4}${delim}${
          createdTransaction.USERCHR5
        }${delim}
        ${
          createdTransaction.USERCHR6
        }${delim}${createdTransaction.USERDT1?.toString().replace(/\//g, "")}
      `;
        await FetchUpdateDeleteAPI(
          editDataInCSV
            .replace(/[\r\n]+/g, "")
            .replace(/\s*\|\s*/g, "|")
            .replace(/\|null\|/g, "||"),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPTRAN`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return createTransaction;
      },
      onMutate: async (newTransaction: TransactionsFields) => {
        await queryClient.cancelQueries({
          queryKey: ["transactions", selectedPortfolio, dateRange, client, accountNameData, assetNameData],
        });

        const previousTransactions =
          queryClient.getQueryData<TransactionsFields[]>(["transactions", selectedPortfolio, dateRange, client, accountNameData, assetNameData]) || [];

        queryClient.setQueryData(
          ["transactions", selectedPortfolio, dateRange, client, accountNameData, assetNameData], // Use the exact query key
          (old: TransactionsFields[] | undefined) => [
            ...(old ?? []),
            { 
              ...newTransaction, 
              id: uuidv4(),
              NAME: accountNameData?.find(account => account.ACCT === newTransaction.AACCT)?.NAME || "Name Not Defined",
              NAMETKR: assetNameData?.find(asset => asset.ID === newTransaction.HID)?.NAMETKR || "Name Not Defined",
            },
          ]
        );

        return { previousTransactions };
      },
    });

  const { mutateAsync: updateTransaction, isPending: isUpdatingTransaction } =
    useMutation({
      mutationFn: async (updatedTransaction: TransactionsFields) => {
        console.log("updatedTransaction:: ", updatedTransaction);
        // send the updated data to API function
        const editDataInCSV = `C${delim}${
          updatedTransaction.AACCT
        }${delim}${updatedTransaction.ADATE?.toString().replace(
          /\//g,
          ""
        )}${delim}${updatedTransaction.HID}${delim}
        ${updatedTransaction.TDATE?.toString().replace(/\//g, "")}${delim}${
          updatedTransaction.TCODE
        }${delim}${updatedTransaction.TSEQ}${delim}${
          updatedTransaction.TPEND
        }${delim}
        ${updatedTransaction.TSTATE}${delim}${
          updatedTransaction.TSTORY
        }${delim}${updatedTransaction.TORIGDATE?.toString().replace(
          /\//g,
          ""
        )}${delim}
        ${updatedTransaction.TSETTDATE?.toString().replace(/\//g, "")}${delim}${
          updatedTransaction.TUNITS
        }${delim}${updatedTransaction.TPRICE}${delim}${
          updatedTransaction.TPRINCIPAL
        }${delim}
        ${updatedTransaction.TINCOME}${delim}${
          updatedTransaction.TNET
        }${delim}${updatedTransaction.TCARRY}${delim}${
          updatedTransaction.TCOMM
        }${delim}${updatedTransaction.TEXPENSE}${delim}
        ${updatedTransaction.TBROKER}${delim}${
          updatedTransaction.TRPTCODE
        }${delim}${updatedTransaction.SHRTGAIN}${delim}${
          updatedTransaction.LONGGAIN
        }${delim}
        ${updatedTransaction.STATEID}${delim}${
          updatedTransaction.UNIQSEQ
        }${delim}${updatedTransaction.TAXIND}${delim}${
          updatedTransaction.TCARRYL
        }${delim}
        ${updatedTransaction.TPOST?.toString().replace(/\//g, "")}${delim}${
          updatedTransaction.TEXCHLOC
        }${delim}${updatedTransaction.USERDEF1}${delim}${
          updatedTransaction.USERCHR1
        }${delim}
        ${
          updatedTransaction.TEXCHPAY
        }${delim}${updatedTransaction.TPAYCNTRY?.replace(
          /\/null/g,
          ""
        )}${delim}${updatedTransaction.USERCHR2}${delim}${
          updatedTransaction.USERCHR3
        }${delim}
        ${updatedTransaction.USERCHR4}${delim}${
          updatedTransaction.USERCHR5
        }${delim}${
          updatedTransaction.USERCHR6
        }${delim}${updatedTransaction.USERDT1?.toString().replace(/\//g, "")}
      `;
        await FetchUpdateDeleteAPI(
          editDataInCSV
            .replace(/[\r\n]+/g, "")
            .replace(/\s*\|\s*/g, "|")
            .replace(/\|null\|/g, "||"),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPTRAN`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return updatedTransaction;
      },
      onMutate: async (updatedTransaction: TransactionsFields) => {
        await queryClient.cancelQueries({ queryKey: ["transactions"] });
        const previousTransactions = queryClient.getQueryData<
          TransactionsFields[]
        >(["transactions"]);
        queryClient.setQueryData(
          ["transactions"],
          (old: TransactionsFields[] = []) =>
            old.map((h) =>
              h.id === updatedTransaction.id ? updatedTransaction : h
            )
        );
        return { previousTransactions };
      },
    });

  const { mutateAsync: deleteTransaction, isPending: isDeletingTransaction } =
    useMutation({
      mutationFn: async ({
        transactionId,
        AACCT,
        ADATE,
        HID,
        TDATE,
        TCODE,
        TSEQ,
      }: {
        transactionId: string;
        AACCT: string;
        ADATE: string;
        HID: string;
        TDATE: string;
        TCODE: string;
        TSEQ: number;
      }) => {
        // send the updated data to API function
        const editDataInCSV = `D${delim}${AACCT}${delim}${ADATE?.toString().replace(
          /\//g,
          ""
        )}${delim}${HID}${delim}${TDATE?.toString().replace(
          /\//g,
          ""
        )}${delim}${TCODE}${delim}${TSEQ}${delim}`;
        await FetchUpdateDeleteAPI(
          editDataInCSV
            .replace(/[\r\n]+/g, "")
            .replace(/\s*\|\s*/g, "|")
            .replace(/\|null\|/g, "||"),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPTRAN`
        ); // delete the transacion
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated API delay
        return transactionId;
      },
      onMutate: async ({ transactionId }: { transactionId: string }) => {
        await queryClient.cancelQueries({
          queryKey: ["transactions", selectedPortfolio, dateRange, client, accountNameData, assetNameData],
        });

        const previousTransactions = queryClient.getQueryData<
          TransactionsFields[]
        >(["transactions", selectedPortfolio, dateRange, client, accountNameData, assetNameData]);

        // Optimistically update the cache by removing the deleted row
        queryClient.setQueryData(
          ["transactions", selectedPortfolio, dateRange, client, accountNameData, assetNameData],
          (old: TransactionsFields[] = []) =>
            old.filter((h: TransactionsFields) => h.id !== transactionId)
        );

        return { previousTransactions };
      },
    });

  // CRUD Handlers
  const handleCreateTransaction: MRT_TableOptions<TransactionsFields>["onCreatingRowSave"] =
    async ({ values, exitCreatingMode }) => {
      // Format DATES as expected date before saving
      const formattedValues = {
        ...values,
        ADATE:
          values.ADATE === "" || null ? "190012" : formatDateYYM(values.ADATE),
        TDATE:
          values.TDATE === "" || null
            ? "19001231"
            : formatDateYYMD(values.TDATE),
        TORIGDATE:
          values.TORIGDATE === "" || null
            ? "19001231"
            : formatDateYYMD(values.TORIGDATE),
        TSETTDATE:
          values.TSETTDATE === "" || null
            ? "19001231"
            : formatDateYYMD(values.TSETTDATE),
        TPOST:
          values.TPOST === "" || null
            ? "19001231"
            : formatDateYYMD(values.TPOST),
        USERDT1:
          values.USERDT1 === "" || null || "Invalid Date"
            ? "19001231"
            : formatDateYYMD(values.USERDT1),
      };

      // Validate the updated values
      const errors = validateTransaction(values);
      if (Object.values(errors).some(Boolean)) {
        return; // If there are validation errors, stop the save operation
      }

      // Save the created values instead of row.original
      await createTransaction(formattedValues); // Use values instead of row.original
      exitCreatingMode();
      table.setCreatingRow(null); // Reset editing state
    };

  const handleSaveTransaction: MRT_TableOptions<TransactionsFields>["onEditingRowSave"] =
    async ({ table, values }) => {
      // Format DATES as expected date before saving
      const formattedValues = {
        ...values,
        ADATE:
          values.ADATE === "" || null ? "190012" : formatDateYYM(values.ADATE),
        TDATE:
          values.TDATE === "" || null
            ? "19001231"
            : formatDateYYMD(values.TDATE),
        TORIGDATE:
          values.TORIGDATE === "" || null
            ? "19001231"
            : formatDateYYMD(values.TORIGDATE),
        TSETTDATE:
          values.TSETTDATE === "" || null
            ? "19001231"
            : formatDateYYMD(values.TSETTDATE),
        TPOST:
          values.TPOST === "" || null
            ? "19001231"
            : formatDateYYMD(values.TPOST),
        USERDT1:
          values.USERDT1 === "" || null || "Invalid Date"
            ? "1900/12/31"
            : formatDateYYMD(values.USERDT1),
      };

      // Validate the updated values
      const errors = validateTransaction(values);
      if (Object.values(errors).some(Boolean)) {
        return; // If there are validation errors, stop the save operation
      }

      // Save the updated values instead of row.original
      await updateTransaction(formattedValues); // Use values instead of row.original

      // Reset the editing state
      table.setEditingRow(null);
    };

  const openDeleteConfirmModal = (row: MRT_Row<TransactionsFields>) => {
    modals.openConfirmModal({
      key: `delete-modal-${row.id}`,
      title: "Delete Transaction?",
      children: (
        <Text>
          Delete {row.original.NAME} ({row.original.AACCT}), As Of Date (
          {row.original.ADATE.toString()}), HID ({row.original.HID}), TDATE (
          {row.original.TDATE.toString()}), TCODE ({row.original.TCODE}), TSEQ (
          {row.original.TSEQ})?
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        deleteTransaction({
          transactionId: row.original.id,
          AACCT: row.original.AACCT,
          ADATE: row.original.ADATE.toString(),
          HID: row.original.HID,
          TDATE: row.original.TDATE.toString(),
          TCODE: row.original.TCODE,
          TSEQ: row.original.TSEQ,
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

  const handleExportRows = (rows: MRT_Row<TransactionsFields>[]) => {
    const rowData = rows.map(({ original }) => {
      const { id, ...rest } = original; // Exclude 'id' field

      return {
        ...rest,
        ADATE: rest.ADATE?.toString() ?? "", // Convert ADATE to string, default to ""
        TDATE: rest.TDATE?.toString() ?? "", // Convert TDATE to string, default to ""
        TORIGDATE: rest.TORIGDATE?.toString() ?? "",
        TSETTDATE: rest.TSETTDATE?.toString() ?? "",
        TPOST: rest.TPOST?.toString() ?? "",
        USERDT1: rest.USERDT1?.toString() ?? "",
      };
    });

    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  interface ExcelDataUpdate {
    (newData: TransactionsFields[]): void;
  }

  const handleExcelDataUpdate: ExcelDataUpdate = (newData) => {
    setExcelData(newData); // Update excelData with the uploaded file data
    setIsUsingExcelData(true); // Switch to using Excel data
  };

  // create only records that is requires to update the Table
  const FRPTRANExcel = finalData?.map(({ id, NAME, NAMETKR, ...rest }) => ({
    ...rest,
  }));

  //  Custom headers for the PDF file
  const PDFheaders = [
    { label: "Asset Name", key: "NAMETKR" },
    { label: "Asset ID", key: "HID" },
    { label: "Tran Code", key: "TCODE" },
    { label: "Type", key: "TPEND" },
    { label: "Tran Date", key: "TDATE" },
    { label: "Units", key: "TUNITS", align: "right" },
    { label: "Principal", key: "TPRINCIPAL", align: "right" },
    { label: "Income Cash", key: "TINCOME", align: "right" },
  ];

  // Load data from excel to table
  const fieldnames = [
    "RECDTYPE",
    "AACCT",
    "ADATE",
    "HID",
    "TDATE",
    "TCODE",
    "TSEQ",
    "TPEND",
    "TSTATE",
    "TSTORY",
    "TORIGDATE",
    "TSETTDATE",
    "TUNITS",
    "TPRICE",
    "TPRINCIPAL",
    "TINCOME",
    "TNET",
    "TCARRY",
    "TCOMM",
    "TEXPENSE",
    "TBROKER",
    "TRPTCODE",
    "SHRTGAIN",
    "LONGGAIN",
    "STATEID",
    "UNIQSEQ",
    "TAXIND",
    "TCARRYL",
    "TPOST",
    "TEXCHLOC",
    "USERDEF1",
    "USERCHR1",
    "TEXCHPAY",
    "TPAYCNTRY",
    "USERCHR2",
    "USERCHR3",
    "USERCHR4",
    "USERCHR5",
    "USERCHR6",
    "USERDT1",
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
    mutateAsync: updateTransactionExcel,
    isPending: isUpdatingTransactionExcel,
  } = useMutation({
    mutationFn: async () => {
      // send the updated data to API function
      await FetchUpdateDeleteAPIExcel(
        convertToCSV(finalData),
        `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPTRAN`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return Promise.resolve();
    },
    onMutate: async () => {},
  });

  const handleMRELoad = async () => {
    await updateTransactionExcel();
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
    mantineToolbarAlertBannerProps: isLoadingTransactionsError
      ? { color: "red", children: "Failed to load data. Update your selection criteria." }
      : undefined,
    // onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateTransaction,
    // onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveTransaction,
    enableRowActions: true,

    mantineTableBodyCellProps: { 
      className: "rpt-body",
    },

    renderCreateRowModalContent: ({ table, row, internalEditComponents }) => {
      setIsEditable(true);

      return (
        <Stack>
          <Flex className="mrt-model-title">
            <Title order={4}>Create New Transaction</Title>
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
      size: "70%",
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
            <Title order={4}>Edit Transaction</Title>
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
      size: "70%",
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
            table.setCreatingRow(
              createRow(table, {
                id: uuidv4(),
                AACCT: selectedPortfolio,
                ADATE: new Date(),
                HID: "",
                TDATE: new Date(),
                TCODE: "",
                TSEQ: 0,
                TPEND: "",
                TSTATE: "",
                TSTORY: "",
                TORIGDATE: new Date(),
                TSETTDATE: new Date(),
                TUNITS: 0,
                TPRICE: 0,
                TPRINCIPAL: 0,
                TINCOME: 0,
                TNET: 0,
                TCARRY: 0,
                TCOMM: 0,
                TEXPENSE: 0,
                TBROKER: "",
                TRPTCODE: "",
                SHRTGAIN: 0,
                LONGGAIN: 0,
                STATEID: "",
                UNIQSEQ: "",
                TAXIND: "",
                TCARRYL: 0,
                TEXCHLOC: 0,
                TPOST: new Date(),
                USERDEF1: 0,
                USERCHR1: "",
                USERCHR2: "",
                USERCHR3: "",
                USERCHR4: "",
                USERCHR5: "",
                USERCHR6: "",
                USERDT1: new Date(),
                TPAYCNTRY: "",
                NAME: "",
                NAMETKR: "",
                TEXCHPAY: 0,
                RECDTYPE: "",
              })
            );
          }}
          disabled={finalData?.length > 0 ? false : true}
          className="rpt-action-button"
        >
          Create New Transaction
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
          excelData={FRPTRANExcel}
          reportName="FRPTRAN"
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
      isLoading: isLoadingTransactions,
      isSaving:
        isCreatingTransaction ||
        isUpdatingTransaction ||
        isDeletingTransaction ||
        isUpdatingTransactionExcel,
      showAlertBanner: isLoadingTransactionsError,
      showProgressBars: isFetchingTransactions,
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

const FrpTransactions = () => (
  <ModalsProvider>
    <TransactionsMTable />
  </ModalsProvider>
);

export default FrpTransactions;

const validateRequired = (value: string) => !!value.length;

function validateTransaction(transaction: TransactionsFields) {
  return {
    ADATE: !validateRequired(transaction.ADATE?.toString())
      ? "Date is Required"
      : "",
  };
}
