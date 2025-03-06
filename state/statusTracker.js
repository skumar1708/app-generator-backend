const projectStatuses = {};

function addStatus(appName, status) {
  projectStatuses[appName] = { status, startedAt: new Date() };
}

function updateStatus(appName, status, url) {
  if (projectStatuses[appName]) {
    projectStatuses[appName].status = status;

    if(url) {
      projectStatuses[appName].url = url;
    }
  }
}

function getStatuses(appName) {
  return projectStatuses[appName] || {};
}

function removeApp(appName){
  console.log("Before deleting", projectStatuses)
  delete projectStatuses[appName];
  console.log("After deleting", projectStatuses)
}

module.exports = { addStatus, updateStatus, getStatuses, removeApp };
