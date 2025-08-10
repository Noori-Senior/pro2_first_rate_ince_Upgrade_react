import { useState } from 'react';
import { Select, Flex, ActionIcon, Text, Group, Popover, TextInput, Skeleton, Table, Button } from '@mantine/core';
import CustomDateRangePicker from './CustomDateRangePicker';
import { IconSearch, IconX, IconUser, IconUsers } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { FetchAPI } from '../api';
import useClient from './hooks/useClient';
import { MaterialIcon } from '../google-api-MSO/MaterialIcon';

//------------------------------------------------------------------------------------------
// Fetch Function
//------------------------------------------------------------------------------------------
const NavigationBar2 = ({ onDateRangeChange, onSearchPortChange, onBackgroundStyle }) => {
  const [portfolioFilter, setPortfolioFilter] = useState('1');
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

  // handle the clear action
  const clearInput = () => {
    setQuery('');
    onSearchPortChange('');
  }

  // Handle closing the popover
  const handleClose = () => { setAnchorEl(null); };

  const open = Boolean(anchorEl);
  const id = open ? 'search-popover' : undefined;

  // Handle clicking on a result
  const handleResultClick = (portfolio, portName) => {
    onSearchPortChange(portfolio); // this value is passing to main component reload
    setQuery(portfolio + ' - ' + portName); // show the selected portfolio in text box
    handleClose(); // Close popover after selection
  };

  const handleResultClickWithConsitwents = async (portfolio, portName) => {
    const agg = portfolio.substring(3, 14); // Get the value of agg
    const consituentUri = `IBIF_ex=frapipro_TableRtv&CLIENT=${client}&theTable=FRPAGG&fields=ACCT&filters=AGG(${agg})`;
    const consituentResp = await FetchAPI(consituentUri); //get the underlying account for selected AGG
    const acctList = consituentResp.map(item => item.ACCT).join(','); // convert the consituents to , delimited
    onSearchPortChange(acctList);
    setQuery(portfolio + ' - ' + portName); // show the selected portfolio in text box
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


  // handle the filter value changes
  const handleFilterChange = (newFilter) => {
    setPortfolioFilter(newFilter); // get the selected filter
    clearInput(); // clear the previous search data and settings
  };

  const data = [
    { value: '1', label: 'Individual' },
    { value: '61', label: 'Dynamic' },
    { value: '60', label: 'Static' }
  ];

  const inputPlaceHolder = portfolioFilter === '1' ? 'Type portfolio name or ID...' : portfolioFilter === '2' ? 'Search dynamic groups..' : 'Search static groups...';

  return (
    <Group noWrap spacing="xs">
      {/* Popover for Search Result List */}
      <Popover id={id} width={415} position="bottom" radius="lg" shadow="lg" opened={open} offset={{ mainAxis: 0, }} onClose={handleClose}>
        {/* Header for columns */}
        <Popover.Target>
          <Flex radius="8" className='nav-flex-portf'>
            <Select
              placeholder="Filter"
              value={portfolioFilter}
              data={data}
              onChange={handleFilterChange}
              styles={() => ({
                input: {
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                  borderRight: 0,
                  width: '100px',
                  fontSize: '12px',
                  fontFamily: 'inter',
                  borderTopLeftRadius: 8,
                  borderBottomLeftRadius: 8,
                  paddingRight: 12,
                  paddingLeft: 12,
                  borderColor: 'rgb(229, 231, 235)'
                },
                dropdown: {
                  minWidth: '100px',
                  backgroundColor: '#F9FAFB',
                  borderRadius: '8px',
                }
              })}
            />
            <TextInput
              placeholder={inputPlaceHolder}
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(e);
                }
              }}
              icon={<IconSearch size={16} />}
              rightSection= {
                query && (
                  <IconX
                   size={16}
                   onClick={clearInput}
                   style={{ cursor: 'pointer'}}
                  />
                )
              }
              styles={() => ({
                root: {
                  flexGrow: 1,
                },
                input: {
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  fontSize: '12px',
                  fontFamily: 'inter',
                },
              })}
            />
          </Flex>
        </Popover.Target>
        <Popover.Dropdown style={{ width: '410px', maxHeight: '256px', overflowY: 'auto', padding: 0 }}>
          <div style={{ width: '390px', overflowY: 'auto' }}>
            <Table striped>

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
                      <tr key={result.E_ID} style={{ cursor: 'pointer' }}>
                        <td>
                          <Flex component="span" style={{ alignItems: 'center', marginLeft: -5 }}>
                            {/* Icon selection logic */}
                            <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, padding: 0, marginLeft: 5 }}>
                              <Text component="span">{result.E_NAME}</Text>
                              <Text component="span">{result.E_ID}</Text>
                            </span>
                          </Flex>
                        </td>
                        <td>
                          <Flex
                            component="span"
                            style={{
                              alignItems: 'center',
                              justifyContent: 'flex-end', // <--- THIS aligns items to the end (right side)
                              gap: 8 // Optional spacing between icons/buttons
                            }}
                          >
                            {result.E_ID.startsWith('AGG') ? (
                              <>
                                <ActionIcon title='Composite Only' onClick={() => handleResultClick(result.E_ID, result.E_NAME + ' (Composite Only)')}>
                                  <IconUser color='green' />
                                </ActionIcon>
                                <ActionIcon title='Composite + constituents' onClick={() => handleResultClickWithConsitwents(result.E_ID, result.E_NAME + ' (With Constituents)')}>
                                  <IconUsers color='green' />
                                </ActionIcon> 
                                <Button radius="lg" variant="light" disabled>Composite</Button>
                              </>
                            ) : (
                              <Button 
                                radius="lg" 
                                variant="light"
                                onClick={() => handleResultClick(result.E_ID, result.E_NAME)}
                              >
                                Portfolio
                              </Button>
                            )}
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
