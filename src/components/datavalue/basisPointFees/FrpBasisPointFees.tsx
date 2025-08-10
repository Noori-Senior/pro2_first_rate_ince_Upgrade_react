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
import { useBasisPointFeesColumns, BasisPointFeesFields } from "../columnTitles/BasisPointFeesColumns.tsx";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs
import { mkConfig, generateCsv, download } from "export-to-csv"; //or use your library of choice here

import { compareData } from "../../report-components/compareData.js";
import { Import } from "../../report-components/Import.js";
import { Export } from "../../report-components/Export.js";
import { PredictNumColumn } from "../../../aiAgents/PredictNumColumn.js";
import { formatDateYYM, formatFromDateYYM, formatToDateYYM } from "../../hooks/FormatDates.tsx";
import { useAccountName, useSectorName } from "../../hooks/useFrpNamesFiltersDDLsApi.js";

type DateRange = string[];

type OutletContextType = {
  selectedPortfolio: string;
  setSelectedPortfolio: (portfolio: string) => void;
  dateRange: DateRange;
};

const BasisPointFeesMTable = () => {
  const [finalData, setFinalData] = useState<BasisPointFeesFields[]>([]);
  const [excelData, setExcelData] = useState<BasisPointFeesFields[]>([]);
  const [isUsingExcelData, setIsUsingExcelData] = useState(false);
  const [isEditAble, setIsEditable] = useState<boolean>(false);

  const client = useClient();
  const delim = process.env.REACT_APP_DELIMITER;

  const { selectedPortfolio, setSelectedPortfolio } =  useOutletContext<OutletContextType>();
  const { dateRange } = useOutletContext<OutletContextType>();
  const fromDate = formatFromDateYYM(dateRange as [string, string]) ;
  const toDate = formatToDateYYM(dateRange as [string, string]) ;

  const { data: accountNameData } = useAccountName(selectedPortfolio, client); // Fetch account name data
  const { data: sectorNameData } = useSectorName(client); // Fetch sector name data

  const basisPointFeeUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPBPFEE&filters=ACCT(${selectedPortfolio});BPDATE(GT:${fromDate}:AND:BPDATE:LE:${toDate})`;

  // Unified data fetch using React Query
  const {
    data: fetchedBasisPointFees = [],
    isError: isLoadingBasisPointFeesError,
    isFetching: isFetchingBasisPointFees,
    isLoading: isLoadingBasisPointFees,
  } = useQuery<BasisPointFeesFields[]>({
    queryKey: ["basisPointFees", selectedPortfolio, dateRange, client, accountNameData, sectorNameData],
    queryFn: async () => {
      const data = await FetchAPI(basisPointFeeUri);
      
      return data.map((row) => {
          // Account name matching
          const matchedAccount = accountNameData?.find(account => account.ACCT === row.ACCT);
          const matchedAccountName = matchedAccount?.NAME === undefined ? "Name Not Defined" : matchedAccount?.NAME;
          
          // Sector name matching - assuming sectorNameData is an array
          const matchedSector1 = sectorNameData?.find(sector => sector.SORI === row.GROSS_SECTOR);
          const matchedSectorName1 = matchedSector1?.SORINAME === undefined ? "Name Not Defined" : matchedSector1?.SORINAME;
          
          // Sector name matching - assuming sectorNameData is an array
          const matchedSector2 = sectorNameData?.find(sector2 => sector2.SORI === row.NET_SECTOR);
          const matchedSectorName2 = matchedSector2?.SORINAME === undefined ? "Name Not Defined" : matchedSector2?.SORINAME;
          
          return {
              ...row,
              id: row.id || uuidv4(),
              NAME: matchedAccountName, // add NAME field conditionally
              GSNAME: matchedSectorName1, // add SNAME1 field conditionally
              NSNAME: matchedSectorName2, // add SNAME2 field conditionally
          };
      });
    },
    enabled: !!selectedPortfolio && !!client && !!accountNameData && !!sectorNameData,
    refetchOnWindowFocus: false,
  });

  // Determine which data to display
  // const data = isUsingExcelData ? excelData : fetchedBasisPointFees;
  // Update finalData based on excelData or data
  const keyFields = ["ACCT", "GROSS_SECTOR", "NET_SECTOR", "BPDATE"];
  const nonKeyFields = [ "BPACTIVE"];
  const numericFields = ["ANN_BP_FEE"]; // Define numeric fields

  React.useEffect(() => {
    if (isUsingExcelData && excelData.length > 0) {
      setFinalData(
        compareData(
          excelData,
          fetchedBasisPointFees,
          keyFields,
          nonKeyFields,
          numericFields
        )
      );
      setIsUsingExcelData(false); // Switch back to using fetched data
      setSelectedPortfolio(excelData[0]?.ACCT);
    } else if (fetchedBasisPointFees && fetchedBasisPointFees.length > 0) {
      setFinalData(fetchedBasisPointFees);
    } else if (finalData.length !== 0) {
      // Prevent unnecessary updates
      setFinalData([]);
    }
  }, [excelData, fetchedBasisPointFees]);

  const portfolioName = finalData[0]?.NAME + ` (${finalData[0]?.ACCT})`; // used for PDF output

  const columns = useBasisPointFeesColumns(finalData, setFinalData, isEditAble); // Get Column information

  const queryClient = useQueryClient();
  // Mutations
  const { mutateAsync: createBasisPointFees, isPending: isCreatingBasisPointFees } =
    useMutation({
      mutationFn: async (createdBasisPointFees: BasisPointFeesFields) => {
        // send the updated data to API function
        const editDataInCSV = `A${delim}${createdBasisPointFees.ACCT}${delim}${createdBasisPointFees.GROSS_SECTOR}${delim}${createdBasisPointFees.NET_SECTOR}
        ${delim}${createdBasisPointFees.BPDATE?.toString().replace(/\//g, "")}${delim}${createdBasisPointFees.ANN_BP_FEE}${delim}${createdBasisPointFees.BPACTIVE}
      `;
        await FetchUpdateDeleteAPI(
          editDataInCSV.replace(/[\r\n]+/g, "").replace(/\s*\|\s*/g, "|").replace(/\|null\|/g, "||"),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPBPFEE`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return createBasisPointFees;
      },
      onMutate: async (newBasisPointFees: BasisPointFeesFields) => {
        await queryClient.cancelQueries({
          queryKey: ["basisPointFees", selectedPortfolio, dateRange, client, accountNameData, sectorNameData],
        });

        const previousBasisPointFees = queryClient.getQueryData<BasisPointFeesFields[]>(["basisPointFees", selectedPortfolio, dateRange, client, accountNameData, sectorNameData]) || [];

        queryClient.setQueryData(
          ["basisPointFees", selectedPortfolio, dateRange, client, accountNameData, sectorNameData], // Use the exact query key
          (old: BasisPointFeesFields[] | undefined) => [
            ...(old ?? []),
            { 
              ...newBasisPointFees, 
              id: uuidv4(),
              NAME: accountNameData?.find(account => account.ACCT === newBasisPointFees.ACCT)?.NAME || "Name Not Defined",
              GSNAME: sectorNameData?.find(sector => sector.SORI === newBasisPointFees.GROSS_SECTOR)?.SORINAME || "Name Not Defined",
              NSNAME: sectorNameData?.find(sector => sector.SORI === newBasisPointFees.NET_SECTOR)?.SORINAME || "Name Not Defined",
            },
          ]
        );

        return { previousBasisPointFees };
      },
    });

  const { mutateAsync: updateBasisPointFee, isPending: isUpdatingBasisPointFee } =
    useMutation({
      mutationFn: async (updatedBasisPointFees: BasisPointFeesFields) => {
        // send the updated data to API function
        const editDataInCSV = `C${delim}${updatedBasisPointFees.ACCT}${delim}${updatedBasisPointFees.GROSS_SECTOR}${delim}${updatedBasisPointFees.NET_SECTOR}
        ${delim}${updatedBasisPointFees.BPDATE?.toString().replace(/\//g, "")}${delim}${updatedBasisPointFees.ANN_BP_FEE}${delim}${updatedBasisPointFees.BPACTIVE}
      `;
        await FetchUpdateDeleteAPI(
          editDataInCSV.replace(/[\r\n]+/g, "").replace(/\s*\|\s*/g, "|").replace(/\|null\|/g, "||"),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPBPFEE`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return updatedBasisPointFees;
      },
      onMutate: async (updatedBasisPointFee: BasisPointFeesFields) => {
        await queryClient.cancelQueries({ queryKey: ["basisPointFees"] });
        const previousBasisPointFees = queryClient.getQueryData<BasisPointFeesFields[]>(["basisPointFees"]);
        queryClient.setQueryData(["basisPointFees"], (old: BasisPointFeesFields[] = []) =>
          old.map((h) => (h.id === updatedBasisPointFee.id ? updatedBasisPointFee : h))
        );
        return { previousBasisPointFees };
      },
    });

  const { mutateAsync: deleteBasisPointFee, isPending: isDeletingBasisPointFee } =
    useMutation({
      mutationFn: async ({ basisPointFeeId, ACCT, GROSS_SECTOR, NET_SECTOR, BPDATE}: {
        basisPointFeeId: string;
        ACCT: string;
        GROSS_SECTOR: string;
        NET_SECTOR: string;
        BPDATE: string;
      }) => {
        // send the updated data to API function
        const editDataInCSV = `D${delim}${ACCT}${delim}${GROSS_SECTOR}${delim}${NET_SECTOR}${delim}${BPDATE?.toString().replace(/\//g, "")}`;
        await FetchUpdateDeleteAPI(
          editDataInCSV.replace(/[\r\n]+/g, "").replace(/\s*\|\s*/g, "|").replace(/\|null\|/g, "||"),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPBPFEE`
        ); // delete the Basis Point Fee
        await new Promise((resolve) => setTimeout(resolve, 100)); // Simulated API delay
        return Promise.resolve(basisPointFeeId);
      },
      onMutate: async ({ basisPointFeeId }) => {
        await queryClient.cancelQueries({
          queryKey: ["basisPointFees", selectedPortfolio, dateRange, client, accountNameData, sectorNameData],
        });

        const previousBasisPointFees = queryClient.getQueryData<BasisPointFeesFields[]>(["basisPointFees", selectedPortfolio, dateRange, client, accountNameData, sectorNameData]);

        // Optimistically update the cache by removing the deleted row
        queryClient.setQueryData(
          ["basisPointFees", selectedPortfolio, dateRange, client, accountNameData, sectorNameData],
          (old: BasisPointFeesFields[] = []) => {
            const newData = old.filter(
              (h: BasisPointFeesFields) => h.id !== basisPointFeeId
            );
            return newData;
          }
        );

        return { previousBasisPointFees };
      },
    });

  // CRUD Handlers
  const handleCreateBasisPointFee: MRT_TableOptions<BasisPointFeesFields>["onCreatingRowSave"] =
    async ({ values, exitCreatingMode }) => {
      // Format DATES as expected date before saving
      const formattedValues = {
        ...values,
        BPDATE: values.BPDATE === "" || null ? "190012" : formatDateYYM(values.BPDATE),
      };
      // Validate the updated values
      const errors = validateBasisPointFee(values);
      if (Object.values(errors).some(Boolean)) {
        return; // If there are validation errors, stop the save operation
      }

      // Save the created values instead of row.original
      await createBasisPointFees(formattedValues); // Use values instead of row.original
      exitCreatingMode();
      table.setCreatingRow(null); // Reset editing state
    };

  const handleSaveBasisPointFee: MRT_TableOptions<BasisPointFeesFields>["onEditingRowSave"] =
    async ({ table, values }) => {
        console.log("values", values);
      // Format DATES as expected date before saving
      const formattedValues = {
        ...values,
        BPDATE: formatDateYYM(values.BPDATE),
      };

      // Validate the updated values
      const errors = validateBasisPointFee(values);
      if (Object.values(errors).some(Boolean)) {
        return; // If there are validation errors, stop the save operation
      }

      // Save the updated values instead of row.original
      await updateBasisPointFee(formattedValues); // Use values instead of row.original

      // Reset the editing state
      table.setEditingRow(null);
    };

  const openDeleteConfirmModal = (row: MRT_Row<BasisPointFeesFields>) => {
    modals.openConfirmModal({
      key: `delete-modal-${row.id}`,
      title: "Delete Basis Point Fee?",
      children: (
        <Text>
          Delete {row.original.NAME} ({row.original.ACCT}), GROSS_SECTOR ({row.original.GROSS_SECTOR}), NET_SECTOR ({row.original.NET_SECTOR}), and BPDATE ({row.original.BPDATE})?
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        deleteBasisPointFee({
          basisPointFeeId: row.original.id,
          ACCT: row.original.ACCT,
          GROSS_SECTOR: row.original.GROSS_SECTOR,
          NET_SECTOR: row.original.NET_SECTOR,
          BPDATE: row.original.BPDATE,
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

  const handleExportRows = (rows: MRT_Row<BasisPointFeesFields>[]) => {
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
    (newData: BasisPointFeesFields[]): void;
  }

  const handleExcelDataUpdate: ExcelDataUpdate = (newData) => {
    setExcelData(newData); // Update excelData with the uploaded file data
    setIsUsingExcelData(true); // Switch to using Excel data
  };

  // create only records that is requires to update the Table
  const FRPBPFEEExcel = finalData?.map(
    ({ id, NAME, GSNAME, NSNAME, ...rest }) => ({
      ...rest,
    })
  );

  //  Custom headers for the PDF file
  const PDFheaders = [
    { label: "Gross Sector ID", key: "GROSS_SECTOR" },
    { label: "Gross Sector Name", key: "GSNAME" },
    { label: "Net Sector ID", key: "NET_SECTOR" },
    { label: "Net Sector Name", key: "NSNAME" },
    { label: "Activation Date", key: "BPDATE" },
    { label: "Annual BP Fee", key: "ANN_BP_FEE", align: "right" },
    { label: "Active", key: "BPACTIVE" },
  ];

  // Load data from excel to table
  const fieldnames = ["RECDTYPE", "ACCT", "GROSS_SECTOR", "NET_SECTOR", "BPDATE", "ANN_BP_FEE",  "BPACTIVE"];

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

  const { mutateAsync: updateBasisPointFeeExcel, isPending: isUpdatingBasisPointFeeExcel } =
    useMutation({
      mutationFn: async () => {
        // send the updated data to API function
        await FetchUpdateDeleteAPIExcel(
          convertToCSV(finalData),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPBPFEE`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return Promise.resolve();
      },
      onMutate: async () => {},
    });

  const handleMRELoad = async () => {
    await updateBasisPointFeeExcel();
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
    mantineToolbarAlertBannerProps: isLoadingBasisPointFeesError
      ? { color: "red", children: "Failed to load data. Update your selection criteria." }
      : undefined,
    // onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateBasisPointFee,
    // onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveBasisPointFee,
    enableRowActions: true,

    mantineTableBodyCellProps: { 
      className: "rpt-body",
    },

    renderCreateRowModalContent: ({ table, row, internalEditComponents }) => {
      setIsEditable(true);

      return (
        <Stack>
          <Flex className="mrt-model-title">
            <Title order={4}>Create New BP Fee</Title>
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
            <Title order={4}>Edit Basis Point Fees</Title>
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
                GROSS_SECTOR: "",
                NET_SECTOR: "",
                BPDATE: new Date().toISOString(),
                ANN_BP_FEE: 0,
                RECDTYPE: "A",
                GSNAME: "",
                NSNAME: "",
                NAME: "",
                BPACTIVE: "N",
              })
            );
          }}
          disabled={finalData?.length > 0 ? false : true}
          className="rpt-action-button"
        >
          Create New BP Fee
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
          excelData={FRPBPFEEExcel}
          reportName="Basis Point Fees"
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
      isLoading: isLoadingBasisPointFees,
      isSaving:
        isCreatingBasisPointFees ||
        isUpdatingBasisPointFee ||
        isDeletingBasisPointFee ||
        isUpdatingBasisPointFeeExcel,
      showAlertBanner: isLoadingBasisPointFeesError,
      showProgressBars: isFetchingBasisPointFees,
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

const FrpBasisPointFees = () => (
  <ModalsProvider>
    <BasisPointFeesMTable />
  </ModalsProvider>
);

export default FrpBasisPointFees;

const validateRequired = (value: string) => !!value.length;

function validateBasisPointFee(basisPointFee: BasisPointFeesFields) {
  return {
    AACCT: validateRequired(basisPointFee.ACCT) ? "" : "Portfolio ID is required",
  };
}
