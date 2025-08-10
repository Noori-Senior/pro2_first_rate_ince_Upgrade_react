import { type MRT_ColumnDef } from "mantine-react-table";
import {
  useBenchmarkDDL,
  useCountryDDL,
  useSectorDDL,
} from "../../hooks/useFrpNamesFiltersDDLsApi";
import { useEffect, useState } from "react";
import { Select } from "@mantine/core";

export type TolerancePackagesFields = {
  id: string;
  PKG: string;
  COUNTRY: string;
  SECTOR: string;
  SNAME: string;
  LOW: string;
  HIGH: string;
  INDX: string;
};

// Column definitions as a separate component
export const useTolerancePackagesColumns = (
  client: any, // Assuming client is passed for API calls
  isEditable: boolean,
  validationErrors: Record<string, string> // Add this parameter
): MRT_ColumnDef<TolerancePackagesFields>[] => {
  const { data: processedCountry } = useCountryDDL(client);
  const sectorDDLID = useSectorDDL(client, "FRPTOLRP"); // Fetching the data for SECTOR dropdown
  const benchmarkDDLID = useBenchmarkDDL(client, "FRPTOLRP"); // Fetching the data for BENCHMARK dropdown
  return [
    {
      accessorKey: "PKG",
      header: "Benchmark Package ID",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      enableEditing: isEditable,
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        required: true,
        error: validationErrors["PKG"], // Use passed error
        onFocus: () => {}, // Remove local state update
        maxLength: 3,
      },
      size: 10,
    },
    {
      accessorKey: "COUNTRY",
      enableEditing: isEditable,
      header: "Country",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      editVariant: "text",
      mantineEditSelectProps: {
        required: true,
      },
      Edit: ({ cell, table, row }) => {
        // Get the current value from the row or use the first country as default
        const initialValue =
          cell.getValue<string>() ||
          (processedCountry.length > 0 ? processedCountry[0].COUNTRY : null);

        const [value, setValue] = useState<string | null>(initialValue);

        const sectorCntry = processedCountry.map((country) => ({
          value: country.COUNTRY,
          label: `${country.CNAME} (${country.COUNTRY})`,
        }));

        // Set the initial value in the row data if it's empty
        useEffect(() => {
          if (!row.original.COUNTRY && processedCountry.length > 0) {
            row.original.COUNTRY = processedCountry[0].COUNTRY;
            setValue(processedCountry[0].COUNTRY);

            // Update table state
            const creatingRow = table.getState().creatingRow;
            const editingRow = table.getState().editingRow;

            if (creatingRow && creatingRow._valuesCache) {
              creatingRow._valuesCache.COUNTRY = processedCountry[0].COUNTRY;
            } else if (editingRow && editingRow._valuesCache) {
              editingRow._valuesCache.COUNTRY = processedCountry[0].COUNTRY;
            }
          }
        }, [processedCountry]);

        return (
          <Select
            label="Country"
            data={sectorCntry}
            value={value}
            onChange={(selectedCntry) => {
              setValue(selectedCntry);
              row.original.COUNTRY = selectedCntry ?? "";

              // Update table state
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;

              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.COUNTRY = selectedCntry;
                table.setEditingRow(editingRow);
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.COUNTRY = selectedCntry;
                table.setEditingRow(editingRow);
              }
            }}
            searchable
            filter={(value, item) =>
              item.label?.toLowerCase().includes(value.toLowerCase().trim()) ??
              false
            }
            nothingFound="No options found"
          />
        );
      },
      size: 14,
    },
    {
      accessorKey: "SECTOR",
      enableEditing: isEditable,
      header: "Sector",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      Edit: ({ cell, table, row }) => {
        // Get initial value from cell or use first sector if available
        const initialValue =
          cell.getValue<string>() ||
          (sectorDDLID.data?.length ? sectorDDLID.data[0].SECTOR : null);

        const [value, setValue] = useState<string | null>(initialValue);

        const sectors = (sectorDDLID.data ?? []).map((sector) => ({
          value: sector.SECTOR,
          label: `${sector.SNAME} (${sector.SECTOR})`,
        }));

        // Set initial value in row data if empty
        useEffect(() => {
          if (!row.original.SECTOR && sectorDDLID.data?.length) {
            const firstSector = sectorDDLID.data[0].SECTOR;
            row.original.SECTOR = firstSector;
            setValue(firstSector);

            // Update table state
            const creatingRow = table.getState().creatingRow;
            const editingRow = table.getState().editingRow;

            if (creatingRow && creatingRow._valuesCache) {
              creatingRow._valuesCache.SECTOR = firstSector;
              creatingRow._valuesCache.SNAME = sectorDDLID.data[0].SNAME;
            } else if (editingRow && editingRow._valuesCache) {
              editingRow._valuesCache.SECTOR = firstSector;
              editingRow._valuesCache.SNAME = sectorDDLID.data[0].SNAME;
            }
          }
        }, [sectorDDLID.data]);

        return (
          <Select
            label="Sector"
            data={sectors}
            value={value}
            onChange={(selectedSector) => {
              setValue(selectedSector);
              const selectedSectorData = sectors.find(
                (s) => s.value === selectedSector
              );

              // Update row data
              row.original.SECTOR = selectedSector || "";
              row.original.SNAME =
                selectedSectorData?.label.split("(")[0].trim() || "";

              // Update table state
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;

              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.SECTOR = selectedSector;
                creatingRow._valuesCache.SNAME =
                  selectedSectorData?.label.split("(")[0].trim() || "";
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.SECTOR = selectedSector;
                editingRow._valuesCache.SNAME =
                  selectedSectorData?.label.split("(")[0].trim() || "";
              }

              // Force table update
              table.setEditingRow(editingRow);
            }}
            searchable
            filter={(value, item) =>
              item.label?.toLowerCase().includes(value.toLowerCase().trim()) ??
              false
            }
            nothingFound="No options found"
            placeholder={
              sectors.length ? "Select sector" : "Loading sectors..."
            }
            disabled={!sectors.length}
          />
        );
      },
    },
    {
      accessorKey: "SNAME",
      header: "Sector Name",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      enableEditing: false, // Make this column non-editable
    },
    {
      accessorKey: "LOW",

      header: "Lowest Return Allowed",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
        align: "right",
      },
      mantineTableBodyCellProps: {
        align: "right",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "number",
        error: validationErrors["LOW"], // Display validation error
        onFocus: () => {},
        maxLength: 6,
      },
      size: 2,
    },
    {
      accessorKey: "HIGH",

      header: "Highest Return Allowed",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
        align: "right",
      },
      mantineTableBodyCellProps: {
        align: "right",
      },
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "number",
        error: validationErrors["HIGH"], // Display validation error
        onFocus: () => {},
        maxLength: 6,
      },
      size: 2,
    },
    {
      accessorKey: "INDX",
      enableEditing: isEditable,
      header: "Benchmark",
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
      Edit: ({ cell, table, row }) => {
        // Get initial value from cell or use first benchmark if available
        const initialValue =
          cell.getValue<string>() ||
          (benchmarkDDLID.data?.length ?benchmarkDDLID.data[0].INDX : null);

        const [value, setValue] = useState<string | null>(initialValue);

        const sectors = (benchmarkDDLID.data ?? []).map((benchmark) => ({
          value: benchmark.INDX,
          label: `${benchmark.SNAME} (${benchmark.INDX})`,
        }));

        // Set initial value in row data if empty
        useEffect(() => {
          if (!row.original.INDX &&benchmarkDDLID.data?.length) {
            const firstBenchmark =benchmarkDDLID.data[0].INDX;
            row.original.INDX = firstBenchmark;
            setValue(firstBenchmark);

            // Update table state
            const creatingRow = table.getState().creatingRow;
            const editingRow = table.getState().editingRow;

            if (creatingRow && creatingRow._valuesCache) {
              creatingRow._valuesCache.INDX = firstBenchmark;
              creatingRow._valuesCache.SNAME =benchmarkDDLID.data[0].SNAME;
            } else if (editingRow && editingRow._valuesCache) {
              editingRow._valuesCache.INDX = firstBenchmark;
              editingRow._valuesCache.SNAME =benchmarkDDLID.data[0].SNAME;
            }
          }
        }, [benchmarkDDLID.data]);

        return (
          <Select
            label="Benchmark"
            data={sectors}
            value={value}
            onChange={(selectedSector) => {
              setValue(selectedSector);
              const selectedSectorData = sectors.find(
                (s) => s.value === selectedSector
              );

              // Update row data
              row.original.INDX = selectedSector || "";
              row.original.SNAME =
                selectedSectorData?.label.split("(")[0].trim() || "";

              // Update table state
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;

              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.INDX = selectedSector;
                creatingRow._valuesCache.SNAME =
                  selectedSectorData?.label.split("(")[0].trim() || "";
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.INDX = selectedSector;
                editingRow._valuesCache.SNAME =
                  selectedSectorData?.label.split("(")[0].trim() || "";
              }

              // Force table update
              table.setEditingRow(editingRow);
            }}
            searchable
            filter={(value, item) =>
              item.label?.toLowerCase().includes(value.toLowerCase().trim()) ??
              false
            }
            nothingFound="No options found"
            placeholder={
              sectors.length ? "Select benchmark" : "Loading benchmarks..."
            }
            disabled={!sectors.length}
          />
        );
      },
    },
  ];
};
