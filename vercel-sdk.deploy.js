const { Vercel } =  require('@vercel/sdk');
const logger = require("./logger");
 
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const GITHUB_REPO = "app-1740407803022"; // Change this
const BRANCH = "main";
const vercel = new Vercel({
  bearerToken: "tq93O1cRe08H1RaTiJzyU92I",
});
 
async function createAndCheckDeployment(repoName, socket) {
  try {
    // Create a new deployment
    const createResponse = await vercel.deployments.createDeployment({
      requestBody: {
        name: 'my-project', //The project name used in the deployment URL
        target: 'production',
        gitSource: {
          type: 'github',
          repo: repoName,
          ref: 'main',
          org: 'skumar1708', //For a personal account, the org-name is your GH username
        },
        projectSettings: {
            buildCommand: "npm run build",
            commandForIgnoringBuildStep: null,
            devCommand: "npm start",
            framework: null,
            installCommand: "npm install",
            nodeVersion: '22.x',
            outputDirectory: null,
            rootDirectory: "frontend",
            serverlessFunctionRegion: null,
            skipGitConnectDuringLink: true,
            sourceFilesOutsideRootDirectory: true
        }
      },
    });
 
    const deploymentId = createResponse.id;
 
    console.log(
      `Deployment created: ID ${deploymentId} and status ${createResponse.status}`,
    );
 
    // Check deployment status
    let deploymentStatus;
    let deploymentURL;
    let aliases;
    let statusResponse;
    logger.info(createResponse);
    do {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds between checks
       statusResponse = await vercel.deployments.getDeployment({
        idOrUrl: deploymentId,
        withGitRepoInfo: 'true',
      });
 
      deploymentStatus = statusResponse.status;
      deploymentURL = statusResponse.url;
      aliases = statusResponse.alias;
      console.log(`Deployment status: ${deploymentStatus}`);
    } while (
      (deploymentStatus === 'BUILDING' ||
      deploymentStatus === 'INITIALIZING' || aliases.length <= 2) && deploymentStatus !== "ERROR"
    );
 
    if (deploymentStatus === 'READY') {
      console.log(`Deployment successful. URL: ${deploymentURL}`);
      console.log(`Alliases  URL: ${aliases[0]}`);
 
      return { deployConfig: { deploymentId, deploymentURL: aliases[0],  project: {...statusResponse.project }, team: { ...statusResponse.team } } }
    } else {
      console.log('Deployment failed or was canceled');
      return null;
    }
  } catch (error) {
    console.error(
      error instanceof Error ? `Error: ${error.message}` : String(error),
    );
  }
}

// createAndCheckDeployment("app-1740470869059");
 
module.exports = {
    createAndCheckDeployment
}