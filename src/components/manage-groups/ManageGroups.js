import React from 'react';
import { Box, Divider, NavLink, Text } from '@mantine/core';
import { useState } from 'react';
import { IconBriefcase2, IconChartLine } from '@tabler/icons-react';
import FrpPortfolioGroups from './portfolioGroups/PortfolioGroups.tsx';
import { MaterialIcon } from '../../google-api-MSO/MaterialIcon.js';

export default function ManageGroups() {
  const animationDirection = 'left'; // or 'right' based on your logic
  const [activeComponent, setActiveComponent] = useState('demographics');

  const navItems = [
    { label: 'Portfolio Groups', value: 'demographics', component: FrpPortfolioGroups, icon: <IconBriefcase2 size={20.4} /> },
    { label: 'Benchmark Groups', value: 'item1', component: null, icon: <IconChartLine size={20.4} />  },
    { label: 'Sector Groups', value: 'item2', component: null, icon: <MaterialIcon iconName="account_tree" size={20.4} />  },
  ];

  const getActiveComponent = () => {
    const item = navItems.find(item => item.value === activeComponent);
    return item ? item.component : null;
  };

  const ActiveComponent = getActiveComponent();

  return (
    <Box style={{ width: '100%', height: '100vh', display: 'flex', position: 'fixed' }}>
      {/* Navbar Section */}
      <Box style={{ minWidth: 250, height: '100vh', padding: '10px 0', borderRight: '1px solid #e8e8e8', backgroundColor: '#f5f5f5',overflowY: 'auto', marginTop: 2 }}
      >
        <Text style={{ padding: '5px 15px'}}>MANAGE GROUPS</Text>
        <Divider style={{ borderColor: '#e8e8e8', marginBottom: 5 }} />
        {navItems.map((item) => (
          <NavLink
            key={item.value}
            label={item.label}
            active={activeComponent === item.value}
            onClick={() => setActiveComponent(item.value)}
            icon={item.icon}
            style={{ 
              backgroundColor: activeComponent === item.value ? '#d0e3f7' : 'transparent', 
              fontSize: '12px',
              fontFamily: 'Inter', 
              color: '#3b3b3b',
            }}
          />
        ))}
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