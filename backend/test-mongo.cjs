const mongoose = require('mongoose');
const uri = "mongodb+srv://XebiaProject:hashpassword@cluster0.8sabszt.mongodb.net/workforce?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log("SUCCESS");
    process.exit(0);
  })
  .catch(err => {
    console.error("FAIL", err.message);
    process.exit(1);
  });
