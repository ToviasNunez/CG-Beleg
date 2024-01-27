const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware für CORS
app.use(cors());

// Endpoint to get the list of music files in the 'music' directory
app.get("/api/music", (req, res) => {
  const musicDir = path.join(__dirname, "./music"); // Change 'music' to your actual folder name
  // Use fs module to read the files in the music directory
  // Ensure you also install 'fs' if not already installed: npm install fs
  const fs = require("fs");

  fs.readdir(musicDir, (err, files) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
    // Send the list of files to the client
    res.json({ files });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
