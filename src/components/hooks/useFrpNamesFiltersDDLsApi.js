import { useQuery } from "@tanstack/react-query";
import { FetchAPI } from "../../api";

// Fetch account name based on selected portfolio
export const useAccountName = (selectedPortfolio, client) => {
  return useQuery({
    queryKey: ["accountName", selectedPortfolio, client],
    queryFn: async () => {
      const accountNameUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPAIR&filters=ACCT(${selectedPortfolio})&fields=ACCT,NAME`;
      const data = await FetchAPI(accountNameUri);
      return data;
    },
    enabled: !!selectedPortfolio && !!client, // Only run the query if selectedPortfolio and client are defined
    refetchOnWindowFocus: false, // Disable refetching on window focus
  });
};

// Fetch asset name 
export const useAssetName = (client) => {
  return useQuery({
    queryKey: ["assetName", client],
    queryFn: async () => {
      const assetNameUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPSEC&fields=ID,NAMETKR&tblVerb=SUM&byFields=ID&filters=ID(UNLIKE:%23*);ID(NE:MISSING)`;
      const data = await FetchAPI(assetNameUri);
      return data;
    },
    enabled: !!client, // Only run the query if client are defined
    refetchOnWindowFocus: false, // Disable refetching on window focus
  });
};

// Fetch Sector name 
export const useSectorName = (client) => {
  return useQuery({
    queryKey: ["sectorName", client],
    queryFn: async () => {
      const sectorNameUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPSI1&fields=SORI,SORINAME&tblVerb=SUM&byFields=SIFLAG,SORI&filters=SIFLAG(S)`;
      const data = await FetchAPI(sectorNameUri);
      return data;
    },
    enabled: !!client, // Only run the query if client are defined
    refetchOnWindowFocus: false, // Disable refetching on window focus
  });
};

// Fetch Benchmark name 
export const useBenchmarkName = (client) => {
  return useQuery({
    queryKey: ["benchmarkName", client],
    queryFn: async () => {
      const benchmarkNameUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPSI1&fields=SORI,SORINAME&tblVerb=SUM&byFields=SIFLAG,SORI&filters=SIFLAG(I)`;
      const data = await FetchAPI(benchmarkNameUri);
      return data;
    },
    enabled: !!client, // Only run the query if client are defined
    refetchOnWindowFocus: false, // Disable refetching on window focus
  });
};

// Fetch Sector DDL 
export const useSectorDDL = (client, table) => {
  const { data: sectorNameData } = useSectorName(client);
  
  return useQuery({
    queryKey: ["sectorDDL", client, table, sectorNameData],
    queryFn: async () => {
      const sectorUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=${table}&fields=SECTOR&tblVerb=SUM&byFields=SECTOR`;
      const data = await FetchAPI(sectorUri);

      return data.map((row) => {
          // Sector name matching - assuming sectorNameData is an array
          const matchedSector = sectorNameData?.find(sector => sector.SORI === row.SECTOR);
          const matchSectorName = matchedSector?.SORINAME === undefined ? "Name Not Defined" : matchedSector?.SORINAME;
          
          return {
              ...row,
              SNAME: matchSectorName, // add SNAME field conditionally
          };
      });
    },
    enabled: !!client && !!table && !!sectorNameData,
    refetchOnWindowFocus: false,
  });
};

// Fetch benchmark DDL 
export const useBenchmarkDDL = (client, table) => {
  const { data: benchmarkNameData } = useBenchmarkName(client);
  
  return useQuery({
    queryKey: ["benchmarkDDL", client, table, benchmarkNameData],
    queryFn: async () => {
      const sectorUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=${table}&fields=INDX&tblVerb=SUM&byFields=INDX`;
      const data = await FetchAPI(sectorUri);

      return data.map((row) => {
          // benchmark name matching - assuming benchmarkNameData is an array
          const matchedBenchmark = benchmarkNameData?.find(benchmark => benchmark.SORI === row.INDX);
          const matchedBenchmarkName = matchedBenchmark?.SORINAME === undefined ? "Name Not Defined" : matchedBenchmark?.SORINAME;
          
          return {
              ...row,
              SNAME: matchedBenchmarkName, // add SNAME field conditionally
          };
      });
    },
    enabled: !!client && !!table && !!benchmarkNameData,
    refetchOnWindowFocus: false,
  });
};

