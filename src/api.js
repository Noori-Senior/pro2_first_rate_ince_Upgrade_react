import axios from "axios";

export const FetchAPI = async (params) => {
    const staticUri =  `&outputFormat=JSON`+
                      //  `&&FRP_ROOT=${process.env.REACT_APP_FRP_ROOT}` +
                      //  `&&FRP_SUITE=${process.env.REACT_APP_FRP_SUITE}`
                      `&IBIAPP_app=${process.env.REACT_APP_IBIAPP_app}`
                       +`&IBIC_user=${process.env.REACT_APP_IBIC_user}&IBIC_pass=${process.env.REACT_APP_IBIC_pass}`
                       ;
    const allParams = params + staticUri;
    
    try {
      const response = await axios.post(process.env.REACT_APP_IBI_APPS, allParams, {
        withCredentials: true, // Ensures cookies are sent with the request
      });
  
      if (response.status === 200) {
        const data = response.data;
  
        // Handle different response structures
        const result = data?.DATA?.[0]?.records || data?.records || data?.data || data;
        
        // console.log("Fetched Data:", result);
        return result;
      }
  
      throw new Error(`Unexpected response status: ${response.status}`);
    } catch (error) {
      console.error("API fetch error:", error);
      throw error;
    }
  };

  const cleanData = (input) => {
    // Split the input string by the pipe character '|'
    const dataArray = input.split('|');
  
    // Replace 'null' and 'undefined' with empty strings
    const cleanedArray = dataArray.map(item => 
      item === 'null' || item === 'undefined' ? '' : item
    );
  
    // Join the array back into a string with the pipe character '|'
    return cleanedArray.join('|');
  };

  // Use this functin to update/delete
  export const FetchUpdateDeleteAPI = async (dataInJson, params) => {
     const staticUri =  
                        // `&&FRP_ROOT=${process.env.REACT_APP_FRP_ROOT}` +
                        // `&&FRP_SUITE=${process.env.REACT_APP_FRP_SUITE}`
                        `&IBIAPP_app=${process.env.REACT_APP_IBIAPP_app}`
                        +`&IBIC_user=${process.env.REACT_APP_IBIC_user}&IBIC_pass=${process.env.REACT_APP_IBIC_pass}`
                       ;
       //  console.log("dataInJson:: ", cleanData(dataInJson));
   
        const allParams = params + staticUri;
       
        // Use URLSearchParams to send the data as a proper form parameter
        const urlParams = new URLSearchParams();
        urlParams.append('TBLDATA', cleanData(dataInJson));
   
        try {
   
         const response = await fetch(process.env.REACT_APP_IBI_APPS + allParams, {
             method: 'POST',
             headers: {
                 'Content-Type': 'application/x-www-form-urlencoded', // Proper encoding for form parameters
             },
             credentials: 'include',
             body: urlParams.toString(), // Send the encoded URL parameters
         });
   
         if (response.status === 200) {
             console.log("Data loaded successfully!");
         }
   
     } catch (error) {
         console.error("Error! ", error);
     }
  }

  
  // Use this functin to update/delete
  export const FetchUpdateDeleteAPIExcel = async (dataInJson, params) => {
    const staticUri =  
                      //  `&&FRP_ROOT=${process.env.REACT_APP_FRP_ROOT}` +
                      //  `&&FRP_SUITE=${process.env.REACT_APP_FRP_SUITE}`
                       `&IBIAPP_app=${process.env.REACT_APP_IBIAPP_app}`
                       +`&IBIC_user=${process.env.REACT_APP_IBIC_user}&IBIC_pass=${process.env.REACT_APP_IBIC_pass}`
                       ;
      //  console.log("dataInJson:: ", cleanData(dataInJson));
  
       const allParams = params + staticUri;
      
       // Use URLSearchParams to send the data as a proper form parameter
       const urlParams = new URLSearchParams();
       const records = dataInJson.split(',END_REC');
       records.forEach((record) => {
         urlParams.append(`TBLDATA`, cleanData(record));
       });
  
       try {
  
        const response = await fetch(process.env.REACT_APP_IBI_APPS + allParams, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded', // Proper encoding for form parameters
            },
            credentials: 'include',
            body: urlParams.toString(), // Send the encoded URL parameters
        });
  
        if (response.status === 200) {
            console.log("Data loaded successfully!");
        }
  
    } catch (error) {
        console.error("Error! ", error);
    }
 }
  