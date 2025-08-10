import React, { useState } from 'react';
import { Drawer, Box, ActionIcon, Text, Divider, UnstyledButton } from '@mantine/core';
import { IconInbox, IconMail, IconX } from '@tabler/icons-react';
import { MaterialIcon } from '../../google-api-MSO/MaterialIcon';

export default function Settings() {
  const [opened, setOpened] = useState(false);

  const toggleDrawer = (newOpen) => () => {
    setOpened(newOpen);
  };

  const DrawerList = (
    <Box sx={{ width: 420, marginTop: '96px', }} role="presentation">
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', height: 60, width: '100%', }}>
        <Text ml={10} weight={700} size={19}>Settings</Text>
        <ActionIcon variant="transparent" sx={{ marginLeft: 'auto' }} onClick={toggleDrawer(false)}>
          <IconX size={20} />
        </ActionIcon>
      </Box>

      <Divider />

      {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
        <UnstyledButton
          key={text}
          sx={(theme) => ({
            display: 'flex',
            alignItems: 'center',
            padding: theme.spacing.sm,
            borderRadius: theme.radius.sm,
            '&:hover': {
              backgroundColor: theme.colors.gray[0],
            },
          })}
        >
          <Box mr={10}>
            {index % 2 === 0 ? <IconInbox size={16} /> : <IconMail size={16} />}
          </Box>
          <Text>{text}</Text>
        </UnstyledButton>
      ))}
    </Box>
  );

  return (
    <div>
      <ActionIcon variant="transparent" onClick={toggleDrawer(true)} style={{ marginRight: 15, marginLeft: 10 }} >
        <MaterialIcon iconName="settings" color="black" size={30} />
      </ActionIcon>
      <Drawer
        opened={opened}
        onClose={toggleDrawer(false)}
        position="right"
        withCloseButton={false}
        padding={0}
      >
        {DrawerList}
      </Drawer>
    </div>
  );
}