// Fetch HDIrect1 DDL ID 
export const useHdirect1DDLID = (client, table) => {
  const { data: sectorNameData } = useSectorName(client);
  
  return useQuery({
    queryKey: ["hdirect1DDLID", client, table, sectorNameData],
    queryFn: async () => {
      const hdirect1DDLIDUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=${table}&fields=HDIRECT1&tblVerb=SUM&byFields=HDIRECT1`;
      const data = await FetchAPI(hdirect1DDLIDUri);

      return data.map((row) => {
          // Sector name matching - assuming sectorNameData is an array
          const matchedSector1 = sectorNameData?.find(sector => sector.SORI === row.HDIRECT1);
          const matchedSectorName1 = matchedSector1?.SORINAME === undefined ? "Name Not Defined" : matchedSector1?.SORINAME;
          
          return {
              ...row,
              SNAME1: matchedSectorName1, // add SNAME1 field conditionally
          };
      });
    },
    enabled: !!client && !!table && !!sectorNameData,
    refetchOnWindowFocus: false,
  });
};

// Fetch HDIrect2 DDL ID 
export const useHdirect2DDLID = (client, table) => {
  const { data: sectorNameData } = useSectorName(client);
  
  return useQuery({
    queryKey: ["hdirect2DDLID", client, table, sectorNameData],
    queryFn: async () => {
      const hdirect2DDLIDUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=${table}&fields=HDIRECT2&tblVerb=SUM&byFields=HDIRECT2`;
      const data = await FetchAPI(hdirect2DDLIDUri);

      return data.map((row) => {
          // Sector name matching - assuming sectorNameData is an array
          const matchedSector2 = sectorNameData?.find(sector => sector.SORI === row.HDIRECT2);
          const matchedSectorName2 = matchedSector2?.SORINAME === undefined ? "Name Not Defined" : matchedSector2?.SORINAME;
          
          return {
              ...row,
              SNAME2: matchedSectorName2, // add SNAME1 field conditionally
          };
      });
    },
    enabled: !!client && !!table && !!sectorNameData,
    refetchOnWindowFocus: false,
  });
};

// Fetch HDIrect3 DDL ID 
export const useHdirect3DDLID = (client, table) => {
  const { data: sectorNameData } = useSectorName(client);
  
  return useQuery({
    queryKey: ["hdirect3DDLID", client, table, sectorNameData],
    queryFn: async () => {
      const hdirect3DDLIDUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=${table}&fields=HDIRECT3&tblVerb=SUM&byFields=HDIRECT3`;
      const data = await FetchAPI(hdirect3DDLIDUri);

      return data.map((row) => {
          // Sector name matching - assuming sectorNameData is an array
          const matchedSector3 = sectorNameData?.find(sector => sector.SORI === row.HDIRECT3);
          const matchedSectorName3 = matchedSector3?.SORINAME === undefined ? "Name Not Defined" : matchedSector3?.SORINAME;
          
          return {
              ...row,
              SNAME3: matchedSectorName3, // add SNAME1 field conditionally
          };
      });
    },
    enabled: !!client && !!table && !!sectorNameData,
    refetchOnWindowFocus: false,
  });
};

// Fetch HDIrect3 DDL ID 
export const useAssetDDLID = (client, selectedPortfolio, fromDate, toDate) => {
  const { data: assetNameData } = useAssetName(client); // Fetch asset name data
  
  return useQuery({
    queryKey: ["assetDDLID", client, assetNameData],
    queryFn: async () => {
      const assetDDLIDUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPHOLD&fields=HID&tblVerb=SUM&byFields=HID&filters=AACCT(${selectedPortfolio});ADATE(GT:${fromDate}:AND:ADATE:LE:${toDate})`;
      const data = await FetchAPI(assetDDLIDUri);

      return data.map((row) => {
          // Asset name matching - assuming assetNameData is an array
          const matchedAsset = assetNameData?.find(asset => asset.ID === row.HID);
          const matchedAssetName = matchedAsset?.NAMETKR === undefined ? "Name Not Defined" : matchedAsset?.NAMETKR;
          
          return {
              ...row,
              NAMETKR: matchedAssetName, 
          };
      });
    },
    enabled: !!client && !!assetNameData,
    refetchOnWindowFocus: false,
  });
};
// Create this asset DDL for FRPPRICE
export const useAssetPriceDDLID = (client, fromDate, toDate) => {
  const { data: assetNameData } = useAssetName(client); // Fetch asset name data
  
  return useQuery({
    queryKey: ["assetPriceDDLID", client, assetNameData],
    queryFn: async () => {
      const assetPriceDDLIDUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPPRICE&fields=ID&tblVerb=SUM&byFields=ID&filters=SDATE(GT:${fromDate}:AND:SDATE:LE:${toDate})`;
      const data = await FetchAPI(assetPriceDDLIDUri);

      return data.map((row) => {
          // Asset name matching - assuming assetNameData is an array
          const matchedAsset = assetNameData?.find(asset => asset.ID === row.ID);
          const matchedAssetName = matchedAsset?.NAMETKR === undefined ? "Name Not Defined" : matchedAsset?.NAMETKR;
          
          return {
              ...row,
              NAMETKR: matchedAssetName, 
          };
      });
    },
    enabled: !!client && !!assetNameData,
    refetchOnWindowFocus: false,
  });
};

// Fetch Data from FRPFLVAL based on given filter
export const useFilterFLVL = (client, filter) => {
  return useQuery({
    queryKey: ["filterFLVL", client, filter],
    queryFn: async () => {
      const filterFLVLUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPFLVAL&filters=FILTER(${filter})&fields=VALUE,VAL_DESC`;
      const data = await FetchAPI(filterFLVLUri);
      return data;
    },
    enabled: !!client && !!filter, 
    refetchOnWindowFocus: false,
  });
};

