import React, { useState } from "react";
import {
  MRT_EditActionButtons,
  MantineReactTable,
  type MRT_Row,
  type MRT_TableOptions,
  useMantineReactTable,
  createRow,
} from "mantine-react-table";
import { ActionIcon, Button, Flex, Text, Tooltip, Stack, Title, Grid } from "@mantine/core";
import { CopyIcon, EXPORT_SVG } from "../../svgicons/svgicons.js";
import { ModalsProvider, modals } from "@mantine/modals";
import { IconEdit, IconTrash, IconPlus, IconRefresh} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import { FetchAPI, FetchUpdateDeleteAPI, FetchUpdateDeleteAPIExcel} from "../../api.js";
import useClient from "../hooks/useClient.js";
import { SecurityCharacteristicsFields, getSecurityCharacteristicsDefaultVal } from "./columnTitles/SecurityCharacteristicsDefines.tsx";
import { useSecurityCharColumns } from "./columnTitles/SecurityCharacteristicsColumns.tsx";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs
import { mkConfig, generateCsv, download } from "export-to-csv"; //or use your library of choice here

import { compareData } from "../report-components/compareData.js";
import { Import } from "../report-components/Import.js";
import { Export } from "../report-components/Export.js";
import { formatDateYYMD, formatFromDateYYM, formatToDateYYM, formatDateYYM } from "../hooks/FormatDates.tsx";

type DateRange = string[];

type OutletContextType = {
  selectedPortfolio: string;
  setSelectedPortfolio: (portfolio: string) => void;
  dateRange: DateRange;
};

