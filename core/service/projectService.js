const { generateCodeWithAI, createProjectFiles, pushToGitHub } = require("./projectUtils");
const { deleteFolder } = require("../util/execCommand");
const PROMPT_CONFIG = require("../config/prompt-config");

async function generateProject(appName, prompt) {
  try {
    console.log(`[${appName}] Generating frontend and backend...`);
    
    const FRONT_END_FINAL_PROMPT = PROMPT_CONFIG.FRONT_END_PROMPT.replace("{{VIEW_PROMPT}}", prompt);
    const BACK_END_FINAL_PROMPT = PROMPT_CONFIG.BACK_END_PROMPT.replace("{{VIEW_PROMPT}}", prompt);

    const frontendCode = await generateCodeWithAI(FRONT_END_FINAL_PROMPT, "React frontend");
    await createProjectFiles(appName, frontendCode, "frontend");

    const backendCode = await generateCodeWithAI(BACK_END_FINAL_PROMPT, "Node.js backend");
    await createProjectFiles(appName, backendCode, "backend");

    console.log(`[${appName}] Project created successfully!`);
    let url = await pushToGitHub(appName);

    return url;

  } catch (error) {
    console.error(`Error generating project [${appName}]:`, error);
    await deleteFolder(appName);
    throw error;
  }
}

module.exports = { generateProject };
