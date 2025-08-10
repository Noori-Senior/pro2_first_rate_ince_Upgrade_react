import React, { useState, useEffect } from 'react';
import { Select, Box, Divider, Group, Text } from '@mantine/core';
import {
  IconUsers, IconCalendarUser, IconPigMoney, IconExchange, IconCoin, IconChartLine, IconLayersLinked, IconShield, IconChartHistogram, IconBrandAngular, IconHierarchy2,
  IconReceipt2, IconPackages, IconDatabaseExclamation, IconAddressBook, IconTimeline, IconSitemap, IconHours24, IconTargetArrow, IconPackage, IconChartPie, IconAB2,
  IconShieldLock, 
}
  from '@tabler/icons-react';
import FrpDemographics from './demographics/FrpDemographics.tsx';
import FrpHistDemographics from './demographics/FrpHistDemographics.tsx';
import FrpHoldings from './holdings/FrpHoldings.tsx';
import FrpTransactions from './transaction/FrpTransaction.tsx';
import FrpComposites from './composites/FrpComposites.tsx';
import FrpPrices from './prices/FrpPrices.tsx';
import FrpSecurity from './security/FrpSecurity.tsx';
import FrpSectors from './monthlySectorReturns/FrpSectors.tsx';
import FrpAssetTypes from './assetType/FrpAssetType.tsx';
import FrpDirectedAssets from './directedAssets/FrpDirectedAssets.tsx';
import FrpBasisPointFees from './basisPointFees/FrpBasisPointFees.tsx';
import FrpTolerancePackages from './tolerancePackages/FrpTolerancePackages.tsx';
import FrpDepreciationAlertData from './depreciationAlertData/FrpDepreciationAlertData.tsx';
import FrpCustomerCI from './customerCI/FrpCustomerCI.tsx';
import FrpHistoricalPS from './historicalPortfolioStatus/FrpHistoricalPS.tsx';
import FrpSectorIcp from './sectorInception/FrpSectorIcp.tsx';
import FrpTargetPolicyAssignment from './FrpTargetPolicyAssignments.tsx';
import FrpBenchmarkPackagess from './benchmarkPackages/FrpBenchmarkPackages.tsx';
import FrpExchangeRates from './exchangeRates/FrpExchangeRates.tsx';
import { FrpBenchmarkDemographics } from './FrpBenchmarkDemographics.tsx';
import { FrpSectorDemographics } from './FrpSectorDemographics.tsx';
import FrpIndexs from './index/FrpIndex.tsx';
import FrpSecurityChar from './FrpSecurityCharacteristics.tsx';

