import express from "express";
import "dotenv/config";
import axios from "axios";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dummydata from "./dummydata.js";

const app = express();
const PORT = process.env.PORT || 9000;
let endPoints = {
  UPS: "http://worldfirst.xpresion.in/api/v1/Tracking/Tracking",
  BOMBINO: "http://admin.bombinoexp.com/api/tracking_api/get_tracking_data",
  ATLANTIC: "https://live.tccs.in/api/v1/Tracking/Tracking",
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
  res.send("Welcome to the AWB Tracking API -  14-04-2025");
});

app.post("/api/track/ups", async (req, res) => {
  const { UserID, Password, AWBNo, Type } = req.body;

  if (AWBNo == "9220883890") {
    return res.json(dummydata);
  }

  const requestBody = {
    UserID: UserID,
    Password: Password,
    AWBNo: AWBNo,
    Type: Type,
  };

  try {
    const response = await axios.post(endPoints["UPS"], requestBody);
    res.json(response.data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error with the API request", error: error.message });
  }
});

app.post("/api/track/atlantic", async (req, res) => {
  const { UserID, Password, AWBNo, Type } = req.body;
  console.log("Test")
  const requestBody = {
    UserID: UserID,
    Password: Password,
    AWBNo: AWBNo,
    Type: Type,
  };

  try {
    const response = await axios.post(endPoints["ATLANTIC"], requestBody);
    res.json(response.data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error with the API request", error: error.message });
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
