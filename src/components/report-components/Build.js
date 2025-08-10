//--------------------------------------------------------------------------------------------------------------
// Programer: AFG Sarwar
// Date: 12/30/2024
// Purpose: To load data from Excel page to givin table
//--------------------------------------------------------------------------------------------------------------

import { Button, Text } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const Build = ({ loadExcelData, mreUrl }) => {
    const loadDataFromExcelToTable = async () => {

        const urlParams = new URLSearchParams();
        urlParams.append('MREDATA', JSON.stringify(loadExcelData));
    
        try {
            toast.info("Loading data...", { position: "top-center", autoClose: 2000 });
            const response = await fetch(process.env.REACT_APP_IBI_APPS + mreUrl+`&IBIC_user=${process.env.REACT_APP_IBIC_user}&IBIC_pass=${process.env.REACT_APP_IBIC_pass}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',  // Form-encoded data
                },
                credentials: 'include',
                body: urlParams.toString(),
            });
    
            if (response.status === 200) {
                toast.success("Data loaded successfully!", { position: "top-center", autoClose: 3000 });
            }
            const textData = await response.text();  // Read raw response
            console.log("Raw Response Text::", textData);
    
        } catch (error) {
            toast.success("Error! " + error , { position: "top-center", autoClose: 3000 });
        }
    };
    
    return (
        <Button variant="subtle" leftIcon={<IconRefresh size={20}  />}
          onClick={loadDataFromExcelToTable}
        >
            <Text style={{fontSize: '11pt', marginLeft: 0,}}>Build Excel JSON</Text>
        </Button>
    );
};