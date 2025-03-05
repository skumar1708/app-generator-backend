const axios = require('axios'); // You'll need to install this: npm install axios
const fs = require('fs').promises;
const path = require('path');

async function deleteGitHubRepoRobust(owner, repo, token) {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;

  try {
    const response = await axios.delete(apiUrl, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
    });

    console.log(`Repository ${owner}/${repo} deleted successfully.`);

  } catch (error) {
    let errorDetails = `Error deleting repository: `;

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      errorDetails += `${error.response.status} - ${error.response.statusText}`;
      if (error.response.data && error.response.data.message) {
        errorDetails += `\nGitHub Error Details: ${error.response.data.message}`;
        if (error.response.data.errors) {
            errorDetails += `\nAdditional Errors: ${JSON.stringify(error.response.data.errors)}`;
        }
      }
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      errorDetails += 'No response received from GitHub.';
    } else {
      // Something happened in setting up the request that triggered an Error
      errorDetails += error.message;
    }

    throw new Error(errorDetails); // Re-throw the error with details
  }
}

async function getFolderNames(directoryPath) {
    try {
      const files = await fs.readdir(directoryPath, { withFileTypes: true });
      const folderNames = files
        .filter((file) => file.isDirectory())
        .map((file) => file.name);
      return folderNames;
    } catch (err) {
      console.error(`Error reading directory: ${err}`);
      return []; // Return an empty array in case of an error
    }
  }
  

// Example usage:
const owner = "skumar1708"; // Replace with the repository owner's username
const repo = "app-1740483593831";       // Replace with the repository name
const token = process.env.GIT_HUB_PAT;     // Replace with your GitHub personal access token

async function deleteGitHubReposRobust(owner, token) {
    const directoryPath = path.resolve(__dirname, "generated");
    const repos = await getFolderNames(directoryPath);
    const deletePromises = repos.map(repo => {
      return deleteGitHubRepoRobust(owner, repo, token)
        .then(() => console.log(`Deletion process started (async) for ${repo}`))
        .catch(err => {
          console.error(`Error deleting ${repo}:`, err);
          // Important: You might want to rethrow or handle errors differently here
          // If you rethrow, Promise.all will reject immediately on the first error.
          // If you don't rethrow, Promise.all will settle with all the results, even failures.
          // Returning undefined or null, in this case, allows Promise.all to continue.
          return undefined; // or null, if you prefer.
        });
    });
  
    try {
      await Promise.all(deletePromises);
      console.log("All deletion processes initiated.");
    } catch (aggregatedError) {
      // If any promise in the array rejects, this catch block will be triggered.
      // However, if you've handled errors within the individual promises,
      // this catch block might not be reached.
      console.error("An aggregated error occurred:", aggregatedError);
    }
  }

  deleteGitHubReposRobust(owner, token);