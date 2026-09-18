const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Cyclone Tracking Backend is running!"
  });
});

app.get("/api/cyclone", (req, res) => {
  res.json({
    name: "Demo Cyclone",
    latitude: 16.5,
    longitude: 80.6,
    status: "Monitoring",
    windSpeed: 25,
    threatLevel: "MODERATE",
    lastUpdated: new Date().toISOString()
  });
});

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});