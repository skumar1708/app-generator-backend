const FirebaseService = require('./firebase-service');

const firebaseService = new FirebaseService();

async function exampleUsage() {
  const appId = '123456';
  const status = 'Creating project';

  const updateResult = await firebaseService.updateAppStatus(appId, status);
  if (updateResult) {
    console.log('Update was successful.');
  } else {
    console.log('Update failed.');
  }
}

exampleUsage();