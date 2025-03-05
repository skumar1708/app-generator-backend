const PROMPT_CONFIG = require("./core/config/prompt-config");
const http = require("http");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const logger = require("./core/util/logger");
const { gitPusher } = require("./deployment/git/command-push");
const { createAndCheckDeployment } = require("./deployment/vercel/vercel-sdk.deploy").default;
const { Mistral } = require("@mistralai/mistralai");
const { deleteFolder } = require("./core/util/execCommand");
const { writeProject } = require("./core/util/write.projects");

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors());

app.get("/healthcheck", (req, res) => res.send("Working fine"));

const client = new Mistral({ apiKey: "kuJKP4h9e1PWrEyshqZHNGM3jcQ3Hi94" });

const pushToGitHub = async (appName) => {
  try {
    console.log(`Publishing code base for ${appName}`);
    await gitPusher(appName);
    console.log(`Deployment started for ${appName}`);
    let deployResp = await createAndCheckDeployment(appName);
    if (deployResp) {
      await writeProject({ repo: appName, ...deployResp });
      return deployResp?.deployConfig?.deploymentURL;
    } else {
      throw new Error("Deployment failed, please retry again");
    }
  } catch (err) {
    console.error("Error push initiation", err);
    throw err;
  }
};

const generateCodeWithAI = async (prompt, type) => {
  try {
    console.log(`Generating ${type} folder`);
    const chatResponse = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [{ role: "user", content: `Generate a complete ${type} project structure based on this requirement: ${prompt}` }],
    });

    const codeFiles = JSON.parse(
      chatResponse.choices[0].message.content.replace("```json", "").replace("```", ""),
      (key, value) => (typeof value === "string" ? value : value)
    );
    return codeFiles;
  } catch (error) {
    console.error(`Error creating ${type} code`, error);
    throw new Error(`Error creating ${type} code`);
  }
};

const createProjectFiles = async (appName, files, stack) => {
  try {
    const projectPath = path.join(__dirname, "generated", appName);
    const codePath = path.join(projectPath, stack);

    const createFiles = async (basePath, files) => {
      for (const filePath in files) {
        const fullPath = path.join(basePath, filePath);
        const dirPath = path.dirname(fullPath);
        await fs.promises.mkdir(dirPath, { recursive: true });
        await fs.promises.writeFile(fullPath, files[filePath], "utf-8");
      }
    };

    await createFiles(codePath, files);
    return projectPath;
  } catch (err) {
    console.error("Error writing files", err);
    throw err;
  }
};

app.post("/generateProject", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });
  
  const appName = `app-${Date.now()}`;
  try {
    console.log("Starting project generation for", appName);

    const FRONT_END_FINAL_PROMPT = PROMPT_CONFIG.FRONT_END_PROMPT.replace("{{VIEW_PROMPT}}", prompt);
    const BACK_END_FINAL_PROMPT = PROMPT_CONFIG.BACK_END_PROMPT.replace("{{VIEW_PROMPT}}", prompt);

    const frontendCode = await generateCodeWithAI(FRONT_END_FINAL_PROMPT, "React frontend");
    await createProjectFiles(appName, frontendCode, "frontend");

    const backendCode = await generateCodeWithAI(BACK_END_FINAL_PROMPT, "Node.js backend");
    await createProjectFiles(appName, backendCode, "backend");

    console.log("✅ Project structure created.");

    const deployedUrl = await pushToGitHub(appName);
    res.json({ message: "Project generated successfully", deployedUrl });
  } catch (err) {
    console.error("Error during project generation", err);
    await deleteFolder(appName);
    res.status(500).json({ error: "Error generating project. Please try again." });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
