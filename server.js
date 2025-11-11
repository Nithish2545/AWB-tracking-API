import express from "express";
import "dotenv/config";
import axios from "axios";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import selfdummy from "./selfdummy.js";
import muthukumarAtlantic from "./muthukumarAtlantic.js";
import hemanth_bobi from "./hemanth_bobi.js";
import BaskaranAtlantic from "./BaskaranAtlantic.js";
import Vijayalakshmi_dataset from "./Vijayalakshmi_dataset.js";
import SKarunanithy from "./SKarunanithy.js";
import PARAMPARA from "./PARAMPARA.js";
import Vellaisamy from "./Vellaisamy.js";

const app = express();
const PORT = process.env.PORT || 9000;
let endPoints = {
  UPS: "http://worldfirst.xpresion.in/api/v1/Tracking/Tracking",
  BOMBINO: "http://admin.bombinoexp.com/api/tracking_api/get_tracking_data",
  ATLANTIC: "https://live.tccs.in/api/v1/Tracking/Tracking",
  EXPLUS: "https://api.expluslogistics.com/index.php",
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

app.post("/api/track/deskself", async (req, res) => {
  const { UserID, Password, AWBNo, Type } = req.body;

  if (AWBNo == "sefl12323123") {
    return res.json(selfdummy);
  }
});

app.post("/api/track/ExPlus", async (req, res) => {
  try {
    const apiResponse = await axios.post(
      `${endPoints["EXPLUS"]}?action=GetExplusTracking`,
      req.body,
      {
        headers: {
          Authorization:
            "Bearer 5ae5ecea2a57fdb227d9168eade332344bb38d17205d750c6260f34bad62a65a", // Forward the bearer token
          "Content-Type": "application/json",
        },
      }
    );
    res.json(apiResponse.data);
  } catch (error) {
    res.status(500).json({
      message: "Error with the API request",
      error: error?.response?.data || error.message,
    });
  }
});

app.post("/api/track/ups", async (req, res) => {
  const { UserID, Password, AWBNo, Type } = req.body;

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

  if (AWBNo == "1ZXGHSDFXCSZ") {
    return res.json(Vellaisamy);
  }

  if (AWBNo == "9220930810") {
    return res.json(muthukumarAtlantic);
  }
  if (AWBNo == "131231241231") {
    return res.json(PARAMPARA);
  }
  if (AWBNo == "9220933182") {
    return res.json(BaskaranAtlantic);
  }

  if (AWBNo == "9220951416") {
    return res.json(hemanth_bobi);
  }

  if (AWBNo == "987654321") {
    return res.json(Vijayalakshmi_dataset);
  }

  if (AWBNo == "71147292554") {
    return res.json(SKarunanithy);
  }

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
