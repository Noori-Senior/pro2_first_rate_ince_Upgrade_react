import React from "react";
import { Grid, Box, Title, Text, Card, Flex, Checkbox, Table } from "@mantine/core";
import { MantineProvider } from "@mantine/core";
import { useUserDetails } from "../hooks/useUserDetails";
import { Cell, Pie, PieChart, Tooltip } from "recharts";

const DashboardContent = () => {
  const { firstName, lastName, isLoading } = useUserDetails();
  const theme = {
    /** Put your mantine theme override here */
  };

  const chartData = [
    { name: "Final Status", value: 748, color: "#143C6B" }, // Dark blue
    { name: "In Progress", value: 312, color: "#0093D4" }, // Light blue
    { name: "Pending", value: 125, color: "#4CAF50" }, // Green
    { name: "Other", value: 62, color: "#9E9E9E" }, // Gray
  ];
  const tableRows = chartData.map((item, index) => (
    <tr key={index}>
      <td>{item.name}</td>
      <td>{((item.value / 1247) * 100).toFixed(1)}%</td>
      <td>{item.value}</td>
    </tr>
  ));

  return (
    <MantineProvider theme={theme}>
      <Box mt={0}>
        <Grid gutter="md">
          <Grid.Col span={12}>
            <Card
              shadow="sm"
              padding="lg"
              radius="md"
              style={{
                background: "linear-gradient(to right, #143C6B, #0093D4)",
                color: "white",
              }}
            >
              <Flex justify="space-between" align="center">
                <div>
                  <Title order={4}> {isLoading ? "Loading..." : `Hello ${firstName}, Welcome Back!`}</Title>
                  <text>
                    Currently view data for: <b>All Active (1247)</b>
                  </text>
                </div>
                <div style={{ marginTop: "1.5rem" }}>
                  <Checkbox label="Use selected Portfolios" styles={{ label: { color: "white" } }} />
                </div>
              </Flex>

              {/* Pie Chart Here */}
            </Card>
          </Grid.Col>

          <Grid.Col span={4}>
            <Card shadow="sm" padding="lg">
              <Flex justify="space-between" align="center" mb="md">
                <Title order={4}>Portfolio Status Overview</Title>
              </Flex>

              <PieChart width={250} height={250} style={{ marginBottom: "1rem" }}>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50} // 👈 This makes it a doughnut!
                  label
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>

              <Table striped highlightOnHover withBorder withColumnBorders>
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Percentage</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>{tableRows}</tbody>
              </Table>
            </Card>
          </Grid.Col>

          <Grid.Col span={8}>
            <Card shadow="sm" padding="lg">
              <Title order={4}>Data Load Trends</Title>
              {/* Line Chart Here */}
            </Card>
          </Grid.Col>

          <Grid.Col span={12}>
            <Card shadow="sm" padding="lg">
              <Title order={4}>Detailed Data Load</Title>
              {/* Table Here */}
            </Card>
          </Grid.Col>
        </Grid>
      </Box>
    </MantineProvider>
  );
};

export default DashboardContent;
