require("dotenv").config();
const axios = require("axios");

const RENDER_API_KEY = process.env.RENDER_API_KEY || "rnd_qZWcjrIvaHuY6NLU3lmyAsll3Has"; // Store API key in .env
const GITHUB_REPO = "https://github.com/skumar1708/app-1740407803022"; // Change this

const createRenderService = async () => {
    console.log("RENDER_API_KEY", RENDER_API_KEY)
  try {
    const response = await axios.post(
      "https://api.render.com/v1/services",
      {
        name: `frontend-${Date.now()}`, // Unique name for the service
        type: "web_service",
        repo: `${GITHUB_REPO}`,
        region: "oregon", // Change region if needed (options: "oregon", "frankfurt")
        branch: "main",
        buildCommand: "npm install && npm run build",
        startCommand: "npm start",
        envVars: [
          { key: "NODE_VERSION", value: "18" }
        ],
        plan: "free", // Change to "starter" or "pro" if needed
        rootDir: "./frontend",
        autoDeploy: "yes"
      },
      {
        headers: {
          "Authorization": `Bearer ${RENDER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const newService = response.data;
    console.log("Service created successfully:", newService);

    // Extract and return the new Service ID
    return newService.id;
  } catch (error) {
    console.error("Error creating service:", error.response ? error.response.data : error.message);
  }
};

const deployFrontend = async () => {
    const SERVICE_ID = await createRenderService();
    console.log("Servicd ID", SERVICE_ID)
    try {
      const response = await axios.post(
        `https://api.render.com/v1/services/${SERVICE_ID}/deploys`,
        {},
        {
          headers: {
            "Authorization": `Bearer ${RENDER_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );
  
      console.log("Deployment triggered successfully:", response.data);
    } catch (error) {
      console.error("Error triggering deployment:", error.response ? error.response.data : error.message);
    }
  };
  
  deployFrontend();

// createRenderService();
