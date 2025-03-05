const { parentPort, workerData } = require("worker_threads");
const projectService = require("../service/projectService");

const { appName, prompt } = workerData;

console.log("Worker started:", workerData);

async function createProject() {
  try {
    parentPort.postMessage({ status: "Generating project structure..." });
    let url = await projectService.generateProject(appName, prompt);

    parentPort.postMessage({ status: "Completed", url });
  } catch (error) {
    console.error(`Error in worker for ${appName}:`, error);
    parentPort.postMessage({ status: "Failed" });
  }
}

createProject();
