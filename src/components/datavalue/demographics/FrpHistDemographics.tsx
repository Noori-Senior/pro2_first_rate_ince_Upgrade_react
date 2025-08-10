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
import { useHistDemographicsColumns, HistDemographicsFields} from "../columnTitles/HistDemographicsColumns.tsx";
import { formatDateYYMD } from "../../hooks/FormatDates.tsx";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs
import { mkConfig, generateCsv, download } from "export-to-csv"; //or use your library of choice here
import { getHistDemographicsDefaultValue } from "../columnTitles/HistDemographicsDDL.tsx";

import { compareData } from "../../report-components/compareData.js";
import { Import } from "../../report-components/Import.js";
import { Export } from "../../report-components/Export.js";
import { PredictNumColumn } from "../../../aiAgents/PredictNumColumn.js";
import { formatToDateYYM, formatFromDateYYM } from "../../hooks/FormatDates.tsx";

type DateRange = string[];

type OutletContextType = {
  selectedPortfolio: string;
  setSelectedPortfolio: (portfolio: string) => void;
  dateRange: DateRange;
};

const HistDemographicsMTable = () => {
  const [finalData, setFinalData] = useState<HistDemographicsFields[]>([]);
  const [excelData, setExcelData] = useState<HistDemographicsFields[]>([]);
  const [isUsingExcelData, setIsUsingExcelData] = useState(false);

  const [isEditAble, setIsEditable] = useState<boolean>(false);

  const client = useClient();
  const delim = process.env.REACT_APP_DELIMITER;
  const { selectedPortfolio, setSelectedPortfolio } =  useOutletContext<OutletContextType>();
  const { dateRange } = useOutletContext<OutletContextType>();
  const fromDate = formatFromDateYYM(dateRange as [string, string]) ;
  const toDate = formatToDateYYM(dateRange as [string, string]) ;

  const ldemographicUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPAIRD&filters=ACCT(${selectedPortfolio});ADATE(GT:${fromDate}:AND:ADATE:LE:${toDate})`;

  // Unified data fetch using React Query
  const {
    data: fetchedHistDemographics = [],
    isError: isLoadingHistDemographicsError,
    isFetching: isFetchingHistDemographics,
    isLoading: isLoadingHistDemographics,
  } = useQuery<HistDemographicsFields[]>({
    queryKey: ["hist-demographics", selectedPortfolio, dateRange, client],
    queryFn: async () => {
      const data = await FetchAPI(ldemographicUri);
      return data.map((row) => ({
        ...row,
        id: row.id || uuidv4(), // Add UUID here
      }));
    },
    enabled: !!selectedPortfolio && !!dateRange && !!client,
    refetchOnWindowFocus: false,
  });

  // Determine which data to display
  // const data = isUsingExcelData ? excelData : fetchedHistDemographics;
  // Update finalData based on excelData or data
  const keyFields = ["ACCT", "ADATED"];
  const nonKeyFields = [ "ADATE", "FYE", "BNK", "NAME", "FREQX", "SECPKG", "INDXPKG", "REPTPKG", "SECTPKG", "ADM", "OFFN", "OBJ", "PWR", "TYP", "STATUS", "USERDEF", "EQINDX",
    "FXINDX", "CEINDX", "WTDINDX", "EQPOL", "FXPOL", "MVI_ACC", "ICPDATED", "STATEID", "ACTIVE", "USERDEF2", "USERDEF3", "USERDEF4", "RCFREQ", "IPPICP", "UDA101", "UDA102", "UDA103",
    "UDA104", "UDA105", "UDA106", "UDA107", "UDA108", "UDA109", "UDA110", "UDA111", "UDA112", "UDA113", "UDA114", "UDA115", "UDDATE1", "UDDATE2", "UDDATE3", "UDDATE4", "UDDATE5",
    "UDDATE6", "UDDATE7", "UDDATE8", "UDDATE9", "UDDATE10", "UDDATE11", "UDDATE12", "UDDATE13", "UDDATE14", "UDDATE15", "RPTDATE", "GLOBALFL", "AGGTYP", "AGGOWNER", "TOLERPKG",
    "PCOLOR", "TXFDONLY", "RULEPKG", "ACECDATE", "AGGFEATR", "CMPRPIND", "MR_IND", "MRRPTFRQ", "MRACTVRN", "MRLRPDT", "MRLPRCDT", "MRLFRPDT", "MRLFRRDT", "RPTINGNAME", "ICPDATED_ALT",
    "SMARPLEV", "SMASRCE", "SMASORT", "SMACPYFR", "SMACPYTO", "APXDATE" ];
  const numericFields = [ "UDN1", "UDN2", "UDN3", "UDN4", "UDN5", "UDN6", "UDN7", "UDN8", "UDN9", "UDN10", "UDN11", "UDN12", "UDN13", "UDN14", "UDN15", "TXRATE1", "TXRATE2", "TXRATE3",
    "TXRATE4", "TXRATE5", "TXRATE6", "RCTOL", "PF_TIER" ]; // Define numeric fields

  React.useEffect(() => {
    if (isUsingExcelData && excelData.length > 0) {
      setFinalData(
        compareData(
          excelData,
          fetchedHistDemographics,
          keyFields,
          nonKeyFields,
          numericFields
        )
      );
      setIsUsingExcelData(false); // Switch back to using fetched data
      setSelectedPortfolio(excelData[0]?.ACCT);
    } else if (fetchedHistDemographics && fetchedHistDemographics.length > 0) {
      setFinalData(fetchedHistDemographics);
    } else if (finalData.length !== 0) {
      // Prevent unnecessary updates
      setFinalData([]);
    }
  }, [excelData, fetchedHistDemographics]); // Removed isUsingExcelData from dependencies

  const portfolioName = finalData[0]?.NAME + ` (${finalData[0]?.ACCT})`; // used for PDF output

  const columns = useHistDemographicsColumns( finalData,  setFinalData, client, isEditAble ); // Get Column information

  const queryClient = useQueryClient();
  // Mutations
  const {
    mutateAsync: createHistDemographic,
    isPending: isCreatingDemographic,
  } = useMutation({
    mutationFn: async (createdDemographic: HistDemographicsFields) => {
      // send the updated data to API function
      const editDataInCSV = `A${delim}${createdDemographic.ACCT}${
        createdDemographic.ADATED
      }${createdDemographic.ADATE}${delim}${createdDemographic.FYE}${delim}${
        createdDemographic.BNK
      }${delim}${createdDemographic.NAME}
        ${delim}${createdDemographic.FREQX}${delim}${
        createdDemographic.SECPKG
      }${delim}${createdDemographic.INDXPKG}${delim}${
        createdDemographic.REPTPKG
      }${delim}${createdDemographic.SECTPKG}
        ${delim}${createdDemographic.ADM}${delim}${
        createdDemographic.OFFN
      }${delim}${createdDemographic.OBJ}${delim}${
        createdDemographic.PWR
      }${delim}${createdDemographic.TYP}
        ${delim}${createdDemographic.STATUS}${delim}${
        createdDemographic.USERDEF
      }${delim}${createdDemographic.EQINDX}${delim}${
        createdDemographic.FXINDX
      }${delim}${createdDemographic.CEINDX}
        ${delim}${createdDemographic.WTDINDX}${delim}${
        createdDemographic.EQPOL
      }${delim}${createdDemographic.FXPOL}${delim}${
        createdDemographic.MVI_ACC
      }${delim}${createdDemographic.ICPDATED?.toString().replace(/\//g, "")}
        ${delim}${createdDemographic.STATEID}${delim}${
        createdDemographic.TXRATE1
      }${delim}${createdDemographic.TXRATE2}${delim}${
        createdDemographic.TXRATE3
      }${delim}${createdDemographic.TXRATE4}
        ${delim}${createdDemographic.ACTIVE}${delim}${
        createdDemographic.USERDEF2
      }${delim}${createdDemographic.USERDEF3}${delim}${
        createdDemographic.USERDEF4
      }${delim}${createdDemographic.RCFREQ}
        ${delim}${
        createdDemographic.RCTOL
      }${delim}${createdDemographic.IPPICP?.toString().replace(
        /\//g,
        ""
      )}${delim}${createdDemographic.UDA101}${delim}${
        createdDemographic.UDA102
      }${delim}${createdDemographic.UDA103}
        ${delim}${createdDemographic.UDA104}${delim}${
        createdDemographic.UDA105
      }${delim}${createdDemographic.UDA301}${delim}${
        createdDemographic.UDA302
      }${delim}${createdDemographic.UDA303}
        ${delim}${createdDemographic.UDA304}${delim}${
        createdDemographic.UDA305
      }${delim}${createdDemographic.UDN1}${delim}${
        createdDemographic.UDN2
      }${delim}${createdDemographic.UDN3}
        ${delim}${createdDemographic.UDN4}${delim}${
        createdDemographic.UDN5
      }${delim}${createdDemographic.UDDATE1?.toString().replace(
        /\//g,
        ""
      )}${delim}${createdDemographic.UDDATE2?.toString().replace(
        /\//g,
        ""
      )}${delim}${createdDemographic.UDDATE3?.toString().replace(/\//g, "")}
        ${delim}${createdDemographic.UDDATE4?.toString().replace(
        /\//g,
        ""
      )}${delim}${createdDemographic.UDDATE5?.toString().replace(
        /\//g,
        ""
      )}${delim}${createdDemographic.RPTDATE?.toString().replace(
        /\//g,
        ""
      )}${delim}${createdDemographic.GLOBALFL}
        ${delim}${createdDemographic.ACCTBASE}${delim}${
        createdDemographic.AGGTYP
      }${delim}${createdDemographic.AGGOWNER}${delim}${
        createdDemographic.TOLERPKG
      }
        ${delim}${createdDemographic.PF_TIER}${delim}${
        createdDemographic.PCOLOR
      }${delim}${createdDemographic.TXRATE5}${delim}${
        createdDemographic.TXRATE6
      }
        ${delim}${createdDemographic.TXFDONLY}${delim}${
        createdDemographic.RULEPKG
      }${delim}${createdDemographic.ACECDATE?.toString().replace(
        /\//g,
        ""
      )}${delim}${createdDemographic.AGGFEATR}
        ${delim}${createdDemographic.CMPRPIND}${delim}${
        createdDemographic.MR_IND
      }${delim}${createdDemographic.MRRPTFRQ}${delim}${
        createdDemographic.MRACTVRN
      }
        ${delim}${createdDemographic.MRLRPDT?.toString().replace(
        /\//g,
        ""
      )}${delim}${createdDemographic.MRLPRCDT?.toString().replace(
        /\//g,
        ""
      )}${delim}${createdDemographic.MRLFRPDT?.toString().replace(
        /\//g,
        ""
      )}${delim}${createdDemographic.MRLFRRDT?.toString().replace(/\//g, "")}
        ${delim}${
        createdDemographic.RPTINGNAME
      }${delim}${createdDemographic.ICPDATED_ALT?.toString().replace(
        /\//g,
        ""
      )}${delim}${createdDemographic.SMARPLEV}${delim}${
        createdDemographic.SMASRCE
      }
        ${delim}${createdDemographic.SMASORT}${delim}${
        createdDemographic.SMACPYFR
      }${delim}${createdDemographic.SMACPYTO}${delim}${
        createdDemographic.UDA106
      }${delim}${createdDemographic.UDA107}
        ${delim}${createdDemographic.UDA108}${delim}${
        createdDemographic.UDA109
      }${delim}${createdDemographic.UDA110}${delim}${
        createdDemographic.UDA111
      }${delim}${createdDemographic.UDA112}
        ${delim}${createdDemographic.UDA113}${delim}${
        createdDemographic.UDA114
      }${delim}${createdDemographic.UDA115}${delim}${
        createdDemographic.UDA306
      }${delim}${createdDemographic.UDA307}
        ${delim}${createdDemographic.UDA308}${delim}${
        createdDemographic.UDA309
      }${delim}${createdDemographic.UDA310}${delim}${
        createdDemographic.UDA311
      }${delim}${createdDemographic.UDA312}
        ${delim}${createdDemographic.UDA313}${delim}${
        createdDemographic.UDA314
      }${delim}${createdDemographic.UDA315}${delim}${
        createdDemographic.UDN6
      }${delim}${createdDemographic.UDN7}
        ${delim}${createdDemographic.UDN8}${delim}${
        createdDemographic.UDN9
      }${delim}${createdDemographic.UDN10}${delim}${
        createdDemographic.UDN11
      }${delim}${createdDemographic.UDN12}
        ${delim}${createdDemographic.UDN13}${delim}${
        createdDemographic.UDN14
      }${delim}${
        createdDemographic.UDN15
      }${delim}${createdDemographic.UDDATE6?.toString().replace(
        /\//g,
        ""
      )}${delim}${createdDemographic.UDDATE7?.toString().replace(/\//g, "")}
        ${delim}${createdDemographic.UDDATE8?.toString().replace(
        /\//g,
        ""
      )}${delim}${createdDemographic.UDDATE9?.toString().replace(
        /\//g,
        ""
      )}${delim}${createdDemographic.UDDATE10?.toString().replace(
        /\//g,
        ""
      )}${delim}${createdDemographic.UDDATE11?.toString().replace(/\//g, "")}
        ${delim}${createdDemographic.UDDATE12?.toString().replace(
        /\//g,
        ""
      )}${delim}${createdDemographic.UDDATE13?.toString().replace(
        /\//g,
        ""
      )}${delim}${createdDemographic.UDDATE14?.toString().replace(
        /\//g,
        ""
      )}${delim}${createdDemographic.UDDATE15?.toString().replace(/\//g, "")}
      `;
      await FetchUpdateDeleteAPI(
        editDataInCSV
          .replace(/[\r\n]+/g, "")
          .replace(/\s*\|\s*/g, "|")
          .replace(/\|null\|/g, "||"),
        `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPAIRD`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return createdDemographic;
    },
    onMutate: async (newDemographic: HistDemographicsFields) => {
      await queryClient.cancelQueries({
        queryKey: ["hist-demographics", selectedPortfolio, dateRange, client],
      });

      const previousHistDemographics =
        queryClient.getQueryData<HistDemographicsFields[]>([
          "hist-demographics",
          selectedPortfolio,
          client,
        ]) || [];

      queryClient.setQueryData(
        ["hist-demographics", selectedPortfolio, dateRange, client], // Use the exact query key
        (old: HistDemographicsFields[] | "") => [
          ...(old ?? []),
          { ...newDemographic, id: uuidv4() },
        ]
      );

      return { previousHistDemographics };
    },
  });

  const {
    mutateAsync: updateHistDemographic,
    isPending: isUpdatingDemographic,
  } = useMutation({
    mutationFn: async (updatedDemographic: HistDemographicsFields) => {
      // send the updated data to API function
      const editDataInCSV = `C${delim}${updatedDemographic.ACCT}${
        updatedDemographic.ADATED
      }${updatedDemographic.ADATE}${delim}${updatedDemographic.FYE}${delim}${
        updatedDemographic.BNK
      }${delim}${updatedDemographic.NAME}
        ${delim}${updatedDemographic.FREQX}${delim}${
        updatedDemographic.SECPKG
      }${delim}${updatedDemographic.INDXPKG}${delim}${
        updatedDemographic.REPTPKG
      }${delim}${updatedDemographic.SECTPKG}
        ${delim}${updatedDemographic.ADM}${delim}${
        updatedDemographic.OFFN
      }${delim}${updatedDemographic.OBJ}${delim}${
        updatedDemographic.PWR
      }${delim}${updatedDemographic.TYP}
        ${delim}${updatedDemographic.STATUS}${delim}${
        updatedDemographic.USERDEF
      }${delim}${updatedDemographic.EQINDX}${delim}${
        updatedDemographic.FXINDX
      }${delim}${updatedDemographic.CEINDX}
        ${delim}${updatedDemographic.WTDINDX}${delim}${
        updatedDemographic.EQPOL
      }${delim}${updatedDemographic.FXPOL}${delim}${
        updatedDemographic.MVI_ACC
      }${delim}${updatedDemographic.ICPDATED?.toString().replace(/\//g, "")}
        ${delim}${updatedDemographic.STATEID}${delim}${
        updatedDemographic.TXRATE1
      }${delim}${updatedDemographic.TXRATE2}${delim}${
        updatedDemographic.TXRATE3
      }${delim}${updatedDemographic.TXRATE4}
        ${delim}${updatedDemographic.ACTIVE}${delim}${
        updatedDemographic.USERDEF2
      }${delim}${updatedDemographic.USERDEF3}${delim}${
        updatedDemographic.USERDEF4
      }${delim}${updatedDemographic.RCFREQ}
        ${delim}${
        updatedDemographic.RCTOL
      }${delim}${updatedDemographic.IPPICP?.toString().replace(
        /\//g,
        ""
      )}${delim}${updatedDemographic.UDA101}${delim}${
        updatedDemographic.UDA102
      }${delim}${updatedDemographic.UDA103}
        ${delim}${updatedDemographic.UDA104}${delim}${
        updatedDemographic.UDA105
      }${delim}${updatedDemographic.UDA301}${delim}${
        updatedDemographic.UDA302
      }${delim}${updatedDemographic.UDA303}
        ${delim}${updatedDemographic.UDA304}${delim}${
        updatedDemographic.UDA305
      }${delim}${updatedDemographic.UDN1}${delim}${
        updatedDemographic.UDN2
      }${delim}${updatedDemographic.UDN3}
        ${delim}${updatedDemographic.UDN4}${delim}${
        updatedDemographic.UDN5
      }${delim}${updatedDemographic.UDDATE1?.toString().replace(
        /\//g,
        ""
      )}${delim}${updatedDemographic.UDDATE2?.toString().replace(
        /\//g,
        ""
      )}${delim}${updatedDemographic.UDDATE3?.toString().replace(/\//g, "")}
        ${delim}${updatedDemographic.UDDATE4?.toString().replace(
        /\//g,
        ""
      )}${delim}${updatedDemographic.UDDATE5?.toString().replace(
        /\//g,
        ""
      )}${delim}${updatedDemographic.RPTDATE?.toString().replace(
        /\//g,
        ""
      )}${delim}${updatedDemographic.GLOBALFL}
        ${delim}${updatedDemographic.ACCTBASE}${delim}${
        updatedDemographic.AGGTYP
      }${delim}${updatedDemographic.AGGOWNER}${delim}${
        updatedDemographic.TOLERPKG
      }
        ${delim}${updatedDemographic.PF_TIER}${delim}${
        updatedDemographic.PCOLOR
      }${delim}${updatedDemographic.TXRATE5}${delim}${
        updatedDemographic.TXRATE6
      }
        ${delim}${updatedDemographic.TXFDONLY}${delim}${
        updatedDemographic.RULEPKG
      }${delim}${updatedDemographic.ACECDATE?.toString().replace(
        /\//g,
        ""
      )}${delim}${updatedDemographic.AGGFEATR}
        ${delim}${updatedDemographic.CMPRPIND}${delim}${
        updatedDemographic.MR_IND
      }${delim}${updatedDemographic.MRRPTFRQ}${delim}${
        updatedDemographic.MRACTVRN
      }
        ${delim}${updatedDemographic.MRLRPDT?.toString().replace(
        /\//g,
        ""
      )}${delim}${updatedDemographic.MRLPRCDT?.toString().replace(
        /\//g,
        ""
      )}${delim}${updatedDemographic.MRLFRPDT?.toString().replace(
        /\//g,
        ""
      )}${delim}${updatedDemographic.MRLFRRDT?.toString().replace(/\//g, "")}
        ${delim}${
        updatedDemographic.RPTINGNAME
      }${delim}${updatedDemographic.ICPDATED_ALT?.toString().replace(
        /\//g,
        ""
      )}${delim}${updatedDemographic.SMARPLEV}${delim}${
        updatedDemographic.SMASRCE
      }
        ${delim}${updatedDemographic.SMASORT}${delim}${
        updatedDemographic.SMACPYFR
      }${delim}${updatedDemographic.SMACPYTO}${delim}${
        updatedDemographic.UDA106
      }${delim}${updatedDemographic.UDA107}
        ${delim}${updatedDemographic.UDA108}${delim}${
        updatedDemographic.UDA109
      }${delim}${updatedDemographic.UDA110}${delim}${
        updatedDemographic.UDA111
      }${delim}${updatedDemographic.UDA112}
        ${delim}${updatedDemographic.UDA113}${delim}${
        updatedDemographic.UDA114
      }${delim}${updatedDemographic.UDA115}${delim}${
        updatedDemographic.UDA306
      }${delim}${updatedDemographic.UDA307}
        ${delim}${updatedDemographic.UDA308}${delim}${
        updatedDemographic.UDA309
      }${delim}${updatedDemographic.UDA310}${delim}${
        updatedDemographic.UDA311
      }${delim}${updatedDemographic.UDA312}
        ${delim}${updatedDemographic.UDA313}${delim}${
        updatedDemographic.UDA314
      }${delim}${updatedDemographic.UDA315}${delim}${
        updatedDemographic.UDN6
      }${delim}${updatedDemographic.UDN7}
        ${delim}${updatedDemographic.UDN8}${delim}${
        updatedDemographic.UDN9
      }${delim}${updatedDemographic.UDN10}${delim}${
        updatedDemographic.UDN11
      }${delim}${updatedDemographic.UDN12}
        ${delim}${updatedDemographic.UDN13}${delim}${
        updatedDemographic.UDN14
      }${delim}${
        updatedDemographic.UDN15
      }${delim}${updatedDemographic.UDDATE6?.toString().replace(
        /\//g,
        ""
      )}${delim}${updatedDemographic.UDDATE7?.toString().replace(/\//g, "")}
        ${delim}${updatedDemographic.UDDATE8?.toString().replace(
        /\//g,
        ""
      )}${delim}${updatedDemographic.UDDATE9?.toString().replace(
        /\//g,
        ""
      )}${delim}${updatedDemographic.UDDATE10?.toString().replace(
        /\//g,
        ""
      )}${delim}${updatedDemographic.UDDATE11?.toString().replace(/\//g, "")}
        ${delim}${updatedDemographic.UDDATE12?.toString().replace(
        /\//g,
        ""
      )}${delim}${updatedDemographic.UDDATE13?.toString().replace(
        /\//g,
        ""
      )}${delim}${updatedDemographic.UDDATE14?.toString().replace(
        /\//g,
        ""
      )}${delim}${updatedDemographic.UDDATE15?.toString().replace(/\//g, "")}
      `;
      await FetchUpdateDeleteAPI(
        editDataInCSV
          .replace(/[\r\n]+/g, "")
          .replace(/\s*\|\s*/g, "|")
          .replace(/\|null\|/g, "||"),
        `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPAIRD`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return updatedDemographic;
    },
    onMutate: async (updatedDemographic: HistDemographicsFields) => {
      await queryClient.cancelQueries({ queryKey: ["hist-demographics"] });
      const previousHistDemographics = queryClient.getQueryData<
        HistDemographicsFields[]
      >(["hist-demographics"]);
      queryClient.setQueryData(
        ["hist-demographics"],
        (old: HistDemographicsFields[] = []) =>
          old.map((h) =>
            h.id === updatedDemographic.id ? updatedDemographic : h
          )
      );
      return { previousHistDemographics };
    },
  });

  const { mutateAsync: deleteDemographic, isPending: isDeletingDemographic } =
    useMutation({
      mutationFn: async ({
        demographicId,
        ACCT,
      }: {
        demographicId: string;
        ACCT: string;
      }) => {
        // send the updated data to API function
        const editDataInCSV = `D${delim}${ACCT}`;
        await FetchUpdateDeleteAPI(
          editDataInCSV
            .replace(/[\r\n]+/g, "")
            .replace(/\s*\|\s*/g, "|")
            .replace(/\|null\|/g, "||"),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPAIRD`
        ); // delete the Demographic
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated API delay
        return demographicId;
      },
      onMutate: async ({ demographicId }: { demographicId: string }) => {
        await queryClient.cancelQueries({
          queryKey: ["hist-demographics", selectedPortfolio, dateRange, client],
        });

        const previousHistDemographics = queryClient.getQueryData<
          HistDemographicsFields[]
        >(["hist-demographics", selectedPortfolio, dateRange, client]);

        // Optimistically update the cache by removing the deleted row
        queryClient.setQueryData(
          ["hist-demographics", selectedPortfolio, dateRange, client],
          (old: HistDemographicsFields[] = []) =>
            old.filter((h: HistDemographicsFields) => h.id !== demographicId)
        );

        return { previousHistDemographics };
      },
    });

  // CRUD Handlers
  const handleCreateHistDemographic: MRT_TableOptions<HistDemographicsFields>["onCreatingRowSave"] =
    async ({ values, exitCreatingMode }) => {
      // Format DATES as expected date before saving
      const formattedValues = {
        ...values,
        ICPDATED: formatDateYYMD(values.ICPDATED),
        ICPDATED_ALT: formatDateYYMD(values.ICPDATED_ALT),
        RPTDATE: formatDateYYMD(values.RPTDATE),
        ACECDATE: formatDateYYMD(values.ACECDATE),
        IPPICP: formatDateYYMD(values.IPPICP),
        UDDATE1: formatDateYYMD(values.UDDATE1),
        UDDATE2: formatDateYYMD(values.UDDATE2),
        UDDATE3: formatDateYYMD(values.UDDATE3),
        UDDATE4: formatDateYYMD(values.UDDATE4),
        UDDATE5: formatDateYYMD(values.UDDATE5),
        UDDATE6: formatDateYYMD(values.UDDATE6),
        UDDATE7: formatDateYYMD(values.UDDATE7),
        UDDATE8: formatDateYYMD(values.UDDATE8),
        UDDATE9: formatDateYYMD(values.UDDATE9),
        UDDATE10: formatDateYYMD(values.UDDATE10),
        UDDATE11: formatDateYYMD(values.UDDATE11),
        UDDATE12: formatDateYYMD(values.UDDATE12),
        UDDATE13: formatDateYYMD(values.UDDATE13),
        UDDATE14: formatDateYYMD(values.UDDATE14),
        UDDATE15: formatDateYYMD(values.UDDATE15),
        APXDATE: formatDateYYMD(values.APXDATE),
      };

      // Validate the updated values
      const errors = validateDemographic(values);
      if (Object.values(errors).some(Boolean)) {
        return; // If there are validation errors, stop the save operation
      }

      // Save the updated values instead of row.original
      await createHistDemographic(formattedValues); // Use values instead of row.original
      exitCreatingMode();
      table.setEditingRow(null); // Reset the editing state
    };

  const handleSaveHistDemographic: MRT_TableOptions<HistDemographicsFields>["onEditingRowSave"] =
    async ({ values, table }) => {
      // Format DATES as expected date before saving
      const formattedValues = {
        ...values,
        ICPDATED: formatDateYYMD(values.ICPDATED),
        ICPDATED_ALT: formatDateYYMD(values.ICPDATED_ALT),
        RPTDATE: formatDateYYMD(values.RPTDATE),
        ACECDATE: formatDateYYMD(values.ACECDATE),
        IPPICP: formatDateYYMD(values.IPPICP),
        UDDATE1: formatDateYYMD(values.UDDATE1),
        UDDATE2: formatDateYYMD(values.UDDATE2),
        UDDATE3: formatDateYYMD(values.UDDATE3),
        UDDATE4: formatDateYYMD(values.UDDATE4),
        UDDATE5: formatDateYYMD(values.UDDATE5),
        UDDATE6: formatDateYYMD(values.UDDATE6),
        UDDATE7: formatDateYYMD(values.UDDATE7),
        UDDATE8: formatDateYYMD(values.UDDATE8),
        UDDATE9: formatDateYYMD(values.UDDATE9),
        UDDATE10: formatDateYYMD(values.UDDATE10),
        UDDATE11: formatDateYYMD(values.UDDATE11),
        UDDATE12: formatDateYYMD(values.UDDATE12),
        UDDATE13: formatDateYYMD(values.UDDATE13),
        UDDATE14: formatDateYYMD(values.UDDATE14),
        UDDATE15: formatDateYYMD(values.UDDATE15),
        APXDATE: formatDateYYMD(values.APXDATE),
      };

      // Validate the updated values
      const errors = validateDemographic(values);
      if (Object.values(errors).some(Boolean)) {
        return; // If there are validation errors, stop the save operation
      }

      // Save the updated values instead of row.original
      await updateHistDemographic(formattedValues); // Use values instead of row.original

      // Reset the editing state
      table.setEditingRow(null);
    };

  const openDeleteConfirmModal = (row: MRT_Row<HistDemographicsFields>) => {
    modals.openConfirmModal({
      key: `delete-modal-${row.id}`,
      title: "Delete demographic?",
      children: (
        <Text>
          Delete {row.original.NAME} ({row.original.ACCT})?
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        deleteDemographic({
          demographicId: row.original.id,
          ACCT: row.original.ACCT,
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

  const handleExportRows = (rows: MRT_Row<HistDemographicsFields>[]) => {
    const rowData = rows.map(({ original }) => {
      const { id, ...rest } = original; // Exclude 'id' field
      return {
        ...rest,
        ADATED: rest.ADATED?.toString(), // Convert ADATED to string
        ADATE: rest.ADATE?.toString(), // Convert ADATE to string
        ICPDATED: rest.ICPDATED?.toString(), // Convert ICPDATED to string
        ICPDATED_ALT: rest.ICPDATED_ALT?.toString(),
        RPTDATE: rest.RPTDATE?.toString(),
        ACECDATE: rest.ACECDATE?.toString(),
        IPPICP: rest.IPPICP?.toString(),
        UDDATE1: rest.UDDATE1?.toString(),
        UDDATE2: rest.UDDATE2?.toString(),
        UDDATE3: rest.UDDATE3?.toString(),
        UDDATE4: rest.UDDATE4?.toString(),
        UDDATE5: rest.UDDATE5?.toString(),
        UDDATE6: rest.UDDATE6?.toString(),
        UDDATE7: rest.UDDATE7?.toString(),
        UDDATE8: rest.UDDATE8?.toString(),
        UDDATE9: rest.UDDATE9?.toString(),
        UDDATE10: rest.UDDATE10?.toString(),
        UDDATE11: rest.UDDATE11?.toString(),
        UDDATE12: rest.UDDATE12?.toString(),
        UDDATE13: rest.UDDATE13?.toString(),
        UDDATE14: rest.UDDATE14?.toString(),
        UDDATE15: rest.UDDATE15?.toString(),
        APXDATE: rest.APXDATE?.toString(),
        MRLRPDT: rest.MRLRPDT?.toString(),
        MRLPRCDT: rest.MRLPRCDT?.toString(),
        MRLFRPDT: rest.MRLFRPDT?.toString(),
        MRLFRRDT: rest.MRLFRRDT?.toString(),
      };
    });

    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  interface ExcelDataUpdate {
    (newData: HistDemographicsFields[]): void;
  }

  const handleExcelDataUpdate: ExcelDataUpdate = (newData) => {
    setExcelData(newData); // Update excelData with the uploaded file data
    setIsUsingExcelData(true); // Switch to using Excel data
  };

  // create only records that is requires to update the Table
  const FRPAIRDExcel = finalData?.map(({ id, ...rest }) => ({
    ...rest,
  }));

  //  Custom headers for the PDF file
  const PDFheaders = [
    { label: "Portfolio ID", key: "ACCT" },
    { label: "ADATED", key: "ADATED" },
    { label: "ADATE", key: "ADATE" },
    { label: "Name", key: "NAME" },
    { label: "Bank", key: "BNK" },
    { label: "Status", key: "STATUS" },
    { label: "Report date", key: "RPTDATE" },
    { label: "Inception", key: "ICPDATED" },
    { label: "TXRATE1", key: "TXRATE1", align: "right" },
  ];

  // Load data from excel to table
  const fieldnames = [
    "RECDTYPE",
    "ACCT",
    "ADATED",
    "ADATE",
    "FYE",
    "BNK",
    "NAME",
    "FREQX",
    "SECPKG",
    "INDXPKG",
    "REPTPKG",
    "SECTPKG",
    "ADM",
    "OFFN",
    "OBJ",
    "PWR",
    "TYP",
    "STATUS",
    "USERDEF",
    "EQINDX",
    "FXINDX",
    "CEINDX",
    "WTDINDX",
    "EQPOL",
    "FXPOL",
    "MVI_ACC",
    "ICPDATED",
    "STATEID",
    "TXRATE1",
    "TXRATE2",
    "TXRATE3",
    "TXRATE4",
    "ACTIVE",
    "USERDEF2",
    "USERDEF3",
    "USERDEF4",
    "RCFREQ",
    "RCTOL",
    "IPPICP",
    "UDA101",
    "UDA102",
    "UDA103",
    "UDA104",
    "UDA105",
    "UDA301",
    "UDA302",
    "UDA303",
    "UDA304",
    "UDA305",
    "UDN1",
    "UDN2",
    "UDN3",
    "UDN4",
    "UDN5",
    "UDDATE1",
    "UDDATE2",
    "UDDATE3",
    "UDDATE4",
    "UDDATE5",
    "RPTDATE",
    "GLOBALFL",
    "ACCTBASE",
    "AGGTYP",
    "AGGOWNER",
    "TOLERPKG",
    "PF_TIER",
    "PCOLOR",
    "TXRATE5",
    "TXRATE6",
    "TXFDONLY",
    "RULEPKG",
    "ACECDATE",
    "AGGFEATR",
    "CMPRPIND",
    "MR_IND",
    "MRRPTFRQ",
    "MRACTVRN",
    "MRLRPDT",
    "MRLPRCDT",
    "MRLFRPDT",
    "MRLFRRDT",
    "RPTINGNAME",
    "ICPDATED_ALT",
    "SMARPLEV",
    "SMASRCE",
    "SMASORT",
    "SMACPYFR",
    "SMACPYTO",
    "UDA106",
    "UDA107",
    "UDA108",
    "UDA109",
    "UDA110",
    "UDA111",
    "UDA112",
    "UDA113",
    "UDA114",
    "UDA115",
    "UDA306",
    "UDA307",
    "UDA308",
    "UDA309",
    "UDA310",
    "UDA311",
    "UDA312",
    "UDA313",
    "UDA314",
    "UDA315",
    "UDN6",
    "UDN7",
    "UDN8",
    "UDN9",
    "UDN10",
    "UDN11",
    "UDN12",
    "UDN13",
    "UDN14",
    "UDN15",
    "UDDATE6",
    "UDDATE7",
    "UDDATE8",
    "UDDATE9",
    "UDDATE10",
    "UDDATE11",
    "UDDATE12",
    "UDDATE13",
    "UDDATE14",
    "UDDATE15",
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
    mutateAsync: updateHistDemographicExcel,
    isPending: isUpdatingDemographicExcel,
  } = useMutation({
    mutationFn: async () => {
      // send the updated data to API function
      await FetchUpdateDeleteAPIExcel(
        convertToCSV(finalData),
        `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPAIRD`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return Promise.resolve();
    },
    onMutate: async () => {},
  });

  const handleMRELoad = async () => {
    await updateHistDemographicExcel();
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
    mantineToolbarAlertBannerProps: isLoadingHistDemographicsError
      ? { color: "red", children: "Failed to load data. Update your selection criteria." }
      : undefined,
    // onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateHistDemographic,
    // onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveHistDemographic,
    enableRowActions: true,
    mantineTableBodyCellProps: { 
      className: "rpt-body",
    },

    renderCreateRowModalContent: ({ table, row, internalEditComponents }) => {
      setIsEditable(true);
      return (
        <Stack>
          <Flex className="mrt-model-title">
            <Title order={4} color="blue">
              Create New Historical Demographics
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
              <React.Fragment key={index}>
                {index === 0 && (
                  <Grid.Col span={12}>
                    <Divider
                      mt="sm"
                      label="General Information"
                      labelPosition="center"
                    />
                  </Grid.Col>
                )}
                {index === 11 && (
                  <Grid.Col span={12}>
                    <Divider
                      mt="sm"
                      label="Filter Setting"
                      labelPosition="center"
                    />
                  </Grid.Col>
                )}
                {index === 17 && (
                  <Grid.Col span={12}>
                    <Divider
                      mt="sm"
                      label="Benchmark Setting"
                      labelPosition="center"
                    />
                  </Grid.Col>
                )}
                {index === 26 && (
                  <Grid.Col span={12}>
                    <Divider
                      mt="sm"
                      label="Composite Setting"
                      labelPosition="center"
                    />
                  </Grid.Col>
                )}
                {index === 37 && (
                  <Grid.Col span={12}>
                    <Divider
                      mt="sm"
                      label="Tax Setting"
                      labelPosition="center"
                    />
                  </Grid.Col>
                )}
                {index === 45 && (
                  <Grid.Col span={12}>
                    <Divider
                      mt="sm"
                      label="Performance Reporting"
                      labelPosition="center"
                    />
                  </Grid.Col>
                )}
                {index === 54 && (
                  <Grid.Col span={12}>
                    <Divider
                      mt="sm"
                      label="Client Defined Fields"
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
              Edit Historical Demographics
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
              <React.Fragment key={index}>
                {index === 0 && (
                  <Grid.Col span={12}>
                    <Divider
                      mt="sm"
                      label="General Information"
                      labelPosition="center"
                    />
                  </Grid.Col>
                )}
                {index === 11 && (
                  <Grid.Col span={12}>
                    <Divider
                      mt="sm"
                      label="Filter Setting"
                      labelPosition="center"
                    />
                  </Grid.Col>
                )}
                {index === 17 && (
                  <Grid.Col span={12}>
                    <Divider
                      mt="sm"
                      label="Benchmark Setting"
                      labelPosition="center"
                    />
                  </Grid.Col>
                )}
                {index === 26 && (
                  <Grid.Col span={12}>
                    <Divider
                      mt="sm"
                      label="Composite Setting"
                      labelPosition="center"
                    />
                  </Grid.Col>
                )}
                {index === 37 && (
                  <Grid.Col span={12}>
                    <Divider
                      mt="sm"
                      label="Tax Setting"
                      labelPosition="center"
                    />
                  </Grid.Col>
                )}
                {index === 45 && (
                  <Grid.Col span={12}>
                    <Divider
                      mt="sm"
                      label="Performance Reporting"
                      labelPosition="center"
                    />
                  </Grid.Col>
                )}
                {index === 54 && (
                  <Grid.Col span={12}>
                    <Divider
                      mt="sm"
                      label="Client Defined Fields"
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
      size: "80%",
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
            table.setCreatingRow(
              createRow(table, getHistDemographicsDefaultValue)
            );
          }}
        >
          Create New Historical demographic
        </Button>
        <Button
          variant="subtle"
          disabled={
            !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
          }
          //only export selected rows
          onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
          className={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected() ? "" : "rpt-action-button"}
          leftIcon={<EXPORT_SVG />}
        >
          Export Selected Rows
        </Button>
        <Import onDataUpdate={handleExcelDataUpdate} />
        <Export
          data={finalData}
          excelData={FRPAIRDExcel}
          reportName="FRPAIRD"
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
      isLoading: isLoadingHistDemographics,
      isSaving:
        isCreatingDemographic ||
        isUpdatingDemographic ||
        isDeletingDemographic ||
        isUpdatingDemographicExcel,
      showAlertBanner: isLoadingHistDemographicsError,
      showProgressBars: isFetchingHistDemographics,
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

const FrpHistDemographics = () => (
  <ModalsProvider>
    <HistDemographicsMTable />
  </ModalsProvider>
);

export default FrpHistDemographics;

const validateRequired = (value: string) => !!value.length;

function validateDemographic(demographic: HistDemographicsFields) {
  return {
    ADATE: !validateRequired(demographic.ADATE?.toString()) ? 'Date is Required' : '',
  };
}
