require('dotenv').config();
const axios = require("axios");
const GITHUB_USERNAME = "skumar1708";
const GITHUB_TOKEN = process.env.GIT_HUB_PAT;
console.log(GITHUB_TOKEN)
async function createRepo(APP_NAME) {
  const url = "https://api.github.com/user/repos";
  try {
    const response = await axios.post(
      url,
      { name: "Dummy app2", private: false },
      { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
    );
    console.log(`Repository created: ${response.data.html_url}`);
  } catch (error) {
    console.error("Error creating repository:", error.response?.data || error.message);
  }
}

createRepo()