// Fetch Data from FRPIPKG1 
export const usePackageDDL = (client) => {
  return useQuery({
    queryKey: ["packageDDL", client],
    queryFn: async () => {
      const packageDDLUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPIPKG1&fields=PKG`;
      const data = await FetchAPI(packageDDLUri);
      return data;
    },
    enabled: !!client , 
    refetchOnWindowFocus: false,
  });
};

// Fetch Data from FRPTOLRP 
export const useTolerPackageDDL = (client) => {
  return useQuery({
    queryKey: ["tolerPackageDDL", client],
    queryFn: async () => {
      const tolerPackageDDLUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPTOLRP&fields=PKG`;
      const data = await FetchAPI(tolerPackageDDLUri);
      return data;
    },
    enabled: !!client , 
    refetchOnWindowFocus: false,
  });
};

// Fetch Data from FRPACBNC for given field and client 
export const useTargetPolicyAssignmentDDL = (client, field) => {
  const { data: accountNameData } = useAccountName("*", client); // Fetch account name data
  const { data: sectorNameData } = useSectorName(client); // Fetch sector name data
  const { data: benchmarkNameData } = useBenchmarkName(client); // Fetch benchmark name data

  return useQuery({
    queryKey: ["tolerPackageDDL", client, field],
    queryFn: async () => {
      const tolerPackageDDLUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPACBNC&fields=${field}&tblVerb=SUM&byFields=${field}`;
      const data = await FetchAPI(tolerPackageDDLUri);
      return data.map((row) => {
          // Account name matching - assuming accountNameData is an array
          const matchedAccount = accountNameData?.find(account => account.ACCT === row[field]);
          const matchedAccountName = matchedAccount?.NAME === undefined ? "Name Not Defined" : matchedAccount?.NAME;

          // Sector name matching - assuming sectorNameData is an array
          const matchedSector = sectorNameData?.find(sector => sector.SORI === row[field]);
          const matchedSectorName = matchedSector?.SORINAME === undefined ? "Name Not Defined" : matchedSector?.SORINAME;

          // Benchmark name matching - assuming benchmarkNameData is an array
          const matchedBenchmark = benchmarkNameData?.find(benchmark => benchmark.SORI === row[field]);
          const matchedBenchmarkName = matchedBenchmark?.SORINAME === undefined ? "Name Not Defined" : matchedBenchmark?.SORINAME;

          return {
            ...row,
            ...(field === 'ACCT' ? { NAME: matchedAccountName } : 
                field === 'SECTOR' ? { SORINAME: matchedSectorName } : 
                field === 'INDX' ? { SORINAME: matchedBenchmarkName } : 
                {}),
          };
      });
    },
    enabled: !!client && !!field, // Only run the query if client and field are defined
    refetchOnWindowFocus: false,
  });
};

// Fetch Data from FRPCNTRY 
export const useCountryDDL = (client) => {
  return useQuery({
    queryKey: ["countryDDL", client],
    queryFn: async () => {
      const countryDDLUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPCNTRY&fields=COUNTRY,CNAME`;
      const data = await FetchAPI(countryDDLUri);
      return data;
    },
    enabled: !!client , 
    refetchOnWindowFocus: false,
  });
};

