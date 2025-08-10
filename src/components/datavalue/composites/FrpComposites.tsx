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
  Grid,
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
  useCompositesColumns,
  CompositesFields,
} from "../columnTitles/CompositesColumns.tsx";
import { formatPairDatesYYMD } from "../../hooks/FormatDates.tsx";
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
import { useAccountName, useSectorName } from "../../hooks/useFrpNamesFiltersDDLsApi.js";

type DateRange = string[];

type OutletContextType = {
  selectedPortfolio: string;
  setSelectedPortfolio: (portfolio: string) => void;
  dateRange: DateRange;
};

const CompositesMTable = () => {
  const [finalData, setFinalData] = useState<CompositesFields[]>([]);
  const [excelData, setExcelData] = useState<CompositesFields[]>([]);
  const [isUsingExcelData, setIsUsingExcelData] = useState(false);
  const [isEditAble, setIsEditable] = useState<boolean>(false);

  const client = useClient();
  const delim = process.env.REACT_APP_DELIMITER;
  const { selectedPortfolio, setSelectedPortfolio } =
    useOutletContext<OutletContextType>();
  const { data: accountNameData } = useAccountName(selectedPortfolio, client); // Fetch account name data
  const compositeUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPAGG&filters=ACCT(${selectedPortfolio})`;

  // Unified data fetch using React Query
  const {
    data: fetchedComposites = [],
    isError: isLoadingCompositesError,
    isFetching: isFetchingComposites,
    isLoading: isLoadingComposites,
  } = useQuery<CompositesFields[]>({
    queryKey: ["composites", selectedPortfolio, client],
    queryFn: async () => {
      const data = await FetchAPI(compositeUri);

      return data.map((row) => {
        // Account name matching
        const matchedAccount = accountNameData?.find(
          (account) => account.ACCT === row.ACCT
        );
        const matchedAccountName =
          matchedAccount?.NAME === undefined
            ? "Name Not Defined"
            : matchedAccount?.NAME;
        return {
          ...row,
          id: row.id || uuidv4(),
          NAME: matchedAccountName, // add NAME field conditionally
        };
      });
      /*  return response.map((row) => ({
        ...row,
        id: row.id || uuidv4(), // Assign UUID only if the row doesn't already have one
      })); */ // Ensure the response is an array
    },
    enabled: !!selectedPortfolio && !!client && !!accountNameData,
    refetchOnWindowFocus: false,
  });

  const [processedComposites, setProcessedComposites] = React.useState<
    CompositesFields[]
  >([]);

  React.useEffect(() => {
    console.log("Fetched Composites:", fetchedComposites);
    if (Array.isArray(fetchedComposites) && fetchedComposites.length > 0) {
      setProcessedComposites(
        fetchedComposites?.map((row) => ({
          ...row,
          id: row.id || uuidv4(), // Assign UUID only if the row doesn't already have one
        }))
      );
    } else {
      console.error("fetchedComposites is not an array:", fetchedComposites);
    }
  }, [fetchedComposites]);

  const keyFields = ["ACCT", "AGG"];
  const nonKeyFields = [
    "DTOVER01",
    "DTOVER02",
    "DTOVER03",
    "DTOVER04",
    "DTOVER05",
    "DTOVER06",
    "DTOVER07",
    "DTOVER08",
    "DTOVER09",
    "DTOVER10",
    "DTOVER11",
    "DTOVER12",
    "DTOVER13",
    "DTOVER14",
    "DTOVER15",
    "DTOVER16",
    "DTOVER17",
    "DTOVER18",
    "DTOVER19",
    "DTOVER20",
    "DTOVER21",
    "DTOVER22",
    "DTOVER23",
    "DTOVER24",
    "DTOVER25",
    "ENTRRSN01",
    "EXITRSN01",
    "ENTRRSN02",
    "EXITRSN02",
    "ENTRRSN03",
    "EXITRSN03",
    "ENTRRSN04",
    "EXITRSN04",
    "ENTRRSN05",
    "EXITRSN05",
    "ENTRRSN06",
    "EXITRSN06",
    "ENTRRSN07",
    "EXITRSN07",
    "ENTRRSN08",
    "EXITRSN08",
    "ENTRRSN09",
    "EXITRSN09",
    "ENTRRSN10",
    "EXITRSN10",
    "ENTRRSN11",
    "EXITRSN11",
    "ENTRRSN12",
    "EXITRSN12",
    "ENTRRSN13",
    "EXITRSN13",
    "ENTRRSN14",
    "EXITRSN14",
    "ENTRRSN15",
    "EXITRSN15",
    "ENTRRSN16",
    "EXITRSN16",
    "ENTRRSN17",
    "EXITRSN17",
    "ENTRRSN18",
    "EXITRSN18",
    "ENTRRSN19",
    "EXITRSN19",
    "ENTRRSN20",
    "EXITRSN20",
    "ENTRRSN21",
    "EXITRSN21",
    "ENTRRSN22",
    "EXITRSN22",
    "ENTRRSN23",
    "EXITRSN23",
    "ENTRRSN24",
    "EXITRSN24",
    "ENTRRSN25",
    "EXITRSN25",
  ];
  const numericFields = []; // Define numeric fields

  React.useEffect(() => {
    if (isUsingExcelData && excelData.length > 0) {
      setFinalData(
        compareData(
          excelData,
          processedComposites,
          keyFields,
          nonKeyFields,
          numericFields
        )
      );
      setIsUsingExcelData(false); // Switch back to using fetched data
      setSelectedPortfolio(excelData[0]?.ACCT);
    } else if (processedComposites && processedComposites.length > 0) {
      setFinalData(processedComposites);
    } else if (finalData.length !== 0) {
      setFinalData([]);
    }
  }, [excelData, processedComposites]);

  const portfolioName = finalData[0]?.NAME + ` (${finalData[0]?.ACCT})`; // used for PDF output

  const columns = useCompositesColumns(finalData, setFinalData, isEditAble); // Get Column information

  const queryClient = useQueryClient();
  // Mutations
  const { mutateAsync: createComposite, isPending: isCreatingComposite } =
    useMutation({
      mutationFn: async (createComposite: CompositesFields) => {
        // send the updated data to API function
        const editDataInCSV = `A${delim}${createComposite.ACCT}${delim}${createComposite.AGG}
        ${delim}${createComposite.DTOVER01}${delim}${createComposite.DTOVER02}${delim}${createComposite.DTOVER03}${delim}${createComposite.DTOVER04}${delim}${createComposite.DTOVER05}
        ${delim}${createComposite.DTOVER06}${delim}${createComposite.DTOVER07}${delim}${createComposite.DTOVER08}${delim}${createComposite.DTOVER09}${delim}${createComposite.DTOVER10}
        ${delim}${createComposite.DTOVER11}${delim}${createComposite.DTOVER12}${delim}${createComposite.DTOVER13}${delim}${createComposite.DTOVER14}${delim}${createComposite.DTOVER15}
        ${delim}${createComposite.DTOVER16}${delim}${createComposite.DTOVER17}${delim}${createComposite.DTOVER18}${delim}${createComposite.DTOVER19}${delim}${createComposite.DTOVER20}
        ${delim}${createComposite.DTOVER21}${delim}${createComposite.DTOVER22}${delim}${createComposite.DTOVER23}${delim}${createComposite.DTOVER24}${delim}${createComposite.DTOVER25}
        ${delim}${createComposite.ENTRRSN01}${delim}${createComposite.EXITRSN01}${delim}${createComposite.ENTRRSN02}${delim}${createComposite.EXITRSN02}${delim}${createComposite.ENTRRSN03}
        ${delim}${createComposite.EXITRSN03}${delim}${createComposite.ENTRRSN04}${delim}${createComposite.EXITRSN04}${delim}${createComposite.ENTRRSN05}${delim}${createComposite.EXITRSN05}
        ${delim}${createComposite.ENTRRSN06}${delim}${createComposite.EXITRSN06}${delim}${createComposite.ENTRRSN07}${delim}${createComposite.EXITRSN07}${delim}${createComposite.ENTRRSN08}
        ${delim}${createComposite.ENTRRSN09}${delim}${createComposite.EXITRSN09}${delim}${createComposite.ENTRRSN10}${delim}${createComposite.EXITRSN10}${delim}${createComposite.ENTRRSN11}
        ${delim}${createComposite.EXITRSN11}${delim}${createComposite.ENTRRSN12}${delim}${createComposite.EXITRSN12}${delim}${createComposite.ENTRRSN13}${delim}${createComposite.EXITRSN13}
        ${delim}${createComposite.ENTRRSN14}${delim}${createComposite.EXITRSN14}${delim}${createComposite.ENTRRSN15}${delim}${createComposite.EXITRSN15}
        ${delim}${createComposite.ENTRRSN16}${delim}${createComposite.EXITRSN16}${delim}${createComposite.ENTRRSN17}${delim}${createComposite.EXITRSN17}${delim}${createComposite.ENTRRSN18}
        ${delim}${createComposite.EXITRSN18}${delim}${createComposite.ENTRRSN19}${delim}${createComposite.EXITRSN19}${delim}${createComposite.ENTRRSN20}
        ${delim}${createComposite.EXITRSN20}${delim}${createComposite.ENTRRSN21}${delim}${createComposite.EXITRSN21}${delim}${createComposite.ENTRRSN22}
        ${delim}${createComposite.EXITRSN22}${delim}${createComposite.ENTRRSN23}${delim}${createComposite.EXITRSN23}${delim}${createComposite.ENTRRSN24}
        ${delim}${createComposite.EXITRSN24}${delim}${createComposite.ENTRRSN25}${delim}${createComposite.EXITRSN25}
      `;
        await FetchUpdateDeleteAPI(
          editDataInCSV
            .replace(/[\r\n]+/g, "")
            .replace(/\s*\|\s*/g, "|")
            .replace(/\|null\|/g, "||"),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPAGG`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return createComposite;
      },
      onMutate: async (newComposite: CompositesFields) => {
        await queryClient.cancelQueries({
          queryKey: ["composites", selectedPortfolio, client],
        });
        const previousDemographics = queryClient.getQueryData<
          CompositesFields[]
        >(["composites"]);
        queryClient.setQueryData(
          ["composites", selectedPortfolio, client],
          (old: CompositesFields[] | undefined) => [
            ...(old ?? []),
            {
              ...newComposite,
              id: uuidv4(),
            },
          ]
        );
        return { previousDemographics };
      },
    });

  const { mutateAsync: updateComposite, isPending: isUpdatingComposite } =
    useMutation({
      mutationFn: async (updatedComposite: CompositesFields) => {
        // send the updated data to API function
        const editDataInCSV = `C${delim}${updatedComposite.ACCT}${delim}${
          updatedComposite.AGG
        }
    ${delim}${updatedComposite.DTOVER01 ?? ""}${delim}${
          updatedComposite.DTOVER02 ?? ""
        }${delim}${updatedComposite.DTOVER03 ?? ""}${delim}${
          updatedComposite.DTOVER04 ?? ""
        }${delim}${updatedComposite.DTOVER05 ?? ""}
    ${delim}${updatedComposite.DTOVER06 ?? ""}${delim}${
          updatedComposite.DTOVER07 ?? ""
        }${delim}${updatedComposite.DTOVER08 ?? ""}${delim}${
          updatedComposite.DTOVER09 ?? ""
        }${delim}${updatedComposite.DTOVER10 ?? ""}
    ${delim}${updatedComposite.DTOVER11 ?? ""}${delim}${
          updatedComposite.DTOVER12 ?? ""
        }${delim}${updatedComposite.DTOVER13 ?? ""}${delim}${
          updatedComposite.DTOVER14 ?? ""
        }${delim}${updatedComposite.DTOVER15 ?? ""}
    ${delim}${updatedComposite.DTOVER16 ?? ""}${delim}${
          updatedComposite.DTOVER17 ?? ""
        }${delim}${updatedComposite.DTOVER18 ?? ""}${delim}${
          updatedComposite.DTOVER19 ?? ""
        }${delim}${updatedComposite.DTOVER20 ?? ""}
    ${delim}${updatedComposite.DTOVER21 ?? ""}${delim}${
          updatedComposite.DTOVER22 ?? ""
        }${delim}${updatedComposite.DTOVER23 ?? ""}${delim}${
          updatedComposite.DTOVER24 ?? ""
        }${delim}${updatedComposite.DTOVER25 ?? ""}
    ${delim}${updatedComposite.ENTRRSN01}${delim}${
          updatedComposite.EXITRSN01
        }${delim}${updatedComposite.ENTRRSN02}${delim}${
          updatedComposite.EXITRSN02
        }${delim}${updatedComposite.ENTRRSN03}
    ${delim}${updatedComposite.EXITRSN03}${delim}${
          updatedComposite.ENTRRSN04
        }${delim}${updatedComposite.EXITRSN04}${delim}${
          updatedComposite.ENTRRSN05
        }${delim}${updatedComposite.EXITRSN05}
    ${delim}${updatedComposite.ENTRRSN06}${delim}${
          updatedComposite.EXITRSN06
        }${delim}${updatedComposite.ENTRRSN07}${delim}${
          updatedComposite.EXITRSN07
        }${delim}${updatedComposite.ENTRRSN08}
    ${delim}${updatedComposite.ENTRRSN09}${delim}${
          updatedComposite.EXITRSN09
        }${delim}${updatedComposite.ENTRRSN10}${delim}${
          updatedComposite.EXITRSN10
        }${delim}${updatedComposite.ENTRRSN11}
    ${delim}${updatedComposite.EXITRSN11}${delim}${
          updatedComposite.ENTRRSN12
        }${delim}${updatedComposite.EXITRSN12}${delim}${
          updatedComposite.ENTRRSN13
        }${delim}${updatedComposite.EXITRSN13}
    ${delim}${updatedComposite.ENTRRSN14}${delim}${
          updatedComposite.EXITRSN14
        }${delim}${updatedComposite.ENTRRSN15}${delim}${
          updatedComposite.EXITRSN15
        }
    ${delim}${updatedComposite.ENTRRSN16}${delim}${
          updatedComposite.EXITRSN16
        }${delim}${updatedComposite.ENTRRSN17}${delim}${
          updatedComposite.EXITRSN17
        }${delim}${updatedComposite.ENTRRSN18}
    ${delim}${updatedComposite.EXITRSN18}${delim}${
          updatedComposite.ENTRRSN19
        }${delim}${updatedComposite.EXITRSN19}${delim}${
          updatedComposite.ENTRRSN20
        }
    ${delim}${updatedComposite.EXITRSN20}${delim}${
          updatedComposite.ENTRRSN21
        }${delim}${updatedComposite.EXITRSN21}${delim}${
          updatedComposite.ENTRRSN22
        }
    ${delim}${updatedComposite.EXITRSN22}${delim}${
          updatedComposite.ENTRRSN23
        }${delim}${updatedComposite.EXITRSN23}${delim}${
          updatedComposite.ENTRRSN24
        }
    ${delim}${updatedComposite.EXITRSN24}${delim}${
          updatedComposite.ENTRRSN25
        }${delim}${updatedComposite.EXITRSN25}
  `;
        await FetchUpdateDeleteAPI(
          editDataInCSV
            .replace(/[\r\n]+/g, "")
            .replace(/\s*\|\s*/g, "|")
            .replace(/\|null\|/g, "||"),
          `IBIF_ex=frapipro_TableUpdate&CLIENT=${client}&theTable=FRPAGG`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return updatedComposite;
      },

      onMutate: async (variables: CompositesFields) => {
        const { id: compositeId } = variables; // Extract compositeId from CompositesFields
        await queryClient.cancelQueries({
          queryKey: ["composites", selectedPortfolio, client],
        });

        const previousComposites = queryClient.getQueryData<CompositesFields[]>(
          ["composites", selectedPortfolio, client]
        );

        // Optimistically update the cache by removing the deleted row
        queryClient.setQueryData(
          ["composites", selectedPortfolio, client],
          (old: CompositesFields[] = []) =>
            old.filter((h: CompositesFields) => h.id !== compositeId)
        );

        return { previousComposites };
      },
    });

  const { mutateAsync: deleteComposite, isPending: isDeletingComposite } =
    useMutation({
      mutationFn: async ({
        compositesId,
        ACCT,
        AGG,
      }: {
        compositesId: string;
        ACCT: string;
        AGG: string;
      }) => {
        // send the updated data to API function
        const editDataInCSV = `D${delim}${ACCT}${delim}${AGG}`;
        await FetchUpdateDeleteAPI(
          editDataInCSV
            .replace(/[\r\n]+/g, "")
            .replace(/\s*\|\s*/g, "|")
            .replace(/\|null\|/g, "||"),
          `IBIF_ex=frapipro_TableUpdate&CLIENT=${client}&theTable=FRPAGG`
        ); // delete the PRICE
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated API delay
        return compositesId;
      },
      onMutate: async ({ compositesId }: { compositesId: string }) => {
        await queryClient.cancelQueries({
          queryKey: ["composites", selectedPortfolio, client],
        });

        const previousComposites = queryClient.getQueryData<CompositesFields[]>(
          ["composites", selectedPortfolio, client]
        );

        // Optimistically update the cache by removing the deleted row
        queryClient.setQueryData(
          ["composites", selectedPortfolio, client],
          (old: CompositesFields[] = []) =>
            old.filter((h: CompositesFields) => h.id !== compositesId)
        );

        return { previousComposites };
      },
      onError: (err, compositesId, context) => {
        if (context?.previousComposites) {
          queryClient.setQueryData(
            ["composites", selectedPortfolio, client],
            context.previousComposites
          );
        }
      },
    });

  const handleCreateComposite: MRT_TableOptions<CompositesFields>["onCreatingRowSave"] =
    async ({ values, exitCreatingMode }) => {
      // Format DATES as expected date before saving
      const formattedValues = {
        ...values,
        DTOVER01: formatPairDatesYYMD(values.DTOVER01),
        DTOVER02: formatPairDatesYYMD(values.DTOVER02),
        DTOVER03: formatPairDatesYYMD(values.DTOVER03),
        DTOVER04: formatPairDatesYYMD(values.DTOVER04),
        DTOVER05: formatPairDatesYYMD(values.DTOVER05),
        DTOVER06: formatPairDatesYYMD(values.DTOVER06),
        DTOVER07: formatPairDatesYYMD(values.DTOVER07),
        DTOVER08: formatPairDatesYYMD(values.DTOVER08),
        DTOVER09: formatPairDatesYYMD(values.DTOVER09),
        DTOVER10: formatPairDatesYYMD(values.DTOVER10),
        DTOVER11: formatPairDatesYYMD(values.DTOVER11),
        DTOVER12: formatPairDatesYYMD(values.DTOVER12),
        DTOVER13: formatPairDatesYYMD(values.DTOVER13),
        DTOVER14: formatPairDatesYYMD(values.DTOVER14),
        DTOVER15: formatPairDatesYYMD(values.DTOVER15),
        DTOVER16: formatPairDatesYYMD(values.DTOVER16),
        DTOVER17: formatPairDatesYYMD(values.DTOVER17),
        DTOVER18: formatPairDatesYYMD(values.DTOVER18),
        DTOVER19: formatPairDatesYYMD(values.DTOVER19),
        DTOVER20: formatPairDatesYYMD(values.DTOVER20),
        DTOVER21: formatPairDatesYYMD(values.DTOVER21),
        DTOVER22: formatPairDatesYYMD(values.DTOVER22),
        DTOVER23: formatPairDatesYYMD(values.DTOVER23),
        DTOVER24: formatPairDatesYYMD(values.DTOVER24),
        DTOVER25: formatPairDatesYYMD(values.DTOVER25),
      };

      // Validate the updated values
      const errors = validateComposite(values);
      if (Object.values(errors).some(Boolean)) {
        return; // If there are validation errors, stop the save operation
      }

      // Save the updated values instead of row.original
      await createComposite(formattedValues); // Use values instead of row.original
      exitCreatingMode();
      table.setEditingRow(null); // Reset the editing state
    };

  const handleSaveComposite: MRT_TableOptions<CompositesFields>["onEditingRowSave"] =
    async ({ values, table }) => {
      // Format DATES as expected date before saving
      const formattedValues = {
        ...values,
        DTOVER01: values.DTOVER01,
        DTOVER02: formatPairDatesYYMD(values.DTOVER02),
        DTOVER03: formatPairDatesYYMD(values.DTOVER03),
        DTOVER04: formatPairDatesYYMD(values.DTOVER04),
        DTOVER05: formatPairDatesYYMD(values.DTOVER05),
        DTOVER06: formatPairDatesYYMD(values.DTOVER06),
        DTOVER07: formatPairDatesYYMD(values.DTOVER07),
        DTOVER08: formatPairDatesYYMD(values.DTOVER08),
        DTOVER09: formatPairDatesYYMD(values.DTOVER09),
        DTOVER10: formatPairDatesYYMD(values.DTOVER10),
        DTOVER11: formatPairDatesYYMD(values.DTOVER11),
        DTOVER12: formatPairDatesYYMD(values.DTOVER12),
        DTOVER13: formatPairDatesYYMD(values.DTOVER13),
        DTOVER14: formatPairDatesYYMD(values.DTOVER14),
        DTOVER15: formatPairDatesYYMD(values.DTOVER15),
        DTOVER16: formatPairDatesYYMD(values.DTOVER16),
        DTOVER17: formatPairDatesYYMD(values.DTOVER17),
        DTOVER18: formatPairDatesYYMD(values.DTOVER18),
        DTOVER19: formatPairDatesYYMD(values.DTOVER19),
        DTOVER20: formatPairDatesYYMD(values.DTOVER20),
        DTOVER21: formatPairDatesYYMD(values.DTOVER21),
        DTOVER22: formatPairDatesYYMD(values.DTOVER22),
        DTOVER23: formatPairDatesYYMD(values.DTOVER23),
        DTOVER24: formatPairDatesYYMD(values.DTOVER24),
        DTOVER25: formatPairDatesYYMD(values.DTOVER25),
      };

      // Validate the updated values
      const errors = validateComposite(values);
      if (Object.values(errors).some(Boolean)) {
        return; // If there are validation errors, stop the save operation
      }

      // Save the updated values instead of row.original
      await updateComposite(formattedValues); // Use values instead of row.original
      // Reset the editing state
      table.setEditingRow(null);
    };

  const openDeleteConfirmModal = (row: MRT_Row<CompositesFields>) => {
    modals.openConfirmModal({
      title: "Delete composites?",
      children: (
        <Text>
          Delete {row.original.ACCT} ({row.original.AGG})?
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () =>
        deleteComposite({
          compositesId: row.original.id,
          ACCT: row.original.ACCT,
          AGG: row.original.AGG,
        }),
    });
  };

  const csvConfig = mkConfig({
    fieldSeparator: ",",
    decimalSeparator: ".",
    useKeysAsHeaders: true,
  });

  const handleExportRows = (rows: MRT_Row<CompositesFields>[]) => {
    const rowData = rows.map((row) => ({
      ...row.original,
      ICPDATED: row.original.DTOVER01?.toString(), // Convert ICPDATED to string
    }));
    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  const handleExcelDataUpdate = (newData: CompositesFields[]) => {
    setExcelData(newData); // Update excelData with the uploaded file data
    setIsUsingExcelData(true); // Switch to using Excel data
  };

  const FRPAGGExcel = finalData?.map((frpagg) => ({
    ACCT: frpagg.ACCT,
    AGG: frpagg.AGG,
    DTOVER01: frpagg.DTOVER01,
    DTOVER02: frpagg.DTOVER02,
    DTOVER03: frpagg.DTOVER03,
    DTOVER04: frpagg.DTOVER04,
    DTOVER05: frpagg.DTOVER05,
    DTOVER06: frpagg.DTOVER06,
    DTOVER07: frpagg.DTOVER07,
    DTOVER08: frpagg.DTOVER08,
    DTOVER09: frpagg.DTOVER09,
    DTOVER10: frpagg.DTOVER10,
    DTOVER11: frpagg.DTOVER11,
    DTOVER12: frpagg.DTOVER12,
    DTOVER13: frpagg.DTOVER13,
    DTOVER14: frpagg.DTOVER14,
    DTOVER15: frpagg.DTOVER15,
    DTOVER16: frpagg.DTOVER16,
    DTOVER17: frpagg.DTOVER17,
    DTOVER18: frpagg.DTOVER18,
    DTOVER19: frpagg.DTOVER19,
    DTOVER20: frpagg.DTOVER20,
    DTOVER21: frpagg.DTOVER21,
    DTOVER22: frpagg.DTOVER22,
    DTOVER23: frpagg.DTOVER23,
    DTOVER24: frpagg.DTOVER24,
    DTOVER25: frpagg.DTOVER25,
    ENTRRSN01: frpagg.ENTRRSN01,
    EXITRSN01: frpagg.EXITRSN01,
    ENTRRSN02: frpagg.ENTRRSN02,
    EXITRSN02: frpagg.EXITRSN02,
    ENTRRSN03: frpagg.ENTRRSN03,
    EXITRSN03: frpagg.EXITRSN03,
    ENTRRSN04: frpagg.ENTRRSN04,
    EXITRSN04: frpagg.EXITRSN04,
    ENTRRSN05: frpagg.ENTRRSN05,
    EXITRSN05: frpagg.EXITRSN05,
    ENTRRSN06: frpagg.ENTRRSN06,
    EXITRSN06: frpagg.EXITRSN06,
    ENTRRSN07: frpagg.ENTRRSN07,
    EXITRSN07: frpagg.EXITRSN07,
    ENTRRSN08: frpagg.ENTRRSN08,
    EXITRSN08: frpagg.EXITRSN08,
    ENTRRSN09: frpagg.ENTRRSN09,
    EXITRSN09: frpagg.EXITRSN09,
    ENTRRSN10: frpagg.ENTRRSN10,
    EXITRSN10: frpagg.EXITRSN10,
    ENTRRSN11: frpagg.ENTRRSN11,
    EXITRSN11: frpagg.EXITRSN11,
    ENTRRSN12: frpagg.ENTRRSN12,
    EXITRSN12: frpagg.EXITRSN12,
    ENTRRSN13: frpagg.ENTRRSN13,
    EXITRSN13: frpagg.EXITRSN13,
    ENTRRSN14: frpagg.ENTRRSN14,
    EXITRSN14: frpagg.EXITRSN14,
    ENTRRSN15: frpagg.ENTRRSN15,
    EXITRSN15: frpagg.EXITRSN15,
    ENTRRSN16: frpagg.ENTRRSN16,
    EXITRSN16: frpagg.EXITRSN16,
    ENTRRSN17: frpagg.ENTRRSN17,
    EXITRSN17: frpagg.EXITRSN17,
    ENTRRSN18: frpagg.ENTRRSN18,
    EXITRSN18: frpagg.EXITRSN18,
    ENTRRSN19: frpagg.ENTRRSN19,
    EXITRSN19: frpagg.EXITRSN19,
    ENTRRSN20: frpagg.ENTRRSN20,
    EXITRSN20: frpagg.EXITRSN20,
    ENTRRSN21: frpagg.ENTRRSN21,
    EXITRSN21: frpagg.EXITRSN21,
    ENTRRSN22: frpagg.ENTRRSN22,
    EXITRSN22: frpagg.EXITRSN22,
    ENTRRSN23: frpagg.ENTRRSN23,
    EXITRSN23: frpagg.EXITRSN23,
    ENTRRSN24: frpagg.ENTRRSN24,
    EXITRSN24: frpagg.EXITRSN24,
    ENTRRSN25: frpagg.ENTRRSN25,
    EXITRSN25: frpagg.EXITRSN25,
    RECDTYPE: frpagg.RECDTYPE,
  }));

  const PDFheaders = [
    { label: "Portfolio ID", key: "ACCT" },
    { label: "Portfolio Name", key: "NAME" },
    { label: "Aggregate ID", key: "AGG" },
    { label: "DTOVER01", key: "DTOVER01" },
    { label: "DTOVER02", key: "DTOVER02" },
    { label: "DTOVER03", key: "DTOVER03" },
    { label: "DTOVER04", key: "DTOVER04" },
    { label: "DTOVER05", key: "DTOVER05" },
    { label: "DTOVER06", key: "DTOVER06" },
  ];

  // Load data from excel to table
  const fieldnames = [
    "RECDTYPE",
    "ACCT",
    "AGG",
    "DTOVER01",
    "DTOVER02",
    "DTOVER03",
    "DTOVER04",
    "DTOVER05",
    "DTOVER06",
    "DTOVER07",
    "DTOVER08",
    "DTOVER09",
    "DTOVER10",
    "DTOVER11",
    "DTOVER12",
    "DTOVER13",
    "DTOVER14",
    "DTOVER15",
    "DTOVER16",
    "DTOVER17",
    "DTOVER18",
    "DTOVER19",
    "DTOVER20",
    "DTOVER21",
    "DTOVER22",
    "DTOVER23",
    "DTOVER24",
    "DTOVER25",
    "ENTRRSN01",
    "EXITRSN01",
    "ENTRRSN02",
    "EXITRSN02",
    "ENTRRSN03",
    "EXITRSN03",
    "ENTRRSN04",
    "EXITRSN04",
    "ENTRRSN05",
    "EXITRSN05",
    "ENTRRSN06",
    "EXITRSN06",
    "ENTRRSN07",
    "EXITRSN07",
    "ENTRRSN08",
    "EXITRSN08",
    "ENTRRSN09",
    "EXITRSN09",
    "ENTRRSN10",
    "EXITRSN10",
    "ENTRRSN11",
    "EXITRSN11",
    "ENTRRSN12",
    "EXITRSN12",
    "ENTRRSN13",
    "EXITRSN13",
    "ENTRRSN14",
    "EXITRSN14",
    "ENTRRSN15",
    "EXITRSN15",
    "ENTRRSN16",
    "EXITRSN16",
    "ENTRRSN17",
    "EXITRSN17",
    "ENTRRSN18",
    "EXITRSN18",
    "ENTRRSN19",
    "EXITRSN19",
    "ENTRRSN20",
    "EXITRSN20",
    "ENTRRSN21",
    "EXITRSN21",
    "ENTRRSN22",
    "EXITRSN22",
    "ENTRRSN23",
    "EXITRSN23",
    "ENTRRSN24",
    "EXITRSN24",
    "ENTRRSN25",
    "EXITRSN25",
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
    mutateAsync: updateCompositesExcel,
    isPending: isUpdatingTransactionExcel,
  } = useMutation({
    mutationFn: async () => {
      // send the updated data to API function
      await FetchUpdateDeleteAPIExcel(
        convertToCSV(finalData),
        `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPAGG`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return Promise.resolve();
    },
    onMutate: async () => {},
  });

  const handleMRELoad = async () => {
    await updateCompositesExcel();
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
    mantineToolbarAlertBannerProps: isLoadingCompositesError
      ? {
          color: "red",
          children: "Failed to load data. Update your selection criteria.",
        }
      : undefined,
    onCreatingRowSave: handleCreateComposite,
    onEditingRowSave: handleSaveComposite,
    enableRowActions: true,
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
          className="rpt-action-button"
          leftIcon={<IconPlus />}
          onClick={() => {
            table.setCreatingRow(true);
          }}
          disabled={finalData?.length > 0 ? false : true}
        >
          Create New composites
        </Button>
        <Button
          variant="subtle"
          disabled={
            !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
          }
          onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
          leftIcon={<EXPORT_SVG />}
        >
          Export Selected Rows
        </Button>
        <Import onDataUpdate={handleExcelDataUpdate} />
        <Export
          data={finalData}
          excelData={FRPAGGExcel}
          reportName="FRPAGG"
          PDFheaders={PDFheaders}
          portfolioName={portfolioName}
          dateRange=""
        />
        <Button
          variant="subtle"
          className={
            excelData?.length > 0 && finalData.length > 0
              ? "rpt-action-button"
              : ""
          }
          disabled={
            excelData?.length > 0 && finalData.length > 0 ? false : true
          }
          leftIcon={<IconRefresh size={20} />}
          onClick={handleMRELoad}
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

    mantineTableBodyCellProps: {
      className: "rpt-body",
    },

    renderCreateRowModalContent: ({ table, row, internalEditComponents }) => {
      setIsEditable(true);
      return (
        <Stack>
          <Flex className="mrt-model-title">
            <Title order={4} color="blue">
              Create New Composite
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
      size: "80%",
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
            <Title order={4} color="blue">
              Edit Composites
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
      size: "80%",
      yOffset: "2vh",
      xOffset: 10,
      transitionProps: {
        transition: "fade",
        duration: 600,
        timingFunction: "linear",
      },
    },

    state: {
      isLoading: isLoadingComposites,
      isSaving:
        isCreatingComposite ||
        isUpdatingComposite ||
        isDeletingComposite ||
        isUpdatingTransactionExcel,
      showAlertBanner: isLoadingCompositesError,
      showProgressBars: isFetchingComposites,
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

const FrpComposites = () => (
  <ModalsProvider>
    <CompositesMTable />
  </ModalsProvider>
);

export default FrpComposites;

const validateRequired = (value: string) => !!value.length;

function validateComposite(composites: CompositesFields) {
  return {
    ACCT: !validateRequired(composites.ACCT?.toString())
      ? "Account is Required"
      : "",
  };
}
