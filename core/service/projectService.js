const axios = require("axios");
const { generateCodeWithAI, createProjectFiles, pushToGitHub } = require("./projectUtils");
const { deleteFolder } = require("../util/execCommand");
const statusTracker = require("../../state/statusTracker");
const PROMPT_CONFIG = require("../config/prompt-config");

async function generateProject(appName, prompt, req) {
  try {
    console.log(`[${appName}] Generating frontend and backend...`);
    statusTracker.addStatus(appName, "Analysing prompt");
    await new Promise((resolve) => setTimeout(resolve, 5000));
    
    statusTracker.addStatus(appName, "Bootstraping project structure");
    
    const FRONT_END_FINAL_PROMPT = PROMPT_CONFIG.FRONT_END_PROMPT.replace("{{VIEW_PROMPT}}", prompt);
    const BACK_END_FINAL_PROMPT = PROMPT_CONFIG.BACK_END_PROMPT.replace("{{VIEW_PROMPT}}", prompt);

    const frontendCode = await generateCodeWithAI(FRONT_END_FINAL_PROMPT, "React frontend");
    await createProjectFiles(appName, frontendCode, "frontend");

    statusTracker.addStatus(appName, "Writing code for interactivity");

    const backendCode = await generateCodeWithAI(BACK_END_FINAL_PROMPT, "Node.js backend");
    await createProjectFiles(appName, backendCode, "backend");

    statusTracker.addStatus(appName, "Adjusting layouts");

    console.log(`[${appName}] Project created successfully!`);
    let url = await pushToGitHub(appName);

    try {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      axios.post(`${baseUrl}/deployed`, {appName, url, status: "Completed"});
      await new Promise((resolve) => setTimeout(resolve, 5000));

      statusTracker.removeApp(appName);

    } catch(e) {
      console.log("Errror while making Internal Axios call");
      statusTracker.removeApp(appName);
    }

  } catch (error) {
    console.error(`Error generating project [${appName}]:`, error);
    await deleteFolder(appName);
    statusTracker.removeApp(appName);
    // throw error;
  }
}

module.exports = { generateProject };
