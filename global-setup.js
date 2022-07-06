module.exports = async () => {
  process.env.TZ = 'America/Sao_Paulo';
  process.env.DB_MONGO_URI = 'mongodb://127.0.0.1:27017/outWorld';
  process.env.GCLOUD_PROJECT_ID = 'project-example';
  process.env.GCLOUD_STORAGE_BUCKET = 'your-bucket-name';
  process.env.JWT_SECRET = 'anything here';
};
