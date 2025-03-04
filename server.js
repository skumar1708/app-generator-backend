const PROMPT_CONFIG = require("./prompt-config")
const http = require("http");
const { Server } = require("socket.io");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const logger = require("./logger");
const { gitPusher } = require("./command-push");
const { createAndCheckDeployment } = require("./vercel-sdk.deploy");
const  { Mistral } = require('@mistralai/mistralai');
const { deleteFolder } = require("./execCommand");
const { writeProject } = require("./write.projects");
  

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Or your Next.js app's URL
    methods: ["GET", "POST"] // Add other methods if needed
  }
});

app.use(express.json());
app.use(cors());

// Function to send updates to the frontend via WebSocket
const sendStatusUpdate = (socket, message) => {
  console.log("Status Update:", message);
  socket.emit("status", message);
};


const client = new Mistral({apiKey: "kuJKP4h9e1PWrEyshqZHNGM3jcQ3Hi94"});



const pushToGitHub = async (socket, appName, projectPath) => {
    try {
      socket.emit("status", `Publishing code base`);
      await gitPusher(appName);
      socket.emit("status", `Deployment started`);
      let deployResp = await createAndCheckDeployment(appName);
      if (deployResp) {
        await writeProject({ 
          repo: appName,
          ...deployResp
        });

        socket.emit("Status", "Deployment done")
        socket.emit("deployed", deployResp?.deployConfig?.deploymentURL)
      } else {
        socket.emit("error", "Deployment failed, please retry again")
      }

      // await deleteFolder(appName);
    } catch(err) {
      console.log("Error push initiation", err)
    }
  };


  const deployToRender = async (appName) => {
    const renderAPI = "https://api.render.com/v1/services";
    const response = await axios.post(renderAPI, {
      name: appName,
      repo: `https://github.com/your-user/${appName}`,
    });
  
    return response.data.url;
  };

const generateCodeWithAI = async (socket, prompt, type) => {
    socket.emit("status", `Generating ${type} folder`)
    try {
    const chatResponse = await client.chat.complete({
        model: 'mistral-large-latest',
        messages: [{role: 'user', content:  `Generate a complete ${type} project structure based on this requirement: ${prompt}`}],
      });

      // logger.info(chatResponse.choices[0].message.content.replace("```json", "").replace("```", ""))
      // sendStatusUpdate(socket, `${type} code generated.`);
      
      const codeFiles = JSON.parse(chatResponse.choices[0].message.content.replace("```json", "").replace("```", ""), (key, value) => {
        if (typeof value === 'string') {
          // No need to do anything here if the model correctly uses JSON.stringify
          // If needed you can add some post processing here
          return value;
        }
        return value;
      });
      return codeFiles
    } catch (error) {
      
      // sendStatusUpdate(socket, `Failed to generate ${type} code.`);
      console.log(`Error creating ${type} code`, error);
      socket.emit("error", `Error creating ${type} code`)
      return "";
    }
  };
  
  // Function to create project folders and write code
  const createProjectFiles = async (socket, appName, files, stack) => {
    try {
        const projectPath = path.join(__dirname, "generated", appName);
        const codePath = path.join(projectPath, stack);

        socket.emit("status", `Writing ${stack} code files`);

        // Helper function to create files recursively (async version)
        const createFiles = async (basePath, files) => {
            for (const filePath in files) {
                const fullPath = path.join(basePath, filePath);
                const dirPath = path.dirname(fullPath);

                // Ensure the directory exists (async)
                await fs.promises.mkdir(dirPath, { recursive: true });

                // Write the file (async)
                await fs.promises.writeFile(fullPath, files[filePath], "utf-8");
            }
        };

        // Generate frontend and backend folder structures (using await)
        await createFiles(codePath, files);

        return projectPath;
    } catch (err) {
        socket.emit("error", "Try again");
        // Important: Re-throw the error or handle it more appropriately
        // so the caller of this async function knows the operation failed.
        // Just emitting an error to the socket might not be sufficient.
        throw err; // Or handle it differently, e.g., console.error(err);
    }
};

// WebSocket connection handling
io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("generateProject", async (prompt) => {
    const appName = `app-${Date.now()}`;
    try {
      console.log("Prompt received", prompt);
      // sendStatusUpdate(socket, `Starting project: ${appName}`);
      socket.emit("status", `Starting project: ${appName}`);
  
      // Generate frontend and backend code separately
      const FRONT_END_FINAL_PROMPT = PROMPT_CONFIG.FRONT_END_PROMPT.replace("{{VIEW_PROMPT}}", prompt);
      const BACK_END_FINAL_PROMPT = PROMPT_CONFIG.BACK_END_PROMPT.replace("{{VIEW_PROMPT}}", prompt);
      
      const frontendCode = await generateCodeWithAI(socket, FRONT_END_FINAL_PROMPT, "React frontend");
      const FEprojectPath = await createProjectFiles(socket, appName, frontendCode, "frontend");
  
      const backendCode = await generateCodeWithAI(socket, BACK_END_FINAL_PROMPT, "Node.js backend");
      const BEprojectPath = await createProjectFiles(socket, appName, backendCode, "backend");

      
      // sendStatusUpdate(socket, "✅ Project structure created.");
      socket.emit("status", "✅ Project structure created.");
      socket.emit("done", "setup done");
  
      pushToGitHub(socket, appName);
      // const deployedUrl = await deployToRender(socket, appName);
  
      // socket.emit("deploymentComplete", { url: deployedUrl });
    } catch (err) {
      console.log("error", "Something serious happend, try again !!", err)
      await deleteFolder(appName)
      socket.emit("error", `Error writing files. please try again`)
      console.log("Regenerating project...");
    }
  });
});

const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
server.listen(PORT, () => { // Make sure the server listens, not just the app
  console.log('listening on *:5000');
});
