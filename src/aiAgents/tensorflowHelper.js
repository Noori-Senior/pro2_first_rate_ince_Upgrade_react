//===================================================================================================================
// Step-by-Step Parameter Calculation
// 1. First Dense Layer
// Input Shape: [4] (4 features per sample).

// Units: 16 neurons.

// Weights: Each of the 4 input features is connected to each of the 16 neurons.
// Number of weights = input_shape * units = 4 * 16 = 64.

// Biases: Each neuron has 1 bias term.
// Number of biases = units = 16.

// Total Parameters for Layer 1: 64 (weights) + 16 (biases) = 80.

// 2. Second Dense Layer
// Input Shape: [16] (output from the previous layer).

// Units: 8 neurons.

// Weights: Each of the 16 inputs is connected to each of the 8 neurons.
// Number of weights = 16 * 8 = 128.

// Biases: Each neuron has 1 bias term.
// Number of biases = units = 8.

// Total Parameters for Layer 2: 128 (weights) + 8 (biases) = 136.

// 3. Output Layer
// Input Shape: [8] (output from the previous layer).

// Units: 1 neuron (since this is a regression model predicting a single value).

// Weights: Each of the 8 inputs is connected to the 1 output neuron.
// Number of weights = 8 * 1 = 8.

// Biases: The output neuron has 1 bias term.
// Number of biases = units = 1.

// Total Parameters for Layer 3: 8 (weights) + 1 (biases) = 9.

// Total Number of Parameters
// Add up the parameters from all layers:

// Layer 1: 80

// Layer 2: 136

// Layer 3: 9

