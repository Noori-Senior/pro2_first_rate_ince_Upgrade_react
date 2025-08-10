import { useState } from "react";
import { type MRT_ColumnDef } from "mantine-react-table";
import { ColorInput, Select } from "@mantine/core";
import { useCountryDDL } from "../../hooks/useFrpNamesFiltersDDLsApi";

export type SI1TableGridFields = {
  id: string;
  SIFLAG: string;
  SORI: string;
  SORINAME: string;
  TFSEC: string;
  OPT: string;
  EXC: string;
  CSH: string;
  SRT: string;
  CATNAME: string;
  GINDEX: string;
  EXTRA2: string;
  SSFCHK: string;
  TAXOFFSET: string;
  TYP: string;
  DAYFACTOR: number;
  COLOR: string;
  SHORTNAME: string;
  BMCOUNTRY: string;
  HDX: string;
  SI1USER1: string;
  SI1USER2: string;
  SI1USER3: string;
  SI1USER4: string;
  SI1USER5: string;
  SB_TIER: number;
  TOTCTG: string;
  XPLUGFACTOR: string;
  BRCFREQ: string;
  GBR_FLAG: string;
  MWRR_FLAG: string;
  RECDTYPE: string;
};


// Column definitions as a separate component
export const useSI1TableGridColumns = (
  data: SI1TableGridFields[],
  setData: (data: SI1TableGridFields[]) => void, // Add a setData function to update the parent state
  isEditable: boolean,
  client: any,
  siflag: string,
): MRT_ColumnDef<SI1TableGridFields>[] => {
    const [validationErrors, setValidationErrors] = useState<Record<string, string | "">>({});

    // Fetch Country details
    const { data: processedCountry } = useCountryDDL(client);

  return [
    {
      accessorKey: "SORI",
      header: siflag === 'I' ? "Benchmark ID" : "ID",
      enableEditing: isEditable,
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
    },
    {
      accessorKey: "SORINAME",
      header: siflag === 'I' ? "Long Name" : "Long Description",
      editVariant: "text",
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["SORINAME"],
        onFocus: () => setValidationErrors({ ...validationErrors, SORINAME: "" }),
        maxLength: 50,
      },
      mantineTableHeadCellProps: {
        className: "rpt-header-3",
      },
    },
    {
      accessorKey: 'SHORTNAME', 
      header: siflag === 'I' ? 'Short Name' : 'Short Description',
      
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["SHORTNAME"],
        onFocus: () => setValidationErrors({ ...validationErrors, SHORTNAME: "" }),
        maxLength: 20,
      },
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
    },
    {
      accessorKey: 'TOTCTG', 
      header: 'Total Category for Reports',
      enableEditing: siflag === 'I' ? false : true,
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["TOTCTG"],
        onFocus: () => setValidationErrors({ ...validationErrors, TOTCTG: "" }),
        maxLength: 4,
      },
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
    },
    {
      accessorKey: 'SSFCHK', 
      header: 'Skip Large Cash Flow Check',
      enableEditing: siflag === 'I' ? false : true,
      editVariant: 'select',
      mantineEditSelectProps: {
        data: [
          {value: " ", label: "Check for Large Cash Flows (Null)"},
          {value: "Y", label: "Skip Large Cash Flow Check; Use Monthly Return (Y)"},
          {value: "I", label: "Skip Large Cash Flow check; Use Daily Return When Available (I)"}
        ]
      },
      mantineTableHeadCellProps: { className: 'rpt-header-3' },
    },
    {
      accessorKey: 'XPLUGFACTOR', 
      header: 'Skip Plug Factor',
      editVariant: 'select',
      enableEditing: siflag === 'I' ? false : true,
      mantineEditSelectProps: {
        data: [
          { value: "Y", label: "Yes" },
          { value: "N", label: "No" }
        ]
      },
      mantineTableHeadCellProps: { className: 'rpt-header-3' },
    },
    {
      accessorKey: 'HDX', 
      header: 'Sector Direct',
      enableEditing: siflag === 'I' ? false : true,
      editVariant: 'select',
      mantineEditSelectProps: {
        data: [
          { value: "1", label: "1" },
          { value: "2", label: "2" },
          { value: "3", label: "3" },
          { value: " ", label: "(   ) Invalid Value" },
        ]
      },
      mantineTableHeadCellProps: { className: 'rpt-header-3' },
    },
    {
      accessorKey: 'EXC', 
      header: 'Excluded Sector',
      enableEditing: siflag === 'I' ? false : true,
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["EXC"],
        onFocus: () => setValidationErrors({ ...validationErrors, EXC: "" }),
        maxLength: 4,
      },
      mantineTableHeadCellProps: { className: 'rpt-header-3' },
    },
    {
      accessorKey: "COLOR",
      header: "Graph Color",
      size: 100,
      mantineTableHeadCellProps: { className: "rpt-header-3" },

      // Display the color in a box
      Cell: ({ cell }) => {
        const colorValue = cell.getValue(); // Example: "255,0,0"
        return (
          <div
            style={{
              backgroundColor: `rgb(${colorValue})`,
              width: "100px",
              height: "20px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        );
      },

      // Edit mode: Show ColorInput with dynamic background
      Edit: ({ cell, row, table }) => {
        const currentColor = (cell.getValue() as string) || "255,255,255";
        const [color, setColor] = useState(currentColor);

        const handleColorChange = (newColor: string) => {
          setColor(newColor); // Update local state for real-time feedback

          // Determine if it's a new row being created or an existing row being edited
          const creatingRow = table.getState().creatingRow;
          const editingRow = table.getState().editingRow;

          if (creatingRow && creatingRow._valuesCache) {
            // Update creatingRow properly
            table.setCreatingRow({
              ...creatingRow,
              _valuesCache: {
                ...creatingRow._valuesCache,
                COLOR: newColor, // Store as "R,G,B" string
              },
            });
          } else if (editingRow && editingRow._valuesCache) {
            // Update editingRow properly
            table.setEditingRow({
              ...editingRow,
              _valuesCache: {
                ...editingRow._valuesCache,
                COLOR: newColor, // Store as "R,G,B" string
              },
            });
          }

          // Update the table state with the new color
          const updatedRows = table
            .getRowModel()
            .rows.map((r) =>
              r.id === row.id ? { ...r.original, COLOR: newColor } : r.original
            );

          // Assuming `setData` is passed in meta to update table state
          setData(updatedRows);
        };

        return (
          <ColorInput
            label="Graph Color"
            format="rgb" // Stores RGB values like "rgb(255,255,255)"
            value={`rgb(${color})`} // Ensure the value is in the correct format
            onChange={(newColor) => {
              // Extract RGB values from the new color string
              const rgbValues = newColor.replace(/[^\d,]/g, ""); // Remove non-numeric characters
              handleColorChange(rgbValues);
            }}
            swatches={[
              "rgb(255, 0, 0)",
              "rgb(0, 255, 0)",
              "rgb(0, 0, 255)",
              "rgb(255, 255, 0)",
              "rgb(255, 0, 255)",
              "rgb(0, 255, 255)",
            ]}
            swatchesPerRow={6}
            withPicker={true}
            // style={{ backgroundColor: `rgb(${color})` }} // Dynamic background for the input box
            aria-label="Select Graph Color"
          />
        );
      },
    },
    {
      accessorKey: 'TAXOFFSET', 
      header: 'Tax Off-set',
      enableEditing: siflag === 'I' ? false : true,
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["TAXOFFSET"],
        onFocus: () => setValidationErrors({ ...validationErrors, TAXOFFSET: "" }),
        maxLength: 4,
      },
      mantineTableHeadCellProps: { className: 'rpt-header-3' },
    },
    {
      accessorKey: 'CSH', 
      header: 'Cash Sector',
      editVariant: 'select',
      enableEditing: siflag === 'I' ? false : true,
      mantineEditSelectProps: {
        data: [
          {value: "C", label: "Yes"},
          {value: " ", label: "No"}
        ],
      },
      mantineTableHeadCellProps: { className: 'rpt-header-3' },
    },
    {
      accessorKey: 'OPT', 
      header: "Options Used in Calculation",
      editVariant: 'select',
      enableEditing: siflag === 'I' ? false : true,
      mantineEditSelectProps: {
        data: [
          {value: "S", label: "Option Sector (S)"},
          {value: "O", label: "Total Fund Sector (O)"},
          {value: "N", label: "Total Fund w/o Options (N)"},
          {value: " ", label: "No Special Options"}
        ],
      },
      mantineTableHeadCellProps: { className: 'rpt-header-3' },
    },
    {
      accessorKey: 'TYP', 
      header: 'Benchmark Type',
      enableEditing: siflag === 'S' ? false : true,
      editVariant: "select",
      mantineEditSelectProps: {
        data: [
          { value: "2B", label: "Blended" },
          { value: "4C", label: "Convertible" },
          { value: "5E", label: "Equity" },
          { value: "6F", label: "Fixed Income" },
          { value: "7P", label: "Policy" },
          { value: "8S", label: "Short Term" },
          { value: "~~", label: "Unassigned" },
        ],
        error: validationErrors["TYP"],
        onFocus: () => setValidationErrors({ ...validationErrors, TYP: "" }),
      },
      mantineTableHeadCellProps: { className: 'rpt-header-3' },
    },
    {
      accessorKey: 'DAYFACTOR', 
      header: 'Daily Factor',
      enableEditing: siflag === 'I' ? false : true,
      editVariant: 'select',
      mantineEditSelectProps: {
        data: [
          { value: "1.000000", label: "Beginning of Business (1.0)" },
          { value: ".500000", label: "Mid-day (0.5)" },
          { value: ".000000", label: "End of Business (0.0)" },
          { value: " ", label: "No Daily Factor Selected" },
        ]
      },
      mantineTableHeadCellProps: { align: "right", className: "rpt-header-3" },
      mantineTableBodyCellProps: { align: "right" },
      Cell: ({ cell }) =>
        cell
          .getValue<number>()
          ?.toLocaleString("en-US", {
            minimumFractionDigits: 6,
            maximumFractionDigits: 6,
          }),
    },
    {
      accessorKey: 'TFSEC', 
      header: siflag === 'I' ? 'Calculation Type' : "Sector Calc ID",
      
      editVariant: "select",
      mantineEditSelectProps: {
        data: siflag === 'I' ?
         [
          { value: "~", label: "No Calculation Type" },
          { value: "W", label: "Acct-Specific Policy" },
          { value: "B", label: "Blended" },
          { value: "C", label: "Compounding Plus" },
          { value: "A", label: "Plus" },
          { value: "P", label: "Policy-Weighted" },
        ] :
        [
          { value: "T", label: "Total Fund Sector (T)" },
          { value: "F", label: "Fee Off-set Sector (F)" },
          { value: "C", label: "Cash Allocation Sector (C)" },
          { value: "S", label: "Total Cash Sector (S)" },
          { value: "U", label: "Unmanaged (U)" },
          { value: "X", label: "Excluded-NPA (X)" },
          { value: " ", label: "No Special Calculation Assignment" },
        ],
        error: validationErrors["TFSEC"],
        onFocus: () => setValidationErrors({ ...validationErrors, TFSEC: "" }),
      },
      mantineTableHeadCellProps: { className: 'rpt-header-3'},
    },
    {
      accessorKey: 'BRCFREQ', 
      header: 'Calculation Frequency',
      
      editVariant: "select",
      mantineEditSelectProps: {
        data: [
          { value: "M", label: "Monthly" },
          { value: "D", label: "Daily" },
        ],
        error: validationErrors["BRCFREQ"],
        onFocus: () => setValidationErrors({ ...validationErrors, BRCFREQ: "" }),
      },
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
    },
    {
      accessorKey: "BMCOUNTRY",
      header: "Country",
      mantineTableHeadCellProps: { className: "rpt-header-3" },
      enableEditing: siflag === 'S' ? false : true,

      Edit: ({ cell, table, row }) => {
        const [value, setValue] = useState<string | null>(
          cell.getValue<string>()
        );
        const airCntry = (processedCountry || []).map((country: { COUNTRY: string; CNAME: string; }) => ({
          value: country.COUNTRY,
          label: country.CNAME + " (" + country.COUNTRY + ")",
        }));
        return (
          <Select
            label="Country"
            data={airCntry}
            value={value}
            onChange={(selectedValue) => {
              setValue(selectedValue);
              row.original.BMCOUNTRY = selectedValue || "";
              // Determine if it's a new row being created or an existing row being edited
              const creatingRow = table.getState().creatingRow;
              const editingRow = table.getState().editingRow;
              if (creatingRow && creatingRow._valuesCache) {
                creatingRow._valuesCache.BMCOUNTRY = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              } else if (editingRow && editingRow._valuesCache) {
                editingRow._valuesCache.BMCOUNTRY = selectedValue || "";
                table.setEditingRow(editingRow); // Ensure state is updated
              }
              // Update the selected value in the table state
              const selectedVal = airCntry.find(
                (option) => option.value === selectedValue
              );
              // Update the selected value in the table state
              if (selectedVal) {
                const updatedRows = table
                  .getRowModel()
                  .rows.map((r) =>
                    r.id === cell.row.id
                      ? { ...r.original, BMCOUNTRY: selectedValue || "" }
                      : r.original
                  );

                setData(updatedRows);
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
    },
    {
      accessorKey: 'SRT', 
      header: 'Custom Legacy Sort',
      
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["SRT"],
        onFocus: () => setValidationErrors({ ...validationErrors, SRT: "" }),
        maxLength: 5,
      },
      mantineTableHeadCellProps: { className: 'rpt-header-3' },
    },
    {
      accessorKey: 'GINDEX', 
      header: 'Client Defined (30) 1',
      enableEditing: siflag === 'I' ? false : true,
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["GINDEX"],
        onFocus: () => setValidationErrors({ ...validationErrors, GINDEX: "" }),
        maxLength: 30,
      },
      mantineTableHeadCellProps: { className: 'rpt-header-3' },
    },
    {
      accessorKey: 'EXTRA2', 
      header: 'Client Defined (30) 2',
      enableEditing: siflag === 'I' ? false : true,
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["EXTRA2"],
        onFocus: () => setValidationErrors({ ...validationErrors, EXTRA2: "" }),
        maxLength: 30,
      },
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
    },
    {
      accessorKey: 'CATNAME', 
      header: 'Client Defined (30) 3',
      enableEditing: siflag === 'I' ? false : true,
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["CATNAME"],
        onFocus: () => setValidationErrors({ ...validationErrors, CATNAME: "" }),
        maxLength: 30,
      },
      mantineTableHeadCellProps: { className: 'rpt-header-3' },
    },
    {
      accessorKey: 'SI1USER1', 
      header: 'Client Defined Alpha 1',
      
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["SI1USER1"],
        onFocus: () => setValidationErrors({ ...validationErrors, SI1USER1: "" }),
        maxLength: 10,
      },
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
    },
    {
      accessorKey: 'SI1USER2', 
      header: 'Client Defined Alpha 2',
      
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["SI1USER2"],
        onFocus: () => setValidationErrors({ ...validationErrors, SI1USER2: "" }),
        maxLength: 10,
      },
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
    },
    {
      accessorKey: 'SI1USER3', 
      header: 'Client Defined Alpha 3',
      
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["SI1USER3"],
        onFocus: () => setValidationErrors({ ...validationErrors, SI1USER3: "" }),
        maxLength: 10,
      },
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
    },
    {
      accessorKey: 'SI1USER4', 
      header: 'Client Defined Alpha 4',
      
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["SI1USER4"],
        onFocus: () => setValidationErrors({ ...validationErrors, SI1USER4: "" }),
        maxLength: 10,
      },
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
    },
    {
      accessorKey: 'SI1USER5', 
      header: 'Client Defined Alpha 5',
      
      mantineEditTextInputProps: {
        type: "text",
        error: validationErrors["SI1USER5"],
        onFocus: () => setValidationErrors({ ...validationErrors, SI1USER5: "" }),
        maxLength: 10,
      },
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
    },
    {
      accessorKey: 'SB_TIER', 
      header: 'Report Tier',
      
      mantineEditTextInputProps: {
        type: "number",
        error: validationErrors["SB_TIER"],
        onFocus: () => setValidationErrors({ ...validationErrors, SB_TIER: "" }),
        maxLength: 2,
      },
      mantineTableHeadCellProps: { className: 'rpt-header-3' },
    },
    {
      accessorKey: 'GBR_FLAG', 
      header: 'Include in Goal Based Reporting Editor',
      editVariant: "select",
      
      mantineEditSelectProps:{
        data: [
          { value: "Y", label: "Yes" },
          { value: "N", label: "No" },
        ],
        error: validationErrors["GBR_FLAG"],
        onFocus: () => setValidationErrors({ ...validationErrors, GBR_FLAG: "" }),
      },
      mantineTableHeadCellProps: {
        className: 'rpt-header-3',
      },
    },
    {
      accessorKey: 'MWRR_FLAG', 
      header: 'Include in Money Weighted Rates Of Return Reporting',
      editVariant: "select",
      enableEditing: siflag === 'I' ? false : true,
      mantineEditSelectProps:{
        data: [
          { value: "Y", label: "Yes" },
          { value: "N", label: "No" },
        ],
        error: validationErrors["GBR_FLAG"],
        onFocus: () => setValidationErrors({ ...validationErrors, GBR_FLAG: "" }),
      },
      mantineTableHeadCellProps: { className: 'rpt-header-3'  },
    },

  ];
};
