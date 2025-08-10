// UserContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [userData, setUserData] = useState(() => {
        // Get initial state from localStorage and decrypt
        const savedUserData = localStorage.getItem('frontData');
        if (savedUserData) {
            const bytes = CryptoJS.AES.decrypt(savedUserData, process.env.REACT_APP_ENCRYPTION_KEY);
            const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
            return decryptedData;
        } else {
            return {
                userid: null,
                pass: null
            };
        }
    });

    useEffect(() => {
        // Encrypt and store userData in localStorage whenever it changes
        const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(userData), process.env.REACT_APP_ENCRYPTION_KEY).toString();
        localStorage.setItem('frontData', encryptedData);
    }, [userData]);

    const updateUserData = (data) => {
        setUserData((prevData) => ({
            ...prevData,
            ...data
        }));
    };

    return (
        <UserContext.Provider value={{ userData, updateUserData }}>
            {children}
        </UserContext.Provider>
    );
};
