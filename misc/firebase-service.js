const admin = require('firebase-admin');
const serviceAccountPath = './app-gen-firebase-sdk.json'; // Replace with your path
const databaseURL = 'https://aipp-gen-default-rtdb.firebaseio.com/'; // Replace with your URL


class FirebaseService {
  constructor() {
    if (FirebaseService.instance) {
      return FirebaseService.instance;
    }

    this.serviceAccountPath = serviceAccountPath;
    this.databaseURL = databaseURL;
    this.initialized = false;
    this.initialize();
    FirebaseService.instance = this;
  }

  initialize() {
    try {
      const serviceAccount = require(this.serviceAccountPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: this.databaseURL,
      });
      this.db = admin.database();
      this.initialized = true;
      console.log('Firebase initialized successfully.');
    } catch (error) {
      console.error('Error initializing Firebase:', error);
    }
  }

  async updateAppStatus(appId, status) {
    if (!this.initialized) {
      console.error('Firebase is not initialized.');
      return false;
    }

    try {
      const appRef = this.db.ref(`app-${appId}`);
      await appRef.update({
        status: status,
      });
      console.log(`Status updated for app-${appId}`);
      return true;
    } catch (error) {
      console.error(`Error updating status for app-${appId}:`, error);
      return false;
    }
  }
}

module.exports = FirebaseService;