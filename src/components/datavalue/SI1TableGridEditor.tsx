import React, { useState } from "react";
import {
  MRT_EditActionButtons,
  MantineReactTable,
  type MRT_Row,
  type MRT_TableOptions,
  useMantineReactTable,
  createRow,
} from "mantine-react-table";
import { ActionIcon, Button, Flex, Text, Tooltip, Stack, Title, Divider, Menu, Modal, Grid} from "@mantine/core";
import { CopyIcon, EXPORT_SVG, AiIcon } from "../../svgicons/svgicons.js";
import { modals } from "@mantine/modals";
import { IconEdit, IconTrash, IconPlus, IconRefresh} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FetchAPI, FetchUpdateDeleteAPI, FetchUpdateDeleteAPIExcel} from "../../api.js";
import useClient from "../hooks/useClient.js";
import { useSI1TableGridColumns, SI1TableGridFields } from "./columnTitles/SI1TableGridColumns.tsx";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs
import { mkConfig, generateCsv, download } from "export-to-csv"; //or use your library of choice here

import { compareData } from "../report-components/compareData.js";
import { Import } from "../report-components/Import.js";
import { Export } from "../report-components/Export.js";
import { PredictNumColumn } from "../../aiAgents/PredictNumColumn.js";


export const SI1TableGridEditor = ({ siflag }) => {
  const [finalData, setFinalData] = useState<SI1TableGridFields[]>([]);
  const [excelData, setExcelData] = useState<SI1TableGridFields[]>([]);
  const [isUsingExcelData, setIsUsingExcelData] = useState(false);
  const [isEditAble, setIsEditable] = useState<boolean>(false);

  const client = useClient();
  const delim = process.env.REACT_APP_DELIMITER;
  const benchmarkDemoUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPSI1&filters=SIFLAG(${siflag})`;

  // Unified data fetch using React Query
  const {
      data: fetchedBenchmarkDemo = [],
      isError: isLoadingBenchmarkDemoError,
      isFetching: isFetchingBenchmarkDemo,
      isLoading: isLoadingBenchmarkDemo,
  } = useQuery<SI1TableGridFields[]>({
      queryKey: ["benchmarkDemo", client, siflag], // Add assetNameData to queryKey
      queryFn: async () => {
          const data = await FetchAPI(benchmarkDemoUri);
          
          return data;
      },
      enabled: !!client && !!siflag, // 
  });

  // Determine which data to display
  // Update finalData based on excelData or data
  const keyFields = ["SORI"];
  const alphaFields = ["SORINAME", "TFSEC", "OPT","EXC","CSH","SRT","CATNAME","GINDEX","EXTRA2","SSFCHK","TAXOFFSET","TYP","COLOR","SHORTNAME","BMCOUNTRY","HDX",
    "SI1USER1","SI1USER2","SI1USER3","SI1USER4","SI1USER5","TOTCTG","XPLUGFACTOR","BRCFREQ","GBR_FLAG"];
  const numericFields = ["DAYFACTOR", "SB_TIER"]; // Define numeric fields

  React.useEffect(() => {
    if (isUsingExcelData && excelData.length > 0) {
      setFinalData(
        compareData(
          excelData,
          fetchedBenchmarkDemo,
          keyFields,
          alphaFields,
          numericFields
        )
      );
      setIsUsingExcelData(false); // Switch back to using fetched data
    } else if (fetchedBenchmarkDemo && fetchedBenchmarkDemo.length > 0) {
      setFinalData(fetchedBenchmarkDemo);
    } else if (finalData.length !== 0) {
      // Prevent unnecessary updates
      setFinalData([]);
    }
  }, [excelData, fetchedBenchmarkDemo, siflag]);

  const columns = useSI1TableGridColumns(finalData, setFinalData, isEditAble, client, siflag); // Get Column information

  const queryClient = useQueryClient();
  
  // Mutations
  const { mutateAsync: createBenchmarkDemo, isPending: isCreatingBenchmarkDemo } =
    useMutation({
      mutationFn: async (createdBenchmarkDemo: SI1TableGridFields) => {
        // send the updated data to API function
        const editDataInCSV = `A${delim}${siflag}${delim}${createdBenchmarkDemo.SORI}${delim}${createdBenchmarkDemo.SORINAME}${delim}${createdBenchmarkDemo.TFSEC}
        ${delim}${createdBenchmarkDemo.OPT}${delim}${createdBenchmarkDemo.EXC}${delim}${createdBenchmarkDemo.CSH}${delim}${createdBenchmarkDemo.SRT}
        ${delim}${createdBenchmarkDemo.CATNAME}${delim}${createdBenchmarkDemo.GINDEX}${delim}${createdBenchmarkDemo.EXTRA2}${delim}${createdBenchmarkDemo.SSFCHK}
        ${delim}${createdBenchmarkDemo.TAXOFFSET}${delim}${createdBenchmarkDemo.TYP}${delim}${createdBenchmarkDemo.DAYFACTOR}${delim}${createdBenchmarkDemo.COLOR}
        ${delim}${createdBenchmarkDemo.SHORTNAME}${delim}${createdBenchmarkDemo.BMCOUNTRY}${delim}${createdBenchmarkDemo.HDX}${delim}${createdBenchmarkDemo.SI1USER1}
        ${delim}${createdBenchmarkDemo.SI1USER2}${delim}${createdBenchmarkDemo.SI1USER3}${delim}${createdBenchmarkDemo.SI1USER4}${delim}${createdBenchmarkDemo.SI1USER5}
        ${delim}${createdBenchmarkDemo.SB_TIER}${delim}${createdBenchmarkDemo.TOTCTG}${delim}${createdBenchmarkDemo.XPLUGFACTOR}${delim}${createdBenchmarkDemo.BRCFREQ}
        ${delim}${createdBenchmarkDemo.GBR_FLAG}${delim}${createdBenchmarkDemo.MWRR_FLAG}
      `;
        await FetchUpdateDeleteAPI(
          editDataInCSV.replace(/[\r\n]+/g, "").replace(/\s*\|\s*/g, "|").replace(/\|null\|/g, "||"),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPSI1`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return createBenchmarkDemo;
      },
      onMutate: async (newBenchmarkDemo: SI1TableGridFields) => {
        await queryClient.cancelQueries({
          queryKey: ["benchmarkDemo", client, siflag],
        });

        const previousBenchmarkDemo = queryClient.getQueryData<SI1TableGridFields[]>(
          ["benchmarkDemo", client, siflag]) || [];

        queryClient.setQueryData(
          ["benchmarkDemo", client, siflag], // Use the exact query key
          (old: SI1TableGridFields[] | undefined) => [
            ...(old ?? []),
            { 
                ...newBenchmarkDemo, 
                id: uuidv4(), 
            },
          ]
        );

        return { previousBenchmarkDemo };
      },
    });
  
  const { mutateAsync: updateBenchmarkDemo, isPending: isUpdatingBenchmarkDemo } =
    useMutation({
      mutationFn: async (updatedBenchmarkDemo: SI1TableGridFields) => {
        // send the updated data to API function
        const editDataInCSV = `C${delim}${siflag}${delim}${updatedBenchmarkDemo.SORI}${delim}${updatedBenchmarkDemo.SORINAME}${delim}${updatedBenchmarkDemo.TFSEC}
        ${delim}${updatedBenchmarkDemo.OPT}${delim}${updatedBenchmarkDemo.EXC}${delim}${updatedBenchmarkDemo.CSH}${delim}${updatedBenchmarkDemo.SRT}
        ${delim}${updatedBenchmarkDemo.CATNAME}${delim}${updatedBenchmarkDemo.GINDEX}${delim}${updatedBenchmarkDemo.EXTRA2}${delim}${updatedBenchmarkDemo.SSFCHK}
        ${delim}${updatedBenchmarkDemo.TAXOFFSET}${delim}${updatedBenchmarkDemo.TYP}${delim}${updatedBenchmarkDemo.DAYFACTOR}${delim}${updatedBenchmarkDemo.COLOR}
        ${delim}${updatedBenchmarkDemo.SHORTNAME}${delim}${updatedBenchmarkDemo.BMCOUNTRY}${delim}${updatedBenchmarkDemo.HDX}${delim}${updatedBenchmarkDemo.SI1USER1}
        ${delim}${updatedBenchmarkDemo.SI1USER2}${delim}${updatedBenchmarkDemo.SI1USER3}${delim}${updatedBenchmarkDemo.SI1USER4}${delim}${updatedBenchmarkDemo.SI1USER5}
        ${delim}${updatedBenchmarkDemo.SB_TIER}${delim}${updatedBenchmarkDemo.TOTCTG}${delim}${updatedBenchmarkDemo.XPLUGFACTOR}${delim}${updatedBenchmarkDemo.BRCFREQ}
        ${delim}${updatedBenchmarkDemo.GBR_FLAG}${delim}${updatedBenchmarkDemo.MWRR_FLAG}
       `;
        await FetchUpdateDeleteAPI(
          editDataInCSV.replace(/\s+/g, ""),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPSI1`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return updatedBenchmarkDemo;
      },
      onMutate: async (updatedBenchmarkDemo: SI1TableGridFields) => {
        await queryClient.cancelQueries({ queryKey: ["benchmarkDemo"] });
        const previousSectors = queryClient.getQueryData<SI1TableGridFields[]>(["benchmarkDemo"]);
        queryClient.setQueryData(["benchmarkDemo"], (old: SI1TableGridFields[] = []) =>
          old.map((h) => (h.id === updatedBenchmarkDemo.id ? updatedBenchmarkDemo : h))
        );
        return { previousSectors };
      },
    });

  const { mutateAsync: deleteBenchmarkDemo, isPending: isDeletingBenchmarkDemo } =
    useMutation({
      mutationFn: async ({ bmrkDemographicId, SORI}: {
        bmrkDemographicId: string;
        SORI: string;
      }) => {
        // send the updated data to API function
        const editDataInCSV = `D${delim}${siflag}${delim}${SORI}`;
        await FetchUpdateDeleteAPI(
          editDataInCSV.replace(/[\r\n]+/g, "").replace(/\s*\|\s*/g, "|").replace(/\|null\|/g, "||"),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPSI1`
        ); // delete the sectorInception
        await new Promise((resolve) => setTimeout(resolve, 100)); // Simulated API delay
        return Promise.resolve(bmrkDemographicId);
      },
      onMutate: async ({ bmrkDemographicId }) => {
        await queryClient.cancelQueries({
          queryKey: ["benchmarkDemo", client, siflag],
        });

        const previousBenchmarkDemo = queryClient.getQueryData<SI1TableGridFields[]>(
          ["benchmarkDemo", client, siflag]) || [];

        // Optimistically update the cache by removing the deleted row
        queryClient.setQueryData(
          ["benchmarkDemo", client, siflag],
          (old: SI1TableGridFields[] = []) => {
            const newData = old.filter(
              (h: SI1TableGridFields) => h.id !== bmrkDemographicId
            );
            return newData;
          }
        );

        return { previousBenchmarkDemo };
      },
    });

  // CRUD Handlers
  const handlecreateBenchmarkSectorDemo: MRT_TableOptions<SI1TableGridFields>["onCreatingRowSave"] =
    async ({ values, exitCreatingMode }) => {

      const updatedValues = {
        ...values,
        SORINAME: values.SORINAME?.replace(/\|/g, ''),
        SHORTNAME: values.SHORTNAME?.replace(/\|/g, ''),
        CATNAME: values.CATNAME?.replace(/\|/g, ''),
      };
      // Validate the updated values
      const errors = validateSectorInception(updatedValues);
      if (Object.values(errors).some(Boolean)) {
        return; // If there are validation errors, stop the save operation
      }

      // Save the created values instead of row.original
      await createBenchmarkDemo(updatedValues); // Use values instead of row.original
      exitCreatingMode();
      table.setCreatingRow(null); // Reset editing state
    };

  const handleSaveSectorBenchmark: MRT_TableOptions<SI1TableGridFields>["onEditingRowSave"] =
    async ({ table, values}) => {
    
      const updatedValues = {
        ...values,
        SORINAME: values.SORINAME?.replace(/\|/g, ''),
        SHORTNAME: values.SHORTNAME?.replace(/\|/g, ''),
        CATNAME: values.CATNAME?.replace(/\|/g, ''),
      };
      // Validate the updated values
      const errors = validateSectorInception(updatedValues);
      if (Object.values(errors).some(Boolean)) {
        return; // If there are validation errors, stop the save operation
      }

      // Save the updated values instead of row.original
      await updateBenchmarkDemo(updatedValues); // Use updatedValues instead of row.original

      // Reset the editing state
      table.setEditingRow(null);
    };

  const openDeleteConfirmModal = (row: MRT_Row<SI1TableGridFields>) => {
    modals.openConfirmModal({
      key: `delete-modal-${row.id}`,
      title: `Delete ${siflag === 'I' ? 'Benchmark Demographic' : 'Sector Demographic'}?`,
      children: (
        <Text>
          Delete {row.original.SORINAME} ({row.original.SORI})?
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        deleteBenchmarkDemo({
          bmrkDemographicId: row.original.id,
          SORI: row.original.SORI
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

  const handleExportRows = (rows: MRT_Row<SI1TableGridFields>[]) => {
    const rowData = rows.map(({ original }) => {
      const { id, ...rest } = original; // Exclude 'id' field
      return { ...rest };
    });

    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  interface ExcelDataUpdate {
    (newData: SI1TableGridFields[]): void;
  }

  const handleExcelDataUpdate: ExcelDataUpdate = (newData) => {
    setExcelData(newData); // Update excelData with the uploaded file data
    setIsUsingExcelData(true); // Switch to using Excel data
  };

  // create only records that is requires to update the Table
  const FRPSI1Excel = finalData?.map(
    ({ id, SIFLAG, ...rest }) => ({
      ...rest,
    })
  );

  //  Custom headers for the PDF file
  const PDFheaders = [
    { label: "ID", key: "SORI" },
    { label: "Name", key: "SORINAME" },
    { label: "Calc Type", key: "TFSEC" },
    { label: "Custom Sort", key: "SRT" },
    { label: "Category Name", key: "CATNAME" },
    { label: "Color", key: "COLOR" },
    { label: "Short Name", key: "SHORTNAME" },
  ];

  // Load data from excel to table
  const fieldnames = ["RECDTYPE", "SIFLAG", "SORI", "SORINAME", "TFSEC", "OPT","EXC","CSH","SRT","CATNAME","GINDEX","EXTRA2","SSFCHK","TAXOFFSET","TYP","DAYFACTOR","COLOR","SHORTNAME","BMCOUNTRY","HDX",
    "SI1USER1","SI1USER2","SI1USER3","SI1USER4","SI1USER5","SB_TIER","TOTCTG","XPLUGFACTOR","BRCFREQ","GBR_FLAG"];

  const convertToCSV = (data, siflagValue) => {
    let csv = "";
    data.forEach((row) => {
      let rowData = fieldnames
        .map((field) => {
          // Special handling for SIFLAG
          if (field === "SIFLAG") {
            return siflagValue || ""; // Use the provided value or empty if undefined
          }
          
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

  const { mutateAsync: updateBenchmarkDemoExcel, isPending: isUpdatingBenchmarkDemoExcel } =
    useMutation({
      mutationFn: async () => {
        // send the updated data to API function
        await FetchUpdateDeleteAPIExcel(
          convertToCSV(finalData, siflag),
          `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPSI1`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return Promise.resolve();
      },
      onMutate: async () => {},
    });

  const handleMRELoad = async () => {
    await updateBenchmarkDemoExcel();
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
    mantineToolbarAlertBannerProps: isLoadingBenchmarkDemoError
      ? { color: "red", children: "Failed to load data. Update your selection criteria." }
      : undefined,
    // onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handlecreateBenchmarkSectorDemo,
    // onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveSectorBenchmark,
    enableRowActions: true,

    mantineTableBodyCellProps: { 
      className: "rpt-body",
    },

    renderCreateRowModalContent: ({ table, row, internalEditComponents }) => {
      setIsEditable(true);

      return (
        <Stack>
          <Flex className="mrt-model-title">
            <Title order={4}>Create New Benchmark Demographic</Title>
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
            <Title order={4}>Edit Benchmark Demographic</Title>
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
    //   columnVisibility: {
    //     MWRR_FLAG: siflag === 'I' ? false : true, // hide for Benchmark Editor
    //     OPT: siflag === 'I' ? false : true, // hide for Benchmark Editor
    //   }
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
                SORI: "",
                SORINAME: "",
                RECDTYPE: "A",
                SIFLAG: "",
                TFSEC: "",
                OPT: "",
                EXC: "",
                CSH: "",
                SRT: "",
                CATNAME: "",
                GINDEX: "",
                EXTRA2: "",
                SSFCHK: "",
                TAXOFFSET: "",
                TYP: "",
                DAYFACTOR: 0,
                COLOR: "",
                SHORTNAME: "",
                BMCOUNTRY: "",
                HDX: "",
                SI1USER1: "",
                SI1USER2: "",
                SI1USER3: "",
                SI1USER4: "",
                SI1USER5: "",
                SB_TIER: 0,
                TOTCTG: "",
                XPLUGFACTOR: "",
                BRCFREQ: "",
                GBR_FLAG: "",
                MWRR_FLAG: "",
              })
            );
          }}
          disabled={finalData?.length > 0 ? false : true}
          className="rpt-action-button"
        >
          Create New Benchmark Demographic
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
          excelData={FRPSI1Excel}
          reportName={siflag === 'I' ? "Benchmark Demographics" : "Sector Demographic"}
          PDFheaders={PDFheaders}
          portfolioName=" "
          dateRange=" "
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
      isLoading: isLoadingBenchmarkDemo,
      isSaving:
        isCreatingBenchmarkDemo ||
        isUpdatingBenchmarkDemo ||
        isDeletingBenchmarkDemo ||
        isUpdatingBenchmarkDemoExcel,
      showAlertBanner: isLoadingBenchmarkDemoError,
      showProgressBars: isFetchingBenchmarkDemo,
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

const validateRequired = (value: string) => !!value.length;

function validateSectorInception(sectorInception: SI1TableGridFields) {
  return {
    SORI: !validateRequired(sectorInception.SORI?.toString())
      ? "Field is Required"
      : "",
  };
}
