import { useCallback } from 'react';

const useFormatter = () => {

    const formatCurrency = useCallback((value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(value);
    }, []);

    const getCurrencySign = useCallback(() => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).formatToParts(1.0).find(part => part.type === 'currency').value;
    }, []);

    const formatIntegerF2 = useCallback((value) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(Number(value));
    }, []);

    const formatIntegerF6 = useCallback((value) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 6,
            maximumFractionDigits: 6,
        }).format(Number(value));
    }, []);

    const convertToFullDate = useCallback((dateString) => {
        const [month, year] = dateString.split('/');
        if (month && year) {
          // Create a Date object with the first day of the given month and year
          const date = new Date(`${year}-${month}-01`);
          // Check if the date is valid
          if (!isNaN(date.getTime())) {
            // Return the formatted date string as mm/dd/yyyy
            return `${month}/01/${year}`;
          }
        }
        // Return an empty string or handle error if the date is invalid
        return '';
    }, []);

    const formatDateToYYYYMM = useCallback((dateString) => {
        const [month, day, year] = dateString.split('/');
        if (month && year) {
          // Create a Date object with the first day of the given month and year
          const date = new Date(`${year}-${month}-${day}`);
          // Check if the date is valid
          if (!isNaN(date.getTime())) {
            // Return the formatted date string as mm/dd/yyyy
            return `${year}${month}`;
          }
        }
        // Return an empty string or handle error if the date is invalid
        return '';
    }, []);

    return {
        formatCurrency,
        getCurrencySign,
        formatIntegerF2,
        formatIntegerF6,
        convertToFullDate,
        formatDateToYYYYMM,
    };
};

export default useFormatter;
