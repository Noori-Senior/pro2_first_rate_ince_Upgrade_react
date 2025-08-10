import { useState } from "react";
import { type MRT_ColumnDef } from "mantine-react-table";
import { IconCalendar } from "@tabler/icons-react";
import { DatePickerInput } from "@mantine/dates";
import { formatDate } from "../../hooks/FormatDates.tsx";
import { SecurityCharacteristicsFields } from './SecurityCharacteristicsDefines.tsx';

// Column definitions as a separate component
export const useSecurityCharColumns = (
  data: SecurityCharacteristicsFields[],
  isEditAble: boolean,
): MRT_ColumnDef<SecurityCharacteristicsFields>[] => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string | "">>({});

  return [
           // SECDATE (Date)
           {
             accessorKey: 'SECDATE',
             header: 'Security Date',
             enableEditing: isEditAble,
             mantineTableHeadCellProps: { className: 'rpt-header-3' },
             Edit: ({ row, table, cell }) => {
               const initialDate = formatDate(row.original.SECDATE?.toString());
               const [tDateValue, setTdateValue] = useState<Date | null>(initialDate || new Date());
               return (
                 <DatePickerInput
                   icon={<IconCalendar size={24} stroke={2.0} />}
                   label="Security Date"
                   value={tDateValue}
                   onChange={(selectedDate) => {
                     if (!selectedDate) return;
                     const year = selectedDate.getFullYear();
                     const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                     const day = String(selectedDate.getDate()).padStart(2, '0');
                     const formattedDate = `${year}-${month}-${day}`;
                     setTdateValue(selectedDate);
                     const creatingRow = table.getState().creatingRow;
                     const editingRow = table.getState().editingRow;
                     if (creatingRow && creatingRow._valuesCache) {
                       creatingRow._valuesCache.SECDATE = formattedDate;
                       table.setEditingRow(editingRow);
                     } else if (editingRow && editingRow._valuesCache) {
                       editingRow._valuesCache.SECDATE = formattedDate;
                       table.setEditingRow(editingRow);
                     }
                   }}
                 />
               );
             },
             Cell: ({ cell }) => {
               const dateValue = cell.getValue<string>();
               if (!dateValue) return '';
               const formattedDate = new Date(dateValue).toLocaleDateString('en-CA', {
                 year: 'numeric',
                 month: '2-digit'
               });
               return formattedDate.replace('-', '/').replace('-', '/');
             },
           },
         
           // CID (string)
           {
             accessorKey: "CID",
             header: "CID",
             editVariant: "text",
             mantineEditTextInputProps: {
               type: "text",
               error: validationErrors["CID"],
               onFocus: () => setValidationErrors({ ...validationErrors, CID: "" }),
               maxLength: 12,
             },
             mantineTableHeadCellProps: { className: "rpt-header-3" },
           },
         
           // TKRID (string)
           {
             accessorKey: "TKRID",
             header: "Ticker ID",
             editVariant: "text",
             mantineEditTextInputProps: {
               type: "text",
               error: validationErrors["TKRID"],
               onFocus: () => setValidationErrors({ ...validationErrors, TKRID: "" }),
               maxLength: 10,
             },
             mantineTableHeadCellProps: { className: "rpt-header-3" },
           },
         
           // PRICE (number)
           {
             accessorKey: "PRICE",
             header: "Price",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["PRICE"],
               onFocus: () => setValidationErrors({ ...validationErrors, PRICE: "" }),
               maxLength: 17,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 5,
                 maximumFractionDigits: 5,
               }),
           },
         
           // MKTSECT (number)
           {
             accessorKey: "MKTSECT",
             header: "Market Sector",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["MKTSECT"],
               onFocus: () => setValidationErrors({ ...validationErrors, MKTSECT: "" }),
               maxLength: 50,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) => cell.getValue<number>()?.toLocaleString("en-US"),
           },
         
           // DIVYLD (number)
           {
             accessorKey: "DIVYLD",
             header: "Dividend Yield",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["DIVYLD"],
               onFocus: () => setValidationErrors({ ...validationErrors, DIVYLD: "" }),
               maxLength: 10,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 3,
                 maximumFractionDigits: 3,
               }),
           },
         
           // ANNDIV (number)
           {
             accessorKey: "ANNDIV",
             header: "Annual Dividend",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["ANNDIV"],
               onFocus: () => setValidationErrors({ ...validationErrors, ANNDIV: "" }),
               maxLength: 12,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 4,
                 maximumFractionDigits: 4,
               }),
           },
         
           // EXDIVDT (Date)
           {
             accessorKey: 'EXDIVDT',
             header: 'Ex-Dividend Date',
             mantineTableHeadCellProps: { className: 'rpt-header-3' },
             Edit: ({ row, table, cell }) => {
               const initialDate = formatDate(row.original.EXDIVDT?.toString());
               const [tDateValue, setTdateValue] = useState<Date | null>(initialDate || new Date());
               return (
                 <DatePickerInput
                   icon={<IconCalendar size={24} stroke={2.0} />}
                   label="Ex-Dividend Date"
                   value={tDateValue}
                   onChange={(selectedDate) => {
                     if (!selectedDate) return;
                     const year = selectedDate.getFullYear();
                     const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                     const day = String(selectedDate.getDate()).padStart(2, '0');
                     const formattedDate = `${year}-${month}-${day}`;
                     setTdateValue(selectedDate);
                     const creatingRow = table.getState().creatingRow;
                     const editingRow = table.getState().editingRow;
                     if (creatingRow && creatingRow._valuesCache) {
                       creatingRow._valuesCache.EXDIVDT = formattedDate;
                       table.setEditingRow(editingRow);
                     } else if (editingRow && editingRow._valuesCache) {
                       editingRow._valuesCache.EXDIVDT = formattedDate;
                       table.setEditingRow(editingRow);
                     }
                   }}
                 />
               );
             },
             Cell: ({ cell }) => {
               const dateValue = cell.getValue<string>();
               if (!dateValue) return '';
               const formattedDate = new Date(dateValue).toLocaleDateString('en-CA', {
                 year: 'numeric',
                 month: '2-digit',
                 day: '2-digit',
               });
               return formattedDate.replace('-', '/').replace('-', '/');
             },
           },
         
           // DVDLT (number)
           {
             accessorKey: "DVDLT",
             header: "Dividend Delay Time",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["DVDLT"],
               onFocus: () => setValidationErrors({ ...validationErrors, DVDLT: "" }),
               maxLength: 10,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 3,
                 maximumFractionDigits: 3,
               }),
           },
         
           // EPS (number)
           {
             accessorKey: "EPS",
             header: "Earnings Per Share",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["EPS"],
               onFocus: () => setValidationErrors({ ...validationErrors, EPS: "" }),
               maxLength: 8,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // EPSHIGH (number)
           {
             accessorKey: "EPSHIGH",
             header: "EPS High",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["EPSHIGH"],
               onFocus: () => setValidationErrors({ ...validationErrors, EPSHIGH: "" }),
               maxLength: 8,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // EPSLOW (number)
           {
             accessorKey: "EPSLOW",
             header: "EPS Low",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["EPSLOW"],
               onFocus: () => setValidationErrors({ ...validationErrors, EPSLOW: "" }),
               maxLength: 8,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // PE (number)
           {
             accessorKey: "PE",
             header: "Price to Earnings",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["PE"],
               onFocus: () => setValidationErrors({ ...validationErrors, PE: "" }),
               maxLength: 12,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 3,
                 maximumFractionDigits: 3,
               }),
           },
         
           // PE1YR (number)
           {
             accessorKey: "PE1YR",
             header: "1 Year PE",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["PE1YR"],
               onFocus: () => setValidationErrors({ ...validationErrors, PE1YR: "" }),
               maxLength: 9,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // EPSGRWTH (number)
           {
             accessorKey: "EPSGRWTH",
             header: "EPS Growth",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["EPSGRWTH"],
               onFocus: () => setValidationErrors({ ...validationErrors, EPSGRWTH: "" }),
               maxLength: 9,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // MKTCAP (number)
           {
             accessorKey: "MKTCAP",
             header: "Market Capitalization",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["MKTCAP"],
               onFocus: () => setValidationErrors({ ...validationErrors, MKTCAP: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 3,
                 maximumFractionDigits: 3,
               }),
           },
         
           // VOLUME (number)
           {
             accessorKey: "VOLUME",
             header: "Volume",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["VOLUME"],
               onFocus: () => setValidationErrors({ ...validationErrors, VOLUME: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 3,
                 maximumFractionDigits: 3,
               }),
           },
         
           // LASTDIV (number)
           {
             accessorKey: "LASTDIV",
             header: "Last Dividend",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["LASTDIV"],
               onFocus: () => setValidationErrors({ ...validationErrors, LASTDIV: "" }),
               maxLength: 20,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 6,
                 maximumFractionDigits: 6,
               }),
           },
         
           // WKHI52 (number)
           {
             accessorKey: "WKHI52",
             header: "52 Week High",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["WKHI52"],
               onFocus: () => setValidationErrors({ ...validationErrors, WKHI52: "" }),
               maxLength: 12,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 4,
                 maximumFractionDigits: 4,
               }),
           },
         
           // WKLO52 (number)
           {
             accessorKey: "WKLO52",
             header: "52 Week Low",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["WKLO52"],
               onFocus: () => setValidationErrors({ ...validationErrors, WKLO52: "" }),
               maxLength: 12,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 4,
                 maximumFractionDigits: 4,
               }),
           },
         
           // ROE (number)
           {
             accessorKey: "ROE",
             header: "Return on Equity",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["ROE"],
               onFocus: () => setValidationErrors({ ...validationErrors, ROE: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 7,
                 maximumFractionDigits: 7,
               }),
           },
         
           // PBOOKVAL (number)
           {
             accessorKey: "PBOOKVAL",
             header: "Price to Book Value",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["PBOOKVAL"],
               onFocus: () => setValidationErrors({ ...validationErrors, PBOOKVAL: "" }),
               maxLength: 9,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // BETA (number)
           {
             accessorKey: "BETA",
             header: "Beta",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["BETA"],
               onFocus: () => setValidationErrors({ ...validationErrors, BETA: "" }),
               maxLength: 7,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // PRCHGYTD (number)
           {
             accessorKey: "PRCHGYTD",
             header: "Price Change YTD",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["PRCHGYTD"],
               onFocus: () => setValidationErrors({ ...validationErrors, PRCHGYTD: "" }),
               maxLength: 10,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 3,
                 maximumFractionDigits: 3,
               }),
           },
         
           // PRCASH (number)
           {
             accessorKey: "PRCASH",
             header: "Price to Cash",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["PRCASH"],
               onFocus: () => setValidationErrors({ ...validationErrors, PRCASH: "" }),
               maxLength: 9,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // MATURITY (Date)
           {
             accessorKey: 'MATURITY',
             header: 'Maturity Date',
             mantineTableHeadCellProps: { className: 'rpt-header-3' },
             Edit: ({ row, table, cell }) => {
               const initialDate = formatDate(row.original.MATURITY?.toString());
               const [tDateValue, setTdateValue] = useState<Date | null>(initialDate || new Date());
               return (
                 <DatePickerInput
                   icon={<IconCalendar size={24} stroke={2.0} />}
                   label="Maturity Date"
                   value={tDateValue}
                   onChange={(selectedDate) => {
                     if (!selectedDate) return;
                     const year = selectedDate.getFullYear();
                     const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                     const day = String(selectedDate.getDate()).padStart(2, '0');
                     const formattedDate = `${year}-${month}-${day}`;
                     setTdateValue(selectedDate);
                     const creatingRow = table.getState().creatingRow;
                     const editingRow = table.getState().editingRow;
                     if (creatingRow && creatingRow._valuesCache) {
                       creatingRow._valuesCache.MATURITY = formattedDate;
                       table.setEditingRow(editingRow);
                     } else if (editingRow && editingRow._valuesCache) {
                       editingRow._valuesCache.MATURITY = formattedDate;
                       table.setEditingRow(editingRow);
                     }
                   }}
                 />
               );
             },
             Cell: ({ cell }) => {
               const dateValue = cell.getValue<string>();
               if (!dateValue) return '';
               const formattedDate = new Date(dateValue).toLocaleDateString('en-CA', {
                 year: 'numeric',
                 month: '2-digit',
                 day: '2-digit',
               });
               return formattedDate.replace('-', '/').replace('-', '/');
             },
           },
         
           // ANNYLD (number)
           {
             accessorKey: "ANNYLD",
             header: "Annual Yield",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["ANNYLD"],
               onFocus: () => setValidationErrors({ ...validationErrors, ANNYLD: "" }),
               maxLength: 9,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // YLDTMAT (number)
           {
             accessorKey: "YLDTMAT",
             header: "Yield to Maturity",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["YLDTMAT"],
               onFocus: () => setValidationErrors({ ...validationErrors, YLDTMAT: "" }),
               maxLength: 9,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // SPRATE (string)
           {
             accessorKey: "SPRATE",
             header: "S&P Rating",
             editVariant: "text",
             mantineEditTextInputProps: {
               type: "text",
               error: validationErrors["SPRATE"],
               onFocus: () => setValidationErrors({ ...validationErrors, SPRATE: "" }),
               maxLength: 50,
             },
             mantineTableHeadCellProps: { className: "rpt-header-3" },
           },
         
           // DURATION (number)
           {
             accessorKey: "DURATION",
             header: "Duration",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["DURATION"],
               onFocus: () => setValidationErrors({ ...validationErrors, DURATION: "" }),
               maxLength: 10,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 3,
                 maximumFractionDigits: 3,
               }),
           },
         
           // INDUSTRY (string)
           {
             accessorKey: "INDUSTRY",
             header: "Industry",
             editVariant: "text",
             mantineEditTextInputProps: {
               type: "text",
               error: validationErrors["INDUSTRY"],
               onFocus: () => setValidationErrors({ ...validationErrors, INDUSTRY: "" }),
               maxLength: 10,
             },
             mantineTableHeadCellProps: { className: "rpt-header-3" },
           },
         
           // USERDEF1 (string)
           {
             accessorKey: "USERDEF1",
             header: "User Defined 1",
             editVariant: "text",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["USERDEF1"],
               onFocus: () => setValidationErrors({ ...validationErrors, USERDEF1: "" }),
               maxLength: 12,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 3,
                 maximumFractionDigits: 3,
               }),
           },
         
           // USERDEF2 (string)
           {
             accessorKey: "USERDEF2",
             header: "User Defined 2",
             editVariant: "text",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["USERDEF2"],
               onFocus: () => setValidationErrors({ ...validationErrors, USERDEF2: "" }),
               maxLength: 12,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 3,
                 maximumFractionDigits: 3,
               })
           },
         
           // USERDEF3 (string)
           {
             accessorKey: "USERDEF3",
             header: "User Defined 3",
             editVariant: "text",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["USERDEF3"],
               onFocus: () => setValidationErrors({ ...validationErrors, USERDEF3: "" }),
               maxLength: 12,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 3,
                 maximumFractionDigits: 3,
               })
           },
         
           // USERDEF4 (string)
           {
             accessorKey: "USERDEF4",
             header: "User Defined 4",
             editVariant: "text",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["USERDEF4"],
               onFocus: () => setValidationErrors({ ...validationErrors, USERDEF4: "" }),
               maxLength: 12,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 3,
                 maximumFractionDigits: 3,
               })
           },
         
           // USERDEF5 (string)
           {
             accessorKey: "USERDEF5",
             header: "User Defined 5",
             editVariant: "text",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["USERDEF5"],
               onFocus: () => setValidationErrors({ ...validationErrors, USERDEF5: "" }),
               maxLength: 12,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 3,
                 maximumFractionDigits: 3,
               })
           },
         
           // PEYTD (number)
           {
             accessorKey: "PEYTD",
             header: "PE YTD",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["PEYTD"],
               onFocus: () => setValidationErrors({ ...validationErrors, PEYTD: "" }),
               maxLength: 9,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // PRCHG1YR (number)
           {
             accessorKey: "PRCHG1YR",
             header: "Price Change 1 Year",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["PRCHG1YR"],
               onFocus: () => setValidationErrors({ ...validationErrors, PRCHG1YR: "" }),
               maxLength: 20,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 3,
                 maximumFractionDigits: 3,
               }),
           },
         
           // BTR1000 (number)
           {
             accessorKey: "BTR1000",
             header: "BTR 1000",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["BTR1000"],
               onFocus: () => setValidationErrors({ ...validationErrors, BTR1000: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // BTR1000G (number)
           {
             accessorKey: "BTR1000G",
             header: "BTR 1000 Growth",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["BTR1000G"],
               onFocus: () => setValidationErrors({ ...validationErrors, BTR1000G: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // BTR1000V (number)
           {
             accessorKey: "BTR1000V",
             header: "BTR 1000 Value",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["BTR1000V"],
               onFocus: () => setValidationErrors({ ...validationErrors, BTR1000V: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // BTR2000 (number)
           {
             accessorKey: "BTR2000",
             header: "BTR 2000",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["BTR2000"],
               onFocus: () => setValidationErrors({ ...validationErrors, BTR2000: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // BTR2000G (number)
           {
             accessorKey: "BTR2000G",
             header: "BTR 2000 Growth",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["BTR2000G"],
               onFocus: () => setValidationErrors({ ...validationErrors, BTR2000G: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // BTR2000V (number)
           {
             accessorKey: "BTR2000V",
             header: "BTR 2000 Value",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["BTR2000V"],
               onFocus: () => setValidationErrors({ ...validationErrors, BTR2000V: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // BTR3000 (number)
           {
             accessorKey: "BTR3000",
             header: "BTR 3000",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["BTR3000"],
               onFocus: () => setValidationErrors({ ...validationErrors, BTR3000: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // BTR3000G (number)
           {
             accessorKey: "BTR3000G",
             header: "BTR 3000 Growth",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["BTR3000G"],
               onFocus: () => setValidationErrors({ ...validationErrors, BTR3000G: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // BTR3000V (number)
           {
             accessorKey: "BTR3000V",
             header: "BTR 3000 Value",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["BTR3000V"],
               onFocus: () => setValidationErrors({ ...validationErrors, BTR3000V: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // BTRMID (number)
           {
             accessorKey: "BTRMID",
             header: "BTR Mid",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["BTRMID"],
               onFocus: () => setValidationErrors({ ...validationErrors, BTRMID: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // BTRMIDG (number)
           {
             accessorKey: "BTRMIDG",
             header: "BTR Mid Growth",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["BTRMIDG"],
               onFocus: () => setValidationErrors({ ...validationErrors, BTRMIDG: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // BTRMIDV (number)
           {
             accessorKey: "BTRMIDV",
             header: "BTR Mid Value",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["BTRMIDV"],
               onFocus: () => setValidationErrors({ ...validationErrors, BTRMIDV: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // BTMID (number)
           {
             accessorKey: "BTMID",
             header: "BT Mid",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["BTMID"],
               onFocus: () => setValidationErrors({ ...validationErrors, BTMID: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // BTSPBGI (number)
           {
             accessorKey: "BTSPBGI",
             header: "BT SPBGI",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["BTSPBGI"],
               onFocus: () => setValidationErrors({ ...validationErrors, BTSPBGI: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // BTSPBVI (number)
           {
             accessorKey: "BTSPBVI",
             header: "BT SPBVI",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["BTSPBVI"],
               onFocus: () => setValidationErrors({ ...validationErrors, BTSPBVI: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // BTSPSCI (number)
           {
             accessorKey: "BTSPSCI",
             header: "BT SPSCI",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["BTSPSCI"],
               onFocus: () => setValidationErrors({ ...validationErrors, BTSPSCI: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // BTSPX (number)
           {
             accessorKey: "BTSPX",
             header: "BT SPX",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["BTSPX"],
               onFocus: () => setValidationErrors({ ...validationErrors, BTSPX: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // DIVYLD5Y (number)
           {
             accessorKey: "DIVYLD5Y",
             header: "5 Year Dividend Yield",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["DIVYLD5Y"],
               onFocus: () => setValidationErrors({ ...validationErrors, DIVYLD5Y: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // DIVGR5Y (number)
           {
             accessorKey: "DIVGR5Y",
             header: "5 Year Dividend Growth",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["DIVGR5Y"],
               onFocus: () => setValidationErrors({ ...validationErrors, DIVGR5Y: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // DIVYLDIR (number)
           {
             accessorKey: "DIVYLDIR",
             header: "Dividend Yield IR",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["DIVYLDIR"],
               onFocus: () => setValidationErrors({ ...validationErrors, DIVYLDIR: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // DIVPSANN (number)
           {
             accessorKey: "DIVPSANN",
             header: "Dividend Per Share Annual",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["DIVPSANN"],
               onFocus: () => setValidationErrors({ ...validationErrors, DIVPSANN: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // EPS10YGR (number)
           {
             accessorKey: "EPS10YGR",
             header: "10 Year EPS Growth",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["EPS10YGR"],
               onFocus: () => setValidationErrors({ ...validationErrors, EPS10YGR: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // EPS3YGR (number)
           {
             accessorKey: "EPS3YGR",
             header: "3 Year EPS Growth",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["EPS3YGR"],
               onFocus: () => setValidationErrors({ ...validationErrors, EPS3YGR: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // EPS5YGR (number)
           {
             accessorKey: "EPS5YGR",
             header: "5 Year EPS Growth",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["EPS5YGR"],
               onFocus: () => setValidationErrors({ ...validationErrors, EPS5YGR: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // EPSCHGCF (number)
           {
             accessorKey: "EPSCHGCF",
             header: "EPS Change CF",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["EPSCHGCF"],
               onFocus: () => setValidationErrors({ ...validationErrors, EPSCHGCF: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // EPSLTM (number)
           {
             accessorKey: "EPSLTM",
             header: "EPS Last Twelve Months",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["EPSLTM"],
               onFocus: () => setValidationErrors({ ...validationErrors, EPSLTM: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // EPSLSTFY (number)
           {
             accessorKey: "EPSLSTFY",
             header: "EPS Last Fiscal Year",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["EPSLSTFY"],
               onFocus: () => setValidationErrors({ ...validationErrors, EPSLSTFY: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // EPSCOFTM (number)
           {
             accessorKey: "EPSCOFTM",
             header: "EPS Current of TM",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["EPSCOFTM"],
               onFocus: () => setValidationErrors({ ...validationErrors, EPSCOFTM: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // EPSCOCFY (number)
           {
             accessorKey: "EPSCOCFY",
             header: "EPS Current of CFY",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["EPSCOCFY"],
               onFocus: () => setValidationErrors({ ...validationErrors, EPSCOCFY: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // EPSCONFY (number)
           {
             accessorKey: "EPSCONFY",
             header: "EPS Consensus FY",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["EPSCONFY"],
               onFocus: () => setValidationErrors({ ...validationErrors, EPSCONFY: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // EPSCLFY (number)
           {
             accessorKey: "EPSCLFY",
             header: "EPS Current Last FY",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["EPSCLFY"],
               onFocus: () => setValidationErrors({ ...validationErrors, EPSCLFY: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // EPSNCF (number)
           {
             accessorKey: "EPSNCF",
             header: "EPS Net CF",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["EPSNCF"],
               onFocus: () => setValidationErrors({ ...validationErrors, EPSNCF: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // EPSNNFY (number)
           {
             accessorKey: "EPSNNFY",
             header: "EPS Net Next FY",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["EPSNNFY"],
               onFocus: () => setValidationErrors({ ...validationErrors, EPSNNFY: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // EPSLTFG (number)
           {
             accessorKey: "EPSLTFG",
             header: "EPS Long Term FG",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["EPSLTFG"],
               onFocus: () => setValidationErrors({ ...validationErrors, EPSLTFG: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // LTDTOTCP (number)
           {
             accessorKey: "LTDTOTCP",
             header: "Long Term Debt to Capital",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["LTDTOTCP"],
               onFocus: () => setValidationErrors({ ...validationErrors, LTDTOTCP: "" }),
               maxLength: 22,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 8,
                 maximumFractionDigits: 8,
               }),
           },
         
           // MGNGROSS (number)
           {
             accessorKey: "MGNGROSS",
             header: "Gross Margin",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["MGNGROSS"],
               onFocus: () => setValidationErrors({ ...validationErrors, MGNGROSS: "" }),
               maxLength: 22,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 8,
                 maximumFractionDigits: 8,
               }),
           },
         
           // MGNNP (number)
           {
             accessorKey: "MGNNP",
             header: "Net Profit Margin",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["MGNNP"],
               onFocus: () => setValidationErrors({ ...validationErrors, MGNNP: "" }),
               maxLength: 22,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 8,
                 maximumFractionDigits: 8,
               }),
           },
         
           // MGNOPER (number)
           {
             accessorKey: "MGNOPER",
             header: "Operating Margin",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["MGNOPER"],
               onFocus: () => setValidationErrors({ ...validationErrors, MGNOPER: "" }),
               maxLength: 22,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 8,
                 maximumFractionDigits: 8,
               }),
           },
         
           // ROEQUITY (number)
           {
             accessorKey: "ROEQUITY",
             header: "Return on Equity",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["ROEQUITY"],
               onFocus: () => setValidationErrors({ ...validationErrors, ROEQUITY: "" }),
               maxLength: 22,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 8,
                 maximumFractionDigits: 8,
               }),
           },
         
           // MKTCAP2 (number)
           {
             accessorKey: "MKTCAP2",
             header: "Market Cap 2",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["MKTCAP2"],
               onFocus: () => setValidationErrors({ ...validationErrors, MKTCAP2: "" }),
               maxLength: 20,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 4,
                 maximumFractionDigits: 4,
               }),
           },
         
           // PEGRATIO (number)
           {
             accessorKey: "PEGRATIO",
             header: "PE Growth Ratio",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["PEGRATIO"],
               onFocus: () => setValidationErrors({ ...validationErrors, PEGRATIO: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // PEFWD (number)
           {
             accessorKey: "PEFWD",
             header: "Forward PE",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["PEFWD"],
               onFocus: () => setValidationErrors({ ...validationErrors, PEFWD: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // PECFY (number)
           {
             accessorKey: "PECFY",
             header: "Current FY PE",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["PECFY"],
               onFocus: () => setValidationErrors({ ...validationErrors, PECFY: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // PELTM (number)
           {
             accessorKey: "PELTM",
             header: "Last Twelve Months PE",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["PELTM"],
               onFocus: () => setValidationErrors({ ...validationErrors, PELTM: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // PE5YAVG (number)
           {
             accessorKey: "PE5YAVG",
             header: "5 Year Average PE",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["PE5YAVG"],
               onFocus: () => setValidationErrors({ ...validationErrors, PE5YAVG: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // PSBOOK (number)
           {
             accessorKey: "PSBOOK",
             header: "Price to Sales Book",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["PSBOOK"],
               onFocus: () => setValidationErrors({ ...validationErrors, PSBOOK: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // PSCASHFL (number)
           {
             accessorKey: "PSCASHFL",
             header: "Price to Cash Flow",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["PSCASHFL"],
               onFocus: () => setValidationErrors({ ...validationErrors, PSCASHFL: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // PSREV (number)
           {
             accessorKey: "PSREV",
             header: "Price to Sales Revenue",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["PSREV"],
               onFocus: () => setValidationErrors({ ...validationErrors, PSREV: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // PSCFLTM (number)
           {
             accessorKey: "PSCFLTM",
             header: "Price to Sales CF LTM",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["PSCFLTM"],
               onFocus: () => setValidationErrors({ ...validationErrors, PSCFLTM: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // PSEBITMG (number)
           {
             accessorKey: "PSEBITMG",
             header: "Price to Sales EBIT Margin",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["PSEBITMG"],
               onFocus: () => setValidationErrors({ ...validationErrors, PSEBITMG: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // PB (number)
           {
             accessorKey: "PB",
             header: "Price to Book",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["PB"],
               onFocus: () => setValidationErrors({ ...validationErrors, PB: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // PRCF (number)
           {
             accessorKey: "PRCF",
             header: "Price to Cash Flow",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["PRCF"],
               onFocus: () => setValidationErrors({ ...validationErrors, PRCF: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // PRSALES (number)
           {
             accessorKey: "PRSALES",
             header: "Price to Sales",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["PRSALES"],
               onFocus: () => setValidationErrors({ ...validationErrors, PRSALES: "" }),
               maxLength: 15,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2,
               }),
           },
         
           // COUPON (number)
           {
             accessorKey: "COUPON",
             header: "Coupon Rate",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["COUPON"],
               onFocus: () => setValidationErrors({ ...validationErrors, COUPON: "" }),
               maxLength: 20,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 6,
                 maximumFractionDigits: 6,
               }),
           },
         
           // CALLDATE (Date)
           {
             accessorKey: 'CALLDATE',
             header: 'Call Date',
             mantineTableHeadCellProps: { className: 'rpt-header-3' },
             Edit: ({ row, table, cell }) => {
               const initialDate = formatDate(row.original.CALLDATE?.toString());
               const [tDateValue, setTdateValue] = useState<Date | null>(initialDate || new Date());
               return (
                 <DatePickerInput
                   icon={<IconCalendar size={24} stroke={2.0} />}
                   label="Call Date"
                   value={tDateValue}
                   onChange={(selectedDate) => {
                     if (!selectedDate) return;
                     const year = selectedDate.getFullYear();
                     const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                     const day = String(selectedDate.getDate()).padStart(2, '0');
                     const formattedDate = `${year}-${month}-${day}`;
                     setTdateValue(selectedDate);
                     const creatingRow = table.getState().creatingRow;
                     const editingRow = table.getState().editingRow;
                     if (creatingRow && creatingRow._valuesCache) {
                       creatingRow._valuesCache.CALLDATE = formattedDate;
                       table.setEditingRow(editingRow);
                     } else if (editingRow && editingRow._valuesCache) {
                       editingRow._valuesCache.CALLDATE = formattedDate;
                       table.setEditingRow(editingRow);
                     }
                   }}
                 />
               );
             },
             Cell: ({ cell }) => {
               const dateValue = cell.getValue<string>();
               if (!dateValue) return '';
               const formattedDate = new Date(dateValue).toLocaleDateString('en-CA', {
                 year: 'numeric',
                 month: '2-digit',
                 day: '2-digit',
               });
               return formattedDate.replace('-', '/').replace('-', '/');
             },
           },
         
           // CALLPRICE (number)
           {
             accessorKey: "CALLPRICE",
             header: "Call Price",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["CALLPRICE"],
               onFocus: () => setValidationErrors({ ...validationErrors, CALLPRICE: "" }),
               maxLength: 20,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 6,
                 maximumFractionDigits: 6,
               }),
           },
         
           // PUTDATE (Date)
           {
             accessorKey: 'PUTDATE',
             header: 'Put Date',
             mantineTableHeadCellProps: { className: 'rpt-header-3' },
             Edit: ({ row, table, cell }) => {
               const initialDate = formatDate(row.original.PUTDATE?.toString());
               const [tDateValue, setTdateValue] = useState<Date | null>(initialDate || new Date());
               return (
                 <DatePickerInput
                   icon={<IconCalendar size={24} stroke={2.0} />}
                   label="Put Date"
                   value={tDateValue}
                   onChange={(selectedDate) => {
                     if (!selectedDate) return;
                     const year = selectedDate.getFullYear();
                     const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                     const day = String(selectedDate.getDate()).padStart(2, '0');
                     const formattedDate = `${year}-${month}-${day}`;
                     setTdateValue(selectedDate);
                     const creatingRow = table.getState().creatingRow;
                     const editingRow = table.getState().editingRow;
                     if (creatingRow && creatingRow._valuesCache) {
                       creatingRow._valuesCache.PUTDATE = formattedDate;
                       table.setEditingRow(editingRow);
                     } else if (editingRow && editingRow._valuesCache) {
                       editingRow._valuesCache.PUTDATE = formattedDate;
                       table.setEditingRow(editingRow);
                     }
                   }}
                 />
               );
             },
             Cell: ({ cell }) => {
               const dateValue = cell.getValue<string>();
               if (!dateValue) return '';
               const formattedDate = new Date(dateValue).toLocaleDateString('en-CA', {
                 year: 'numeric',
                 month: '2-digit',
                 day: '2-digit',
               });
               return formattedDate.replace('-', '/').replace('-', '/');
             },
           },
         
           // PUTPRICE (number)
           {
             accessorKey: "PUTPRICE",
             header: "Put Price",
             mantineEditTextInputProps: {
               type: "number",
               error: validationErrors["PUTPRICE"],
               onFocus: () => setValidationErrors({ ...validationErrors, PUTPRICE: "" }),
               maxLength: 20,
             },
             mantineTableHeadCellProps: { align: "right", className: 'rpt-header-3' },
             mantineTableBodyCellProps: { align: "right" },
             Cell: ({ cell }) =>
               cell.getValue<number>()?.toLocaleString("en-US", {
                 minimumFractionDigits: 6,
                 maximumFractionDigits: 6,
               }),
           },
         ];
};
