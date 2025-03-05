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

function getStatuses() {
  return projectStatuses;
}

module.exports = { addStatus, updateStatus, getStatuses };