// Fetch Data from FRPISO 
export const useISODDL = (client) => {
  return useQuery({
    queryKey: ["isoDDL", client],
    queryFn: async () => {
      const isoDDLUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPISO&fields=ISO,ISONAME`;
      const data = await FetchAPI(isoDDLUri);
      return data;
    },
    enabled: !!client , 
    refetchOnWindowFocus: false,
  });
};

// Fetch Transaction code from FRPTCD
export const useTransactionCode = (client) => {
  const { data: processedT_IDENT } = useFilterFLVL(client, 'T_IDENT'); // Fetch asset name data
  
  return useQuery({
    queryKey: ["transactionCodeDDLID", client, processedT_IDENT],
    queryFn: async () => {
      const transactionCodeDDLIDUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPTCD&fields=T_IDENT&tblVerb=SUM&byFields=T_IDENT`;
      const data = await FetchAPI(transactionCodeDDLIDUri);

      return data.map((row) => {
          // Transaction name matching - assuming processedT_IDENT is an array
          const matchedTransaction = processedT_IDENT?.find(tident => tident.VALUE === row.T_IDENT);
          const matchedTransactionName = matchedTransaction?.VAL_DESC === undefined ? "Name Not Defined" : matchedTransaction?.VAL_DESC;
          
          return {
              ...row,
              VAL_DESC: matchedTransactionName, 
          };
      });
    },
    enabled: !!client && !!processedT_IDENT,
    refetchOnWindowFocus: false,
  });
};

// Fetch Transaction code from FRPTCD
export const useTransactionCodeByTIDENT = (client, tident) => {
  return useQuery({
    queryKey: ["transactionCodeByIdent", client, tident],
    queryFn: async () => {
      const transactionCodeByTIDENTDDLUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPTCD&fields=T_CODE,T_DESC&filters=T_IDENT(${tident})`;
      const data = await FetchAPI(transactionCodeByTIDENTDDLUri);
      return data;
    },
    enabled: !!client && !!tident, // Only run the query if client and tident are defined
    refetchOnWindowFocus: false,
  });
};

// Fetch Transaction code from FRPTCD
export const useTIDENT = (client, tcode) => {
  return useQuery({
    queryKey: ["tidentID", client, tcode],
    queryFn: async () => {
      const tidentIDUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPTCD&fields=T_IDENT&tblVerb=SUM&byFields=T_IDENT&filters=T_CODE(${tcode})`;
      const data = await FetchAPI(tidentIDUri);
      return data;
    },
    enabled: !!client && !!tcode, // Only run the query if client and tident are defined
    refetchOnWindowFocus: false,
  });
};

