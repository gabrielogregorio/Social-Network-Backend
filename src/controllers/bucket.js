require('dotenv/config');
const path = require('path')
const {Storage} = require('@google-cloud/storage');

const storage = new Storage({
  projectId : process.env.GCLOUD_PROJECT_ID, 
  keyFilename : path.join(__dirname, '../../google-credentials.json')
}); 
const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET);

module.exports = {bucket}

