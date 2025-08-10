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
import { useSectorInceptionColumns, SectorInceptionFields } from "../columnTitles/SectorInceptionColumns.tsx";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs
import { mkConfig, generateCsv, download } from "export-to-csv"; //or use your library of choice here

import { compareData } from "../../report-components/compareData.js";
import { Import } from "../../report-components/Import.js";
import { Export } from "../../report-components/Export.js";
import { useAccountName, useCountryDDL, useSectorName } from "../../hooks/useFrpNamesFiltersDDLsApi.js";
import { formatDateYYMD, formatFromDateYYMD, formatToDateYYMMDD } from "../../hooks/FormatDates.tsx";

type DateRange = string[];

type OutletContextType = {
  selectedPortfolio: string;
  setSelectedPortfolio: (portfolio: string) => void;
  dateRange: DateRange;
};

const SectorInceptionMTable = () => {
  const [finalData, setFinalData] = useState<SectorInceptionFields[]>([]);
  const [excelData, setExcelData] = useState<SectorInceptionFields[]>([]);
  const [isUsingExcelData, setIsUsingExcelData] = useState(false);
  const [isEditAble, setIsEditable] = useState<boolean>(false);

  const client = useClient();
  const delim = process.env.REACT_APP_DELIMITER;

  const { selectedPortfolio, setSelectedPortfolio } =  useOutletContext<OutletContextType>();
  const { dateRange } = useOutletContext<OutletContextType>();
  const fromDate = formatFromDateYYMD(dateRange as [string, string]) ;
  const toDate = formatToDateYYMMDD(dateRange as [string, string]) ;
  
  const { data: accountNameData } = useAccountName(selectedPortfolio, client); // Fetch account name data
  const { data: contryNameData } = useCountryDDL(client); // Fetch country name data
  const { data: sectorNameData } = useSectorName(client); // Fetch sector name data
  
  const sectorICPUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPSICP&filters=ACCT(${selectedPortfolio});SICP_DATE(GT:${fromDate}:AND:SICP_DATE:LE:${toDate})`;

  // Unified data fetch using React Query
  const {
      data: fetchedSectorInception = [],
      isError: isLoadingSectorInceptionError,
      isFetching: isFetchingSectorInception,
      isLoading: isLoadingSectorInception,
  } = useQuery<SectorInceptionFields[]>({
      queryKey: ["sectorInception", selectedPortfolio, dateRange, client, accountNameData, contryNameData, sectorNameData], // Add assetNameData to queryKey
      queryFn: async () => {
          const data = await FetchAPI(sectorICPUri);
          
          return data.map((row) => {
              // Account name matching
              const matchedAccount = accountNameData?.find(account => account.ACCT === row.ACCT);
              const matchedAccountName = matchedAccount?.NAME === undefined ? "Name Not Defined" : matchedAccount?.NAME;

              // Country name matching
              const matchedCountry = contryNameData?.find(country => country.COUNTRY === row.COUNTRY);
              const matchedCountryName = matchedCountry?.CNAME === undefined ? "Country Not Defined" : matchedCountry?.CNAME;

              // Sector name matching
              const matchedSector = sectorNameData?.find(sector => sector.SORI === row.SECTOR);
              const matchedSectorName = matchedSector?.SORINAME === undefined ? "Sector Not Defined" : matchedSector?.SORINAME;
              
              return {
                  ...row,
                  id: row.id || uuidv4(),
                  NAME: matchedAccountName, // add NAME field conditionally
                  CNAME: matchedCountryName, // add CNAME field conditionally
                  SORINAME: matchedSectorName, // add SORINAME field conditionally
              };
          });
      },
      enabled: !!selectedPortfolio && !!dateRange && !!client && !!accountNameData && !!contryNameData && !!sectorNameData, // Add assetNameData to enabled condition
  });

  // Determine which data to display
  // const data = isUsingExcelData ? excelData : fetchedSectorInception;
  // Update finalData based on excelData or data
  const keyFields = ["ACCT", "COUNTRY", "SECTOR", "SICP_DATE"];
  const alphaFields = [];
  const numericFields = []; // Define numeric fields

  React.useEffect(() => {
    if (isUsingExcelData && excelData.length > 0) {
      setFinalData(
        compareData(
          excelData,
          fetchedSectorInception,
          keyFields,
          alphaFields,
          numericFields
        )
      );
      setIsUsingExcelData(false); // Switch back to using fetched data
      setSelectedPortfolio(excelData[0]?.ACCT);
    } else if (fetchedSectorInception && fetchedSectorInception.length > 0) {
      setFinalData(fetchedSectorInception);
    } else if (finalData.length !== 0) {
      // Prevent unnecessary updates
      setFinalData([]);
    }
  }, [excelData, fetchedSectorInception]);

  const portfolioName = finalData[0]?.NAME + ` (${finalData[0]?.ACCT})`; // used for PDF output

  const columns = useSectorInceptionColumns(finalData); // Get Column information

  const queryClient = useQueryClient();
  // Mutations
  const { mutateAsync: createSectorInception, isPending: isCreatingSectorInception } =
    useMutation({
      mutationFn: async (createdSectorInception: SectorInceptionFields) => {
        // send the updated data to API function
        const editDataInCSV = `A${delim}${createdSectorInception.ACCT}${delim}${createdSectorInception.COUNTRY}
        ${delim}${createdSectorInception.SECTOR}${delim}${createdSectorInception.SICP_DATE?.toString().replace(/\//g, "").replace(/-/g, "")}
      `;
        await FetchUpdateDeleteAPI(
          editDataInCSV.replace(/[\r\n]+/g, "").replace(/\s*\|\s*/g, "|").replace(/\|null\|/g, "||"),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPSICP`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return createSectorInception;
      },
      onMutate: async (newSectorInception: SectorInceptionFields) => {
        await queryClient.cancelQueries({
          queryKey: ["sectorInception", selectedPortfolio, dateRange, client, accountNameData, contryNameData, sectorNameData],
        });

        const previousSectorInception = queryClient.getQueryData<SectorInceptionFields[]>(["sectorInception", selectedPortfolio, dateRange, client, accountNameData, contryNameData, sectorNameData]) || [];

        queryClient.setQueryData(
          ["sectorInception", selectedPortfolio, dateRange, client, accountNameData, contryNameData, sectorNameData], // Use the exact query key
          (old: SectorInceptionFields[] | undefined) => [
            ...(old ?? []),
            { 
                ...newSectorInception, 
                id: uuidv4(), 
                NAME: accountNameData?.find(account => account.ACCT === newSectorInception.ACCT)?.NAME || "Name Not Defined",
                CNAME: contryNameData?.find(country => country.COUNTRY === newSectorInception.COUNTRY)?.CNAME || "Country Not Defined",
                SORINAME: sectorNameData?.find(sector => sector.SORI === newSectorInception.SECTOR)?.SNAME || "Sector Not Defined",
            },
          ]
        );

        return { previousSectorInception };
      },
    });

  const { mutateAsync: deleteSectorInception, isPending: isDeletingSectorInception } =
    useMutation({
      mutationFn: async ({ sectorInceptionId, ACCT, COUNTRY, SECTOR, SICP_DATE}: {
        sectorInceptionId: string;
        ACCT: string;
        COUNTRY: string;
        SECTOR: string;
        SICP_DATE: string;
      }) => {
        // send the updated data to API function
        const editDataInCSV = `D${delim}${ACCT}${delim}${COUNTRY}${delim}${SECTOR}${delim}${SICP_DATE?.toString().replace(/\//g, "").replace(/-/g, "")}`;
        await FetchUpdateDeleteAPI(
          editDataInCSV.replace(/[\r\n]+/g, "").replace(/\s*\|\s*/g, "|").replace(/\|null\|/g, "||"),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPSICP`
        ); // delete the sectorInception
        await new Promise((resolve) => setTimeout(resolve, 100)); // Simulated API delay
        return Promise.resolve(sectorInceptionId);
      },
      onMutate: async ({ sectorInceptionId }) => {
        await queryClient.cancelQueries({
          queryKey: ["sectorInception", selectedPortfolio, dateRange, client, accountNameData, contryNameData, sectorNameData],
        });

        const previousSectorInception = queryClient.getQueryData<SectorInceptionFields[]>(["sectorInception", selectedPortfolio, dateRange, client, accountNameData, contryNameData, sectorNameData]) || [];

        // Optimistically update the cache by removing the deleted row
        queryClient.setQueryData(
          ["sectorInception", selectedPortfolio, dateRange, client, accountNameData, contryNameData, sectorNameData],
          (old: SectorInceptionFields[] = []) => {
            const newData = old.filter(
              (h: SectorInceptionFields) => h.id !== sectorInceptionId
            );
            return newData;
          }
        );

        return { previousSectorInception };
      },
    });

  // CRUD Handlers
  const handleCreateSectorInception: MRT_TableOptions<SectorInceptionFields>["onCreatingRowSave"] =
    async ({ values, exitCreatingMode }) => {

      const formattedValues = {
        ...values,
        SICP_DATE: values.SICP_DATE === "" || null ? "19001201" : formatDateYYMD(values.SICP_DATE),
      };

      // Validate the updated values
      const errors = validateSectorInception(formattedValues);
      if (Object.values(errors).some(Boolean)) {
        return; // If there are validation errors, stop the save operation
      }

      // Save the created values instead of row.original
      await createSectorInception(formattedValues); // Use values instead of row.original
      exitCreatingMode();
      table.setCreatingRow(null); // Reset editing state
    };

  const handleSaveSectorInception: MRT_TableOptions<SectorInceptionFields>["onEditingRowSave"] =
    async ({ table, values, row }) => {

      const formattedValues = {
        ...values,
        SICP_DATE: values.SICP_DATE === "" || null ? "19001201" : formatDateYYMD(values.SICP_DATE),
      };
      // Validate the updated values
      const errors = validateSectorInception(formattedValues);
      if (Object.values(errors).some(Boolean)) {
        return; // If there are validation errors, stop the save operation
      }
      
      // Delete the old row
      await deleteSectorInception({
          sectorInceptionId: row.original.id,
          ACCT: row.original.ACCT,
          COUNTRY: row.original.COUNTRY,
          SECTOR: row.original.SECTOR,
          SICP_DATE: row.original.SICP_DATE.toString()
        });

        // Since the all Field of Sector Inception is key fields, we can't update the key fields
        // so we need to create a new row with the updated values
        await createSectorInception(formattedValues); // Use values instead of row.original

      // Reset the editing state
      table.setEditingRow(null);
    };

  const openDeleteConfirmModal = (row: MRT_Row<SectorInceptionFields>) => {
    modals.openConfirmModal({
      key: `delete-modal-${row.id}`,
      title: "Delete Sector Inception?",
      children: (
        <Text>
          Delete {row.original.NAME} ({row.original.ACCT}) and As Of Date ({row.original.SICP_DATE?.toString()})?
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        deleteSectorInception({
          sectorInceptionId: row.original.id,
          ACCT: row.original.ACCT,
          COUNTRY: row.original.COUNTRY,
          SECTOR: row.original.SECTOR,
          SICP_DATE: row.original.SICP_DATE.toString()
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

  const handleExportRows = (rows: MRT_Row<SectorInceptionFields>[]) => {
    const rowData = rows.map(({ original }) => {
      const { id, ...rest } = original; // Exclude 'id' field
      return {
        ...rest,
        SICP_DATE: rest.SICP_DATE.toString(), // Convert ADATE to string
      };
    });

    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  interface ExcelDataUpdate {
    (newData: SectorInceptionFields[]): void;
  }

  const handleExcelDataUpdate: ExcelDataUpdate = (newData) => {
    setExcelData(newData); // Update excelData with the uploaded file data
    setIsUsingExcelData(true); // Switch to using Excel data
  };

  // create only records that is requires to update the Table
  const FRPSICPExcel = finalData?.map(
    ({ id, NAME, CNAME, SORINAME, ...rest }) => ({
      ...rest,
    })
  );

  //  Custom headers for the PDF file
  const PDFheaders = [
    { label: "Country", key: "COUNTRY" },
    { label: "Country Name", key: "CNAME" },
    { label: "Sector", key: "SECTOR" },
    { label: "Sector Name", key: "SORINAME" },
    { label: "Sector Inception Date", key: "SICP_DATE" },
  ];

  // Load data from excel to table
  const fieldnames = ["RECDTYPE", "ACCT", "COUNTRY", "SECTOR", "SICP_DATE"];

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

  const { mutateAsync: updateSectorInceptionExcel, isPending: isUpdatingSectorInceptionExcel } =
    useMutation({
      mutationFn: async () => {
        // send the updated data to API function
        await FetchUpdateDeleteAPIExcel(
          convertToCSV(finalData),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPSICP`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return Promise.resolve();
      },
      onMutate: async () => {},
    });

  const handleMRELoad = async () => {
    await updateSectorInceptionExcel();
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
    mantineToolbarAlertBannerProps: isLoadingSectorInceptionError
      ? { color: "red", children: "Failed to load data. Update your selection criteria." }
      : undefined,
    // onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateSectorInception,
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
            <Title order={4}>Create New Sector Inception</Title>
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
            <Title order={4}>Edit Sector Inception</Title>
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
                SICP_DATE: formatDateYYMD(new Date().toISOString()),
                COUNTRY: "",
                CNAME: "",
                SECTOR: "",
                SORINAME: "",
                RECDTYPE: "A",
              })
            );
          }}
          disabled={finalData?.length > 0 ? false : true}
          className="rpt-action-button"
        >
          Create New Sector Inception
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
          excelData={FRPSICPExcel}
          reportName="Sector Inception"
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
      isLoading: isLoadingSectorInception,
      isSaving:
        isCreatingSectorInception ||
        isDeletingSectorInception ||
        isUpdatingSectorInceptionExcel,
      showAlertBanner: isLoadingSectorInceptionError,
      showProgressBars: isFetchingSectorInception,
    },
  });


  // Your Modal, rendered outside of the menu
  return (
    <MantineReactTable table={table} />
  );
};

const FrpSectorIcp = () => (
  <ModalsProvider>
    <SectorInceptionMTable />
  </ModalsProvider>
);

export default FrpSectorIcp;

const validateRequired = (value: string) => !!value.length;

function validateSectorInception(sectorInception: SectorInceptionFields) {
  return {
    ACCT: !validateRequired(sectorInception.ACCT?.toString())
      ? "Field is Required"
      : "",
  };
}
