import { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';

const useClient = () => {
  const [client, setClient] = useState(process.env.REACT_APP_CLIENT);

  useEffect(() => {
    const encryptedTokenName = sessionStorage.getItem('isClient');
    if (encryptedTokenName) {
      try {
        const decryptedTokenName = CryptoJS.AES.decrypt(encryptedTokenName, process.env.REACT_APP_ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
        setClient(decryptedTokenName);
      } catch (error) {
        console.error("Decryption failed:", error);
      }
    } else {
      console.warn("No encrypted token found in sessionStorage.");
    }
  }, []);

  return client;
};

export default useClient;