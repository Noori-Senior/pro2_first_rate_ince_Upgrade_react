
import { useQuery } from "@tanstack/react-query";
import { FetchAPI } from "../../api";

//---------------------------------------------------------------------------------------
// Fetch Benchmark Groups
//---------------------------------------------------------------------------------------
// Step 1 Get user benchmark group
export const useBenchmarkGroup = (client) => {
  return useQuery({
    queryKey: ["benchmarkGroup", client],
    queryFn: async () => {
      const benchmarkGroupUri = `IBIF_ex=frapi_build_ddl_bmark&CLIENT=${client}`;
      const data = await FetchAPI(benchmarkGroupUri);
      return data;
    },
    enabled: !!client, // Only run the query if client is defined
    refetchOnWindowFocus: false, // Disable refetching on window focus
  });
};

