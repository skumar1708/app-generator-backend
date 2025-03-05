const axios = require("axios");

const NETLIFY_API_TOKEN = "nfp_xBmDdWKPh3A3PX29zbUDutqFNXjnJKeLadb1"; // Replace with your Netlify API token
const GITHUB_REPO_URL = "skumar1708/app-1740407803022"; // Replace with your repo
const NETLIFY_TEAM_ID = "your-team-id"; // Replace with your Netlify team ID (optional)

const deployNewSite = async () => {
  try {
    const response = await axios.post(
      "https://api.netlify.com/api/v1/sites",
      {
        repo: {
          provider: "github",
          repo: GITHUB_REPO_URL,
          private: false, // Set to true if it's a private repo
          branch: "main", // Change branch if needed
        },
        build_settings: {
          base: "frontend", // Set the base directory
          dir: "frontend/build", // Output directory after build
          cmd: "npm install && npm run bild:ui", // Build command
        },
      },
      {
        headers: {
          Authorization: `Bearer ${NETLIFY_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("New site deployed on Netlify:", response.data);
  } catch (error) {
    console.error("Error deploying site:", error.response?.data || error);
  }
};

// Run the deployment function
deployNewSite();
