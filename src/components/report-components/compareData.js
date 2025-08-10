//--------------------------------------------------------------------------------------------------------------
// Programer: AFG Sarwar
// Date: 02/18/2025
// Purpose: To compare data from Excel and data from the table and return only the changed records and create a new field 'RECDTYPE' to indicate the type of change
// PARAMS: 
// 1. excelData: Array of objects - Data from the Excel sheet
// 2. data: Array of objects - Data from the table
// 3. keyFields: Array of strings - Fields that make up the unique key
// 4. nonKeyFields: Array of strings - Fields to compare for changes
//--------------------------------------------------------------------------------------------------------------
export const compareData = (excelData, data, keyFields, nonKeyFields, numericFields = []) => {
  if (!excelData?.length || !data?.length) return [];

  // Helper function to normalize values based on field type
  const normalizeValue = (field, value) => {
      if (numericFields.includes(field)) {
          return value === "" || value === null || value === undefined ? 0 : Number(value); 
      }
      return value === null || value === undefined ? "" : value; 
  };

  // Create lookup maps for quick access
  const dataMap = new Map(data.map(item => [keyFields.map(key => item[key]).join("_"), item]));
  const excelMap = new Map(excelData.map(item => [keyFields.map(key => item[key]).join("_"), item]));

  let finalData = [];

  // Check for new and changed records
  for (const [key, excelItem] of excelMap.entries()) {
      if (!dataMap.has(key)) {
          finalData.push({ ...excelItem, RECDTYPE: "A" }); // New record
      } else {
          const originalItem = dataMap.get(key);
          let changes = {};

          // Compare only numeric fields separately
          numericFields.forEach(field => {
              const normalizedExcelValue = normalizeValue(field, excelItem[field]);
              const normalizedOriginalValue = normalizeValue(field, originalItem[field]);

              // console.log(`Checking numeric field: ${field}`);
              // console.log(`Excel Value: ${excelItem[field]} (Normalized: ${normalizedExcelValue})`);
              // console.log(`Original Value: ${originalItem[field]} (Normalized: ${normalizedOriginalValue})`);

              if (normalizedExcelValue !== normalizedOriginalValue) {
                  changes[field] = { old: normalizedOriginalValue, new: normalizedExcelValue };
              }
          });

          // Compare only non-numeric fields separately
          nonKeyFields.forEach(field => {
              if (!numericFields.includes(field)) { // Ensure non-numeric fields are checked separately
                  const normalizedExcelValue = normalizeValue(field, excelItem[field]);
                  const normalizedOriginalValue = normalizeValue(field, originalItem[field]);

                  // console.log(`Checking non-numeric field: ${field}`);
                  // console.log(`Excel Value: ${excelItem[field]} (Normalized: ${normalizedExcelValue})`);
                  // console.log(`Original Value: ${originalItem[field]} (Normalized: ${normalizedOriginalValue})`);

                  if (normalizedExcelValue !== normalizedOriginalValue) {
                      changes[field] = { old: normalizedOriginalValue, new: normalizedExcelValue };
                  }
              }
          });

          if (Object.keys(changes).length > 0) {
              finalData.push({ ...excelItem, RECDTYPE: "C", changes });
          }
      }
  }

  // Check for deleted records
  for (const [key, originalItem] of dataMap.entries()) {
      if (!excelMap.has(key)) {
          finalData.push({ ...originalItem, RECDTYPE: "D" });
      }
  }

  // console.log("Final Changes Detected:", finalData);
  return finalData;
};


