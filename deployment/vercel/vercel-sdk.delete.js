const { Vercel } = require('@vercel/sdk');

const vercel = new Vercel({
    bearerToken: "tq93O1cRe08H1RaTiJzyU92I",
  });

async function getTeamAndProjectIdFromDeployment(token, deploymentId) {
  try {
    const deployment = await vercel.deployments.getDeployment({
        idOrUrl: deploymentId,
        withGitRepoInfo: 'true',
      });

    if (!deployment) {
      throw new Error(`Deployment with ID ${deploymentId} not found.`);
    }

    const projectId = deployment.projectId;
    const project = await vercel.projects.getProject(projectId);

    if (!project) {
      throw new Error(`Project with ID ${projectId} not found.`);
    }

    const teamId = project.team.id;

    return { teamId, projectId };

  } catch (error) {
    console.error('Error getting team and project IDs:', error);
    if (error.response) {
      console.error(`Vercel API Error: ${error.response.status} - ${error.response.statusText}`);
      if (error.response.data) {
        console.error("Vercel Error Details:", error.response.data);
      }
    } else if (error.request) {
      console.error('No response received from Vercel API.');
    } else {
      console.error('Request setup error:', error.message);
    }
    throw error;
  }
}

async function deleteVercelProject(token, teamId, projectId) {
  try {
    const team = await vercel.teams.get(teamId);
    if (!team) {
      throw new Error(`Team with ID ${teamId} not found.`);
    }

    const project = await vercel.projects.getProject(projectId, teamId);
    if (!project) {
        throw new Error(`Project with ID ${projectId} not found in team ${teamId}`)
    }

    await vercel.projects.delete(projectId, teamId);
    console.log(`Project ${projectId} deleted successfully.`);

  } catch (error) {
    console.error('Error deleting project:', error);
    if (error.response) {
      console.error(`Vercel API Error: ${error.response.status} - ${error.response.statusText}`);
      if (error.response.data) {
        console.error("Vercel Error Details:", error.response.data);
      }
    } else if (error.request) {
      console.error('No response received from Vercel API.');
    } else {
      console.error('Request setup error:', error.message);
    }
    throw error;
  }
}

async function deleteVercelProjectFromDeployment(token, deploymentId) {
  try {
    const { teamId, projectId } = await getTeamAndProjectIdFromDeployment(token, deploymentId);
    await deleteVercelProject(token, teamId, projectId);
    console.log("Project deletion from deployment completed."); // More informative message
  } catch (error) {
    console.error("Error deleting project from deployment:", error);
    if (error.response) {
      console.error("Vercel API Error Details:", error.response.data);
    }
    throw error; // Re-throw for handling by the caller
  }
}

// Example usage:
const token = "tq93O1cRe08H1RaTiJzyU92I"; // **REPLACE WITH YOUR TOKEN**
const deploymentId = "dpl_GNp4tMHbLLKaRVqpGZzunQuBqsFT"; // **REPLACE WITH YOUR DEPLOYMENT ID**

deleteVercelProjectFromDeployment(token, deploymentId)
  .then(() => console.log("Project deletion process started."))
  .catch(error => {
    console.error("An error occurred:", error);
    // Add more specific error handling here if needed.
    if (error.response) {
      console.error("Vercel API Error Details:", error.response.data);
    }
  });