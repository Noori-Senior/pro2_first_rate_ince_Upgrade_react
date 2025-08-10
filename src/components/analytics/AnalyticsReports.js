import React, { useState } from 'react';
import { Box, NavLink, Text } from '@mantine/core';
import { IconChartLine, IconChevronDown, IconChevronRight, IconTrendingUp, IconCalendarStats, IconLink, IconHistory,  IconDatabase,           
  IconAlertCircle, IconTimeline,  IconPigMoney, IconLayersIntersect, IconChartPie, IconScale, IconFileAnalytics, IconTimelineEvent,     
  IconPuzzle, IconSearch, IconScaleOutline, IconFiles, IconChartArrows, IconExclamationMark, IconStack2, IconClipboardCheck, IconClipboardList,     
  IconUser, IconUsers,  IconWallet, IconFilterSearch, IconDashboard, IconListDetails, IconLayersLinked, IconExchange, IconAlertTriangle, 
  IconCalendarMonth, IconSitemap, IconGridDots, IconClockDollar, IconCalendarCheck, IconAlignLeft, IconCurrencyDollar, IconCalendarEvent,
  IconLinkOff, IconCalculator, IconListCheck, IconHierarchy, IconCurrencyOff, IconCalendarX, IconCategory, IconCategory2, IconCash, IconCoins,
  IconChartBar,
} from '@tabler/icons-react';

import FrpPMLReport from './reports/FrpPML.tsx';
import { PortSectBenchDDL } from '../PortSecBenchDDL.tsx';