const SecurityCharMTable = () => {
  const [finalData, setFinalData] = useState<SecurityCharacteristicsFields[]>([]);
  const [excelData, setExcelData] = useState<SecurityCharacteristicsFields[]>([]);
  const [isUsingExcelData, setIsUsingExcelData] = useState(false);
  const [isEditAble, setIsEditable] = useState<boolean>(false);

  const client = useClient();
  const delim = process.env.REACT_APP_DELIMITER;
  const { dateRange } = useOutletContext<OutletContextType>();
  const fromDate = formatFromDateYYM(dateRange as [string, string]) ;
  const toDate = formatToDateYYM(dateRange as [string, string]) ;
  
  
  const securityCharUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPCHAR&filters=SECDATE(GT:${fromDate}:AND:SECDATE:LE:${toDate})`;

  // Unified data fetch using React Query
  const {
      data: fetchedSecurityChar = [],
      isError: isLoadingSecurityCharError,
      isFetching: isFetchingSecurityChar,
      isLoading: isLoadingSecurityChar,
  } = useQuery<SecurityCharacteristicsFields[]>({
      queryKey: ["securityChar",dateRange, client], // Add assetNameData to queryKey
      queryFn: async () => {
          const data = await FetchAPI(securityCharUri);
          
          return data;
      },
      enabled: !!dateRange && !!client, // Add assetNameData to enabled condition
  });
 
  // Determine which data to display
  // const data = isUsingExcelData ? excelData : fetchedSecurityChar;
  // Update finalData based on excelData or data
  const keyFields = ["SECDATE", "CID"]; // 
  const alphaFields = ['TKRID', 'EXDIVDT', 'MATURITY', 'SPRATE', 'INDUSTRY', 'CALLDATE', 'PUTDATE'];
  const numericFields = [
    'PRICE', 'MKTSECT', 'DIVYLD', 'ANNDIV', 'DVDLT', 'EPS', 'EPSHIGH', 'EPSLOW', 'PE', 'PE1YR', 'EPSGRWTH', 
    'MKTCAP', 'VOLUME', 'LASTDIV', 'WKHI52', 'WKLO52', 'ROE', 'PBOOKVAL', 'BETA', 'PRCHGYTD', 'PRCASH', 'ANNYLD', 'YLDTMAT', 'DURATION', 
    'USERDEF1', 'USERDEF2', 'USERDEF3', 'USERDEF4', 'USERDEF5', 'PEYTD', 'PRCHG1YR', 'BTR1000', 'BTR1000G', 'BTR1000V', 'BTR2000', 'BTR2000G', 
    'BTR2000V', 'BTR3000', 'BTR3000G', 'BTR3000V', 'BTRMID', 'BTRMIDG', 'BTRMIDV', 'BTMID', 'BTSPBGI', 'BTSPBVI', 'BTSPSCI', 'BTSPX', 'DIVYLD5Y', 
    'DIVGR5Y', 'DIVYLDIR', 'DIVPSANN', 'EPS10YGR', 'EPS3YGR', 'EPS5YGR', 'EPSCHGCF', 'EPSLTM', 'EPSLSTFY', 'EPSCOFTM', 'EPSCOCFY', 'EPSCONFY', 'EPSCLFY', 
    'EPSNCF', 'EPSNNFY', 'EPSLTFG', 'LTDTOTCP', 'MGNGROSS', 'MGNNP', 'MGNOPER', 'ROEQUITY', 'MKTCAP2', 'PEGRATIO', 'PEFWD', 'PECFY', 'PELTM', 'PE5YAVG', 'PSBOOK', 
    'PSCASHFL', 'PSREV', 'PSCFLTM', 'PSEBITMG', 'PB', 'PRCF', 'PRSALES', 'COUPON', 'CALLPRICE', 'PUTPRICE'
  ];

  React.useEffect(() => {
    if (isUsingExcelData && excelData.length > 0) {
      setFinalData(
        compareData(
          excelData,
          fetchedSecurityChar,
          keyFields,
          alphaFields,
          numericFields
        )
      );
      setIsUsingExcelData(false); // Switch back to using fetched data
    } else if (fetchedSecurityChar && fetchedSecurityChar.length > 0) {
      setFinalData(fetchedSecurityChar);
    } else if (finalData.length !== 0) {
      // Prevent unnecessary updates
      setFinalData([]);
    }
  }, [excelData, fetchedSecurityChar]);
  

  const columns = useSecurityCharColumns(finalData, isEditAble); // Get Column information

  const queryClient = useQueryClient();
  // Mutations
  const { mutateAsync: createSecuirtyChar, isPending: isCreatingSecurityChar } =
    useMutation({
      mutationFn: async (createdSecurityCharac: SecurityCharacteristicsFields) => {
        // send the updated data to API function
        const editDataInCSV = `A${delim}${createdSecurityCharac.SECDATE?.toString().replace(/\//g, "").replace(/-/g, "")}${delim}${createdSecurityCharac.CID}
          ${delim}${createdSecurityCharac.TKRID}${delim}${createdSecurityCharac.PRICE}${delim}${createdSecurityCharac.MKTSECT}${delim}${createdSecurityCharac.DIVYLD}
          ${delim}${createdSecurityCharac.ANNDIV}${delim}${createdSecurityCharac.EXDIVDT?.toString().replace(/\//g, "").replace(/-/g, "")}${delim}${createdSecurityCharac.DVDLT}
          ${delim}${createdSecurityCharac.EPS}${delim}${createdSecurityCharac.EPSHIGH}${delim}${createdSecurityCharac.EPSLOW}${delim}${createdSecurityCharac.PE}
          ${delim}${createdSecurityCharac.PE1YR}${delim}${createdSecurityCharac.EPSGRWTH}${delim}${createdSecurityCharac.MKTCAP}${delim}${createdSecurityCharac.VOLUME}
          ${delim}${createdSecurityCharac.LASTDIV}${delim}${createdSecurityCharac.WKHI52}${delim}${createdSecurityCharac.WKLO52}${delim}${createdSecurityCharac.ROE}
          ${delim}${createdSecurityCharac.PBOOKVAL}${delim}${createdSecurityCharac.BETA}${delim}${createdSecurityCharac.PRCHGYTD}${delim}${createdSecurityCharac.PRCASH}
          ${delim}${createdSecurityCharac.MATURITY?.toString().replace(/\//g, "").replace(/-/g, "")}${delim}${createdSecurityCharac.ANNYLD}${delim}${createdSecurityCharac.YLDTMAT}
          ${delim}${createdSecurityCharac.SPRATE}${delim}${createdSecurityCharac.DURATION}${delim}${createdSecurityCharac.INDUSTRY}${delim}${createdSecurityCharac.USERDEF1}
          ${delim}${createdSecurityCharac.USERDEF2}${delim}${createdSecurityCharac.USERDEF3}${delim}${createdSecurityCharac.USERDEF4}${delim}${createdSecurityCharac.USERDEF5}
          ${delim}${createdSecurityCharac.PEYTD}${delim}${createdSecurityCharac.PRCHG1YR}${delim}${createdSecurityCharac.BTR1000}${delim}${createdSecurityCharac.BTR1000G}
          ${delim}${createdSecurityCharac.BTR1000V}${delim}${createdSecurityCharac.BTR2000}${delim}${createdSecurityCharac.BTR2000G}${delim}${createdSecurityCharac.BTR2000V}
          ${delim}${createdSecurityCharac.BTR3000}${delim}${createdSecurityCharac.BTR3000G}${delim}${createdSecurityCharac.BTR3000V}${delim}${createdSecurityCharac.BTRMID}
          ${delim}${createdSecurityCharac.BTRMIDG}${delim}${createdSecurityCharac.BTRMIDV}${delim}${createdSecurityCharac.BTMID}${delim}${createdSecurityCharac.BTSPBGI}
          ${delim}${createdSecurityCharac.BTSPBVI}${delim}${createdSecurityCharac.BTSPSCI}${delim}${createdSecurityCharac.BTSPX}${delim}${createdSecurityCharac.DIVYLD5Y}
          ${delim}${createdSecurityCharac.DIVGR5Y}${delim}${createdSecurityCharac.DIVYLDIR}${delim}${createdSecurityCharac.DIVPSANN}${delim}${createdSecurityCharac.EPS10YGR}
          ${delim}${createdSecurityCharac.EPS3YGR}${delim}${createdSecurityCharac.EPS5YGR}${delim}${createdSecurityCharac.EPSCHGCF}${delim}${createdSecurityCharac.EPSLTM}
          ${delim}${createdSecurityCharac.EPSLSTFY}${delim}${createdSecurityCharac.EPSCOFTM}${delim}${createdSecurityCharac.EPSCOCFY}${delim}${createdSecurityCharac.EPSCONFY}
          ${delim}${createdSecurityCharac.EPSCLFY}${delim}${createdSecurityCharac.EPSNCF}${delim}${createdSecurityCharac.EPSNNFY}${delim}${createdSecurityCharac.EPSLTFG}
          ${delim}${createdSecurityCharac.LTDTOTCP}${delim}${createdSecurityCharac.MGNGROSS}${delim}${createdSecurityCharac.MGNNP}${delim}${createdSecurityCharac.MGNOPER}
          ${delim}${createdSecurityCharac.ROEQUITY}${delim}${createdSecurityCharac.MKTCAP2}${delim}${createdSecurityCharac.PEGRATIO}${delim}${createdSecurityCharac.PEFWD}
          ${delim}${createdSecurityCharac.PECFY}${delim}${createdSecurityCharac.PELTM}${delim}${createdSecurityCharac.PE5YAVG}${delim}${createdSecurityCharac.PSBOOK}
          ${delim}${createdSecurityCharac.PSCASHFL}${delim}${createdSecurityCharac.PSREV}${delim}${createdSecurityCharac.PSCFLTM}${delim}${createdSecurityCharac.PSEBITMG}
          ${delim}${createdSecurityCharac.PB}${delim}${createdSecurityCharac.PRCF}${delim}${createdSecurityCharac.PRSALES}${delim}${createdSecurityCharac.COUPON}
          ${delim}${createdSecurityCharac.CALLDATE?.toString().replace(/\//g, "").replace(/-/g, "")}${delim}${createdSecurityCharac.CALLPRICE}
          ${delim}${createdSecurityCharac.PUTDATE?.toString().replace(/\//g, "").replace(/-/g, "")}${delim}${createdSecurityCharac.PUTPRICE}
        `;

        await FetchUpdateDeleteAPI(
          editDataInCSV.replace(/[\r\n]+/g, "").replace(/\s*\|\s*/g, "|").replace(/\|null\|/g, "||"),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPCHAR`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return createSecuirtyChar;
      },
      onMutate: async (newSecurityChar: SecurityCharacteristicsFields) => {
        await queryClient.cancelQueries({
          queryKey: ["securityChar", dateRange, client],
        });

        const previousSecurityChar = queryClient.getQueryData<SecurityCharacteristicsFields[]>(["securityChar", dateRange, client]) || [];

        queryClient.setQueryData(
          ["securityChar", dateRange, client], // Use the exact query key
          (old: SecurityCharacteristicsFields[] | undefined) => [
            ...(old ?? []),
            { 
                ...newSecurityChar, 
                id: uuidv4(), 
            },
          ]
        );

        return { previousSecurityChar };
      },
    });

  const { mutateAsync: updateSecurityChar, isPending: isUpdatingSecurityChar } =
      useMutation({
        mutationFn: async (updatedSecurityChar: SecurityCharacteristicsFields) => {
          // send the updated data to API function
          const editDataInCSV = `C${delim}${updatedSecurityChar.SECDATE?.toString().replace(/\//g, "").replace(/-/g, "")}${delim}${updatedSecurityChar.CID}
            ${delim}${updatedSecurityChar.TKRID}${delim}${updatedSecurityChar.PRICE}${delim}${updatedSecurityChar.MKTSECT}${delim}${updatedSecurityChar.DIVYLD}
            ${delim}${updatedSecurityChar.ANNDIV}${delim}${updatedSecurityChar.EXDIVDT?.toString().replace(/\//g, "").replace(/-/g, "")}${delim}${updatedSecurityChar.DVDLT}
            ${delim}${updatedSecurityChar.EPS}${delim}${updatedSecurityChar.EPSHIGH}${delim}${updatedSecurityChar.EPSLOW}${delim}${updatedSecurityChar.PE}
            ${delim}${updatedSecurityChar.PE1YR}${delim}${updatedSecurityChar.EPSGRWTH}${delim}${updatedSecurityChar.MKTCAP}${delim}${updatedSecurityChar.VOLUME}
            ${delim}${updatedSecurityChar.LASTDIV}${delim}${updatedSecurityChar.WKHI52}${delim}${updatedSecurityChar.WKLO52}${delim}${updatedSecurityChar.ROE}
            ${delim}${updatedSecurityChar.PBOOKVAL}${delim}${updatedSecurityChar.BETA}${delim}${updatedSecurityChar.PRCHGYTD}${delim}${updatedSecurityChar.PRCASH}
            ${delim}${updatedSecurityChar.MATURITY?.toString().replace(/\//g, "").replace(/-/g, "")}${delim}${updatedSecurityChar.ANNYLD}${delim}${updatedSecurityChar.YLDTMAT}
            ${delim}${updatedSecurityChar.SPRATE}${delim}${updatedSecurityChar.DURATION}${delim}${updatedSecurityChar.INDUSTRY}${delim}${updatedSecurityChar.USERDEF1}
            ${delim}${updatedSecurityChar.USERDEF2}${delim}${updatedSecurityChar.USERDEF3}${delim}${updatedSecurityChar.USERDEF4}${delim}${updatedSecurityChar.USERDEF5}
            ${delim}${updatedSecurityChar.PEYTD}${delim}${updatedSecurityChar.PRCHG1YR}${delim}${updatedSecurityChar.BTR1000}${delim}${updatedSecurityChar.BTR1000G}
            ${delim}${updatedSecurityChar.BTR1000V}${delim}${updatedSecurityChar.BTR2000}${delim}${updatedSecurityChar.BTR2000G}${delim}${updatedSecurityChar.BTR2000V}
            ${delim}${updatedSecurityChar.BTR3000}${delim}${updatedSecurityChar.BTR3000G}${delim}${updatedSecurityChar.BTR3000V}${delim}${updatedSecurityChar.BTRMID}
            ${delim}${updatedSecurityChar.BTRMIDG}${delim}${updatedSecurityChar.BTRMIDV}${delim}${updatedSecurityChar.BTMID}${delim}${updatedSecurityChar.BTSPBGI}
            ${delim}${updatedSecurityChar.BTSPBVI}${delim}${updatedSecurityChar.BTSPSCI}${delim}${updatedSecurityChar.BTSPX}${delim}${updatedSecurityChar.DIVYLD5Y}
            ${delim}${updatedSecurityChar.DIVGR5Y}${delim}${updatedSecurityChar.DIVYLDIR}${delim}${updatedSecurityChar.DIVPSANN}${delim}${updatedSecurityChar.EPS10YGR}
            ${delim}${updatedSecurityChar.EPS3YGR}${delim}${updatedSecurityChar.EPS5YGR}${delim}${updatedSecurityChar.EPSCHGCF}${delim}${updatedSecurityChar.EPSLTM}
            ${delim}${updatedSecurityChar.EPSLSTFY}${delim}${updatedSecurityChar.EPSCOFTM}${delim}${updatedSecurityChar.EPSCOCFY}${delim}${updatedSecurityChar.EPSCONFY}
            ${delim}${updatedSecurityChar.EPSCLFY}${delim}${updatedSecurityChar.EPSNCF}${delim}${updatedSecurityChar.EPSNNFY}${delim}${updatedSecurityChar.EPSLTFG}
            ${delim}${updatedSecurityChar.LTDTOTCP}${delim}${updatedSecurityChar.MGNGROSS}${delim}${updatedSecurityChar.MGNNP}${delim}${updatedSecurityChar.MGNOPER}
            ${delim}${updatedSecurityChar.ROEQUITY}${delim}${updatedSecurityChar.MKTCAP2}${delim}${updatedSecurityChar.PEGRATIO}${delim}${updatedSecurityChar.PEFWD}
            ${delim}${updatedSecurityChar.PECFY}${delim}${updatedSecurityChar.PELTM}${delim}${updatedSecurityChar.PE5YAVG}${delim}${updatedSecurityChar.PSBOOK}
            ${delim}${updatedSecurityChar.PSCASHFL}${delim}${updatedSecurityChar.PSREV}${delim}${updatedSecurityChar.PSCFLTM}${delim}${updatedSecurityChar.PSEBITMG}
            ${delim}${updatedSecurityChar.PB}${delim}${updatedSecurityChar.PRCF}${delim}${updatedSecurityChar.PRSALES}${delim}${updatedSecurityChar.COUPON}${delim}
            ${updatedSecurityChar.CALLDATE?.toString().replace(/\//g, "").replace(/-/g, "")}${delim}${updatedSecurityChar.CALLPRICE}
            ${delim}${updatedSecurityChar.PUTDATE?.toString().replace(/\//g, "").replace(/-/g, "")}${delim}${updatedSecurityChar.PUTPRICE}
          `;

          await FetchUpdateDeleteAPI(
            editDataInCSV.replace(/\s+/g, ""),
            `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPACBNC`
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return updatedSecurityChar;
        },
        onMutate: async (updatedSecurityChar: SecurityCharacteristicsFields) => {
          await queryClient.cancelQueries({ queryKey: ["targetPolicyAss"] });
          const previousSecurityChar = queryClient.getQueryData<SecurityCharacteristicsFields[]>(["targetPolicyAss"]);
          queryClient.setQueryData(["targetPolicyAss"], (old: SecurityCharacteristicsFields[] = []) =>
            old.map((h) => (h.id === updatedSecurityChar.id ? updatedSecurityChar : h))
          );
          return { previousSecurityChar };
        },
      });

  const { mutateAsync: deleteSecurityChar, isPending: isDeletingSecurityChar } =
    useMutation({
      mutationFn: async ({ securityCharId, SECDATE, CID}: {
        securityCharId: string;
        SECDATE: string | Date;
        CID: string;
      }) => {
        // send the updated data to API function
        const editDataInCSV = `D${delim}${SECDATE?.toString().replace(/\//g, "").replace(/-/g, "")}${delim}${CID}`;
        await FetchUpdateDeleteAPI(
          editDataInCSV.replace(/[\r\n]+/g, "").replace(/\s*\|\s*/g, "|").replace(/\|null\|/g, "||"),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPCHAR`
        ); // delete the securityChar
        await new Promise((resolve) => setTimeout(resolve, 100)); // Simulated API delay
        return Promise.resolve(securityCharId);
      },
      onMutate: async ({ securityCharId }) => {
        await queryClient.cancelQueries({
          queryKey: ["securityChar", dateRange, client],
        });

        const previousSecurityChar = queryClient.getQueryData<SecurityCharacteristicsFields[]>(["securityChar", dateRange, client]) || [];

        // Optimistically update the cache by removing the deleted row
        queryClient.setQueryData(
          ["securityChar", dateRange, client],
          (old: SecurityCharacteristicsFields[] = []) => {
            const newData = old.filter(
              (h: SecurityCharacteristicsFields) => h.id !== securityCharId
            );
            return newData;
          }
        );

        return { previousSecurityChar };
      },
    });

  // CRUD Handlers
  const handlecreateSecuirtyChar: MRT_TableOptions<SecurityCharacteristicsFields>["onCreatingRowSave"] =
    async ({ values, exitCreatingMode }) => {

      const formattedValues = {
        ...values,
        SECDATE: values.SECDATE === "" || null ? "190012" : formatDateYYM(values.SECDATE),
        EXDIVDT: values.EXDIVDT === "" || null ? "19001201" : formatDateYYMD(values.EXDIVDT),
        MATURITY: values.MATURITY === "" || null ? "19001201" : formatDateYYMD(values.MATURITY),
        CALLDATE: values.CALLDATE === "" || null ? "19001201" : formatDateYYMD(values.CALLDATE),
        PUTDATE: values.PUTDATE === "" || null ? "19001201" : formatDateYYMD(values.PUTDATE)
      };

      // Validate the updated values
      const errors = validateSecurityChar(formattedValues);
      if (Object.values(errors).some(Boolean)) {
        return; // If there are validation errors, stop the save operation
      }

      // Save the created values instead of row.original
      await createSecuirtyChar(formattedValues); // Use values instead of row.original
      exitCreatingMode();
      table.setCreatingRow(null); // Reset editing state
    };

  const handleSaveSecurityChar: MRT_TableOptions<SecurityCharacteristicsFields>["onEditingRowSave"] =
    async ({ table, values, row }) => {

      const formattedValues = {
        ...values,
        SECDATE: values.SECDATE === "" || null ? "190012" : formatDateYYM(values.SECDATE),
        EXDIVDT: values.EXDIVDT === "" || null ? "19001201" : formatDateYYMD(values.EXDIVDT),
        MATURITY: values.MATURITY === "" || null ? "19001201" : formatDateYYMD(values.MATURITY),
        CALLDATE: values.CALLDATE === "" || null ? "19001201" : formatDateYYMD(values.CALLDATE),
        PUTDATE: values.PUTDATE === "" || null ? "19001201" : formatDateYYMD(values.PUTDATE)
      };
      // Validate the updated values
      const errors = validateSecurityChar(formattedValues);
      if (Object.values(errors).some(Boolean)) {
        return; // If there are validation errors, stop the save operation
      }
      
      await updateSecurityChar(formattedValues); // Use values instead of row.original

      // Reset the editing state
      table.setEditingRow(null);
    };

  const openDeleteConfirmModal = (row: MRT_Row<SecurityCharacteristicsFields>) => {
    modals.openConfirmModal({
      key: `delete-modal-${row.id}`,
      title: "Delete Security Characteristics?",
      children: (
        <Text>
          Delete {row.original.SECDATE?.toString()} and Charactrastic ID ({row.original.CID})?
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        deleteSecurityChar({
          securityCharId: row.original.id,
          SECDATE: row.original.SECDATE,
          CID: row.original.CID
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

  const handleExportRows = (rows: MRT_Row<SecurityCharacteristicsFields>[]) => {
    const rowData = rows.map(({ original }) => {
      const { id, ...rest } = original; // Exclude 'id' field
      return {
        ...rest,
        SECDATE: rest.SECDATE.toString(), // Convert SECDATE to string
        EXDIVDT: rest.EXDIVDT.toString(), // Convert EXDIVDT to string
        MATURITY: rest.MATURITY.toString(), // Convert MATURITY to string
        CALLDATE: rest.CALLDATE.toString(), // Convert CALLDATE to string
        PUTDATE: rest.PUTDATE.toString(), // Convert PUTDATE to string
      };
    });

    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  interface ExcelDataUpdate {
    (newData: SecurityCharacteristicsFields[]): void;
  }

  const handleExcelDataUpdate: ExcelDataUpdate = (newData) => {
    setExcelData(newData); // Update excelData with the uploaded file data
    setIsUsingExcelData(true); // Switch to using Excel data
  };

  // create only records that is requires to update the Table
  const FRPCHARExcel = Array.isArray(finalData) 
    ? finalData.map(({ id, ...rest }) => ({ ...rest })) 
    : [];

  //  Custom headers for the PDF file
  const PDFheaders = [
    { label: "Security Date", key: "SECDATE" },
    { label: "Ex-Dividend Date", key: "EXDIVDT" },
    { label: "Maturity Date", key: "MATURITY" },
    { label: "Call Date", key: "CALLDATE" },
    { label: "Call Price", key: "CALLPRICE" },
    { label: "Put Date", key: "PUTDATE" },
    { label: "Put Price", key: "PUTPRICE" },
  ];

  // Load data from excel to table
  const fieldnames = [
    'RECDTYPE', 'SECDATE', 'CID', 'TKRID', 'PRICE', 'MKTSECT', 'DIVYLD', 'ANNDIV', 'EXDIVDT', 'DVDLT',
    'EPS', 'EPSHIGH', 'EPSLOW', 'PE', 'PE1YR', 'EPSGRWTH', 'MKTCAP', 'VOLUME', 'LASTDIV',
    'WKHI52', 'WKLO52', 'ROE', 'PBOOKVAL', 'BETA', 'PRCHGYTD', 'PRCASH', 'MATURITY', 'ANNYLD',
    'YLDTMAT', 'SPRATE', 'DURATION', 'INDUSTRY', 'USERDEF1', 'USERDEF2', 'USERDEF3', 'USERDEF4',
    'USERDEF5', 'PEYTD', 'PRCHG1YR', 'BTR1000', 'BTR1000G', 'BTR1000V', 'BTR2000', 'BTR2000G',
    'BTR2000V', 'BTR3000', 'BTR3000G', 'BTR3000V', 'BTRMID', 'BTRMIDG', 'BTRMIDV', 'BTMID',
    'BTSPBGI', 'BTSPBVI', 'BTSPSCI', 'BTSPX', 'DIVYLD5Y', 'DIVGR5Y', 'DIVYLDIR', 'DIVPSANN',
    'EPS10YGR', 'EPS3YGR', 'EPS5YGR', 'EPSCHGCF', 'EPSLTM', 'EPSLSTFY', 'EPSCOFTM', 'EPSCOCFY',
    'EPSCONFY', 'EPSCLFY', 'EPSNCF', 'EPSNNFY', 'EPSLTFG', 'LTDTOTCP', 'MGNGROSS', 'MGNNP',
    'MGNOPER', 'ROEQUITY', 'MKTCAP2', 'PEGRATIO', 'PEFWD', 'PECFY', 'PELTM', 'PE5YAVG', 'PSBOOK',
    'PSCASHFL', 'PSREV', 'PSCFLTM', 'PSEBITMG', 'PB', 'PRCF', 'PRSALES', 'COUPON', 'CALLDATE',
    'CALLPRICE', 'PUTDATE', 'PUTPRICE'
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

  const { mutateAsync: updateSecurityCharExcel, isPending: isUpdatingSecurityCharExcel } =
    useMutation({
      mutationFn: async () => {
        // send the updated data to API function
        await FetchUpdateDeleteAPIExcel(
          convertToCSV(finalData),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPCHAR`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return Promise.resolve();
      },
      onMutate: async () => {},
    });

  const handleMRELoad = async () => {
    await updateSecurityCharExcel();
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
    mantineToolbarAlertBannerProps: isLoadingSecurityCharError
      ? { color: "red", children: "Failed to load data. Update your selection criteria." }
      : undefined,
    // onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handlecreateSecuirtyChar,
    // onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveSecurityChar,
    enableRowActions: true,

    mantineTableBodyCellProps: { 
      className: "rpt-body",
    },

    renderCreateRowModalContent: ({ table, row, internalEditComponents }) => {
      setIsEditable(true);

      return (
        <Stack>
          <Flex className="mrt-model-title">
            <Title order={4}>Create New Security Characteristics</Title>
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
              <Grid.Col span={3} key={index}>{" "}{component}</Grid.Col>
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
            <Title order={4}>Edit Security Characteristics</Title>
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
              <Grid.Col span={3} key={index}>{" "}{component}</Grid.Col>
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
              createRow(table, getSecurityCharacteristicsDefaultVal));
          }}
          disabled={finalData?.length > 0 ? false : true}
          className="rpt-action-button"
        >
          Create New Security Characteristics
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
          excelData={FRPCHARExcel}
          reportName="Security Characteristics"
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

    state: {
      isLoading: isLoadingSecurityChar,
      isSaving:
        isCreatingSecurityChar ||
        isUpdatingSecurityChar ||
        isDeletingSecurityChar ||
        isUpdatingSecurityCharExcel,
      showAlertBanner: isLoadingSecurityCharError,
      showProgressBars: isFetchingSecurityChar,
    },
  });


  // Your Modal, rendered outside of the menu
  return (
    <MantineReactTable table={table} />
  );
};

const FrpSecurityChar = () => (
  <ModalsProvider>
    <SecurityCharMTable />
  </ModalsProvider>
);

export default FrpSecurityChar;

const validateRequired = (value: string) => !!value.length;

function validateSecurityChar(securityChar: SecurityCharacteristicsFields) {
  return {
    CID: !validateRequired(securityChar.CID?.toString())
      ? "Field is Required"
      : "",
  };
}
