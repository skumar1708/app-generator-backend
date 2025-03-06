const express = require("express");
const cors = require("cors");
const { Worker } = require("worker_threads");
const rateLimiter = require("../middleware/rateLimiter");
const statusTracker = require("../state/statusTracker");
const projectService = require("./service/projectService");
require('dotenv').config();
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

// app.use(rateLimiter);

// Health Check
app.get("/healthcheck", (req, res) => res.send("Working fine"));

// Status Endpoint: Check ongoing project creations
app.post("/status", (req, res) => {
  const { appName } = req.body;
  res.json(statusTracker.getStatuses(appName));
});

app.post("/deployed", (req) => {
  const { appName, url, status } = req.body;
  console.log("Deployment done callback for ", appName);

  statusTracker.updateStatus(appName, status, url);
});

// Generate Project (Offloads to Worker)
app.post("/generateProject", (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  const appName = `app-${Date.now()}`;

  projectService.generateProject(appName, prompt, req, res);

  // Start a new worker thread
  // const workerPath = path.resolve(process.cwd(), "public/worker.js");
  // console.log("Worker path", workerPath);
  // const worker = new Worker(workerPath, { workerData: { appName, prompt } });

  // worker.on("message", (message) => {
  //   if (message.status) {
  //     statusTracker.updateStatus(appName, message.status, message?.url);
  //   }
  // });

  // worker.on("error", (err) => {
  //   console.error(`Worker error for ${appName}:`, err);
  //   statusTracker.updateStatus(appName, "Failed");
  // });

  // worker.on("exit", () => {
  //   console.log(`Worker for ${appName} exited.`);
  // });

  res.json({ appName, message: "Project creation started" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