export default function AnalyticsReports() {
  const animationDirection = 'left'; // or 'right' based on your logic
  const [activeComponent, setActiveComponent] = useState('performance');
  const [expandedItems, setExpandedItems] = useState({
    'performance': true, // Expand the first item by default
    'benchmark': false,
  });

  const navItems = [
    { 
      label: 'Performance Reports', 
      value: 'performance', 
      component: null, 
      icon: <IconTrendingUp size={20.4} />,
      subReports: [
        {label: 'Master Listing - Annualized', value: 'mla', component: FrpPMLReport, icon: <IconCalendarStats size={20.4} />},
        {label: 'Master Listing - Linked', value: 'mll', component: null, icon: <IconLink size={20.4} />},
        {label: 'Master Listing (w/datestamp)', value: 'mlwd', component: null, icon: <IconHistory size={20.4} />},
        {label: 'Master Listing - Base', value: 'mlb', component: null, icon: <IconDatabase size={20.4} />},
        
        {label: 'Performance Gap Check', value: 'pgc', component: null, icon: <IconAlertCircle size={20.4} />},
        {label: 'Performance ITD/Gap Check', value: 'pigc', component: null, icon: <IconTimeline size={20.4} />},
        
        {label: 'Asset Source of Returns', value: 'asor', component: null, icon: <IconPigMoney size={20.4} />},
        {label: 'Asset Source of Returns - Sector Direct 2', value: 'asorsd2', component: null, icon: <IconLayersIntersect size={20.4} />},
        {label: 'Asset Source of Returns - Sector Direct 3', value: 'asorsd3', component: null, icon: <IconLayersIntersect size={20.4} />},
        
        {label: 'Rate Distribution', value: 'rdist', component: null, icon: <IconChartPie size={20.4} />},
        {label: 'Rate Distribution for All Portfolios', value: 'rdistfallport', component: null, icon: <IconChartPie size={20.4} />},
        
        {label: 'Tax Harvest Report', value: 'thr', component: null, icon: <IconScale size={20.4} />},
        {label: 'Tax Impact Report', value: 'tir', component: null, icon: <IconFileAnalytics size={20.4} />}
      ],
    },
    { 
      label: 'Benchmark Reports', 
      value: 'benchmark', 
      icon: <IconChartLine size={20.4} />,
      component: null,  
      subReports: [
        {label: 'Account-Specific Policy Constituent Detail', value: 'aspcd', icon: <IconPuzzle size={20.4} />},
        {label: 'Account-Specific Policy Constituent History', value: 'aspch', icon: <IconHistory size={20.4} />},
        
        // Benchmark Master Listings
        {label: 'Benchmark Annualized Master Listing', value: 'baml', icon: <IconCalendarStats size={20.4} />},
        {label: 'Benchmark Linked Master Listing', value: 'blml', icon: <IconLink size={20.4} />},
        
        // Gap Checks
        {label: 'Benchmark Gap Check - Monthly', value: 'bgcm', icon: <IconAlertCircle size={20.4} />},
        {label: 'Benchmark Gap Check - Daily', value: 'bgcd', icon: <IconTimelineEvent size={20.4} />},
        
        // Blended Benchmarks
        {label: 'Blended Benchmark Annualized ML', value: 'bbaml', icon: <IconLayersIntersect size={20.4} />},
        {label: 'Blended Benchmark Linked ML', value: 'bblml', icon: <IconLink size={20.4} />},
        {label: 'Blended Benchmark Detail - Index Pkg', value: 'bbdipg', icon: <IconFiles size={20.4} />},
        
        // Benchmark Details
        {label: 'Blended Benchmark Detail - Base', value: 'bbdb', icon: <IconDatabase size={20.4} />},
        {label: 'Blended Benchmark Gap Check', value: 'bbgc', icon: <IconChartArrows size={20.4} />},
        
        // Special Benchmark Reports
        {label: 'Blended Benchmark ITD/Gap Check', value: 'bbigc', icon: <IconChartLine size={20.4} />},
        {label: 'Missing Benchmark Returns', value: 'mbr', icon: <IconSearch size={20.4} />},
        {label: 'Policy-Weighted Benchmark Detail', value: 'pwbd', icon: <IconScaleOutline size={20.4} />},
        {label: 'Policy Benchmark Detail', value: 'pbd', icon: <IconFileAnalytics size={20.4} />},
        {label: 'Policy Benchmark Miscompare', value: 'pbm', icon: <IconExclamationMark size={20.4} />},
        {label: 'Benchmark Inception Date Guess', value: 'bidg', icon: <IconSearch size={20.4} />}
      ]
    },
    { 
      label: 'Demographic Reports', 
      value: 'demographic', 
      icon: <IconUser size={20.4} />,
      component: null,  
      subReports: [
        {label: 'Management Portfolio Demographics', value: 'mpd', icon: <IconChartPie size={20.4} />},  // Represents demographic breakdown
        {label: 'New and Closed Portfolios', value: 'NaCP', icon: <IconTimelineEvent size={20.4} />},  // Shows lifecycle events
        {label: 'Portfolio Tier Level Audit', value: 'PTLA', icon: <IconStack2 size={20.4} />},  // Represents tiered structure
        {label: 'Sched Reporting Audit - All Portfolios', value: 'SRAAP', icon: <IconClipboardCheck size={20.4} />},  // Audit complete status
        {label: 'Sched Reporting Audit - Sel Portfolios', value: 'SRASP', icon: <IconClipboardList size={20.4} />},  // Audit for selected items
      ]
    },
    { 
      label: 'Composite Reports', 
      value: 'composite', 
      icon: <IconUsers size={20.4} />,
      component: null,  
      subReports: [
        { label: 'Aggs By Account', value: 'ABA', icon: <IconWallet size={20.4} /> },  
        // "Wallet" represents accounts; alternative: <IconCoin> for financial focus
        { label: 'Aggs Containing Selected Accounts', value: 'ACSA', icon: <IconFilterSearch size={20.4} /> },  
        // Emphasizes filtering/searching within selections
        { label: 'Composite Status Summary', value: 'CSS', icon: <IconDashboard size={20.4} /> },  
        // "Dashboard" suits high-level summaries
        { label: 'Composite Status Variance', value: 'CSV', icon: <IconChartLine size={20.4} /> },  
        // "Line chart" for trends/variance over time
        { label: 'Composite Participation Listing', value: 'CPL', icon: <IconListDetails size={20.4} /> },  
        // "List" implies detailed breakdowns
        { label: 'Compound Composite - Redundant Constituents', value: 'CCRC', icon: <IconLayersLinked size={20.4} /> },  
        // "Layers" + "Linked" for overlapping/redundant structures
      ]
    },
    { 
      label: 'Transaction and Holding Reports', 
      value: 'tranAndHolding', 
      icon: <IconExchange size={20.4} />,
      component: null,  
      subReports: [
        { label: 'Missing Assets on FRPSEC', value: 'MAonFRPSEC', icon: <IconAlertTriangle size={20.4} /> },
        { label: 'Monthly Holdings Report', value: 'MHR', icon: <IconCalendarMonth size={20.4} /> },
        { label: 'Monthly Holdings Report - Sector Direct 2', value: 'MHRSD2', icon: <IconSitemap size={20.4} /> },
        { label: 'Monthly Holdings Report - Sector Direct 3', value: 'MHRSD3', icon: <IconSitemap size={20.4} /> },
        { label: 'TEOP By Sector', value: 'TEOPBS', icon: <IconGridDots size={20.4} /> },
        { label: 'TEOP By Sector - Sector Direct 2', value: 'TEOPBSD2', icon: <IconGridDots size={20.4} /> },
        { label: 'TEOP By Sector - Sector Direct 3', value: 'TEOPBSD3', icon: <IconGridDots size={20.4} /> },
        { label: 'TEOP By Trade Date', value: 'TEOPTD', icon: <IconClockDollar size={20.4} /> },
        { label: 'TEOP By Settlement Date', value: 'TEOPSD', icon: <IconCalendarCheck size={20.4} /> },
        { label: 'TEOP By Description', value: 'TEOPBD', icon: <IconAlignLeft size={20.4} /> },
        { label: 'TEOP By Settlement Currency', value: 'TEOPSC', icon: <IconCurrencyDollar size={20.4} /> }, 
      ]
    },
    { 
      label: 'Daily Reports', 
      value: 'dailyreports', 
      icon: <IconCalendarEvent size={20.4} />,
      component: null,  
      subReports: [
        { label: 'Computed Daily Master Listing', value: 'CDML', icon: <IconCalculator size={20.4} /> },
        { label: 'Master Listing', value: 'DailyML', icon: <IconListCheck size={20.4} /> },
        { label: 'Daily Holdings Listing', value: 'DailyHL', icon: <IconDatabase size={20.4} /> },
        { label: 'Daily Holdings Listing - Sector Direct 2', value: 'DailyHLSD2', icon: <IconHierarchy size={20.4} /> },
        { label: 'Daily Holdings Listing - Sector Direct 3', value: 'DailyHLSD3', icon: <IconSitemap size={20.4} /> },
        { label: 'Zero Prices', value: 'DailyZP', icon: <IconCurrencyOff size={20.4} /> },
        { label: 'Missing Month End Accruals', value: 'DailyMMEC', icon: <IconCalendarX size={20.4} /> },
        { label: 'UVR Tolerance Exceptions', value: 'DailyUVRTE', icon: <IconAlertCircle size={20.4} /> },
        { label: 'Daily Linked Returns Not Posted', value: 'DailyLRNP', icon: <IconLinkOff size={20.4} /> },
        { label: 'Daily Holdings Listing - Sector Direct 1 CTG', value: 'DailyHLSD1CTG', icon: <IconCategory size={20.4} /> },
        { label: 'Daily Holdings Listing - Sector Direct 2 CTG', value: 'DailyHLSD2CTG', icon: <IconCategory2 size={20.4} /> } 
      ]
    },
    { 
      label: 'Multi Currency Reports', 
      value: 'multiCurrency', 
      icon: <IconCurrencyDollar size={20.4} />,
      component: null,  
      subReports: [
        { label: 'Local Values Performance Master Listing', value: 'LVPML', icon: <IconChartLine size={20.4} /> },
        { label: 'Transaction Effects on Cash', value: 'MLTEC', icon: <IconCash size={20.4} /> },
        { label: 'Transaction Effects on Sector', value: 'MLTES', icon: <IconSitemap size={20.4} /> },
        { label: 'Transaction Effects on Total Fund', value: 'MLTETF', icon: <IconPigMoney size={20.4} /> }
      ]
    },
    { 
      label: 'Multi Currency Daily Reports', 
      value: 'multiCurrencyDaily', 
      icon: <IconCoins size={20.4} />,
      component: null,  
      subReports: [
        { label: 'Daily Master Listing (Local Values)', value: 'DailyLVPML', icon: <IconChartBar size={20.4} /> },
        { label: 'Daily Holdings (Local Values)', value: 'DailyHLV', icon: <IconDatabase size={20.4} /> },
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
          <Text style={{ padding: '5px 0' }}>RUN STANDARD REPORTS</Text>
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
          {navItems.map((item) => (
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
          ))}
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
          <PortSectBenchDDL /> {/* DDLs */}
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