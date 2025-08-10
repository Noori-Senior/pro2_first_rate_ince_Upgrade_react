import React, { useState } from 'react';
import { MRT_EditActionButtons, MantineReactTable, type MRT_Row, type MRT_TableOptions, useMantineReactTable, createRow } from 'mantine-react-table';
import { ActionIcon, Button, Flex, Text, Tooltip, Divider, Menu, Modal, Stack, Title, Grid } from '@mantine/core';
import { CopyIcon, EXPORT_SVG, AiIcon } from '../../../svgicons/svgicons.js';
import { ModalsProvider, modals } from '@mantine/modals';
import { IconEdit, IconTrash, IconPlus, IconRefresh } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FetchAPI, FetchUpdateDeleteAPI, FetchUpdateDeleteAPIExcel } from '../../../api.js';
import useClient from '../../hooks/useClient.js';
import { useSecurityColumns } from '../columnTitles/SecurityColumns.tsx';
import { SecurityFields, SecurityDefaults } from '../columnTitles/SecurityDDL.tsx';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import { mkConfig, generateCsv, download } from 'export-to-csv'; //or use your library of choice here

import { compareData } from '../../report-components/compareData.js';
import { Import } from '../../report-components/Import.js';
import { Export } from '../../report-components/Export.js';
import { PredictNumColumn } from '../../../aiAgents/PredictNumColumn.js';
import { formatDateYYMD } from '../../hooks/FormatDates.tsx';


