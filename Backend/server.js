require("dotenv").config()
const app = require("./src/app");
const connenctToDB = require("./src/config/database");

connenctToDB();

app.listen(3000, () => {
  console.log("server is running on port no 3000");
});
