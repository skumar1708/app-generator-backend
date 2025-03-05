const axios = require("axios");
const fs = require("fs");
const path = require("path");
require('dotenv').config();

const GITHUB_USERNAME = "skumar1708";
const GITHUB_TOKEN = process.env.GIT_HUB_PAT;
// let APP_NAME = `app-1740377501788`;

// const REPO_PATH = path.resolve(__dirname, "generated", APP_NAME); // Push all contents inside repo folder

async function createRepo(APP_NAME) {
  const url = "https://api.github.com/user/repos";
  try {
    const response = await axios.post(
      url,
      { name: APP_NAME, private: false },
      { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
    );
    console.log(`Repository created: ${response.data.html_url}`);
  } catch (error) {
    console.error("Error creating repository:", error.response?.data || error.message);
  }
}

async function getShaIfExists(filePath, APP_NAME) {
  const url = `https://api.github.com/repos/${GITHUB_USERNAME}/${APP_NAME}/contents/${filePath}`;
  try {
    const { data } = await axios.get(url, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` },
    });
    return data.sha;
  } catch (err) {
    return null; // File does not exist
  }
}

async function commitFile(filePath, repoPath, APP_NAME) {
  const fileContent = fs.readFileSync(filePath);
  const encodedContent = Buffer.from(fileContent).toString("base64");
  const sha = await getShaIfExists(repoPath, APP_NAME);
  
  const url = `https://api.github.com/repos/${GITHUB_USERNAME}/${APP_NAME}/contents/${repoPath}`;
  try {
    const response = await axios.put(
      url,
      {
        message: `Automated commit: ${repoPath}`,
        content: encodedContent,
        sha, // Required for updating an existing file
      },
      {
        headers: { Authorization: `token ${GITHUB_TOKEN}` },
      }
    );
    console.log(`File committed: ${repoPath}`);
  } catch (error) {
    console.error(`Error committing file ${repoPath}:`, error.response?.data || error.message);
  }
}

async function uploadFolder(folderPath, relativePath = "", APP_NAME) {
  const files = fs.readdirSync(folderPath, { withFileTypes: true });
  for (const file of files) {
    const localPath = path.join(folderPath, file.name);
    const repoPath = path.join(relativePath, file.name).replace(/\\/g, "/"); // Maintain folder structure
    if (file.isDirectory()) {
      await uploadFolder(localPath, repoPath, APP_NAME); // Recursively upload subfolders
    } else {
      await commitFile(localPath, repoPath, APP_NAME);
    }
  }
}

const gitPusher  =  async (appName) => {
  const REPO_PATH =  path.resolve(process.cwd(), "generated", appName);
  await createRepo(appName);
  await uploadFolder(REPO_PATH, "", appName);
  console.log("Repository upload complete!");
};

module.exports = {
  gitPusher
}
