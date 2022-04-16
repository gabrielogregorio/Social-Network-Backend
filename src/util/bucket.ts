import path from 'path';
import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';

dotenv.config();

let storage;
try {
  storage = new Storage({
    projectId: process.env.GCLOUD_PROJECT_ID,
    keyFilename: path.join(__dirname, '../../google-credentials.json'),
  });
} catch (error) {}
export const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET);
