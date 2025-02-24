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

app.use(
  cors({
    origin: "*", // Allows all origins, can be replaced with a specific domain
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

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
  res.send("Welcome to the AWB Tracking API -  24-02-2025");
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
  if (req.body.tracking_no == "bb8567581") {
    res.json([
      {
        event_at: "2025-02-23 1:24:09",
        event_description: "Departure from facility",
        event_location: "Koeln",
      },
      {
        event_at: "2025-02-23 10:15:12",
        event_description: "Arrived at facility",
        event_location: "Koeln",
      },
      {
        event_at: "2025-02-21 2:01:19",
        event_description: "Departure from facility",
        event_location: "Bangalore Airport",
      },
      {
        event_at: "2025-02-21 2:01:19",
        event_description: "import scan",
        event_location: "Bangalore Airport",
      },
      {
        event_at: "2025-02-21 11:15:12",
        event_description: "Arrived at facility",
        event_location: "Bangalore Airport",
      },
      {
        event_at: "2025-02-20 20:30:22",
        event_description: "Departure from facility",
        event_location: "Chennai",
      },
    ]);
  }

  if (req.body.tracking_no == 22348) {
    res.json([
      {
        id: "9367449",
        docket_id: "238731",
        event_at: "2025-02-24 11:28:43",
        event_type: "MANIFEST",
        event_description: "Customs clearance in progress.",
        event_location: "New Zealand",
        add_city: "",
        add_state_or_province_code: "",
        add_postal_code: "",
        add_country_code: "",
        add_country_name: "",
        created_at: "2025-02-24 11:28:43",
        updated_at: "2025-02-24 11:28:43",
        event_state: "in_transit",
        event_remark: "",
      },
      {
        id: "9367449",
        docket_id: "238731",
        event_at: "2025-02-20 22:30:22",
        event_type: "MANIFEST",
        event_description: "Import Scan",
        event_location: "New Zealand",
        add_city: "",
        add_state_or_province_code: "",
        add_postal_code: "",
        add_country_code: "",
        add_country_name: "",
        created_at: "2025-02-20 22:30:22",
        updated_at: "2025-02-20 22:30:22",
        event_state: "in_transit",
        event_remark: "",
      },
      {
        id: "9367449",
        docket_id: "238731",
        event_at: "2025-02-20 21:30:22",
        event_type: "MANIFEST",
        event_description: "Arrived at facility",
        event_location: "New Zealand",
        add_city: "",
        add_state_or_province_code: "",
        add_postal_code: "",
        add_country_code: "",
        add_country_name: "",
        created_at: "2025-02-20 21:30:22",
        updated_at: "2025-02-20 21:30:22",
        event_state: "in_transit",
        event_remark: "",
      },
      {
        id: "9367449",
        docket_id: "238731",
        event_at: "2025-02-18 4:54:00",
        event_type: "MANIFEST",
        event_description: "Customs clearance in progress.",
        event_location: "AUSTRALIA",
        add_city: "",
        add_state_or_province_code: "",
        add_postal_code: "",
        add_country_code: "",
        add_country_name: "",
        created_at: "2025-02-18 4:54:51",
        updated_at: "2025-02-18 4:54:15",
        event_state: "in_transit",
        event_remark: "",
      },
      {
        id: "9367449",
        docket_id: "238731",
        event_at: "2025-02-15 18:00:00",
        event_type: "MANIFEST",
        event_description: "ARRIVED AT AIRPORT",
        event_location: "AUSTRALIA",
        add_city: "",
        add_state_or_province_code: "",
        add_postal_code: "",
        add_country_code: "",
        add_country_name: "",
        created_at: "2025-02-15 09:39:51",
        updated_at: "2025-02-15 13:22:15",
        event_state: "in_transit",
        event_remark: "",
      },
      {
        id: "9345736",
        docket_id: "238731",
        event_at: "2025-02-012 09:37:00",
        event_type: "MANIFEST",
        event_description: "FLIGHT DEPARTED",
        event_location: "MUMBAI",
        add_city: "",
        add_state_or_province_code: "",
        add_postal_code: "",
        add_country_code: "",
        add_country_name: "",
        created_at: "2025-02-012 09:37:56",
        updated_at: "2025-02-012 13:22:15",
        event_state: "in_transit",
        event_remark: "",
      },
      {
        id: "9336395",
        docket_id: "238731",
        event_at: "2025-02-10 21:05:56",
        event_type: "SYSTEM",
        event_description: "SHIPMENT  BAGGED FOR DEPARTURE",
        event_location: "MUMBAI",
        add_city: "",
        add_state_or_province_code: "",
        add_postal_code: "",
        add_country_code: "",
        add_country_name: "",
        created_at: "2025-02-10 21:05:31",
        updated_at: "2025-02-10 13:22:15",
        event_state: "remanifest",
        event_remark: "",
      },
      {
        id: "9329302",
        docket_id: "238731",
        event_at: "2025-02-10 12:16:43",
        event_type: "WEIGHT MACHINE",
        event_description: "SHIPMENT ARRIVED",
        event_location: "MUMBAI",
        add_city: "",
        add_state_or_province_code: "",
        add_postal_code: "",
        add_country_code: "",
        add_country_name: "",
        created_at: "2025-02-10 12:16:43",
        updated_at: "2025-02-10 13:22:15",
        event_state: "reincoming_manifest",
        event_remark: "",
      },
      {
        id: "9286035",
        docket_id: "238731",
        event_at: "2025-02-09 18:11:00",
        event_type: "SYSTEM",
        event_description: "PACKET FORWARDED TO BRANCH",
        event_location: "CHENNAI",
        add_city: "",
        add_state_or_province_code: "",
        add_postal_code: "",
        add_country_code: "",
        add_country_name: "",
        created_at: "2025-02-08 18:13:09",
        updated_at: "2025-02-08 13:22:15",
        event_state: "branch_manifest",
        event_remark: "",
      },
      {
        id: "9284424",
        docket_id: "238731",
        event_at: "2025-02-09 17:24:06",
        event_type: "SYSTEM",
        event_description: "SHIPMENT ARRIVED",
        event_location: "CHENNAI",
        add_city: "",
        add_state_or_province_code: "",
        add_postal_code: "",
        add_country_code: "",
        add_country_name: "",
        created_at: "2025-02-08 17:24:06",
        updated_at: "2025-02-08 13:22:15",
        event_state: "in_scan",
        event_remark: "",
      },
      {
        id: "9284409",
        docket_id: "238731",
        event_at: "2025-02-08 17:06:00",
        event_type: "SYSTEM",
        event_description: "SHIPMENT INFORMATION RECEIVED",
        event_location: "CHENNAI",
        add_city: "",
        add_state_or_province_code: "",
        add_postal_code: "",
        add_country_code: "",
        add_country_name: "",
        created_at: "2025-02-08 17:20:35",
        updated_at: "2025-02-08 13:22:15",
        event_state: "entry",
        event_remark: "",
      },
    ]);
    return;
  }
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
