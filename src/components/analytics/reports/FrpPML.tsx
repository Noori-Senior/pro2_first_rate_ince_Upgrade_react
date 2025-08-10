import React, { useState } from "react";
import {
  MantineReactTable,
  useMantineReactTable,
} from "mantine-react-table";
import { Flex, } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { useQuery } from "@tanstack/react-query";
import { FetchAPI } from "../../../api.js";
import useClient from "../../hooks/useClient.js";
import { usePMLColumns, PMLFields } from "../analyticsColumnTitles/PMLColumns.tsx";
import { useOutletContext } from "react-router-dom";

import { Export } from "../../report-components/Export.js";
import { useSectorName } from "../../hooks/useFrpNamesFiltersDDLsApi.js";
// import { formatFromDateYYM, formatToDateYYM } from "../../hooks/FormatDates.tsx";

type DateRange = string[];
type OutletContextType = {
  selectedPortfolio: string;
  setSelectedPortfolio: (portfolio: string) => void;
  dateRange: DateRange;
};

const PMLMTable = () => {
  
  const [finalData, setFinalData] = useState<PMLFields[]>([]);
  const client = useClient();

  // const { selectedPortfolio, setSelectedPortfolio } =  useOutletContext<OutletContextType>();
  const { dateRange } = useOutletContext<OutletContextType>();
  // const fromDate = formatFromDateYYM(dateRange as [string, string]) ;
  // const toDate = formatToDateYYM(dateRange as [string, string]) ;

  const { data: sectorNameData } = useSectorName(client); // Fetch sector name data
  const lpmlAnalyticsUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPAIR&fields=ACCT,NAME&filters=ACCT(*102231*)`;

  // Unified data fetch using React Query
  const {
    data: fetchedPML = [],
    isError: isLoadingPMLError,
    isFetching: isFetchingPML,
    isLoading: isLoadingPML,
  } = useQuery<PMLFields[]>({
    queryKey: ["pmlAnalytics", client],
    queryFn: async () => {
      const data = await FetchAPI(lpmlAnalyticsUri);
      return data;
    },
    enabled: !!client && !!sectorNameData,
    refetchOnWindowFocus: false,
  });

  React.useEffect(() => {
    setFinalData(fetchedPML);
  }, [fetchedPML]);

  const portfolioName = finalData[0]?.NAME + ` (${finalData[0]?.ACCT})`; // used for PDF output

  const columns = usePMLColumns(); // Get Column information



  // create only records that is requires to update the Table
  const PMLExcel = finalData?.map(({ id, ...rest }) => ({
    ...rest,
  }));

  //  Custom headers for the PDF file
  const PDFheaders = [
    { label: "Account", key: "ACCT" },
    { label: "Name", key: "NAME" },
  ];


  const table = useMantineReactTable({
    columns,
    data: finalData,
    enableColumnResizing: false,
    enableEditing: false,
    enableClickToCopy: true,
    enableColumnDragging: true,
    enableColumnOrdering: true,
    enableColumnFilterModes: false,
    enablePinning: true,
    enableStickyHeader: true,
    enableTableFooter: true,
    enableFullScreenToggle: false,
    enableRowSelection: false,
    paginationDisplayMode: "pages",
    positionToolbarAlertBanner: "bottom",
    getRowId: (row) => row.id, // Use the unique ID
    mantineToolbarAlertBannerProps: isLoadingPMLError
      ? { color: "red", children: "Failed to load data. Update your selection criteria." }
      : undefined,

    mantineTableBodyCellProps: {
      className: "rpt-body",
    },

    renderTopToolbarCustomActions: ({ table }) => (
      <Flex gap={10}>
        <Export
          data={finalData}
          excelData={PMLExcel}
          reportName="Performance Master Listing"
          PDFheaders={PDFheaders}
          portfolioName={portfolioName}
          dateRange= {dateRange}
        />
      </Flex>
    ),

    
    state: {
      isLoading: isLoadingPML,
      showAlertBanner: isLoadingPMLError,
      showProgressBars: isFetchingPML,
    },
  });

  // Your Modal, rendered outside of the menu
  return (
    <MantineReactTable table={table} />
  );
};

const FrpPMLReport = () => (
  <ModalsProvider>
    <PMLMTable />
  </ModalsProvider>
);

export default FrpPMLReport;

