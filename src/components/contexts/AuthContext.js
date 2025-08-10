import React, { createContext, useContext, useEffect, useState } from 'react';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'default_key'; // Replace with your secure key
const AuthContext = createContext();
const tokenKeyName = 'I love this data';

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const encryptedTokenName = localStorage.getItem(tokenKeyName);
    
    if (encryptedTokenName) {
      try {
        const decryptedTokenName = CryptoJS.AES.decrypt(encryptedTokenName, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
        const token = localStorage.getItem(decryptedTokenName);
        if (token) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error decrypting token name:', error);
      }
    }
    setLoading(false);
  }, []);

  const login = (user, pass) => {
    const currDate = new Date();
    const formattedDate =
      currDate.getFullYear().toString() +
      String(currDate.getMonth() + 1).padStart(2, '0') +
      String(currDate.getDate()).padStart(2, '0');

    const tokenName = 'Love' + user + 'frpAuthToken + Give + Serve' + pass + 'And Enjoy' + formattedDate; // Define the token name
    const encryptedTokenName = CryptoJS.AES.encrypt(tokenName, ENCRYPTION_KEY).toString();
    localStorage.setItem(tokenKeyName, encryptedTokenName);

    setIsAuthenticated(true);

    // ---------------------------------------------------------------------------------------------------------
    // Get the URL parameter and set it as REACT_APP_CLIENT if it exists
    const urlParams = new URLSearchParams(window.location.search);
    let client = urlParams.get('client') || process.env.REACT_APP_CLIENT;
    // Encrypt and store userData in sessionStorage whenever it changes
    if (!client) {
      console.warn("Client parameter missing and no default REACT_APP_CLIENT set.");
    } else {
      // Encrypt and store client data in sessionStorage
      const encryptedData = CryptoJS.AES.encrypt(client, process.env.REACT_APP_ENCRYPTION_KEY).toString();
      sessionStorage.setItem('isClient', encryptedData);
      
      console.log("The client before encryption:", client);
    }
    // ---------------------------------------------------------------------------------------------------------
  };

  const logout = () => {
    const encryptedTokenName = localStorage.getItem(tokenKeyName);
    if (encryptedTokenName) {
      try {
        sessionStorage.removeItem(tokenKeyName);
        localStorage.removeItem(tokenKeyName);
        sessionStorage.removeItem('frontData');
        localStorage.removeItem('frontData');
        sessionStorage.removeItem('isClient');
        document.cookie = `WF_USER=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/ibi_apps;`;
        document.cookie = `WF-JSESSIONID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/ibi_apps;`;
        document.cookie = `WF_USER=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `WF-JSESSIONID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

      } catch (error) {
        console.error('Error decrypting token name on logout:', error);
      }
    }

    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
