import React, { useState } from "react";
import {
  MRT_EditActionButtons,
  MantineReactTable,
  type MRT_Row,
  type MRT_TableOptions,
  useMantineReactTable,
  createRow,
} from "mantine-react-table";
import {
  ActionIcon, Button, Flex, Text, Tooltip, Stack, Title, Modal} from "@mantine/core";
import { CopyIcon } from "../../../svgicons/svgicons.js";
import { ModalsProvider, modals } from "@mantine/modals";
import { IconEdit, IconTrash, IconPlus } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FetchUpdateDeleteAPI } from "../../../api.js";
import useClient from "../../hooks/useClient.js";
import { PortfolioGroupsFields, usePortfolioGroupsColumns} from "../groupColumnTitels/PortfolioGroupsColumns.tsx";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs
import { useAccountName } from "../../hooks/useFrpNamesFiltersDDLsApi.js";
import { useGetPortfolioGrpDtl, useFetchPortDetails, useGetDynamicPortfolioGroupAccounts} from "../../hooks/usePortfolioGroupsAPI.js";
import { ManageSelectedPortGrp } from "./ManageSelectedPortGrp.tsx";

const PortfolioGroupsMTable = () => {
  const [finalData, setFinalData] = useState<PortfolioGroupsFields[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<PortfolioGroupsFields | null>(
    null
  );
  const [portforlioDetails, setPortfolioDetails] = useState<any[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<number | null>(null);
  const [isLoadingDynamic, setIsLoadingDynamic] = useState(false);
  const [isManualLoading, setIsManualLoading] = useState(true);

  const client = useClient();
  const delim = process.env.REACT_APP_DELIMITER;

  // Fetch portfolio details when selectedObjectId changes
  const {
    data: fetchedPortfolioDetails,
    isLoading: isLoadingPortDetails,
    isError: isLoadingPortDetailsError,
    isFetching: isFetchingPortDetails,
  } = useFetchPortDetails(client, selectedObjectId);
  const { data: accountNames } = useAccountName("*", client);

  // Step 1: Watch for new OBJECT_ID and update portfolioDetails once fetched
  React.useEffect(() => {
    if (selectedObjectId && fetchedPortfolioDetails?.length > 0) {
      const updatedPortfolioDetails = fetchedPortfolioDetails.map(
        (detail: any) => ({
          ...detail,
          // Assuming detail has an 'ACCT' field that needs to be replaced with account names
          NAME:
            accountNames.find((account: any) => account.ACCT === detail.ACCT)
              ?.NAME || detail.ACCT,
        })
      );
      setPortfolioDetails(updatedPortfolioDetails);
    }
  }, [fetchedPortfolioDetails, selectedObjectId]);

  // Modify useGetDynamicPortfolioGroupAccounts hook usage
  const [dynamicGroupId, setDynamicGroupId] = useState<number | null>(null);
  const [dynamicAcctEnabled, setDynamicAcctEnabled] = useState(false);
  const { data: refetchDynamicAccounts, refetch } = useGetDynamicPortfolioGroupAccounts(
    dynamicGroupId,
    client,
    {
      enabled: dynamicAcctEnabled, // Do not run automatically
    }
  );
  
  React.useEffect(() => {
    setPortfolioDetails(refetchDynamicAccounts);
  }, [refetchDynamicAccounts]);

  const handleCountClick = async (row: PortfolioGroupsFields) => {
    setSelectedRow(row);
    setModalOpen(true);
  
    if (row.COMP_ID === 61) {
      setPortfolioDetails([]);
      setIsLoadingDynamic(true);
  
      setDynamicAcctEnabled(false); // reset before setting new ID
      setDynamicGroupId(row.OBJECT_ID); // this triggers useQuery with updated ID
      setDynamicAcctEnabled(true); // this allows query to run
  
      try {
        const { data } = await refetch(); // Refetch manually
        setPortfolioDetails(data);
      } catch (error) {
        console.error("Error fetching dynamic accounts:", error);
      } finally {
        setIsLoadingDynamic(false);
      }
    } else {
      // Static group
      setSelectedObjectId(row.OBJECT_ID);
    }
  };

  // Unified data fetch using React Query
  const {
    data: fetchedPortfolioGroups = [],
    isError: isLoadingPortfolioGroupsError,
    isLoading: isLoadingPortfolioGroups,
  } = useGetPortfolioGrpDtl(client);

  React.useEffect(() => {
    setFinalData(fetchedPortfolioGroups);
  }, [fetchedPortfolioGroups]);

  const columns = usePortfolioGroupsColumns(setFinalData, handleCountClick); // Get Column information

  const queryClient = useQueryClient();
  // Mutations
  const {
    mutateAsync: createPortfolioGroups,
    isPending: isCreatingPortfolioGroups,
  } = useMutation({
    mutationFn: async (createdPortfolioGroups: PortfolioGroupsFields) => {
      // send the updated data to API function
      const editDataInCSV = `A${delim}${createdPortfolioGroups.OBJECT_ID}${delim}${createdPortfolioGroups.OBJECT_DESC}${delim}${createdPortfolioGroups.COMP_ID}`;
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
    mutateAsync: updatePortfolioGroup,
    isPending: isUpdatingPortfolioGroup,
  } = useMutation({
    mutationFn: async (updatedPortfolioGroups: PortfolioGroupsFields) => {
      // send the updated data to API function
      const editDataInCSV = `C${delim}${updatedPortfolioGroups.OBJECT_ID}${delim}${updatedPortfolioGroups.OBJECT_DESC}${delim}${updatedPortfolioGroups.COMP_ID}
      `;
      await FetchUpdateDeleteAPI(
        editDataInCSV
          .replace(/[\r\n]+/g, "")
          .replace(/\s*\|\s*/g, "|")
          .replace(/\|null\|/g, "||"),
        `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPOBJ`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return updatedPortfolioGroups;
    },
    onMutate: async (updatedPortfolioGroup: PortfolioGroupsFields) => {
      await queryClient.cancelQueries({ queryKey: ["portfolioGroups"] });
      const previousPortfolioGroups = queryClient.getQueryData<
        PortfolioGroupsFields[]
      >(["portfolioGroups"]);
      queryClient.setQueryData(
        ["portfolioGroups"],
        (old: PortfolioGroupsFields[] = []) =>
          old.map((h) =>
            h.id === updatedPortfolioGroup.id ? updatedPortfolioGroup : h
          )
      );
      return { previousPortfolioGroups };
    },
  });

  const {
    mutateAsync: deletePortfolioGroup,
    isPending: isDeletingPortfolioGroup,
  } = useMutation({
    mutationFn: async ({
      portfolioGroupId,
      OBJECT_ID,
    }: {
      portfolioGroupId: string;
      OBJECT_ID: number;
    }) => {
      // send the updated data to API function
      const editDataInCSV = `D${delim}${OBJECT_ID}`;
      await FetchUpdateDeleteAPI(
        editDataInCSV
          .replace(/[\r\n]+/g, "")
          .replace(/\s*\|\s*/g, "|")
          .replace(/\|null\|/g, "||"),
        `IBIF_ex=frapipro_TableUpd&CLIENT=${client}&theTable=FRPOBJ`
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

  // CRUD Handlers
  const handleCreatePortfolioGroup: MRT_TableOptions<PortfolioGroupsFields>["onCreatingRowSave"] =
    async ({ values, exitCreatingMode }) => {
      // Validate the updated values
      const errors = validatePortfolioGroups(values);
      if (Object.values(errors).some(Boolean)) {
        return; // If there are validation errors, stop the save operation
      }

      // Save the created values instead of row.original
      await createPortfolioGroups(values); // Use values instead of row.original
      exitCreatingMode();
      table.setCreatingRow(null); // Reset editing state
    };

  const handleSavePortfolioGroup: MRT_TableOptions<PortfolioGroupsFields>["onEditingRowSave"] =
    async ({ table, values, row }) => {
      // Validate the updated values
      const errors = validatePortfolioGroups(values);
      if (Object.values(errors).some(Boolean)) {
        return; // If there are validation errors, stop the save operation
      }

      const updatedValue = {
        ...values,
        OBJECT_ID: row.original.OBJECT_ID, // Ensure OBJECT_ID is preserved
      };

      // Save the updated values instead of row.original
      await updatePortfolioGroup(updatedValue); // Use values instead of row.original

      // Reset the editing state
      table.setEditingRow(null);
    };

  const openDeleteConfirmModal = (row: MRT_Row<PortfolioGroupsFields>) => {
    modals.openConfirmModal({
      key: `delete-modal-${row.id}`,
      title: "Delete Portfolio Group?",
      children: (
        <Text>
          Delete {row.original.OBJECT_DESC} ({row.original.OBJECT_ID})?
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        deletePortfolioGroup({
          portfolioGroupId: row.original.id,
          OBJECT_ID: row.original.OBJECT_ID,
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

  const table = useMantineReactTable({
    columns,
    data: finalData,
    enableColumnResizing: false,
    createDisplayMode: "modal",
    editDisplayMode: "modal",
    enableEditing: true,
    enableColumnDragging: true,
    enableColumnOrdering: true,
    enableColumnFilterModes: false,
    enablePinning: true,
    enableStickyHeader: true,
    enableTableFooter: true,
    enableFullScreenToggle: false,
    enableRowSelection: true,
    paginationDisplayMode: "pages",
    positionToolbarAlertBanner: "bottom",
    getRowId: (row) => row.id, // Use the unique ID
    mantineToolbarAlertBannerProps: isLoadingPortfolioGroupsError
      ? {
          color: "red",
          children: "Failed to load data. Update your selection criteria.",
        }
      : undefined,
    onCreatingRowSave: handleCreatePortfolioGroup,
    onEditingRowSave: handleSavePortfolioGroup,
    enableRowActions: true,

    mantineTableBodyCellProps: {
      className: "rpt-body",
    },

    renderCreateRowModalContent: ({ table, row, internalEditComponents }) => {
      return (
        <Stack>
          <Flex className="mrt-model-title">
            <Title order={4}>Create New BP Fee</Title>
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
    renderEditRowModalContent: ({ table, row, internalEditComponents }) => {
      return (
        <Stack>
          <Flex className="mrt-model-title">
            <Title order={4}>Edit Portfolio Group</Title>
            <ActionIcon
              onClick={() => table.setEditingRow(null)}
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

    displayColumnDefOptions: {
      "mrt-row-actions": {
        size: 50,
        enableColumnOrdering: true, // Allow column ordering
        enableHiding: false, // Prevent hiding the actions column
        mantineTableHeadCellProps: {
          className: "rpt-header-3",
          style: { width: "7%" }, // Fixed width for actions column
        },
      },
    },
    initialState: {
      columnOrder: [
        "mrt-row-actions", // Actions column (second column)
        ...columns.map((column) => column.accessorKey as string), // Rest of the data columns
      ],
    },

    renderRowActions: ({ row, table }) => (
      <Flex gap={5}>
        <Tooltip label="Edit">
          <ActionIcon
            onClick={() => {
              table.setEditingRow(row);
            }}
          >
            <IconEdit />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Copy">
          <ActionIcon
            onClick={() => {
              // Copy the row data to the clipboard
              navigator.clipboard.writeText(JSON.stringify(row.original));
              // Check the checkbox for the copied row
              table.setRowSelection({ [row.id]: true });
            }}
          >
            <CopyIcon />
          </ActionIcon>
        </Tooltip>
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
      <Flex gap={10}>
        <Button
          //   variant="subtle"
          leftIcon={<IconPlus />}
          onClick={() => {
            table.setCreatingRow(
              createRow(table, {
                id: uuidv4(),
                OBJECT_DESC: "",
                COUNT: 0,
                RECDTYPE: "A",
                OBJECT_ID: 0,
                COMP_ID: 0,
              })
            );
          }}
        >
          Create New
        </Button>
      </Flex>
    ),
    // Add this new prop:
    mantineLoadingOverlayProps: {
      loaderProps: {
        size: "md",
        variant: "oval",
      },
    },
    state: {
      isLoading:
        (isLoadingPortfolioGroups || isManualLoading) && finalData.length === 0,
      isSaving:
        isCreatingPortfolioGroups ||
        isUpdatingPortfolioGroup ||
        isDeletingPortfolioGroup,
      showAlertBanner: isLoadingPortfolioGroupsError,
    },
  });

  // Add this effect to handle the initial load state
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (finalData.length > 0) {
        setIsManualLoading(false);
      }
    }, 3000); // 3 second timeout
    return () => clearTimeout(timer);
  }, []);
 
  return (
    <>
      {/* Main Table with built-in loading indicators */}
      <MantineReactTable table={table} />

      {/* Modal with enhanced loading indicator in title */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          <Flex align="center" gap="sm">
            {selectedRow?.COMP_ID === 61
              ? "Dynamic Group Accounts"
              : "Static Group Accounts"}

          </Flex>
        }
        size="xl"
        centered
      >
        <ManageSelectedPortGrp
          portforlioDetails={portforlioDetails}
          isLoadingPortDetails={
            selectedRow?.COMP_ID === 61
              ? isLoadingDynamic
              : isLoadingPortDetails
          }
          isLoadingPortDetailsError={isLoadingPortDetailsError}
          isFetchingPortDetails={
            selectedRow?.COMP_ID === 61
              ? isLoadingDynamic
              : isFetchingPortDetails
          }
          selectedRow={selectedRow}
          isDynamic={selectedRow?.COMP_ID === 61}
        />
      </Modal>
    </>
  );
};

const FrpPortfolioGroups = () => (
  <ModalsProvider>
    <PortfolioGroupsMTable />
  </ModalsProvider>
);

export default FrpPortfolioGroups;

const validateRequired = (value: string) => !!value.length;

function validatePortfolioGroups(portfolioGroups: PortfolioGroupsFields) {
  return {
    OBJECT_DESC: validateRequired(portfolioGroups.OBJECT_DESC)
      ? ""
      : "Portfolio ID is required",
  };
}
