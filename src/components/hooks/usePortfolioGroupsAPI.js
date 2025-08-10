import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQueries } from "@tanstack/react-query";
import { FetchAPI } from "../../api";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs

//---------------------------------------------------------------------------------------
// Fetch Portfolio Groups
//---------------------------------------------------------------------------------------
// Step 1 Get user portfolio group
export const usePortfolioGroup = (client) => {
  return useQuery({
    queryKey: ["portfolioGroup", client],
    queryFn: async () => {
      const portfolioGroupUri = `IBIF_ex=frapi_build_ddl_portfolio&CLIENT=${client}`;
      const data = await FetchAPI(portfolioGroupUri);
      return data;
    },
    enabled: !!client, // Only run the query if client is defined
    refetchOnWindowFocus: false, // Disable refetching on window focus
  });
};

// add COMP_ID 
export const usePortfolioGroupWithCompId = (client) => {
  const { data: userPortfolioGroups } = usePortfolioGroup(client); // get the User Portfolio Groups IDs
  const userPortGrp = userPortfolioGroups && Array.isArray(userPortfolioGroups)
    ? userPortfolioGroups.map((item) => item.OBJECT_ID).join(',')
    : '';

  return useQuery({
    queryKey: ["portfolioGroupWithCompId", client, userPortfolioGroups],
    queryFn: async () => {
      const portfolioGroupWithCompIdUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPOBJ&fields=OBJECT_ID,OBJECT_DESC,COMP_ID&filters=COMP_ID(60,61);OBJECT_ID(${userPortGrp})`;
      const data = await FetchAPI(portfolioGroupWithCompIdUri);
      return data;
    },
    enabled: !!client && !!userPortfolioGroups,
    refetchOnWindowFocus: false,
  });
};

// Create a separate custom hook for dynamic group counts
const useDynamicGroupsCount = (client, dynamicGroups) => {
  return useQueries({
    queries: dynamicGroups.map(group => ({
      queryKey: ['dynamicGroupCount', group.OBJECT_ID, client],
      queryFn: async () => {
        try {
          // Step 1: Get VAL_IDs for this group
          const filterValues = await FetchAPI(
            `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPFLGRP&fields=VAL_ID&filters=GROUP_ID(${group.OBJECT_ID})`
          ).catch(() => []);

          if (!filterValues?.length) {
            return { GROUP_ID: group.OBJECT_ID, COUNT: 0, COMP_ID: 61 };
          }

          // Step 2: Get all FILTER/VALUE pairs
          const valIds = filterValues.map(item => item.VAL_ID).join(',');
          const filterData = await FetchAPI(
            `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPFLVAL&fields=FILTER,VALUE&filters=VAL_ID(${valIds})`
          ).catch(() => []);

          if (!filterData?.length) {
            return { GROUP_ID: group.OBJECT_ID, COUNT: 0, COMP_ID: 61 };
          }

          // Step 3: Group filters by type
          const filterGroups = {};
          filterData.forEach(item => {
            if (!filterGroups[item.FILTER]) {
              filterGroups[item.FILTER] = new Set();
            }
            filterGroups[item.FILTER].add(item.VALUE);
          });

          // Step 4: Build combined filter string
          const filterString = Object.entries(filterGroups)
            .map(([filter, values]) => `${filter}(${[...values].join(',')})`)
            .join(';');

          // Step 5: Single API call with combined filters
          const accounts = await FetchAPI(
            `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPAIR&fields=ACCT&filters=${filterString}`
          ).catch(() => []);

          return {
            GROUP_ID: group.OBJECT_ID,
            COUNT: Array.isArray(accounts) ? accounts.length : 0,
            COMP_ID: 61
          };

        } catch (error) {
          console.error(`Failed fetching dynamic count for GROUP_ID ${group.OBJECT_ID}:`, error);
          return { GROUP_ID: group.OBJECT_ID, COUNT: 0, COMP_ID: 61 };
        }
      },
      enabled: !!client && !!group.OBJECT_ID,
      retry: 1,
      staleTime: 5 * 60 * 1000
    }))
  });
};


//--------------------------------------------------------------------------------------------------------------
// Build Static Portfolio Group
//--------------------------------------------------------------------------------------------------------------
// Updated useCountPortfolios
export const useCountPortfolios = (client, userPortGrp, portfolioGroups) => {
  const dynamicGroups = portfolioGroups?.filter(g => g.COMP_ID === 61) || [];
  const dynamicCountResults = useDynamicGroupsCount(client, dynamicGroups);

  return useQuery({
    queryKey: ["countPortfolios", client, userPortGrp, portfolioGroups],
    queryFn: async () => {
      // Static groups (immediate)
      const staticGroups = portfolioGroups?.filter(g => g.COMP_ID === 60) || [];
      const staticCounts = await getStaticCounts(client, staticGroups);

      // Dynamic groups (may load later)
      const dynamicCounts = dynamicCountResults.map(result =>
        result.data || {
          GROUP_ID: result.options.queryKey[1],
          COUNT: 0, // Temporary 0 while loading
          COMP_ID: 61
        }
      );

      return [...staticCounts, ...dynamicCounts];
    },
    enabled: !!client && !!userPortGrp && !!portfolioGroups,
    refetchOnWindowFocus: false
  });
};

// Keep your existing getStaticCounts function
async function getStaticCounts(client, groups) {
  if (!groups.length) return [];

  const groupIds = groups.map(g => g.OBJECT_ID).join(',');
  const countPortfoliosUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPACGRP&fields=GROUP_ID,ACCT&filters=GROUP_ID(${groupIds})`;
  const data = await FetchAPI(countPortfoliosUri);

  const countMap = data?.reduce((acc, curr) => {
    if (curr.GROUP_ID) {
      acc[curr.GROUP_ID] = (acc[curr.GROUP_ID] || 0) + 1;
    }
    return acc;
  }, {});

  return groups.map(group => ({
    GROUP_ID: group.OBJECT_ID,
    COUNT: countMap?.[group.OBJECT_ID] || 0,
    COMP_ID: 60
  }));
}

// Fetch Portfolio Group information from FRPOBJ
export const useGetPortfolioGrpDtl = (client) => {
  const { data: userPortfolioGroups } = usePortfolioGroupWithCompId(client);
  const userPortGrp = userPortfolioGroups?.map(item => item.OBJECT_ID).join(',') || '';

  const { data: counts } = useCountPortfolios(client, userPortGrp, userPortfolioGroups);

  return useQuery({
    queryKey: ["getPortfolioGrpDtl", client, userPortfolioGroups, counts],
    queryFn: async () => {
      return userPortfolioGroups.map(group => {
        const countData = counts?.find(c => c.GROUP_ID === group.OBJECT_ID);
        return {
          ...group,
          id: group.id || uuidv4(),
          COUNT: countData?.COUNT || 0
        };
      });
    },
    enabled: !!client && !!userPortfolioGroups && !!counts,
    refetchOnWindowFocus: false
  });
};

//---------------------------------------------------------------------------------------
// Fetch Selected Portfolio Group portfolio details in the Modal
//---------------------------------------------------------------------------------------
export const useFetchPortDetails = (client, pgroupid) => {
  return useQuery({
    queryKey: ["portfolioDetail", client, pgroupid],
    queryFn: async () => {
      const portfolioDetailUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPACGRP&fields=GROUP_ID,ACCT&filters=GROUP_ID(${pgroupid})`;
      const data = await FetchAPI(portfolioDetailUri);
      return data;
    },
    enabled: !!client && !!pgroupid,
    refetchOnWindowFocus: false,
  });
};

//------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------
// Build dynamic Portfolio Group
//--------------------------------------------------------------------------------------------------------------
// Step 1 get selected dynamic portfolio group val_ids from FRPFLGRP
export const useGetValIdDynamicGrp = (client, dynamicGrpID) => {
  return useQuery({
    queryKey: ["getValIdDynamicGrp", client, dynamicGrpID],
    queryFn: async () => {
      const getValIdDynamicGrpUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPFLGRP&fields=GROUP_ID,VAL_ID&filters=GROUP_ID(${dynamicGrpID})`;
      const data = await FetchAPI(getValIdDynamicGrpUri);
      return data;
    },
    enabled: !!client && !!dynamicGrpID,
    refetchOnWindowFocus: false,
  });
};

// Step 2 Get the FILTER column with VALUES from FRPFLVAL
export const useGetDynamicGrpValIdData = (client, dynamicGrpID) => {
  const { data: dynamicPortGrpValID } = useGetValIdDynamicGrp(client, dynamicGrpID); // get the User Portfolio Groups
  const dynamicValID = dynamicPortGrpValID && Array.isArray(dynamicPortGrpValID)
    ? dynamicPortGrpValID.map((item) => item.VAL_ID).join(',')
    : '';

  return useQuery({
    queryKey: ["getPortfolioGrpDtl", client, dynamicPortGrpValID],
    queryFn: async () => {
      const getPortfolioGrpDtlUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPFLVAL&fields=VALUE,VAL_DESC,FILTER&filters=VAL_ID(${dynamicValID})`;
      const data = await FetchAPI(getPortfolioGrpDtlUri);

      return data;
    },
    enabled: !!client && !!dynamicPortGrpValID,
    refetchOnWindowFocus: false,
  });
};

// Step 3 Get the Dynamic Portfolio Group accounts from FRPAIR
export const useGetDynamicPortfolioGroupAccounts = (dynamicGrpID, client, options = {}) => {
  console.log("useGetDynamicPortfolioGroupAccounts called with dynamicGrpID:", dynamicGrpID, "and client:", client, "options:", options);
  // Step 1: Get filter values
  const { data: filterValues } = useGetDynamicGrpValIdData(client, dynamicGrpID, {
    enabled: options.enabled ?? (!!dynamicGrpID && !!client)
  });
  
  // Step 2: Memoize filter groups to prevent unnecessary recalculations
  const filterGroups = useMemo(() => {
    const groups = {};
    filterValues?.forEach(item => {
      if (!groups[item.FILTER]) {
        groups[item.FILTER] = new Set();
      }
      groups[item.FILTER].add(item.VALUE);
    });
    return groups;
  }, [filterValues]);
  
  // Step 3: Build filter string
  const filterString = useMemo(() => {
    if (!filterValues || filterValues.length === 0) return '';
    return Object.entries(filterGroups)
      .map(([filter, values]) => `${filter}(${[...values].join(',')})`)
      .join(';');
  }, [filterGroups, filterValues]);


  // Step 4: Main query
  return useQuery({
    queryKey: ["dynamicAccountName", dynamicGrpID, client, filterString],
    queryFn: async () => {
      if (!filterString) {
        console.warn("No filter string available");
        return [];
      }

      const accountNameUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPAIR&filters=${filterString}&fields=ACCT,NAME`;
      console.log("Fetching with URI:", accountNameUri);
      
      try {
        const data = await FetchAPI(accountNameUri);
        console.log("Fetched data:", data);
        return data;
      } catch (error) {
        console.error("Fetch error:", error);
        throw error;
      }
    },
    enabled: options.enabled ?? (!!dynamicGrpID && !!client && !!filterString),
    refetchOnWindowFocus: false,
  });
};

