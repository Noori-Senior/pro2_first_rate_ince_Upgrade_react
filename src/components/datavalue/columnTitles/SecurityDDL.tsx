export type SecurityFields = {
    id: string;
    ID: string;
    TICKER: string;
    CUSIP: string;
    NAMETKR: string;
    ISIN: string;
    NAMEDESC: string;
    ASSETTYPE: string;
    SCATEGORY: string;
    SSECTOR: string;
    SINDUSTRY: string;
    FACTOR: number;
    BETA: number;
    CURPRICE: number;
    FRIPRICE: number;
    MTDPRICE: number;
    QUALITY: string;
    MATURITY: string | Date;
    COUPON: number;
    ANNDIV: number;
    YIELD: number;
    CALLDATE: string | Date;
    PUTDATE: string | Date;
    IDATE: string | Date;
    LASTDATE: string | Date;
    NEXTDATE: string | Date;
    FPAYDATE: number;
    SPAYDATE: number;
    FCPNDATE: string | Date;
    XDIVDATE: string | Date;
    PADATE: string | Date;
    PAFREQ: string;
    ACCRTYPE: string;
    HCATEGORY: string;
    SSECTOR2: string;
    SSECTOR3: string;
    TAXABLEI: string;
    SSTATE: string;
    COUNTRY: string;
    ISSCNTRY: string;
    PAYCURR: string;
    DAYFACTOR: number;
    SKIPLOG: string;
    QUALITY2: string;
    CALLPRICE: number;
    PUTPRICE: number;
    SKIPUOOB: string;
    BMRK_ID: string;
    MWRR_FLAG: string;
    USERAN1: string;
    USERAN2: string;
    USERAN3: string;
    USERAN4: string;
    USERAN5: string;
    USERAN6: string;
    RECDTYPE: string;
  };

  // default values
  export const SecurityDefaults: SecurityFields = {
    id: '',
    ID: '',
    TICKER: '',
    CUSIP: '',
    NAMETKR: '',
    ISIN: '',
    NAMEDESC: '',
    ASSETTYPE: '',
    SCATEGORY: '',
    SSECTOR: '',
    SINDUSTRY: '',
    FACTOR: 0,
    BETA: 0,
    CURPRICE: 0,
    FRIPRICE: 0,
    MTDPRICE: 0,
    QUALITY: '',
    MATURITY: new Date(),
    COUPON: 0,
    ANNDIV: 0,
    YIELD: 0,
    CALLDATE: new Date(),
    PUTDATE: new Date(),
    IDATE: new Date(),
    LASTDATE: new Date(),
    NEXTDATE: new Date(),
    FPAYDATE: 0,
    SPAYDATE: 0,
    FCPNDATE: new Date(),
    XDIVDATE: new Date(),
    PADATE: new Date(),
    PAFREQ: '',
    ACCRTYPE: '',
    HCATEGORY: '',
    SSECTOR2: '',
    SSECTOR3: '',
    TAXABLEI: '',
    SSTATE: '',
    COUNTRY: '',
    ISSCNTRY: '',
    PAYCURR: '',
    DAYFACTOR: 0,
    SKIPLOG: '',
    QUALITY2: '',
    CALLPRICE: 0,
    PUTPRICE: 0,
    SKIPUOOB: '',
    BMRK_ID: '',
    MWRR_FLAG: '',
    USERAN1: '',
    USERAN2: '',
    USERAN3: '',
    USERAN4: '',
    USERAN5: '',
    USERAN6: '',
    RECDTYPE: 'A'
  };

  export const secTAXABLEI = [
    {value: 'Y', label: 'Yes'},
    {value: 'N', label: 'No'},
    {value: 'D', label: 'D (US Dividend)'},
    {value: 'M', label: 'M (Muni Bond)'}
  ];

  export const secFACTOR = [
    {value: '0', label: '0'},
    {value: '1', label: '1'},
    {value: '.01', label: '.01'},
    {value: '100', label: '100'}
  ];

  export const secDAYFACTOR = [
    {value: '1', label: '1 (Start of Day)'},
    {value: '0', label: '0 (End of Day)'},
    {value: '.5', label: '.5 (Midday)'},
    {value: '!', label: 'No Value Selected'}
  ];

  export const secSKIPLOG = [
    {value: 'Y', label: 'Yes'},
    {value: 'N', label: 'No'},
    {value: '.', label: 'No Value Selected'}
  ];