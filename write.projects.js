const fs = require('fs').promises;
const path = require('path');

async function appendProjectToFile(project, filePath = path.join(__dirname, "projects.json")) {
  try {
    let projects = [];
    try {
      // Attempt to read existing projects from file
      const fileData = await fs.readFile(filePath, 'utf8');
      const existingData = JSON.parse(fileData || `{ "project" :[] }`);
      if (existingData && Array.isArray(existingData.projects)) {
        projects = existingData.projects; // Use existing projects
      }
    } catch (readError) {
      // File doesn't exist or is invalid JSON, start with empty array
      if (readError.code !== 'ENOENT') { //ignore if file not found, but log other errors.
        console.error(`Error reading existing ${filePath}:`, readError);
      }
    }

    projects.push(project); // Add the new project
    const jsonData = JSON.stringify({ projects }, null, 2);
    await fs.writeFile(filePath, jsonData, 'utf8');
    console.log(`Project ${project.projectId || project.name} appended to ${filePath}`);
  } catch (err) {
    console.error(`Error appending to ${filePath}:`, err);
  }
}

async function writeProject(project) {
  await appendProjectToFile(project);
  console.log("Project added to JSON");
}

module.exports = {
  writeProject,
};

// Example usage:
// async function test(){
//   await writeProject({ name: "SHravan", details: { address: "GGN", pin: 123456 } });
//   await writeProject({ name: "AnotherProject", details: { address: "Delhi", pin: 110001 }, projectId: "2" });
// }
// test();