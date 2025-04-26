const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 5000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// File paths
const landmarksFile = "./data/landmarks.json";
const visitedFile = "./data/visited.json";


function readData(file) {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
}

function writeData(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ---------- LANDMARK ROUTES ----------

// Get all landmarks
app.get("/landmarks", (req, res) => {
    const landmarks = readData(landmarksFile);
    res.json(landmarks);
});

// Get single landmark
app.get("/landmarks/:id", (req, res) => {
    const landmarks = readData(landmarksFile);
    const landmark = landmarks.find(l => l.id === req.params.id);
    if (!landmark) return res.status(404).json({ message: "Not found" });
    res.json(landmark);
});

// Add a landmark
app.post("/landmarks", (req, res) => {
    const landmarks = readData(landmarksFile);
    const newLandmark = { id: uuidv4(), ...req.body };
    landmarks.push(newLandmark);
    writeData(landmarksFile, landmarks);
    res.status(201).json(newLandmark);
});

// Update a landmark
app.put("/landmarks/:id", (req, res) => {
    let landmarks = readData(landmarksFile);
    const index = landmarks.findIndex(l => l.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Not found" });

    landmarks[index] = { ...landmarks[index], ...req.body };
    writeData(landmarksFile, landmarks);
    res.json(landmarks[index]);
});

// Delete a landmark
app.delete("/landmarks/:id", (req, res) => {
    let landmarks = readData(landmarksFile);
    landmarks = landmarks.filter(l => l.id !== req.params.id);
    writeData(landmarksFile, landmarks);
    res.json({ message: "Deleted" });
});

// ---------- VISITED ROUTES ----------

// Get all visited places
app.get("/visited", (req, res) => {
    const visited = readData(visitedFile);
    res.json(visited);
});

// Get visited info for a landmark
app.get("/visited/:id", (req, res) => {
    const visited = readData(visitedFile);
    const place = visited.find(v => v.id === req.params.id);
    if (!place) return res.status(404).json({ message: "Not found" });
    res.json(place);
});



// Add a visited record
app.post("/visited", (req, res) => {
    try {
        const visited = readData(visitedFile); 
        console.log("Received data:", req.body); 

        
        if (!req.body.landmark_id || !req.body.visited_date || !req.body.visitor_name) {
            return res.status(400).json({ message: "Missing required data fields" });
        }

        const newVisited = { id: uuidv4(), ...req.body };

        
        visited.push(newVisited);
        
        
        writeData(visitedFile, visited);
        
        console.log("Data successfully written to visited.json:", newVisited); 

        res.status(201).json(newVisited); 
    } catch (error) {
        console.error("Error writing to visited.json:", error); 
        res.status(500).json({ message: "Error occurred while adding visited data" });
    }
});


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
