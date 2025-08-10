import React from 'react';
import { Grid, Box } from '@mantine/core';
import { MantineProvider } from '@mantine/core';
const DashboardHeader = () => {
    const theme = {
      /** Put your mantine theme override here */
    };

    return (
        <MantineProvider theme={theme}>
            <Box my="xl">
                <Grid gutter="md">
                  <Grid.Col span={4}>Dashboard Header</Grid.Col>
                </Grid>
            </Box>
        </MantineProvider>
        
    );
    
};

export default DashboardHeader;