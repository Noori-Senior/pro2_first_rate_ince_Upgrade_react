import React, { useState } from 'react';
import { useOutletContext, Outlet } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { FetchAPI } from '../../api.js';
import useClient from '../hooks/useClient.js';
import { Box, NavLink, Text } from '@mantine/core';
import { IconChevronDown, IconChevronRight,IconSearch, IconListDetails, IconAlertTriangle, IconCurrencyDollar,  IconCash, 
  IconScale, IconCategory, IconBarcode, IconReplace, IconPercentage, IconTag, IconCurrency, IconDatabaseExport
} from '@tabler/icons-react';

import FrpAuditExceptions from './reports/FrpAuditExceptions.tsx';
import { PortSectBenchDDL } from '../PortSecBenchDDL.tsx';
import { formatFromDateYYMD, formatToDateYYMMDD } from '../hooks/FormatDates.tsx';

export default function AuditsReports() {
  const animationDirection = 'left'; // or 'right' based on your logic
  const [activeComponent, setActiveComponent] = useState('performance');
  const [expandedItems, setExpandedItems] = useState({
    'auditException': true, // Expand the first item by default
  });

  const [portGrpValue, setPortGrpValue] = useState(null); // Get the changed value
  const [portGrpCount, setPortGrpCount] = useState(0);
  const [portGrpName, setPortGrpName] = useState('');
  
  // Now get the Audit Exceptions reports based on api
  const client = useClient(); // Get the client from the custom hook
  const { dateRange } =  useOutletContext(); // get the selected portfolio and sector values from the parent component
  const fromDate = formatFromDateYYMD(dateRange) ;
  const toDate = formatToDateYYMMDD(dateRange) ;

  const auditExceptionURL = `IBIF_ex=frapi_aud_exceptions&CLIENT=${client}&accountGroup=17351&IN_from=${fromDate}&IN_to=${toDate}`;
    // Unified data fetch using React Query
    const {
      data: fetchedAuditException = [],
      isLoading: loadingAuditException,
    } = useQuery({
      queryKey: ["auditException", client, portGrpValue, dateRange],
      queryFn: async () => {
        const data = await FetchAPI(auditExceptionURL);
        return data;
      },
      enabled: !!client && !!portGrpValue && !!dateRange,
      refetchOnWindowFocus: false,
    });


    // make the labels for NavItems
      const dynamicSubReports = fetchedAuditException.map(record => {
      const isCashReport = record.RPTNAME === 'Cash out of Balance';
      return {
        label: record.RPTNAME + ` (${record.ASOFDATE})`,
        value: isCashReport ? `coob${record.ASOFDATE}` : `uoob${record.ASOFDATE}`,
        component: () => <FrpAuditExceptions ibifex={record.RPTPGM} IN_from={fromDate} IN_to={record.ASOFDATE} IN_group={portGrpName} IN_pcnt={portGrpCount} />,
        icon: isCashReport ? <IconCash size={20.4} /> : <IconScale size={20.4} />,
        // You can include additional data from the record if needed
        originalData: record
      };
    });

  const navItems = [
    { 
      label: 'Audit Exceptions', 
      value: 'auditException', 
      component: null, 
      icon: <IconAlertTriangle size={20.4} />, // More appropriate for exceptions
      subReports: dynamicSubReports
    },
    { 
      label: 'Audit Research', 
      value: 'auditResearch', 
      icon: <IconSearch size={20.4} />, // Better for research
      component: null,  
      subReports: [
        {label: 'Asset Summary Review', value: 'asr', icon: <IconListDetails size={20.4} />}, // Summary/details
        {label: 'Invalid Sector Id', value: 'isid', icon: <IconCategory size={20.4} />}, // Sector-specific
        {label: 'Invalid Transaction Code', value: 'itcode', icon: <IconBarcode size={20.4} />}, // Code representation
        {label: 'Sector Change', value: 'sectChange', icon: <IconReplace size={20.4} />}, // Change/swap
        {label: 'Invalid Transaction Principal', value: 'itprincipal', icon: <IconCurrencyDollar size={20.4} />}, // Money-related
        {label: 'Rate Warnings', value: 'rateWarn', icon: <IconPercentage size={20.4} />}, // Rates/percentages
        {label: 'Financials Out Of Balance', value: 'foob', icon: <IconScale size={20.4} />}, // Balance
        {label: 'Price Warnings', value: 'priceWarn', icon: <IconTag size={20.4} />}, // Pricing
        {label: 'Units without Market Value', value: 'uwmval', icon: <IconCurrency size={20.4} />}, // Market value
        {label: 'Transaction Load Summary', value: 'tlsummary', icon: <IconDatabaseExport size={20.4} />}, // Data export/summary
      ]
    },
  ];

  const toggleExpand = (value) => {
    setExpandedItems(prev => ({
      ...prev,
      [value]: !prev[value]
    }));
  };

  const getActiveComponent = () => {
    // First check main items
    const mainItem = navItems.find(item => item.value === activeComponent);
    if (mainItem) return mainItem.component;
    
    // Then check all sub-reports
    for (const item of navItems) {
      if (item.subReports) {
        const subItem = item.subReports.find(sub => sub.value === activeComponent);
        if (subItem) return subItem.component;
      }
    }
    
    return null;
  };

  const ActiveComponent = getActiveComponent();

  const handlePortGrpChange = (portGrpVal) => {
    setPortGrpValue(portGrpVal);
  };

  const handlePortGrpCount = (portGrpCnt) => {
    setPortGrpCount(portGrpCnt);
  };

  const handlePortGrpName = (portGrName) => {
    setPortGrpName(portGrName);
  };

  return (
    <Box style={{ width: '100%', height: '100vh', display: 'flex', position: 'fixed' }}>
      {/* Navbar Section */}
      <Box style={{ 
        minWidth: 250, 
        height: '100vh', 
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #e8e8e8', 
        backgroundColor: '#f5f5f5',
        marginTop: 3,
        marginLeft: -10,
      }}>
        {/* Sticky Header */}
        <Box style={{
          padding: '10px 15px 5px 10px',
          backgroundColor: '#f5f5f5',
          position: 'sticky',
          top: 0,
          zIndex: 1,
          borderBottom: '1px solid #e8e8e8'
        }}>
          <Text style={{ padding: '5px 0' }}>RUN AUDITS REPORTS</Text>
        </Box>
        
        {/* Scrollable Content */}
        <Box style={{ 
          flex: 1,
          overflowY: 'auto',
          marginBottom: '120px',
          scrollbarWidth: 'thin',
          '&::WebkitScrollbar': {
            width: '6px'
          },
          '&::WebkitScrollbarThumb': {
            backgroundColor: '#c1c1c1',
            borderRadius: '3px'
          }
        }}>
          {loadingAuditException ? (
            <div>Loading...</div>
          ) : (
            navItems.map((item) => (
              <React.Fragment key={item.value}>
                <NavLink
                  label={item.label}
                  active={activeComponent === item.value}
                  onClick={() => {
                    if (item.subReports && item.subReports.length > 0) {
                      toggleExpand(item.value);
                    } else {
                      setActiveComponent(item.value);
                    }
                  }}
                  icon={item.icon}
                  rightSection={
                    item.subReports && item.subReports.length > 0 ? (
                      expandedItems[item.value] ? (
                        <IconChevronDown size={16} />
                      ) : (
                        <IconChevronRight size={16} />
                      )
                    ) : null
                  }
                  style={{ 
                    backgroundColor: activeComponent === item.value ? '#d0e3f7' : 'transparent', 
                    fontSize: '12px',
                    fontFamily: 'Inter', 
                    color: '#3b3b3b',
                  }}
                />
                
                {expandedItems[item.value] && item.subReports && (
                  <Box pl="md">
                    {item.subReports.map((subItem) => (
                      <NavLink
                        key={subItem.value}
                        label={subItem.label}
                        active={activeComponent === subItem.value}
                        onClick={() => setActiveComponent(subItem.value)}
                        icon={subItem.icon}
                        style={{ 
                          backgroundColor: activeComponent === subItem.value ? '#d0e3f7' : 'transparent', 
                          fontSize: '12px',
                          fontFamily: 'Inter', 
                          color: '#3b3b3b',
                        }}
                      />
                    ))}
                  </Box>
                )}
              </React.Fragment>
            ))
          )}
          
        </Box>
      </Box>
      
      {/* Content Section */}
      <Box style={{ flex: 1 }}>
        <Box
          style={{
            marginTop: 2,
            marginLeft: 3,
            position: 'relative',
            overflow: 'hidden',
            width: '100%',
            height: '100%',
            perspective: '1000px',
          }}
        >
          <PortSectBenchDDL 
            onPortGrpChange = {handlePortGrpChange} 
            onPortGrpCount  = {handlePortGrpCount} 
            onPortGrpChName = {handlePortGrpName}
          />
          {ActiveComponent && (
            <Box
              style={{
                position: 'relative',
                transformOrigin: 'center',
                animation: animationDirection === 'left'
                  ? 'reverseRotateLeft 0.3s ease-out forwards'
                  : 'reverseRotateRight 0.3s ease-out forwards',
                width: '100%',
                height: '100%',
              }}
            >
              {React.createElement(ActiveComponent)}
              <Outlet context={{ portGrpValue, portGrpCount, portGrpName }} />
            </Box>
          )}
        </Box>
  
        <style jsx="true">{`
          @keyframes reverseRotateLeft {
            from {
              transform: rotateY(90deg) translateX(-50%);
              opacity: 0;
            }
            to {
              transform: rotateY(0deg) translateX(0%);
              opacity: 1;
            }
          }
        
          @keyframes reverseRotateRight {
            from {
              transform: rotateY(-90deg) translateX(50%);
              opacity: 0;
            }
            to {
              transform: rotateY(0deg) translateX(0%);
              opacity: 1;
            }
          }
        `}</style>
      </Box>
    </Box>
  );
}