
import { useState, useEffect } from 'react';
import { Box, Select } from '@mantine/core';
import { usePortfolioGroup } from './hooks/usePortfolioGroupsAPI.js';
import { useSectorGroup } from './hooks/useSectorGroupsAPI.js';
import { useBenchmarkGroup } from './hooks/useBenchmarkGroupsAPI.js';
import useClient from './hooks/useClient.js';
import { FetchAPI } from '../api.js';
import { useOutletContext } from "react-router-dom";
import { formatFromDateYYMD, formatToDateYYMMDD } from './hooks/FormatDates.tsx';

type DateRange = string[];

type OutletContextType = {
  dateRange: DateRange;
};


export const PortSectBenchDDL = ({ onPortGrpChange, onPortGrpCount, onPortGrpChName }) => {
    const client = useClient();
    const { data: fetchPortfolioGroup } = usePortfolioGroup(client); // get Portfolio Group detail
    const [portGrpCount, setPortGrpCount] = useState(0); // state to hold the count of Portfolio Groups
    const [portGrpValue, setPortGrpValue] = useState(null); // set the initial state for Portfolio Group selection

    const { dateRange } = useOutletContext<OutletContextType>();
    const fromDate = formatFromDateYYMD(dateRange as [string, string]) ;
    const toDate = formatToDateYYMMDD(dateRange as [string, string]) ;

    // build Portfolio group DDL
    const portData = fetchPortfolioGroup?.map(portGrp => ({ 
      value: portGrp.OBJECT_ID, 
      label: portGrp.OBJECT_DESC 
    })) || []; // Fallback to empty array if undefined
  
    // handle portfolio group change
    const handlePortChange = async (newVal) => { 
      setPortGrpValue(newVal);
      onPortGrpChange(newVal); // Portfolio Group ID
      // Find the selected label
      const selectedOption = portData.find(opt => opt.value === newVal);
      onPortGrpChName(selectedOption?.label); // Portfolio Group Name
      const response = await FetchAPI(`IBIF_ex=FRAPI_BUILD_FRPSLACT&CLIENT=${client}&accountGroup=${newVal}`); // build the FRPSLACT in user WS for selected Portfolio Group
      setPortGrpCount(response[0].recordCount); // update the count of Portfolio Groups
      onPortGrpCount(response[0].recordCount); // Portfolio Group number of Portfolios
    };
  
    // build Sector group DDL
    const { data: fetchSectorGroup } = useSectorGroup(client); // get Sector Group detail
    const [sectorGrpValue, setSectorGrpValue] = useState(null);
    const sectorGrpData = fetchSectorGroup?.map(sectrGrp => ({ 
      value: sectrGrp.OBJECT_ID, 
      label: sectrGrp.OBJECT_DESC 
    })) || []; // Fallback to empty array if undefined
    
    // handle sector group change
    const handleSectorChange = async (newVal) => { 
      setSectorGrpValue(newVal);
    };
  
    // build Benchmark group DDL
    const { data: fetchBenchmarkGroup } = useBenchmarkGroup(client); // get Benchmark Group detail
    const [benchmarkGrpValue, setBenchmarkGrpValue] = useState(null);
    const benchmarkGrpData = fetchBenchmarkGroup?.map(sectrGrp => ({ 
      value: sectrGrp.OBJECT_ID, 
      label: sectrGrp.OBJECT_DESC 
    })) || []; // Fallback to empty array if undefined
    
    // handle sector group change
    const handleBenchmarkChange = async (newVal) => { 
      setBenchmarkGrpValue(newVal);
    };

    //--------------------------------------------------------------------------------------------------------------------------------------
    // setup reports required for selected Groups
    //--------------------------------------------------------------------------------------------------------------------------------------
    const rptSetup = `IBIF_ex=frapipro_rptsetup&CLIENT=${client}&accountGroup=${portGrpValue}&segmentGroup=${sectorGrpValue}&benchmarks=01,02,03&fromDate=${fromDate}&asOfDate=${toDate}`;
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await FetchAPI(rptSetup);
                if (response?.data) {
                    console.log('Report setups successfully for selected groups:', response.data);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
    
        if (client) {
            fetchUserData();
        }
    }, [client, portGrpValue, sectorGrpValue, dateRange]); // rerun only if client changes

    return (
        <Box style={{ flexDirection: 'row', display: 'flex', gap: '10px', padding: '10px' }}>
          {fetchPortfolioGroup && (
            <Select 
              label={`Portfolio Group (${portGrpCount})`}
              placeholder="Select Portfolio Group"
              data={portData}
              value={portGrpValue}
              onChange={handlePortChange}
            />
          )}
          {fetchSectorGroup && (
            <Select 
              label="Sector Group"
              placeholder="Select Sector Group"
              value={sectorGrpValue}
              data={sectorGrpData}
              onChange={handleSectorChange}
            />
          )}
          {fetchBenchmarkGroup && (
            <Select 
              label="Benchmark Group"
              placeholder="Select Benchmark Group"
              value={benchmarkGrpValue}
              data={benchmarkGrpData}
              onChange={handleBenchmarkChange}
            />
          )}
        </Box>
        
    );
};