const { Vercel } =  require('@vercel/sdk');
const logger = require('./logger');

const vercel = new Vercel({
    bearerToken: "tq93O1cRe08H1RaTiJzyU92I",
  });

const getDetails = async (deploymentId) => {
    const statusResponse = await vercel.deployments.getDeployment({
        idOrUrl: deploymentId,
        withGitRepoInfo: 'true',
      });

      console.log(statusResponse)

      return statusResponse;
}
 getDetails("dpl_EV4yQa3gTQ5pobTMebY4eeAang97");