const dataValueComponents = [
  { label: 'Portfolio Demographics', value: 'demographics', component: FrpDemographics, icon: <IconUsers size={20} /> },
  { label: 'Historical Portfolio Demographics', value: 'hist-demographics', component: FrpHistDemographics, icon: <IconCalendarUser size={20} /> },
  { label: 'Holdings', value: 'holdings', component: FrpHoldings, icon: <IconPigMoney size={20} /> },
  { label: 'Transactions', value: 'transactions', component: FrpTransactions, icon: <IconExchange size={20} /> },
  { label: 'Global Price', value: 'prices', component: FrpPrices, icon: <IconCoin size={20} /> },
  { label: 'Monthly Benchmark', value: 'monthlyIndex', component: () => <FrpIndexs isDaily={false} />, icon: <IconChartLine size={20} /> },
  { label: 'Monthly Sector Returns', value: 'monthly-sector-returns', component: FrpSectors, icon: <IconChartHistogram size={20} /> },
  { label: 'Composites / ACE', value: 'composites', component: FrpComposites, icon: <IconLayersLinked size={20} /> },
  { label: 'Asset Identification', value: 'security', component: FrpSecurity, icon: <IconShield size={20} /> },
  { label: 'Asset Type', value: 'atype', component: FrpAssetTypes, icon: <IconBrandAngular size={20} /> },
  { label: 'Tolerance Packages', value: 'tolrp', component: FrpTolerancePackages, icon: <IconPackages size={20} /> },
  { label: 'Directed Assets', value: 'dassets', component: FrpDirectedAssets, icon: <IconHierarchy2 size={20} /> },
  { label: 'Basis Point Fees', value: 'bpfees', component: FrpBasisPointFees, icon: <IconReceipt2 size={20} /> },
  { label: 'Depreciation Alert Data', value: 'mifid', component: FrpDepreciationAlertData, icon: <IconDatabaseExclamation size={20} /> },
  { label: 'Customer Contact Info', value: 'frpcstmr', component: FrpCustomerCI, icon: <IconAddressBook size={20} /> },
  { label: 'Historical Portfolio Status', value: 'frpacct', component: FrpHistoricalPS, icon: <IconTimeline size={20} /> },
  { label: 'Sector Inception', value: 'frpsicp', component: FrpSectorIcp, icon: <IconSitemap size={20} /> },
  { label: 'Daily Returns', value: 'frpindxd', component: () => <FrpIndexs isDaily={true} />, icon: <IconHours24 size={20} /> },
  { label: 'Target Policy Assignments', value: 'frpacbnc', component: FrpTargetPolicyAssignment, icon: <IconTargetArrow size={20} /> },
  { label: 'Benchmark Packages', value: 'frpipkg2', component: FrpBenchmarkPackagess, icon: <IconPackage size={20} /> },
  { label: 'Benchmark Demographics', value: 'frpsi1I', component: FrpBenchmarkDemographics, icon: <IconChartPie size={20} /> },
  { label: 'Exchange Rates', value: 'frpexch', component: FrpExchangeRates, icon: <IconAB2 size={20} /> },
  { label: 'Sector/Category Demographics', value: 'frpsi1S', component: FrpSectorDemographics, icon: <IconSitemap size={20} /> },
  { label: 'Security Characteristics', value: 'frpchar', component: FrpSecurityChar, icon: <IconShieldLock size={20} /> },
];


const SelectItem = ({ icon, label, ...others }) => (
  <div {...others}>
    <Group spacing="xs">
      {icon}
      <Text size="xs">{label}</Text>
    </Group>
  </div>
);



export default function DataValue() {
  const [selectedValue, setSelectedValue] = React.useState(dataValueComponents[0].value);
  const selectedOption = dataValueComponents.find(item => item.value === selectedValue);
  const [animationDirection, setAnimationDirection] = React.useState('left');

  const handleChange = (newValue) => {
    const currentIndex = dataValueComponents.findIndex(item => item.value === selectedValue);
    const newIndex = dataValueComponents.findIndex(item => item.value === newValue);
    setAnimationDirection(newIndex > currentIndex ? 'left' : 'right');
    setSelectedValue(newValue);
  };
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const updateScreenWidth = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", updateScreenWidth);

    return () => window.removeEventListener("resize", updateScreenWidth);
  }, []);

  const isSmallScreen = screenWidth <= 1366; // ✅ Updates dynamically

  return (
    <Box style={{ width: "100%", marginTop: isSmallScreen ? "30px" : "0px" }}>

      <Select
        value={selectedValue}
        onChange={handleChange}
        data={dataValueComponents.map(item => ({
          value: item.value,
          label: item.label,
          icon: item.icon
        }))}
        icon={selectedOption?.icon}
        itemComponent={SelectItem}
        size="md"
        radius="lg"
        placeholder="Select a data value"
        searchable
        filter={(value, item) =>
          item.label?.toLowerCase().includes(value.toLowerCase().trim()) ?? false
        }
        nothingFound="No options found"
        style={{ width: 300, marginBottom: 10 }}
        styles={{
          input: {
            borderColor: '#d6d6d6',
            color: '#545454',
            fontSize: 12,
            fontFamily: 'inter',
            height: 30,
            minHeight: 30
          },
          item: {
            fontSize: 11,
            padding: '5px 10px'
          }
        }}
      />

      <Divider style={{ borderColor: '#e8e8e8', marginBottom: 5 }} />

      <Box
        style={{
          marginTop: 6,
          marginLeft: 3,
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          height: '100%',
          perspective: '1000px',
        }}
      >
        {selectedOption && (
          <Box
            key={selectedOption.value}
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
            {React.createElement(selectedOption.component)}
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
  );
}