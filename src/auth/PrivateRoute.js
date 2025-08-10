import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../components/contexts/UserContext';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'default_key'; // Replace with your secure key

const PrivateRoute = () => {
  const { userData } = useUser();
  // const { userid, pass } = userData;
  const encryptedTokenName = localStorage.getItem('I love this data');
  // let isAuthenticated = false;

  // check if the userid and password is empty then force user to relogin
  if (!userData.userid && !userData.pass){
    const encryptedUserData = localStorage.getItem('frontData');

    if (encryptedUserData) {
      try {
        const decryptedData = CryptoJS.AES.decrypt(encryptedUserData, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
        Object.assign(userData, JSON.parse(decryptedData));
      } catch (error) {
        console.error('Failed to restore session:', error);
        return <Navigate to="/login" />;
      }
    }
  }

  if (encryptedTokenName) {
    const currDate = new Date();
    const formattedDate =
      currDate.getFullYear().toString() +
      String(currDate.getMonth() + 1).padStart(2, '0') +
      String(currDate.getDate()).padStart(2, '0');
    try {
      const decryptedTokenName = CryptoJS.AES.decrypt(encryptedTokenName, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
      const expectedToken = 'Love' + userData.userid + 'frpAuthToken + Give + Serve' + userData.pass + 'And Enjoy' + formattedDate;
      const isAuthenticated = decryptedTokenName === expectedToken;

      if (isAuthenticated) {
        // If the token is valid, return the Outlet component to render the child routes
        return <Outlet />;
      }
    } catch (error) {
      console.error('Failed to decrypt token:', error);
    }
  }

  return <Navigate to="/login" />;
};

export default PrivateRoute;
