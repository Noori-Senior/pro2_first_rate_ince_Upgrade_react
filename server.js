const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();

const dotenv = require('dotenv');
dotenv.config();
const PORT = process.env.REACT_APP_ICON_SERVER;

// Serve static files (profile images) from the public directory
app.use('/users/profileimage', express.static(path.join(__dirname, 'public/users/profileimage')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/users/profileimage'); // Save to this folder
  },
  filename: function (req, file, cb) {
    const { userFirstName, userLastName } = req.params;

    // Ensure the filename is consistent with the format `firstname-lastname.png`
    const fileName = `${userFirstName}${userLastName}.png`;

    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

// API endpoint to handle file upload
app.post('/api/upload-profile-image/:userFirstName:userLastName', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'No file uploaded' });
  }

  // Return the file path to the frontend
  const filePath = `/users/profileimage/${req.file.filename}`;
  res.send({ filePath });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