const SecuritiesMTable = () => {

  const [finalData, setFinalData] = useState<SecurityFields[]>([]);
  const [excelData, setExcelData] = useState<SecurityFields[]>([]);
  const [isUsingExcelData, setIsUsingExcelData] = useState(false);
  const [isEditAble, setIsEditable] = useState<boolean>(false);

  const client = useClient();
  const delim = process.env.REACT_APP_DELIMITER;
  
  const lsecurityUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPSEC`;

  // Unified data fetch using React Query
  const {
    data: fetchedSecurity = [],
    isError: isLoadingSecurityError,
    isFetching: isFetchingSecurity,
    isLoading: isLoadingSecurity,
  } = useQuery<SecurityFields[]>({
    queryKey: ['security', client],
    queryFn: async () => {
      const data = await FetchAPI(lsecurityUri);
      return data.map(row => ({
        ...row,
        id: row.id || uuidv4(), // Add UUID here
      }));
    },
    enabled: !!client,
    refetchOnWindowFocus: false,
  });

  // Determine which data to display
  // Update finalData based on excelData or data
  const keyFields = ["ID"];
  const nonKeyFields = [
    "TICKER", "CUSIP", "NAMETKR", "ISIN", "NAMEDESC", "ASSETTYPE", "SCATEGORY", "SSECTOR", "SINDUSTRY", "QUALITY", "MATURITY", "CALLDATE", "PUTDATE", "IDATE", "LASTDATE", 
    "NEXTDATE", "FCPNDATE", "XDIVDATE", "PADATE", "PAFREQ", "ACCRTYPE","HCATEGORY","SSECTOR2","SSECTOR3","TAXABLEI","SSTATE","COUNTRY","ISSCNTRY","PAYCURR","SKIPLOG",
    "QUALITY2","SKIPUOOB","BMRK_ID","MWRR_FLAG","USERAN1","USERAN2","USERAN3","USERAN4","USERAN5","USERAN6"
  ]; // Define non-key fields
  const numericFields = ["FACTOR", "BETA", "CURPRICE", "FRIPRICE", "MTDPRICE", "COUPON", "ANNDIV", "YIELD", "FPAYDATE", "SPAYDATE", "DAYFACTOR", "CALLPRICE", "PUTPRICE"]; // Define numeric fields

  React.useEffect(() => {
    if (isUsingExcelData && excelData.length > 0) {
      setFinalData(compareData(excelData, fetchedSecurity, keyFields, nonKeyFields, numericFields));
      setIsUsingExcelData(false); // Switch back to using fetched data
    } else if (fetchedSecurity && fetchedSecurity.length > 0) {
      setFinalData(fetchedSecurity);
    } else if (finalData.length !== 0) { // Prevent unnecessary updates
      setFinalData([]);
    }
  }, [excelData, fetchedSecurity]);
   

  const portfolioName = ''; // used for PDF output

  const columns = useSecurityColumns(finalData, setFinalData, isEditAble, client as string); // Get Column information 

  const queryClient = useQueryClient();
  // Mutations
  const { mutateAsync: createSecurity, isPending: isCreatingSecurity } = useMutation({
    
    mutationFn: async (createdSecurity: SecurityFields) => {
      // send the updated data to API function
      const editDataInCSV = `A${delim}${createdSecurity.ID}${delim}${createdSecurity.TICKER}${delim}${createdSecurity.CUSIP}${delim}${createdSecurity.NAMETKR}${delim}
        ${createdSecurity.ISIN}${delim}${createdSecurity.NAMEDESC}${delim}${createdSecurity.ASSETTYPE}${delim}${createdSecurity.SCATEGORY}${delim}${createdSecurity.SSECTOR}${delim}
        ${createdSecurity.SINDUSTRY}${delim}${createdSecurity.FACTOR}${delim}${createdSecurity.BETA}${delim}${createdSecurity.CURPRICE}${delim}${createdSecurity.FRIPRICE}${delim}
        ${createdSecurity.MTDPRICE}${delim}${createdSecurity.QUALITY}${delim}${createdSecurity.MATURITY?.toString().replace(/\//g, '')}${delim}${createdSecurity.COUPON}${delim}
        ${createdSecurity.ANNDIV}${delim}${createdSecurity.YIELD}${delim}${createdSecurity.CALLDATE?.toString().replace(/\//g, '')}${delim}${createdSecurity.PUTDATE?.toString().replace(/\//g, '')}${delim}
        ${createdSecurity.IDATE?.toString().replace(/\//g, '')}${delim}${createdSecurity.LASTDATE?.toString().replace(/\//g, '')}${delim}${createdSecurity.NEXTDATE?.toString().replace(/\//g, '')}${delim}
        ${createdSecurity.FPAYDATE?.toString().replace(/\//g, '')}${delim}${createdSecurity.SPAYDATE}${delim}${createdSecurity.FCPNDATE?.toString().replace(/\//g, '')}${delim}
        ${createdSecurity.XDIVDATE?.toString().replace(/\//g, '')}${delim}${createdSecurity.PADATE?.toString().replace(/\//g, '')}${delim}${createdSecurity.PAFREQ}${delim}
        ${createdSecurity.ACCRTYPE}${delim}${createdSecurity.HCATEGORY}${delim}${createdSecurity.SSECTOR2}${delim}${createdSecurity.SSECTOR3}${delim}${createdSecurity.TAXABLEI}${delim}
        ${createdSecurity.SSTATE}${delim}${createdSecurity.COUNTRY}${delim}${createdSecurity.ISSCNTRY}${delim}${createdSecurity.PAYCURR}${delim}${createdSecurity.DAYFACTOR}${delim}
        ${createdSecurity.SKIPLOG}${delim}${createdSecurity.QUALITY2}${delim}${createdSecurity.CALLPRICE}${delim}${createdSecurity.PUTPRICE}${delim}${createdSecurity.SKIPUOOB}${delim}
        ${createdSecurity.BMRK_ID}${delim}${createdSecurity.MWRR_FLAG}${delim}${createdSecurity.USERAN1}${delim}${createdSecurity.USERAN2}${delim}${createdSecurity.USERAN3}${delim}
        ${createdSecurity.USERAN4}${delim}${createdSecurity.USERAN5}${delim}${createdSecurity.USERAN6}
      `;
      await FetchUpdateDeleteAPI(editDataInCSV.replace(/[\r\n]+/g, '').replace(/\s*\|\s*/g, '|').replace(/\|null\|/g, '||'), `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPSEC`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return createSecurity;
    },
    onMutate: async (newSecurity: SecurityFields) => {
      await queryClient.cancelQueries({
        queryKey: ['security', client],
      });
    
      const previousSecurities = queryClient.getQueryData<SecurityFields[]>([
        'security', client ]) || [];
    
      queryClient.setQueryData(
        ['security', client], // Use the exact query key
        (old: SecurityFields[] | undefined) => [
          ...(old ?? []),
          { ...newSecurity, id: uuidv4() },
        ]
      );
    
      return { previousSecurities };
    },        
  });

  const { mutateAsync: updateSecurity, isPending: isUpdatingSecurity } = useMutation({
    mutationFn: async (updatedSecurity: SecurityFields) => {
      // send the updated data to API function
      const editDataInCSV = `C${delim}${updatedSecurity.ID}${delim}${updatedSecurity.TICKER}${delim}${updatedSecurity.CUSIP}${delim}${updatedSecurity.NAMETKR}${delim}
        ${updatedSecurity.ISIN}${delim}${updatedSecurity.NAMEDESC}${delim}${updatedSecurity.ASSETTYPE}${delim}${updatedSecurity.SCATEGORY}${delim}${updatedSecurity.SSECTOR}${delim}
        ${updatedSecurity.SINDUSTRY}${delim}${updatedSecurity.FACTOR}${delim}${updatedSecurity.BETA}${delim}${updatedSecurity.CURPRICE}${delim}${updatedSecurity.FRIPRICE}${delim}
        ${updatedSecurity.MTDPRICE}${delim}${updatedSecurity.QUALITY}${delim}${updatedSecurity.MATURITY?.toString().replace(/\//g, '')}${delim}${updatedSecurity.COUPON}${delim}
        ${updatedSecurity.ANNDIV}${delim}${updatedSecurity.YIELD}${delim}${updatedSecurity.CALLDATE?.toString().replace(/\//g, '')}${delim}${updatedSecurity.PUTDATE?.toString().replace(/\//g, '')}${delim}
        ${updatedSecurity.IDATE?.toString().replace(/\//g, '')}${delim}${updatedSecurity.LASTDATE?.toString().replace(/\//g, '')}${delim}${updatedSecurity.NEXTDATE?.toString().replace(/\//g, '')}${delim}
        ${updatedSecurity.FPAYDATE?.toString().replace(/\//g, '')}${delim}${updatedSecurity.SPAYDATE}${delim}${updatedSecurity.FCPNDATE?.toString().replace(/\//g, '')}${delim}
        ${updatedSecurity.XDIVDATE?.toString().replace(/\//g, '')}${delim}${updatedSecurity.PADATE?.toString().replace(/\//g, '')}${delim}${updatedSecurity.PAFREQ}${delim}
        ${updatedSecurity.ACCRTYPE}${delim}${updatedSecurity.HCATEGORY}${delim}${updatedSecurity.SSECTOR2}${delim}${updatedSecurity.SSECTOR3}${delim}${updatedSecurity.TAXABLEI}${delim}
        ${updatedSecurity.SSTATE}${delim}${updatedSecurity.COUNTRY}${delim}${updatedSecurity.ISSCNTRY}${delim}${updatedSecurity.PAYCURR}${delim}${updatedSecurity.DAYFACTOR}${delim}
        ${updatedSecurity.SKIPLOG}${delim}${updatedSecurity.QUALITY2}${delim}${updatedSecurity.CALLPRICE}${delim}${updatedSecurity.PUTPRICE}${delim}${updatedSecurity.SKIPUOOB}${delim}
        ${updatedSecurity.BMRK_ID}${delim}${updatedSecurity.MWRR_FLAG}${delim}${updatedSecurity.USERAN1}${delim}${updatedSecurity.USERAN2}${delim}${updatedSecurity.USERAN3}${delim}
        ${updatedSecurity.USERAN4}${delim}${updatedSecurity.USERAN5}${delim}${updatedSecurity.USERAN6}
      `;
      await FetchUpdateDeleteAPI(editDataInCSV.replace(/[\r\n]+/g, '').replace(/\s*\|\s*/g, '|').replace(/\|null\|/g, '||'), `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPSEC`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return updatedSecurity;
    },
    onMutate: async (updatedSecurity: SecurityFields) => {
      await queryClient.cancelQueries({ queryKey: ['security'] });
      const previousSecurities = queryClient.getQueryData<SecurityFields[]>(['security']);
      queryClient.setQueryData(['security'], (old: SecurityFields[] = []) =>
        old.map((h) => (h.id === updatedSecurity.id ? updatedSecurity : h))
      );
      return { previousSecurities };
    },
  });
  
  const { mutateAsync: deleteSecurity, isPending: isDeletingSecurity } = useMutation({
    mutationFn: async ({ securityId, ID }: { securityId: string; ID: string;  }) => {
      // send the updated data to API function
      const editDataInCSV = `D${delim}${ID}`;
      await FetchUpdateDeleteAPI(editDataInCSV.replace(/[\r\n]+/g, '').replace(/\s*\|\s*/g, '|').replace(/\|null\|/g, '||'), `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPSEC`); // delete the record
      await new Promise((resolve) => setTimeout(resolve, 100)); // Simulated API delay
      return Promise.resolve(securityId);
    },
    onMutate: async ({ securityId }) => {
      await queryClient.cancelQueries({ queryKey: ['security', client] });
    
      const previousSecurities = queryClient.getQueryData<SecurityFields[]>(['security', client]);
    
      // Optimistically update the cache by removing the deleted row
      queryClient.setQueryData(['security', client], (old: SecurityFields[] = []) => {
        const newData = old.filter((h: SecurityFields) => h.id !== securityId);
        console.log('New Data After Deletion:', newData); // Debugging
        return newData;
      });
    
      return { previousSecurities };
    },
  });
  
  // CRUD Handlers
  const handleCreateSecurity: MRT_TableOptions<SecurityFields>['onCreatingRowSave'] = async ({ values, exitCreatingMode }) => {
    // Format DATES as expected date before saving
    const formattedValues = { ...values, 
      MATURITY: values.MATURITY === '' || null ? '19001201' : formatDateYYMD(values.MATURITY),
      CALLDATE: values.CALLDATE === '' || null ? '19001201' : formatDateYYMD(values.CALLDATE),
      PUTDATE: values.PUTDATE === '' || null ? '19001201' : formatDateYYMD(values.PUTDATE),
      LASTDATE: values.LASTDATE === '' || null ? '19001201' : formatDateYYMD(values.LASTDATE),
      NEXTDATE: values.NEXTDATE === '' || null ? '19001201' : formatDateYYMD(values.NEXTDATE),
      IDATE: values.IDATE === '' || null ? '19001201' : formatDateYYMD(values.IDATE),
      FCPNDATE: values.FCPNDATE === '' || null ? '19001201' : formatDateYYMD(values.FCPNDATE),
      XDIVDATE: values.XDIVDATE === '' || null ? '19001201' : formatDateYYMD(values.XDIVDATE),
      PADATE: values.PADATE === '' || null ? '19001201' : formatDateYYMD(values.PADATE)   
    }; 
    
    // Validate the updated values
    const errors = validateSecurity(values);
    if (Object.values(errors).some(Boolean)) {
      return; // If there are validation errors, stop the save operation
    }
  
    // Save the created values instead of row.original
    await createSecurity(formattedValues); // Use values instead of row.original
    exitCreatingMode();
    table.setCreatingRow(null); // Reset editing state
  };

  const handleSaveSecurity: MRT_TableOptions<SecurityFields>['onEditingRowSave'] = async ({ table, values }) => {
  
    // Format DATES as expected date before saving
    const formattedValues = { 
        ...values, 
        MATURITY: formatDateYYMD(values.MATURITY),
        CALLDATE: formatDateYYMD(values.CALLDATE),
        PUTDATE:  formatDateYYMD(values.PUTDATE),
        LASTDATE: formatDateYYMD(values.LASTDATE),
        NEXTDATE: formatDateYYMD(values.NEXTDATE),
        IDATE:    formatDateYYMD(values.IDATE),
        FCPNDATE: formatDateYYMD(values.FCPNDATE),
        XDIVDATE: formatDateYYMD(values.XDIVDATE),
        PADATE:   formatDateYYMD(values.PADATE) 
    }; 
    
    // Validate the updated values
    const errors = validateSecurity(values);
    if (Object.values(errors).some(Boolean)) {
      return; // If there are validation errors, stop the save operation
    }
  
    // Save the updated values instead of row.original
    await updateSecurity(formattedValues); // Use values instead of row.original
  
    // Reset the editing state
    table.setEditingRow(null);
  };

  const openDeleteConfirmModal = (row: MRT_Row<SecurityFields>) => {
    modals.openConfirmModal({
      title: 'Delete Security?',
      children: (
        <Text>
          Delete {row.original.NAMETKR} ({row.original.ID})?
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        deleteSecurity({
          securityId: row.original.id,
          ID: row.original.ID,
        });
  
        setTimeout(() => modals.closeAll(), 100); // ✅ Delay closing to avoid UI issues
      },
      onCancel: () => {
        setTimeout(() => modals.closeAll(), 100); // ✅ Delay closing to avoid UI issues
      },
    });
  };  

  const csvConfig = mkConfig({
    fieldSeparator: ',',
    decimalSeparator: '.',
    useKeysAsHeaders: true,
  });

  
  const handleExportRows = (rows: MRT_Row<SecurityFields>[]) => {
      const rowData = rows.map(({ original }) => {
          const { id, ...rest } = original; // Exclude 'id' field
          return {
              ...rest,
              MATURITY: rest.MATURITY.toString(), // Convert Date to string
              CALLDATE: rest.CALLDATE.toString(), // Convert Date to string
              PUTDATE: rest.PUTDATE.toString(), // Convert Date to string
              LASTDATE: rest.LASTDATE.toString(), // Convert Date to string
              NEXTDATE: rest.NEXTDATE.toString(), // Convert Date to string
              IDATE: rest.IDATE.toString(), // Convert Date to string
              FCPNDATE: rest.FCPNDATE.toString(), // Convert Date to string
              XDIVDATE: rest.XDIVDATE.toString(), // Convert Date to string
              PADATE: rest.PADATE.toString(), // Convert Date to string
          };
      });
  
      const csv = generateCsv(csvConfig)(rowData);
      download(csvConfig)(csv);
  };

  interface ExcelDataUpdate {
    (newData: SecurityFields[]): void;
  }

  const handleExcelDataUpdate: ExcelDataUpdate = (newData) => {
    setExcelData(newData); // Update excelData with the uploaded file data
    setIsUsingExcelData(true); // Switch to using Excel data
  };

  // create only records that is requires to update the Table
  const FRPSECExcel = finalData?.map(({ id, ...rest }) => ({
    ...rest
  }));

  //  Custom headers for the PDF file
  const PDFheaders = [
    { label: "Asset ID", key: "ID" },
    { label: "Ticker", key: "TICKER" },
    { label: "Asset Name", key: "NAMETKR" },
    { label: "Sector 1", key: "SSECTOR" },
    { label: "Factor", key: "FACTOR", align: 'right' },
    { label: "Current Price", key: "CURPRICE", align: 'right' },
  ];

  // Load data from excel to table
  const fieldnames = ["RECDTYPE", "ID", "TICKER", "CUSIP", "NAMETKR", "ISIN", "NAMEDESC", "ASSETTYPE", "SCATEGORY", "SSECTOR", "SINDUSTRY",
    "FACTOR", "BETA", "CURPRICE", "FRIPRICE", "MTDPRICE", "QUALITY", "MATURITY", "COUPON", "ANNDIV", "YIELD", "CALLDATE", "PUTDATE",
    "IDATE", "LASTDATE", "NEXTDATE", "FPAYDATE", "SPAYDATE", "FCPNDATE", "XDIVDATE", "PADATE", "PAFREQ", "ACCRTYPE", "HCATEGORY", "SSECTOR2","SSECTOR3", "TAXABLEI","SSTATE", "COUNTRY",
    "ISSCNTRY", "PAYCURR", "DAYFACTOR", "SKIPLOG", "QUALITY2", "CALLPRICE", "PUTPRICE", "SKIPUOOB", "BMRK_ID", "MWRR_FLAG", "USERAN1", "USERAN2", "USERAN3", "USERAN4", "USERAN5", "USERAN6"
  ];

  const convertToCSV = (data) => {
      let csv = "";
      data.forEach(row => {
          let rowData = fieldnames.map(field => {
              let value = row[field] ?? "";
              if (typeof value === "string" && value.includes("/")) {
                  value = value.replace(/\//g, "");
              }
              return value;
          }).join(delim);
          csv += rowData + ",END_REC";
      });
      return csv;
  };

  const { mutateAsync: updateSecurityExcel, isPending: isUpdatingSecurityExcel } = useMutation({
    mutationFn: async () => {
      // send the updated data to API function
      await FetchUpdateDeleteAPIExcel(convertToCSV(finalData), `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPSEC`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return Promise.resolve();
    },
    onMutate: async () => {
    },
  });

  const handleMRELoad = async () => {
    await updateSecurityExcel();
  };


  const table = useMantineReactTable({
    columns,
    data: finalData,
    enableColumnResizing: false,
    createDisplayMode: 'modal',
    editDisplayMode: 'modal',
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
    selectDisplayMode: 'checkbox',
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
    getRowId: (row) => row.id, // Use the unique ID
    mantineToolbarAlertBannerProps: isLoadingSecurityError ? { color: 'red', children: 'Failed to load data. Update your selection criteria.' } : undefined,
    // onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateSecurity,
    // onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveSecurity,
    enableRowActions: true,

    mantineTableBodyCellProps: { 
      className: "rpt-body",
    },

    renderCreateRowModalContent: ({ table, row, internalEditComponents }) => {
      setIsEditable(true);

      return (
        <Stack>
          <Flex className='mrt-model-title'>
            <Title order={4}>Create New Security</Title>
            <ActionIcon onClick={() => table.setCreatingRow(null)} variant="light" size="lg" color="red">
              ✕ {/* Close Icon */}
            </ActionIcon>
          </Flex>
          <Grid>
            {internalEditComponents.map((component, index) => (
              <React.Fragment key={index}>
                {index === 0 && (
                  <Grid.Col span={12}>
                    <Divider mt="md" label="General Information" labelPosition="center" />
                  </Grid.Col>
                )}
                {index === 5 && (
                  <Grid.Col span={12}>
                    <Divider mt="md" label="Sector/Asset Classification" labelPosition="center" />
                  </Grid.Col>
                )}
                {index === 17 && ( // Add a divider before the 20th component
                  <Grid.Col span={12}>
                    <Divider mt="md" label="Accrual Characteristics" labelPosition="center" />
                  </Grid.Col>
                )}
                {index === 32 && ( // Add a divider before the 20th component
                  <Grid.Col span={12}>
                    <Divider mt="md" label="Client Miscellaneous" labelPosition="center" />
                  </Grid.Col>
                )}
                <Grid.Col key={index} span={3}> {/* 4 columns layout */}
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
      size: '50%',
      yOffset: '2vh',
      xOffset: 10,
      transitionProps: { transition: 'fade', duration: 600, timingFunction: 'linear' },
    },
    renderEditRowModalContent: ({ table, row, internalEditComponents }) => {
      setIsEditable(false);

      return (
        <Stack>
          <Flex className='mrt-model-title'>
            <Title order={4}>Edit Security</Title>
            <ActionIcon onClick={() => table.setEditingRow(null)} variant="light" size="lg" color="red">
              ✕ {/* Close Icon */}
            </ActionIcon>
          </Flex>
          <Grid>
            {internalEditComponents.map((component, index) => (
              <React.Fragment key={index}> {/* Add key here */}
                {index === 0 && (
                  <Grid.Col span={12}>
                    <Divider mt="md" label="General Information" labelPosition="center" />
                  </Grid.Col>
                )}
                {index === 5 && (
                  <Grid.Col span={12}>
                    <Divider mt="md" label="Sector/Asset Classification" labelPosition="center" />
                  </Grid.Col>
                )}
                {index === 17 && ( 
                  <Grid.Col span={12}>
                    <Divider mt="md" label="Accrual Characteristics" labelPosition="center" />
                  </Grid.Col>
                )}
                {index === 32 && ( 
                  <Grid.Col span={12}>
                    <Divider mt="md" label="Client Miscellaneous" labelPosition="center" />
                  </Grid.Col>
                )}
                {index === 48 && ( 
                  <Grid.Col span={12}>
                    <Divider mt="md" label="Client Ansewr Set" labelPosition="center" />
                  </Grid.Col>
                )}
                <Grid.Col key={index} span={3}> {/* 4 columns layout */}
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
      size: '50%',
      yOffset: '2vh',
      xOffset: 10,
      transitionProps: { transition: 'fade', duration: 600, timingFunction: 'linear' },
    },

    displayColumnDefOptions: { 
      'mrt-row-select': { 
        enableColumnOrdering: true, // Allow column ordering
        enableHiding: false, // Prevent hiding the checkbox column
        size: 5,
      },
      'mrt-row-actions': { 
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
        'mrt-row-select', // Checkbox column (first column)
        'mrt-row-actions', // Actions column (second column)
        ...columns.map(column => column.accessorKey as string), // Rest of the data columns
      ],
    },
  
    renderRowActions: ({ row, table }) => (
      <Flex gap={5}>
        <Tooltip label="Edit">
          <ActionIcon onClick={() => {
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
      <Button variant="subtle" leftIcon={<IconPlus />} 
        onClick={() => {
          table.setCreatingRow(
            createRow(table, SecurityDefaults),
          );
      }}
        disabled={finalData?.length > 0 ? false : true }
        className="rpt-action-button"
      > 
         Create New Security
      </Button>
      <Button variant="subtle"
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
        <Export data={finalData} excelData={FRPSECExcel} reportName="FRPSEC" PDFheaders={PDFheaders} portfolioName={portfolioName} dateRange="" />
        <Button variant='subtle' leftIcon={<IconRefresh size={20}  />} onClick={handleMRELoad} 
          className={ excelData?.length > 0 && finalData.length > 0 ? "rpt-action-button" : ""}
          disabled={ excelData?.length > 0 && finalData.length > 0 ? false : true}
        > Build Excel CSV </Button>
      </Flex>
    ),
    
    renderColumnActionsMenuItems: ({ internalColumnMenuItems, column,  }) => {
      // Check if the header cell has a right alignment
      return (
        <>
          {internalColumnMenuItems} {/* optionally include the default menu items */}
          <Divider style={{ display: (column.columnDef.mantineTableHeadCellProps as any)?.align === 'right' ? 'block' : 'none'}} />
          <Menu.Item 
            style={{ alignItems: 'center', display: (column.columnDef.mantineTableHeadCellProps as any)?.align === 'right' ? 'inline-flex' : 'none'}}
            icon={<ActionIcon><AiIcon /></ActionIcon>}
            // Call a handler that closes the menu and opens the modal
            onClick={() => {
              openModal(column.columnDef.accessorKey, column.columnDef.header);
            }}
          >
            Predict Data (AI)
          </Menu.Item>
        </>
      )
      
    },
    state: {
      isLoading: isLoadingSecurity,
      isSaving: isCreatingSecurity || isUpdatingSecurity || isDeletingSecurity || isUpdatingSecurityExcel,
      showAlertBanner: isLoadingSecurityError,
      showProgressBars: isFetchingSecurity,
    },
  });
  
  // ------------------------------------------------------------------------------------------------
  //  Prediction of continues number in a numeric column
  // ------------------------------------------------------------------------------------------------
  // State for controlling the Modal
  const [modalData, setModalData] = useState({
    opened: false,
    columnKey: null,
    currentColumnHeader: '',
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

const FrpSecurity = () => (
  <ModalsProvider>
    <SecuritiesMTable />
  </ModalsProvider>
);

export default FrpSecurity;

const validateRequired = (value: string) => !!value.length;

function validateSecurity(security: SecurityFields) {
  return {
    NEXTDATE: !validateRequired(security.NEXTDATE?.toString()) ? 'Date is Required' : '',
  };
}