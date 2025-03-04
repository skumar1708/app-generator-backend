require("dotenv").config();
const axios = require("axios");

const VERCEL_API_TOKEN = process.env.VERCEL_TOKEN;
const GITHUB_REPO = "skumar1708/app-1740407803022"; // Change this
const BRANCH = "main";
const PROJECT_NAME = "my-app-gen-demo"; // Change this

const deployToVercel = async () => {
    console.log("TOKEN", VERCEL_API_TOKEN)
  try {
    // 1️⃣ Start Deployment
    const response = await axios.post(
      "https://api.vercel.com/v13/deployments?teamId=team_UdSGHNxyVEZUCDCDNHPMgEv4",
      {
        name: "my-instant-deployment",
        gitSource: {
          type: "github",
          repo: GITHUB_REPO,  // ✅ Use "username/repo-name"
          ref: BRANCH,
          repoId: "938173998"
        },
        projectSettings: {
            buildCommand: "npm run build",
            commandForIgnoringBuildStep: null,
            devCommand: "npm start",
            framework: null,
            installCommand: "npm install",
            nodeVersion: '22.x',
            outputDirectory: null,
            rootDirectory: "./frontend",
            serverlessFunctionRegion: null,
            skipGitConnectDuringLink: true,
            sourceFilesOutsideRootDirectory: true
        },
        target: "production"
      },
      {
        headers: {
          Authorization: `Bearer '${VERCEL_API_TOKEN}'`,
          "Content-Type": "application/json",
        }
      }
    );

    const deploymentId = response.data.id;
    console.log(`🚀 Deployment started: ${deploymentId}`);

    // 2️⃣ Wait for deployment to be ready and get the URL
    const deployedUrl = await checkDeploymentStatus(deploymentId);
    return deployedUrl; // Return the final deployed URL

  } catch (error) {
    console.error(
      "❌ Deployment failed:",
      error.response ? error.response.data : error.message
    );
    return null;
  }
};

const checkDeploymentStatus = async (deploymentId) => {
  try {
    while (true) {
      const response = await axios.get(
        `https://api.vercel.com/v13/deployments/${deploymentId}`,
        {
          headers: { Authorization: `Bearer ${VERCEL_API_TOKEN}` },
        }
      );

      const { readyState, url } = response.data;
      console.log(`🔄 Deployment Status: ${readyState}`);

      if (readyState === "READY") {
        console.log(`✅ Deployed Successfully: https://${url}`);
        return `https://${url}`; // Return the deployment URL
      } else if (readyState === "ERROR") {
        console.error("❌ Deployment failed!");
        return null;
      }

      // Wait 5 seconds before checking again
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  } catch (error) {
    console.error("❌ Error checking deployment status:", error.message);
    return null;
  }
};

// Call the function and log the returned URL
deployToVercel().then((url) => {
  if (url) {
    console.log(`🌍 Final Deployed URL: ${url}`);
  } else {
    console.log("❌ Deployment was not successful.");
  }
});
