
import { useQuery } from "@tanstack/react-query";
import { FetchAPI } from "../../api";

//---------------------------------------------------------------------------------------
// Fetch Sector Groups
//---------------------------------------------------------------------------------------
// Step 1 Get user sector group
export const useSectorGroup = (client) => {
  return useQuery({
    queryKey: ["sectorGroup", client],
    queryFn: async () => {
      const sectorGroupUri = `IBIF_ex=frapi_build_ddl_sector&CLIENT=${client}`;
      const data = await FetchAPI(sectorGroupUri);
      return data;
    },
    enabled: !!client, // Only run the query if client is defined
    refetchOnWindowFocus: false, // Disable refetching on window focus
  });
};

