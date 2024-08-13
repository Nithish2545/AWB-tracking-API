import express from "express";
import "dotenv/config";
import axios from "axios";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import {validationResult } from "express-validator";

const app = express();
const PORT = process.env.PORT || 9000;
const GOOGLE_SHEET_API_URL = process.env.GOOGLE_SHEET_API_URL;

app.use(express.json());
app.use(cors());
app.use(helmet());

// Apply rate limiting to all requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

app.get("/", (req, res) => {
  res.send("Welcome to the AWB Tracking API!");
});

app.post(
  "/awb-tracking-details",
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { AWBID } = req.body;

    try {
      // Fetch data from Google Sheets API
      const response = await axios.get(GOOGLE_SHEET_API_URL);

      // Assume the data is an array of objects
      const database = response.data;

      // Find the record with the matching AWBID
      const result = database.find((d) => d.awbTrackingID === AWBID);

      // Check if the record was found
      if (!result) {
        return res.status(404).json({ error: "AWB tracking ID not found" });
      }

      // Send the result as a JSON response
      res.json(result);
    } catch (error) {
      console.error("Error fetching data from Google Sheets API:", error.message);
      res.status(500).json({ error: "Failed to fetch data from Google Sheets API" });
    }
  }
);

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});