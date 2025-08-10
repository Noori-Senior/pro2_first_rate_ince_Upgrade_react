import dayjs from "dayjs";
import { SecurityFields } from "../datavalue/columnTitles/SecurityDDL";

// Helper Functions
type DateRange = [string, string] | string;

// formatting date ranges to from date to YYYYMM
const formatFromDateYYM = (dateRange: DateRange): string => {
  if (typeof dateRange === "string") {
    try {
      dateRange = JSON.parse(dateRange) as [string, string];
    } catch (e) {
      console.error("Invalid dateRange format:", dateRange);
      return "";
    }
  }

  if (!Array.isArray(dateRange) || dateRange.length < 2) return "";

  const [year, month] = dayjs(dateRange[0]).format("YYYY/MM").split("/");
  return `${year}${month}`;
};

// formatting date ranges to from date to YYYYMMDD
const formatFromDateYYMD = (dateRange: DateRange): string => {
  if (typeof dateRange === "string") {
    try {
      dateRange = JSON.parse(dateRange) as [string, string];
    } catch (e) {
      console.error("Invalid dateRange format:", dateRange);
      return "";
    }
  }

  if (!Array.isArray(dateRange) || dateRange.length < 2) return "";

  const [year, month, day] = dayjs(dateRange[0]).format("YYYY/MM/DD").split("/");
  return `${year}${month}${day}`;
};

// This function formats the date range to YYYYMM
const formatToDateYYM = (dateRange: DateRange): string => {
  if (typeof dateRange === "string") {
    try {
      dateRange = JSON.parse(dateRange) as [string, string];
    } catch (e) {
      console.error("Invalid dateRange format:", dateRange);
      return "";
    }
  }

  if (!Array.isArray(dateRange) || dateRange.length < 2) return "";

  const [year, month] = dayjs(dateRange[1]).format("YYYY/MM").split("/");
  return `${year}${month}`;
};

// This function formats the date range to YYYYMM
const formatToDateYYMMDD = (dateRange: DateRange): string => {
  if (typeof dateRange === "string") {
    try {
      dateRange = JSON.parse(dateRange) as [string, string];
    } catch (e) {
      console.error("Invalid dateRange format:", dateRange);
      return "";
    }
  }

  if (!Array.isArray(dateRange) || dateRange.length < 2) return "";

  const [year, month, day] = dayjs(dateRange[1]).format("YYYY/MM/DD").split("/");
  return `${year}${month}${day}`;
};

const formatToDateYYMD = (dateRange: DateRange): string => {
  if (typeof dateRange === "string") {
    try {
      dateRange = JSON.parse(dateRange) as [string, string];
    } catch (e) {
      console.error("Invalid dateRange format:", dateRange);
      return "";
    }
  }

  if (!Array.isArray(dateRange) || dateRange.length < 2) return "";

  const [year0, month0, day0] = dayjs(dateRange[0])
    .format("YYYY/MM/DD")
    .split("/");
  const [year1, month1, day1] = dayjs(dateRange[1])
    .format("YYYY/MM/DD")
    .split("/");

  return `${year0}/${month0}/${day0} - ${year1}/${month1}/${day1}`;
};

const getCurrentDate = (): string => {
  const today = dayjs();
  const [year, month] = today.format("YYYY/MM").split("/");
  return `${year}${month}`;
};

const getDateRange = (): string => {
  const today = dayjs();
  const yesterday = today.subtract(1, "day");

  const [year0, month0, day0] = yesterday.format("YYYY/MM/DD").split("/");
  const [year1, month1, day1] = today.format("YYYY/MM/DD").split("/");

  return `${year0}/${month0}/${day0} - ${year1}/${month1}/${day1}`;
};

const formatDateYYM = (dateString) => {
  const date = new Date(dateString);
  return date
    .toLocaleDateString("en-CA", { year: "numeric", month: "2-digit" })
    .replace("-", "/");
};

const formatDateYYMD = (dateString) => {
  const date = new Date(dateString);
  return date
    .toLocaleDateString("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace("-", "/")
    .replace("-", "/");
};

// This function works for pair of dates like "2021-01-01 2021-01-31"
const formatPairDatesYYMD = (dateRangeString?: string | null): string => {
  // Return empty string for empty/null/undefined inputs
  if (!dateRangeString?.trim()) return "";

  // Handle existing "Invalid Date" cases
  if (dateRangeString.includes("Invalid Date")) return "";

  const [fromDateString, toDateString] = dateRangeString.split(" ");

  // Return the original string if it's already in correct format (YYYYMM YYYYMM)
  if (/^\d{6} \d{6}$/.test(dateRangeString)) {
    return dateRangeString;
  }

  // Try to parse other date formats
  try {
    // Example for "YYYY-MM-DD YYYY-MM-DD" format
    if (fromDateString && toDateString) {
      const fromDate = new Date(fromDateString);
      const toDate = new Date(toDateString);

      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        return "";
      }

      // Format as YYYYMM YYYYMM
      const format = (date: Date) =>
        `${date.getFullYear()}${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`;

      return `${format(fromDate)} ${format(toDate)}`;
    }
  } catch (e) {
    console.error("Date parsing error:", e);
  }

  return "";
};

// Helper function to safely parse date strings
const formatDate = (dateString: string) => {
  if (!dateString) return null;

  // Handle YYYY/MM format
  if (dateString.length === 7 && dateString.includes("/")) {
    const [year, month] = dateString.split("/");
    return new Date(`${year}-${month}-01`);
  }

  if (dateString.length === 6) {
    // If format is YYYYMM, convert to YYYY-MM-DD
    return new Date(
      `${dateString.substring(0, 4)}-${dateString.substring(4, 6)}-01`
    );
  }

  if (dateString.length === 10) {
    // If format is YYYY-MM-DD, create a Date object directly
    return new Date(dateString);
  }

  return null; // Invalid date string
};

// Function to generate unique dropdown options dynamically
const getUniqueOptionsSingle = (rows: SecurityFields[], valueKey: string) => {
  const uniqueValues = new Set(); // Use a Set to track unique values
  return rows
    .filter((row) => {
      // Check if the value is already in the Set
      if (!uniqueValues.has(row[valueKey])) {
        uniqueValues.add(row[valueKey]); // Add the value to the Set
        return true; // Include this row in the result
      }
      return false; // Skip this row (duplicate value)
    })
    .map((row) => ({
      label: `${row[valueKey]}`, // Show label and value together
      value: row[valueKey], // Use HID as the value for selection
    }));
};

const formatDateOutput = (dateStr) => {
  if (!dateStr || dateStr.length !== 8) return dateStr; // fallback for safety
  return `${dateStr.slice(0, 4)}/${dateStr.slice(4, 6)}/${dateStr.slice(6, 8)}`;
};

export {
  formatFromDateYYM,
  formatFromDateYYMD,
  formatToDateYYM,
  formatToDateYYMMDD,
  formatToDateYYMD,
  getCurrentDate,
  getDateRange,
  formatDateYYM,
  formatDateYYMD,
  formatPairDatesYYMD,
  formatDate,
  getUniqueOptionsSingle,
  formatDateOutput,
};
