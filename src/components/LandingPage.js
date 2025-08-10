import { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { ActionIcon, Text, Flex, Group, Box } from '@mantine/core';
import Profile from './Profile';
import NavigationBar2 from './NavigationBar2';
import dayjs from 'dayjs';
import { useMediaQuery } from "@mantine/hooks"; // Responsive helper

import { MaterialIcon } from '../google-api-MSO/MaterialIcon';
import { FetchAPI } from '../api';
import useClient from './hooks/useClient';

export default function LandingPage() {
  const [activeButton, setActiveButton] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [dateRange, setDateRange] = useState([dayjs(process.env.REACT_APP_CALENDAR_START_DATE).format('YYYY/MM/DD'), dayjs(new Date()).format('YYYY/MM/DD')]);
  const [selectedPortfolio, setSelectedPortfolio] = useState("");

  //--------------------------------------------------------------------------------------------------------------------------------------
  // getua – this must be run at least 1 time to setup portfolio security for EVERY USERID you test with (we do it at login in production)
  // It will build FRPPRACT.FOC in the workstation so that you won’t get an error
  //--------------------------------------------------------------------------------------------------------------------------------------
  const client = useClient(); // Get the client from the custom hook
  useEffect(() => {
      const fetchUserData = async () => {
          try {
              const response = await FetchAPI(`IBIF_ex=FRPGETUA&CLIENT=${client}`);
              if (response?.data) {
                  console.log('Portfolio Security is fetched successfully:', response.data);
              }
          } catch (error) {
              console.error('Error fetching user data:', error);
          }
      };
  
      if (client) {
          fetchUserData();
      }
  }, [client]); // rerun only if client changes

  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery("(max-width: 1366px)"); // Detect small PC screens
  const handleDarkThemeToggle = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleItemClick = (index) => {
    setActiveButton(index);
    handleNavigation(
      index === 2 ? '/analytic-reports' :
      index === 3 ? '/audits-reports' :
      index === 5 ? '/data-value' :
       '/'
    );
  };

  const backgroundStyle = darkMode
    ? 'linear-gradient(90deg, #1a1a1a, #333)'
    : 'linear-gradient(135deg, #154069, #0e558a, #0677b2, #0a669e, #0289c8)';

  const buttons = [
    {
      id: 1,
      label: 'My Dashboard',
      iconSrc:
        <MaterialIcon
          iconName="dashboard"
          fill={activeButton === 1 ? '#3b3b3b' : 'white'}
          color={activeButton === 1 ? '#3b3b3b' : 'white'}
          size={20.4}
        />
    },
    {
      id: 2,
      label: 'Analytics',
      iconSrc:
        <MaterialIcon
          iconName="leaderboard"
          fill={activeButton === 2 ? '#3b3b3b' : 'white'}
          color={activeButton === 2 ? '#3b3b3b' : 'white'}
          size={20.4}
        />
    },
    {
      id: 3,
      label: 'Audits',
      iconSrc:
        <MaterialIcon
          iconName="search_check"
          fill={activeButton === 3 ? '#3b3b3b' : 'white'}
          color={activeButton === 3 ? '#3b3b3b' : 'white'}
          size={20.4}
        />
    },
    {
      id: 4,
      label: 'Tasks',
      iconSrc:
        <MaterialIcon
          iconName="list_alt_check"
          fill={activeButton === 4 ? '#3b3b3b' : 'white'}
          color={activeButton === 4 ? '#3b3b3b' : 'white'}
          size={20.4}
        />
    },
    {
      id: 5,
      label: 'Data Management',
      iconSrc:
        <MaterialIcon
          iconName="table_edit"
          fill={activeButton === 5 ? '#3b3b3b' : 'white'}
          color={activeButton === 5 ? '#3b3b3b' : 'white'}
          size={20.4}
        />
    },
    {
      id: 6,
      label: 'Data Map',
      iconSrc:
        <MaterialIcon
          iconName="account_tree"
          fill={activeButton === 6 ? '#3b3b3b' : 'white'}
          color={activeButton === 6 ? '#3b3b3b' : 'white'}
          size={20.4}
        />
    },
  ];

  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
  };

  const handlePortfolioChange = (newSearchPort) => {
    setSelectedPortfolio(newSearchPort);
  };

  return (
    <>
      {/* First Header: Logo, Icons, and Profile */}
      <Box
        style={{
          position: 'fixed',
          top: 0,
          width: '100%',
          // background: backgroundStyle,
          backgroundColor: '#fafafa',
          zIndex: 20,
          padding: '6px 4px',
          height: '30px',
        }}
      >
        <Flex align="center" justify="space-between">
          <img
            src="/icons/pro2.0_header_v2_logo.png"
            srcSet="/icons/pro2.0_header_v2_logo@2x.png 2x, /icons/pro2.0_header_v2_logo@3x.png 3x"
            alt="logo"
            style={{ height: 33.4, width: 162.5 }}
          />

          <Flex align="center" justify="flex-end" style={{ gap: '15px'}}>
            <ActionIcon> <MaterialIcon iconName="help" color="black" size={30} /></ActionIcon>
            <Profile onToggle={handleDarkThemeToggle} darkMode={darkMode} onBackgroundStyle={backgroundStyle} />
          </Flex>
        </Flex>
      </Box>

      {/* Second Header: Navigation Menu */}
      <Box className="banner" style={{
        position: "fixed", top: "48px", width: "100%", background: "linear-gradient(135deg, #154069, #0e558a, #0677b2, #0a669e, #0289c8)", zIndex: 10, height: "auto", // Expand based on content 
        minHeight: isSmallScreen ? "70px" : "38px", // Ensure enough space
        display: "flex", flexWrap: "wrap", // Allow second row
        justifyContent: "space-between", alignItems: "center", padding: isSmallScreen ?  "5px" : "0px",
      }} >
        <Flex align="center" justify="space-between">
          <Flex align="center">
            {buttons.map((button) => (
              <Group
                key={button.id}
                align="center"
                spacing={5}
                style={{
                  cursor: 'pointer',
                  marginRight: 8,
                  backgroundColor: activeButton === button.id ? '#FAFAFA' : 'transparent',
                  padding: '5px 5px',
                  marginTop: '1px',
                  borderTopRightRadius: activeButton === button.id ? 3 : 0,
                  borderTopLeftRadius: activeButton === button.id ? 3 : 0,

                }}
                onClick={() => handleItemClick(button.id)}
              >
                <ActionIcon style={{ marginRight: '-5px' }}>{button.iconSrc}</ActionIcon>
                <Text
                  style={{
                    textTransform: 'none',
                    fontSize: 14,
                    paddingRight: '5px',
                    color: activeButton === button.id ? '#3b3b3b' : 'white',
                  }}
                >
                  {button.label}
                </Text>
              </Group>
            ))}
          </Flex>
        </Flex>
        {/* <Anchor href='/dashboard' target="_blank" rel="noopener noreferrer" style={{ color: 'white'}}>An Example of new Tab</Anchor> */}
        <NavigationBar2
          onDateRangeChange={handleDateRangeChange}
          onSearchPortChange={handlePortfolioChange}
          onBackgroundStyle={backgroundStyle}
        />
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        style={{
          padding: '10px',
          marginTop: '96px',
          height: 'calc(100vh - 96px)',
          overflowY: 'auto',
          backgroundColor: '#fafafa',
        }}
      >
        <Outlet context={{ dateRange, selectedPortfolio, setSelectedPortfolio }} />
      </Box>
    </>
  );
}
