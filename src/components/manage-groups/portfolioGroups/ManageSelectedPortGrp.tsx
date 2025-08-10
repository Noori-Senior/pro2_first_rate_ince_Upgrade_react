import {
  useMantineReactTable,
  MantineReactTable,
  createRow,
  MRT_EditActionButtons,
  type MRT_Row,
} from "mantine-react-table";
import {
  ActionIcon,
  Button,
  Flex,
  Stack,
  Title,
  Tooltip,
  Table,
  Text,
} from "@mantine/core";
import { IconPlus, IconTrash, IconListDetails } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import { FetchUpdateDeleteAPI } from "../../../api";
import useClient from "../../hooks/useClient";
import { useState } from "react";
import React from "react";

export type PortfolioGroupsFields = {
  id: string; // Unique identifier for the row
  OBJECT_ID: number; // Unique identifier for the portfolio group
  ACCT: string; // Portfolio group ID
  NAME: string; // Portfolio group name
  RECORDTYPE: string; // Record type (e.g., 'A' for active)
};

export const ManageSelectedPortGrp = ({
  portforlioDetails,
  isLoadingPortDetails,
  isLoadingPortDetailsError,
  isFetchingPortDetails,
  selectedRow,
  isDynamic = false,
}) => {
  const client = useClient();
  const delim = process.env.REACT_APP_DELIMITER;
  const queryClient = useQueryClient();
  // Verify data is received
  console.log("Received portfolioDetails:", portforlioDetails);
  const handleCreatePortGrp = (newRow) => {
    // Handle the creation of a new portfolio group
    console.log("Creating new portfolio group:", newRow);
    // Add your logic to create a new portfolio group here
  };

  const [isDynamicLoading, setIsDynamicLoading] = useState(false);
  const [showDynamicProgress, setShowDynamicProgress] = useState(false);

  // Control loading states for dynamic groups
  React.useEffect(() => {
    if (isDynamic && selectedRow) {
      setIsDynamicLoading(true);
      setShowDynamicProgress(true);
    }
  }, [isDynamic, selectedRow]);

  React.useEffect(() => {
    if (isDynamic && portforlioDetails?.length > 0) {
      setIsDynamicLoading(false);
      // Keep progress bars visible a bit longer for smooth transition
      const timer = setTimeout(() => setShowDynamicProgress(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isDynamic, portforlioDetails]);

  const {
    mutateAsync: createPortfolioGroups,
    isPending: isCreatingPortToGroup,
  } = useMutation({
    mutationFn: async (createdPortfolioGroups: PortfolioGroupsFields) => {
      // send the updated data to API function
      const editDataInCSV = `A${delim}${createdPortfolioGroups.OBJECT_ID}${delim}${createdPortfolioGroups.ACCT}
      `;
      await FetchUpdateDeleteAPI(
        editDataInCSV
          .replace(/[\r\n]+/g, "")
          .replace(/\s*\|\s*/g, "|")
          .replace(/\|null\|/g, "||"),
        `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPOBJ`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return createPortfolioGroups;
    },
    onMutate: async (newPortfolioGroups: PortfolioGroupsFields) => {
      await queryClient.cancelQueries({
        queryKey: ["portfolioGroups", client],
      });

      const previousPortfolioGroups =
        queryClient.getQueryData<PortfolioGroupsFields[]>([
          "portfolioGroups",
          client,
        ]) || [];

      queryClient.setQueryData(
        ["portfolioGroups", client], // Use the exact query key
        (old: PortfolioGroupsFields[] | undefined) => [
          ...(old ?? []),
          { ...newPortfolioGroups, id: uuidv4() },
        ]
      );

      return { previousPortfolioGroups };
    },
  });

  const {
    mutateAsync: deletePortfolioGroup,
    isPending: isDeletingPortfolioFromGroup,
  } = useMutation({
    mutationFn: async ({
      portfolioGroupId,
      ACCT,
    }: {
      portfolioGroupId: string;
      ACCT: string;
    }) => {
      // send the updated data to API function
      const editDataInCSV = `D${delim}${selectedRow.OBJECT_ID}${delim}${ACCT}`;
      await FetchUpdateDeleteAPI(
        editDataInCSV
          .replace(/[\r\n]+/g, "")
          .replace(/\s*\|\s*/g, "|")
          .replace(/\|null\|/g, "||"),
        `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPACGR`
      ); // delete the Portfolio Group
      await new Promise((resolve) => setTimeout(resolve, 100)); // Simulated API delay
      return Promise.resolve(portfolioGroupId);
    },
    onMutate: async ({ portfolioGroupId }) => {
      await queryClient.cancelQueries({
        queryKey: ["portfolioGroups", client],
      });

      const previousPortfolioGroups = queryClient.getQueryData<
        PortfolioGroupsFields[]
      >(["portfolioGroups", client]);

      // Optimistically update the cache by removing the deleted row
      queryClient.setQueryData(
        ["portfolioGroups", client],
        (old: PortfolioGroupsFields[] = []) => {
          const newData = old.filter(
            (h: PortfolioGroupsFields) => h.id !== portfolioGroupId
          );
          return newData;
        }
      );

      return { previousPortfolioGroups };
    },
  });

  const openDeleteConfirmModal = (row: MRT_Row<PortfolioGroupsFields>) => {
    modals.openConfirmModal({
      key: `delete-modal-${row.id}`,
      title: "Delete Portfolio From Group?",
      children: (
        <Text>
          Do you want to remove portfolio {row.original.ACCT} from the group?
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        deletePortfolioGroup({
          portfolioGroupId: row.original.id,
          ACCT: row.original.ACCT,
        });
      },
      overlayProps: {
        opacity: 0.12, // Adjust this value (0-1) for desired darkness
      },
      zIndex: 200, // Ensure proper z-index
      closeOnConfirm: true,
      onClose: () => modals.closeAll(),
    });
  };

  // Your Modal, rendered outside of the menu
  const columns = [
    {
      accessorKey: "ACCT",
      header: "ID",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
        style: { width: "10%" },
      }, // Adjust width as needed
    },
    {
      accessorKey: "NAME",
      header: "Name",
      mantineTableHeadCellProps: { className: "rpt-header-3" },
    },
  ];

  const modalTable = useMantineReactTable<PortfolioGroupsFields>({
    columns,
    data: portforlioDetails || [],
    enableColumnResizing: false,
    createDisplayMode: "modal",
    editDisplayMode: "modal",
    enableClickToCopy: true,
    enablePinning: true,
    enableStickyHeader: true,
    enableTableFooter: true,
    enableRowSelection: true,
    enableFullScreenToggle: false,
    paginationDisplayMode: "pages",
    positionToolbarAlertBanner: "bottom",
    getRowId: (row) => row.id, // Use the unique ID
    mantineToolbarAlertBannerProps: isLoadingPortDetailsError
      ? { color: "red", children: "Failed to load data. No Portfolio Fund." }
      : undefined,
    onCreatingRowSave: handleCreatePortGrp,
    enableRowActions: !isDynamic,

    mantineTableBodyCellProps: {
      className: "rpt-body",
    },

    renderCreateRowModalContent: ({ table, row, internalEditComponents }) => {
      return (
        <Stack>
          <Flex className="mrt-model-title">
            <Title order={4}>Add New Portfolio to Group</Title>
            <ActionIcon
              onClick={() => table.setCreatingRow(null)}
              variant="light"
              size="lg"
              color="red"
            >
              ✕ {/* Close Icon */}
            </ActionIcon>
          </Flex>

          {internalEditComponents.map((component, index) => (
            <div key={index}>{component}</div>
          ))}

          <Flex justify="flex-end" mt="xl">
            <MRT_EditActionButtons variant="text" table={table} row={row} />
          </Flex>
        </Stack>
      );
    },

    mantineCreateRowModalProps: {
      size: "30%",
      yOffset: "2vh",
      xOffset: 10,
      transitionProps: {
        transition: "fade",
        duration: 600,
        timingFunction: "linear",
      },
    },
    mantineEditRowModalProps: {
      size: "30%",
      yOffset: "2vh",
      xOffset: 10,
      transitionProps: {
        transition: "fade",
        duration: 600,
        timingFunction: "linear",
      },
    },

    displayColumnDefOptions: isDynamic
      ? {}
      : {
          "mrt-row-actions": {
            enableColumnOrdering: true, // Allow column ordering
            enableHiding: false, // Prevent hiding the actions column
            mantineTableHeadCellProps: {
              className: "rpt-header-3",
              style: { width: "5%" }, // Set a fixed width for the actions column
            },
          },
        },
    initialState: {
      columnOrder: isDynamic
        ? columns.map((column) => column.accessorKey as string) // No actions column
        : [
            "mrt-row-actions", // Actions column
            ...columns.map((column) => column.accessorKey as string),
          ],
    },

    renderRowActions: ({ row }) => (
      <Flex>
        <Tooltip label="Delete">
          <ActionIcon
            color="red"
            onClick={(event) => {
              event.stopPropagation();
              openDeleteConfirmModal(row);
            }}
          >
            <IconTrash />
          </ActionIcon>
        </Tooltip>
      </Flex>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Flex>
        {/* Show "Create New" only for static portfolios */}
        {!isDynamic && (
          <Button
            leftIcon={<IconPlus />}
            onClick={() => {
              table.setCreatingRow(
                createRow(table, {
                  id: uuidv4(),
                  OBJECT_ID: 0,
                  ACCT: "",
                  NAME: "",
                  RECORDTYPE: "A",
                })
              );
            }}
          >
            Create New
          </Button>
        )}

        {/* Show "Delete Group" only for dynamic portfolios */}
        {isDynamic && (
          <Button
            color="red"
            leftIcon={<IconTrash />}
            onClick={() => {
              // Add your delete group logic here
              console.log("Delete dynamic group", selectedRow);
              // You might want to open a confirmation modal here
              modals.openConfirmModal({
                title: "Delete Dynamic Group?",
                children: (
                  <Text>
                    Are you sure you want to delete this dynamic group?
                  </Text>
                ),
                labels: { confirm: "Delete", cancel: "Cancel" },
                confirmProps: { color: "red" },
                onConfirm: () => {
                  // Call your delete API here
                  console.log("Deleting group:", selectedRow);
                },
              });
            }}
          >
            Delete Group
          </Button>
        )}

        {/* Show "Selected Filters" only for dynamic portfolios */}
        {isDynamic && (
          <Tooltip label="Selected Filters" position="top">
            <ActionIcon
              variant="outline"
              ml={100.0}
              color="grey"
              onClick={() => console.log("Selected Filters")}
            >
              <IconListDetails />
            </ActionIcon>
          </Tooltip>
        )}
      </Flex>
    ),

    state: {
      // Modified loading state for dynamic groups
      isLoading: isDynamic ? isDynamicLoading : isLoadingPortDetails,
      isSaving: isCreatingPortToGroup || isDeletingPortfolioFromGroup,
      showAlertBanner: isLoadingPortDetailsError,
      // Show progress bars for both dynamic and static groups
      showProgressBars: isDynamic ? showDynamicProgress : isFetchingPortDetails,
    },
  });

  return (
    <div>
      {selectedRow ? (
        <>
          <Table striped withColumnBorders>
            <tbody>
              <tr>
                <td>
                  <strong>Group Name</strong>
                </td>
                <td>{selectedRow.OBJECT_DESC}</td>
              </tr>
              <tr>
                <td>
                  <strong>Number of Portfolios</strong>
                </td>
                <td>{selectedRow.COUNT}</td>
              </tr>
              <tr>
                <td>
                  <strong>Group Type</strong>
                </td>
                <td>{selectedRow.COMP_ID === 60 ? "Static" : "Dynamic"}</td>
              </tr>
            </tbody>
          </Table>

          <br />
          {/* Second Table: Portfolio Details */}
          <MantineReactTable table={modalTable} />
        </>
      ) : (
        <Text>No data</Text>
      )}
    </div>
  );
};