// Total Parameters = 80 + 136 + 9 = 225
//===================================================================================================================

   import * as tf from '@tensorflow/tfjs';

  // --------------------------------------------------------------------------------------------------------------------------------
  // Prepare data for TensorFlow: Converts table rows into tensors usable by TensorFlow.js.
  // This function processes raw data from a table, performs feature engineering, and prepares it for machine learning models.
  // --------------------------------------------------------------------------------------------------------------------------------
  export const prepareData = (rows, columnKey) => {
    // ----------------------------------------------------------------------------------------------------------------------------
    // Step 1: Removal of Unwanted Observations
    // Extract unique values for each feature to ensure no duplicates and to map categorical data to indices.
    // ----------------------------------------------------------------------------------------------------------------------------
    const accounts = [...new Set(rows.map(row => row.aacct))]; // Unique account identifiers
    const sectors = [...new Set(rows.map(row => row.hdirect1))]; // Unique sector identifiers
    const assets = [...new Set(rows.map(row => row.HID))]; // Unique asset identifiers
    const adates = [...new Set(rows.map(row => row.adate))]; // Unique dates
  
    // Debugging logs to verify extracted unique values
    // console.log("Accounts:", accounts);
    // console.log("Sectors:", sectors);
    // console.log("Assets:", assets);
    // console.log("As-of Dates:", adates);
  
    // ----------------------------------------------------------------------------------------------------------------------------
    // Step 2: Handling Missing Data
    // Map each row's categorical features to their corresponding indices. If a value is missing, replace it with 0.
    // ----------------------------------------------------------------------------------------------------------------------------
    const xs = rows.map(row => [
        accounts.indexOf(row.aacct), // Map account to its index
        sectors.indexOf(row.hdirect1), // Map sector to its index
        assets.indexOf(row.HID), // Map asset to its index
        adates.indexOf(row.adate), // Map date to its index
    ]);
  
    // Debugging logs to verify raw feature mappings
    // console.log("Raw Feature Mapping (Xs):", xs);
  
    // Helper function to replace invalid indices (-1) with 0
    const replaceInvalidIndex = (index) => (index === -1 ? 0 : index);
  
    // Validate feature mappings by replacing invalid indices
    const xsValidated = xs.map(x => x.map(replaceInvalidIndex));
    // console.log("Validated Feature Mapping (Xs):", xsValidated);
  
    // ----------------------------------------------------------------------------------------------------------------------------
    // Step 3: Feature Engineering - Scaling, Normalization, and Standardization
    // Normalize and standardize features to ensure they are on a comparable scale for machine learning models.
    // ----------------------------------------------------------------------------------------------------------------------------
  
    // Normalization function: Scales values to a range of [0, 1] based on min and max
    const normalize = (value, min, max) => (max === min ? 0 : (value - min) / (max - min));
  
    // Normalization function using mean: Adjusts values based on mean, min, and max
    const normalizeMean = (value, min, max, mean) => (max === min ? 0 : (value - mean) / (max - min));
  
    // Standardization function: Scales values based on mean and standard deviation (Z-score)
    const standardize = (value, mean, stdDev) => (stdDev === 0 ? 0 : (value - mean) / stdDev);
  
    // Helper function to calculate the mean of an array
    const mean = (arr) => arr.reduce((sum, val) => sum + val, 0) / arr.length;
  
    // Helper function to calculate the variance of an array
    const variance = (arr, mean) => arr.reduce((sum, val) => sum + (val - mean) ** 2, 0) / arr.length;
  
    // Helper function to calculate the standard deviation of an array
    const standardDeviation = (arr, mean) => Math.sqrt(variance(arr, mean));
  
    // ----------------------------------------------------------------------------------------------------------------------------
    // Robust Scaling: Uses median and interquartile range (IQR) for scaling, which is less sensitive to outliers.
    // ----------------------------------------------------------------------------------------------------------------------------
  
    // Helper function to calculate the median of an array
    const median = (arr) => {
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    };
  
    // Helper function to calculate the 25th (Q1) and 75th (Q3) percentiles of an array
    const quartiles = (arr) => {
        const sorted = [...arr].sort((a, b) => a - b);
        const q1 = median(sorted.slice(0, Math.floor(sorted.length / 2)));
        const q3 = median(sorted.slice(Math.ceil(sorted.length / 2)));
        return { q1, q3 };
    };
  
    // Helper function to calculate the interquartile range (IQR = Q3 - Q1)
    const iqr = (arr) => {
        const { q1, q3 } = quartiles(arr);
        return q3 - q1;
    };
  
    // Robust standardization function: Scales values based on median and IQR
    const robustStandardize = (value, median, iqr) => (iqr === 0 ? 0 : (value - median) / iqr);
  
    // ----------------------------------------------------------------------------------------------------------------------------
    // Step 4: Apply Normalization to Features (Xs)
    // Normalize each feature in the validated feature mapping (xsValidated) to a range of [0, 1].
    // ----------------------------------------------------------------------------------------------------------------------------
    const normalizedXs = xsValidated.map(x =>
        x.map((value, i) => normalize(value, 0, [accounts, sectors, assets, adates][i].length - 1))
    );
    // console.log("Normalized Xs:", normalizedXs);
  
    // ----------------------------------------------------------------------------------------------------------------------------
    // Step 5: Prepare Target Values (Ys)
    // Extract the target values (dependent variable) from the rows and normalize/standardize them.
    // ----------------------------------------------------------------------------------------------------------------------------
    const ys = rows.map(row => row[columnKey]); // Extract target values
    console.log("ys:: ", ys);
    const maxY = Math.max(...ys); // Maximum target value
    const minY = Math.min(...ys); // Minimum target value
    const meanY = mean(ys); // Mean of target values
    const dataStdDev = standardDeviation(ys, meanY); // Standard deviation of target values
    const dataMedian = median(ys); // Median of target values
    const dataIQR = iqr(ys); // Interquartile range of target values
  
    // Normalize target values to a range of [0, 1]
    const normalizedYs = ys.map(y => normalize(y, minY, maxY));
  
    // Normalize target values using mean (alternative approach)
    const normalizedXsMean = ys.map(y => normalizeMean(y, minY, maxY, meanY));
  
    // Standardize target values using Z-score
    const standardizedValues = ys.map(value => standardize(value, meanY, dataStdDev));
  
    // Standardize target values using robust scaling (median and IQR)
    const standardizedValuesWithRobust = ys.map(value => robustStandardize(value, dataMedian, dataIQR));
  
    // Debugging logs to verify normalized and standardized target values
    console.log("normalizedYs:: ", normalizedYs);
    console.log("normalizedXsMean:: ", normalizedXsMean);
    console.log("standardizedValues:: ", standardizedValues);
    console.log("standardizedValuesWithRobust:: ", standardizedValuesWithRobust);
  
    // ----------------------------------------------------------------------------------------------------------------------------
    // Step 6: Return Processed Data as Tensors
    // Convert normalized features (Xs) and target values (Ys) into TensorFlow.js tensors for model training.
    // ----------------------------------------------------------------------------------------------------------------------------
    return {
        xs: tf.tensor2d(normalizedXs, [normalizedXs.length, normalizedXs[0].length]), // Features as a 2D tensor
        ys: tf.tensor2d(normalizedYs, [normalizedYs.length, 1]), // Target values as a 2D tensor
        data: { accounts, sectors, assets, adates, maxY, minY }, // Additional metadata for reference
    };
  };
  
  // --------------------------------------------------------------------------------------------------------------------------------
  // Create and Train the Model: 
  // This function defines, compiles, and trains a neural network model using TensorFlow.js.
  // The model is designed to learn the relationship between input features (indices) and a target numeric value (column values).
  // --------------------------------------------------------------------------------------------------------------------------------
  export const trainModel = async (xs, ys) => {
    // ----------------------------------------------------------------------------------------------------------------------------
    // Step 1: Define the Model Architecture
    // Create a sequential model, which is a linear stack of layers.
    // ----------------------------------------------------------------------------------------------------------------------------
    const model = tf.sequential();
  
    // Add the first hidden layer or Input layer:
    // - Input shape: [4] (since there are 4 input features: accounts, sectors, assets, and dates).
    // - Units: 16 neurons in this layer.
    // - Activation: ReLU (Rectified Linear Unit) to introduce non-linearity.
    model.add(tf.layers.dense({ inputShape: [4], units: 16, activation: 'relu' }));
  
    // Add the second hidden layer:
    // - Units: 8 neurons in this layer.
    // - Activation: ReLU for non-linearity.
    model.add(tf.layers.dense({ units: 8, activation: 'relu' }));
  
    // Add the output layer:
    // - Units: 1 (since this is a regression problem predicting a single numeric value).
    // - No activation function is used, as this is a linear regression model.
    model.add(tf.layers.dense({ units: 1 }));
  
    // ----------------------------------------------------------------------------------------------------------------------------
    // Step 2: Compile the Model
    // Configure the model for training by specifying the optimizer, loss function, and metrics (if any).
    // ----------------------------------------------------------------------------------------------------------------------------
    model.compile({
        optimizer: tf.train.adam(), // Adam optimizer: an adaptive learning rate optimization algorithm.
        loss: 'meanSquaredError', // Loss function: Mean Squared Error (MSE) for regression tasks.
    });

    //     Verification Using TensorFlow.js
    //     You can also verify this programmatically by calling model.summary() after defining the model. This will print a summary of the model architecture, including the number of parameters in each layer.
    model.summary();
  
    // ----------------------------------------------------------------------------------------------------------------------------
    // Step 3: Train the Model
    // Train the model using the provided input features (xs) and target values (ys).
    // ----------------------------------------------------------------------------------------------------------------------------
    console.log('Starting model training...');
    await model.fit(xs, ys, {
        epochs: 100, // Number of times the model will iterate over the entire dataset.
        batchSize: 8, // Number of samples processed before the model is updated.
        // callbacks: {
        //     onEpochEnd: (epoch, logs) => console.log(`Epoch ${epoch}: loss = ${logs.loss}`)
        // }
    });

    // Debugging logs to inspect the training data (commented out by default).
    // console.log("Training Data Xs:", xs.arraySync());
    // console.log("Training Data Ys:", ys.arraySync());
  
    // ----------------------------------------------------------------------------------------------------------------------------
    // Step 4: Return the Trained Model
    // After training, the model is returned for further use (e.g., prediction or evaluation).
    // ----------------------------------------------------------------------------------------------------------------------------
    return model;
  };

  // --------------------------------------------------------------------------------------------------------------------------------
  // Function: predict
  // Description: Predicts the next value based on the trained model's learning for a given input. This function handles multiple inputs
  //              by normalizing them and passing them through the model to generate a prediction.
  // Parameters:
  //   - model: The trained machine learning model used for making predictions.
  //   - input: An object containing the input data (e.g., account, sectorid, assetid, adate).
  //   - data: An object containing reference data (e.g., accounts, sectors, assets, adates) used for normalization.
  // Returns: The predicted value as a number. Returns NaN if the prediction is invalid.
  // --------------------------------------------------------------------------------------------------------------------------------
  export const predict = (model, input, data) => {
    // ----------------------------------------------------------------------------------------------------------------------------
    // Helper Function: normalize
    // Description: Normalizes a value to a range between 0 and 1 based on the provided min and max values.
    // Parameters:
    //   - value: The value to normalize.
    //   - min: The minimum value in the range.
    //   - max: The maximum value in the range.
    // Returns: The normalized value. Returns 0 if min and max are equal (to avoid division by zero).
    // ----------------------------------------------------------------------------------------------------------------------------
    const normalize = (value, min, max) => (max === min ? 0 : (value - min) / (max - min));
    const denormalize = (normalizedValue, min, max) => normalizedValue * (max - min) + min;
  
    // ----------------------------------------------------------------------------------------------------------------------------
    // Step 1: Encode and Normalize Input Data
    // Description: Convert categorical input data (e.g., account, sectorid, assetid, adate) into numerical values and normalize them.
    // ----------------------------------------------------------------------------------------------------------------------------
    const encodedInput = [
        normalize(data.accounts.indexOf(input.account), 0, data.accounts.length - 1), // Normalize account
        normalize(data.sectors.indexOf(input.sectorid), 0, data.sectors.length - 1), // Normalize sectorid
        normalize(data.assets.indexOf(input.assetid), 0, data.assets.length - 1),    // Normalize assetid
        normalize(data.adates.indexOf(input.adate), 0, data.adates.length - 1),      // Normalize adate
    ];
  
    // Debugging: Uncomment to log the encoded input for verification
    // console.log("Encoded Input:", encodedInput);
  
    // ----------------------------------------------------------------------------------------------------------------------------
    // Step 2: Convert Encoded Input to Tensor
    // Description: Convert the normalized input array into a TensorFlow.js tensor for model prediction.
    // ----------------------------------------------------------------------------------------------------------------------------
    const inputTensor = tf.tensor2d([encodedInput], [1, 4]); // Shape: [1, 4] (1 sample, 4 features)
  
    // Debugging: Uncomment to log the tensor shape and values for verification
    // console.log("Input Tensor Shape:", inputTensor.shape);
    // console.log("Input Tensor Values:", inputTensor.arraySync());
  
    // ----------------------------------------------------------------------------------------------------------------------------
    // Step 3: Make Prediction
    // Description: Pass the input tensor through the model to generate a prediction.
    // ----------------------------------------------------------------------------------------------------------------------------
    const prediction = model.predict(inputTensor);
  
    // ----------------------------------------------------------------------------------------------------------------------------
    // Step 4: Validate Prediction
    // Description: Check if the prediction is valid (i.e., has a valid shape and value).
    // ----------------------------------------------------------------------------------------------------------------------------
    if (prediction.shape.length === 0) {
        console.error("Invalid prediction result: Shape is empty.");
        return NaN; // Return NaN if the prediction shape is invalid
    }
  
    const predictionArray = prediction.dataSync(); // Convert prediction tensor to a JavaScript array
    if (predictionArray.length === 0 || isNaN(predictionArray[0])) {
        console.error("Invalid prediction result:", predictionArray);
        return NaN; // Return NaN if the prediction value is invalid
    }
  
    // Debugging: Uncomment to log the prediction array for verification
    // console.log("Prediction Array:", predictionArray);
  
    // ----------------------------------------------------------------------------------------------------------------------------
    // Step 5: Return Prediction
    // Description: Return the first (and only) prediction value from the array.
    // ----------------------------------------------------------------------------------------------------------------------------
    // ✅ De-normalize the prediction
    // console.log("prediction with normalized:: ", predictionArray[0]);
    const predictedValue = denormalize(predictionArray[0], data.minY, data.maxY);
    return predictedValue;
  };


  


  