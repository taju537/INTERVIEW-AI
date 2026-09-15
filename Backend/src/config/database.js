const mongoose = require("mongoose")


const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

async function connenctToDB() {
    try {
         await mongoose.connect(process.env.MONGO_URI)
         console.log("connected to database");
         
    }
    catch (err) {
        console.log(err);
        
    }
  
}
module.exports =connenctToDB