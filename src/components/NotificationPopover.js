import React, { useState } from 'react';
import { Menu, Badge, Text, ActionIcon } from '@mantine/core';
import { PRO2_TOP_HEADER_NOTIFICATIONS } from '../svgicons/svgicons';

const NotificationMenu = () => {
  const [opened, setOpened] = useState(false);

  const notes = [
    'You have a new message from John.',
    'Server maintenance is scheduled for tomorrow.',
    'Your password will expire in 5 days.',
  ];

  return (
    <>
      <Menu opened={opened} onChange={setOpened} position="bottom-end" withArrow offset={10} >
        <Menu.Target>
            <ActionIcon> <PRO2_TOP_HEADER_NOTIFICATIONS />            
              <Badge circle="true" color="red" size="xs" variant="filled"
                style={{ marginLeft: -20, marginTop: 10, zIndex:55, overflow: 'unset' }}
              >
                {notes.length}
              </Badge>
            </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Notifications</Menu.Label>
          {notes.length > 0 ? (
            notes.map((note, index) => (
              <Menu.Item key={index}>
                <Text size="sm">{note}</Text>
              </Menu.Item>
            ))
          ) : (
            <Menu.Item disabled>
              <Text size="sm">No notifications</Text>
            </Menu.Item>
          )}
        </Menu.Dropdown>
      </Menu>
    </>
  );
};

export default NotificationMenu;