// Fetch ISECTOR 1 DDL ID for FRPATYPE 
export const useISector1DDLID = (client, table) => {
  const { data: sectorNameData } = useSectorName(client);
  
  return useQuery({
    queryKey: ["isector1DDLID", client, table, sectorNameData],
    queryFn: async () => {
      const isector1DUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=${table}&fields=ISECTOR&tblVerb=SUM&byFields=ISECTOR`;
      const data = await FetchAPI(isector1DUri);

      return data.map((row) => {
          // Sector name matching - assuming sectorNameData is an array
          const matchedSector1 = sectorNameData?.find(sector => sector.SORI === row.ISECTOR);
          const matchedSectorName1 = matchedSector1?.SORINAME === undefined ? "Name Not Defined" : matchedSector1?.SORINAME;
          
          return {
              ...row,
              SNAME1: matchedSectorName1, // add SNAME1 field conditionally
          };
      });
    },
    enabled: !!client && !!table && !!sectorNameData,
    refetchOnWindowFocus: false,
  });
};
// Fetch ISECTOR 2 DDL ID for FRPATYPE 
export const useISector2DDLID = (client, table) => {
  const { data: sectorNameData } = useSectorName(client);
  
  return useQuery({
    queryKey: ["isector2DDLID", client, table, sectorNameData],
    queryFn: async () => {
      const isector2DUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=${table}&fields=ISECTOR2&tblVerb=SUM&byFields=ISECTOR2`;
      const data = await FetchAPI(isector2DUri);

      return data.map((row) => {
          // Sector name matching - assuming sectorNameData is an array
          const matchedSector2 = sectorNameData?.find(sector => sector.SORI === row.ISECTOR2);
          const matchedSectorName2 = matchedSector2?.SORINAME === undefined ? "Name Not Defined" : matchedSector2?.SORINAME;
          
          return {
              ...row,
              SNAME2: matchedSectorName2, // add SNAME1 field conditionally
          };
      });
    },
    enabled: !!client && !!table && !!sectorNameData,
    refetchOnWindowFocus: false,
  });
};
// Fetch ISECTOR 3 DDL ID for FRPATYPE 
export const useISector3DDLID = (client, table) => {
  const { data: sectorNameData } = useSectorName(client);
  
  return useQuery({
    queryKey: ["isector3DDLID", client, table, sectorNameData],
    queryFn: async () => {
      const isector3DUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=${table}&fields=ISECTOR3&tblVerb=SUM&byFields=ISECTOR3`;
      const data = await FetchAPI(isector3DUri);

      return data.map((row) => {
          // Sector name matching - assuming sectorNameData is an array
          const matchedSector3 = sectorNameData?.find(sector => sector.SORI === row.ISECTOR3);
          const matchedSectorName3 = matchedSector3?.SORINAME === undefined ? "Name Not Defined" : matchedSector3?.SORINAME;
          
          return {
              ...row,
              SNAME3: matchedSectorName3, // add SNAME1 field conditionally
          };
      });
    },
    enabled: !!client && !!table && !!sectorNameData,
    refetchOnWindowFocus: false,
  });
};

// Fetch MSector 1 DDL ID for FRPIPKG2 
export const useMSector1DDLID = (client, table) => {
  const { data: sectorNameData } = useSectorName(client);
  
  return useQuery({
    queryKey: ["msector1DDLID", client, table, sectorNameData],
    queryFn: async () => {
      const msector1DUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=${table}&fields=MSECTOR1&tblVerb=SUM&byFields=MSECTOR1`;
      const data = await FetchAPI(msector1DUri);

      return data.map((row) => {
          // Sector name matching - assuming sectorNameData is an array
          const matchedMSector1 = sectorNameData?.find(sector => sector.SORI === row.MSECTOR1);
          const machedMSector1Name = matchedMSector1?.SORINAME === undefined ? "Name Not Defined" : matchedMSector1?.SORINAME;
          
          return {
              ...row,
              MSNAME1: machedMSector1Name, // add SNAME1 field conditionally
          };
      });
    },
    enabled: !!client && !!table && !!sectorNameData,
    refetchOnWindowFocus: false,
  });
};
// Fetch MSector 2 DDL ID for FRPIPKG2 
export const useMSector2DDLID = (client, table) => {
  const { data: sectorNameData } = useSectorName(client);
  
  return useQuery({
    queryKey: ["msector2DDLID", client, table, sectorNameData],
    queryFn: async () => {
      const msector1DUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=${table}&fields=MSECTOR2&tblVerb=SUM&byFields=MSECTOR2`;
      const data = await FetchAPI(msector1DUri);

      return data.map((row) => {
          // Sector name matching - assuming sectorNameData is an array
          const matchedMSector2 = sectorNameData?.find(sector => sector.SORI === row.MSECTOR2);
          const machedMSector2Name = matchedMSector2?.SORINAME === undefined ? "Name Not Defined" : matchedMSector2?.SORINAME;
          
          return {
              ...row,
              MSNAME2: machedMSector2Name, // add SNAME1 field conditionally
          };
      });
    },
    enabled: !!client && !!table && !!sectorNameData,
    refetchOnWindowFocus: false,
  });
};

// Fetch INDXPKG from FRPAIR for FRPIPKG2
export const useIndxpkgDDL = (client, field) => {
  return useQuery({
    queryKey: ["indxpkgDDL", client, field],
    queryFn: async () => {
      const indxpkgDDL = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPAIR&fields=${field}&tblVerb=SUM&byFields=${field}`;
      const data = await FetchAPI(indxpkgDDL);
      return data;
    },
    enabled: !!client , 
    refetchOnWindowFocus: false,
  });
};

