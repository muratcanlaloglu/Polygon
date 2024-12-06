const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// New endpoint to get existing coordinates
app.get('/get-coordinates', (req, res) => {
    const filePath = path.join(__dirname, 'coordinates.json');
    
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            // If file doesn't exist or there's an error, return empty array
            return res.json([]);
        }
        try {
            const coordinates = JSON.parse(data);
            res.json(coordinates);
        } catch (parseErr) {
            console.error('Error parsing coordinates:', parseErr);
            res.json([]);
        }
    });
});

app.post('/save-coordinates', (req, res) => {
    const coordinates = req.body.coordinates;
    const filePath = path.join(__dirname, 'coordinates.json');

    if (!coordinates || !Array.isArray(coordinates)) {
        return res.status(400).json({ message: 'Invalid data format. Coordinates must be an array.' });
    }

    fs.writeFile(filePath, JSON.stringify(coordinates, null, 2), (err) => {
        if (err) {
            console.error('Error writing to file:', err);
            return res.status(500).json({ message: 'Failed to save coordinates.' });
        }
        res.status(200).json({ message: 'Coordinates saved successfully!', filePath });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});