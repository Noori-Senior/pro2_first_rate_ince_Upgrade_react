import React, { useState } from 'react';
import { Select, Flex, ActionIcon, Text, Group, Popover, Input, Skeleton, Table } from '@mantine/core';
import CustomDateRangePicker from './CustomDateRangePicker';
import { USER_SVG, USERS_SVG, CalendarTodayOutlinedIcon } from '../svgicons/svgicons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { FetchAPI } from '../api';
import useClient from './hooks/useClient';
import { MaterialIcon } from '../google-api-MSO/MaterialIcon';

//------------------------------------------------------------------------------------------
// Fetch Function
//------------------------------------------------------------------------------------------
const NavigationBar2 = ({ onDateRangeChange, onSearchPortChange, onBackgroundStyle }) => {
  const [portfolioFilter, setPortfolioFilter] = useState('8');
  const [query, setQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const client = useClient();

  const navigate = useNavigate();
  const handleGroupManagement = () => {
    navigate('/manage-groups');
  };

  //------------------------------------------------------------------------------------------
  // Get user details
  //------------------------------------------------------------------------------------------
  const acctEntityUri = `IBIF_ex=frd_ae_get_entities_api&QUERY=${query}&CONTEXT=S&&CLIENT=${client}`;

  // Use TanStack Query
  const { data: response, isLoading } = useQuery({
    queryKey: ['acctEntityDetails', query, portfolioFilter],
    queryFn: () => FetchAPI(acctEntityUri),
    enabled: !!query,  // Fetch only if query is not null
  });
  const acctEntities = Array.isArray(response) ? response : [];

  // Handle search action
  const handleSearch = (event) => {
    if (event) {
      setAnchorEl(event.currentTarget); // Set the anchor element to show the popover
    } else {
      setAnchorEl(document.activeElement); // Fallback to the currently focused element
    }
  };

  // Handle closing the popover
  const handleClose = () => { setAnchorEl(null); };

  const open = Boolean(anchorEl);
  const id = open ? 'search-popover' : undefined;

  // Handle clicking on a result
  const handleResultClick = (portfolio) => {
    onSearchPortChange(portfolio); // this value is passing to main component reload
    setQuery(portfolio); // show the selected portfolio in text box
    handleClose(); // Close popover after selection
  };

  // Function to handle changes in date range and search term
  const handleDateRangeChange = async (newValue) => {
    // Convert ISO date strings to Date objects
    const startDate = new Date(newValue[0]);
    const endDate = new Date(newValue[1]);

    // Check if both startDate and endDate are valid Date objects
      if (!isNaN(startDate) && !isNaN(endDate)) {
        const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
      };

      const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      const formattedStartDate = startDate.toLocaleDateString('en-US', options);
      const formattedEndDate = endDate.toLocaleDateString('en-US', options);
      
      // When the date calendar is changing build frpprvars for selected date range
      await FetchAPI(`IBIF_ex=FRAPI_BUILD_FRPPRVARS&CLIENT=${client}&fromDate=${formatDate(startDate)}&asOfDate=${formatDate(endDate)}`);
      
      const formattedDateRange = `["${formattedStartDate}", "${formattedEndDate}"]`;
      onDateRangeChange(formattedDateRange); // Pass the formatted date range to parent
      // console.log("formattedDateRange: ", formattedDateRange);
    } else {
      console.log("Invalid dates selected.");
    }
  };

  const CustomSelectItem = React.forwardRef(({ label, icon, ...others }, ref) => (
    <Flex {...others} ref={ref} style={{ alignItems: 'center', marginLeft: -10 }}>
      {icon}
      <Text style={{ marginLeft: 10, marginTop: 2 }}>{label}</Text>
    </Flex>
  ));

  const data = [
    { value: '8', label: 'All', icon: <ActionIcon color="white"> <MaterialIcon iconName="filter_alt" color='black' size='25px' /> </ActionIcon>, minWidth: 80 },
    { value: '1', label: 'Single Portfolio', icon: <ActionIcon color="white"> <MaterialIcon iconName="person" color='black' size='25px' /> </ActionIcon>, minWidth: 140 },
    { value: '2', label: 'All Portfolio Groups', icon: <ActionIcon color="white"> <MaterialIcon iconName="folder_open" color='black' size='25px' /> </ActionIcon>, minWidth: 165 },
    { value: '3', label: 'Static Portfolio Groups', icon: <ActionIcon color="white"> <MaterialIcon iconName="folder_open" color='black' size='25px' /> </ActionIcon>,  minWidth: 180 },
    { value: '4', label: 'Dynamic Portfolio Groups', icon: <ActionIcon color="white"> <MaterialIcon iconName="supervisor_account" color='black' size='25px' /> </ActionIcon>, minWidth: 195 },
    { value: '5', label: 'ALL Composites', icon: <ActionIcon color="white"> <MaterialIcon iconName="supervisor_account" color='black' size='25px' /> </ActionIcon>, minWidth: 150 },
    { value: '6', label: 'ACE Composites', icon: <ActionIcon color="white"> <MaterialIcon iconName="supervisor_account" color='black' size='25px' /> </ActionIcon>, minWidth: 150 },
    { value: '7', label: 'Non-ACE Composites', icon: <ActionIcon color="white"> <MaterialIcon iconName="supervisor_account" color='black' size='25px' /> </ActionIcon>, minWidth: 175 },
    { value: '9', label: 'Portfolio ID List', icon: <ActionIcon color="white"> <MaterialIcon iconName="assignment" color='black' size='25px' /> </ActionIcon>, minWidth: 140 },
  ];

  const selectedOption = data.find(item => item.value === portfolioFilter);

  return (
    <Group gap="sm">
      {/* Search Input */}
      <Flex
        radius="5"
        className='nav-flex-portf'
      >
        {/* Dropdown for filtering - now fully merged with input */}
        <Select
          variant="unstyled"
          value={portfolioFilter}
          onChange={setPortfolioFilter}
          icon={selectedOption?.icon}
          data={data}
          itemComponent={CustomSelectItem}
          size="xs"
          rightSection={<></>}
          style={{
            width: selectedOption?.minWidth || 150,
            minWidth: selectedOption?.minWidth || 150,
            zIndex: 500,
            padding: '0 2px',
          }}
          styles={{
            input: {
              border: 'none',
              backgroundColor: '#FAFAFA',
              paddingRight: '8px',
              // Add right margin to prevent text collision
              marginRight: '4px',
              fontSize: 12,
              fontFamily: 'inter'
            },
            dropdown: {
              minWidth: '200px !important', // Force minimum width for dropdown
            },
            item: {
              whiteSpace: 'nowrap',
              minWidth: '100%',
            },
          }}
        />

        {/* Input for search - fully merged */}
        <Input
          variant="unstyled"
          value={query}
          placeholder="Search Portfolio/ID"
          size="xs"
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(e);
            }
          }}
          style={{
            flex: 1,
            padding: '0 8px',
            // Add left margin to prevent text collision
            marginLeft: '4px'
          }}
          styles={{
            input: {
              backgroundColor: '#FAFAFA',
              fontSize: 12,
              fontFamily: 'inter',
              border: 'none',
              height: '100%',
              // Remove left border if it exists
              borderLeft: 'none !important'
            },
          }}
        />
      </Flex>

      {/* Popover for Search Result List */}
      <Popover id={id} width={500} position="bottom" shadow="lg" opened={open} offset={{ mainAxis: 20, }} onClose={handleClose}>
        {/* Header for columns */}
        <Popover.Target>
          <Text></Text>
        </Popover.Target>
        <Popover.Dropdown style={{ width: '500px', maxHeight: '550px', overflowY: 'auto', padding: 0 }}>
          <div style={{ width: '498px', maxHeight: '450px', overflowY: 'auto' }}>
            <Table striped>
              <thead style={{ background: `${onBackgroundStyle}`, position: 'sticky', top: 0, zIndex: 1 }}>
                <tr>
                  <th className='rpt-header-4'>Portfolio</th>
                  <th className='rpt-header-4'>Inception</th>
                </tr>
              </thead>

              <tbody className='rpt-body'>
                {isLoading ? (
                  <tr>
                    <td colSpan={2}>
                      <Skeleton height={8} mt={6} radius="xl" />
                      <Skeleton height={8} mt={6} radius="xl" />
                      <Skeleton height={8} mt={6} radius="xl" />
                    </td>
                  </tr>
                ) : (
                  !acctEntities ? (
                    <tr><td colSpan={2}>{query.length > 0 ? (<Text component="span">No Portfolio Found!</Text>) : (<Text component="span">Please type a portfolio ID/Name</Text>)}</td></tr>
                  ) : (
                    acctEntities?.map((result) => (
                      <tr key={result.E_ID} onClick={() => handleResultClick(result.E_ID)} style={{ cursor: 'pointer' }}>
                        <td>
                          <Flex component="span" style={{ alignItems: 'center', marginLeft: -5 }}>
                            {result.E_ID.startsWith('AGG') ? <ActionIcon><USERS_SVG /></ActionIcon> : <ActionIcon><USER_SVG /></ActionIcon>}
                            <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, padding: 0, marginLeft: 5 }}>
                              <Text component="span">{result.E_NAME}</Text>
                              <Text component="span">{result.E_ID}</Text>
                            </span>
                          </Flex>
                        </td>
                        <td>
                          <Flex component="span">
                            <ActionIcon component="span" style={{ marginRight: 5 }}><CalendarTodayOutlinedIcon /></ActionIcon>
                            <Text component="span" style={{ textAlign: 'right' }}>{result.E_INCEPT}</Text>
                          </Flex>
                        </td>
                      </tr>
                    ))
                  )
                )}
              </tbody>
            </Table>
          </div>
          {!acctEntities ? (
            <Text></Text>
          ) : (
            <Text style={{ padding: 1, borderRadius: 2, border: '1px solid #ddd', fontWeight: 'bold', textAlign: 'center' }}>Total Records: {acctEntities && acctEntities?.length}</Text>
          )}

        </Popover.Dropdown>
      </Popover>

      {/* Calendar Date Picker */}
      <CustomDateRangePicker onDateRangeChange={handleDateRangeChange} />

      {/* Save Icon */}
      <ActionIcon color="white" style={{ transform: 'translateX(-6px)' }}
       onClick={handleGroupManagement} title="Manage Groups"
      >
        <MaterialIcon iconName="group" color='#ffffff' size='25px' />
      </ActionIcon>


    </Group>
  );
};

export default NavigationBar2;
