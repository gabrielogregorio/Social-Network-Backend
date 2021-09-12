require('dotenv/config');
const path = require('path')
const {Storage} = require('@google-cloud/storage');
 

let storage;
try {
  storage = new Storage({
    projectId : process.env.GCLOUD_PROJECT_ID, 
    keyFilename : path.join(__dirname, '../../google-credentials.json')
  });   
} catch(error) {
  console.log('aaaaaaaaaaa')
  console.log(error)
}
const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET);

module.exports = {bucket}

