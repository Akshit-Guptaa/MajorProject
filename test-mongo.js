const mongoose = require('mongoose');
const uri = "mongodb+srv://theakshitguptaa_db_user:gMuNRKD4PXktyPty@cluster0.lscdgd5.mongodb.net/?appName=Cluster0";

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log("SUCCESS! Connected to MongoDB Atlas.");
    process.exit(0);
  })
  .catch(err => {
    console.error("FAILED! Connection error:", err);
    process.exit(1);
  });
