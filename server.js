import express from "express";
import "dotenv/config";
import axios from "axios";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { check, validationResult } from "express-validator";

const app = express();
const PORT = process.env.PORT || 9000;
const GOOGLE_SHEET_API_URL = process.env.GOOGLE_SHEET_API_URL;
const TOKEN = process.env.TOKEN;
let endPoints = {
  UPS: "http://worldfirst.xpresion.in/api/v1/Tracking/Tracking",
  BOMBINO: "http://admin.bombinoexp.com/api/tracking_api/get_tracking_data",
};

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
  res.send("Welcome to the AWB Tracking API!!!!");
});

app.post(
  "/awb-tracking-details",
  [
    // Validation checks
    check("TOKEN", "Invalid or missing token")
      .exists()
      .isString()
      .equals(TOKEN),
    check("AWBID", "AWBID is required").exists().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ Error: errors.array()[0].msg });
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
        return res.status(404).json({ Error: "AWB tracking ID not found" });
      }

      // Send the result as a JSON response
      res.json(result);
    } catch (error) {
      console.error(
        "Error fetching data from Google Sheets API:",
        error.message
      );
      res
        .status(500)
        .json({ Error: "Failed to fetch data from Google Sheets API" });
    }
  }
);

app.get(
  "/all-user-data",
  [
    // Validation checks
    check("TOKEN", "Invalid or missing token")
      .exists()
      .isString()
      .equals(TOKEN),
  ],
  async (req, res) => {
    try {
      const response = await axios.get(GOOGLE_SHEET_API_URL);
      res.json(response.data);
    } catch (error) {
      console.error(
        "Error fetching data from Google Sheets API:",
        error.message
      );
      res
        .status(500)
        .json({ Error: "Failed to fetch data from Google Sheets API" });
    }
  }
);

// {
//   "Vendor":"UPS",
//   "UserID": "WF200",
//   "Password": "PETTI@123",
//   "AWBNo": "1ZGX05920432746110",
//  "Type":"C"
// }

// Proxy endpoint to forward the API request
app.post("/api/track", async (req, res) => {
  const {
    Vendor,
    UserID,
    Password,
    AWBNo,
    Type,
    customer_code,
    tracking_no,
    api_company_id,
  } = req.body;

  const requestBody = {
    UserID: UserID,
    Password: Password,
    AWBNo: AWBNo,
    Type: Type,
  };

  if (Vendor == "UPS") {
    try {
      const response = await axios.post(endPoints[Vendor], requestBody);
      res.json(response.data);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error with the API request", error: error.message });
    }
    return;
  }
});

app.post("/api/track/bombino", async (req, res) => {
  const params = {
    api_company_id: req.body.api_company_id,
    customer_code: req.body.customer_code,
    tracking_no: req.body.tracking_no,
  };
  const bombino_endPoint = `https://admin.bombinoexp.com/api/tracking_api/get_tracking_data?api_company_id=${params.api_company_id}&customer_code=${params.customer_code}&tracking_no=${params.tracking_no}`;
  try {
    const response = await axios.get(bombino_endPoint);
    res.json(response.data[0].docket_events);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error with the API request", error: error.message });
  }
  return;
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});