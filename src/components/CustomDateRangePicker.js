import React, { useState } from 'react';
import { Paper, Text, Button, Group, Popover, ActionIcon } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { MaterialIcon } from '../google-api-MSO/MaterialIcon';

const CustomDateRangePicker = ({ onDateRangeChange }) => {
  const [opened, setOpened] = useState(false);
  
  // Mantine DatePickerInput  works with Date objects
  const [fromDate, setFromDate] = useState(dayjs(process.env.REACT_APP_CALENDAR_START_DATE));
  const [toDate, setToDate] = useState(dayjs().toDate());
  const [dateError, setDateError] = useState('');

  // Define the new format explicitly
  const customFormat = "YYYY MMM DD";

  const handleClose = () => {
    if (fromDate >= toDate) {
      setDateError("From Date can't be greater than To Date!");
    } else {
      setDateError('');



      onDateRangeChange([
        dayjs(fromDate).format('YYYY/MM/DD'),
        dayjs(toDate).format('YYYY/MM/DD')
      ]);

      setOpened(false);
    }
  };


  const getDisplayText = () => {
    if (fromDate && toDate) {
      return `${dayjs(fromDate).format(customFormat)} | ${dayjs(toDate).format(customFormat)}`;
    }
    return `${fromDate} - ${toDate}`;
  };

  return (
    <Popover opened={opened} onClose={handleClose} position="bottom" withArrow shadow="xl" >
      <Popover.Target>
        <Paper component="form" style={{
          display: 'flex', alignItems: 'center', width: 210, borderRadius: 5, height: 30, background: 'white', color: '#ffffff',  paddingLeft: '5px', paddingRight: '5px',
          cursor: 'pointer',
          marginBottom: 1,
        }}
          onClick={() => setOpened((o) => !o)}
        >
          <ActionIcon color="white"> <MaterialIcon iconName="date_range" color='black' size='25px' /> </ActionIcon>
          <Text className='nav-date-range'>
            {getDisplayText()}
          </Text>

        </Paper>
      </Popover.Target>
      <Popover.Dropdown >
        <Group spacing="sm">
          <DatePickerInput
            variant="filled"
            radius="lg"
            size="xs"
            withAsterisk
            icon={<IconCalendar size={18} stroke={1.5} />}
            label="From Date"
            value={fromDate}
            onChange={(newValue) => {
              if (newValue >= toDate) {
                setDateError("From Date can't be greater than To Date!");
              } else {
                setDateError('');
                setFromDate(newValue);
              }
            }}
            // style={{ width: '100%' }}
            placeholder="Select From Date"
          />
          <DatePickerInput
            variant="filled"
            radius="lg"
            size="xs"
            withAsterisk
            icon={<IconCalendar size={18} stroke={1.5} />}
            label="To Date"
            value={toDate}
            onChange={(newValue) => {
              if (fromDate >= newValue) {
                setDateError("From Date can't be greater than To Date!");
              } else {
                setDateError('');
                setToDate(newValue);
              }
            }}
            // style={{ width: '100%' }}
            placeholder="Select To Date"
          />
          <Group position="apart" align="center" mt="xs">
            <Text color="red" size="xs">{dateError}</Text>
            <Button onClick={handleClose} size="xs"> Close </Button>
          </Group>
        </Group>
      </Popover.Dropdown>
    </Popover>
  );
};

export default CustomDateRangePicker;
