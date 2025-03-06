const { Mistral } = require("@mistralai/mistralai");
const fs = require("fs");
const path = require("path");
const { gitPusher } = require("../../deployment/git/command-push");
const { writeProject } = require("../util/write.projects");
const statusTracker = require("../../state/statusTracker");
const { createAndCheckDeployment } = require("../../deployment/vercel/vercel-sdk.deploy").default;
const logger = require("../util/logger");

const client = new Mistral({ apiKey: "kuJKP4h9e1PWrEyshqZHNGM3jcQ3Hi94" });

/**
 * Generates code using AI model
 * @param {string} prompt - AI prompt for generating code
 * @param {string} type - Type of code (frontend/backend)
 * @returns {Object} Generated file structure
 */
const generateCodeWithAI = async (prompt, type) => {
  console.log(`[AI] Generating ${type} code...`);
  try {
    const chatResponse = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [
        {
          role: "user",
          content: `Generate a complete ${type} project structure based on this requirement: ${prompt}`,
        },
      ],
    });

    const codeFiles = JSON.parse(
      chatResponse.choices[0].message.content.replace("```json", "").replace("```", ""),
      (key, value) => (typeof value === "string" ? value : value)
    );

    console.log(`[AI] ${type} code generated successfully.`);
    return codeFiles;
  } catch (error) {
    console.error(`[AI Error] Failed to generate ${type} code:`, error);
    // throw new Error(`Failed to generate ${type} code.`);
  }
};

/**
 * Creates project directories and writes generated code files
 * @param {string} appName - Project name
 * @param {Object} files - Generated file structure
 * @param {string} stack - "frontend" or "backend"
 */
const createProjectFiles = async (appName, files, stack) => {
    const projectPath = path.join('/tmp', "generated", appName);
  const codePath = path.join(projectPath, stack);

  console.log(`[File System] Writing ${stack} code files for ${appName}...`);

  const createFiles = async (basePath, files) => {
    for (const filePath in files) {
      const fullPath = path.join(basePath, filePath);
      const dirPath = path.dirname(fullPath);

      await fs.promises.mkdir(dirPath, { recursive: true });
      await fs.promises.writeFile(fullPath, files[filePath], "utf-8");
    }
  };

  await createFiles(codePath, files);
  console.log(`[File System] ${stack} files written successfully.`);
};

/**
 * Pushes project to GitHub and deploys it
 * @param {string} appName - Project name
 */
const pushToGitHub = async (appName) => {
  try {
    console.log(`[GitHub] Publishing ${appName}...`);
    statusTracker.addStatus(appName, "Publishing code to repository");
    await gitPusher(appName);

    console.log(`[Deployment] Starting deployment for ${appName}...`);
    statusTracker.addStatus(appName, "Deploying application");
    let deployResp = await createAndCheckDeployment(appName);

    if (deployResp) {
      console.log(`[Deployment] Deployment successful: ${deployResp.deployConfig.deploymentURL}`);
      statusTracker.addStatus(appName, "Deployment done ");
      await writeProject({ repo: appName, ...deployResp });
      return deployResp.deployConfig.deploymentURL;
    } else {
      console.error(`[Deployment Error] Deployment failed for ${appName}`);
      return "";
    }
  } catch (err) {
    console.error(`[GitHub/Deployment Error] Error pushing or deploying ${appName}:`, err);
  }
};

module.exports = {
  generateCodeWithAI,
  createProjectFiles,
  pushToGitHub,
};
