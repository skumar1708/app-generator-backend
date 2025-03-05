const fs = require("fs");
const path = require("path");
const axios = require("axios");

const NETLIFY_API_TOKEN = "nfp_xBmDdWKPh3A3PX29zbUDutqFNXjnJKeLadb1";
let NETLIFY_SITE_ID = "your-site-id"; // Set after creating site
let DEPLOY_ID = "";

const buildDir = path.resolve(__dirname, "generated", "app-1740407803022", "frontend", "build");

// Step 1: Create a new Netlify site (Run only once)
const createSite = async () => {
  try {
    const response = await axios.post(
      "https://api.netlify.com/api/v1/sites",
      {},
      { headers: { Authorization: `Bearer ${NETLIFY_API_TOKEN}` } }
    );
    NETLIFY_SITE_ID = response.data.id;
    console.log("Netlify Site Created:", response.data.url);
    return NETLIFY_SITE_ID;
  } catch (error) {
    console.error("Error creating site:", error.response?.data || error);
  }
};

// Step 2: Create a new deployment
const createDeployment = async () => {
  try {
    const siteId = await createSite();
    const response = await axios.post(
      `https://api.netlify.com/api/v1/sites/${siteId}/deploys`,
      { title: "Manual upload via API" },
      { headers: { Authorization: `Bearer ${NETLIFY_API_TOKEN}` } }
    );
    DEPLOY_ID = response.data.id;
    console.log("Deployment Created:", DEPLOY_ID);
    console.log("Deployment state:", response.data.state);
  } catch (error) {
    console.error("Error creating deployment:", error.response?.data || error);
  }
};


// Function to get all files from a directory recursively
const getAllFiles = (dirPath) => {
    let fileList = [];
    const files = fs.readdirSync(dirPath);
  
    files.forEach((file) => {
      const filePath = path.join(dirPath, file);
      if (fs.statSync(filePath).isDirectory()) {
        fileList = fileList.concat(getAllFiles(filePath)); // Recursively get files from subdirectories
      } else {
        fileList.push(filePath);
      }
    });
  
    return fileList;
  };
  
  // Function to upload a single file to Netlify
  const uploadFile = async (filePath) => {
    try {
      const fileContent = fs.readFileSync(filePath);
      const relativePath = path.relative(buildDir, filePath); // Get path relative to build folder
      const netlifyPath = encodeURI(relativePath); // Encode URI for spaces and special characters
  
      const response = await axios.put(
        `https://api.netlify.com/api/v1/deploys/${DEPLOY_ID}/files/${netlifyPath}`,
        fileContent,
        {
          headers: {
            Authorization: `Bearer ${NETLIFY_API_TOKEN}`,
            "Content-Type": "application/octet-stream",
          },
        }
      );
  
      console.log(`✅ Uploaded: ${relativePath}`);
    } catch (error) {
      console.error(`❌ Upload failed: ${filePath}`, error.response?.data || error);
    }
  };
  
  // Upload all files in the build directory
  const uploadBuildFolder = async () => {
    const files = getAllFiles(buildDir);
    console.log(`🔄 Uploading ${files.length} files...`);
    
    for (const file of files) {
      await uploadFile(file); // Upload each file one by one
    }
  
    console.log("✅ All files uploaded!");
  };
  
  // Function to finalize the deployment
  const finalizeDeployment = async () => {
    try {
      const response = await axios.post(
        `https://api.netlify.com/api/v1/deploys/${DEPLOY_ID}/finish`,
        {},
        { headers: { Authorization: `Bearer ${NETLIFY_API_TOKEN}` } }
      );
      console.log("🚀 Deployment Finalized:", response.data.deploy_url);
    } catch (error) {
      console.error("❌ Error finalizing deployment:", error.response?.data || error);
    }
  };

// Run the deployment process
const deploy = async () => {
  await createDeployment();
  // Run the upload process
  uploadBuildFolder().then(finalizeDeployment);
    // await uploadFiles(buildDir, "", "67bd603fd9124d665197e8d9");
    // await finalizeDeployment("67bd603fd9124d665197e8d9");
};

const checkDeployState = async () => {
    try {
        const response = await axios.get(
          `https://api.netlify.com/api/v1/deploys/67bd603fd9124d665197e8d9`,
          { headers: { Authorization: `Bearer ${NETLIFY_API_TOKEN}` } }
        );
        console.log("Deployment state:", response.data.state);
      } catch (error) {
        console.error("Error finalizing deployment:", error.response?.data || error);
      }
}

const checkAuth = async () => {
    try {
      const response = await axios.get(
        "https://api.netlify.com/api/v1/sites",
        {
          headers: { Authorization: `Bearer ${NETLIFY_API_TOKEN}` }
        }
      );
  
      console.log("✅ API Token is valid! Sites:", response.data[0].name);
    } catch (error) {
      console.error("❌ Invalid API Token or insufficient permissions:", error.response?.data || error);
    }
  };
  

// checkDeployState();
// checkAuth();
deploy();
