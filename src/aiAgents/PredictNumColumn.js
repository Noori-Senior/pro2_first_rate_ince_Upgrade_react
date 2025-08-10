import { useState, useEffect } from 'react';
import { Text } from '@mantine/core';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, } from 'chart.js';
import { Line } from 'react-chartjs-2';

import { prepareData, trainModel, predict } from './tensorflowHelper';

// Register the required components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const PredictNumColumn = ({ rows, columnKey, currentColumnHeader }) => {
  const [predictions, setPredictions] = useState([]);
  const [training, setTraining] = useState(false);

  // const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    const runModel = async () => {
      if (!rows.length) {
        console.warn('No data available in rows.');
        return;
      }

      setTraining(true);

      try {
        const { xs, ys, data } = prepareData(rows, columnKey);

        if (!xs || !ys || xs.shape[0] === 0 || ys.shape[0] === 0) {
          console.warn('Invalid tensors:', { xs, ys });
          return;
        }

        const model = await trainModel(xs, ys);

        // Make a prediction for the next logical entry
        const lastRow = rows[rows.length - 1];
        const nextInput = {
          account: lastRow.aacct,
          sectorid: lastRow.hdirect1,
          assetid: lastRow.HID,
          adate: lastRow.adate, // Helper function to get the next date
        };

        const nextValue = predict(model, nextInput, data);

        setPredictions([...rows.map((row) => row[columnKey]), nextValue]);
      } catch (error) {
        console.error('Error during model execution:', error);
      } finally {
        setTraining(false);
      }
    };

    // if (opened) {
      runModel();
    // }
  }, [rows, columnKey]);

  // Prepare data for chart.js
  const chartData = {
    labels: [...rows.map((_, index) => `Index ${index}`), 'Next Prediction'], // Labels for chart
    datasets: [
      {
        label: `Actual Values (${currentColumnHeader})`,
        data: predictions.slice(0, -1), // Exclude predicted value
        borderColor: 'blue',
        borderWidth: 2,
        fill: false,
      },
      {
        label: 'Predicted Trend',
        data: predictions, // Include the predicted value
        borderColor: 'red',
        borderDash: [5, 5],
        borderWidth: 2,
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  return (
     <div onClick={(event) => event.stopPropagation()}>
         {training ? (
           <Text>Training the AI model... Please wait.</Text>
         ) : (
           rows?.length > 0 ? (
             <div>
               <Line data={chartData} options={chartOptions} />
               <Text>
                 {predictions.length > 0 &&
                 typeof predictions[predictions.length - 1] === 'number'
                   ? `Next Predicted Value: ${predictions[
                       predictions.length - 1
                     ].toFixed(2)}`
                   : 'No predictions available. Please check your data or try again.'}
               </Text>
             </div>
           ) : (
             <Text>No data available. Please check year data and try again.</Text>
           )
           
         )}
     </div>
  );
};
