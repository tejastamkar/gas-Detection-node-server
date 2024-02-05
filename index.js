import express from "express";
import dotenv from "dotenv";
import axios from "axios";

import cors from "cors";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import { webSocketFun } from "./websocket.js";
import db from "./dbConfig.js";
import { pythonserverUrl } from "./var.js";

// import scoreRoute from './src/routes/score.js';
const app = express();
const port = 3003;
dotenv.config(); // added .env data
app.use(express.static("public"));
app.use(fileUpload({ createParentPath: true }));
app.use(bodyParser.urlencoded({ limit: "600mb", extended: true }));
app.use(bodyParser.json({ limit: "600mb" }));
app.use(cors());
app.use(express.json({ limit: "600mb" }));

// this is the port listner

app.post("/save", async (req, res) => {
  try {
    const { data, type } = req.body;
    await db.collection("Save").insertOne({
      ...data,
      type,
    });

    const allData = await db
      .collection("Save")
      .find({type}, { projection: { _id: 0, type: 0 } })
      .toArray();
    console.log(allData);
    await axios
      .get(`${pythonserverUrl}/getKNNtrain`, { data: allData })
      .then((response) => {
        console.log("Response:", response.data);
        // Handle response
      })
      .catch((error) => {
        console.error("There was an error!", error);
      });
    return res
      .status(200)
      .send({ success: true, msg: "Data saved successfully" });
  } catch (error) {
    console.error("Error saving data:", error);
    return res.status(500).send({ success: false, msg: "Failed to save data" });
  }
});
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.removeHeader("X-Powered-By");
  res.set(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  res.locals.message = err.message;
  // console.log('Error MSG : : ',err.message);
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.send({ success: false, message: "Api Not Found", data: [] });
});

app.listen(port, () => {
  webSocketFun();
  console.log(`Gas Detection Backend is listening on port ${port}`);
});

export default app;

