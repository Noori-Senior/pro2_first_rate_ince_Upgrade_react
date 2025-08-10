import { HistDemographicsFields } from "./HistDemographicsColumns";

// Financial Status DDL
export const airStatus = [
    { value: 'CR', label: 'Current Month Review' },
    { value: 'F', label: 'Final' },
    { value: 'N', label: 'New Account' },
    { value: 'P', label: 'Preliminary' },
    { value: 'PR', label: 'Prior Month Review' },
    { value: 'R', label: 'Review' },
    { value: 'NA', label: 'Special Review' },
    { value: '-', label: 'Not Defined' }
  ];

// Financial Status DDL
export const airActive = [
  { value: 'C', label: 'Closed' },
  { value: 'ANN', label: 'Name for value ANN' },
  { value: 'O', label: 'Name for value O' },
  { value: 'N', label: 'New' },
  { value: 'Y', label: 'Open' },
  { value: 'AGG', label: 'Open AGG' },
  { value: '-', label: 'Not Defined' }
];

// Financial Status DDL
export const airRCFREQ = [
  { value: 'D', label: 'Daily' },
  { value: 'F', label: 'Large Cash Flow' },
  { value: 'M', label: 'Monthly' },
  { value: 'T', label: 'Total Fund Only Large Cash Flow' }
];


// Composite type
export const airAGGTYP = [{ value: "WGT", label: "Asset Weighted (GIPS)" }, { value: "SUP", label: "Super Composite (Household)"}];
// Composite Feature
export const airAGGFEATR = [
  { value: "NA", label: "Not Assigned" }, 
  { value: "ACE", label: "ACE"}, 
  { value: "ADV", label: "ADV"}
];
// ACE Rules Pkg
export const airRULEPKG = [{ value: "-", label: "Not Defined" }, { value: "D01", label: "Demo_Test"}];
// ACE Rules Pkg
export const airCMPRPIND = [{ value: "S", label: "Composite" }, { value: "C", label: "Constituent"}];

  // Fiscal year
  export const airFYE = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  // Global or Domestic
  export const airGDFlow = [
    { value: 'G', label: 'Global'},
    { value: 'D', label: 'Domestic'}
  ];

  // Yes/No
  export const airYN = [
    { value: 'N', label: 'No'},
    { value: 'Y', label: 'Yes'}
  ];

  // SMARPLEV
  export const airSMARPLEV = [
    { value: 'ASET', label: 'Asset Performance Reporting'},
    { value: 'STND', label: 'Standard Performance Reporting'},
    { value: 'STRA', label: 'Strategy Performance Reporting'},
  ];

  // MRRPTFR
  export const airMRRPTFRQ = [
    { value: 'M', label: 'Monthly'},
    { value: 'Q', label: 'Quarterly'},
    { value: 'S', label: 'Semi-annually'},
    { value: 'A', label: 'Annually'},
  ];

  // SMACPYFR
  export const airSMACPYFR = [
    { value: '01', label: '01'},
    { value: '01TM', label: '01TM'},
    { value: '02TM', label: '02TM'},
    { value: '03TM', label: '03TM'},
  ];

  // Function to generate unique dropdown options dynamically
export const getUniqueOptionsSingle = (rows: HistDemographicsFields[], valueKey: string) => {
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

  // function to generate the default value for historical demographics fields
export const getHistDemographicsDefaultValue =  {
  id: '', ACCT: '', ADATED: '', ADATE: '', FYE: '', BNK: '', NAME: '', FREQX: '', SECPKG: '', INDXPKG: '', REPTPKG: '', SECTPKG: '',
  ADM: '', OFFN: '', OBJ: '', PWR: '', TYP: '', STATUS: 'N', USERDEF: '', EQINDX: '', FXINDX: '', CEINDX: '',
  WTDINDX: '', EQPOL: '', FXPOL: '', MVI_ACC: '', ICPDATED: new Date(), STATEID: '', TXRATE1: 0, TXRATE2: 0, TXRATE3: 0,
  TXRATE4: 0, ACTIVE: 'N', USERDEF2: '', USERDEF3: '', USERDEF4: '', RCFREQ: '', RCTOL: 0, IPPICP: new Date(), UDA101: '',
  UDA102: '', UDA103: '', UDA104: '', UDA105: '', UDA301: '', UDA302: '', UDA303: '', UDA304: '', UDA305: '',
  UDN1: 0, UDN2: 0, UDN3: 0, UDN4: 0, UDN5: 0, UDDATE1: new Date(), UDDATE2: new Date(), UDDATE3: new Date(), UDDATE4: new Date(), UDDATE5: new Date(),
  RPTDATE: new Date(), GLOBALFL: '', ACCTBASE: '', AGGTYP: '', AGGOWNER: '', TOLERPKG: '', PF_TIER: 0, PCOLOR: '0,255,0', TXRATE5: 0,
  TXRATE6: 0, TXFDONLY: '', RULEPKG: '', ACECDATE: new Date(), AGGFEATR: '', CMPRPIND: '', MR_IND: '', MRRPTFRQ: '', MRACTVRN: '',
  MRLRPDT: new Date(), MRLPRCDT: new Date(), MRLFRPDT: new Date(), MRLFRRDT: new Date(), RPTINGNAME: '', ICPDATED_ALT: new Date(), SMARPLEV: '', SMASRCE: '', SMASORT: '',
  SMACPYFR: '', SMACPYTO: '', UDA106: '', UDA107: '', UDA108: '', UDA109: '', UDA110: '', UDA111: '', UDA112: '', UDA113: '',
  UDA114: '', UDA115: '', UDA306: '', UDA307: '', UDA308: '', UDA309: '', UDA310: '', UDA311: '', UDA312: '', UDA313: '',
  UDA314: '', UDA315: '', UDN6: 0, UDN7: 0, UDN8: 0, UDN9: 0, UDN10: 0, UDN11: 0, UDN12: 0, UDN13: 0, UDN14: 0, UDN15: 0,
  UDDATE6: new Date(), UDDATE7: new Date(), UDDATE8: new Date(), UDDATE9: new Date(), UDDATE10: new Date(), UDDATE11: new Date(), UDDATE12: new Date(), UDDATE13: new Date(), UDDATE14: new Date(), UDDATE15: new Date(), APXDATE: new Date(), 
  RECDTYPE: '',
}